/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF7E8',
          100: '#FFE9BF',
          200: '#FFD58A',
          300: '#FFC15E',
          400: '#FFAD2B',
          500: '#F59000',
          600: '#E07200',
          700: '#B85A00',
          800: '#8F4500',
          900: '#5F2D00',
        },
        ink: {
          100: '#F5F4F0',
          200: '#E2E0D9',
          300: '#C8C4B8',
          400: '#9B9890',
          500: '#5C5A55',
          600: '#4A4840',
          700: '#3A3832',
          800: '#252420',
          900: '#1A1918',
          950: '#0E0D0C',
        },
        surface: {
          2: '#F5F4F0',
          3: '#EEEDE8',
          4: '#E2E0D9',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06)',
        float: '0 8px 40px rgba(0,0,0,.10)',
        brand: '0 8px 32px rgba(245,144,0,.28)',
        'brand-lg': '0 16px 48px rgba(245,144,0,.38)',
        glow: '0 0 0 4px rgba(245,144,0,.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FFC15E 0%, #F59000 55%, #E07200 100%)',
        'mesh-light':
          'radial-gradient(circle at 20% 20%, rgba(255, 193, 94, 0.22), transparent 32%), radial-gradient(circle at 80% 0%, rgba(245, 144, 0, 0.16), transparent 28%), radial-gradient(circle at 70% 70%, rgba(245, 144, 0, 0.08), transparent 30%), linear-gradient(180deg, #FAFAF8 0%, #F5F4F0 100%)',
        'mesh-dark':
          'radial-gradient(circle at 20% 20%, rgba(255, 193, 94, 0.14), transparent 28%), radial-gradient(circle at 80% 0%, rgba(245, 144, 0, 0.12), transparent 24%), radial-gradient(circle at 70% 70%, rgba(245, 144, 0, 0.08), transparent 28%), linear-gradient(180deg, #0E0D0C 0%, #1A1918 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-brand': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.6', transform: 'scale(1.04)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'fade-up': 'fade-up 0.45s ease-out both',
        'scale-in': 'scale-in 0.22s ease-out both',
        'slide-down': 'slide-down 0.24s ease-out both',
        float: 'float 4s ease-in-out infinite',
        'pulse-brand': 'pulse-brand 2s ease-in-out infinite',
        'bounce-sm': 'bounce-sm 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
