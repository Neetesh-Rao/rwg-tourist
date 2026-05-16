import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { api } from "./service";

// Slices
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import uiReducer from "./slices/uiSlice";
import chatReducer from "./slices/chatSlice";

// API
import { configApi } from "./slices/configApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    ui: uiReducer,
    chat: chatReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});

// Hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth Selectors
export const useAuth = () => useAppSelector((state) => state.auth);
export const useUser = () => useAppSelector((state) => state.auth.user);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);

// UI Selectors
export const useTheme = () => useAppSelector((state) => state.ui.theme);
export const useUI = () => useAppSelector((state) => state.ui);
export const useModals = () => useAppSelector((state) => state.ui.modal);

// Balance Selectors (Balance is stored in auth.user)
export const useBalance = () => useAppSelector((state) => state.auth.user?.walletBalance || 0);

// Booking Selectors
export const useBooking = () => useAppSelector((state) => state.booking);
export const useBookings = () => useAppSelector((state) => state.booking.bookings);
export const useDraft = () => useAppSelector((state) => state.booking.draft);
export const useEstimate = () => useAppSelector((state) => state.booking.priceEstimate);
export const useSlots = () => useAppSelector((state) => state.booking.availableSlots);
export const useStep = () => useAppSelector((state) => state.booking.step);

// Chat Selectors
export const useChat = () => useAppSelector((state) => state.chat);
export const useActiveChatId = () => useAppSelector((state) => state.chat.activeChat);
export const useSocketConnected = () => useAppSelector((state) => state.chat.socketConnected);

// Memoized chat messages selector to prevent unnecessary re-renders
const selectChatState = (state) => state.chat;
const selectChatId = (_, id) => id;
export const selectChatMessagesMemo = createSelector(
  [selectChatState, selectChatId],
  (chat, id) => chat.messages[id] || []
);

export const useChatMessages = (id) => useAppSelector((state) => selectChatMessagesMemo(state, id));
export const useTypingUser = (bookingId) => useAppSelector((state) => state.chat.typingUsers[bookingId]);

// Config Selectors
export const useConfig = () => useAppSelector((state) =>
  configApi.endpoints.getPlatformConfig.select()(state).data
);
