import { api } from "../service";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({

    sendOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: data
      })
    }),

    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data
      })
    })

  })
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation
} = authApi;