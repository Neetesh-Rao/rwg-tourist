import { api } from "../service";

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEstimate: builder.mutation({
      query: (data) => ({
        url: "/tourist/booking/estimate",
        method: "POST",
        body: data
      })
    }),

    createBooking: builder.mutation({
      query: (data) => ({
        url: "/tourist/booking",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Booking"]
    }),

    getBookings: builder.query({
      query: () => "/tourist/booking",
      providesTags: ["Booking"]
    }),

    cancelBooking: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/tourist/booking/${id}`,
        method: "PATCH",
        body: { status: "cancelled", reason }
      }),
      invalidatesTags: ["Booking"]
    }),

    rateRider: builder.mutation({
      query: ({ bookingId, rating }) => ({
        url: `/tourist/booking/${bookingId}/rate`,
        method: "PATCH",
        body: { rating }
      }),
      invalidatesTags: ["Booking"]
    }),
    triggerSOS: builder.mutation({
      query: ({ bookingId }) => ({
        url: "/tourist/booking/sos",
        method: "POST",
        body: { bookingId }
      })
    }),
  })
});

export const {
  useGetEstimateMutation,
  useCreateBookingMutation,
  useGetBookingsQuery,
  useCancelBookingMutation,
  useRateRiderMutation,
  useTriggerSOSMutation,
} = bookingApi;
