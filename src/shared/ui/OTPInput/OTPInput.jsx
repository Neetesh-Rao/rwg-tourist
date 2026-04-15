import React,{useRef}from'react';
export default function OTPInput({length=4,value=[],onChange}){
  const refs=useRef([]);
  const handleChange=(char,idx)=>{
    if(!/^\d*$/.test(char))return;
    const next=[...value];next[idx]=char.slice(-1);onChange(next);
    if(char&&idx<length-1)refs.current[idx+1]?.focus();
  };
  const handleKeyDown=(e,idx)=>{if(e.key==='Backspace'&&!value[idx]&&idx>0)refs.current[idx-1]?.focus();};
  const handlePaste=e=>{
    const p=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,length);
    if(!p)return;
    const next=p.split('').concat(Array(length).fill('')).slice(0,length);
    onChange(next);refs.current[Math.min(p.length,length-1)]?.focus();e.preventDefault();
  };
  return(
    <div className="flex items-center gap-3">
      {Array.from({length}).map((_,i)=>(
        <input key={i} ref={el=>{refs.current[i]=el;}} type="text" inputMode="numeric" maxLength={1}
          value={value[i]||''} onChange={e=>handleChange(e.target.value,i)}
          onKeyDown={e=>handleKeyDown(e,i)} onPaste={handlePaste}
          className={`otp-box ${value[i]?'filled':''}`} autoComplete="one-time-code"/>
      ))}
    </div>
  );
}
