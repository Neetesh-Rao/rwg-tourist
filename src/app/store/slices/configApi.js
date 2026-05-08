import { api } from "../service";


export const configApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformConfig: builder.query({
      query: () => "/config",
      transformResponse: (response) => response.data || response,
    }),
  }),
});

export const { useGetPlatformConfigQuery } = configApi;