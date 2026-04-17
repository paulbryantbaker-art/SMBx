/**
 * PipelineTab — the user's full portfolio view.
 *
 * Groups all deals into three buckets:
 *   - Active: past intake, engaged (S2+ / B2+ / R2+ / PMI1+)
 *   - Exploring: intake-stage (S0/S1, B0/B1, R0/R1, PMI0) or no gate yet
 *   - Closed: status-based (closed, archived, dropped)
 *
 * Each deal renders as a list row with business name, stage, urgency dot,
 * and a tap target that selects the deal (routes back to Deal tab via the
 * onSelectDeal callback wired to authChat.selectConversation).
 *
 * When the user has zero deals, the empty-state hint still shows.
 */

import { useMemo } from 'react';
import type { AppDeal, StatusKind } from '../types';

const GATE_LABEL: Record<string, string> = {
  S0: 'Getting started', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Matching', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due diligence', B4: 'Structuring', B5: 'Closing',
  R0: 'Getting started', R1: 'Package', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day zero', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

type Bucket = 'active' | 'exploring' | 'closed';

function bucketOf(deal: AppDeal): Bucket {
  const status = (deal.status || '').toLowerCase();
  if (status === 'closed' || status === 'archived' || status === 'dropped') return 'closed';
  const gate = deal.current_gate || '';
  if (!gate || /^(S0|S1|B0|B1|R0|R1|PMI0)$/.test(gate)) return 'exploring';
  return 'active';
}

function urgencyOf(deal: AppDeal): StatusKind {
  const status = (deal.status || '').toLowerCase();
  if (status === 'closed' || status === 'archived' || status === 'dropped') return 'draft';
  const gate = deal.current_gate || '';
  if (!gate) return 'draft';
  if (/^(S4|S5|B4|B5|R4|R5|PMI3)$/.test(gate)) return 'ready';
  if (/^(S2|S3|B2|B3|R2|R3|PMI1|PMI2)$/.test(gate)) return 'progress';
  return 'draft';
}

interface Props {
  deals: AppDeal[];
  activeDealId: number | null;
  onSelectDeal: (dealId: number) => void;
}

export default function PipelineTab({ deals, activeDealId, onSelectDeal }: Props) {
  const { buckets, visible } = useMemo(() => {
    const b: Record<Bucket, AppDeal[]> = { active: [], exploring: [], closed: [] };
    for (const d of deals) b[bucketOf(d)].push(d);
    for (const k of Object.keys(b) as Bucket[]) {
      b[k].sort((a, x) => {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const tb = x.updated_at ? new Date(x.updated_at).getTime() : 0;
        return tb - ta;
      });
    }
    const order: Bucket[] = ['active', 'exploring', 'closed'];
    return { buckets: b, visible: order.filter((k) => b[k].length > 0) };
  }, [deals]);

  if (deals.length === 0) {
    return (
      <div style={{ paddingBottom: 8 }}>
        <PageTitle>Pipeline</PageTitle>
        <EmptyHint />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 8 }}>
      <PageTitle>Pipeline</PageTitle>

      {visible.map((bucket) => (
        <section key={bucket} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '0 20px',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {BUCKET_LABEL[bucket]}
            </span>
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                color: 'var(--text-muted)',
              }}
            >
              {buckets[bucket].length}
            </span>
          </div>
          <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {buckets[bucket].map((d) => (
              <PipelineRow
                key={d.id}
                deal={d}
                active={d.id === activeDealId}
                onTap={() => onSelectDeal(d.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const BUCKET_LABEL: Record<Bucket, string> = {
  active: 'Active',
  exploring: 'Exploring',
  closed: 'Closed',
};

/* ─── Page title ─── */
function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: 28,
        letterSpacing: '-0.025em',
        color: 'var(--text-primary)',
        padding: '6px 20px 14px',
        margin: 0,
      }}
    >
      {children}
    </h1>
  );
}

/* ─── Pipeline row — full-width deal card ─── */
function PipelineRow({
  deal,
  active,
  onTap,
}: {
  deal: AppDeal;
  active: boolean;
  onTap: () => void;
}) {
  const name = deal.business_name || 'Untitled deal';
  const gate = deal.current_gate || '';
  const stageLong = gate ? GATE_LABEL[gate] || gate : 'Not started';
  const urgency = urgencyOf(deal);
  const industry = deal.industry;
  const updated = deal.updated_at ? relativeDate(deal.updated_at) : null;
  const dotColor: Record<StatusKind, string> = {
    ready: 'var(--dot-ready)',
    progress: 'var(--dot-progress)',
    flag: 'var(--dot-flag)',
    draft: 'var(--dot-draft)',
  };
  const urgencyLabel: Record<StatusKind, string> = {
    ready: 'Closing',
    progress: 'In progress',
    flag: 'Needs attention',
    draft: 'Early',
  };

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`${name} — ${stageLong} — ${urgencyLabel[urgency]}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '14px 16px',
        background: 'var(--bg-card)',
        border: active ? '1px solid var(--accent)' : '0.5px solid var(--border)',
        borderRadius: 14,
        color: 'var(--text-primary)',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: 'var(--shadow-inset-highlight), var(--shadow-gg-card)',
        transition: 'border-color 150ms ease, transform 150ms ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          minWidth: 0,
        }}
      >
        <h3
          style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            margin: 0,
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={name}
        >
          {name}
        </h3>
        <span
          style={{
            flexShrink: 0,
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 9.5,
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: 999,
            background: 'var(--accent-fill)',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
          }}
        >
          {gate || '—'}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12,
          color: 'var(--text-muted)',
          minWidth: 0,
        }}
      >
        <span
          role="img"
          aria-label={`Status: ${urgencyLabel[urgency]}`}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: dotColor[urgency],
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{urgencyLabel[urgency]}</span>
        <span aria-hidden>·</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {stageLong}
        </span>
        {(industry || updated) && <span aria-hidden>·</span>}
        {industry && (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {industry}
          </span>
        )}
        {updated && !industry && <span>{updated}</span>}
      </div>
    </button>
  );
}

function relativeDate(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const diffDays = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
    if (Number.isNaN(diffDays)) return '';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  } catch {
    return '';
  }
}

/* ─── Empty state ─── */
function EmptyHint() {
  return (
    <div
      style={{
        margin: '24px 14px 12px',
        padding: 22,
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--r-card-lg)',
        boxShadow: 'var(--shadow-inset-highlight), var(--shadow-gg-card)',
        textAlign: 'center',
      }}
    >
      <h3
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: 'var(--text-primary)',
          margin: '0 0 6px',
          letterSpacing: '-0.01em',
        }}
      >
        No pipeline yet
      </h3>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12.5,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        Pipeline fills in when you start sourcing matches (buy) or tracking interested buyers (sell).
      </p>
    </div>
  );
}
