import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function ManagerBuildingsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    const user = verifyAccessToken(token!);

    const buildings = await prisma.building.findMany({
        where: { manager_id: user!.id },
        include: {
            _count: {
                select: { units: true, residents: true, listings: true }
            }
        },
        orderBy: { created_at: 'desc' }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Buildings</h1>
                    <p className="text-slate-500 mt-1">Manage your active properties and communities.</p>
                </div>
                <Link
                    href="/manager/buildings/new"
                    className="bg-green-800 hover:bg-green-900 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                >
                    Add Building
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {buildings.map(building => (
                    <div key={building.id} className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{building.name}</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {building.building_code} • {building.area}, {building.country.toUpperCase()}
                                </p>
                            </div>
                            {building.verified && (
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                    ✓ Verified
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 mt-2">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Units</p>
                                <p className="text-xl font-medium text-slate-800">{building._count.units}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Residents</p>
                                <p className="text-xl font-medium text-slate-800">{building._count.residents}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Listings</p>
                                <p className="text-xl font-medium text-slate-800">{building._count.listings}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {buildings.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <span className="text-4xl mb-4 block">🏢</span>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No buildings managed</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                            You are not currently managing any properties in the system.
                        </p>
                        <Link
                            href="/manager/buildings/new"
                            className="inline-block bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-xl font-medium transition-colors shadow-sm"
                        >
                            Register your first building
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
