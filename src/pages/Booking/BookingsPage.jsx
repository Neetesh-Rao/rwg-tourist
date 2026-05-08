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
  Info,
  Plus as PlusIcon,
  ChevronDown,
  MessageCircle,
  Phone
} from 'lucide-react';
import { useAppDispatch, useBookings } from '@/app/store/store';
import { loadMyBookings, setBookings } from '@/app/store/slices/bookingSlice';
import { pushToast } from '@/app/store/slices/uiWalletSlice';
import { useGetBookingsQuery } from '@/app/store/slices/bookingApi';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import EmptyState from '@/shared/ui/EmptyState/EmptyState';
import Modal from '@/shared/ui/Modal/Modal';
import { BOOKING_STATUS } from '@/shared/config/constants';
import { formatINR, formatDate } from '@/shared/lib/helpers';
import { normalizeBooking } from '@/shared/lib/bookingHelpers';

function BookingDetail({ booking, onTrack, onClick }) {
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  const cfg = BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending;
  const bvar = { brand: 'brand', green: 'green', red: 'red', amber: 'amber', neutral: 'neutral' }[cfg.color] || 'neutral';

  return (
    <>
      <Card className="!p-5 animate-fade-up" onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className="flex items-start justify-between gap-3 mb-4" >
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">{booking.city}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={bvar} dot={cfg.dot}>{cfg.label}</Badge>
                {booking.otp && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800/40">
                    OTP: {booking.otp}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-ink-400">{formatDate(booking.date)} · {booking.startTime}-{booking.endTime}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center font-display font-bold text-brand-700 dark:text-brand-400 flex-shrink-0">
            {booking.rider?.name?.charAt(0) || 'G'}
          </div>
        </div>

        <div className="space-y-1.5 mb-4 text-xs text-ink-500">
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" /><span className="truncate">{booking.pickupAddress}</span></div>
          {booking.stops?.length > 0 && <div className="flex items-center gap-2"><Compass className="w-3.5 h-3.5 text-brand-400" /><span>{booking.stops.length} stops planned</span></div>}
          {booking.rider && <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-brand-400" /><span>{booking.rider.name} · {booking.rider.vehicleType}</span></div>}
          {booking.otp && booking.status === 'confirmed' && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 border border-green-200 dark:border-green-800/40">
              <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="font-mono font-bold text-green-700 dark:text-green-400 text-sm">Ride OTP: {booking.otp}</span>
            </div>
          )}
        </div>

        {booking.estimatedPrice && (
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2 mb-3">
            <span className="text-xs text-ink-400">Est. total: <span className="font-mono font-bold text-ink-800 dark:text-ink-200">{formatINR(booking.estimatedPrice.estimatedMin)}-{formatINR(booking.estimatedPrice.estimatedMax)}</span></span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowPricingDetails(true); }}
              className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              title="View pricing breakdown"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        )}

        {['assigned', 'confirmed', 'ongoing', 'pending', 'searching'].includes(booking.status) && (
          <div className="flex items-center gap-2 w-full pt-1">
            <Button 
              className="flex-1" 
              variant="primary" 
              size="sm" 
              disabled={['pending', 'searching'].includes(booking.status)}
              onClick={(e) => { e.stopPropagation(); onTrack(booking); }} 
              icon={<Navigation2 className="w-3.5 h-3.5"/>}
            >
              Track Ride
            </Button>
            <Button 
              className="flex-1 !border-red-200 !text-red-500 hover:!bg-red-50 dark:!border-red-800/40 dark:!text-red-400 dark:hover:!bg-red-900/20 transition-colors" 
              variant="secondary" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); /* Cancel logic placeholder */ }} 
            >
              Cancel Ride
            </Button>
          </div>
        )}
      </Card>

      {showPricingDetails && (
        <Modal isOpen={showPricingDetails} onClose={() => setShowPricingDetails(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
              <Info className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-lg font-display font-bold text-ink-900 dark:text-ink-100">Pricing Breakdown</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-2 dark:bg-surface-3 p-3 rounded-lg">
                  <p className="text-xs text-ink-400 mb-1">Base Fare</p>
                  <p className="font-mono font-bold text-ink-900 dark:text-ink-100">{formatINR(booking.estimatedPrice?.baseFare || 0)}</p>
                </div>
                <div className="bg-surface-2 dark:bg-surface-3 p-3 rounded-lg">
                  <p className="text-xs text-ink-400 mb-1">Distance Cost</p>
                  <p className="font-mono font-bold text-ink-900 dark:text-ink-100">{formatINR(booking.estimatedPrice?.distanceCost || 0)}</p>
                </div>
                <div className="bg-surface-2 dark:bg-surface-3 p-3 rounded-lg">
                  <p className="text-xs text-ink-400 mb-1">Time Charge</p>
                  <p className="font-mono font-bold text-ink-900 dark:text-ink-100">{formatINR(booking.estimatedPrice?.timeCharge || 0)}</p>
                </div>
                <div className="bg-surface-2 dark:bg-surface-3 p-3 rounded-lg">
                  <p className="text-xs text-ink-400 mb-1">Guide Service Fee</p>
                  <p className="font-mono font-bold text-ink-900 dark:text-ink-100">{formatINR(booking.estimatedPrice?.guideServiceFee || 0)}</p>
                </div>
              </div>

              <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Demand Multiplier</span>
                  <span className="font-mono font-bold text-brand-700 dark:text-brand-400">x{booking.estimatedPrice?.demandMultiplier || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Advance Amount</span>
                  <span className="font-mono font-bold text-brand-700 dark:text-brand-400">{formatINR(booking.estimatedPrice?.advanceAmount || 0)}</span>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink-900 dark:text-ink-100">Estimated Total</span>
                  <span className="font-mono font-bold text-lg text-brand-600 dark:text-brand-400">{formatINR(booking.estimatedPrice.estimatedMin)}-{formatINR(booking.estimatedPrice.estimatedMax)}</span>
                </div>
              </div>

              {booking.payment && (
                <div className="bg-surface-2 dark:bg-surface-3 p-3 rounded-lg mt-4">
                  <p className="text-xs text-ink-400 mb-2">Payment Status</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-600 dark:text-ink-400">Method: <span className="font-semibold text-ink-900 dark:text-ink-100">{booking.payment.method || 'Not specified'}</span></span>
                    <Badge variant={booking.payment.status === 'paid' ? 'green' : 'amber'}>
                      {booking.payment.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-500 mt-2">Amount Paid: <span className="font-mono font-bold">{formatINR(booking.payment.amountPaid || 0)}</span></p>
                </div>
              )}
            </div>

            <Button variant="primary" fullWidth onClick={() => setShowPricingDetails(false)} className="mt-4">
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function VerticalStepper({ booking, onClose }) {
  const navigate = useNavigate();
  const [showRiderDetails, setShowRiderDetails] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  
  let activeStep = 0;
  let isCancelled = booking.status === 'cancelled';

  if (isCancelled) {
    activeStep = 1;
  } else if (booking.status === 'completed') {
    activeStep = 4;
  } else if (booking.status === 'ongoing' || booking.status === 'assigned') {
    activeStep = 3;
  } else if (booking.status === 'searching') {
    activeStep = 2;
  } else if (booking.status === 'pending') {
    activeStep = 1;
  }

  const steps = [
    { 
      label: 'Booking & Payment',
      description: `Request placed for ${booking.city} on ${formatDate(booking.date)}. Paid ${formatINR(booking.estimatedPrice?.advanceAmount || 0)} advance.`,
    },
    {
      label: 'Admin Approval',
      description: isCancelled ? 'Your booking was cancelled.' : (booking.status === 'pending') ? 'Verifying details and getting things ready...' : 'Booking approved by admin.',
      isError: isCancelled
    },
    {
      label: 'Guide Assignment',
      description: booking.rider ? `Assigned to ${booking.rider.name}.` : (booking.status === 'searching') ? 'Matching you with a verified guide...' : 'Awaiting assignment.',
    },
    {
      label: 'Ride Details',
      description: booking.status === 'completed' ? 'Your ride was successfully completed!' : (booking.status === 'assigned' || booking.status === 'ongoing') ? 'Your guide is ready. View details below.' : 'Ride details will appear here soon.',
      content: (booking.status === 'assigned' || booking.status === 'ongoing') ? (
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/20 flex flex-shrink-0 items-center justify-center font-display text-xl font-bold text-brand-700 dark:text-brand-400 border border-[var(--border)] cursor-zoom-in active:scale-95 transition-transform"
                    onClick={() => booking.rider?.profileImage && setViewImage(booking.rider.profileImage)}
                  >
                    {booking.rider?.profileImage ? (
                      <img src={booking.rider.profileImage} alt={booking.rider.name} className="w-full h-full object-cover" />
                    ) : (
                      booking.rider?.name?.charAt(0) || 'G'
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm flex items-center gap-1.5">
                      {booking.rider?.name || 'Assigned Guide'}
                      {booking.rider?.rating && <span className="text-[10px] font-bold text-brand-500 bg-brand-50 border border-brand-200 dark:bg-brand-900/40 dark:border-brand-800/50 px-1 py-0.5 rounded">★ {booking.rider.rating}</span>}
                    </p>
                    <p className="text-xs text-ink-500 font-mono mt-0.5 tracking-wide">{booking.rider?.phone || '+91 98765 43210'}</p>
                    <p className="text-[11px] text-ink-400 font-medium mt-1 uppercase tracking-wider">
                      {booking.rider?.vehicleModel ? `${booking.rider.vehicleModel} (${booking.rider.vehicleType})` : booking.rider?.vehicleType || 'Vehicle'} • {booking.rider?.vehicleNumber || 'XXXX'}
                    </p>
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
      
      <Modal
        open={!!viewImage}
        onClose={() => setViewImage(null)}
        title="View Image"
        className="!p-0 overflow-hidden bg-black/90"
      >
        <div className="relative w-full aspect-square sm:aspect-auto sm:h-[80vh] flex items-center justify-center p-2">
          <img 
            src={viewImage} 
            alt="Enlarged view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <button 
            onClick={() => setViewImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <PlusIcon className="w-6 h-6 rotate-45" />
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const bookings = useBookings();
  const { data: bookingsResponse, isLoading, isError } = useGetBookingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [success, setSuccess] = useState(location.search.includes('success=true'));

  useEffect(() => {
    const apiBookings = bookingsResponse?.data || bookingsResponse?.bookings || bookingsResponse;
    if (Array.isArray(apiBookings)) {
      dispatch(setBookings(apiBookings.map(normalizeBooking)));
      return;
    }
    if (!isLoading && !isError) {
      dispatch(loadMyBookings());
    }
  }, [bookingsResponse, isLoading, isError, dispatch]);

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

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="!p-5 animate-pulse">
                <div className="h-5 w-32 rounded bg-surface-2 dark:bg-surface-3 mb-3" />
                <div className="h-4 w-48 rounded bg-surface-2 dark:bg-surface-3 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-surface-2 dark:bg-surface-3" />
                  <div className="h-3 w-4/5 rounded bg-surface-2 dark:bg-surface-3" />
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            emoji="??"
            title="Could not load bookings"
            description="We could not fetch your trips from the server right now."
            action={<Button variant="primary" onClick={() => navigate('/book')}>Book a tour</Button>}
          />
        ) : filtered.length === 0 ? (
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
        title="Ride Progress"
        className='p-5'
      >
        {selectedBooking && (
          <VerticalStepper booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
        )}
      </Modal>
    </PageWrapper>
  );
}
