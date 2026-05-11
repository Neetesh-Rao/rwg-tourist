import React, { useState, useEffect } from 'react';
import { Star, Award } from 'lucide-react';
import { useGetBookingsQuery, useRateRiderMutation } from '@/app/store/slices/bookingApi';
import Modal from '@/shared/ui/Modal/Modal';
import { useAuth } from '@/app/store/store';

export default function RatingModal() {
  const { isAuthenticated } = useAuth();
  const { data: bookingsResponse } = useGetBookingsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 15000, // Poll every 15s to catch completions
  });

  const [rateRider, { isLoading: isRating }] = useRateRiderMutation();
  const [showModal, setShowModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (!bookingsResponse?.data) return;

    const bookings = bookingsResponse.data;
    const unreviewed = bookings.find(b =>
      (b.bookingStatus === 'completed' || b.status === 'completed') &&
      (!b.review || !b.review.isReviewed)
    );

    if (unreviewed && !showModal) {
      setPendingBooking(unreviewed);
      setShowModal(true);
    }
  }, [bookingsResponse]);

  const handleRate = async (rating) => {
    if (!pendingBooking || isRating) return;
    try {
      await rateRider({
        bookingId: pendingBooking._id || pendingBooking.id,
        rating
      }).unwrap();
      setShowModal(false);
      setHoveredStar(0);
      setPendingBooking(null);
    } catch (err) {
      console.error('Rating failed:', err);
    }
  };

  if (!isAuthenticated || !showModal) return null;

  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      title="Rate your journey"
      size="sm"
    >
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto mb-6">
          <Award className="w-10 h-10" />
        </div>
        <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100 mb-2">
          How was your tour?
        </h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-8 px-4">
          Your feedback helps us maintain the best quality of local guides in {pendingBooking?.city}.
        </p>

        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => handleRate(star)}
              disabled={isRating}
              className="group relative p-1 transition-transform active:scale-95"
            >
              <Star
                className={`w-10 h-10 transition-all duration-200 ${
                  hoveredStar >= star
                    ? 'text-brand-500 fill-brand-500 scale-110'
                    : 'text-ink-200 dark:text-ink-700'
                } group-hover:drop-shadow-brand`}
              />
            </button>
          ))}
        </div>

        <p className="text-[10px] uppercase font-black tracking-widest text-ink-400">
          Tap a star to rate instantly
        </p>
      </div>
    </Modal>
  );
}
