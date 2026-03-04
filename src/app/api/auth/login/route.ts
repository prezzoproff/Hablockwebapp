import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json({ error: 'Please enter your email and password.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password_hash !== password) {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        const payload = {
            id: user.id,
            role: user.role,
            building_id: user.building_id,
            unit_id: user.unit_id,
            first_name: user.first_name,
            last_name: user.last_name || undefined,
            profile_photo: user.profile_photo || undefined
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken({ id: user.id });

        const isSecureContext = process.env.NODE_ENV === 'production' && !process.env.REPL_ID;

        const redirectTo = (user.role === 'manager' || user.role === 'admin')
            ? '/manager/dashboard'
            : '/app/feed';

        const response = NextResponse.json({ redirectTo });

        response.cookies.set('hablock_access', accessToken, {
            httpOnly: true,
            secure: isSecureContext,
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/',
        });

        response.cookies.set('hablock_refresh', refreshToken, {
            httpOnly: true,
            secure: isSecureContext,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
