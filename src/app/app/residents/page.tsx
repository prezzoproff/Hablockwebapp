import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ResidentsDirectoryPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) redirect('/login');

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) redirect('/login');

    const residents = await prisma.user.findMany({
        where: { building_id: user.building_id as string },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_photo: true,
            unit: { select: { unit_label: true } },
            role: true
        },
        orderBy: { first_name: 'asc' }
    });

    return (
        <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pb-32 lg:pb-12 h-screen overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2D3748] mb-1">
                    Residents
                </h1>
                <p className="text-[#718096] text-lg">Meet your neighbors in the building.</p>
            </header>

            <ul className="space-y-4">
                {residents.map((resident) => (
                    <li key={resident.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {resident.profile_photo ? (
                                <img src={resident.profile_photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl">👤</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                                {resident.first_name} {resident.last_name}
                                {resident.role === 'manager' && <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-wide">Manager</span>}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {resident.unit?.unit_label ? `Unit ${resident.unit.unit_label}` : 'No Unit Assigned'}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
