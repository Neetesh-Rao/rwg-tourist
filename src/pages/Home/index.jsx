import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Shield, Globe, Calendar, Star, ArrowRight, ChevronRight, Compass } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { CITIES, MOCK_RIDERS } from '../../constants';
import { formatINR } from '../../utils/helpers';

const FEATURES = [
  { icon: <Shield className="w-6 h-6" />, title: 'Verified & trusted', desc: 'Every guide passes government document verification and background checks before joining our network.' },
  { icon: <Calendar className="w-6 h-6" />, title: 'Pre-schedule your tour', desc: 'Browse real-time guide availability and lock your preferred slot days in advance — no last-minute stress.' },
  { icon: <Globe className="w-6 h-6" />, title: 'Language support', desc: 'Guides who speak your language. Real-time translation so the experience is seamless.' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Live map pickup', desc: 'Drop your exact GPS pin — your guide navigates directly to you, no confusion.' },
];

const STATS = [
  { val: '500+', label: 'Verified guides' },
  { val: '15+',  label: 'Indian cities' },
  { val: '4.9★', label: 'Average rating' },
  { val: '2K+',  label: 'Happy tourists' },
];

const HOW = [
  { n: '01', t: 'Register',     d: 'Quick sign-up with your travel preferences. Takes under 2 minutes.' },
  { n: '02', t: 'Pick a city',  d: 'Choose your destination, date, and browse available verified guides.' },
  { n: '03', t: 'Book a guide', d: 'Select your guide, add your stops, and pay a small 30% advance.' },
  { n: '04', t: 'Explore!',     d: 'Your guide meets you at your pinned location. Adventure begins.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <PageWrapper hideNav={false}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-500/6 blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/50 text-brand-700 dark:text-brand-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live in {CITIES.length}+ cities across India
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-[68px] font-bold text-ink-900 dark:text-ink-100 leading-[1.04] tracking-tight">
              Explore cities<br />with guides<br />
              <span className="text-gradient">you can trust.</span>
            </h1>

            <p className="text-lg text-ink-500 dark:text-ink-400 leading-relaxed max-w-lg">
              Pre-book verified local riders who know every hidden lane, untold story, and secret spot. Not just a taxi — a genuine cultural companion.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="xl" onClick={() => navigate('/register')}
                iconRight={<ArrowRight className="w-5 h-5" />}>
                Start your journey
              </Button>
              <Button variant="secondary" size="xl" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-2">
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-gradient">{s.val}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — City explorer card */}
          <div className="hidden lg:block relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-brand-500/10 to-transparent rounded-[40px] blur-2xl" />
            <div className="relative card !p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-ink-400">Explore destinations</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CITIES.slice(0, 6).map(city => (
                  <button
                    key={city.id}
                    onClick={() => setActiveCity(city)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                      activeCity.id === city.id
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-[var(--border)] hover:border-[var(--border-md)] hover:bg-surface-2 dark:hover:bg-surface-3'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 mb-1.5 ${activeCity.id === city.id ? 'text-brand-500' : 'text-ink-400'}`} />
                    <p className={`text-sm font-semibold ${activeCity.id === city.id ? 'text-ink-900 dark:text-ink-100' : 'text-ink-600 dark:text-ink-400'}`}>{city.name}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">{city.tagline}</p>
                  </button>
                ))}
              </div>

              <div className="border-t border-[var(--border)] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-500">Guides available in {activeCity.name}</p>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">3 online now</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-gradient">{formatINR(activeCity.base)}</span>
                  <span className="text-ink-400 text-sm">base fare</span>
                </div>
                <Button variant="primary" fullWidth size="lg" onClick={() => navigate('/register')}>
                  Book in {activeCity.name}
                </Button>
              </div>
            </div>

            {/* Floating guide card */}
            <div className="absolute -bottom-6 -left-6 card !p-4 flex items-center gap-3 shadow-float animate-float max-w-[220px]">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">P</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">Priya Sharma</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-brand-500 fill-brand-500" />
                  <span className="text-xs font-mono text-ink-500">4.9 · 312 trips</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-4">Why choose us</p>
          <h2 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100">
            Built for travellers,<br />not just tourists.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <Card key={f.title} hover className={`animate-fade-up delay-${(i + 1) * 100}`}>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40 flex items-center justify-center text-brand-500 mb-4">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100 mb-2">{f.title}</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/3 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-4">Process</p>
            <h2 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100">
              Book in minutes.<br />Explore in hours.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW.map((s, i) => (
              <div key={s.n} className="relative">
                {i < HOW.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-gradient-to-r from-brand-300/40 to-transparent z-0" />
                )}
                <div className="relative z-10 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="font-mono text-4xl font-bold text-brand-200 dark:text-brand-900 mb-3 select-none">{s.n}</div>
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100 mb-2">{s.t}</h3>
                  <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP GUIDES ────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Our guides</p>
            <h2 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Meet verified experts</h2>
          </div>
          <Button variant="ghost" iconRight={<ChevronRight className="w-4 h-4" />} onClick={() => navigate('/register')}>
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MOCK_RIDERS.map((rider, i) => (
            <Card key={rider.id} hover className={`animate-fade-up delay-${(i + 1) * 100}`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center text-2xl font-bold text-brand-700 dark:text-brand-400 font-display flex-shrink-0">
                  {rider.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-100">{rider.name}</h3>
                    {rider.isOnline && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Online
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= Math.round(rider.rating) ? 'text-brand-500 fill-brand-500' : 'text-ink-200'}`} />)}
                    <span className="text-xs text-ink-500 ml-1">{rider.rating} ({rider.totalRides})</span>
                  </div>
                  <p className="text-xs text-ink-500 mt-2 line-clamp-2">{rider.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {rider.guideExpertise.map(ex => (
                      <span key={ex} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 dark:bg-surface-3 text-ink-600 dark:text-ink-400 border border-[var(--border)] font-medium">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-sm text-ink-500">From <span className="font-mono font-bold text-ink-900 dark:text-ink-100">₹{rider.pricePerHour}/hr</span></span>
                <Button variant="outline" size="sm" onClick={() => navigate('/register')}>Book</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="relative card !p-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/6 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-500/8 blur-3xl pointer-events-none" />
          <div className="relative">
            <Compass className="w-12 h-12 text-brand-500 mx-auto mb-6 animate-float" />
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 dark:text-ink-100 mb-4">
              Your next unforgettable<br />journey starts here.
            </h2>
            <p className="text-ink-500 dark:text-ink-400 mb-8 text-lg">
              Join thousands of travellers exploring India the right way.
            </p>
            <Button variant="primary" size="xl" onClick={() => navigate('/register')} iconRight={<ArrowRight className="w-5 h-5" />}>
              Get started — it's free
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-gradient rounded-xl flex items-center justify-center shadow-brand">
              <MapPin className="w-4 h-4 text-ink-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-ink-900 dark:text-ink-100 text-sm">Ride with Guide</span>
          </Link>
          <p className="text-xs text-ink-400">© 2025 Ride with Guide. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-ink-400">
            <a href="#" className="hover:text-brand-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </PageWrapper>
  );
}
