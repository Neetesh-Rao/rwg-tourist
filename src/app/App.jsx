import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAuth } from '@/app/store/store';
import 'leaflet/dist/leaflet.css';

import HomePage from '@/pages/Home/HomePage';
import RegisterPage from '@/pages/Auth/Register/RegisterPage';
import LoginPage from '@/pages/Auth/Login/LoginPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import BookingPage from '@/pages/Booking/BookingPage';
import { BookingsPage, TrackingPage, ProfilePage, WalletPage } from '@/pages/AllPages';

// Guards
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<HomePage />} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/dashboard"element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/book"     element={<PrivateRoute><BookingPage /></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
      <Route path="/tracking" element={<PrivateRoute><TrackingPage /></PrivateRoute>} />
      <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/wallet"   element={<PrivateRoute><WalletPage /></PrivateRoute>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
