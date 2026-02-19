/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F5F0',
          dark: '#F0EDE6',
          hover: '#E8E4DC',
        },
        sidebar: '#F0EDE6',
        terra: {
          DEFAULT: '#DA7756',
          hover: '#C4684A',
        },
        border: '#E8E4DC',
        text: {
          primary: '#1A1A18',
          secondary: '#6B6963',
          tertiary: '#9B9891',
        },
      },
    },
  },
  plugins: [],
};
