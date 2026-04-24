import { api } from "../service";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: "/tourist/profile",
        method: "GET"
      })
    }),

    sendOtp: builder.mutation({
      query: (data) => ({
        url: "/tourist/auth/send-otp",
        method: "POST",
        body: data
      })
    }),

    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/tourist/auth/verify-otp",
        method: "POST",
        body: data
      })
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/tourist/profile",
        method: "PATCH",
        body: data
      })
    })
  })
});

export const {
  useGetProfileQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useUpdateProfileMutation
} = authApi;
