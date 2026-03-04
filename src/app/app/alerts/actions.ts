'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

export async function createAlert(content: string, type: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) throw new Error("Unauthorized");

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) throw new Error("Unauthorized");

    let priority = 1;
    if (type === 'MAINTENANCE' || type === 'URGENT') priority = 2;
    if (type === 'EMERGENCY') priority = 3;

    const alert = await prisma.alert.create({
        data: {
            building_id: user.building_id as string,
            author_id: user.id,
            content: content.trim(),
            type: type.toUpperCase(),
            priority
        },
        include: {
            author: {
                select: { id: true, first_name: true, last_name: true, role: true, profile_photo: true }
            }
        }
    });

    return alert;
}
