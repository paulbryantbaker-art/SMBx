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
        stone: '#E5E5E3',
        surface: '#F5F5F3',
        tint: '#F7F6F4',
        // Backward-compat for authenticated components
        cream: {
          DEFAULT: '#FAF8F4',
          deep: '#F3F0EA',
          dark: '#F0EDE6',
          hover: '#E8E4DC',
        },
        border: '#DDD9D1',
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
