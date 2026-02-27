/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF8F4',
          deep: '#F3F0EA',
          dark: '#F0EDE6',
          hover: '#E8E4DC',
        },
        terra: {
          DEFAULT: '#D4714E',
          hover: '#BE6342',
          soft: '#FFF0EB',
          glow: 'rgba(212, 113, 78, 0.12)',
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
      fontFamily: {
        sans: ["'Inter'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
};
