import type { Config } from 'tailwindcss';

export default {
  content: ['./client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F5F0',
        terra: '#DA7756',
        charcoal: '#1A1A18',
        sidebar: '#F0EDE6',
        hover: '#E8E4DC',
      },
      fontFamily: {
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
