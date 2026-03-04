/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#F1F5F9',
          text: {
            primary: '#0F172A',
            secondary: '#64748B',
            muted: '#94A3B8',
          },
          accent: {
            DEFAULT: '#10B981',
            hover: '#059669',
            soft: 'rgba(16, 185, 129, 0.05)',
          },
          button: {
            primary: '#0F172A',
            hover: '#1E293B',
          }
        }
      },
      borderRadius: {
        'auth-card': '2.5rem',
        'auth-input': '1rem',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}