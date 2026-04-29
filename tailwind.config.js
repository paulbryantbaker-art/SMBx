/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        /* ═══════════════════════════════════════════════════════════════
           COWORK DESIGN LANGUAGE — modeled on claude.com/product/cowork.
           Warm cream neutrals + Clay accent + earth-tone palette.
           Legacy NAMES (terra, cream, primary, surface, ink) retained
           as aliases that resolve to Cowork values — existing components
           get the new look without a sweep.
           ═══════════════════════════════════════════════════════════════ */

        /* Warm neutrals — Anthropic gray swatches */
        gray: {
          50:  '#faf9f5',
          100: '#f5f4ed',
          150: '#f0eee6',
          200: '#e8e6dc',
          250: '#dedcd1',
          300: '#d1cfc5',
          400: '#b0aea5',
          500: '#87867f',
          600: '#5e5d59',
          700: '#3d3d3a',
          800: '#262624',
          850: '#1f1e1d',
          900: '#1a1918',
          950: '#141413',
        },

        /* V17 terra — the sacred accent, six uses per page. */
        terra: {
          DEFAULT: '#D4714E',
          hover: '#B85A3A',
          soft: 'rgba(212,113,78,0.12)',
          glow: 'rgba(212,113,78,0.22)',
        },
        /* Legacy 'clay' kept as alias for back-compat. */
        clay: {
          DEFAULT: '#D4714E',
          interactive: '#B85A3A',
          soft: 'rgba(212,113,78,0.12)',
          glow: 'rgba(212,113,78,0.22)',
        },
        /* V17 named surfaces + ink */
        canvas: {
          warm: '#F4EEE3',
          deep: '#1A1814',
          cream: '#FAF6EE',
        },
        ink: {
          primary: '#1A1814',
          secondary: '#4A4438',
          tertiary: '#8A8275',
          inverse: '#F4EEE3',
        },

        /* Earth-tone palette — for badges, tags, charts, categorization */
        cactus:  '#bcd1ca',
        mineral: '#629987',
        olive:   '#788c5d',
        oat:     '#e3dacc',
        peach:   '#ebc9b7',
        coral:   '#ebcece',
        fig:     '#c46686',
        plum:    '#827dbd',
        heather: '#cbcadb',
        sky:     '#6a9bcc',

        /* ─── Legacy name aliases — resolve to Cowork values.
               Keep so existing components don't need a line-by-line sweep. ─── */
        ink: '#1a1918',
        terra: {
          DEFAULT: '#D4714E',
          hover: '#B85A3A',
          soft: 'rgba(212,113,78,0.12)',
          glow: 'rgba(212,113,78,0.22)',
        },
        cream: {
          DEFAULT: '#f0eee6',
          deep: '#e8e6dc',
          dark: '#dedcd1',
          hover: '#d1cfc5',
        },
        border: 'rgba(26,25,24,0.08)',
        text: {
          DEFAULT: '#1a1918',
          primary: '#1a1918',
          mid: '#5e5d59',
          secondary: '#3d3d3a',
          tertiary: '#5e5d59',
          muted: '#87867f',
          faint: '#b0aea5',
        },

        /* Material Design 3 slot names — remapped from pink-rose to Cowork
           so any component still referencing `bg-primary` / `text-on-primary`
           gets the new palette. Most of these should be phased out over time. */
        primary: '#D4714E',
        'primary-container': '#fae0d2',
        'primary-fixed': '#fdf3ee',
        'primary-fixed-dim': '#f4c0a4',
        secondary: '#5e5d59',
        'secondary-container': '#e8e6dc',
        'secondary-fixed': '#e8e6dc',
        'secondary-fixed-dim': '#d1cfc5',
        tertiary: '#629987',
        'tertiary-container': '#bcd1ca',
        'tertiary-fixed': '#bcd1ca',
        'tertiary-fixed-dim': '#9cbaac',
        error: '#b53333',
        'error-container': '#f0d4d4',

        background: '#faf9f5',
        surface: '#faf9f5',
        'surface-bright': '#ffffff',
        'surface-dim': '#f0eee6',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#faf9f5',
        'surface-container': '#f5f4ed',
        'surface-container-high': '#f0eee6',
        'surface-container-highest': '#e8e6dc',
        'surface-variant': '#e8e6dc',
        'surface-tint': '#D4714E',

        'inverse-surface': '#1f1e1d',
        'inverse-on-surface': '#f5f4ed',
        'inverse-primary': '#ec9d78',

        'on-surface': '#1a1918',
        'on-surface-variant': '#3d3d3a',
        'on-background': '#1a1918',
        'on-primary': '#ffffff',
        'on-primary-container': '#3b1a10',
        'on-primary-fixed': '#3b1a10',
        'on-primary-fixed-variant': '#8a3d23',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#1a1918',
        'on-secondary-fixed': '#1a1918',
        'on-secondary-fixed-variant': '#3d3d3a',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#1f3329',
        'on-tertiary-fixed': '#1f3329',
        'on-tertiary-fixed-variant': '#3a5a4b',
        'on-error': '#ffffff',
        'on-error-container': '#7a1e1e',

        outline: '#87867f',
        'outline-variant': '#dedcd1',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '4xl': '34px',
      },
      fontFamily: {
        /* V17 typography. Display = Sora ExtraBold (800). Body = Inter.
           Instrument Serif kept for rare editorial flourishes. */
        display: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        headline: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        handwritten: ['Caveat', 'cursive'],
        mono: ['JetBrains Mono', 'GT America Mono', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        site: '1200px',
        'chat-card': '768px',
      },
      boxShadow: {
        'warm-xs': '0 1px 2px rgba(26,25,24,0.04)',
        'warm-sm': '0 1px 3px rgba(26,25,24,0.05)',
        'warm-md': '0 2px 8px rgba(26,25,24,0.06), 0 1px 2px rgba(26,25,24,0.04)',
        'warm-lg': '0 8px 24px rgba(26,25,24,0.08), 0 2px 4px rgba(26,25,24,0.04)',
        'warm-xl': '0 16px 48px rgba(26,25,24,0.10), 0 4px 8px rgba(26,25,24,0.05)',
        'clay-sm': '0 1px 3px rgba(212,113,78,0.15)',
        'clay-md': '0 2px 12px rgba(212,113,78,0.25)',
        'clay-lg': '0 4px 20px rgba(212,113,78,0.35)',
      },
      letterSpacing: {
        'tight-1': '-0.01em',
        'tight-2': '-0.02em',
        'tight-3': '-0.03em',
      },
    },
  },
  plugins: [],
};
