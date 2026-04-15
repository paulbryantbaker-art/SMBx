/**
 * Design tokens — canonical source for smbx.ai journey pages.
 *
 * Aesthetic targets (from CLAUDE.md):
 *  - Desktop: Grok + Canva (AI-chat restraint + creative canvas confidence)
 *  - Mobile:  Grok + Apple Glass (AI-chat restraint + iOS glass materials)
 *
 * Typography: Sora for headlines (800–900, tight tracking),
 *             Inter for body (400–600, comfortable leading).
 *
 * Accent:     pink is punctuation, not wallpaper. Reserved for eyebrows,
 *             key metrics, interactive elements. Neutrals do the rest.
 */

/* ─── Palette ───
   Single accent with light/dark variants. Neutrals are warm enough to
   feel human but cool enough to not compete with the pink. */
export const palette = {
  // Brand accent (single color, two theme values)
  pinkLight: '#D44A78',
  pinkDark:  '#E8709A',
  pinkHover: '#B03860',

  // Journey accents (per-page override — pass as `accent` prop)
  buyTeal:    '#3E8E8E',
  buyTealDark:'#52A8A8',
  raiseGold:  '#C99A3E',
  raiseGoldDark: '#DDB25E',
  pmiPlum:    '#8F4A7A',
  pmiPlumDark:'#AE6D9A',

  // Neutrals (light theme)
  ink:        '#0f1012',  // strongest text
  inkSoft:    '#1a1c1e',  // card bg dark-mode / alt text
  body:       '#3c3d40',  // primary body text light-mode
  muted:      '#6e6a63',  // secondary text light-mode
  hairline:   'rgba(15,16,18,0.08)',  // card borders light-mode
  rule:       'rgba(15,16,18,0.06)',  // internal rules light-mode
  pageLight:  '#F9F9FC',  // page bg light-mode
  cardLight:  '#ffffff',  // card bg light-mode
  altLight:   '#f4f4f7',  // alt section bg light-mode (info → info alt)

  // Neutrals (dark theme)
  pageDark:   '#1A1C1E',  // page bg dark-mode
  cardDark:   '#1a1c1e',  // card bg dark-mode (same as page — flat)
  altDark:    '#151617',  // alt section bg dark-mode
  immersive:  '#0f1012',  // deepest bg — CTA / immersive sections (both themes)
  bodyDark:   'rgba(218,218,220,0.85)',
  mutedDark:  'rgba(218,218,220,0.55)',
  hairlineDark: 'rgba(255,255,255,0.08)',
  ruleDark:   'rgba(255,255,255,0.06)',
} as const;

/** Resolves accent + supporting neutrals for a theme. */
export function resolveTheme(dark: boolean, accentOverride?: string) {
  const accent = accentOverride ?? (dark ? palette.pinkDark : palette.pinkLight);
  return {
    accent,
    headingColor: dark ? '#f9f9fc' : palette.ink,
    bodyColor:    dark ? palette.bodyDark : palette.body,
    mutedColor:   dark ? palette.mutedDark : palette.muted,
    cardBg:       dark ? palette.cardDark : palette.cardLight,
    altBg:        dark ? palette.altDark : palette.altLight,
    pageBg:       dark ? palette.pageDark : palette.pageLight,
    immersiveBg:  palette.immersive,
    border:       dark ? palette.hairlineDark : palette.hairline,
    rule:         dark ? palette.ruleDark : palette.rule,
  };
}

/* ─── Typography ───
   Sora for display, Inter for body. `clamp()` on mobile body so sizes
   stay comfortable from iPhone SE to Pro Max. */
export const font = {
  display: "'Sora', system-ui, sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'SF Mono', 'Fira Code', ui-monospace, monospace",
} as const;

export const type = {
  // Headlines — compressed, confident
  hookHeadline: {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: 'clamp(2.5rem, 7vw, 5.75rem)',
    lineHeight: 0.92,
    letterSpacing: '-0.04em',
  },
  sectionHeadline: {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
    lineHeight: 1,
    letterSpacing: '-0.025em',
  },
  cardHeadline: {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: '1.75rem',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },

  // Body — Inter, comfortable leading, mobile clamp
  hookBody: {
    fontFamily: font.body,
    fontSize: 'clamp(17px, 2vw, 21px)',
    lineHeight: 1.55,
    fontWeight: 400,
  },
  sectionBody: {
    fontFamily: font.body,
    fontSize: 'clamp(16px, 1.5vw, 19px)',
    lineHeight: 1.55,
    fontWeight: 400,
  },
  body: {
    fontFamily: font.body,
    fontSize: 'clamp(14px, 3.6vw, 16px)',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  caption: {
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 400,
  },

  // Eyebrow variants — kills the monoculture
  hookEyebrow: {
    fontFamily: font.body,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
  },
  sectionEyebrow: {
    fontFamily: font.body,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
} as const;

/* ─── Spacing + rhythm ─── */
export const space = {
  sectionY: 'clamp(64px, 10vw, 128px)',
  cardP: 'clamp(20px, 3vw, 32px)',
  maxContent: 1152,
  maxProse: 896,
} as const;

/* ─── Radii ─── */
export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

/* ─── Motion ───
   Scroll-reveal choreography lives here so every primitive stays in sync.
   Intensity: apple-leaning — subtle y-translate, half-second fade, spring
   ease. Reduced-motion automatically suppressed by framer-motion. */
export const motion = {
  spring: [0.22, 1, 0.36, 1] as [number, number, number, number],
  fast: 0.18,
  base: 0.3,
  slow: 0.6,

  /* Reveal variants — import and spread on a motion.div. */
  reveal: {
    /** Whole section fades + slides up. Applied on SectionBand/SectionHeader. */
    section: {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-10%' },
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
    /** Stagger container — children reveal in sequence. */
    staggerContainer: {
      initial: 'hidden' as const,
      whileInView: 'visible' as const,
      viewport: { once: true, margin: '-10%' },
      variants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
      },
    },
    /** Child inside a stagger container. */
    item: {
      variants: {
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
        },
      },
    },
    /** Mobile-tuned reveal — shorter y-translate for smaller viewport. */
    mobileSection: {
      initial: { opacity: 0, y: 10 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-5%' },
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  },

  /* Scroll progress bar — thin top-of-viewport indicator. */
  progressBar: {
    height: 2,
    zIndex: 100,
  },
} as const;

/* ─── Materials ───
   Apple Glass on mobile. Backdrop blur + saturate. Flat fallback on
   Android (the rgba under the blur is the fallback). */
export const material = {
  glass: (dark: boolean) => ({
    background: dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(14px) saturate(180%)',
    WebkitBackdropFilter: 'blur(14px) saturate(180%)',
    border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,16,18,0.08)',
  }),
  eyebrowPill: (dark: boolean, accent: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    background: dark ? `${accent}22` : `${accent}14`,
    backdropFilter: 'blur(10px) saturate(150%)',
    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
    border: `1px solid ${accent}33`,
  }),
} as const;

/* ─── Section rhythm helper ───
   Alternating light/dark bands give journey pages the cinematic cadence
   the critique flagged as missing (Apple's move). */
export type BandTone = 'info' | 'immersive' | 'alt';
export function bandBg(tone: BandTone, dark: boolean): string {
  if (tone === 'immersive') return palette.immersive;
  if (tone === 'alt') return dark ? palette.altDark : palette.altLight;
  return dark ? palette.pageDark : palette.pageLight;
}
