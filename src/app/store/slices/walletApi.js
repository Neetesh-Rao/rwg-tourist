import { api } from "../service";

export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query({
      query: () => "/tourist/wallet",
      providesTags: ["Wallet"]
    }),

    addMoney: builder.mutation({
      query: (data) => ({
        url: "/tourist/wallet",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Wallet", "Transaction"]
    }),

    payWithWallet: builder.mutation({
      query: (data) => ({
        url: "/tourist/wallet",
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Wallet", "Transaction"]
    }),

    getTransactions: builder.query({
      query: () => "/tourist/wallet/transactions",
      providesTags: ["Transaction"]
    })
  })
});

export const {
  useGetWalletQuery,
  useAddMoneyMutation,
  usePayWithWalletMutation,
  useGetTransactionsQuery
} = walletApi;
