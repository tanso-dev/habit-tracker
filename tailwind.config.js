/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        lime: {
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
        },
        dark: {
          900: '#0a0a0b',
          800: '#141416',
          700: '#1e1e22',
          600: '#2a2a30',
        }
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'check': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'pop': 'pop 0.3s ease-out forwards',
        'check': 'check 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
};
