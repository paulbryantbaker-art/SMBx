/**
 * MobileJourneyBracket — simplified mobile hero for journey marketing pages.
 *
 * Replaces the editorial multi-section layout on mobile with a single-screen
 * hook + one callout + sticky Talk-to-Yulia CTA. Marketing stays on mobile
 * (SEO, Google landing) but compresses to the Wallet-home aesthetic so there's
 * no visual whiplash when the user morphs from marketing → app.
 *
 * Pair with <MobileJourneySheet> as the outer Vaul shell.
 */

import { type ReactNode } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  dark: boolean;
  /** Small uppercase tag at the top, e.g., "Sell" */
  eyebrow: string;
  /** Big hook — keep under 60 chars, accent words highlighted via <em className="not-italic"> */
  headline: ReactNode;
  /** One short paragraph, 1-2 sentences max */
  sub: ReactNode;
  /** Optional: a single numeric callout strip (e.g., "$155M Baseline · 90 seconds") */
  callout?: ReactNode;
  /** Optional: illustrative icon (material-symbols name) */
  icon?: string;
}

export function MobileJourneyBracket({ dark, eyebrow, headline, sub, callout, icon }: Props) {
  const pinkC = dark ? PINK_DARK : PINK;
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const bandBg = dark ? 'rgba(232,112,154,0.06)' : 'rgba(212,74,120,0.04)';
  const bandBd = dark ? 'rgba(232,112,154,0.18)' : 'rgba(212,74,120,0.16)';

  return (
    <div style={{ padding: '32px 22px 80px' }}>
      {/* Eyebrow pill with optional icon */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{ color: pinkC, fontSize: 22, fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontFamily: 'Sora, system-ui',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: pinkC,
            background: bandBg,
            border: `1px solid ${bandBd}`,
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          {eyebrow}
        </span>
      </div>

      {/* Headline */}
      <h1
        style={{
          margin: 0,
          fontFamily: 'Sora, system-ui',
          fontSize: 'clamp(32px, 8.5vw, 44px)',
          fontWeight: 900,
          lineHeight: 1.02,
          letterSpacing: '-0.03em',
          color: headingC,
          marginBottom: 18,
        }}
      >
        {headline}
      </h1>

      {/* Sub — 1-2 sentences */}
      <p
        style={{
          margin: 0,
          fontFamily: 'Inter, system-ui',
          fontSize: 16,
          lineHeight: 1.5,
          color: bodyC,
          fontWeight: 500,
          marginBottom: callout ? 22 : 0,
          maxWidth: 520,
        }}
      >
        {sub}
      </p>

      {/* Optional callout — a single numeric/KPI strip in a rounded card */}
      {callout && (
        <div
          style={{
            marginTop: 8,
            padding: '14px 16px',
            borderRadius: 14,
            background: bandBg,
            border: `1px solid ${bandBd}`,
            fontFamily: 'Inter, system-ui',
            fontSize: 14,
            fontWeight: 600,
            color: headingC,
            lineHeight: 1.5,
          }}
        >
          {callout}
        </div>
      )}

      {/* Small reassurance line below callout */}
      <p
        style={{
          marginTop: callout ? 18 : 22,
          fontFamily: 'Inter, system-ui',
          fontSize: 12,
          color: mutedC,
          fontWeight: 500,
        }}
      >
        Tap <strong style={{ color: pinkC }}>Talk to Yulia</strong> below to start — the full guidance happens in chat, not here.
      </p>
    </div>
  );
}

export default MobileJourneyBracket;
