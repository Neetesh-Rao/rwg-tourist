/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  safelist: [
    'bg-brand-500/6',
    'bg-brand-500/8',
    'bg-brand-300/6',
    'bg-brand-900/10',
    'bg-brand-900/15',
    'bg-brand-900/20',
    'bg-brand-900/30',
    'bg-brand-50/50',
    'bg-brand-50/60',
    'text-brand-500/70',
    'text-brand-600/70',
    'text-green-500/70',
    'text-green-600/70',
    'text-white/40',
    'text-white/50',
    'shadow-glow',
    'shadow-brand-lg',
    'bg-surface-2',
    'bg-surface-3',
    'bg-surface-4',
    'dark:bg-surface-3',
    'dark:hover:bg-surface-4',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF8ED',
          100: '#FFEFD0',
          200: '#FFD899',
          300: '#FFC15E',
          400: '#FFAA26',
          500: '#F59000',
          600: '#E07200',
          700: '#BA5500',
          800: '#943F04',
          900: '#7A3507',
        },
        ink: {
          100: '#F5F4F0',
          200: '#EEEDE8',
          300: '#E2E0D9',
          400: '#9B9890',
          500: '#5C5A55',
          600: '#5C5A55',
          700: '#3A3832',
          800: '#252420',
          900: '#1A1918',
          950: '#0E0D0C',
        },
        surface: {
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FFC15E, #F59000 55%, #E07200)',
        'mesh-light':
          'radial-gradient(at 0 0, rgba(255, 193, 94, 0.16) 0, transparent 55%), radial-gradient(at 100% 0, rgba(245, 144, 0, 0.10) 0, transparent 55%), radial-gradient(at 50% 100%, rgba(186, 85, 0, 0.07) 0, transparent 55%)',
        'mesh-dark':
          'radial-gradient(at 0 0, rgba(245, 144, 0, 0.10) 0, transparent 55%), radial-gradient(at 100% 100%, rgba(255, 193, 94, 0.05) 0, transparent 55%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.06)',
        float: '0 8px 40px rgba(0, 0, 0, 0.10)',
        brand: '0 8px 32px rgba(245, 144, 0, 0.28)',
        'brand-lg': '0 16px 48px rgba(245, 144, 0, 0.38)',
        glow: '0 0 0 3px rgba(245, 144, 0, 0.15)',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 144, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245, 144, 0, 0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 5s ease-in-out infinite',
        'pulse-brand': 'pulseBrand 2.5s ease-in-out infinite',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bounce-sm': 'bounceSm 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
