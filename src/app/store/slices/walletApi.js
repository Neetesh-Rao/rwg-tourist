import { api } from "../service";

export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getWallet: builder.query({
      query: () => "/wallet",
      providesTags: ["Wallet"]
    }),

    addMoney: builder.mutation({
      query: (data) => ({
        url: "/wallet/add-money",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Wallet", "Transaction"]
    }),

    getTransactions: builder.query({
      query: () => "/wallet/transactions",
      providesTags: ["Transaction"]
    })

  })
});

export const {
  useGetWalletQuery,
  useAddMoneyMutation,
  useGetTransactionsQuery
} = walletApi;