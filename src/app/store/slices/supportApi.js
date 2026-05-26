import { api } from "../service";

export const supportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSupportQuery: builder.mutation({
      query: (body) => ({
        url: "/support",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SupportQuery"],
    }),
    getMySupportQueries: builder.query({
      query: () => "/support/my-queries",
      providesTags: ["SupportQuery"],
    }),
  }),
});

export const { useCreateSupportQueryMutation, useGetMySupportQueriesQuery } = supportApi;
