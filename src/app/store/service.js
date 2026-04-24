import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:9999/api",
    credentials: "include",
    prepareHeaders: (headers) => {
      const token =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("rwg_token") || "null");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["Wallet", "Booking", "Transaction"],
  endpoints: () => ({})
});
