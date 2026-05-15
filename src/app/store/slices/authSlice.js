import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ls, genId, sleep } from '@/shared/lib/helpers';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      await sleep(1000);
      const user = {
        id: genId('usr'),
        name: data.name,
        email: data.email,
        phone: data.phone,
        nationality: data.nationality,
        preferredLanguage: data.preferredLanguage,
        gender: data.gender,
        avatar: null,
        bio: '',
        totalTrips: 0,
        walletBalance: 500,
        joinedAt: new Date().toISOString()
      };
      const token = genId('tok');
      ls.set('rwg_token', token);
      ls.set('rwg_user', user);
      return { user, token };
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || 'Registration failed. Try again.'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      await sleep(800);
      const stored = ls.get('rwg_user');
      if (!stored)
        return rejectWithValue('No account found. Please register first.');
      const token = genId('tok');
      ls.set('rwg_token', token);
      return { user: stored, token };
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || 'Login failed. Try again.'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue, getState }) => {
    try {
      await sleep(600);
      const updated = { ...getState().auth.user, ...data };
      ls.set('rwg_user', updated);
      return updated;
    } catch (e) {
      return rejectWithValue('Profile update failed.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: ls.get('rwg_user'),
    token: ls.get('rwg_token'),
    isAuthenticated: !!(ls.get('rwg_token') && ls.get('rwg_user')),
    isLoading: false,
    error: null
  },
  reducers: {
    setAuthSession: (state, { payload }) => {
      const user = payload?.user || null;
      const token = payload?.token || null;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!(token && user);
      state.error = null;
      if (user && token) {
        ls.set('rwg_user', user);
        ls.set('rwg_token', token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      ls.remove('rwg_token');
      ls.remove('rwg_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    creditBalance: (state, { payload }) => {
      if (state.user) {
        state.user.walletBalance = (state.user.walletBalance || 0) + payload;
        ls.set('rwg_user', state.user);
      }
    },
    debitBalance: (state, { payload }) => {
      if (state.user) {
        state.user.walletBalance = Math.max(
          0,
          (state.user.walletBalance || 0) - payload
        );
        ls.set('rwg_user', state.user);
      }
    }
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const setRejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    builder
      .addCase(registerUser.pending, setPending)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, setRejected)
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, setRejected)
      .addCase(updateProfile.pending, setPending)
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload;
      })
      .addCase(updateProfile.rejected, setRejected);
  }
});

export const {
  setAuthSession,
  logout,
  clearError,
  creditBalance,
  debitBalance
} = authSlice.actions;

export default authSlice.reducer;
