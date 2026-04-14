/**
 * MobileJourneyStory — mobile-native vertical storytelling for journey pages.
 *
 * Layout rhythm follows a golden-ratio / Fibonacci cadence: each section's
 * weight decreases as you scroll — hero anchors, story breathes, interactive
 * invites, proof lands, CTA closes. Nothing is uniform-height. The varied
 * block cadence is the mobile equivalent of editorial newspaper flow.
 *
 * Each of the 7 mobile journey pages wraps this component, passing per-page
 * content. Journey color threads through every accent.
 *
 * Order:
 *   1. Hero (biggest block)          — 89 units — eyebrow + headline + sub + callout
 *   2. Character story (medium)       — 55 units — named protagonist + outcome
 *   3. Proof KPIs (short)             — 34 units — 3-tile horizontal strip
 *   4. Interactive slot (optional)    — 34 units — touch-tuned demo
 *   5. Takeaway / transition          — 21 units — one sentence, bold
 *   6. Sticky CTA                     — 13 units — always-visible, bottom
 */

import { type ReactNode } from 'react';

export type JourneyKey = 'sell' | 'buy' | 'raise' | 'pmi' | 'brand';

const JOURNEY_ACCENTS: Record<JourneyKey, { light: string; dark: string }> = {
  sell:  { light: '#D44A78', dark: '#E8709A' },
  buy:   { light: '#3E8E8E', dark: '#52A8A8' },
  raise: { light: '#C99A3E', dark: '#DDB25E' },
  pmi:   { light: '#8F4A7A', dark: '#AE6D9A' },
  brand: { light: '#D44A78', dark: '#E8709A' },
};

export interface CharacterStory {
  /** "Sarah V." */
  name: string;
  /** "Partner, boutique M&A advisory" */
  role: string;
  /** Running paragraph — 2-4 sentences max. Uses <strong> for emphasis. */
  body: ReactNode;
  /** Outcome metric — e.g. "$154.8M close" */
  outcome: string;
}

export interface ProofKpi {
  /** "$155M" */
  value: string;
  /** "defensible Baseline" */
  label: string;
}

interface Props {
  dark: boolean;
  /** Drives accent color across the whole page. */
  journey: JourneyKey;

  // HERO
  eyebrow: string;                   // "Sell"
  headline: ReactNode;               // Large hook with <em className="not-italic"> for accent
  sub: ReactNode;                    // 1-2 sentences
  callout?: ReactNode;               // Numeric/KPI strip — optional

  // STORY
  story?: CharacterStory;

  // PROOF
  kpis?: ProofKpi[];                 // Ideally 3 items

  // INTERACTIVE
  interactive?: ReactNode;           // Touch-tuned demo, optional
  interactiveLabel?: string;         // "Try it"

  // TAKEAWAY
  takeaway?: ReactNode;              // Bold one-liner that closes the story

  // CTA
  ctaLabel: string;                  // "Run a Baseline"
  ctaSub?: string;                   // Small reassurance under the button
  onCTA: () => void;
}

export function MobileJourneyStory({
  dark, journey,
  eyebrow, headline, sub, callout,
  story, kpis, interactive, interactiveLabel,
  takeaway,
  ctaLabel, ctaSub, onCTA,
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
      {/* ═════════════════ 1. HERO (89) — anchoring block ═════════════════ */}
      <section
        style={{
          padding: '38px 22px 36px',
          position: 'relative',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 11px',
            borderRadius: 999,
            background: accentSoft,
            border: `1px solid ${accentBorder}`,
            marginBottom: 22,
          }}
        >
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: accent,
            }}
            aria-hidden
          />
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
            fontSize: 16,
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

      {/* Soft divider — journey-colored hairline, acts as visual rhythm marker */}
      <div
        aria-hidden
        style={{
          height: 1,
          margin: '0 22px',
          background: `linear-gradient(to right, ${accent}33, transparent)`,
        }}
      />

      {/* ═════════════════ 2. STORY (55) — character proof ═════════════════ */}
      {story && (
        <section style={{ padding: '30px 22px 26px' }}>
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
              fontSize: 15,
              lineHeight: 1.65,
              color: bodyC,
            }}
          >
            {story.body}
          </p>

          {/* Outcome ribbon — journey color */}
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
              style={{ fontSize: 18, color: accent, fontVariationSettings: "'FILL' 1" }}
              aria-hidden
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
        </section>
      )}

      {/* ═════════════════ 3. PROOF KPIs (34) — 3-tile strip ═════════════════ */}
      {kpis && kpis.length > 0 && (
        <section style={{ padding: '18px 22px 22px' }}>
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
        </section>
      )}

      {/* ═════════════════ 4. INTERACTIVE (34) — optional demo ═════════════════ */}
      {interactive && (
        <section style={{ padding: '22px 22px 24px' }}>
          {interactiveLabel && (
            <div
              style={{
                fontFamily: 'Sora, system-ui',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accent,
                marginBottom: 12,
              }}
            >
              {interactiveLabel}
            </div>
          )}
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${borderC}`,
              background: cardBg,
              overflow: 'hidden',
            }}
          >
            {interactive}
          </div>
        </section>
      )}

      {/* ═════════════════ 5. TAKEAWAY (21) — closing bold line ═════════════════ */}
      {takeaway && (
        <section style={{ padding: '12px 22px 30px' }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'Sora, system-ui',
              fontSize: 18,
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
        </section>
      )}

      {/* ═════════════════ 6. CTA (13) — sticky bottom ═════════════════ */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px calc(env(safe-area-inset-bottom) + 14px)',
          background: dark
            ? 'linear-gradient(to top, #151617 70%, rgba(21,22,23,0))'
            : 'linear-gradient(to top, #ffffff 70%, rgba(255,255,255,0))',
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
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18 }}
            aria-hidden
          >
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
    </div>
  );
}

export default MobileJourneyStory;
