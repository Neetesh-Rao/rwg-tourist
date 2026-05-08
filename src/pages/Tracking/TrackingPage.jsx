import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import EmptyState from '@/shared/ui/EmptyState/EmptyState';
import Button from '@/shared/ui/Button/Button';
import LiveTracker from '@/shared/map/LiveTracker/LiveTracker';

export default function TrackingPage() {
  const loc = useLocation();
  const booking = loc.state?.booking;
  const navigate = useNavigate();

  if (!booking) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <EmptyState
            emoji="📍"
            title="No active ride"
            description="Start a booking to track your ride."
            action={<Button variant="primary" onClick={() => navigate('/book')}>Book a tour</Button>}
          />
        </div>
      </PageWrapper>
    );
  }

  const isOngoing = booking.status === 'ongoing' || booking.bookingStatus === 'ongoing';

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Live tracking</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">
            {isOngoing ? 'Tour in progress' : 'Your guide is on the way'}
          </h1>
        </div>
        <LiveTracker booking={booking} height="450px" />
      </div>
    </PageWrapper>
  );
}
