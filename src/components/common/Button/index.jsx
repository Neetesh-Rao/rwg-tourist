import React from'react';
import{Loader2}from'lucide-react';

export default function Button({children,variant='primary',size='md',loading=false,disabled=false,fullWidth=false,icon,iconRight,className='',type='button',...rest}){
  const base='inline-flex items-center justify-center gap-2 font-sans font-semibold border-0 outline-none cursor-pointer select-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:!transform-none disabled:!shadow-none';
  const V={
    primary:'text-ink-900 bg-brand-gradient shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 active:scale-[.97] rounded-xl focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    secondary:'text-ink-800 dark:text-ink-100 bg-surface-2 dark:bg-surface-3 border border-[var(--border-md)] hover:bg-surface-3 dark:hover:bg-surface-4 hover:-translate-y-0.5 rounded-xl focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    outline:'text-brand-600 dark:text-brand-400 bg-transparent border-2 border-brand-400 dark:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:-translate-y-0.5 rounded-xl focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    ghost:'text-ink-600 dark:text-ink-400 bg-transparent hover:bg-surface-2 dark:hover:bg-surface-3 hover:text-ink-900 dark:hover:text-ink-100 rounded-xl focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    danger:'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/25 rounded-xl',
    white:'text-ink-900 bg-white border border-[var(--border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-xl',
  };
  const S={xs:'text-xs px-3 py-1.5 rounded-lg',sm:'text-sm px-4 py-2',md:'text-sm px-5 py-2.5',lg:'text-[15px] px-6 py-3',xl:'text-base px-8 py-4'};
  return(
    <button type={type} disabled={disabled||loading} className={[base,V[variant]||V.primary,S[size]||S.md,fullWidth?'w-full':'',className].join(' ')} {...rest}>
      {loading?<Loader2 className="w-4 h-4 animate-spin flex-shrink-0"/>:(icon&&<span className="flex-shrink-0 flex">{icon}</span>)}
      {children&&<span>{children}</span>}
      {!loading&&iconRight&&<span className="flex-shrink-0 flex">{iconRight}</span>}
    </button>
  );
}
