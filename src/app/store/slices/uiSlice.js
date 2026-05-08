import { createSlice } from '@reduxjs/toolkit';
import { ls } from '@/shared/lib/helpers';

const initTheme = () => {
  const s = ls.get('rwg_theme', 'light');
  if (s === 'dark') document.documentElement.classList.add('dark');
  return s;
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: initTheme(),
    modal: null,
    toasts: [],
    sidebarOpen: false
  },
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = nextTheme;
      ls.set('rwg_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      ls.set('rwg_theme', action.payload);
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    openModal: (state, action) => {
      state.modal = action.payload;
    },
    closeModal: (state) => {
      state.modal = null;
    },
    pushToast: (state, action) => {
      state.toasts.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        type: 'info',
        duration: 4000,
        ...action.payload
      });
    },
    popToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    }
  }
});

export const {
  toggleTheme,
  setTheme,
  openModal,
  closeModal,
  pushToast,
  popToast,
  toggleSidebar
} = uiSlice.actions;

export default uiSlice.reducer;