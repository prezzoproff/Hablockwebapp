import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ManagerDashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    const user = verifyAccessToken(token!); // Guaranteed by middleware

    // Fetch only buildings mathematically tied to this manager
    const managedBuildings = await prisma.building.findMany({
        where: { manager_id: user!.id },
        select: { id: true, name: true }
    });

    const buildingIds = managedBuildings.map((b: any) => b.id);

    // Fallback defaults for dashboard insights
    const stats = {
        totalListings: 0,
        activeInquiries: 0,
        totalResidents: 0
    };

    if (buildingIds.length > 0) {
        const [listingCount, inquiryCount, residentCount] = await Promise.all([
            prisma.listing.count({ where: { building_id: { in: buildingIds } } }),
            prisma.inquiry.count({ where: { listing: { building_id: { in: buildingIds } } } }),
            prisma.user.count({ where: { building_id: { in: buildingIds }, role: 'resident' } })
        ]);

        stats.totalListings = listingCount;
        stats.activeInquiries = inquiryCount;
        stats.totalResidents = residentCount;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Welcome back. Here&apos;s what&apos;s happening across your properties today.
                </p>
            </div>

            {/* KPI Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
                    <h3 className="font-medium text-slate-500 mb-1">Active Listings</h3>
                    <p className="text-4xl font-bold text-slate-900">{stats.totalListings}</p>
                    <Link href="/manager/listings" className="mt-4 text-sm text-green-700 font-medium hover:underline">
                        Manage listings →
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
                    <h3 className="font-medium text-slate-500 mb-1">New Inquiries</h3>
                    <p className="text-4xl font-bold text-slate-900">{stats.activeInquiries}</p>
                    <Link href="/manager/inquiries" className="mt-4 text-sm text-green-700 font-medium hover:underline">
                        View messages →
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
                    <h3 className="font-medium text-slate-500 mb-1">Registered Residents</h3>
                    <p className="text-4xl font-bold text-slate-900">{stats.totalResidents}</p>
                    <Link href="/manager/buildings" className="mt-4 text-sm text-green-700 font-medium hover:underline">
                        View directory →
                    </Link>
                </div>
            </div>

            {/* Manager Building Assignments Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Your Portfolio</h3>
                    <Link href="/manager/buildings/new" className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm font-medium hover:bg-green-900 transition-colors">
                        + Claim Building
                    </Link>
                </div>
                <div className="p-0">
                    {managedBuildings.length === 0 ? (
                        <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">🏢</span>
                            </div>
                            <h4 className="text-lg font-medium text-slate-800">No properties claimed yet</h4>
                            <p className="text-slate-500 max-w-sm mt-1 mb-6">Start by registering or claiming an existing building to activate features like the marketplace and feed.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100 border-t border-slate-100">
                            {managedBuildings.map((b: any) => (
                                <li key={b.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group cursor-pointer">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{b.name}</h4>
                                        <p className="text-sm text-slate-500">ID: {b.id}</p>
                                    </div>
                                    <span className="text-slate-400 group-hover:text-green-700 transition-colors">Manage →</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
