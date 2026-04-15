import React from 'react';
import Navbar from '../Navbar/Navbar';
import { BottomNav } from '../BottomNav/BottomNav';
import ToastContainer from '@/shared/ui/Toast/Toast';
import { useAuth } from '@/app/store/store';

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
