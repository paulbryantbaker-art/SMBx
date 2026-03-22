/**
 * Stitch Design System Tokens
 * Synthesized from Stitch "V11.1 Content Only" screens
 * Material Design 3 inspired palette with terracotta accent
 */

/* ─── Font ─── */
export const font = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
export const mono = "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', ui-monospace, monospace";

/* ─── Colors ─── */
export const color = {
  // Text
  text: '#1a1c1c',           // Primary text (near-black, warm)
  textSecondary: '#5c5c5c',  // Secondary text
  textMuted: '#88726c',      // Muted/outline (warm gray-brown)
  textSubtle: '#dbc1ba',     // Very light warm text

  // Accent
  accent: '#99462d',         // Terracotta (primary accent)
  accentLight: '#fd9576',    // Lighter terracotta
  accentVeryLight: '#ffdbd1',// Faintest terracotta

  // Surfaces (light → dark progression)
  bg: '#f9f9f9',             // Page background
  surface: '#f9f9f9',        // Same as bg
  surfaceLow: '#f3f3f3',     // Section alt background
  surfaceMid: '#eeeeee',     // Card hover / active states
  surfaceHigh: '#e8e8e8',    // Stronger emphasis
  surfaceHighest: '#e2e2e2', // Strongest surface
  surfaceDim: '#dadada',     // Dividers
  white: '#ffffff',          // Cards, inputs

  // Dark surfaces
  dark: '#2f3131',           // Dark section background
  darkDeep: '#1a1c1c',       // Deep dark (code blocks)

  // Borders
  border: 'rgba(0,0,0,0.06)',
  borderStrong: 'rgba(0,0,0,0.12)',

  // Semantic
  error: '#ba1a1a',
  success: '#00685d',        // Teal
  successLight: '#85f6e4',   // Light teal
} as const;

/* ─── Radius ─── */
export const radius = {
  sm: 8,
  md: 16,     // 1rem — default
  lg: 24,     // 1.5rem
  xl: 32,     // 2rem
  xxl: 48,    // 3rem
  full: 9999,
} as const;

/* ─── Shadows ─── */
export const shadow = {
  subtle: '0 10px 48px -12px rgba(26, 28, 28, 0.04)',
  card: '0 4px 12px rgba(0,0,0,0.05)',
  hover: '0 16px 32px -8px rgba(26, 28, 28, 0.08)',
} as const;

/* ─── Spacing ─── */
export const spacing = {
  sectionY: 160,     // Section vertical padding
  sectionX: 48,      // Section horizontal padding
  maxWidth: 896,     // Content max-width (prose)
  maxWidthWide: 1152,// Wide content max-width
  maxWidthFull: 1280,// Full content max-width
} as const;

/* ─── Typography Presets ─── */
export const type = {
  hero: {
    fontSize: 'clamp(40px, 5.5vw, 64px)',
    fontWeight: 800 as const,
    lineHeight: 1.08,
    letterSpacing: '-0.025em',
    color: color.text,
    fontFamily: font,
  },
  h2: {
    fontSize: 'clamp(32px, 4.5vw, 48px)',
    fontWeight: 800 as const,
    lineHeight: 1.15,
    letterSpacing: '-0.025em',
    color: color.text,
    fontFamily: font,
  },
  h3: {
    fontSize: 28,
    fontWeight: 700 as const,
    color: color.text,
    fontFamily: font,
  },
  h4: {
    fontSize: 20,
    fontWeight: 700 as const,
    color: color.text,
    fontFamily: font,
  },
  body: {
    fontSize: 18,
    color: color.textSecondary,
    lineHeight: 1.75,
    margin: 0 as const,
    fontFamily: font,
  },
  bodyLarge: {
    fontSize: 20,
    color: color.textSecondary,
    lineHeight: 1.75,
    margin: 0 as const,
    fontFamily: font,
  },
  bodyStrong: {
    fontSize: 20,
    color: color.text,
    fontWeight: 500 as const,
    lineHeight: 1.75,
    margin: 0 as const,
    fontFamily: font,
  },
  label: {
    fontSize: 14,
    fontWeight: 700 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: color.textMuted,
    fontFamily: font,
  },
  small: {
    fontSize: 15,
    color: color.textSecondary,
    lineHeight: 1.65,
    margin: 0 as const,
    fontFamily: font,
  },
  caption: {
    fontSize: 13,
    color: color.textMuted,
    lineHeight: 1.5,
    fontFamily: font,
  },
} as const;

/* ─── Section Presets ─── */
export const section = {
  default: {
    paddingTop: spacing.sectionY,
    paddingBottom: spacing.sectionY,
    paddingLeft: spacing.sectionX,
    paddingRight: spacing.sectionX,
  },
  alt: {
    paddingTop: spacing.sectionY,
    paddingBottom: spacing.sectionY,
    paddingLeft: spacing.sectionX,
    paddingRight: spacing.sectionX,
    backgroundColor: color.surfaceLow,
    borderTop: `1px solid ${color.border}`,
    borderBottom: `1px solid ${color.border}`,
  },
  dark: {
    paddingTop: spacing.sectionY,
    paddingBottom: spacing.sectionY,
    paddingLeft: spacing.sectionX,
    paddingRight: spacing.sectionX,
    backgroundColor: color.dark,
    color: '#fff',
  },
} as const;

/* ─── Card Presets ─── */
export const card = {
  default: {
    padding: 32,
    border: `1px solid ${color.border}`,
    backgroundColor: color.white,
    borderRadius: radius.md,
    transition: 'box-shadow 0.3s',
  },
  highlighted: {
    padding: 32,
    border: `2px solid ${color.text}`,
    backgroundColor: color.white,
    borderRadius: radius.md,
    transition: 'box-shadow 0.3s',
  },
  data: {
    backgroundColor: color.darkDeep,
    borderRadius: radius.md,
    padding: 40,
    fontFamily: mono,
    fontSize: 15,
    lineHeight: 1.8,
    color: '#D1D5DB',
  },
} as const;

/* ─── Button Presets ─── */
export const button = {
  primary: {
    backgroundColor: color.text,
    color: '#fff',
    fontSize: 16,
    fontWeight: 700 as const,
    padding: '18px 48px',
    borderRadius: radius.full,
    border: 'none',
    cursor: 'pointer',
    fontFamily: font,
    transition: 'opacity 0.2s',
  },
  primaryLight: {
    backgroundColor: '#fff',
    color: color.text,
    fontSize: 16,
    fontWeight: 700 as const,
    padding: '18px 48px',
    borderRadius: radius.full,
    border: 'none',
    cursor: 'pointer',
    fontFamily: font,
    transition: 'opacity 0.2s',
  },
  accent: {
    backgroundColor: color.accent,
    color: '#fff',
    fontSize: 16,
    fontWeight: 700 as const,
    padding: '18px 48px',
    borderRadius: radius.full,
    border: 'none',
    cursor: 'pointer',
    fontFamily: font,
    transition: 'opacity 0.2s',
  },
} as const;

/* ─── Hover Handlers ─── */
export const hover = {
  cardIn: (e: React.MouseEvent) => {
    e.currentTarget.style.boxShadow = shadow.hover;
  },
  cardOut: (e: React.MouseEvent) => {
    e.currentTarget.style.boxShadow = 'none';
  },
  btnIn: (e: React.MouseEvent) => {
    (e.target as HTMLElement).style.opacity = '0.85';
  },
  btnOut: (e: React.MouseEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
  },
};
