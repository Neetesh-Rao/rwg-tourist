import React,{forwardRef}from'react';
const Input=forwardRef(function Input({label,error,hint,leftIcon,rightElement,required,className='',id,...props},ref){
  const uid=id||`inp_${Math.random().toString(36).slice(2,7)}`;
  return(
    <div className="flex flex-col gap-1.5 w-full">
      {label&&<label htmlFor={uid} className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{label}{required&&<span className="text-brand-500 ml-1">*</span>}</label>}
     <div className="flex items-center input-field px-3 gap-2">
  
  {leftIcon && (
    <span className="text-ink-400 flex items-center">
      {leftIcon}
    </span>
  )}

  <input
    ref={ref}
    id={uid}
    required={required}
    className="flex-1 bg-transparent outline-none"
    {...props}
  />

  {rightElement && (
    <span className="text-ink-400 flex items-center">
      {rightElement}
    </span>
  )}

</div>
      {error&&<span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      {!error&&hint&&<span className="text-xs text-ink-400 dark:text-ink-600">{hint}</span>}
    </div>
  );
});
export default Input;
