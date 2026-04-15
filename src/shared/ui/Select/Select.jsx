import React,{forwardRef}from'react';
import{ChevronDown}from'lucide-react';
const Select=forwardRef(function Select({label,error,options=[],placeholder,required,className='',id,...props},ref){
  const uid=id||`sel_${Math.random().toString(36).slice(2,7)}`;
  return(
    <div className="flex flex-col gap-1.5 w-full">
      {label&&<label htmlFor={uid} className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{label}{required&&<span className="text-brand-500 ml-1">*</span>}</label>}
      <div className="relative">
        <select ref={ref} id={uid} required={required} className={`input-field pr-10 appearance-none cursor-pointer ${error?'error':''} ${className}`} {...props}>
          {placeholder&&<option value="">{placeholder}</option>}
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none"/>
      </div>
      {error&&<span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
});
export default Select;
