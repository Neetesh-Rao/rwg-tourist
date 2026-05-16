import { api } from "../service";

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createConversation: builder.mutation({
      query: (data) => ({
        url: "/chat/conversation",
        method: "POST",
        body: data
      }),
      invalidatesTags: ['Chat']
    }),

    getMessages: builder.query({
      query: (conversationId) => `/chat/messages/${conversationId}`,
      providesTags: (result, error, conversationId) => [{ type: 'Chat', id: conversationId }]
    }),

    markAsRead: builder.mutation({
      query: ({ messageIds }) => ({
        url: "/chat/mark-read",
        method: "PATCH",
        body: { messageIds }
      }),
      invalidatesTags: ['Chat']
    })
  })
});

export const {
  useCreateConversationMutation,
  useGetMessagesQuery,
  useMarkAsReadMutation
} = chatApi;
