/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: { 50:'#FFF8ED',100:'#FFEFD0',200:'#FFD899',300:'#FFC15E',400:'#FFAA26',500:'#F59000',600:'#E07200',700:'#BA5500',800:'#943F04',900:'#7A3507' },
        ink:   { 50:'#FAFAF8',100:'#F5F4F0',200:'#EEEDE8',300:'#E2E0D9',400:'#9B9890',500:'#6E6B62',600:'#5C5A55',700:'#3A3832',800:'#252420',900:'#1A1918',950:'#0E0D0C' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg,#FFC15E 0%,#F59000 55%,#E07200 100%)',
        'mesh-light': 'radial-gradient(at 0% 0%,rgba(255,193,94,.16) 0,transparent 55%),radial-gradient(at 100% 0%,rgba(245,144,0,.10) 0,transparent 55%),radial-gradient(at 50% 100%,rgba(186,85,0,.07) 0,transparent 55%)',
        'mesh-dark':  'radial-gradient(at 0% 0%,rgba(245,144,0,.10) 0,transparent 55%),radial-gradient(at 100% 100%,rgba(255,193,94,.05) 0,transparent 55%)',
      },
      boxShadow: {
        'brand':    '0 8px 32px rgba(245,144,0,.28)',
        'brand-lg': '0 16px 48px rgba(245,144,0,.38)',
        'card':     '0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.06)',
        'card-dark':'0 1px 3px rgba(0,0,0,.3),0 4px 16px rgba(0,0,0,.25)',
        'float':    '0 8px 40px rgba(0,0,0,.10)',
        'float-dark':'0 8px 40px rgba(0,0,0,.45)',
      },
      animation: {
        'fade-up':    'fadeUp .55s cubic-bezier(.16,1,.3,1) both',
        'fade-in':    'fadeIn .4s ease both',
        'scale-in':   'scaleIn .35s cubic-bezier(.34,1.56,.64,1) both',
        'slide-down': 'slideDown .4s cubic-bezier(.16,1,.3,1) both',
        'float':      'float 5s ease-in-out infinite',
        'pulse-brand':'pulseBrand 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s linear infinite',
        'spin-slow':  'spin 3s linear infinite',
        'marquee':    'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp:     {'0%':{opacity:'0',transform:'translateY(20px)'},'100%':{opacity:'1',transform:'translateY(0)'}},
        fadeIn:     {'0%':{opacity:'0'},'100%':{opacity:'1'}},
        scaleIn:    {'0%':{opacity:'0',transform:'scale(.9)'},'100%':{opacity:'1',transform:'scale(1)'}},
        slideDown:  {'0%':{opacity:'0',transform:'translateY(-10px)'},'100%':{opacity:'1',transform:'translateY(0)'}},
        float:      {'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-10px)'}},
        pulseBrand: {'0%,100%':{boxShadow:'0 0 0 0 rgba(245,144,0,.4)'},'50%':{boxShadow:'0 0 0 12px rgba(245,144,0,0)'}},
        shimmer:    {'0%':{backgroundPosition:'-200% 0'},'100%':{backgroundPosition:'200% 0'}},
        marquee:    {'0%':{transform:'translateX(0)'},'100%':{transform:'translateX(-50%)'}},
      },
    },
  },
  plugins: [],
};
