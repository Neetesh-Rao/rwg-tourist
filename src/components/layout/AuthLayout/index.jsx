import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import ToastContainer from '../../common/Toast';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-ink-950">
        {/* Animated blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/8 blur-[120px] animate-pulse-brand pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-300/6 blur-3xl animate-float pointer-events-none" />

        {/* Grid */}
        <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />

        {/* Geometric lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-[0.07]" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59000" stopOpacity="0" />
                <stop offset="50%" stopColor="#F59000" stopOpacity="1" />
                <stop offset="100%" stopColor="#F59000" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="400" x2="600" y2="150" stroke="url(#lg1)" strokeWidth="0.6" />
            <line x1="0" y1="600" x2="600" y2="50"  stroke="url(#lg1)" strokeWidth="0.4" />
            <line x1="150" y1="0" x2="450" y2="800" stroke="url(#lg1)" strokeWidth="0.3" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-brand">
              <MapPin className="w-5 h-5 text-ink-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-white text-xl">Ride with Guide</span>
          </Link>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.3em] text-brand-400 uppercase font-semibold">
              Trusted by 2,000+ travellers
            </p>
            <h2 className="font-display text-3xl font-bold text-white leading-snug">
              Every city has<br />stories only locals know.
            </h2>
            <p className="text-ink-400 text-sm leading-relaxed max-w-sm">
              Pre-book verified local guides who know every hidden lane, untold story, and secret restaurant in your destination.
            </p>
          </div>

          {/* Guide avatars */}
          <div className="flex items-center gap-4">
            <div className="flex">
              {['Priya S.', 'Mehul V.', 'Anita M.'].map((name, i) => (
                <div
                  key={name}
                  className="w-10 h-10 rounded-full border-2 border-ink-950 bg-gradient-to-br from-brand-500/30 to-brand-700/20 flex items-center justify-center text-brand-300 text-xs font-bold"
                  style={{ marginLeft: i > 0 ? '-10px' : '0' }}
                >
                  {name[0]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <span key={i} className="text-brand-400 text-sm">★</span>)}
              </div>
              <p className="text-ink-500 text-xs mt-0.5">500+ verified guides across India</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[['500+','Guides'],['15+','Cities'],['4.9★','Rating']].map(([v,l]) => (
              <div key={l} className="glass rounded-2xl p-4">
                <p className="font-display text-xl font-bold text-gradient">{v}</p>
                <p className="text-ink-500 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-y-auto">
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-brand">
              <MapPin className="w-4.5 h-4.5 text-ink-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-ink-900 dark:text-ink-100 text-lg">Ride with Guide</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">{title}</h1>
            <p className="mt-2 text-ink-500 dark:text-ink-400 text-sm">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      <ToastContainer />
      <div className="noise" />
    </div>
  );
}
