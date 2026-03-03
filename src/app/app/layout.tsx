import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { ReactNode } from 'react';

const prisma = new PrismaClient();

// The layout component acts as an enforcement boundary wrapping the /app namespace natively.
export default async function AppLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;

    if (!token) redirect('/login');

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role === 'resident')) {
        redirect('/login');
    }

    // Fetch contextual building metadata for the resident
    let buildingName = 'Hablock Community';
    if (user.building_id) {
        const building = await prisma.building.findUnique({
            where: { id: user.building_id },
            select: { name: true }
        });
        if (building) buildingName = building.name;
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#2D3748] pb-24 lg:pb-0 lg:pl-64">
            {/* Desktop Sidebar / Mobile Hidden Nav */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col z-50">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-tight text-[#2D3748]">{buildingName}</h2>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <Link href="/app/feed" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Bulletin</span>
                    </Link>
                    <Link href="/app/directory" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Directory</span>
                    </Link>
                    <Link href="/app/alerts" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Alerts</span>
                    </Link>
                    <Link href="/app/explore" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Explore</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content Payload */}
            <main className="max-w-3xl mx-auto w-full">
                {children}
            </main>

            {/* Mobile Bottom Navigation Bar styled warmly */}
            <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 lg:hidden flex justify-around p-4 pb-safe z-50">
                <Link href="/app/feed" className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 text-green-700">
                        <span className="text-xl">🏠</span>
                    </div>
                </Link>
                <Link href="/app/directory" className="flex flex-col items-center text-slate-400">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-xl">👥</span>
                    </div>
                </Link>
                <Link href="/app/alerts" className="flex flex-col items-center text-slate-400">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-xl">🔔</span>
                    </div>
                </Link>
            </nav>
        </div>
    );
}
