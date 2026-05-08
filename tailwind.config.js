/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050D1A',
          900: '#0A1628',
          800: '#0F2040',
          700: '#1A3055',
          600: '#1E3A5F',
          500: '#254875',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          glow: '#00D4FF',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 16px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px 0 rgba(0,0,0,0.10)',
        glow: '0 0 20px rgba(0,212,255,0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06B6D4 0%, #00D4FF 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      }
    },
  },
  plugins: [],
}
