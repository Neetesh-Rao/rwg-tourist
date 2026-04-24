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

function ProfileCompletedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.profileCompleted ? children : <Navigate to="/profile" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return children;
  return <Navigate to={user?.profileCompleted ? "/dashboard" : "/profile"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<HomePage />} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/dashboard"element={<ProfileCompletedRoute><DashboardPage /></ProfileCompletedRoute>} />
      <Route path="/book"     element={<ProfileCompletedRoute><BookingPage /></ProfileCompletedRoute>} />
      <Route path="/bookings" element={<ProfileCompletedRoute><BookingsPage /></ProfileCompletedRoute>} />
      <Route path="/tracking" element={<ProfileCompletedRoute><TrackingPage /></ProfileCompletedRoute>} />
      <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/transactions"   element={<ProfileCompletedRoute><WalletPage /></ProfileCompletedRoute>} />
      <Route path="/Transactions"   element={<Navigate to="/transactions" replace />} />
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
