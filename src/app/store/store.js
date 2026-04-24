import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { api } from "./service";
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import { uiSlice, walletSlice } from "./slices/uiWalletSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    ui: uiSlice.reducer,
    wallet: walletSlice.reducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useAuth = () => useAppSelector((state) => state.auth);
export const useUser = () => useAppSelector((state) => state.auth.user);
export const useTheme = () => useAppSelector((state) => state.ui.theme);
export const useUI = () => useAppSelector((state) => state.ui);
export const useWallet = () => useAppSelector((state) => state.wallet);
export const useBooking = () => useAppSelector((state) => state.booking);
export const useBookings = () => useAppSelector((state) => state.booking.bookings);
export const useDraft = () => useAppSelector((state) => state.booking.draft);
export const useEstimate = () => useAppSelector((state) => state.booking.priceEstimate);
export const useSlots = () => useAppSelector((state) => state.booking.availableSlots);
export const useStep = () => useAppSelector((state) => state.booking.step);
