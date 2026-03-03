import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken, decryptMessage } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FeedClient from './FeedClient';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) redirect('/login');

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) redirect('/login');

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Fetch posts strictly isolated to the user's community
    const rawPosts = await prisma.post.findMany({
        where: {
            building_id: user.building_id as string,
            OR: [
                { persistent: true },
                { created_at: { gte: fortyEightHoursAgo } }
            ]
        },
        include: {
            author: {
                select: { id: true, first_name: true, last_name: true, role: true, profile_photo: true, verified: true }
            }
        },
        orderBy: { created_at: 'asc' },
        take: 50
    });

    const initialPosts = rawPosts.map(p => ({
        ...p,
        content: decryptMessage(p.content)
    }));

    return <FeedClient initialPosts={initialPosts} currentUser={user} />;
}
