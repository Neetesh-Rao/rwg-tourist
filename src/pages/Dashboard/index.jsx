import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, MapPin, Calendar, Award, ChevronRight, Zap, Star, Clock } from 'lucide-react';
import { useAppDispatch, useUser, useBookings } from '../../store';
import { loadMyBookings } from '../../store/slices/bookingSlice';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { BOOKING_STATUS } from '../../constants';
import { formatINR, formatDate } from '../../utils/helpers';

function BookingCard({ booking }) {
  const navigate = useNavigate();
  const cfg = BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending;
  return (
    <Card interactive onClick={() => navigate(`/bookings`)} className="!p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-display font-bold text-ink-900 dark:text-ink-100 text-base">{booking.city}</h3>
            <Badge variant={cfg.color === 'brand' ? 'brand' : cfg.color === 'success' ? 'green' : cfg.color === 'error' ? 'red' : cfg.color === 'warning' ? 'amber' : 'neutral'} dot={cfg.dot}>
              {cfg.label}
            </Badge>
          </div>
          <p className="text-xs text-ink-400">{formatDate(booking.date)} · {booking.startTime}–{booking.endTime}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-sm font-display flex-shrink-0">
          {booking.rider?.name?.charAt(0) || 'G'}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
        <span className="truncate">{booking.pickupAddress}</span>
      </div>
      {booking.estimatedPrice && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex justify-between items-center">
          <span className="text-xs text-ink-400">Est. total</span>
          <span className="text-sm font-mono font-bold text-ink-900 dark:text-ink-100">
            {formatINR(booking.estimatedPrice.estimatedMin)}–{formatINR(booking.estimatedPrice.estimatedMax)}
          </span>
        </div>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const user      = useUser();
  const bookings  = useBookings();

  useEffect(() => { dispatch(loadMyBookings()); }, [dispatch]);

  const upcoming  = bookings.filter(b => ['confirmed','pending'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed');

  const stats = [
    { val: bookings.length, label: 'Total trips', Icon: Compass, color: 'text-brand-500' },
    { val: new Set(bookings.map(b => b.city)).size, label: 'Cities explored', Icon: MapPin, color: 'text-blue-500' },
    { val: upcoming.length, label: 'Upcoming', Icon: Calendar, color: 'text-green-500' },
    { val: completed.length, label: 'Completed', Icon: Award, color: 'text-purple-500' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="text-sm text-ink-400 font-medium">{greeting} 👋</p>
              <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">{user?.name?.split(' ')[0]}</h1>
              <p className="text-xs text-ink-400 mt-0.5">
                Wallet: <span className="font-mono font-semibold text-brand-500">{formatINR(user?.walletBalance || 0)}</span>
              </p>
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate('/book')} icon={<Compass className="w-4 h-4" />}>
            Book a new tour
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(s => (
            <Card key={s.label} className="!p-5 animate-fade-up">
              <s.Icon className={`w-5 h-5 ${s.color} mb-3`} />
              <p className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">{s.val}</p>
              <p className="text-xs text-ink-400 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Book Tour', icon: <Compass className="w-5 h-5" />, to: '/book', color: 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800/40 hover:bg-brand-100 dark:hover:bg-brand-900/30' },
            { label: 'My Trips',  icon: <Calendar className="w-5 h-5" />, to: '/bookings', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40 hover:bg-blue-100' },
            { label: 'Wallet',    icon: <Zap className="w-5 h-5" />, to: '/wallet', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/40 hover:bg-green-100' },
            { label: 'Profile',   icon: <Star className="w-5 h-5" />, to: '/profile', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40 hover:bg-purple-100' },
          ].map(a => (
            <Link key={a.to} to={a.to}>
              <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${a.color}`}>
                {a.icon}
                <span className="text-sm font-semibold">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming bookings */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">Upcoming trips</h2>
            <Link to="/bookings" className="flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              emoji="🗺"
              title="No upcoming trips"
              description="Book your first guided city tour and start exploring India."
              action={<Button variant="primary" onClick={() => navigate('/book')}>Book a tour</Button>}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.slice(0, 4).map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          )}
        </div>

        {/* Promo banner */}
        <Card className="relative overflow-hidden !p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/8 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-500/6 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800/40 flex items-center justify-center text-brand-500 flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">Complete your travel profile</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Get personalised guide recommendations based on your interests and languages.</p>
            </div>
            <Button variant="primary" size="sm" className="flex-shrink-0" onClick={() => navigate('/profile')}>
              Complete profile
            </Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
