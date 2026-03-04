import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-800 font-sans overflow-x-hidden selection:bg-amber-200">

      {/* 1️⃣ Navigation Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Hablock</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <Link href="#community" className="hover:text-amber-700 transition-colors">Why Hablock?</Link>
            <Link href="/listings" className="hover:text-amber-700 transition-colors">Explore Homes</Link>
            <Link href="#managers" className="hover:text-amber-700 transition-colors">For Managers</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-amber-700 transition-colors">Log In</Link>
            <Link href="/register" className="bg-amber-600 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
              Join Your Building
            </Link>
          </div>
        </div>
      </nav>

      {/* 2️⃣ Hero Section — Belonging First */}
      <header className="relative pt-32 lg:pt-48 pb-20 lg:pb-32 px-6 overflow-hidden">
        {/* Soft Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-100/40 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-green-50/60 rounded-full blur-[100px] -z-10 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="mb-6 inline-block px-4 py-1.5 bg-amber-50 border border-amber-100/60 rounded-full">
              <span className="text-amber-800 text-xs font-bold uppercase tracking-wider">Your Building, Connected.</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6">
              Feel at home.<br />
              <span className="text-amber-600">Together.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium md:max-w-xl">
              Hablock is the private digital lobby for your apartment building. Connect with neighbors, get verified building alerts, and rediscover the warmth of a real community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-amber-600 text-white text-base font-bold px-8 py-4 rounded-full text-center hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all hover:-translate-y-1">
                Find My Building
              </Link>
              <Link href="#managers" className="bg-white text-slate-700 border border-slate-200 text-base font-bold px-8 py-4 rounded-full text-center hover:border-amber-600 hover:text-amber-700 transition-colors shadow-sm">
                Register a Property
              </Link>
            </div>
          </div>

          {/* Hero Imagery */}
          <div className="relative z-10 lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 transform rotate-1 hover:rotate-0 transition-transform duration-700 border-8 border-white bg-white">
            <img src="/images/hero.png" alt="A warm African apartment setting" className="w-full h-full object-cover object-center" />

            {/* Floating Mock Notification */}
            <div className="absolute bottom-8 left-[-20px] md:left-8 bg-white/95 backdrop-blur-md p-4 pr-6 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex justify-center items-center text-xl shrink-0">👩🏾‍🦱</div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-0.5">Resident Feed</p>
                <p className="text-sm font-semibold text-slate-800">"Hey everyone, just moved into 4B! 👋"</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3️⃣ The Problem Module (Emotional friction) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-amber-50">Apartment living shouldn't feel anonymous.</h2>
          <p className="text-xl text-slate-400 leading-relaxed mx-auto">
            We share walls, elevators, and lobbies—but rarely say a word. It’s time to break the silence and turn strangers into neighbors in a safe, verified space.
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('/images/lobby.png')] opacity-10 blur-sm mix-blend-overlay bg-cover bg-center"></div>
      </section>

      {/* 4️⃣ How Hablock Builds Community */}
      <section id="community" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 font-serif-style">The Digital Building Lobby</h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">Everything you need to feel deeply connected, entirely private, and perfectly secure within your walls.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border text-center border-slate-100 p-10 rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-inner shadow-amber-900/5">
              <span className="text-3xl">☕</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">The Resident Feed</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Introduce yourself, organize game nights, or ask to borrow a drill. It operates just like a private social network.</p>
          </div>
          <div className="bg-white border text-center border-slate-100 p-10 rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-16 h-16 bg-green-50 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-inner shadow-green-900/5">
              <span className="text-3xl">🚨</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Secure Alerts</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Instant structural notifications. Real-time updates on water maintenance, found packages, and security protocols instantly.</p>
          </div>
          <div className="bg-white border text-center border-slate-100 p-10 rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-inner shadow-blue-900/5">
              <span className="text-3xl">🤝</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Verified Directory</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Know exactly who lives here. A strictly verified directory matching faces to unit numbers to build absolute trust.</p>
          </div>
        </div>
      </section>

      {/* 5️⃣ Real Stories / Emotional Preview */}
      <section className="py-24 bg-amber-50/50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white lg:h-[600px]">
            <img src="/images/lobby.png" alt="Community gathering" className="w-full h-full object-cover object-center" />

            {/* Mock UI Component overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-100">
              <div className="flex gap-4 items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center">👨🏿‍🦱</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Kwame O.</p>
                  <p className="text-xs text-amber-700 font-semibold mb-2">Unit 12C</p>
                  <p className="text-sm text-slate-600 leading-relaxed">We're hosting a small welcome mixer in the courtyard this Saturday at 4 PM. Drinks and light snacks provided. Everyone is welcome to drop by! ☀️</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs font-semibold text-slate-400 pl-14">
                <span className="bg-slate-100 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-200">❤️ 4</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-200">👏 2</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">A lively, interactive community.</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
              When communities talk, buildings thrive. Hablock gives everyone a voice while strictly isolating conversations to verified residents. It’s a safe, encouraging environment to share, request, and celebrate.
            </p>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-slate-800 font-semibold"><div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">✓</div> Encrypted Private Feed</li>
              <li className="flex items-center gap-4 text-slate-800 font-semibold"><div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">✓</div> Expiring 48-Hour Alerts</li>
              <li className="flex items-center gap-4 text-slate-800 font-semibold"><div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">✓</div> Push Notification Support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6️⃣ Housing Transition - Explore */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">Looking to move into a community?</h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">Explore verified vacant listings from connected buildings. Trust the architecture before you ever step inside.</p>
        <Link href="/listings" className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-4 rounded-full hover:bg-slate-800 transition-colors shadow-lg">
          Explore Market Vacancies
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </Link>
      </section>

      {/* 7️⃣ Property Manager Section */}
      <section id="managers" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">Manage Your Building the Modern Way.</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Automate manual communications. Broadcast emergency maintenance alerts directly to residents' phones and review vacant listings dynamically over the public portal.
            </p>
            <Link href="/register?role=manager" className="bg-amber-600 text-white font-bold px-8 py-4 rounded-full inline-block hover:bg-amber-700 shadow-md transition-colors">
              Register as a Property Manager
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col justify-center gap-2">
              <span className="text-3xl mb-2">📱</span>
              <h4 className="font-bold text-slate-900">Mass Broadcast</h4>
              <p className="text-sm text-slate-500 font-medium">Send priority notifications to everyone instantly.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col justify-center gap-2 mt-8">
              <span className="text-3xl mb-2">🔐</span>
              <h4 className="font-bold text-slate-900">Access Control</h4>
              <p className="text-sm text-slate-500 font-medium">Auto-verify units keeping strangers outside.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8️⃣ Final CTA */}
      <section className="py-24 bg-gradient-to-br from-amber-600 to-amber-700 text-center px-6">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">Bring your building together.</h2>
        <p className="text-xl text-amber-100 font-medium mb-10 max-w-2xl mx-auto">Create an account for yourself or claim your entire building infrastructure in seconds.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-white text-amber-700 font-bold px-8 py-4 rounded-full hover:bg-amber-50 shadow-xl transition-colors">
            Join as a Resident
          </Link>
          <Link href="/login" className="bg-amber-800/40 text-white font-bold px-8 py-4 rounded-full border border-amber-600 hover:bg-amber-800/60 transition-colors">
            Log in to your Building
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-center text-slate-500 py-12 px-6 font-medium text-sm">
        <p>© {new Date().getFullYear()} Hablock. All rights reserved. Built with ❤️ for thriving communities.</p>
      </footer>
    </div>
  );
}
