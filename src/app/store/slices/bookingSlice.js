import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  ls,
  sleep,
  genId
} from '@/shared/lib/helpers';
import { api } from '../service';

export const fetchSlots = createAsyncThunk(
  'booking/fetchSlots',
  async (params, { rejectWithValue }) => {
    try {
      await sleep(900);
      let riders = []; // Real riders will be fetched from API later
      return riders.map((rider) => ({
        id: genId('slot'),
        riderId: rider.id,
        rider,
        city: params.city,
        date: params.date,
        startTime: params.startTime || '08:00',
        endTime: params.endTime || '20:00',
        status: 'available'
      }));
    } catch (error) {
      return rejectWithValue('Could not load guides. Please try again.');
    }
  }
);

export const estimatePrice = createAsyncThunk(
  'booking/estimatePrice',
  async (params, { dispatch }) => {
    const result = await dispatch(
      api.endpoints.getEstimate.initiate(params)
    );
    if (result?.data?.success) {
      return result.data.data;
    }
    throw new Error(result?.error?.data?.message || 'Estimate failed');
  }
);

export const loadMyBookings = createAsyncThunk(
  'booking/loadMine',
  async () => {
    await sleep(300);
    return ls.get('rwg_bookings', []);
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    step: 1,
    draft: { stops: [] },
    availableSlots: [],
    selectedSlot: null,
    priceEstimate: null,
    bookings: [],
    currentBooking: null,
    activeRide: null,
    isLoading: false,
    error: null
  },
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    updateDraft: (state, action) => {
      state.draft = { ...state.draft, ...action.payload };
    },
    selectSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    setBookings: (state, action) => {
      state.bookings = action.payload || [];
    },
    bookingCreated: (state, action) => {
      state.currentBooking = action.payload;
      state.bookings.unshift(action.payload);
    },
    addStop: (state, action) => {
      if (!state.draft.stops) state.draft.stops = [];
      state.draft.stops.push(action.payload);
    },
    removeStop: (state, action) => {
      state.draft.stops = state.draft.stops.filter(
        (st) => st.id !== action.payload
      );
    },
    resetWizard: (state) => {
      state.step = 1;
      state.draft = { stops: [] };
      state.availableSlots = [];
      state.selectedSlot = null;
      state.priceEstimate = null;
      state.error = null;
    },
    startRide: (state, action) => {
      state.activeRide = action.payload;
    },
    endRide: (state) => {
      state.activeRide = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(estimatePrice.fulfilled, (state, action) => {
        state.priceEstimate = action.payload;
      })
      .addCase(loadMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      });
  }
});

export const {
  setStep,
  updateDraft,
  selectSlot,
  setBookings,
  bookingCreated,
  addStop,
  removeStop,
  resetWizard,
  startRide,
  endRide,
  clearError
} = bookingSlice.actions;

export default bookingSlice.reducer;
