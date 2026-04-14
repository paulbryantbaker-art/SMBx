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
  onStartFirstDeal?: () => void;
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

function EmptyStack({ onStart, dark }: { onStart?: () => void; dark: boolean }) {
  const headingColor = dark ? '#F0F0F3' : '#1A1C1E';
  const mutedColor = dark ? 'rgba(240,240,243,0.55)' : 'rgba(26,28,30,0.55)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px 140px',
        minHeight: '60dvh',
      }}
    >
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D44A78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20, opacity: 0.7 }}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      </svg>
      <h2 style={{
        margin: 0,
        fontFamily: 'Sora, system-ui',
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: headingColor,
        marginBottom: 8,
      }}>
        Your pipeline lives here
      </h2>
      <p style={{
        margin: 0,
        maxWidth: 280,
        fontFamily: 'Inter, system-ui',
        fontSize: 15,
        lineHeight: 1.5,
        color: mutedColor,
        marginBottom: 24,
      }}>
        Sell, buy, raise, or integrate — tell Yulia what you're working on and the deal will appear as a card.
      </p>
      {onStart && (
        <button
          onClick={onStart}
          type="button"
          style={{
            padding: '12px 20px',
            borderRadius: 999,
            border: 'none',
            background: '#D44A78',
            color: '#fff',
            fontFamily: 'Inter, system-ui',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(212,74,120,0.35)',
          }}
        >
          Start your first deal
        </button>
      )}
    </div>
  );
}

export default DealStack;
