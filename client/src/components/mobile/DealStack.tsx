/**
 * DealStack — Wallet-physics mobile portfolio surface.
 *
 * Top card is the one that needs attention most (urgency > stage > recency).
 * Up to 3 "peek" cards sit below it showing just their gradient header band
 * + business name + stage pill. Tap a peek → it lifts to top with a shared-
 * element transition. Swipe up on the top card → cycle to the next deal.
 * Remaining deals (5+) are reachable via "View all N deals" below the peek
 * stack.
 *
 * Honors prefers-reduced-motion (falls back to a plain vertical list).
 * Haptic ticks on transitions (no-op on iOS Safari).
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { DealCard, daysSince, deriveUrgency, type DealCardData, type Urgency } from './DealCard';
import { DealStackHints } from './DealStackHints';
import { tick, thud } from '../../lib/haptics';

/* ═══ SORT WEIGHTS ═══ */

const URGENCY_RANK: Record<Urgency, number> = {
  'stuck': 0,
  'needs-you': 1,
  'on-track': 2,
};

const GATE_RANK: Record<string, number> = {
  S5: 0, S4: 1, S3: 2, S2: 3, S1: 4, S0: 5,
  B5: 0, B4: 1, B3: 2, B2: 3, B1: 4, B0: 5,
  R5: 0, R4: 1, R3: 2, R2: 3, R1: 4, R0: 5,
  PMI3: 0, PMI2: 1, PMI1: 2, PMI0: 3,
};

function gateRank(gate: string | null): number {
  if (!gate) return 99;
  return GATE_RANK[gate] ?? 99;
}

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
    return daysSince(a.updated_at) - daysSince(b.updated_at);
  });
}

/* ═══ WALLET LAYOUT CONSTANTS ═══ */

const PEEK_HEIGHT = 44; // matches DealCard peek variant
const PEEK_GAP = 10;
const MAX_PEEK = 3;

/* ═══ PROPS ═══ */

interface DealStackProps {
  deals: DealCardData[];
  onDealTap: (dealId: number) => void;
  /** Fill string for the home pill when user taps an empty-state path. */
  onStartFirstDeal?: (fill: string) => void;
  /** Called when user long-presses the top card — future quick-actions sheet. */
  onDealLongPress?: (dealId: number) => void;
  /** Called when the user taps the "+ N more" indicator to see all deals. */
  onSeeAll?: () => void;
  /** Highlight a newly-created deal with a subtle pulse for 5s. */
  justCreatedDealId?: number | null;
  /** While true, render skeletons instead of cards (initial fetch in flight). */
  loading?: boolean;
  dark?: boolean;
}

/* ═══ COMPONENT ═══ */

export function DealStack({ deals, onDealTap, onStartFirstDeal, onDealLongPress, onSeeAll, justCreatedDealId, loading = false, dark = false }: DealStackProps) {
  const reduceMotion = useReducedMotion();
  const sorted = useMemo(() => sortDeals(filterRealDeals(deals)), [deals]);
  const [topId, setTopId] = useState<number | null>(null);

  if (loading) {
    return <SkeletonStack dark={dark} />;
  }

  // Re-pin the top card when the sorted order changes. Default is the #0 (most
  // urgent). If user has manually promoted a card via peek-tap, keep it on top
  // until the sort changes.
  useEffect(() => {
    if (sorted.length === 0) { setTopId(null); return; }
    const found = topId != null && sorted.find(d => d.id === topId);
    if (!found) setTopId(sorted[0].id);
  }, [sorted, topId]);

  // Auto-promote a just-created deal to the top of the stack so the user sees
  // their just-created card in the hero spot, with the pulse animation.
  useEffect(() => {
    if (justCreatedDealId != null && sorted.find(d => d.id === justCreatedDealId)) {
      setTopId(justCreatedDealId);
    }
  }, [justCreatedDealId, sorted]);

  if (sorted.length === 0) {
    return <EmptyStack onStart={onStartFirstDeal} dark={dark} />;
  }

  // Compute ordered slice for rendering: [topCard, ...peekCards, ...rest]
  const topIdx = topId != null ? sorted.findIndex(d => d.id === topId) : 0;
  const topCard = sorted[topIdx >= 0 ? topIdx : 0];
  const peekPool = sorted.filter(d => d.id !== topCard.id);
  const peekCards = peekPool.slice(0, MAX_PEEK);
  const overflowCount = Math.max(0, sorted.length - 1 - MAX_PEEK);

  // Cycle to next deal (swipe commit)
  const cycleNext = () => {
    if (peekCards.length === 0) return;
    thud();
    setTopId(peekCards[0].id);
  };

  // Promote a peek card to top (tap on peek)
  const promote = (id: number) => {
    tick();
    setTopId(id);
  };

  // REDUCED MOTION — fallback to a plain list without peek/swipe animations
  if (reduceMotion) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 140px' }}>
        {sorted.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            dark={dark}
            onTap={() => onDealTap(deal.id)}
            onLongPress={onDealLongPress ? () => onDealLongPress(deal.id) : undefined}
            urgency={deal.id === justCreatedDealId ? 'needs-you' : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 140px' }}>
      {/* Top card — full DealCard with swipe + long-press + justCreated pulse */}
      <motion.div
        key="top"
        layout
        drag="y"
        dragConstraints={{ top: -200, bottom: 0 }}
        dragElastic={{ top: 0.6, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y < -80 && peekCards.length > 0) cycleNext();
        }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        style={{ originY: 0 }}
      >
        <motion.div
          layoutId={`deal-${topCard.id}`}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className={topCard.id === justCreatedDealId ? 'deal-just-created' : undefined}
        >
          <DealCard
            deal={topCard}
            dark={dark}
            onTap={() => onDealTap(topCard.id)}
            onLongPress={onDealLongPress ? () => onDealLongPress(topCard.id) : undefined}
            showMoreButton={!!onDealLongPress}
          />
        </motion.div>
      </motion.div>

      {/* Peek cards */}
      <div style={{ marginTop: PEEK_GAP, display: 'flex', flexDirection: 'column', gap: PEEK_GAP }}>
        <AnimatePresence initial={false}>
          {peekCards.map((deal) => (
            <motion.div
              key={deal.id}
              layoutId={`deal-${deal.id}`}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              style={{ height: PEEK_HEIGHT }}
            >
              <DealCard
                deal={deal}
                dark={dark}
                peek
                onTap={() => promote(deal.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Overflow indicator → tap to expand to full searchable/filterable list */}
      {overflowCount > 0 && (
        <button
          onClick={onSeeAll}
          type="button"
          style={{
            marginTop: 14,
            display: 'block',
            width: '100%',
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontFamily: 'Inter, system-ui',
            fontSize: 13,
            fontWeight: 700,
            color: dark ? '#E8709A' : '#D44A78',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            borderRadius: 12,
          }}
        >
          See all {sorted.length} deals →
        </button>
      )}

      {/* First-time gesture hint overlay (once per device, dismissable) */}
      <DealStackHints hasTopCard={!!topCard} dark={dark} />

      {/* Just-created pulse animation — one-off subtle highlight */}
      <style>{`
        @keyframes dealJustCreated {
          0%   { box-shadow: 0 0 0 0 rgba(212,74,120,0.5); }
          50%  { box-shadow: 0 0 0 18px rgba(212,74,120,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,74,120,0); }
        }
        .deal-just-created > button > div {
          animation: dealJustCreated 1.6s ease-out 2;
        }
      `}</style>
    </div>
  );
}

/* ═══ LOADING SKELETON ═══ */

function SkeletonStack({ dark }: { dark: boolean }) {
  const cardBg = dark ? '#1A1C1E' : '#FFFFFF';
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const shimmer = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const shimmerHi = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ padding: '16px 16px 140px' }}>
      {/* Top card skeleton */}
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: dark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 8px 28px rgba(26,28,30,0.08)',
        }}
      >
        <div className="deal-skeleton-shimmer" style={{ height: 56, background: `linear-gradient(135deg, ${shimmer}, ${shimmerHi})` }} />
        <div style={{ padding: '14px 16px 16px' }}>
          <div className="deal-skeleton-shimmer" style={{ width: '60%', height: 18, borderRadius: 6, background: shimmer, marginBottom: 12 }} />
          <div className="deal-skeleton-shimmer" style={{ width: '40%', height: 12, borderRadius: 6, background: shimmer, marginBottom: 14 }} />
          <div className="deal-skeleton-shimmer" style={{ width: '85%', height: 13, borderRadius: 6, background: shimmer }} />
        </div>
      </div>

      {/* Peek skeletons */}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="deal-skeleton-shimmer"
            style={{
              height: 44,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${shimmer}, ${shimmerHi})`,
              border: `1px solid ${cardBorder}`,
              opacity: 1 - i * 0.18,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes dealSkeletonShimmer {
          0%   { opacity: 0.55; }
          50%  { opacity: 1; }
          100% { opacity: 0.55; }
        }
        .deal-skeleton-shimmer { animation: dealSkeletonShimmer 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .deal-skeleton-shimmer { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ═══ EMPTY STATE ═══ */

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
