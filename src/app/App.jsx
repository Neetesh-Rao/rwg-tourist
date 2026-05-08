import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAuth } from '@/app/store/store';
import 'leaflet/dist/leaflet.css';
import { Toaster } from 'react-hot-toast';
import { useGetPlatformConfigQuery } from '@/app/store/slices/configApi';
import { initPlatformConfig } from '@/shared/config/constants';

import HomePage from '@/pages/Home/HomePage';
import RegisterPage from '@/pages/Auth/Register/RegisterPage';
import LoginPage from '@/pages/Auth/Login/LoginPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import BookingPage from '@/pages/Booking/BookingPage';
import BookingsPage from '@/pages/Booking/BookingsPage';
import TrackingPage from '@/pages/Tracking/TrackingPage';
import ProfilePage from '@/pages/Profile/ProfilePage';
import WalletPage from '@/pages/Wallet/WalletPage';

import SocketManager from "../socket/SocketManager";

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

function ConfigLoader({ children }) {
  const { isLoading, data } = useGetPlatformConfigQuery();
  
  React.useEffect(() => {
    if (data) {
      // Update the let variables in constants.js
      initPlatformConfig();
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium tracking-widest uppercase text-ink-400">Loading Configuration...</p>
      </div>
    );
  }

  return children;
}

function AppRoutes() {
  return (
    <>     <Toaster
      position="bottom-right"
      reverseOrder={false}
   />
    <Routes>
    
      <Route path="/"         element={<HomePage />} />
      {/* <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} /> */}
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
      <SocketManager />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ConfigLoader>
          <AppRoutes />
        </ConfigLoader>
      </BrowserRouter>
    </Provider>
  );
}
