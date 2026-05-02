import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, size = 'md', className = '' }) {
  const W = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', full: 'max-w-2xl' };
  
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose?.(); };
    if (open) { 
      document.addEventListener('keydown', fn); 
      document.body.style.overflow = 'hidden'; 
    }
    return () => { 
      document.removeEventListener('keydown', fn); 
      document.body.style.overflow = ''; 
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink-950/60 dark:bg-ink-950/80 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className={`relative card w-full ${W[size] || W.md} max-h-[90vh] overflow-y-auto animate-scale-in rounded-3xl shadow-2xl border border-[var(--border)] ${className}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-ink-100">{title}</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all hover:rotate-90"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

  