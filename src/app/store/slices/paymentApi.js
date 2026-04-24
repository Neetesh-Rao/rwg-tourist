import { api } from "../service";

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentHistory: builder.query({
      query: () => ({
        url: "/payment/history",
        method: "GET"
      }),
      providesTags: ["Transaction", "Booking"]
    }),

    createOrder: builder.mutation({
      query: (data) => ({
        url: "/payment/create-order",
        method: "POST",
        body: data
      })
    }),

    verifyPayment: builder.mutation({
      query: (data) => ({
        url: "/payment/verify-payment",
        method: "POST",
        body: data
      })
    })
  })
});

export const {
  useGetPaymentHistoryQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation
} = paymentApi;
