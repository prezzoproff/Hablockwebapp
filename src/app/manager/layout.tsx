import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth';
import Link from 'next/link';
import { ReactNode } from 'react';

export default async function ManagerLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;

    if (!token) redirect('/login');

    const user = verifyAccessToken(token);
    // Middleware already blocks these paths from residents, but we double-check for safety
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Optimized Sidebar specifically built for Manager/Admin actions */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 shrink-0 h-screen sticky top-0">
                <div className="p-6 border-b border-slate-100">
                    <div className="w-10 h-10 bg-green-900 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-xl text-white font-bold">H</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">Hablock Manager</h2>
                    <p className="text-sm text-slate-500 mt-1">{user.first_name} {user.last_name}</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <Link href="/manager/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-800 font-medium">
                        <span>📊</span> Dashboard
                    </Link>
                    <Link href="/manager/buildings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <span>🏢</span> Buildings
                    </Link>
                    <Link href="/manager/listings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <span>🏡</span> Listings
                    </Link>
                    <Link href="/manager/inquiries" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <span>✉️</span> Inquiries
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Dashboard Canvas Wrapper */}
            <main className="flex-1 w-full relative">
                <div className="md:hidden bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
                    <h2 className="font-bold text-slate-800">Hablock Manager</h2>
                    <button className="p-2 bg-slate-100 rounded">Menu</button>
                </div>
                <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
