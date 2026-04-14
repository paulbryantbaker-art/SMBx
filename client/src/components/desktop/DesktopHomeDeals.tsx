/**
 * DesktopHomeDeals — a compact deal overview rendered in the canvas panel
 * when a signed-in user is on `/` with no active canvas tab.
 *
 * Closes the P1 from critique rounds 2 and 3: "deals not visible on the
 * primary home surface." Mobile has DealStack; desktop didn't have an
 * equivalent — now it does.
 *
 * Layout: vertical stack inside the canvas card.
 *  - "Today" header with deal count + attention summary
 *  - Top 6 deals (urgency-first), each a clickable row → /deal/:id
 *  - "See all N" footer that opens the Pipeline tab
 *
 * Skeleton while the grouped deals hydrate. Empty state points to the
 * sample-demo cards (Sprint 11E) when the user has no deals.
 */

import { useMemo } from 'react';
import { daysSince, deriveUrgency, type DealCardData } from '../mobile/DealCard';

interface HomeDeal {
  id: number;
  business_name: string | null;
  journey_type: string | null;
  current_gate: string | null;
  industry: string | null;
  league: string | null;
  updated_at: string;
  status: string;
}

interface Props {
  deals: HomeDeal[];
  dark: boolean;
  onOpenDeal: (id: number) => void;
  onSeeAll: () => void;
  onNewDeal: () => void;
}

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#D44A78',
  buy: '#3E8E8E',
  raise: '#C99A3E',
  pmi: '#8F4A7A',
};

const JOURNEY_LABELS: Record<string, string> = {
  sell: 'Sell', buy: 'Buy', raise: 'Raise', pmi: 'PMI',
};

const GATE_SHORT: Record<string, string> = {
  S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'DD', B4: 'Structure', B5: 'Closing',
  R0: 'Intake', R1: 'Financials', R2: 'Investor Pkg', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day 0', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

function timeAgo(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function toDealCardData(d: HomeDeal): DealCardData {
  return {
    id: d.id,
    business_name: d.business_name,
    journey_type: d.journey_type,
    current_gate: d.current_gate,
    industry: d.industry,
    league: d.league,
    updated_at: d.updated_at,
    status: d.status,
  };
}

export default function DesktopHomeDeals({ deals, dark, onOpenDeal, onSeeAll, onNewDeal }: Props) {
  // Filter + sort
  const { sorted, stuckCount, needsYouCount } = useMemo(() => {
    const real = deals.filter(d => d.business_name && d.business_name.trim() && d.status !== 'archived');
    const rank = (d: HomeDeal) => {
      const u = deriveUrgency(toDealCardData(d));
      return u === 'stuck' ? 0 : u === 'needs-you' ? 1 : 2;
    };
    const s = [...real].sort((a, b) => rank(a) - rank(b) || daysSince(b.updated_at) - daysSince(a.updated_at));
    return {
      sorted: s,
      stuckCount: real.filter(d => deriveUrgency(toDealCardData(d)) === 'stuck').length,
      needsYouCount: real.filter(d => deriveUrgency(toDealCardData(d)) === 'needs-you').length,
    };
  }, [deals]);

  /* ───── Palette ───── */
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const subtleBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.02)';
  const pink = dark ? '#E8709A' : '#D44A78';

  const attentionCount = stuckCount + needsYouCount;

  /* ───── Empty state — no deals yet ───── */
  if (sorted.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 440 }}>
          <div style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.02em',
            color: heading,
            marginBottom: 10,
          }}>
            Your deals will live here.
          </div>
          <p style={{
            margin: 0,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14, lineHeight: 1.6,
            color: body,
          }}>
            Tell Yulia about a business you&rsquo;re selling, buying, or raising capital for — she&rsquo;ll track it from here through closing. This panel will show your whole book at a glance.
          </p>
          <button
            onClick={onNewDeal}
            type="button"
            style={{
              marginTop: 20,
              padding: '10px 20px',
              borderRadius: 999,
              border: 'none',
              background: pink,
              color: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212,74,120,0.22)',
            }}
          >
            Start a new deal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px 12px',
        borderBottom: `1px solid ${border}`,
        background: subtleBg,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <h2 style={{
            margin: 0,
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 20, fontWeight: 800,
            letterSpacing: '-0.02em',
            color: heading,
          }}>
            Today
          </h2>
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            color: muted,
          }}>
            {sorted.length} {sorted.length === 1 ? 'deal' : 'deals'} in motion
          </span>
        </div>
        {attentionCount > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 999,
            background: stuckCount > 0 ? (dark ? 'rgba(212,74,74,0.14)' : 'rgba(212,74,74,0.08)') : (dark ? 'rgba(201,154,62,0.14)' : 'rgba(201,154,62,0.08)'),
            color: stuckCount > 0 ? '#D44A4A' : '#C99A3E',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11.5, fontWeight: 700,
            letterSpacing: '0.01em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: stuckCount > 0 ? '#D44A4A' : '#C99A3E' }} />
            {attentionCount} {attentionCount === 1 ? 'deal needs' : 'deals need'} your attention
          </div>
        )}
      </header>

      {/* Deal rows */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {sorted.slice(0, 6).map(d => {
          const journey = (d.journey_type || 'sell').toLowerCase();
          const color = JOURNEY_COLORS[journey] || JOURNEY_COLORS.sell;
          const journeyLabel = JOURNEY_LABELS[journey] || 'Deal';
          const gateShort = GATE_SHORT[d.current_gate || ''] || d.current_gate || 'New';
          const urgency = deriveUrgency(toDealCardData(d));
          const urgencyColor = urgency === 'stuck' ? '#D44A4A' : urgency === 'needs-you' ? '#C99A3E' : '#2F7A4E';

          return (
            <button
              key={d.id}
              onClick={() => onOpenDeal(d.id)}
              type="button"
              className="home-deals-row"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 12,
                border: 'none',
                background: 'transparent',
                color: heading,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14,
                textAlign: 'left',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'background 120ms ease, transform 120ms ease',
                position: 'relative',
              }}
            >
              {/* Journey color rail */}
              <span aria-hidden style={{
                width: 3,
                height: 28,
                borderRadius: 2,
                background: color,
                flexShrink: 0,
              }} />
              {/* Main */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: heading,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.005em',
                }}>
                  {d.business_name}
                </div>
                <div style={{
                  marginTop: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11.5,
                  color: muted,
                  fontWeight: 500,
                }}>
                  <span style={{ color }}>{journeyLabel}</span>
                  <span>·</span>
                  <span>{gateShort}</span>
                  {d.industry && (
                    <>
                      <span>·</span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{d.industry}</span>
                    </>
                  )}
                </div>
              </div>
              {/* Urgency + recency */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: urgencyColor,
                }} title={urgency === 'stuck' ? 'Stuck' : urgency === 'needs-you' ? 'Needs you' : 'On track'} />
                <span style={{ fontSize: 11, color: muted, fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
                  {timeAgo(d.updated_at)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer — see all */}
      {sorted.length > 6 && (
        <footer style={{
          padding: '10px 14px',
          borderTop: `1px solid ${border}`,
          background: subtleBg,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11.5,
            color: muted,
          }}>
            Showing top 6 by urgency · {sorted.length - 6} more
          </span>
          <button
            onClick={onSeeAll}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              border: 'none',
              background: 'transparent',
              color: pink,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            See all in Pipeline
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </button>
        </footer>
      )}

      <style>{`
        .home-deals-row:hover { background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)'} !important; }
        .home-deals-row:active { transform: scale(0.995); }
      `}</style>
    </div>
  );
}
