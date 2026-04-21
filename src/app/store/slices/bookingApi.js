import { api } from "../service";

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({

    createBooking: builder.mutation({
      query: (data) => ({
        url: "/bookings",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Booking"]
    }),

    getBookings: builder.query({
      query: () => "/bookings",
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