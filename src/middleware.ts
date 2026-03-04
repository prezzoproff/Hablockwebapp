import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/listings', '/api/auth', '/api/upload'];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && payload.exp * 1000 < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public') ||
        pathname.startsWith('/uploads')
    ) {
        return NextResponse.next();
    }

    if (publicPaths.some((p) => pathname.startsWith(p)) || pathname === '/') {
        return NextResponse.next();
    }

    const token = request.cookies.get('hablock_access')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = decodeJwtPayload(token);

    if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/manager')) {
        if (payload.role !== 'manager' && payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/app/feed', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons).*)',
    ],
};
