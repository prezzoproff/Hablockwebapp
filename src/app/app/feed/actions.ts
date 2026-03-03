'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken, encryptMessage, decryptMessage } from '@/lib/auth';

export async function submitChatMessage(content: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) throw new Error("Unauthorized");

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) throw new Error("Unauthorized");

    const encryptedContent = encryptMessage(content.trim());

    const post = await prisma.post.create({
        data: {
            building_id: user.building_id as string,
            author_id: user.id,
            content: encryptedContent,
        },
        include: {
            author: {
                select: { id: true, first_name: true, last_name: true, role: true, profile_photo: true, verified: true }
            }
        }
    });

    // We decrypt it to send it back safely mapped
    return {
        ...post,
        content: content.trim()
    };
}

// Unified Sync Endpoint for Notifications & Feed
export async function syncCommunityState(lastChecked: Date | string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) return { posts: [], alerts: [], newUsers: 0 };

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) return { posts: [], alerts: [], newUsers: 0 };

    const checkDate = new Date(lastChecked);

    // Get any new posts
    const newPostsRaw = await prisma.post.findMany({
        where: {
            building_id: user.building_id as string,
            created_at: { gt: checkDate }
        },
        include: {
            author: {
                select: { id: true, first_name: true, last_name: true, role: true, profile_photo: true, verified: true }
            }
        },
        orderBy: { created_at: 'asc' }
    });

    const newPosts = newPostsRaw.map(p => ({
        ...p,
        content: decryptMessage(p.content)
    }));

    // Get any new alerts
    const newAlerts = await prisma.alert.findMany({
        where: {
            building_id: user.building_id as string,
            created_at: { gt: checkDate }
        },
        include: { author: { select: { first_name: true, last_name: true, profile_photo: true } } }
    });

    // Get new users count trivially
    const newUsers = await prisma.user.count({
        where: {
            building_id: user.building_id as string,
            created_at: { gt: checkDate }
        }
    });

    return { posts: newPosts, alerts: newAlerts, newUsers };
}
