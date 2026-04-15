/**
 * MobileNotionHome — the home surface inside the mobile PWA.
 *
 * See memory/architecture_pwa_only.md for the gate rule (why only PWA
 * users ever see this) and memory/architecture_mobile_notion.md for the
 * Notion UX direction.
 *
 * Structure, top-to-bottom:
 *   1. Workspace header — workspace pill (tap → account sheet) + ⋯ menu
 *   2. "Recents" horizontal strip — top 5 most-recently-touched deals
 *      (rendered via existing DealStack, capped)
 *   3. "All deals" collapsible list — each deal row expands to show its
 *      conversations as children (Notion page-tree pattern)
 *   4. Chat dock sits BELOW this component at the bottom of the viewport
 *      (not this component's responsibility — AppShell positions it)
 *
 * Apple Glass material on the workspace header. Everything else is solid
 * paper-like surface — documents should read, not glow.
 *
 * Not yet implemented (tracked in issue #1):
 *   - Pipeline bucketing (Reviewing / LOI / Active / Archived) — needs
 *     reliable backend gate/status data first
 *   - Recent Documents section — needs cross-session doc history
 *   - Breadcrumb header for open docs (lives in the canvas overlay, not
 *     here)
 */

import { useState, useMemo } from 'react';
import { DealStack, filterRealDeals } from './DealStack';

/* ═══ Pipeline bucketing ═══
   Group deals into sections that match how deal operators mentally slice
   their portfolio. Buckets are journey-agnostic (apply to sell/buy/raise/
   PMI alike) and use gate number as the axis:
   - Active:    late gates (close-adjacent). S4-5, B4-5, R4-5, PMI3.
   - In motion: middle gates. S2-3, B2-3, R2-3, PMI1-2.
   - Reviewing: early gates + ungated. S0-1, B0-1, R0-1, PMI0, null.
   - Archived:  status-based, irrespective of gate.
   Empty buckets collapse (don't render the header).
*/
type Bucket = 'active' | 'motion' | 'reviewing' | 'archived';

function bucketOf(deal: { current_gate: string | null; status?: string | null }): Bucket {
  const status = (deal.status || '').toLowerCase();
  if (status === 'archived' || status === 'closed' || status === 'dropped') return 'archived';
  const g = deal.current_gate || '';
  // Late gates across all journeys
  if (/^(S4|S5|B4|B5|R4|R5|PMI3)$/.test(g)) return 'active';
  // Middle gates
  if (/^(S2|S3|B2|B3|R2|R3|PMI1|PMI2)$/.test(g)) return 'motion';
  // Everything else — early or unset
  return 'reviewing';
}

const BUCKET_META: Record<Bucket, { label: string; sub: string }> = {
  active: { label: 'Active', sub: 'In diligence, LOI, or closing' },
  motion: { label: 'In motion', sub: 'Valuation, negotiation, packaging' },
  reviewing: { label: 'Reviewing', sub: 'Early-stage or not yet qualified' },
  archived: { label: 'Archived', sub: 'Closed or dropped' },
};

const JOURNEY_COLORS: Record<string, { light: string; dark: string }> = {
  sell: { light: '#D44A78', dark: '#E8709A' },
  buy: { light: '#3E8E8E', dark: '#52A8A8' },
  raise: { light: '#C99A3E', dark: '#DDB25E' },
  pmi: { light: '#8F4A7A', dark: '#AE6D9A' },
  integrate: { light: '#8F4A7A', dark: '#AE6D9A' },
};
const DEFAULT_ACCENT = { light: '#D44A78', dark: '#E8709A' };

interface ConvoItem {
  id: number;
  title: string;
  summary?: string;
  gate_label?: string;
  active?: boolean;
}

interface DealItem {
  id: number;
  business_name: string | null;
  journey_type: string | null;
  current_gate: string | null;
  industry: string | null;
  league?: string | null;
  updated_at: string | null;
  status?: string | null;
  conversations: ConvoItem[];
}

interface Props {
  dark: boolean;
  loading: boolean;
  userName?: string | null;
  deals: DealItem[];
  activeConversationId: number | null;
  justCreatedDealId?: number | null;

  onDealTap: (dealId: number) => void;
  onDealLongPress?: (dealId: number) => void;
  onConversationTap: (convId: number) => void;
  onSeeAll: () => void;
  onStartFirstDeal: (fill: string) => void;
  onAccountTap: () => void;
  onMenuTap?: () => void;
}

export default function MobileNotionHome({
  dark,
  loading,
  userName,
  deals,
  activeConversationId,
  justCreatedDealId,
  onDealTap,
  onDealLongPress,
  onConversationTap,
  onSeeAll,
  onStartFirstDeal,
  onAccountTap,
  onMenuTap,
}: Props) {
  const realDeals = useMemo(() => filterRealDeals(deals), [deals]);

  // "Recents" = top 5 most-recently-updated deals. Sort by updated_at desc;
  // fall back to id order if timestamps missing.
  const recents = useMemo(() => {
    return [...realDeals]
      .sort((a, b) => {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return b.id - a.id;
      })
      .slice(0, 5);
  }, [realDeals]);

  // Pipeline buckets — only render a section when it has ≥1 deal.
  const buckets = useMemo(() => {
    const out: Record<Bucket, DealItem[]> = { active: [], motion: [], reviewing: [], archived: [] };
    for (const d of realDeals) out[bucketOf(d)].push(d);
    // Within a bucket, sort by most-recently updated first
    for (const k of Object.keys(out) as Bucket[]) {
      out[k].sort((a, b) => {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return tb - ta;
      });
    }
    return out;
  }, [realDeals]);
  const bucketOrder: Bucket[] = ['active', 'motion', 'reviewing', 'archived'];
  const visibleBuckets = bucketOrder.filter(b => buckets[b].length > 0);

  // Theme
  const pageBg = dark ? '#0f1012' : '#F9F9FC';
  const heading = dark ? '#F9F9FC' : '#0f1012';
  const body = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const muted = dark ? 'rgba(218,218,220,0.55)' : '#6e6a63';
  const sectionLabel = dark ? 'rgba(218,218,220,0.45)' : '#9ea0a5';
  const border = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const rowHover = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)';
  const glassBg = dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.82)';
  const accent = dark ? '#E8709A' : '#D44A78';

  const firstInitial = (userName || 'Y').trim().charAt(0).toUpperCase();
  const workspaceLabel = userName
    ? `${userName.split(' ')[0]}'s workspace`
    : 'Your workspace';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: pageBg,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ─── Workspace header — Apple Glass pill row ─── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          padding: '12px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: glassBg,
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <button
          onClick={onAccountTap}
          type="button"
          aria-label="Account and workspace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px 4px 4px',
            borderRadius: 999,
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)',
            border: `1px solid ${border}`,
            cursor: 'pointer',
            maxWidth: 240,
            WebkitTapHighlightColor: 'transparent',
          }}
          className="active:scale-[0.98]"
        >
          <span
            aria-hidden
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: `linear-gradient(135deg, ${accent}, ${dark ? '#AE6D9A' : '#E8709A'})`,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {firstInitial}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: heading,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
              letterSpacing: '-0.005em',
            }}
          >
            {workspaceLabel}
          </span>
          {/* Discoverability chevron — signals the pill opens a menu. */}
          <svg
            aria-hidden
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={muted}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ flexShrink: 0, marginLeft: -2 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {onMenuTap && (
          <button
            onClick={onMenuTap}
            type="button"
            aria-label="Menu"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `1px solid ${border}`,
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
              color: body,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
            className="active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── Scrollable body ─── */}
      <div
        className="mobile-notion-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 24,
        }}
      >
        {/* RECENTS */}
        {recents.length > 0 && (
          <section style={{ padding: '18px 0 10px' }}>
            <div style={{ padding: '0 16px', marginBottom: 10 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: sectionLabel,
                }}
              >
                Recents
              </p>
            </div>
            <DealStack
              loading={loading}
              deals={recents.map(d => ({
                id: d.id,
                business_name: d.business_name,
                journey_type: d.journey_type,
                current_gate: d.current_gate,
                industry: d.industry,
                league: d.league,
                updated_at: d.updated_at,
                status: d.status,
              }))}
              onDealTap={onDealTap}
              onStartFirstDeal={onStartFirstDeal}
              onDealLongPress={onDealLongPress}
              onSeeAll={onSeeAll}
              justCreatedDealId={justCreatedDealId}
              dark={dark}
            />
          </section>
        )}

        {/* PIPELINE BUCKETS — Notion-style expandable page-tree, grouped
            by pipeline stage. Each bucket is a collapsible section; empty
            buckets don't render at all. Within each bucket, deals sort by
            most-recently updated. */}
        {realDeals.length === 0 ? (
          <section style={{ padding: '10px 16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sectionLabel }}>
                All deals
              </p>
            </div>
            <EmptyState
              muted={muted}
              heading={heading}
              onStart={() => onStartFirstDeal('I want to sell my business — ')}
              accent={accent}
            />
          </section>
        ) : (
          visibleBuckets.map((bucket) => {
            const items = buckets[bucket];
            const meta = BUCKET_META[bucket];
            return (
              <section key={bucket} style={{ padding: '10px 16px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sectionLabel }}>
                      {meta.label}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: muted, fontWeight: 500 }}>
                      {meta.sub}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: muted }}>
                    {items.length}
                  </span>
                </div>
                <div>
                  {items.map((deal) => (
                    <DealTreeRow
                      key={deal.id}
                      deal={deal}
                      dark={dark}
                      activeConversationId={activeConversationId}
                      onDealTap={onDealTap}
                      onConversationTap={onConversationTap}
                      heading={heading}
                      body={body}
                      muted={muted}
                      border={border}
                      rowHover={rowHover}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      <style>{`
        .mobile-notion-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* ═══ Subcomponents ═══ */

function DealTreeRow({
  deal, dark, activeConversationId, onDealTap, onConversationTap,
  heading, body, muted, border, rowHover,
}: {
  deal: DealItem;
  dark: boolean;
  activeConversationId: number | null;
  onDealTap: (id: number) => void;
  onConversationTap: (id: number) => void;
  heading: string;
  body: string;
  muted: string;
  border: string;
  rowHover: string;
}) {
  const [expanded, setExpanded] = useState(() => {
    // Deals with an active conversation or justCreated deal are expanded by default.
    return deal.conversations.some(c => c.id === activeConversationId);
  });
  const j = (deal.journey_type || '').toLowerCase();
  const accent = JOURNEY_COLORS[j]
    ? (dark ? JOURNEY_COLORS[j].dark : JOURNEY_COLORS[j].light)
    : (dark ? DEFAULT_ACCENT.dark : DEFAULT_ACCENT.light);
  const convosCount = deal.conversations.length;
  const title = deal.business_name || `Deal ${deal.id}`;

  return (
    <div style={{ marginBottom: 2 }}>
      <div
        className="mobile-notion-deal-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 8px 8px 4px',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        <button
          onClick={() => setExpanded(e => !e)}
          type="button"
          aria-label={expanded ? 'Collapse deal' : 'Expand deal'}
          style={{
            width: 22, height: 22, flexShrink: 0,
            border: 'none', background: 'transparent',
            color: muted, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6,
          }}
        >
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button
          onClick={() => onDealTap(deal.id)}
          type="button"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            minWidth: 0,
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8, height: 8, borderRadius: 2,
              background: accent, flexShrink: 0,
            }}
          />
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 14,
              fontWeight: 600,
              color: heading,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.005em',
            }}
            title={title}
          >
            {title}
          </span>
          {convosCount > 1 && (
            <span
              aria-hidden
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: muted,
                flexShrink: 0,
              }}
            >
              {convosCount}
            </span>
          )}
        </button>
      </div>

      {expanded && convosCount > 0 && (
        <ul style={{ margin: 0, padding: '0 0 4px 22px', listStyle: 'none' }}>
          {deal.conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <li key={conv.id}>
                <button
                  onClick={() => onConversationTap(conv.id)}
                  type="button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px 6px 10px',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? accent : border}`,
                    background: isActive ? `${accent}14` : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    borderRadius: '0 8px 8px 0',
                    marginBottom: 1,
                  }}
                >
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isActive ? accent : muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? heading : body,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {conv.title || 'Conversation'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <style>{`
        .mobile-notion-deal-row:hover { background: ${rowHover} !important; }
      `}</style>
    </div>
  );
}

function EmptyState({
  muted, heading, accent, onStart,
}: {
  muted: string;
  heading: string;
  accent: string;
  onStart: () => void;
}) {
  return (
    <div
      style={{
        padding: '32px 20px',
        textAlign: 'center',
        border: `1.5px dashed ${muted}40`,
        borderRadius: 14,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: heading,
          marginBottom: 4,
        }}
      >
        No deals yet.
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: muted,
          lineHeight: 1.5,
          marginBottom: 14,
        }}
      >
        Tell Yulia about a business you're buying, selling, raising for, or just closed.
      </p>
      <button
        onClick={onStart}
        type="button"
        style={{
          padding: '8px 16px',
          borderRadius: 999,
          border: 'none',
          background: accent,
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
        className="active:scale-95"
      >
        Start your first deal
      </button>
    </div>
  );
}
