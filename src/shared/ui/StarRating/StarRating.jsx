import React from'react';
import{Star}from'lucide-react';
export default function StarRating({rating=0,count,size='sm',className=''}){
  const sz={sm:'w-3.5 h-3.5',md:'w-4 h-4',lg:'w-5 h-5'}[size]||'w-3.5 h-3.5';
  return(
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i=><Star key={i} className={`${sz} ${i<=Math.round(rating)?'text-brand-500 fill-brand-500':'text-ink-200 dark:text-ink-700'}`}/>)}
      </div>
      <span className="text-xs font-mono font-semibold text-ink-600 dark:text-ink-400">{Number(rating).toFixed(1)}</span>
      {count!==undefined&&<span className="text-xs text-ink-400">({count})</span>}
    </div>
  );
}
