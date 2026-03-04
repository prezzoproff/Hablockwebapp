'use server';

import { removeCookieSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function logoutUser() {
    await removeCookieSession();
    redirect('/login');
}
