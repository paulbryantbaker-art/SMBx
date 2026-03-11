/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A18',
        terra: {
          DEFAULT: '#D4714E',
          hover: '#C0623F',
          soft: '#FFF0EB',
          glow: 'rgba(212, 113, 78, 0.12)',
        },
        stone: '#EBEBEB',
        surface: '#FFFFFF',
        tint: '#FAFAFA',
        // Backward-compat for authenticated components
        cream: {
          DEFAULT: '#FAFAFA',
          deep: '#F5F5F5',
          dark: '#F0F0F0',
          hover: '#EBEBEB',
        },
        border: 'rgba(0,0,0,0.06)',
        text: {
          DEFAULT: '#1A1A18',
          primary: '#1A1A18',
          mid: '#3D3B37',
          secondary: '#6B6963',
          tertiary: '#9B9891',
          muted: '#6E6A63',
          faint: '#A9A49C',
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
