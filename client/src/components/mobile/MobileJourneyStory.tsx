/**
 * MobileJourneyStory — mobile-native layout primitive for journey pages.
 *
 * Replaces the desktop-first Below editorial with a vertically-rhythmed
 * layout that feels right on a 6" screen. Uses Fibonacci-inspired
 * proportional heights — each section's visual weight decreases as the
 * user scrolls, so the hero anchors, the story breathes, and the CTA
 * closes. Nothing is uniform-height. The varied cadence is the mobile
 * equivalent of editorial newspaper flow.
 *
 * The primitive is content-agnostic. Each journey passes its own
 * protagonist, KPIs, interactive slot, and CTA wiring. Content depth
 * stays equivalent to the desktop editorial — no SEO loss — the layout
 * just reads vertically instead of via desktop grids.
 *
 * Proportional section weight (Fibonacci-ish):
 *   1. Hero            — 1.618  (biggest visual anchor)
 *   2. Interactive     — 1.000  (first tactile surface)
 *   3. Story           — 0.618  (character + narrative arc)
 *   4. Proof KPIs      — 0.382  (3 tile strip)
 *   5. Second section  — 0.382  (secondary demo or branded term card)
 *   6. Takeaway        — 0.236  (bold closing line)
 *   7. Sticky CTA      — 0.146  (always-visible, bottom)
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { motion as motionTokens } from '../content/tokens';

const MOBILE_REVEAL = motionTokens.reveal.mobileSection;

export type JourneyKey = 'sell' | 'buy' | 'raise' | 'pmi' | 'brand';

const JOURNEY_ACCENTS: Record<JourneyKey, { light: string; dark: string }> = {
  sell:  { light: '#D44A78', dark: '#E8709A' },
  buy:   { light: '#3E8E8E', dark: '#52A8A8' },
  raise: { light: '#C99A3E', dark: '#DDB25E' },
  pmi:   { light: '#8F4A7A', dark: '#AE6D9A' },
  brand: { light: '#D44A78', dark: '#E8709A' },
};

export interface CharacterStory {
  name: string;           // "Sarah V."
  role: string;           // "Partner, boutique M&A advisory"
  body: ReactNode;        // Running paragraph with <strong> for emphasis
  outcome: string;        // "$154.8M close · $2.7M fee"
}

export interface ProofKpi {
  value: string;          // "$155M"
  label: string;          // "defensible Baseline"
}

interface Props {
  dark: boolean;
  journey: JourneyKey;

  // HERO (1.618 weight)
  eyebrow: string;
  headline: ReactNode;
  sub: ReactNode;
  callout?: ReactNode;

  // INTERACTIVE 1 (1.000) — first tactile surface, e.g. BaselineCalculator
  primaryInteractive?: ReactNode;
  primaryInteractiveLabel?: string;

  // STORY (0.618)
  story?: CharacterStory;

  // PROOF (0.382)
  kpis?: ProofKpi[];

  // INTERACTIVE 2 / SECONDARY (0.382) — e.g. BrandedTermCard or second demo
  secondary?: ReactNode;
  secondaryLabel?: string;

  // TAKEAWAY (0.236)
  takeaway?: ReactNode;

  // CTA (0.146) — optional; pages can omit when other CTAs (e.g. embedded
  // panels, the global chat starter pill) already cover the conversion paths.
  ctaLabel?: string;
  ctaSub?: string;
  onCTA?: () => void;

  /**
   * Escape hatch: additional sections rendered between `secondary` and
   * `takeaway`. Use this to add page-specific content (extra interactives,
   * term cards, compact comparisons, workflow chains) without forcing the
   * primitive to know about every section shape. Each section inside
   * `children` should manage its own vertical padding to preserve the
   * Fibonacci rhythm (~14–22px top/bottom per section).
   */
  children?: ReactNode;
}

export function MobileJourneyStory({
  dark, journey,
  eyebrow, headline, sub, callout,
  primaryInteractive, primaryInteractiveLabel,
  story,
  kpis,
  secondary, secondaryLabel,
  takeaway,
  ctaLabel, ctaSub, onCTA,
  children,
}: Props) {
  const accent = dark ? JOURNEY_ACCENTS[journey].dark : JOURNEY_ACCENTS[journey].light;
  const accentSoft = dark
    ? `${JOURNEY_ACCENTS[journey].dark}1A`
    : `${JOURNEY_ACCENTS[journey].light}14`;
  const accentBorder = dark
    ? `${JOURNEY_ACCENTS[journey].dark}33`
    : `${JOURNEY_ACCENTS[journey].light}29`;

  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';

  return (
    <div style={{ paddingBottom: 120 /* clear sticky CTA */ }}>
      {/* ─── 1. HERO (1.618) — anchor ─── */}
      <section style={{ padding: '38px 22px 36px' }}>
        {/* Apple Glass eyebrow pill — backdrop-filter blur + saturate.
            Flat accentSoft was the Android fallback already; now iOS gets
            the translucent material that was promised by "Apple Glass". */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 11px',
            borderRadius: 999,
            background: accentSoft,
            border: `1px solid ${accentBorder}`,
            backdropFilter: 'blur(10px) saturate(150%)',
            WebkitBackdropFilter: 'blur(10px) saturate(150%)',
            marginBottom: 22,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} aria-hidden />
          <span
            style={{
              fontFamily: 'Sora, system-ui',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: accent,
            }}
          >
            {eyebrow}
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: 'Sora, system-ui',
            fontSize: 'clamp(34px, 9vw, 46px)',
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            color: headingC,
            marginBottom: 16,
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, system-ui',
            fontSize: 'clamp(15px, 4vw, 17px)',
            lineHeight: 1.55,
            color: bodyC,
            fontWeight: 500,
            marginBottom: callout ? 20 : 0,
          }}
        >
          {sub}
        </p>

        {callout && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: accentSoft,
              border: `1px solid ${accentBorder}`,
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
      </section>

      <SoftDivider accent={accent} />

      {/* ─── 2. INTERACTIVE 1 (1.000) — first tactile surface ─── */}
      {primaryInteractive && (
        <motion.section style={{ padding: '24px 16px 28px' }} {...MOBILE_REVEAL}>
          {primaryInteractiveLabel && (
            <div
              style={{
                padding: '0 6px',
                marginBottom: 12,
                fontFamily: 'Sora, system-ui',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              {primaryInteractiveLabel}
            </div>
          )}
          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${borderC}`,
              background: cardBg,
              overflow: 'hidden',
            }}
          >
            {primaryInteractive}
          </div>
        </motion.section>
      )}

      {/* ─── 3. STORY (0.618) — character + outcome ─── */}
      {story && (
        <motion.section style={{ padding: '22px 22px 22px' }} {...MOBILE_REVEAL}>
          <div
            style={{
              display: 'inline-flex',
              padding: '3px 10px',
              borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)',
              fontFamily: 'Sora, system-ui',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: mutedC,
              marginBottom: 14,
            }}
          >
            The story
          </div>

          <div
            style={{
              fontFamily: 'Sora, system-ui',
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '-0.015em',
              color: headingC,
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
            {story.name}
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 12,
              color: mutedC,
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            {story.role}
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: 'Inter, system-ui',
              fontSize: 'clamp(14px, 3.8vw, 16px)',
              lineHeight: 1.65,
              color: bodyC,
            }}
          >
            {story.body}
          </p>

          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              borderRadius: 12,
              border: `1px solid ${accentBorder}`,
              background: accentSoft,
              fontFamily: 'Inter, system-ui',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden
              style={{ fontSize: 18, color: accent, fontVariationSettings: "'FILL' 1" }}
            >
              trending_up
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: headingC,
                letterSpacing: '-0.005em',
              }}
            >
              {story.outcome}
            </span>
          </div>
        </motion.section>
      )}

      {/* ─── 4. PROOF KPIs (0.382) — 3 tile strip ─── */}
      {kpis && kpis.length > 0 && (
        <motion.section style={{ padding: '14px 22px 20px' }} {...MOBILE_REVEAL}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(kpis.length, 3)}, 1fr)`,
              gap: 10,
            }}
          >
            {kpis.slice(0, 3).map((kpi, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 12px 12px',
                  borderRadius: 12,
                  background: cardBg,
                  border: `1px solid ${borderC}`,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Sora, system-ui',
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: i === kpis.length - 1 ? accent : headingC,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {kpi.value}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, system-ui',
                    fontSize: 11,
                    color: mutedC,
                    fontWeight: 500,
                    lineHeight: 1.35,
                  }}
                >
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ─── 5. SECONDARY (0.382) — second demo or branded term card ─── */}
      {secondary && (
        <motion.section style={{ padding: '16px 16px 22px' }} {...MOBILE_REVEAL}>
          {secondaryLabel && (
            <div
              style={{
                padding: '0 6px',
                marginBottom: 10,
                fontFamily: 'Sora, system-ui',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              {secondaryLabel}
            </div>
          )}
          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${borderC}`,
              background: cardBg,
              overflow: 'hidden',
            }}
          >
            {secondary}
          </div>
        </motion.section>
      )}

      {/* ─── 5b. EXTRA SECTIONS — page-specific content composed via children ─── */}
      {children}

      {/* ─── 6. TAKEAWAY (0.236) — closing line ─── */}
      {takeaway && (
        <motion.section style={{ padding: '14px 22px 32px' }} {...MOBILE_REVEAL}>
          <p
            style={{
              margin: 0,
              fontFamily: 'Sora, system-ui',
              fontSize: 'clamp(17px, 4.5vw, 19px)',
              fontWeight: 800,
              letterSpacing: '-0.015em',
              lineHeight: 1.3,
              color: headingC,
              borderLeft: `3px solid ${accent}`,
              paddingLeft: 14,
            }}
          >
            {takeaway}
          </p>
        </motion.section>
      )}

      {/* ─── 7. CTA (0.146) — sticky · optional ───
          Apple Glass material: translucent bg + backdrop-blur + saturate.
          Gradient fade stays as a safe fallback on browsers without
          backdrop-filter support. The top 1px line anchors it visually. */}
      {ctaLabel && onCTA && (
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 16px calc(env(safe-area-inset-bottom) + 14px)',
          background: dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          borderTop: `1px solid ${borderC}`,
          zIndex: 5,
        }}
      >
        <button
          onClick={onCTA}
          type="button"
          style={{
            width: '100%',
            padding: '15px 18px',
            borderRadius: 999,
            border: 'none',
            background: accent,
            color: '#ffffff',
            fontFamily: 'Inter, system-ui',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: `0 10px 28px -6px ${accent}66`,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {ctaLabel}
          <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </button>
        {ctaSub && (
          <p
            style={{
              margin: '8px 0 0',
              textAlign: 'center',
              fontFamily: 'Inter, system-ui',
              fontSize: 11,
              color: mutedC,
              fontWeight: 500,
            }}
          >
            {ctaSub}
          </p>
        )}
      </div>
      )}
    </div>
  );
}

function SoftDivider({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        margin: '0 22px',
        background: `linear-gradient(to right, ${accent}33, transparent)`,
      }}
    />
  );
}

export default MobileJourneyStory;
