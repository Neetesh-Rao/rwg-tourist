import { BOOKING_STATUS } from '@/shared/config/constants';

export const normalizeBookingStatus = (status) => {
  if (status === 'searching') return 'pending';
  if (status === 'assigned') return 'confirmed';
  if (status === 'booked') return 'pending';
  if (status === 'in_progress') return 'ongoing';
  return status || 'pending';
};

export const normalizeBooking = (booking) => ({
  ...booking,
  id: booking?._id || booking?.id,
  city: booking?.city || '',
  date: booking?.date || '',
  startTime: booking?.startTime || '',
  endTime: booking?.endTime || booking?.durationType || '',
  pickupAddress: booking?.pickupLocation?.address || booking?.pickupAddress || '',
  pickupLat: booking?.pickupLocation?.lat || booking?.pickupLat || null,
  pickupLng: booking?.pickupLocation?.lng || booking?.pickupLng || null,
  stops: booking?.stops || [],
  status: normalizeBookingStatus(booking?.bookingStatus || booking?.status),
  otp: booking?.rideOTP || booking?.otp || booking?.rideOtp || '',
  rider: (typeof booking?.riderId === 'object' ? booking.riderId : null) || booking?.rider || booking?.guide || null,
  estimatedPrice: booking?.pricing ? {
    estimatedMin: booking.pricing?.estimatedRange?.min || 0,
    estimatedMax: booking.pricing?.estimatedRange?.max || 0,
    advanceAmount: booking.pricing?.advanceAmount || 0,
    baseFare: booking.pricing?.baseFare || 0,
    distanceCost: booking.pricing?.distanceCost || 0,
    timeCharge: booking.pricing?.timeCharge || 0,
    guideServiceFee: booking.pricing?.guideServiceFee || 0,
    demandMultiplier: booking.pricing?.demandMultiplier || 1,
  } : booking?.estimatedPrice || null,
});
