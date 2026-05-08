import { api } from "../service";

export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    payWithWallet: builder.mutation({
      query: (data) => ({
        url: "/tourist/wallet",
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Wallet", "Transaction"]
    }),
  })
});

export const {
  usePayWithWalletMutation,
} = walletApi;
