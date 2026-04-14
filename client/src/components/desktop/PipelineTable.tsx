/**
 * PipelineTable — desktop operator surface for the deal pipeline.
 *
 * Replaces the card-grid PipelinePanel on desktop. Single floating card
 * (matches Canva grammar) containing a dense but breathable data table.
 *
 * Capabilities:
 *   — Saved view chips (All / Active / Stuck / Closing), plus journey filters
 *   — Column sort (urgency / recency / value / A-Z)
 *   — Density toggle (comfortable / compact), persisted
 *   — Priority column collapse below ~900px canvas width
 *   — Row click → /deal/:id via onOpenDeal callback
 *   — Row ⋯ → quick actions (archive is the only wired one right now)
 *
 * Bulk actions, saved views v2 (named user views), column picker — later sprints.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import { daysSince, deriveUrgency, type DealCardData } from '../mobile/DealCard';
import { showToast } from '../../lib/toast';
import { confirm } from '../../lib/confirm';

interface PipelineDeal {
  id: number;
  journey_type: string | null;
  current_gate: string | null;
  status: string;
  league: string | null;
  business_name: string | null;
  industry: string | null;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  deliverable_count?: number;
  document_count?: number;
  conversation_id: number | null;
}

interface Props {
  dark: boolean;
  onOpenDeal: (dealId: number) => void;
  onNewDeal: () => void;
}

type SortKey = 'urgency' | 'recent' | 'value' | 'alpha';
type Density = 'comfortable' | 'compact';
type ViewKey = 'all' | 'active' | 'stuck' | 'closing';
type JourneyFilter = 'all' | 'sell' | 'buy' | 'raise' | 'pmi';

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#D44A78',
  buy: '#3E8E8E',
  raise: '#C99A3E',
  pmi: '#8F4A7A',
};

const JOURNEY_LABELS: Record<string, string> = {
  sell: 'Sell', buy: 'Buy', raise: 'Raise', pmi: 'PMI',
};

const GATE_LABELS: Record<string, string> = {
  S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'DD', B4: 'Structure', B5: 'Closing',
  R0: 'Intake', R1: 'Financials', R2: 'Investor Pkg', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day 0', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

const VIEW_LABEL: Record<ViewKey, string> = {
  all: 'All',
  active: 'My active',
  stuck: 'Stuck',
  closing: 'Closing soon',
};

const CLOSING_GATES = new Set(['S5', 'B5', 'R5']);

/* ───────── STORAGE KEYS ───────── */
const LS_SORT = 'smbx-pipeline-sort';
const LS_DENSITY = 'smbx-pipeline-density';
const LS_VIEW = 'smbx-pipeline-view';
const LS_JOURNEY = 'smbx-pipeline-journey';

/* ───────── HELPERS ───────── */

function formatMoney(val: number | null | undefined): string {
  if (!val) return '—';
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(val >= 10_000_000 ? 0 : 1)}M`;
  if (val >= 1_000) return `$${Math.round(val / 1000)}K`;
  return `$${val.toLocaleString()}`;
}

function formatTimeAgo(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return 'Today';
  if (d === 1) return '1d ago';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function dealValue(d: PipelineDeal): number {
  // Prefer asking price, else revenue, else EBITDA ×5, else 0 — rough "size" proxy for sort
  return d.asking_price || d.revenue || (d.ebitda ? d.ebitda * 5 : 0) || 0;
}

function toDealCardData(d: PipelineDeal): DealCardData {
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

/* ───────── COMPONENT ───────── */

export default function PipelineTable({ dark, onOpenDeal, onNewDeal }: Props) {
  const [deals, setDeals] = useState<PipelineDeal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>(() => (localStorage.getItem(LS_SORT) as SortKey) || 'urgency');
  const [density, setDensity] = useState<Density>(() => (localStorage.getItem(LS_DENSITY) as Density) || 'comfortable');
  const [view, setView] = useState<ViewKey>(() => (localStorage.getItem(LS_VIEW) as ViewKey) || 'all');
  const [journey, setJourney] = useState<JourneyFilter>(() => (localStorage.getItem(LS_JOURNEY) as JourneyFilter) || 'all');
  const [search, setSearch] = useState('');

  useEffect(() => { localStorage.setItem(LS_SORT, sortKey); }, [sortKey]);
  useEffect(() => { localStorage.setItem(LS_DENSITY, density); }, [density]);
  useEffect(() => { localStorage.setItem(LS_VIEW, view); }, [view]);
  useEffect(() => { localStorage.setItem(LS_JOURNEY, journey); }, [journey]);

  const fetchDeals = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/deals', { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PipelineDeal[] = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Couldn\u2019t load deals');
    }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  /* ───── Filter + sort ───── */
  const visibleDeals = useMemo(() => {
    if (!deals) return null;
    const q = search.trim().toLowerCase();

    const filtered = deals.filter(d => {
      // Drafts (no name) hidden
      if (!d.business_name || !d.business_name.trim()) return false;
      // Journey filter
      if (journey !== 'all' && (d.journey_type || '').toLowerCase() !== journey) return false;
      // Search
      if (q) {
        const hay = `${d.business_name} ${d.industry || ''} ${d.location || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Saved view
      if (view === 'active') {
        if (d.status !== 'active') return false;
      }
      if (view === 'stuck') {
        if (deriveUrgency(toDealCardData(d)) !== 'stuck') return false;
      }
      if (view === 'closing') {
        if (!d.current_gate || !CLOSING_GATES.has(d.current_gate)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortKey === 'urgency') {
      // stuck > needs-you > on-track, then most stale first within tier
      const rank = (d: PipelineDeal) => {
        const u = deriveUrgency(toDealCardData(d));
        return u === 'stuck' ? 0 : u === 'needs-you' ? 1 : 2;
      };
      sorted.sort((a, b) => rank(a) - rank(b) || daysSince(b.updated_at) - daysSince(a.updated_at));
    } else if (sortKey === 'recent') {
      sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortKey === 'value') {
      sorted.sort((a, b) => dealValue(b) - dealValue(a));
    } else if (sortKey === 'alpha') {
      sorted.sort((a, b) => (a.business_name || '').localeCompare(b.business_name || ''));
    }
    return sorted;
  }, [deals, search, view, journey, sortKey]);

  /* ───── Palette ───── */
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const borderC = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const rowHover = dark ? 'rgba(255,255,255,0.03)' : 'rgba(15,16,18,0.02)';
  const subtleBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.015)';
  const pink = dark ? '#E8709A' : '#D44A78';

  const rowPadY = density === 'compact' ? 8 : 14;
  const rowFont = density === 'compact' ? 12.5 : 13.5;

  /* ───── Archive ───── */
  const handleArchive = async (deal: PipelineDeal) => {
    const ok = await confirm({
      title: `Archive ${deal.business_name || 'this deal'}?`,
      body: 'It\u2019ll move out of your active pipeline. You can find archived deals later.',
      confirmLabel: 'Archive',
      cancelLabel: 'Keep',
      destructive: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (!res.ok) throw new Error();
      setDeals(prev => prev ? prev.filter(d => d.id !== deal.id) : prev);
      showToast(`${deal.business_name || 'Deal'} archived`, { tone: 'success' });
    } catch {
      showToast('Couldn\u2019t archive — try again.', { tone: 'error' });
    }
  };

  /* ───── Render ───── */
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'transparent',
      }}
    >
      {/* Header + chips */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: `1px solid ${borderC}`,
        background: subtleBg,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <h1 style={{
            margin: 0,
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: heading,
            flex: 1,
          }}>
            Pipeline
          </h1>
          <div style={{ position: 'relative' }}>
            <span
              className="material-symbols-outlined"
              aria-hidden
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: 10,
                fontSize: 16,
                color: muted,
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals"
              type="search"
              style={{
                padding: '7px 12px 7px 30px',
                borderRadius: 999,
                border: `1px solid ${borderC}`,
                background: dark ? '#1A1C1E' : '#FFFFFF',
                color: heading,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                outline: 'none',
                width: 220,
              }}
            />
          </div>
          <button
            onClick={onNewDeal}
            type="button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              background: pink,
              color: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212,74,120,0.22)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            New deal
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* View chips */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(Object.keys(VIEW_LABEL) as ViewKey[]).map(v => (
              <FilterChip
                key={v}
                label={VIEW_LABEL[v]}
                active={view === v}
                onClick={() => setView(v)}
                dark={dark}
              />
            ))}
          </div>

          <span style={{ width: 1, height: 18, background: borderC }} aria-hidden />

          {/* Journey chips */}
          <div style={{ display: 'flex', gap: 4 }}>
            <FilterChip
              label="All types"
              active={journey === 'all'}
              onClick={() => setJourney('all')}
              dark={dark}
            />
            {(['sell', 'buy', 'raise', 'pmi'] as JourneyFilter[]).map(j => (
              <FilterChip
                key={j}
                label={JOURNEY_LABELS[j]}
                active={journey === j}
                onClick={() => setJourney(j as JourneyFilter)}
                dark={dark}
                colorDot={JOURNEY_COLORS[j]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      {visibleDeals && (
        <div style={{
          padding: '8px 20px',
          borderBottom: `1px solid ${borderC}`,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12,
          color: muted,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
        }}>
          <span><strong style={{ color: heading, fontWeight: 700 }}>{visibleDeals.length}</strong> {visibleDeals.length === 1 ? 'deal' : 'deals'}</span>
          <span>&bull;</span>
          <span>
            <strong style={{ color: heading, fontWeight: 700 }}>
              {formatMoney(visibleDeals.reduce((sum, d) => sum + dealValue(d), 0))}
            </strong>{' '}
            total value
          </span>
          <span>&bull;</span>
          <span>
            <strong style={{ color: '#D44A4A', fontWeight: 700 }}>
              {visibleDeals.filter(d => deriveUrgency(toDealCardData(d)) !== 'on-track').length}
            </strong>{' '}
            need attention
          </span>
        </div>
      )}

      {/* Table body */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {error && (
          <div style={{ padding: 40, textAlign: 'center', color: muted, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13 }}>
            {error} &mdash;{' '}
            <button onClick={fetchDeals} type="button" style={{ background: 'none', border: 'none', color: pink, cursor: 'pointer', fontWeight: 700 }}>
              retry
            </button>
          </div>
        )}
        {!error && !visibleDeals && (
          <SkeletonRows rows={6} dark={dark} />
        )}
        {!error && visibleDeals && visibleDeals.length === 0 && (
          <EmptyState
            dark={dark}
            filtered={deals && deals.length > 0}
            onClearFilters={() => { setView('all'); setJourney('all'); setSearch(''); }}
            onNewDeal={onNewDeal}
          />
        )}
        {!error && visibleDeals && visibleDeals.length > 0 && (
          <table
            className="pipeline-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: rowFont,
              color: body,
            }}
          >
            <thead>
              <tr style={{
                position: 'sticky',
                top: 0,
                background: dark ? '#151617' : '#FFFFFF',
                zIndex: 1,
                borderBottom: `1px solid ${borderC}`,
              }}>
                <HeaderCell label="Business" align="left" onClick={() => setSortKey('alpha')} active={sortKey === 'alpha'} dark={dark} />
                <HeaderCell label="Journey" align="left" className="pipeline-col-journey" dark={dark} />
                <HeaderCell label="Stage" align="left" dark={dark} />
                <HeaderCell label="Urgency" align="left" onClick={() => setSortKey('urgency')} active={sortKey === 'urgency'} dark={dark} />
                <HeaderCell label="Value" align="right" onClick={() => setSortKey('value')} active={sortKey === 'value'} dark={dark} />
                <HeaderCell label="Last" align="right" onClick={() => setSortKey('recent')} active={sortKey === 'recent'} className="pipeline-col-last" dark={dark} />
                <th aria-label="actions" style={{ width: 48, padding: 0 }} />
              </tr>
            </thead>
            <tbody>
              {visibleDeals.map(d => (
                <PipelineRow
                  key={d.id}
                  deal={d}
                  dark={dark}
                  rowPadY={rowPadY}
                  rowHover={rowHover}
                  borderC={borderC}
                  onOpenDeal={() => onOpenDeal(d.id)}
                  onArchive={() => handleArchive(d)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer — density + sort summary */}
      <div style={{
        padding: '10px 20px',
        borderTop: `1px solid ${borderC}`,
        background: subtleBg,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12,
        color: muted,
        flexShrink: 0,
      }}>
        <span>
          Sort:{' '}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{
              background: 'transparent',
              border: 'none',
              color: heading,
              fontWeight: 700,
              fontFamily: 'inherit',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="urgency">Urgency</option>
            <option value="recent">Most recent</option>
            <option value="value">Value</option>
            <option value="alpha">A–Z</option>
          </select>
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
          Density:
          <DensityToggle value="comfortable" label="Comfortable" current={density} onSelect={setDensity} dark={dark} />
          <DensityToggle value="compact" label="Compact" current={density} onSelect={setDensity} dark={dark} />
        </span>
      </div>

      <style>{`
        .pipeline-table tbody tr { cursor: pointer; transition: background 80ms ease; position: relative; }
        .pipeline-table tbody tr:hover { background: ${rowHover}; box-shadow: inset 3px 0 0 var(--row-journey-color, transparent); }
        .pipeline-table tbody tr:hover .pipeline-row-actions { opacity: 1; }
        .pipeline-table tbody tr:focus-visible { outline: 2px solid ${pink}; outline-offset: -2px; }
        @media (max-width: 980px) {
          .pipeline-table .pipeline-col-last { display: none; }
          .pipeline-table td.pipeline-col-last { display: none; }
        }
        @media (max-width: 780px) {
          .pipeline-table .pipeline-col-journey { display: none; }
          .pipeline-table td.pipeline-col-journey { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ───────── SUBCOMPONENTS ───────── */

function FilterChip({
  label, active, onClick, dark, colorDot,
}: { label: string; active: boolean; onClick: () => void; dark: boolean; colorDot?: string }) {
  const pink = dark ? '#E8709A' : '#D44A78';
  return (
    <button
      onClick={onClick}
      type="button"
      className="pipeline-filter-chip"
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: 999,
        border: 'none',
        background: active
          ? (dark ? 'rgba(232,112,154,0.16)' : 'rgba(212,74,120,0.08)')
          : 'transparent',
        color: active ? pink : (dark ? 'rgba(240,240,243,0.78)' : '#3C3D40'),
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12.5,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        letterSpacing: '-0.005em',
      }}
    >
      {colorDot && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: colorDot, flexShrink: 0 }} />
      )}
      {label}
    </button>
  );
}

function HeaderCell({
  label, align, onClick, active, className, dark,
}: {
  label: string;
  align: 'left' | 'right';
  onClick?: () => void;
  active?: boolean;
  className?: string;
  dark: boolean;
}) {
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  return (
    <th
      scope="col"
      className={className}
      style={{
        textAlign: align,
        padding: '12px 16px',
        fontFamily: "'Sora', system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: active ? heading : muted,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
      onClick={onClick}
    >
      {label}
      {active && <span style={{ marginLeft: 4, fontSize: 10 }}>&#9660;</span>}
    </th>
  );
}

function PipelineRow({
  deal, dark, rowPadY, rowHover, borderC, onOpenDeal, onArchive,
}: {
  deal: PipelineDeal;
  dark: boolean;
  rowPadY: number;
  rowHover: string;
  borderC: string;
  onOpenDeal: () => void;
  onArchive: () => void;
}) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const journey = (deal.journey_type || 'sell').toLowerCase();
  const color = JOURNEY_COLORS[journey] || JOURNEY_COLORS.sell;
  const label = JOURNEY_LABELS[journey] || 'Deal';
  const gate = deal.current_gate || '';
  const gateLabel = GATE_LABELS[gate] || gate || 'New';
  const urgency = deriveUrgency(toDealCardData(deal));
  const urgencyColor = urgency === 'stuck' ? '#D44A4A' : urgency === 'needs-you' ? '#C99A3E' : '#2F7A4E';
  const urgencyLabel = urgency === 'stuck' ? 'Stuck' : urgency === 'needs-you' ? 'Needs you' : 'On track';
  const value = dealValue(deal);
  void rowHover;

  return (
    <tr
      tabIndex={0}
      onClick={onOpenDeal}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDeal(); } }}
      style={{
        borderBottom: `1px solid ${borderC}`,
        // Journey-color left accent strip — visible on hover only (via CSS).
        // The CSS variable lets us do this per-row without per-row <style>.
        ['--row-journey-color' as any]: color,
      }}
      className="pipeline-row-journey"
    >
      <td style={{ padding: `${rowPadY}px 16px`, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: heading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {deal.business_name}
        </div>
        {(deal.industry || deal.location) && (
          <div style={{ fontSize: 11, color: muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deal.industry}{deal.industry && deal.location ? ' • ' : ''}{deal.location}
          </div>
        )}
      </td>
      <td className="pipeline-col-journey" style={{ padding: `${rowPadY}px 16px` }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 9px',
          borderRadius: 999,
          background: dark ? `${color}2A` : `${color}14`,
          color,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
          {label}
        </span>
      </td>
      <td style={{ padding: `${rowPadY}px 16px`, color: heading, fontWeight: 600 }}>
        {gateLabel}
        {gate && <span style={{ marginLeft: 6, fontSize: 11, color: muted, fontWeight: 500 }}>{gate}</span>}
      </td>
      <td style={{ padding: `${rowPadY}px 16px` }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: heading }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: urgencyColor }} />
          {urgencyLabel}
        </span>
      </td>
      <td style={{ padding: `${rowPadY}px 16px`, textAlign: 'right', color: heading, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {formatMoney(value)}
      </td>
      <td className="pipeline-col-last" style={{ padding: `${rowPadY}px 16px`, textAlign: 'right', color: muted, whiteSpace: 'nowrap' }}>
        {formatTimeAgo(deal.updated_at)}
      </td>
      <td style={{ padding: `${rowPadY}px 4px ${rowPadY}px 0`, width: 48 }} onClick={(e) => e.stopPropagation()}>
        <RowMenu onArchive={onArchive} dark={dark} />
      </td>
    </tr>
  );
}

function RowMenu({ onArchive, dark }: { onArchive: () => void; dark: boolean }) {
  const [open, setOpen] = useState(false);
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : '#E5E1D9';

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const t = setTimeout(() => document.addEventListener('click', close, { once: true }), 0);
    return () => { clearTimeout(t); document.removeEventListener('click', close); };
  }, [open]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="pipeline-row-actions"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        type="button"
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: 'none', background: 'transparent',
          color: muted,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 100ms ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            minWidth: 160,
            background: dark ? '#151617' : '#FFFFFF',
            border: `1px solid ${borderC}`,
            borderRadius: 10,
            boxShadow: dark
              ? '0 12px 28px rgba(0,0,0,0.35)'
              : '0 12px 28px rgba(60,55,45,0.12)',
            padding: 4,
            zIndex: 20,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setOpen(false); onArchive(); }}
            type="button"
            role="menuitem"
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              color: '#D44A4A',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12.5,
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>archive</span>
            Archive
          </button>
          <style>{`
            [role=menu] button:hover { background: ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(15,16,18,0.04)'}; }
          `}</style>
          <span style={{ display: 'block', fontSize: 10, color: muted, padding: '4px 12px' }}>
            More actions in sprint 5
          </span>
          <span aria-hidden>{heading /* swallow unused var */}</span>
        </div>
      )}
    </div>
  );
}

function DensityToggle({
  value, label, current, onSelect, dark,
}: {
  value: Density;
  label: string;
  current: Density;
  onSelect: (v: Density) => void;
  dark: boolean;
}) {
  const active = value === current;
  const pink = dark ? '#E8709A' : '#D44A78';
  return (
    <button
      onClick={() => onSelect(value)}
      type="button"
      aria-pressed={active}
      style={{
        padding: '3px 10px',
        borderRadius: 999,
        border: 'none',
        background: active ? (dark ? 'rgba(232,112,154,0.16)' : 'rgba(212,74,120,0.08)') : 'transparent',
        color: active ? pink : 'inherit',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11.5,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function SkeletonRows({ rows, dark }: { rows: number; dark: boolean }) {
  const borderC = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const sk = dark ? 'rgba(255,255,255,0.05)' : 'rgba(15,16,18,0.04)';
  return (
    <div style={{ padding: '12px 20px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 0',
          borderBottom: i === rows - 1 ? 'none' : `1px solid ${borderC}`,
        }}>
          <div style={{ width: '30%', height: 14, background: sk, borderRadius: 4, animation: 'pipelineSkel 1.4s ease-in-out infinite' }} />
          <div style={{ width: 64, height: 14, background: sk, borderRadius: 4, animation: 'pipelineSkel 1.4s ease-in-out infinite' }} />
          <div style={{ width: 80, height: 14, background: sk, borderRadius: 4, animation: 'pipelineSkel 1.4s ease-in-out infinite' }} />
          <div style={{ flex: 1 }} />
          <div style={{ width: 60, height: 14, background: sk, borderRadius: 4, animation: 'pipelineSkel 1.4s ease-in-out infinite' }} />
        </div>
      ))}
      <style>{`
        @keyframes pipelineSkel { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
      `}</style>
    </div>
  );
}

function EmptyState({
  dark, filtered, onClearFilters, onNewDeal,
}: { dark: boolean; filtered: boolean | null; onClearFilters: () => void; onNewDeal: () => void }) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const pink = dark ? '#E8709A' : '#D44A78';

  if (filtered) {
    return (
      <div style={{
        padding: 48,
        textAlign: 'center',
        color: body,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: heading, marginBottom: 4 }}>No deals match this view</div>
        <div style={{ fontSize: 13, color: muted, marginBottom: 16 }}>Try a different filter or clear the current ones.</div>
        <button
          onClick={onClearFilters}
          type="button"
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: `1px solid ${pink}`,
            background: 'transparent',
            color: pink,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: 56,
      textAlign: 'center',
      color: body,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Sora', system-ui, sans-serif", color: heading, marginBottom: 8, letterSpacing: '-0.01em' }}>
        Your pipeline starts here
      </div>
      <div style={{ fontSize: 13.5, color: body, marginBottom: 20, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.55 }}>
        Tell Yulia about a business you&rsquo;re selling, buying, or raising capital for &mdash; she&rsquo;ll track it from here through closing.
      </div>
      <button
        onClick={onNewDeal}
        type="button"
        style={{
          padding: '10px 20px',
          borderRadius: 999,
          border: 'none',
          background: pink,
          color: '#FFFFFF',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(212,74,120,0.22)',
        }}
      >
        Start a new deal
      </button>
    </div>
  );
}
