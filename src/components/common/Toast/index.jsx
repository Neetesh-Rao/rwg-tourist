import React,{useEffect,useCallback}from'react';
import{useAppDispatch,useUI}from'../../../store';
import{popToast}from'../../../store/slices/uiWalletSlice';

function ToastItem({toast}){
  const dispatch=useAppDispatch();
  const remove=useCallback(()=>dispatch(popToast(toast.id)),[dispatch,toast.id]);
  useEffect(()=>{if(!toast.duration)return;const t=setTimeout(remove,toast.duration);return()=>clearTimeout(t);},[toast.duration,remove]);
  const S={
    success:{bg:'bg-green-50 dark:bg-green-900/25 border-green-200 dark:border-green-800',icon:'✓',ib:'bg-green-500',text:'text-green-800 dark:text-green-200'},
    error:  {bg:'bg-red-50 dark:bg-red-900/25 border-red-200 dark:border-red-800',      icon:'✕',ib:'bg-red-500',  text:'text-red-800 dark:text-red-200'},
    warning:{bg:'bg-amber-50 dark:bg-amber-900/25 border-amber-200 dark:border-amber-800',icon:'!',ib:'bg-amber-500',text:'text-amber-800 dark:text-amber-200'},
    info:   {bg:'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800',icon:'i',ib:'bg-brand-500',text:'text-brand-800 dark:text-brand-200'},
  };
  const s=S[toast.type]||S.info;
  return(
    <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg animate-fade-up ${s.bg}`}>
      <div className={`w-6 h-6 rounded-lg ${s.ib} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>{s.icon}</div>
      <div className="flex-1 min-w-0">
        {toast.title&&<p className={`text-sm font-semibold ${s.text}`}>{toast.title}</p>}
        {toast.message&&<p className={`text-xs mt-0.5 ${s.text} opacity-80`}>{toast.message}</p>}
      </div>
      <button onClick={remove} className="text-ink-400 hover:text-ink-600 text-xs font-bold flex-shrink-0 mt-0.5">✕</button>
    </div>
  );
}

export default function ToastContainer(){
  const{toasts}=useUI();
  if(!toasts.length)return null;
  return(
    <div className="fixed top-20 right-4 z-[300] flex flex-col gap-2 w-80 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map(t=><ToastItem key={t.id} toast={t}/>)}
      </div>
    </div>
  );
}
