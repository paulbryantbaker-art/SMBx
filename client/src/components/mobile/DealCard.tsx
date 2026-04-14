/**
 * DealCard — mobile Apple-Wallet-style card for a single deal.
 *
 * Mobile home shows a <DealStack> of these; tap a card to open its
 * scoped chat with Yulia. Designed for glanceable monitoring on the go:
 * company name, stage, status dot, one metric, days-since-activity,
 * and a one-line next-action nudge.
 *
 * Not for desktop — desktop uses the Pipeline canvas + chat column.
 */

import { forwardRef, type CSSProperties } from 'react';

/* ═══ COLOR + LABEL MAPS ═══ */

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#D44A78',
  buy: '#4E8FD4',
  raise: '#6B8F4E',
  pmi: '#8F6BD4',
};

const JOURNEY_LABEL: Record<string, string> = {
  sell: 'Sell',
  buy: 'Buy',
  raise: 'Raise',
  pmi: 'PMI',
};

const GATE_LABEL: Record<string, string> = {
  S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Matching', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due Diligence', B4: 'Structuring', B5: 'Closing',
  R0: 'Intake', R1: 'Package', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day 0', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

/* ═══ URGENCY ═══ */

export type Urgency = 'on-track' | 'needs-you' | 'stuck';

const URGENCY_COLOR: Record<Urgency, string> = {
  'on-track': '#4AB364',  // green
  'needs-you': '#E8A84E', // amber
  'stuck': '#D44A4A',     // red
};

const URGENCY_LABEL: Record<Urgency, string> = {
  'on-track': 'On track',
  'needs-you': 'Needs you',
  'stuck': 'Stuck',
};

/* ═══ DERIVATIONS ═══ */

export function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24)));
}

/** Derive urgency from activity recency + gate. Cheap heuristic for MVP. */
export function deriveUrgency(deal: DealCardData): Urgency {
  const stale = daysSince(deal.updated_at);
  if (stale >= 14) return 'stuck';
  if (stale >= 5) return 'needs-you';
  return 'on-track';
}

/**
 * Generate a one-line action nudge from deal state. Yulia-voice: action verbs
 * first, concrete next step, under 60 chars. Staleness escalation overrides
 * stage-specific copy when the deal has gone quiet.
 */
export function deriveNextAction(deal: DealCardData): string {
  const g = deal.current_gate || '';
  const stale = daysSince(deal.updated_at);

  // Staleness escalation — dominant signal when a deal has been quiet
  if (stale >= 21) return `Pick up where you left off — ${stale} days quiet`;
  if (stale >= 14) return `${stale} days quiet — Yulia is ready when you are`;

  // SELL journey
  if (g === 'S0') return 'Tell Yulia about the business to start';
  if (g === 'S1') return 'Upload a P&L or tax return';
  if (g === 'S2') return 'Your ValueLens range is ready — open it';
  if (g === 'S3') return 'CIM draft is waiting for your review';
  if (g === 'S4') return 'Matched buyers are in motion';
  if (g === 'S5') return 'Closing docs are queued';

  // BUY journey
  if (g === 'B0') return 'Sharpen your acquisition thesis';
  if (g === 'B1') return 'New candidates surfaced — review them';
  if (g === 'B2') return 'Valuation in progress';
  if (g === 'B3') return 'Due diligence items need your attention';
  if (g === 'B4') return 'Structure the LOI with Yulia';
  if (g === 'B5') return 'Closing docs are queued';

  // RAISE journey
  if (g === 'R0') return 'Tell Yulia what you\u2019re raising';
  if (g === 'R1') return 'Financial package is taking shape';
  if (g === 'R2') return 'Investor materials ready to review';
  if (g === 'R3') return 'LP outreach is live';
  if (g === 'R4') return 'Term sheet negotiations active';
  if (g === 'R5') return 'Closing docs are queued';

  // PMI journey
  if (g === 'PMI0') return 'Day\u00a00 checklist is open';
  if (g === 'PMI1') return 'Stabilization in progress';
  if (g === 'PMI2') return 'Assessment findings are ready';
  if (g === 'PMI3') return 'Optimization plan in motion';

  return 'Tap to continue with Yulia';
}

/* ═══ TYPES ═══ */

export interface DealCardData {
  id: number;
  business_name: string | null;
  journey_type: string | null;
  current_gate: string | null;
  industry: string | null;
  league: string | null;
  updated_at: string;
  status: string;
}

interface DealCardProps {
  deal: DealCardData;
  onTap?: () => void;
  onLongPress?: () => void;
  dark?: boolean;
  /** 0 = top of stack, 1 = second, 2 = third... affects scale/opacity/offset */
  stackIndex?: number;
  /** Override derived urgency if the server has computed a better one */
  urgency?: Urgency;
  /** Override derived next-action copy */
  nextAction?: string;
}

/* ═══ COMPONENT ═══ */

export const DealCard = forwardRef<HTMLButtonElement, DealCardProps>(function DealCard(
  { deal, onTap, onLongPress, dark = false, stackIndex = 0, urgency: urgencyProp, nextAction: nextActionProp },
  ref,
) {
  const journey = (deal.journey_type || 'sell').toLowerCase();
  const journeyColor = JOURNEY_COLORS[journey] || JOURNEY_COLORS.sell;
  const journeyLabel = JOURNEY_LABEL[journey] || 'Deal';
  const gateShort = deal.current_gate || '';
  const gateLabel = GATE_LABEL[gateShort] || gateShort || 'New';
  const urgency = urgencyProp ?? deriveUrgency(deal);
  const nextAction = nextActionProp ?? deriveNextAction(deal);
  const stale = daysSince(deal.updated_at);
  const business = deal.business_name || 'Untitled deal';
  const industry = deal.industry;
  const league = deal.league;

  // Stack visual offset — top card full size, cards behind shrink + fade + peek
  const stackStyle: CSSProperties = stackIndex === 0
    ? { transform: 'scale(1)', opacity: 1, zIndex: 10 }
    : {
        transform: `scale(${1 - stackIndex * 0.04}) translateY(${stackIndex * -14}px)`,
        opacity: Math.max(0.4, 1 - stackIndex * 0.18),
        zIndex: 10 - stackIndex,
      };

  const bg = dark ? '#1A1C1E' : '#FFFFFF';
  const surfaceBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const headingColor = dark ? '#F0F0F3' : '#1A1C1E';
  const mutedColor = dark ? 'rgba(240,240,243,0.55)' : 'rgba(26,28,30,0.55)';
  const fadeColor = dark ? 'rgba(240,240,243,0.35)' : 'rgba(26,28,30,0.35)';

  // Long-press detection (no external dep)
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  const startPress = () => {
    if (!onLongPress) return;
    pressTimer = setTimeout(() => onLongPress(), 500);
  };
  const endPress = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };

  return (
    <button
      ref={ref}
      onClick={onTap}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
      onTouchMove={endPress}
      type="button"
      style={{
        ...stackStyle,
        width: '100%',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        background: 'transparent',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={`${business}, ${journeyLabel}, ${gateLabel}, ${URGENCY_LABEL[urgency]}`}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background: bg,
          // Urgency-tinted outline — subtle on on-track, stronger on stuck/needs-you
          border: urgency === 'on-track'
            ? `1px solid ${surfaceBorder}`
            : `1.5px solid ${hexWithAlpha(URGENCY_COLOR[urgency], dark ? 0.45 : 0.35)}`,
          boxShadow: stackIndex === 0
            ? (urgency === 'stuck'
                ? `0 8px 28px ${hexWithAlpha(URGENCY_COLOR.stuck, 0.18)}, 0 2px 6px rgba(26,28,30,0.06)`
                : urgency === 'needs-you'
                  ? `0 8px 28px ${hexWithAlpha(URGENCY_COLOR['needs-you'], 0.16)}, 0 2px 6px rgba(26,28,30,0.06)`
                  : (dark ? '0 8px 28px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)' : '0 8px 28px rgba(26,28,30,0.10), 0 2px 6px rgba(26,28,30,0.06)'))
            : (dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(26,28,30,0.05)'),
        }}
      >
        {/* Journey color header band — Wallet-style full-bleed top */}
        <div
          style={{
            height: 56,
            background: `linear-gradient(135deg, ${journeyColor} 0%, ${mix(journeyColor, '#ffffff', 0.25)} 100%)`,
            position: 'relative',
          }}
        >
          {/* Top row: journey label + urgency dot */}
          <div style={{ position: 'absolute', inset: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              color: 'rgba(255,255,255,0.95)',
              fontFamily: 'Sora, system-ui',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {journeyLabel}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                color: 'rgba(255,255,255,0.95)',
                fontFamily: 'Inter, system-ui',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {URGENCY_LABEL[urgency]}
              </span>
              <span
                className={urgency !== 'on-track' ? 'deal-urgency-pulse' : undefined}
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: URGENCY_COLOR[urgency],
                  boxShadow: `0 0 0 2px rgba(255,255,255,0.9)`,
                  ['--pulse-color' as string]: hexWithAlpha(URGENCY_COLOR[urgency], 0.6),
                }}
              />
            </span>
          </div>
        </div>

        {/* Local keyframes for the urgency-dot pulse — scoped to this component
            via the deal-urgency-pulse class so it doesn't leak. */}
        <style>{`
          @keyframes dealUrgencyPulse {
            0%   { box-shadow: 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 0 var(--pulse-color, rgba(212,74,74,0.6)); }
            70%  { box-shadow: 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 8px rgba(0,0,0,0); }
            100% { box-shadow: 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 0 rgba(0,0,0,0); }
          }
          .deal-urgency-pulse {
            animation: dealUrgencyPulse 2s ease-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .deal-urgency-pulse { animation: none; }
          }
        `}</style>

        {/* Body */}
        <div style={{ padding: '14px 16px 16px' }}>
          {/* Business name + stage pill */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <h3 style={{
              margin: 0,
              flex: 1,
              fontFamily: 'Sora, system-ui',
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: headingColor,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {business}
            </h3>
            <span style={{
              flexShrink: 0,
              fontFamily: 'Inter, system-ui',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: journeyColor,
              background: hexWithAlpha(journeyColor, dark ? 0.18 : 0.10),
              padding: '4px 10px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
            }}>
              {gateLabel}
            </span>
          </div>

          {/* Meta row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
            fontFamily: 'Inter, system-ui',
            fontSize: 13,
            color: mutedColor,
            fontWeight: 500,
          }}>
            {industry && (
              <>
                <span>{industry}</span>
                <span style={{ color: fadeColor }}>·</span>
              </>
            )}
            {league && (
              <>
                <span style={{ textTransform: 'capitalize' }}>{league}</span>
                <span style={{ color: fadeColor }}>·</span>
              </>
            )}
            <span>{stale === 0 ? 'Today' : stale === 1 ? 'Yesterday' : `${stale}d ago`}</span>
          </div>

          {/* Next-action nudge */}
          <div style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 14,
            lineHeight: 1.4,
            color: headingColor,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={journeyColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M5 12l5 5L20 7" />
            </svg>
            <span style={{ flex: 1 }}>{nextAction}</span>
          </div>
        </div>
      </div>
    </button>
  );
});

/* ═══ UTILITIES ═══ */

/** Mix two hex colors by weight (0 = all a, 1 = all b). */
function mix(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const r = Math.round(pa.r * (1 - t) + pb.r * t);
  const g = Math.round(pa.g * (1 - t) + pb.g * t);
  const bl = Math.round(pa.b * (1 - t) + pb.b * t);
  return `rgb(${r},${g},${bl})`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function hexWithAlpha(hex: string, a: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export default DealCard;
