import React from'react';
const COLORS=['bg-brand-100 text-brand-700','bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-green-100 text-green-700','bg-amber-100 text-amber-700','bg-pink-100 text-pink-700'];
const SIZES={xs:{box:'w-7 h-7',text:'text-xs',r:'rounded-xl',dot:'w-2 h-2 border'},sm:{box:'w-9 h-9',text:'text-sm',r:'rounded-xl',dot:'w-2.5 h-2.5 border-2'},md:{box:'w-11 h-11',text:'text-base',r:'rounded-2xl',dot:'w-3 h-3 border-2'},lg:{box:'w-14 h-14',text:'text-lg',r:'rounded-2xl',dot:'w-3.5 h-3.5 border-2'},xl:{box:'w-20 h-20',text:'text-2xl',r:'rounded-3xl',dot:'w-4 h-4 border-2'},'2xl':{box:'w-28 h-28',text:'text-4xl',r:'rounded-3xl',dot:'w-5 h-5 border-2'}};
export default function Avatar({name='',src,size='md',online,className=''}){
  const c=SIZES[size]||SIZES.md;
  const initials=name.trim().split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase()||'?';
  const color=COLORS[(name.charCodeAt(0)||0)%COLORS.length];
  return(
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div className={`${c.box} ${c.r} overflow-hidden flex items-center justify-center font-bold ${color} flex-shrink-0`}>
        {src?<img src={src} alt={name} className="w-full h-full object-cover"/>:<span className={c.text}>{initials}</span>}
      </div>
      {online!==undefined&&<span className={`absolute -bottom-0.5 -right-0.5 ${c.dot} rounded-full border-[var(--surface)] ${online?'bg-green-500':'bg-ink-300 dark:bg-ink-600'}`}/>}
    </div>
  );
}
