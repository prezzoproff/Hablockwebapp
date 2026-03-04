import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AlertClient from './AlertClient';

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) redirect('/login');

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) redirect('/login');

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const alerts = await prisma.alert.findMany({
        where: {
            building_id: user.building_id as string,
            created_at: { gte: fortyEightHoursAgo }
        },
        include: {
            author: { select: { first_name: true, last_name: true, role: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 30
    });

    return <AlertClient initialAlerts={alerts} currentUser={user} />;
}
