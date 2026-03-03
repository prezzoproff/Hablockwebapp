import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

// Paths that don't explicitly require authentication at all
const publicPaths = ['/login', '/register', '/listings', '/api/auth'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Static assets and Next.js internal calls can bypass middleware safely
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public')
    ) {
        return NextResponse.next();
    }

    // Is it a completely public area? (Public Marketplace SSR allows unauthenticated reads)
    if (publicPaths.some((p) => pathname.startsWith(p)) || pathname === '/') {
        // If a user tries to access /login but they are already logged in, we could redirect them
        // to their destination based on their role here for QOL.
        return NextResponse.next();
    }

    // Retrieve access token
    const token = request.cookies.get('hablock_access')?.value;

    if (!token) {
        // Not authenticated -> redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
        // Token is invalid/expired -> redirect to login
        // In a fully featured NextJS architecture, the client might be pinging a refresh endpoint seamlessly.
        // For middleware boundary we reject if access cookie has expired natively.
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based protection: Manager Dashboard boundaries
    if (pathname.startsWith('/manager')) {
        if (payload.role !== 'manager' && payload.role !== 'admin') {
            // Forbidden: redirect back to safe zone or unauthorized page
            return NextResponse.redirect(new URL('/app/feed', request.url));
        }
    }

    // General App protection for Residents
    if (pathname.startsWith('/app')) {
        // Both residents and managers can access strictly isolated app layer
        // The application itself enforces user.building_id == data.building_id.
        // Here we ensure they simply exist.
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons).*)',
    ],
};
