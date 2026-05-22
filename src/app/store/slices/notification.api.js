import { api } from "../service";

export const notificationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Add inside endpoints builder:
        getNotifications: builder.query({
            query: (page = 1) => `/notifications?page=${page}&limit=20`,
            providesTags: ['Notification'],
        }),

        markNotificationRead: builder.mutation({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),

        markAllNotificationsRead: builder.mutation({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),

    })
});

export const {
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation
} = notificationApi;
