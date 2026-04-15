import React,{useEffect}from'react';
export default function Modal({open,onClose,title,children,size='md',className=''}){
  const W={sm:'max-w-sm',md:'max-w-md',lg:'max-w-lg',xl:'max-w-xl',full:'max-w-2xl'};
  useEffect(()=>{
    const fn=e=>{if(e.key==='Escape')onClose?.();};
    if(open){document.addEventListener('keydown',fn);document.body.style.overflow='hidden';}
    return()=>{document.removeEventListener('keydown',fn);document.body.style.overflow='';};
  },[open,onClose]);
  if(!open)return null;
  return(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/50 dark:bg-ink-950/70 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative card w-full ${W[size]||W.md} max-h-[90vh] overflow-y-auto animate-scale-in rounded-t-3xl sm:rounded-3xl ${className}`}>
        <div className="sm:hidden w-10 h-1 bg-ink-200 dark:bg-ink-700 rounded-full mx-auto mb-4"/>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-surface-2 dark:hover:bg-surface-3 transition-colors text-sm font-bold">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
