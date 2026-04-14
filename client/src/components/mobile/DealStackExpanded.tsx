/**
 * DealStackExpanded — full-screen Vaul sheet showing every deal as a
 * compact peek-style row. Includes search + sort + filter controls.
 *
 * Triggered from DealStack's "+ N more" indicator. Solves the >4 deals
 * problem (Priya P0 from the second critique).
 */

import { Drawer } from 'vaul';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DealCard, daysSince, deriveUrgency, type DealCardData, type Urgency } from './DealCard';

type SortKey = 'urgency' | 'recent' | 'stage' | 'alpha';

const URGENCY_RANK: Record<Urgency, number> = { 'stuck': 0, 'needs-you': 1, 'on-track': 2 };
const GATE_RANK: Record<string, number> = {
  S5: 0, S4: 1, S3: 2, S2: 3, S1: 4, S0: 5,
  B5: 0, B4: 1, B3: 2, B2: 3, B1: 4, B0: 5,
  R5: 0, R4: 1, R3: 2, R2: 3, R1: 4, R0: 5,
  PMI3: 0, PMI2: 1, PMI1: 2, PMI0: 3,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  deals: DealCardData[];
  onDealTap: (dealId: number) => void;
}

const SORT_LABEL: Record<SortKey, string> = {
  urgency: 'Urgency',
  recent: 'Most recent',
  stage: 'Stage',
  alpha: 'A–Z',
};

const FILTER_KEYS = ['all', 'sell', 'buy', 'raise', 'pmi', 'needs-you', 'stuck', 'on-track'] as const;
type FilterKey = typeof FILTER_KEYS[number];

const FILTER_LABEL: Record<FilterKey, string> = {
  'all': 'All',
  'sell': 'Sell',
  'buy': 'Buy',
  'raise': 'Raise',
  'pmi': 'PMI',
  'needs-you': 'Needs you',
  'stuck': 'Stuck',
  'on-track': 'On track',
};

const SORT_STORAGE = 'smbx-deal-stack-sort';
const FILTER_STORAGE = 'smbx-deal-stack-filter';

export function DealStackExpanded({ open, onOpenChange, dark, deals, onDealTap }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>(() => {
    try { return (localStorage.getItem(SORT_STORAGE) as SortKey) || 'urgency'; } catch { return 'urgency'; }
  });
  const [filter, setFilter] = useState<FilterKey>(() => {
    try { return (localStorage.getItem(FILTER_STORAGE) as FilterKey) || 'all'; } catch { return 'all'; }
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(SORT_STORAGE, sort); } catch { /* ignore */ }
  }, [sort]);
  useEffect(() => {
    try { localStorage.setItem(FILTER_STORAGE, filter); } catch { /* ignore */ }
  }, [filter]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter(d => {
      // Search filter
      if (q) {
        const haystack = `${d.business_name || ''} ${d.industry || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Category filter
      if (filter === 'all') return true;
      if (['sell', 'buy', 'raise', 'pmi'].includes(filter)) {
        return (d.journey_type || '').toLowerCase() === filter;
      }
      // Urgency filter
      return deriveUrgency(d) === filter;
    });
  }, [deals, query, filter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case 'urgency':
        return arr.sort((a, b) => {
          const ua = URGENCY_RANK[deriveUrgency(a)];
          const ub = URGENCY_RANK[deriveUrgency(b)];
          if (ua !== ub) return ua - ub;
          return daysSince(a.updated_at) - daysSince(b.updated_at);
        });
      case 'recent':
        return arr.sort((a, b) => daysSince(a.updated_at) - daysSince(b.updated_at));
      case 'stage':
        return arr.sort((a, b) => {
          const ga = GATE_RANK[a.current_gate || ''] ?? 99;
          const gb = GATE_RANK[b.current_gate || ''] ?? 99;
          return ga - gb;
        });
      case 'alpha':
        return arr.sort((a, b) => (a.business_name || '').localeCompare(b.business_name || ''));
    }
  }, [filtered, sort]);

  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const chipBgIdle = dark ? '#1f2123' : '#ffffff';
  const chipBgActive = dark ? '#E8709A' : '#D44A78';
  const chipColorIdle = dark ? '#f0f0f3' : '#1a1c1e';
  const chipColorActive = '#ffffff';
  const inputBg = dark ? '#1f2123' : '#ffffff';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
        <Drawer.Content
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '92vh', maxHeight: '92dvh',
            background: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            outline: 'none',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.16)' }} />
          </div>

          {/* Header */}
          <div style={{ padding: '6px 18px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Drawer.Title asChild>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Sora, system-ui',
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: headingC,
                }}>
                  All deals
                  <span style={{ marginLeft: 8, color: mutedC, fontWeight: 600, fontSize: 16 }}>
                    {deals.length}
                  </span>
                </h2>
              </Drawer.Title>
            </div>

            {/* Search */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or industry…"
              type="search"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                border: `1px solid ${borderC}`,
                background: inputBg,
                color: headingC,
                fontFamily: 'Inter, system-ui',
                fontSize: 14,
                outline: 'none',
                marginBottom: 10,
              }}
            />

            {/* Sort + filter chips */}
            <div style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              touchAction: 'pan-x',
            }}>
              <span style={{
                fontFamily: 'Inter, system-ui', fontSize: 11, fontWeight: 700,
                color: mutedC, alignSelf: 'center',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                paddingRight: 4, flexShrink: 0,
              }}>
                Sort
              </span>
              {(Object.keys(SORT_LABEL) as SortKey[]).map(k => (
                <Chip
                  key={k}
                  active={sort === k}
                  label={SORT_LABEL[k]}
                  onClick={() => setSort(k)}
                  bgIdle={chipBgIdle} bgActive={chipBgActive}
                  colorIdle={chipColorIdle} colorActive={chipColorActive}
                  border={borderC}
                />
              ))}
            </div>
            <div style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              touchAction: 'pan-x',
              marginTop: 6,
            }}>
              <span style={{
                fontFamily: 'Inter, system-ui', fontSize: 11, fontWeight: 700,
                color: mutedC, alignSelf: 'center',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                paddingRight: 4, flexShrink: 0,
              }}>
                Show
              </span>
              {FILTER_KEYS.map(k => (
                <Chip
                  key={k}
                  active={filter === k}
                  label={FILTER_LABEL[k]}
                  onClick={() => setFilter(k)}
                  bgIdle={chipBgIdle} bgActive={chipBgActive}
                  colorIdle={chipColorIdle} colorActive={chipColorActive}
                  border={borderC}
                />
              ))}
            </div>
          </div>

          {/* Scrollable list */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '8px 16px calc(20px + env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {sorted.length === 0 ? (
              <p style={{
                textAlign: 'center',
                fontSize: 14,
                color: mutedC,
                padding: '40px 16px',
                fontFamily: 'Inter, system-ui',
                fontStyle: 'italic',
              }}>
                {query ? 'No deals match your search.' : 'No deals match this filter.'}
              </p>
            ) : (
              sorted.map(deal => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  dark={dark}
                  peek
                  onTap={() => { onOpenChange(false); onDealTap(deal.id); }}
                />
              ))
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Chip({
  active, label, onClick,
  bgIdle, bgActive, colorIdle, colorActive, border,
}: {
  active: boolean; label: string; onClick: () => void;
  bgIdle: string; bgActive: string;
  colorIdle: string; colorActive: string; border: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        flexShrink: 0,
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${active ? bgActive : border}`,
        background: active ? bgActive : bgIdle,
        color: active ? colorActive : colorIdle,
        fontFamily: 'Inter, system-ui',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 160ms, border-color 160ms, color 160ms',
      }}
    >
      {label}
    </button>
  );
}

export default DealStackExpanded;
