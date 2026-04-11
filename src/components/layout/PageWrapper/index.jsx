import React from 'react';
import Navbar from '../Navbar';
import { BottomNav } from '../BottomNav';
import ToastContainer from '../../common/Toast';
import { useAuth } from '../../../store';

export default function PageWrapper({ children, className = '', hideNav = false }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {!hideNav && <Navbar />}
      <main className={`flex-1 ${isAuthenticated ? 'pb-20 md:pb-6' : 'pb-6'} ${className}`}>
        {children}
      </main>
      {isAuthenticated && <BottomNav />}
      <ToastContainer />
      <div className="noise" />
    </div>
  );
}
