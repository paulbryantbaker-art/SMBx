/**
 * DealStack — the mobile home portfolio surface.
 *
 * Renders a Wallet-aesthetic vertical list of <DealCard>s sorted by
 * urgency > stage progression > recency. Top card is the hero;
 * subsequent cards scroll below. Empty state invites first deal.
 *
 * Mobile only. Desktop uses the Pipeline canvas panel.
 */

import { useMemo } from 'react';
import { DealCard, daysSince, deriveUrgency, type DealCardData, type Urgency } from './DealCard';

/* ═══ SORT WEIGHTS ═══ */

/** Urgency priority — lower number = shown first. */
const URGENCY_RANK: Record<Urgency, number> = {
  'stuck': 0,
  'needs-you': 1,
  'on-track': 2,
};

/**
 * Stage progression rank — later stages first within the same urgency band.
 * Close-to-close deals are more urgent than early-stage ones when everything
 * else is equal. S5/B5/R5 (closing) → highest. Sourcing/intake → lowest.
 */
const GATE_RANK: Record<string, number> = {
  // Sell journey
  S5: 0, S4: 1, S3: 2, S2: 3, S1: 4, S0: 5,
  // Buy journey
  B5: 0, B4: 1, B3: 2, B2: 3, B1: 4, B0: 5,
  // Raise journey
  R5: 0, R4: 1, R3: 2, R2: 3, R1: 4, R0: 5,
  // PMI journey
  PMI3: 0, PMI2: 1, PMI1: 2, PMI0: 3,
};

function gateRank(gate: string | null): number {
  if (!gate) return 99;
  return GATE_RANK[gate] ?? 99;
}

/**
 * Filter out drafts / placeholder deals so the stack only shows real,
 * user-owned pipeline. A deal is "real" when it has a business_name —
 * that's the minimum signal that the user actually told Yulia about a
 * business, not just tapped something and bounced. Without this filter,
 * empty draft rows show nudges like "Sharpen your acquisition thesis"
 * even though the user hasn't defined one — card overclaims state.
 */
export function filterRealDeals(deals: DealCardData[]): DealCardData[] {
  return deals.filter(d => d.business_name && d.business_name.trim().length > 0);
}

export function sortDeals(deals: DealCardData[]): DealCardData[] {
  return [...deals].sort((a, b) => {
    const ua = URGENCY_RANK[deriveUrgency(a)];
    const ub = URGENCY_RANK[deriveUrgency(b)];
    if (ua !== ub) return ua - ub;

    const ga = gateRank(a.current_gate);
    const gb = gateRank(b.current_gate);
    if (ga !== gb) return ga - gb;

    // Recency tiebreaker — most recently updated first
    return daysSince(a.updated_at) - daysSince(b.updated_at);
  });
}

/* ═══ PROPS ═══ */

interface DealStackProps {
  deals: DealCardData[];
  onDealTap: (dealId: number) => void;
  /** Called when the user taps one of the empty-state journey buttons.
   *  The fill string is a prefill for the chat pill ("I want to sell my business — "). */
  onStartFirstDeal?: (fill: string) => void;
  dark?: boolean;
}

/* ═══ COMPONENT ═══ */

export function DealStack({ deals, onDealTap, onStartFirstDeal, dark = false }: DealStackProps) {
  const sorted = useMemo(() => sortDeals(filterRealDeals(deals)), [deals]);

  if (sorted.length === 0) {
    return <EmptyStack onStart={onStartFirstDeal} dark={dark} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px 16px 120px 16px', // bottom padding clears the portaled pill
        width: '100%',
      }}
    >
      {sorted.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          dark={dark}
          stackIndex={0}
          onTap={() => onDealTap(deal.id)}
        />
      ))}
    </div>
  );
}

/* ═══ EMPTY STATE ═══ */

/**
 * Empty state — a "card-shaped" invitation that matches the Wallet aesthetic
 * of the stack, instead of a generic "nothing here" illustration. Reads as
 * the first, blank, tap-able card the user will ever see. When they act on
 * it, a real DealCard will take its place.
 */
function EmptyStack({ onStart, dark }: { onStart?: (fill: string) => void; dark: boolean }) {
  const headingColor = dark ? '#F0F0F3' : '#1A1C1E';
  const mutedColor = dark ? 'rgba(240,240,243,0.62)' : 'rgba(26,28,30,0.62)';
  const fadeColor = dark ? 'rgba(240,240,243,0.35)' : 'rgba(26,28,30,0.35)';
  const cardBg = dark ? '#1A1C1E' : '#FFFFFF';
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const paths = [
    { icon: 'sell', label: 'Sell a business', fill: 'I want to sell my business — ' },
    { icon: 'shopping_cart', label: 'Buy a business', fill: 'I want to buy a business — ' },
    { icon: 'savings', label: 'Raise capital', fill: 'I need to raise capital — ' },
  ];

  return (
    <div style={{ padding: '16px 16px 140px' }}>
      {/* Card-shaped onboarding entry — same 20px radius as DealCard */}
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: dark
            ? '0 8px 28px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)'
            : '0 8px 28px rgba(26,28,30,0.08), 0 2px 6px rgba(26,28,30,0.04)',
        }}
      >
        {/* Gradient header band — matches DealCard journey color band */}
        <div
          style={{
            height: 56,
            background: 'linear-gradient(135deg, #D44A78 0%, #E8709A 60%, #C99A3E 100%)',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', inset: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              color: 'rgba(255,255,255,0.95)',
              fontFamily: 'Sora, system-ui',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Your first deal
            </span>
          </div>
        </div>

        <div style={{ padding: '16px 16px 18px' }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'Sora, system-ui',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: headingColor,
            lineHeight: 1.15,
          }}>
            What are you working on?
          </h2>
          <p style={{
            margin: '6px 0 16px',
            fontFamily: 'Inter, system-ui',
            fontSize: 13,
            lineHeight: 1.45,
            color: mutedColor,
            fontWeight: 500,
          }}>
            Tell Yulia about a business you're selling, buying, raising for, or integrating — it'll appear here as a card.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {paths.map((p) => (
              <button
                key={p.label}
                onClick={() => onStart?.(p.fill)}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'transparent',
                  border: `1px solid ${cardBorder}`,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  textAlign: 'left',
                  fontFamily: 'Inter, system-ui',
                  fontSize: 14,
                  fontWeight: 600,
                  color: headingColor,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#D44A78' }}>
                  {p.icon}
                </span>
                <span style={{ flex: 1 }}>{p.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={fadeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealStack;
