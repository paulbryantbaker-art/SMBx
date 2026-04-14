/**
 * PortfolioAnalytics — desktop portfolio-level analytics dashboard.
 *
 * A grid of floating cards on the dot-grid canvas, each card presenting one
 * insight. Reads from /api/deals + existing urgency/value heuristics.
 *
 * v1 ships the insight cards that matter most to an operator looking at
 * their whole book: total pipeline value, journey mix, stage distribution,
 * attention-needed bucket, velocity proxies. No speculative metrics — if
 * we don't have the data today, we don't invent a chart for it.
 *
 * Sprint 5 scope. Later sprints layer in time-series (requires gate_events
 * aggregation), cohort comparisons, and per-journey conversion funnels.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import { daysSince, deriveUrgency, type DealCardData } from '../mobile/DealCard';

interface Deal {
  id: number;
  journey_type: string | null;
  current_gate: string | null;
  status: string;
  business_name: string | null;
  industry: string | null;
  revenue: number | null;
  ebitda: number | null;
  asking_price: number | null;
  updated_at: string;
  created_at: string;
}

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#D44A78',
  buy: '#3E8E8E',
  raise: '#C99A3E',
  pmi: '#8F4A7A',
};

const JOURNEY_LABELS: Record<string, string> = {
  sell: 'Selling', buy: 'Buying', raise: 'Raising', pmi: 'PMI',
};

function formatMoney(val: number): string {
  if (val === 0) return '$0';
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(val >= 10_000_000 ? 0 : 1)}M`;
  if (val >= 1_000) return `$${Math.round(val / 1000)}K`;
  return `$${val.toLocaleString()}`;
}

function dealValue(d: Deal): number {
  return d.asking_price || d.revenue || (d.ebitda ? d.ebitda * 5 : 0) || 0;
}

function toDealCardData(d: Deal): DealCardData {
  return {
    id: d.id,
    business_name: d.business_name,
    journey_type: d.journey_type,
    current_gate: d.current_gate,
    industry: d.industry,
    league: null,
    updated_at: d.updated_at,
    status: d.status,
  };
}

interface Props {
  dark: boolean;
  onOpenDeal: (dealId: number) => void;
}

export default function PortfolioAnalytics({ dark, onOpenDeal }: Props) {
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    try {
      const r = await fetch('/api/deals', { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: Deal[] = await r.json();
      setDeals(Array.isArray(data) ? data.filter(d => d.business_name && d.business_name.trim()) : []);
    } catch (e: any) {
      setError(e?.message || 'Couldn\u2019t load portfolio');
    }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  /* ─── Derivations ─── */

  const stats = useMemo(() => {
    if (!deals) return null;
    const active = deals.filter(d => d.status === 'active');
    const totalValue = active.reduce((sum, d) => sum + dealValue(d), 0);
    const stuck = active.filter(d => deriveUrgency(toDealCardData(d)) === 'stuck');
    const needsYou = active.filter(d => deriveUrgency(toDealCardData(d)) === 'needs-you');
    const byJourney: Record<string, Deal[]> = {};
    for (const d of active) {
      const k = (d.journey_type || 'sell').toLowerCase();
      byJourney[k] = byJourney[k] || [];
      byJourney[k].push(d);
    }
    const byStage: Record<string, Deal[]> = {};
    for (const d of active) {
      const k = d.current_gate || 'unknown';
      byStage[k] = byStage[k] || [];
      byStage[k].push(d);
    }
    const avgAge = active.length > 0
      ? Math.round(active.reduce((sum, d) => sum + daysSince(d.created_at), 0) / active.length)
      : 0;
    const avgStale = active.length > 0
      ? Math.round(active.reduce((sum, d) => sum + daysSince(d.updated_at), 0) / active.length)
      : 0;
    // Recent activity: top 5 active deals sorted by most-recent updated_at
    const recentMoves = [...active]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
    return {
      total: active.length,
      allTotal: deals.length,
      archived: deals.length - active.length,
      totalValue,
      stuckCount: stuck.length,
      stuckValue: stuck.reduce((sum, d) => sum + dealValue(d), 0),
      needsYouCount: needsYou.length,
      avgAge,
      avgStale,
      byJourney,
      byStage,
      stuck,
      active,
      recentMoves,
    };
  }, [deals]);

  function formatRelative(iso: string): string {
    const d = daysSince(iso);
    if (d === 0) {
      const ms = Date.now() - new Date(iso).getTime();
      const hrs = Math.floor(ms / (1000 * 60 * 60));
      if (hrs < 1) return 'just now';
      return `${hrs}h ago`;
    }
    if (d === 1) return '1d ago';
    if (d < 7) return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
  }

  /* ─── Palette ─── */
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const borderC = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const pink = dark ? '#E8709A' : '#D44A78';

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: muted, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13 }}>
        {error}{' '}
        <button onClick={fetchDeals} type="button" style={{ background: 'none', border: 'none', color: pink, cursor: 'pointer', fontWeight: 700 }}>
          retry
        </button>
      </div>
    );
  }

  if (!stats || !deals) {
    return (
      <div style={{ padding: 24 }}>
        <SkeletonGrid dark={dark} />
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div style={{ padding: 56, textAlign: 'center', color: body, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{
          fontFamily: "'Sora', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: heading,
          letterSpacing: '-0.02em', marginBottom: 10,
        }}>
          No portfolio yet
        </div>
        <p style={{ maxWidth: 420, margin: '0 auto', fontSize: 13.5, lineHeight: 1.55 }}>
          When you start tracking deals with Yulia, this dashboard will show your pipeline value, attention list, and velocity at a glance.
        </p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: dark ? '#151617' : '#FFFFFF',
    border: `1px solid ${borderC}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: dark
      ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)'
      : '0 1px 2px rgba(60,55,45,0.06), 0 4px 8px rgba(60,55,45,0.04)',
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>
      {/* Top row — KPI cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}>
        <KpiCard
          label="Pipeline value"
          value={formatMoney(stats.totalValue)}
          hint={`${stats.total} active ${stats.total === 1 ? 'deal' : 'deals'}`}
          accent={pink}
          dark={dark}
        />
        <KpiCard
          label="Needs your attention"
          value={`${stats.stuckCount + stats.needsYouCount}`}
          hint={stats.stuckCount > 0 ? `${stats.stuckCount} stuck · ${formatMoney(stats.stuckValue)} at risk` : `${stats.needsYouCount} waiting`}
          accent={stats.stuckCount > 0 ? '#D44A4A' : '#C99A3E'}
          dark={dark}
        />
        <KpiCard
          label="Avg time in motion"
          value={`${stats.avgAge}d`}
          hint={stats.avgStale > 7 ? `Last activity ~${stats.avgStale}d ago` : `Cooking steadily`}
          accent="#3E8E8E"
          dark={dark}
        />
        <KpiCard
          label="Archived"
          value={`${stats.archived}`}
          hint={stats.archived === 0 ? 'Clean book' : 'Closed or paused'}
          accent={muted}
          dark={dark}
        />
      </div>

      {/* Recently moved — horizontal activity strip using existing updated_at */}
      {stats.recentMoves.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={sectionHeadStyle(muted)}>Recently moved</h3>
            <span style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11, fontWeight: 600, color: muted,
            }}>
              Most recent activity across your book
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stats.recentMoves.map(d => {
              const journeyC = JOURNEY_COLORS[(d.journey_type || 'sell').toLowerCase()] || pink;
              return (
                <button
                  key={d.id}
                  onClick={() => onOpenDeal(d.id)}
                  type="button"
                  className="portfolio-recent-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: heading,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 120ms ease',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: journeyC, flexShrink: 0 }} />
                  <span style={{
                    flex: 1, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {d.business_name}
                  </span>
                  <span style={{ fontSize: 11, color: muted, fontWeight: 600, flexShrink: 0 }}>
                    {d.current_gate || 'New'}
                  </span>
                  <span style={{ fontSize: 11, color: muted, fontWeight: 500, flexShrink: 0, minWidth: 64, textAlign: 'right' }}>
                    {formatRelative(d.updated_at)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Middle row — breakdowns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* Journey mix */}
        <div style={cardStyle}>
          <h3 style={sectionHeadStyle(muted)}>By journey</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {Object.entries(stats.byJourney)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([j, list]) => {
                const pct = (list.length / stats.total) * 100;
                const value = list.reduce((sum, d) => sum + dealValue(d), 0);
                return (
                  <div key={j}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: 13, fontWeight: 700, color: heading,
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: JOURNEY_COLORS[j] || '#7A766E' }} />
                        {JOURNEY_LABELS[j] || j}
                      </span>
                      <span style={{ fontSize: 12, color: muted, fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {list.length} · {formatMoney(value)}
                      </span>
                    </div>
                    <div style={{
                      height: 6, borderRadius: 3,
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: JOURNEY_COLORS[j] || pink,
                        transition: 'width 220ms ease',
                      }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Stage distribution */}
        <div style={cardStyle}>
          <h3 style={sectionHeadStyle(muted)}>By stage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {Object.entries(stats.byStage)
              .sort((a, b) => b[1].length - a[1].length)
              .slice(0, 8)
              .map(([stage, list]) => {
                const pct = (list.length / stats.total) * 100;
                return (
                  <div key={stage} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 13,
                  }}>
                    <span style={{ width: 56, fontWeight: 700, color: heading, flexShrink: 0 }}>{stage}</span>
                    <div style={{
                      flex: 1,
                      height: 6, borderRadius: 3,
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)',
                      overflow: 'hidden',
                    }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pink, transition: 'width 220ms ease' }} />
                    </div>
                    <span style={{ width: 28, textAlign: 'right', color: muted, fontWeight: 600 }}>{list.length}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Attention list */}
      {stats.stuck.length > 0 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={sectionHeadStyle(muted)}>Stuck deals</h3>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#D44A4A',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {formatMoney(stats.stuckValue)} at risk
            </span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stats.stuck.slice(0, 8).map(d => {
              const stale = daysSince(d.updated_at);
              const journeyC = JOURNEY_COLORS[(d.journey_type || 'sell').toLowerCase()] || pink;
              return (
                <button
                  key={d.id}
                  onClick={() => onOpenDeal(d.id)}
                  type="button"
                  className="portfolio-stuck-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${borderC}`,
                    background: 'transparent',
                    color: heading,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 13, fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 120ms ease',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: journeyC, flexShrink: 0 }} />
                  <span style={{
                    flex: 1, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {d.business_name}
                  </span>
                  <span style={{ fontSize: 11, color: '#D44A4A', fontWeight: 700, flexShrink: 0 }}>
                    {stale}d quiet
                  </span>
                  <span style={{ fontSize: 11, color: muted, fontWeight: 500, flexShrink: 0 }}>
                    {formatMoney(dealValue(d))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .portfolio-stuck-row:hover,
        .portfolio-recent-row:hover { background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)'} !important; }
      `}</style>
    </div>
  );
}

function sectionHeadStyle(muted: string): React.CSSProperties {
  return {
    margin: 0,
    fontFamily: "'Sora', system-ui, sans-serif",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: muted,
  };
}

function KpiCard({
  label, value, hint, accent, dark,
}: { label: string; value: string; hint: string; accent: string; dark: boolean }) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const borderC = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  return (
    <div style={{
      background: dark ? '#151617' : '#FFFFFF',
      border: `1px solid ${borderC}`,
      borderRadius: 14,
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: dark
        ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)'
        : '0 1px 2px rgba(60,55,45,0.06), 0 4px 8px rgba(60,55,45,0.04)',
    }}>
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, height: 3, width: '100%', background: accent, opacity: 0.75 }} />
      <div style={{
        fontFamily: "'Sora', system-ui, sans-serif",
        fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: muted, marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Sora', system-ui, sans-serif",
        fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
        color: heading, lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{
        marginTop: 6,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12, color: muted, lineHeight: 1.4,
      }}>
        {hint}
      </div>
    </div>
  );
}

function SkeletonGrid({ dark }: { dark: boolean }) {
  const sk = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          height: 116, borderRadius: 14, background: sk, border: `1px solid ${border}`,
          animation: 'portfolioSkel 1.4s ease-in-out infinite',
        }} />
      ))}
      <style>{`@keyframes portfolioSkel { 0%,100% { opacity: 0.5 } 50% { opacity: 0.9 } }`}</style>
    </div>
  );
}
