/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        ink: '#0D0D0D',
        terra: {
          DEFAULT: '#C96B4F',
          hover: '#B55E44',
          soft: '#FFF0EB',
          glow: 'rgba(201, 107, 79, 0.12)',
        },
        stone: 'rgba(0,0,0,0.06)',
        surface: '#FAFAFA',
        tint: '#FAFAFA',
        cream: {
          DEFAULT: '#FAFAFA',
          deep: '#F5F5F5',
          dark: '#EEEEEE',
          hover: '#E8E8E8',
        },
        border: 'rgba(0,0,0,0.06)',
        text: {
          DEFAULT: '#0D0D0D',
          primary: '#0D0D0D',
          mid: 'rgba(0,0,0,0.6)',
          secondary: 'rgba(0,0,0,0.4)',
          tertiary: 'rgba(0,0,0,0.3)',
          muted: 'rgba(0,0,0,0.4)',
          faint: 'rgba(0,0,0,0.25)',
        },
      },
      borderRadius: {
        '4xl': '34px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
        'chat-card': '768px',
      },
    },
  },
  plugins: [],
};
