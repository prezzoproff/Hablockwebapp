'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken, setCookieSession } from '@/lib/auth';

export async function updateProfile(data: { first_name: string; last_name: string; phone_number: string }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) throw new Error("Unauthorized");

    const sessionUser = verifyAccessToken(token);
    if (!sessionUser) throw new Error("Unauthorized");

    const updated = await prisma.user.update({
        where: { id: sessionUser.id },
        data: {
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            phone_number: data.phone_number.trim()
        }
    });

    // Refresh the JWT session payload with the new details immediately
    await setCookieSession({
        id: updated.id,
        role: updated.role,
        building_id: updated.building_id,
        unit_id: updated.unit_id,
        first_name: updated.first_name,
        last_name: updated.last_name || undefined,
        profile_photo: updated.profile_photo || undefined
    });

    return updated;
}
