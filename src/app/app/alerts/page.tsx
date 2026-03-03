import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) redirect('/login');

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) redirect('/login');

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const alerts = await prisma.alert.findMany({
        where: {
            building_id: user.building_id as string,
            created_at: { gte: fortyEightHoursAgo }
        },
        include: {
            author: { select: { first_name: true, last_name: true, role: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 30
    });

    return (
        <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pb-32 lg:pb-12 h-[100dvh] overflow-y-auto bg-[#FDFCFB]">
            <header className="mb-10">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2D3748] mb-1">
                    Building Alerts
                </h1>
                <p className="text-[#718096] text-lg">Important notifications from management.</p>
            </header>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <article key={alert.id} className={`bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border-l-4 ${alert.priority > 1 ? 'border-l-amber-500' : 'border-l-green-600'} border-y border-y-slate-100 border-r border-r-slate-100`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold text-sm tracking-wide uppercase ${alert.priority > 1 ? 'text-amber-700' : 'text-green-800'}`}>
                                {alert.type}
                            </span>
                            <time className="text-xs text-slate-500 font-medium">
                                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </time>
                        </div>
                        <p className="text-[#2D3748] font-medium leading-relaxed mb-4 text-[15px]">
                            {alert.content}
                        </p>
                        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">👤</div>
                            <span>
                                Posted by {alert.author.first_name} {alert.author.last_name}
                                {alert.author.role === 'manager' && <span className="text-green-700 ml-1.5 bg-green-50 px-1.5 py-0.5 rounded-md">(Manager)</span>}
                            </span>
                        </div>
                    </article>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-16 px-6 bg-white/50 rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                            <span className="text-2xl">🔔</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-1">No active alerts</h3>
                        <p className="text-slate-500 text-sm">Everything is quiet and running smoothly.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
