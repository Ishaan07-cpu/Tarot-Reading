/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tarot: {
          950: '#07050d',
          900: '#0e0b1b',
          850: '#151128',
          800: '#1e183a',
          700: '#2b2353',
          600: '#43377f',
          500: '#6351b5',
          gold: {
            300: '#fde68a',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          },
          amber: '#f59e0b',
          purple: '#a855f7',
          mystic: '#9333ea',
        },
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
        'card-hover': '0 10px 30px -10px rgba(147, 51, 234, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
