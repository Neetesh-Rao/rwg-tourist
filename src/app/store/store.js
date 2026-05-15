import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { api } from "./service";

// Slices
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import uiReducer from "./slices/uiSlice";

// API
import { configApi } from "./slices/configApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    ui: uiReducer,
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

// Config Selectors
export const useConfig = () => useAppSelector((state) =>
  configApi.endpoints.getPlatformConfig.select()(state).data
);
