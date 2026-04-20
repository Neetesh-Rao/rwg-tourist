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
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { useAppDispatch, useBookings, useUser, useAuth, useWallet } from '@/app/store/store';
import { loadMyBookings } from '@/features/booking/model/bookingSlice';
import { updateProfile } from '@/features/auth/model/authSlice';
import { addMoney, loadWalletTxns, pushToast } from '@/features/wallet/model/uiWalletSlice';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import EmptyState from '@/shared/ui/EmptyState/EmptyState';
import Input2 from '@/shared/ui/Input/Input';
import Select2 from '@/shared/ui/Select/Select';
import Avatar from '@/shared/ui/Avatar/Avatar';
import Modal from '@/shared/ui/Modal/Modal';
import LiveTracker from '@/shared/map/LiveTracker/LiveTracker';
import {
  BOOKING_STATUS,
  LANGUAGES as LANGS,
  NATIONALITIES as NATS,
  PAYMENT_METHODS as PM,
} from '@/shared/config/constants';
import { formatINR, formatDate } from '@/shared/lib/helpers';

function BookingDetail({ booking, onTrack,onClick }) {
    const navigate = useNavigate();
  const cfg = BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending;
  const bvar = { brand: 'brand', green: 'green', red: 'red', amber: 'amber', neutral: 'neutral' }[cfg.color] || 'neutral';

  return (
    <Card className="!p-5 animate-fade-up" onClick={onClick} style={{cursor: 'pointer'}}>
      <div className="flex items-start justify-between gap-3 mb-4" >
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
          {/* {['confirmed', 'in_progress'].includes(booking.status) && (
            <Button variant="primary" size="sm" onClick={() => onTrack(booking)} icon={<Navigation2 className="w-3.5 h-3.5" />} disabled> 
              Track ride
            </Button>
          )} */}
        </div>
      )}
    </Card>
  );
}

function VerticalStepper({ booking, onClose }) {
  const navigate = useNavigate();
  const [showRiderDetails, setShowRiderDetails] = useState(false);
  
  let activeStep = 0;
  let isCancelled = booking.status === 'cancelled';
  if(isCancelled) activeStep = 1;
  else if(booking.status === 'pending') activeStep = 1;
  else if(['confirmed', 'in_progress'].includes(booking.status)) activeStep = 3;
  else if(booking.status === 'completed') activeStep = 4;

  const steps = [
    { 
      label: 'Booking & Payment',
      description: `Request placed for ${booking.city} on ${formatDate(booking.date)}. Paid ${formatINR(booking.estimatedPrice?.advanceAmount || 0)} advance.`,
    },
    {
      label: 'Admin Approval',
      description: isCancelled ? 'Your booking was cancelled.' : booking.status === 'pending' ? 'Verifying details and finding the best match...' : 'Booking approved by admin.',
      isError: isCancelled
    },
    {
      label: 'Guide Assignment',
      description: booking.rider ? `Assigned to ${booking.rider.name}.` : 'Matching you with a verified guide...',
    },
    {
      label: 'Ride Details',
      description: booking.status === 'completed' ? 'Your ride was successfully completed!' : (booking.status === 'confirmed' || booking.status === 'in_progress') ? 'Your guide is ready. View details below.' : 'Awaiting confirmation.',
      content: (booking.status === 'confirmed' || booking.status === 'in_progress') ? (
        <div className="space-y-3 mt-3 bg-surface-2 dark:bg-surface-3 p-4 rounded-2xl border border-[var(--border)] overflow-hidden relative">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex flex-shrink-0 items-center justify-center">
              <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Guide Assigned</p>
              <p className="text-xs text-ink-500 mt-0.5 w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">Say hi to {booking.rider?.name?.split(' ')[0] || 'your guide'}! Check details below.</p>
            </div>
          </div>

          <button 
            onClick={() => setShowRiderDetails(!showRiderDetails)}
            className="w-full flex items-center justify-between py-2.5 mt-1 border-y border-[var(--border)] text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors"
          >
            <span>{showRiderDetails ? 'Hide Guide Profile' : 'View Guide Profile'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showRiderDetails ? 'rotate-180' : ''}`} />
          </button>

          <div className={`transition-all duration-300 overflow-hidden ${showRiderDetails ? 'max-h-[700px] opacity-100 py-3' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-5">
              
              {/* Rich Contact Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/20 flex flex-shrink-0 items-center justify-center font-display text-xl font-bold text-brand-700 dark:text-brand-400">
                    {booking.rider?.name?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm flex items-center gap-1.5">
                      {booking.rider?.name || 'Assigned Guide'}
                      {booking.rider?.rating && <span className="text-[10px] font-bold text-brand-500 bg-brand-50 border border-brand-200 dark:bg-brand-900/40 dark:border-brand-800/50 px-1 py-0.5 rounded">★ {booking.rider.rating}</span>}
                    </p>
                    <p className="text-xs text-ink-500 font-mono mt-0.5 tracking-wide">{booking.rider?.phone || '+91 98765 43210'}</p>
                    <p className="text-[11px] text-ink-400 font-medium mt-1 uppercase tracking-wider">{booking.rider?.vehicleType || 'Vehicle'} • {booking.rider?.vehicleNumber || 'XXXX'}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex flex-shrink-0 items-center justify-center text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors border border-brand-200 dark:border-brand-800/40 shadow-sm" title="Message Guide">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex flex-shrink-0 items-center justify-center text-green-600 dark:text-green-400 hover:text-green-700 transition-colors border border-green-200 dark:border-green-800/40 shadow-sm" title="Call Guide">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-1">
                <p className="text-[#a1a1aa] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-2">About Guide</p>
                <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed font-medium">{booking.rider?.bio || 'A verified local expert ready to show you the best of the city.'}</p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-4 px-1">
                <div>
                  <p className="text-[#a1a1aa] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.rider?.languages?.map((l) => <Badge key={l} variant="neutral" size="xs">{l}</Badge>) || <span className="text-sm">English, Hindi</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[#a1a1aa] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.rider?.guideExpertise?.map((e) => <Badge key={e} variant="brand" size="xs">{e}</Badge>) || <span className="text-sm text-ink-500">-</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {booking.otp && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2.5 rounded-xl text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800/40">
              <Shield className="w-4 h-4 flex-shrink-0" /> <span className="font-medium">Pick-up OTP:</span> <span className="font-mono font-bold tracking-widest">{booking.otp}</span>
            </div>
          )}
          <Button variant="primary" fullWidth onClick={() => { onClose(); navigate('/tracking', { state: { booking } }); }} icon={<Navigation2 className="w-4 h-4"/>}>
            Track Ride
          </Button>
        </div>
      ) : null
    }
  ];

  return (
    <div className="px-1 py-1 sm:p-2 sm:px-3 text-left">
      {steps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isError = step.isError;
        
        return (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all duration-300 ${
                isCompleted ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                isActive && !isError ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 ring-4 ring-brand-100 dark:ring-brand-900/30' :
                isError ? 'bg-red-50 border-red-500 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                'bg-[var(--surface)] border-ink-300 text-ink-400 dark:border-[var(--border)] dark:text-ink-500'
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-full min-h-[32px] my-1 rounded transition-colors ${isCompleted ? 'bg-green-500' : 'bg-[var(--border-strong)]'}`} />
              )}
            </div>
            
            <div className="pb-7 w-full flex-1 pt-1.5">
              <h3 className={`font-semibold text-sm sm:text-base leading-none mb-1.5 ${isError ? 'text-red-600 dark:text-red-400' : isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : isCompleted ? 'text-ink-900 dark:text-ink-100' : 'text-ink-400 dark:text-ink-500'}`}>
                {step.label}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isActive && !isError ? 'text-ink-700 dark:text-ink-300' : 'text-ink-500'}`}>
                {step.description}
              </p>
              {step.content && (isActive || isCompleted) && (
                <div className="mt-3 animate-fade-in">{step.content}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}

export function BookingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const bookings = useBookings();
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
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
            {filtered.map((b) => <BookingDetail key={b.id} booking={b} onTrack={(trackBooking) => navigate('/tracking', { state: { booking: trackBooking } })} onClick={()=>setSelectedBooking(b)} />)}
          </div>
        )}
      </div>
      <Modal
  open={!!selectedBooking}
  onClose={() => setSelectedBooking(null)}
  title="Ride Progres"
  className='p-5'
>
  {selectedBooking && (
    <VerticalStepper booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
  )}
</Modal>
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
