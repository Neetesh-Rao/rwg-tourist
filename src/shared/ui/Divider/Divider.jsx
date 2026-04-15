import React from'react';
export default function Divider({label,className=''}){
  if(!label)return<div className={`h-px bg-[var(--border)] ${className}`}/>;
  return(
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-[var(--border)]"/>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-600 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-[var(--border)]"/>
    </div>
  );
}
