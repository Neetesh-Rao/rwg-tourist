import React from'react';
export function Skeleton({className='',style}){return<div className={`skeleton ${className}`} style={style}/>;}
export function Spinner({size='md',className=''}){
  const s={sm:'w-4 h-4 border-2',md:'w-6 h-6 border-2',lg:'w-8 h-8 border-[3px]',xl:'w-12 h-12 border-[3px]'}[size]||'w-6 h-6 border-2';
  return<span className={`inline-block ${s} rounded-full border-surface-3 dark:border-surface-4 border-t-brand-500 animate-spin ${className}`}/>;
}
export function FullPageLoader({message='Loading...'}){
  return(<div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg)]"><Spinner size="lg"/><p className="text-sm text-ink-400 animate-pulse">{message}</p></div>);
}
export default Spinner;
