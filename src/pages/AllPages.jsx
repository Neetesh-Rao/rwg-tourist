import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Shield,
  Navigation2,
  Compass,
  Check,
  Star,
  User,
  Mail,
  Phone,
  Globe,
  Plus as PlusIcon,
  TrendingUp,
  TrendingDown,
  Wallet as WIcon,
} from 'lucide-react';
import { useAppDispatch, useBookings, useUser, useAuth, useWallet } from '../store';
import { loadMyBookings } from '../store/slices/bookingSlice';
import { updateProfile } from '../store/slices/authSlice';
import { addMoney, loadWalletTxns, pushToast } from '../store/slices/uiWalletSlice';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Input2 from '../components/common/Input';
import Select2 from '../components/common/Select';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import LiveTracker from '../components/map/LiveTracker';
import {
  BOOKING_STATUS,
  LANGUAGES as LANGS,
  NATIONALITIES as NATS,
  PAYMENT_METHODS as PM,
} from '../constants';
import { formatINR, formatDate } from '../utils/helpers';

function BookingDetail({ booking, onTrack }) {
  const cfg = BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending;
  const bvar = { brand: 'brand', green: 'green', red: 'red', amber: 'amber', neutral: 'neutral' }[cfg.color] || 'neutral';

  return (
    <Card className="!p-5 animate-fade-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">{booking.city}</h3>
            <Badge variant={bvar} dot={cfg.dot}>{cfg.label}</Badge>
          </div>
          <p className="text-xs text-ink-400">{formatDate(booking.date)} � {booking.startTime}-{booking.endTime}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center font-display font-bold text-brand-700 dark:text-brand-400 flex-shrink-0">
          {booking.rider?.name?.charAt(0) || 'G'}
        </div>
      </div>

      <div className="space-y-1.5 mb-4 text-xs text-ink-500">
        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" /><span className="truncate">{booking.pickupAddress}</span></div>
        {booking.stops?.length > 0 && <div className="flex items-center gap-2"><Compass className="w-3.5 h-3.5 text-brand-400" /><span>{booking.stops.length} stops planned</span></div>}
        {booking.rider && <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-brand-400" /><span>{booking.rider.name} � {booking.rider.vehicleType}</span></div>}
        {booking.otp && booking.status === 'confirmed' && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 border border-green-200 dark:border-green-800/40">
            <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span className="font-mono font-bold text-green-700 dark:text-green-400 text-sm">Ride OTP: {booking.otp}</span>
          </div>
        )}
      </div>

      {booking.estimatedPrice && (
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-ink-400">Est. total: <span className="font-mono font-bold text-ink-800 dark:text-ink-200">{formatINR(booking.estimatedPrice.estimatedMin)}-{formatINR(booking.estimatedPrice.estimatedMax)}</span></span>
          {['confirmed', 'in_progress'].includes(booking.status) && (
            <Button variant="primary" size="sm" onClick={() => onTrack(booking)} icon={<Navigation2 className="w-3.5 h-3.5" />}>
              Track ride
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export function BookingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const bookings = useBookings();
  const [filter, setFilter] = useState('all');
  const [success, setSuccess] = useState(location.search.includes('success=true'));

  useEffect(() => {
    dispatch(loadMyBookings());
  }, [dispatch]);

  const filtered = bookings.filter((b) => {
    if (filter === 'upcoming') return ['confirmed', 'pending'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">History</div>
            <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">My trips</h1>
            <p className="text-ink-400 mt-1">{bookings.length} bookings total</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/book')} icon={<Compass className="w-4 h-4" />}>Book new</Button>
        </div>

        {success && (
          <div className="mb-5 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 flex items-center gap-3 animate-fade-in">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Booking confirmed!</p>
              <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">Your guide will be notified and must accept within 2 hours.</p>
            </div>
            <button onClick={() => setSuccess(false)} className="ml-auto text-green-400 hover:text-green-600 text-sm">x</button>
          </div>
        )}

        <div className="flex gap-1 p-1 bg-surface-2 dark:bg-surface-3 rounded-2xl w-fit mb-6">
          {['all', 'upcoming', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-[var(--surface)] text-ink-900 dark:text-ink-100 shadow-sm' : 'text-ink-400 hover:text-ink-600 dark:hover:text-ink-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            emoji="??"
            title="No bookings found"
            description="Start your guided journey today."
            action={<Button variant="primary" onClick={() => navigate('/book')}>Book a tour</Button>}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((b) => <BookingDetail key={b.id} booking={b} onTrack={(trackBooking) => navigate('/tracking', { state: { booking: trackBooking } })} />)}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export function TrackingPage() {
  const loc = useLocation();
  const booking = loc.state?.booking;
  const navigate = useNavigate();

  if (!booking) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <EmptyState
            emoji="??"
            title="No active ride"
            description="Start a booking to track your ride."
            action={<Button variant="primary" onClick={() => navigate('/book')}>Book a tour</Button>}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Live tracking</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Your guide is on the way</h1>
        </div>
        <LiveTracker booking={booking} height="380px" />
      </div>
    </PageWrapper>
  );
}

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useUser();
  const { isLoading } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    nationality: user?.nationality || 'Indian',
    preferredLanguage: user?.preferredLanguage || 'English',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave(e) {
    e.preventDefault();
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      dispatch(pushToast({ type: 'success', title: 'Profile updated!', message: 'Your changes have been saved.' }));
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Account</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Your profile</h1>
        </div>

        <Card className="!p-6 mb-6 text-center">
          <Avatar name={user?.name} size="2xl" className="mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">{user?.name}</h2>
          <p className="text-sm text-ink-400 mt-1">{user?.email}</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <span className="text-ink-500">{user?.totalTrips || 0} trips</span>
            <span className="w-1 h-1 rounded-full bg-ink-300" />
            <span className="text-brand-500 font-mono font-semibold">?{(user?.walletBalance || 0).toLocaleString('en-IN')} wallet</span>
          </div>
        </Card>

        <Card className="!p-6">
          <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100 mb-5">Edit details</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input2 label="Full name" placeholder="Your name" value={form.name} onChange={(e) => set('name', e.target.value)} leftIcon={<User className="w-4 h-4" />} />
            <div className="grid grid-cols-2 gap-3">
              <Select2 label="Nationality" options={NATS.map((n) => ({ value: n, label: n }))} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
              <Select2 label="Preferred language" options={LANGS.map((l) => ({ value: l, label: l }))} value={form.preferredLanguage} onChange={(e) => set('preferredLanguage', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell guides about yourself, your travel style, interests..."
                className="input-field resize-none leading-relaxed"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} icon={<Check className="w-4 h-4" />}>
              Save changes
            </Button>
          </form>
        </Card>

        <Card className="!p-6 mt-4">
          <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100 mb-4">Account info</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Email', user?.email, <Mail className="w-4 h-4" />],
              ['Phone', user?.phone, <Phone className="w-4 h-4" />],
              ['Gender', user?.gender, <Globe className="w-4 h-4" />],
              ['Member since', new Date(user?.joinedAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), <User className="w-4 h-4" />],
            ].map(([k, v, ic]) => (
              <div key={k} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-ink-400 flex-shrink-0">{ic}</span>
                <span className="text-ink-500 w-28 flex-shrink-0">{k}</span>
                <span className="text-ink-900 dark:text-ink-100 font-medium capitalize">{v || '-'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}

export function WalletPage() {
  const dispatch = useAppDispatch();
  const user = useUser();
  const { transactions, isLoading } = useWallet();
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');

  useEffect(() => {
    dispatch(loadWalletTxns());
  }, [dispatch]);

  async function handleAdd() {
    const amt = Number(amount);
    if (!amt || amt < 10) return;
    const result = await dispatch(addMoney({ amount: amt, method }));
    if (addMoney.fulfilled.match(result)) {
      setShowAdd(false);
      setAmount('');
      dispatch(pushToast({ type: 'success', title: `?${amt.toLocaleString('en-IN')} added!`, message: 'Your wallet has been credited.' }));
    }
  }

  const balance = user?.walletBalance || 0;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Payments</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">RwG Wallet</h1>
        </div>

        <div className="wallet-bg rounded-3xl p-7 mb-6 relative overflow-hidden shadow-float">
          <div className="relative z-10">
            <p className="text-white/50 text-sm font-medium mb-1">Available balance</p>
            <p className="font-display text-5xl font-bold text-white mb-1">{formatINR(balance)}</p>
            <p className="text-white/40 text-xs">{user?.name} � RwG Tourist</p>
          </div>
          <div className="relative z-10 flex gap-3 mt-6">
            <Button variant="white" size="sm" onClick={() => setShowAdd(true)} icon={<PlusIcon className="w-4 h-4" />}>Add money</Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {[100, 200, 500, 1000, 2000].map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(String(a)); setShowAdd(true); }}
              className="flex-shrink-0 px-4 py-2 rounded-xl border border-[var(--border-md)] text-sm font-semibold text-ink-700 dark:text-ink-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
            >
              +{formatINR(a)}
            </button>
          ))}
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-display font-bold text-ink-900 dark:text-ink-100">Transactions</h3>
            <span className="text-xs text-ink-400">{transactions.length} total</span>
          </div>
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-ink-400 text-sm">No transactions yet</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-4">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${t.type === 'credit' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    {t.type === 'credit' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{t.description}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{formatDate(t.createdAt)}</p>
                  </div>
                  <span className={`text-sm font-mono font-bold flex-shrink-0 ${t.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatINR(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add money to wallet" className='p-5'>
        <div className="space-y-4 p-5">
          <Input2
            label="Amount (?)"
            type="number"
            placeholder="Enter amount"
            min="10"
            max="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<WIcon className="w-4 h-4" />}
          />
          <div className="flex gap-2 flex-wrap">
            {[100, 200, 500, 1000].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${amount === String(a) ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' : 'border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-[var(--border-strong)]'}`}
              >
                ?{a.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          <Select2 label="Payment method" options={PM.map((m) => ({ value: m.id, label: `${m.icon} ${m.label}` }))} value={method} onChange={(e) => setMethod(e.target.value)} />
          <Button variant="primary" fullWidth size="lg" loading={isLoading} onClick={handleAdd} disabled={!amount || Number(amount) < 10}>
            Add {amount ? formatINR(Number(amount)) : 'money'}
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
