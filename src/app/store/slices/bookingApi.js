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

    getBookings: builder.query({
      query: () => "/tourist/booking",
      providesTags: ["Booking"]
    }),

    payFromWallet: builder.mutation({
      query: (data) => ({
        url: "/bookings/pay-from-wallet",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Wallet", "Booking", "Transaction"]
    })

  })
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  usePayFromWalletMutation
} = bookingApi;
