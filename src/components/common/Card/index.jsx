import React from'react';
export default function Card({children,hover=false,interactive=false,selected=false,padding='p-6',className='',onClick}){
  return(
    <div role={onClick?'button':undefined} tabIndex={onClick?0:undefined} onClick={onClick}
      onKeyDown={onClick?e=>{if(e.key==='Enter')onClick();}:undefined}
      className={['card',hover?'card-hover':'',interactive?'card-active':'',selected?'card-selected':'',padding,className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
