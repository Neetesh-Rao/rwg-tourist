import React from'react';
export default function EmptyState({emoji,title,description,action,className=''}){
  return(
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {emoji&&<div className="text-5xl mb-5 animate-float">{emoji}</div>}
      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100 mb-2">{title}</h3>
      {description&&<p className="text-sm text-ink-400 dark:text-ink-600 mb-6 max-w-xs leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}
