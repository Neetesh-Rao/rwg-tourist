import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetBookingsQuery, useTriggerSOSMutation } from '@/app/store/slices/bookingApi';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import EmptyState from '@/shared/ui/EmptyState/EmptyState';
import Button from '@/shared/ui/Button/Button';
import LiveTracker from '@/shared/map/LiveTracker/LiveTracker';

export default function TrackingPage() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [triggerSOS, { isLoading: isSOSLoading }] = useTriggerSOSMutation();
  
  const { data: bookingsResponse } = useGetBookingsQuery();
  const bookings = bookingsResponse?.data || bookingsResponse?.bookings || bookingsResponse || [];
  const stateBooking = loc.state?.booking;
  
  const apiBooking = Array.isArray(bookings) ? bookings.find(b => b.id === stateBooking?.id || b._id === stateBooking?._id) : null;
  const booking = apiBooking || stateBooking;

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

  const [showSOSModal, setShowSOSModal] = useState(false);

  const isOngoing = booking.status === 'ongoing' || booking.bookingStatus === 'ongoing';

  const confirmSOS = () => {
    // Attempt to get exact live location from device
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await triggerSOSCall({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
        },
        async (error) => {
          console.warn("Could not get exact location for SOS", error);
          // Fallback to sending without location (admin will use rider's location)
          await triggerSOSCall(null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      triggerSOSCall(null);
    }
  };

  const triggerSOSCall = async (location) => {
    try {
      const payload = { bookingId: booking._id || booking.id };
      if (location) {
        payload.location = location;
      }
      
      await triggerSOS(payload).unwrap();
      setShowSOSModal(false);
      alert("Emergency alert sent to Admin. Help is on the way.");
    } catch (err) {
      alert("Failed to send emergency alert. Please call local emergency services immediately.");
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 relative">
        
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Live tracking</div>
            <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">
              {isOngoing ? 'Tour in progress' : 'Your guide is on the way'}
            </h1>
          </div>
          
          <button 
            onClick={() => setShowSOSModal(true)}
            disabled={isSOSLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Trigger Emergency Alert"
          >
            <span className="text-xl">🚨</span> 
            {isSOSLoading ? 'Sending...' : 'SOS'}
          </button>
        </div>
        
        <LiveTracker booking={booking} height="450px" />

        {/* Custom SOS Confirmation Modal */}
        {showSOSModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-ink-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 border-red-500 text-center transform transition-all">
              <div className="text-5xl mb-4">🚨</div>
              <h3 className="text-xl font-bold text-ink-900 dark:text-ink-100 mb-2">Trigger Emergency?</h3>
              <p className="text-ink-600 dark:text-ink-400 mb-6">
                Are you sure you want to trigger an emergency alert? This will immediately notify the admin with your live location.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowSOSModal(false)}
                  className="flex-1 py-3 px-4 bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-200 font-semibold rounded-xl hover:bg-ink-200 dark:hover:bg-ink-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmSOS}
                  disabled={isSOSLoading}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSOSLoading ? 'Sending...' : 'Confirm SOS'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
