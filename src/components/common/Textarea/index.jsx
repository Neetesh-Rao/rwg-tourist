import React,{forwardRef}from'react';
const Textarea=forwardRef(function Textarea({label,error,hint,required,className='',id,rows=3,...props},ref){
  const uid=id||`ta_${Math.random().toString(36).slice(2,7)}`;
  return(
    <div className="flex flex-col gap-1.5 w-full">
      {label&&<label htmlFor={uid} className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{label}{required&&<span className="text-brand-500 ml-1">*</span>}</label>}
      <textarea ref={ref} id={uid} rows={rows} required={required} className={`input-field resize-none leading-relaxed ${error?'error':''} ${className}`} {...props}/>
      {error&&<span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      {!error&&hint&&<span className="text-xs text-ink-400 dark:text-ink-600">{hint}</span>}
    </div>
  );
});
export default Textarea;
