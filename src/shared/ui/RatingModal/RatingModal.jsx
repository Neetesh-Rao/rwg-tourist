import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Clock, User, Car, CheckCircle2, Sparkles } from 'lucide-react';
import { useGetBookingsQuery, useRateRiderMutation } from '@/app/store/slices/bookingApi';
import Modal from '@/shared/ui/Modal/Modal';
import Avatar from '@/shared/ui/Avatar/Avatar';
import { useAuth } from '@/app/store/store';
import { formatDate, formatTime, formatINR } from '@/shared/lib/helpers';
import { toast } from 'react-hot-toast';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing!'];
const RATING_EMOJIS = ['', '😞', '😐', '🙂', '😄', '🤩'];

export default function RatingModal() {
  const { isAuthenticated } = useAuth();
  const { data: bookingsResponse } = useGetBookingsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 10000,
  });

  const [rateRider, { isLoading: isRating }] = useRateRiderMutation();
  const [showModal, setShowModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!bookingsResponse?.data) return;

    const bookings = bookingsResponse.data;
    const unreviewed = bookings.find(b =>
      (b.bookingStatus === 'completed' || b.status === 'completed') &&
      (!b.review || b.review?.isReviewed === false)
    );

    if (unreviewed && !showModal) {
      setPendingBooking(unreviewed);
      setShowModal(true);
    }
  }, [bookingsResponse]);

  const handleRate = async (rating) => {
    if (!pendingBooking || isRating) return;
    setSelectedStar(rating);
    try {
      await rateRider({
        bookingId: pendingBooking._id || pendingBooking.id,
        rating
      }).unwrap();
      setSubmitted(true);
      toast.success(`Rated ${rating} star${rating > 1 ? 's' : ''}! Thank you ⭐`);
      setTimeout(() => {
        setShowModal(false);
        setHoveredStar(0);
        setSelectedStar(0);
        setSubmitted(false);
        setPendingBooking(null);
      }, 1800);
    } catch (err) {
      toast.error('Failed to submit rating. Please try again.');
      setSelectedStar(0);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setHoveredStar(0);
    setSelectedStar(0);
    setSubmitted(false);
  };

  if (!isAuthenticated || !showModal || !pendingBooking) return null;

  const riderName = pendingBooking.rider?.name || pendingBooking.rider?.fullName || 'Your Guide';
  const riderPhoto = pendingBooking.rider?.profilePhoto || pendingBooking.rider?.photo;
  const activeStar = selectedStar || hoveredStar;

  return (
    <Modal
      open={showModal}
      onClose={handleClose}
      title=""
      size="md"
    >
      <div className="relative overflow-hidden">
        {/* Decorative top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-500/15 via-purple-500/10 to-blue-500/10 dark:from-brand-500/10 dark:via-purple-500/8 dark:to-blue-500/5 rounded-t-3xl pointer-events-none" />
        <div className="absolute top-6 right-6 text-6xl opacity-10 pointer-events-none select-none">⭐</div>

        {/* ─── SUCCESS STATE ─── */}
        {submitted ? (
          <div className="relative text-center py-10 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5 animate-bounce-once">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 mb-2">
              Thank you! {RATING_EMOJIS[selectedStar]}
            </h3>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Your {selectedStar}-star rating helps {riderName} grow as a guide.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* ─── HEADER: RIDE COMPLETED ─── */}
            <div className="text-center pt-2 pb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3 h-3" />
                Tour Completed
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink-900 dark:text-ink-100 mb-1">
                Rate your experience
              </h3>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                How was your tour with <span className="font-semibold text-ink-700 dark:text-ink-300">{riderName}</span>?
              </p>
            </div>

            {/* ─── RIDER INFO CARD ─── */}
            <div className="mx-1 mb-6 p-4 rounded-2xl bg-surface-2 dark:bg-surface-3 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={riderName} src={riderPhoto} size="lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-base text-ink-900 dark:text-ink-100 truncate">
                    {riderName}
                  </h4>
                  {pendingBooking.rider?.vehicleType && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Car className="w-3.5 h-3.5 text-ink-400" />
                      <span className="text-xs text-ink-500 dark:text-ink-400 capitalize">
                        {pendingBooking.rider.vehicleType}
                      </span>
                    </div>
                  )}
                  {pendingBooking.rider?.rating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-ink-500">{pendingBooking.rider.rating.toFixed(1)} avg</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40">
                  <User className="w-4 h-4 text-brand-500" />
                </div>
              </div>

              {/* ─── RIDE DETAILS GRID ─── */}
              <div className="grid grid-cols-2 gap-3">
                {/* City */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-0.5">City</p>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 leading-tight">{pendingBooking.city || 'N/A'}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-0.5">Date</p>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 leading-tight">{formatDate(pendingBooking.date) || 'N/A'}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-0.5">Time</p>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 leading-tight">
                      {pendingBooking.startTime || ''}{pendingBooking.endTime ? ` – ${pendingBooking.endTime}` : ''}
                    </p>
                  </div>
                </div>

                {/* Pickup */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-0.5">Pickup</p>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 leading-tight truncate max-w-[140px]">{pendingBooking.pickupAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* ─── Price if available ─── */}
              {(pendingBooking.finalPrice || pendingBooking.estimatedPrice) && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-ink-400 font-medium">
                    {pendingBooking.finalPrice ? 'Total Paid' : 'Est. Price'}
                  </span>
                  <span className="font-mono font-bold text-sm text-ink-900 dark:text-ink-100">
                    {pendingBooking.finalPrice
                      ? formatINR(pendingBooking.finalPrice)
                      : `${formatINR(pendingBooking.estimatedPrice?.estimatedMin)} – ${formatINR(pendingBooking.estimatedPrice?.estimatedMax)}`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* ─── STAR RATING ─── */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => handleRate(star)}
                    disabled={isRating}
                    className="group relative p-1 transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star
                      className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                        activeStar >= star
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                          : 'text-ink-200 dark:text-ink-700 group-hover:text-amber-300'
                      }`}
                    />
                    {/* Pulse ring on hover */}
                    {activeStar === star && (
                      <span className="absolute inset-0 rounded-full border-2 border-amber-400/40 animate-ping pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic label */}
              <div className="h-7 flex items-center justify-center">
                {activeStar > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-bold animate-fade-in">
                    {RATING_EMOJIS[activeStar]} {RATING_LABELS[activeStar]}
                  </span>
                ) : (
                  <span className="text-xs text-ink-400 font-medium">
                    Tap a star to rate your guide
                  </span>
                )}
              </div>
            </div>

            {/* ─── FOOTER NOTE ─── */}
            <div className="text-center pb-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-ink-300 dark:text-ink-600">
                Your review helps improve the experience for everyone
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
