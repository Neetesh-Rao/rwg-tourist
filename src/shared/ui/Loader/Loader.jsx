import React from'react';
export function Skeleton({className='',style}){return<div className={`skeleton ${className}`} style={style}/>;}
export function Spinner({size='md',className=''}){
  const s={sm:'w-4 h-4 border-2',md:'w-6 h-6 border-2',lg:'w-8 h-8 border-[3px]',xl:'w-12 h-12 border-[3px]'}[size]||'w-6 h-6 border-2';
  return<span className={`inline-block ${s} rounded-full border-surface-3 dark:border-surface-4 border-t-brand-500 animate-spin ${className}`}/>;
}
export default Spinner;
