import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    if (!token) redirect('/login');

    const user = verifyAccessToken(token);
    if (!user || (!user.building_id && user.role !== 'admin')) redirect('/login');

    // Fetch posts strictly isolated to the user's community
    const posts = await prisma.post.findMany({
        where: {
            building_id: user.building_id as string,
        },
        include: {
            author: {
                select: { first_name: true, last_name: true, role: true, profile_photo: true, verified: true }
            }
        },
        orderBy: { created_at: 'desc' },
        take: 20
    });

    return (
        <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pb-32 lg:pb-12">
            <header className="mb-10">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2D3748] mb-1">
                    Good evening, {user.first_name}
                </h1>
                <p className="text-[#718096] text-lg">Here's the latest from your building.</p>
            </header>

            {/* Composer Input Area Stub */}
            <div className="mb-10 bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-100/50">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                    <input
                        type="text"
                        placeholder="Share something with your neighbors..."
                        className="w-full bg-transparent border-none focus:outline-none text-[#2D3748] placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="space-y-6">
                {posts.map((post) => (
                    <article
                        key={post.id}
                        className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 transition-transform active:scale-[0.98] duration-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {post.author.profile_photo ? (
                                    <img src={post.author.profile_photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <span className="text-lg">👤</span>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-[#2D3748]">
                                            {post.author.first_name} {post.author.last_name}
                                        </span>
                                        {post.author.verified && (
                                            <span className="text-blue-500 text-sm">✓</span>
                                        )}
                                        {(post.author.role === 'manager' || post.author.role === 'admin') && (
                                            <span className="bg-[#2F5233]/10 text-[#2F5233] text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                                                Manager
                                            </span>
                                        )}
                                    </div>
                                    <time className="text-sm text-[#718096]">
                                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(post.created_at)}
                                    </time>
                                </div>
                            </div>
                        </div>

                        <p className="text-[#2D3748] leading-relaxed whitespace-pre-line">
                            {post.content}
                        </p>
                    </article>
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-16 px-6 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">👋</span>
                        </div>
                        <h3 className="text-lg font-medium text-[#2D3748] mb-1">No posts yet</h3>
                        <p className="text-[#718096]">Be the first to say hello to the neighborhood.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
