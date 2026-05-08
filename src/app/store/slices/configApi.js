import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL}),
  endpoints: (builder) => ({
    getPlatformConfig: builder.query({
      query: () => '/config',
      transformResponse: (response) => response.data || response,
    }),
  }),
});

export const { useGetPlatformConfigQuery } = configApi;
