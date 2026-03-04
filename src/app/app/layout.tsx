import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ReactNode } from 'react';
import { LogoutButton } from './LogoutButton';

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
                    <Link href="/app/alerts" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Alerts</span>
                    </Link>
                    <Link href="/app/residents" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Directory</span>
                    </Link>
                    <Link href="/app/profile" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Profile Settings</span>
                    </Link>
                    <Link href="/listings" className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-700">Explore Homes</span>
                    </Link>
                </nav>

                {/* Logout Button pinned to bottom of sidebar */}
                <div className="p-4 border-t border-slate-100">
                    <LogoutButton variant="sidebar" />
                </div>
            </aside>

            {/* Main Content Payload */}
            <main className="max-w-3xl mx-auto w-full relative pb-20 lg:pb-0">
                {/* Mobile Top Header containing Profile / Logout */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
                    <Link href="/app/profile" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden text-center shrink-0">
                            {user.profile_photo ? <img src={user.profile_photo.startsWith('/uploads') ? `/api/avatar/${user.profile_photo.split('/').pop()}` : user.profile_photo} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] items-center flex justify-center h-full">👤</span>}
                        </div>
                        <span className="font-bold text-sm text-slate-800">{user.first_name}</span>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <Link href="/listings" className="text-xs font-bold text-green-700 uppercase tracking-wider">Explore</Link>
                        <LogoutButton variant="icon" />
                    </div>
                </header>

                {children}

                {/* Toast Notification Container natively injecting into layout */}
                <div id="hablock-toast-container" className="fixed top-4 left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-4" />
            </main>

            {/* Mobile Bottom Navigation Bar styled warmly */}
            <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 lg:hidden flex justify-around p-4 pb-safe z-50 shadow-[0_-4px_20px_rgb(0,0,0,0.02)]">
                <Link href="/app/feed" className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                        <span className="text-xl">🏠</span>
                    </div>
                </Link>
                <Link href="/app/alerts" className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                        <span className="text-xl">🔔</span>
                    </div>
                </Link>
                <Link href="/app/residents" className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                        <span className="text-xl">👥</span>
                    </div>
                </Link>
            </nav>
        </div>
    );
}
