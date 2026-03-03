import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hablock_access')?.value;

  // If the user lands on the marketing page but already has an established session
  if (token) {
    const user = verifyAccessToken(token);
    if (user) {
      if (user.role === 'manager' || user.role === 'admin') {
        redirect('/manager/dashboard');
      } else {
        redirect('/app/feed');
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D3748] flex flex-col">
      <header className="px-6 py-6 border-b border-slate-200 bg-white shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2F5233] rounded-xl flex items-center justify-center">
            <span className="text-xl text-white font-bold">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Hablock</span>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="/listings" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden md:block">
            Marketplace
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#2F5233] hover:text-green-800 transition-colors">
            Sign In
          </Link>
          <Link href="/login" className="bg-[#2F5233] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-900 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block px-4 py-1.5 bg-green-50 text-green-700 text-sm font-semibold rounded-full mb-6 border border-green-100">
          The Modern Building OS
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl leading-tight mb-6">
          Your building&apos;s digital <span className="text-[#2F5233]">community layer.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          The all-in-one platform connecting verified residents, streamlining property management, and publishing direct-to-market listings seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link href="/login" className="bg-[#2F5233] text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-green-900/20 hover:bg-green-900 hover:-translate-y-0.5 transition-all text-lg">
            Join your building
          </Link>
          <Link href="/listings" className="bg-white text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-lg">
            Explore homes
          </Link>
        </div>

        {/* Feature Grid Presentation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6">👋</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Verified Community</h3>
            <p className="text-slate-500 leading-relaxed">Connect with actual neighbors in a private, secure environment isolated strictly to verified residents.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-2xl mb-6">🔔</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Instant Alerts</h3>
            <p className="text-slate-500 leading-relaxed">Receive priority maintenance updates and building-wide notifications directly from your property manager.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center text-2xl mb-6">🏡</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">SEO Marketplace</h3>
            <p className="text-slate-500 leading-relaxed">Property managers can instantly publish vacant units directly to our global, SEO-optimized public marketplace.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-500 border-t border-slate-200 mt-auto bg-white text-sm">
        <p>© {new Date().getFullYear()} Hablock. All rights reserved.</p>
      </footer>
    </div>
  );
}
