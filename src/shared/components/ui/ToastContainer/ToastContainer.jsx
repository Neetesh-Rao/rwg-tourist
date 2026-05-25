import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { popToast } from '@/app/store/slices/uiSlice';

export default function ToastContainer() {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => dispatch(popToast(toast.id))} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [onClose, toast.duration]);

  const typeStyles = {
    error: 'bg-red-500 border-red-600',
    success: 'bg-green-500 border-green-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-brand-500 border-brand-600'
  };

  const bg = typeStyles[toast.type] || typeStyles.info;

  return (
    <div className={`${bg} text-white px-4 py-3 rounded-xl shadow-lg border flex justify-between items-start min-w-[280px] pointer-events-auto animate-fade-up`}>
      <div>
        <h4 className="font-bold text-sm">{toast.title || toast.type.toUpperCase()}</h4>
        {toast.message && <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={onClose} className="ml-4 font-bold opacity-70 hover:opacity-100 transition-opacity">
        ✕
      </button>
    </div>
  );
}
