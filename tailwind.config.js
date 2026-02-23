/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF8F4',
          deep: '#F3F0EA',
          /* Legacy alias for chat app */
          dark: '#F0EDE6',
          hover: '#E8E4DC',
        },
        sidebar: '#F0EDE6',
        terra: {
          DEFAULT: '#DA7756',
          hover: '#C4684A',
          soft: '#FFF0EB',
        },
        stone: {
          DEFAULT: '#E8E4DC',
          light: '#F0EDE6',
        },
        border: '#E0DCD4',
        text: {
          DEFAULT: '#1A1A18',
          primary: '#1A1A18',
          mid: '#4A4843',
          secondary: '#6B6963',
          tertiary: '#9B9891',
          muted: '#7A766E',
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", 'Georgia', 'ui-serif', 'serif'],
        sans: ["'Instrument Sans'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
};
