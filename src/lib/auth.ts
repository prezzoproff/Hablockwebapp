import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'fallback-refresh-key-change-in-prod';

export interface UserSessionPayload {
    id: string;
    role: string;
    building_id?: string | null;
    unit_id?: string | null;
    first_name: string;
    last_name?: string;
}

export function generateAccessToken(payload: UserSessionPayload) {
    // 15-minute expiration as requested
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: { id: string }) {
    // Refresh token valid for 7 days
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export async function setCookieSession(user: UserSessionPayload) {
    const cookieStore = await cookies();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken({ id: user.id });

    // HTTP-Only cookies for improved security against XSS
    cookieStore.set('hablock_access', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
    });

    cookieStore.set('hablock_refresh', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    });
}

export async function removeCookieSession() {
    const cookieStore = await cookies();
    cookieStore.delete('hablock_access');
    cookieStore.delete('hablock_refresh');
}

export function verifyAccessToken(token: string): UserSessionPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
    } catch (error) {
        return null;
    }
}

export function verifyRefreshToken(token: string): { id: string } | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as { id: string };
    } catch (error) {
        return null;
    }
}
