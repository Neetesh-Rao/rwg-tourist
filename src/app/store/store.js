import{configureStore}from'@reduxjs/toolkit';
import{useDispatch,useSelector}from'react-redux';
import authReducer from'@/features/auth/model/authSlice';
import bookingReducer from'@/features/booking/model/bookingSlice';
import{uiSlice,walletSlice}from'@/features/wallet/model/uiWalletSlice';

export const store=configureStore({
  reducer:{auth:authReducer,booking:bookingReducer,ui:uiSlice.reducer,wallet:walletSlice.reducer},
  middleware:g=>g({serializableCheck:false}),
});

export const useAppDispatch=()=>useDispatch();
export const useAppSelector=sel=>useSelector(sel);

// Selector shortcuts
export const useAuth    =()=>useAppSelector(s=>s.auth);
export const useUser    =()=>useAppSelector(s=>s.auth.user);
export const useUI      =()=>useAppSelector(s=>s.ui);
export const useTheme   =()=>useAppSelector(s=>s.ui.theme);
export const useBooking =()=>useAppSelector(s=>s.booking);
export const useDraft   =()=>useAppSelector(s=>s.booking.draft);
export const useSlots   =()=>useAppSelector(s=>s.booking.availableSlots);
export const useEstimate=()=>useAppSelector(s=>s.booking.priceEstimate);
export const useStep    =()=>useAppSelector(s=>s.booking.step);
export const useBookings=()=>useAppSelector(s=>s.booking.bookings);
export const useWallet  =()=>useAppSelector(s=>s.wallet);
