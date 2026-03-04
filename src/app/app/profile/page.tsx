import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) redirect('/login');

    const sessionUser = verifyAccessToken(token);
    if (!sessionUser) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id }
    });

    if (!user) redirect('/login');

    return <ProfileClient user={user} />;
}
