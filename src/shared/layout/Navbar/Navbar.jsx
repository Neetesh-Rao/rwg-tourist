import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, Bell, LogOut, Compass, Calendar, LayoutDashboard, Wallet } from 'lucide-react';
import { useAppDispatch, useAuth, useTheme } from '@/app/store/store';
import { logout } from '@/features/auth/model/authSlice';
import { toggleTheme } from '@/features/wallet/model/uiWalletSlice';
import Avatar from '@/shared/ui/Avatar/Avatar';
import Button from '@/shared/ui/Button/Button';
import logo from '@/shared/assets/logo.png';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/book', label: 'Book Tour', Icon: Compass },
  { to: '/bookings', label: 'My Trips', Icon: Calendar },
  { to: '/wallet', label: 'Wallet', Icon: Wallet },
];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(false);

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 16); window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn); }, []);
  useEffect(() => setMenu(false), [location.pathname]);

  const active = p => location.pathname === p || location.pathname.startsWith(p + '/');

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[var(--surface)]/90 backdrop-blur-2xl border-b border-[var(--border)] shadow-card' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <img src={logo} alt="Ride With Guide" className="h-12 max-w-[160px] object-contain" />
            </Link>

            {/* Desktop nav */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {LINKS.map(({ to, label, Icon }) => (
                  <Link key={to} to={to} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active(to) ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-surface-2 dark:hover:bg-surface-3'}`}>
                    <Icon className="w-4 h-4" />{label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right */}
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch(toggleTheme())} className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-500 dark:text-ink-400 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-ink-500 dark:text-ink-400 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all">
                    <Bell className="w-4.5 h-4.5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-[var(--bg)] animate-pulse-brand" />
                  </button>
                  <div className="relative hidden md:block">
                    <button onClick={() => setDrop(!drop)} className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-surface-2 dark:hover:bg-surface-3 transition-all">
                      <Avatar name={user?.name} size="sm" />
                      <span className="text-sm font-medium text-ink-800 dark:text-ink-200">{user?.name?.split(' ')[0]}</span>
                    </button>
                    {drop && (
                      <>
                        <div className="fixed inset-0" onClick={() => setDrop(false)} />
                        <div className="absolute right-0 top-full mt-2 w-52 card !p-2 animate-scale-in z-50">
                          <Link to="/profile" onClick={() => setDrop(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-surface-3 transition-all">
                            <Avatar name={user?.name} size="xs" />
                            <div className="min-w-0"><p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{user?.name}</p><p className="text-xs text-ink-400 truncate">{user?.email}</p></div>
                          </Link>
                          <div className="h-px bg-[var(--border)] my-1" />
                          <button onClick={() => { dispatch(logout()); navigate('/'); setDrop(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                            <LogOut className="w-4 h-4" />Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
                  <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
                </div>
              )}

              <button className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-ink-600 dark:text-ink-400 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all" onClick={() => setMenu(!menu)}>
                {menu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {menu && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-1 animate-slide-down">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2 dark:hover:bg-surface-3">
                  <Avatar name={user?.name} size="sm" />
                  <div><p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{user?.name}</p><p className="text-xs text-ink-400">{user?.email}</p></div>
                </Link>
                <div className="h-px bg-[var(--border)] my-1" />
                {LINKS.map(({ to, label, Icon }) => (
                  <Link key={to} to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active(to) ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-400'}`}>
                    <Icon className="w-4 h-4" />{label}
                  </Link>
                ))}
                <div className="h-px bg-[var(--border)] my-1" />
                <button onClick={() => { dispatch(logout()); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>Sign in</Button>
                <Button variant="primary" fullWidth onClick={() => navigate('/register')}>Get Started — Free</Button>
              </div>
            )}
          </div>
        )}
      </header>
      <div className="h-16" />
    </>
  );
}
