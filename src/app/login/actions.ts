'use server';

import { prisma } from '@/lib/prisma';
import { setCookieSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Please enter your email and password.' };
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user || user.password_hash !== password) {
        return { error: 'Invalid email or password.' };
    }

    await setCookieSession({
        id: user.id,
        role: user.role,
        building_id: user.building_id,
        unit_id: user.unit_id,
        first_name: user.first_name,
        last_name: user.last_name || undefined
    });

    if (user.role === 'manager' || user.role === 'admin') {
        redirect('/manager/dashboard');
    } else {
        redirect('/app/feed');
    }
}
