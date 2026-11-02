/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.45)',
          DEFAULT: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.35)',
          dark: 'rgba(15, 23, 42, 0.65)',
          darkBorder: 'rgba(255, 255, 255, 0.1)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.35)',
        'window': '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 1px 1px rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-up': 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
