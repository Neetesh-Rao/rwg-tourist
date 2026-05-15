import { api } from "../service";

export const transactionApi = api.injectEndpoints({
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
      }),
      invalidatesTags: ["Transaction", "Booking"]
    }),

    payWithBalance: builder.mutation({
      query: (data) => ({
        url: "/tourist/wallet",
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Balance", "Transaction"]
    }),
  })
});

export const {
  useGetPaymentHistoryQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  usePayWithBalanceMutation,
} = transactionApi;
