import { api } from "../service";

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (data) => ({
        url: "/tourist/booking",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Booking"]
    }),

    getBookingEstimate: builder.mutation({
      query: (data) => ({
        url: "/tourist/booking/estimate",
        method: "POST",
        body: data
      }),
    }),

    getBookings: builder.query({
      query: () => "/tourist/booking",
      providesTags: ["Booking"]
    }),

    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/tourist/booking/${id}`,
        method: "PATCH",
        body: { status: "cancelled" }
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
  })
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetBookingEstimateMutation,
  useCancelBookingMutation,
  useRateRiderMutation,
} = bookingApi;
