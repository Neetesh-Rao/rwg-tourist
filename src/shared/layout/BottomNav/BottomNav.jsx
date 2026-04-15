// ── BottomNav ────────────────────────────────────────────
import React from'react';
import{NavLink}from'react-router-dom';
import{LayoutDashboard,Compass,Calendar,Wallet,User}from'lucide-react';

const TABS=[{to:'/dashboard',Icon:LayoutDashboard,label:'Home'},{to:'/book',Icon:Compass,label:'Book'},{to:'/bookings',Icon:Calendar,label:'Trips'},{to:'/wallet',Icon:Wallet,label:'Wallet'},{to:'/profile',Icon:User,label:'Profile'}];

export function BottomNav(){
  return(
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-[var(--surface)]/95 backdrop-blur-2xl border-t border-[var(--border)] safe-bottom">
      <div className="flex items-stretch h-16">
        {TABS.map(({to,Icon,label})=>(
          <NavLink key={to} to={to} className={({isActive})=>`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${isActive?'text-brand-500':'text-ink-400 dark:text-ink-600'}`}>
            {({isActive})=>(
              <>
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isActive?'bg-brand-50 dark:bg-brand-900/20':''}`}>
                  <Icon className={`${isActive?'w-5 h-5':'w-4.5 h-4.5'} transition-all`}/>
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
