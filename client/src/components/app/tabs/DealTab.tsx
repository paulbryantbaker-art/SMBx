/**
 * DealTab — App Store Today pattern for the current deal.
 *
 * Structure:
 *   - Page title (deal name, Sora 28px/800)
 *   - Stage label (eyebrow)
 *   - Hero card (solid white, 22px radius, inset highlight + soft shadow)
 *     - Journey icon + business name + stage pill (accent-fill pill)
 *     - Hero number (Sora 30px/800)
 *     - Refined line (meta)
 *     - Progress bar (monochrome gradient)
 *   - Stats strip (4 stat cells)
 *   - Do-next card with black primary button
 *   - Recent activity list with status dots
 *
 * Content-color rule: only status dots are colored. Numbers and text are
 * --text-primary. No journey tinting in chrome.
 */

import type { AppDeal } from '../types';

const GATE_LABEL: Record<string, string> = {
  S0: 'Getting started', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Matching', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due diligence', B4: 'Structuring', B5: 'Closing',
  R0: 'Getting started', R1: 'Package', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day zero', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

interface Props {
  deal: AppDeal | null;
}

export default function DealTab({ deal }: Props) {
  if (!deal) return <EmptyDealState />;

  const stageShort = deal.current_gate || 'S0';
  const stageLong = GATE_LABEL[stageShort] || 'Getting started';
  const name = deal.business_name || 'Deal';

  return (
    <div style={{ paddingBottom: 8 }}>
      <h1
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          padding: '6px 20px 14px',
          margin: 0,
          /* Long business names (legal entity names can be 60+ chars) truncate
             cleanly instead of wrapping into a second line that breaks the
             stage-label rhythm below. */
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={name}
      >
        {name}
      </h1>

      <SectionLabel>Stage · {stageLong}</SectionLabel>

      <HeroCard deal={deal} />

      <StatsStrip
        stats={[
          { n: '$47K', l: 'Add-backs' },
          { n: '60%', l: 'Recurring' },
          { n: String(deal.conversations?.length ?? 0), l: 'Chapters' },
          { n: stageShort, l: 'Gate' },
        ]}
      />

      <SectionLabel>Do next</SectionLabel>
      <DoNextCard
        title="Generate your CIM"
        meta="10–12 page marketing package built from your P&L, add-backs, and story."
        action="Start CIM"
      />

      <SectionLabel>Recent activity</SectionLabel>
      <div style={{ padding: '0 20px' }}>
        <ActivityRow status="ready" title={<>Yulia produced <strong>Baseline v2</strong></>} meta="2h ago" />
        <ActivityRow status="draft" title="P&L extraction complete" meta="3h ago · 47 add-back candidates" last />
      </div>
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        padding: '0 20px',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Hero card (App Store Today pattern) ─── */
function HeroCard({ deal }: { deal: AppDeal }) {
  const stageShort = deal.current_gate || 'S0';
  const name = deal.business_name || 'Deal';
  const industry = deal.industry || '';

  return (
    <div
      style={{
        margin: '0 14px 12px',
        padding: 22,
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--r-card-lg)',
        boxShadow:
          'var(--shadow-inset-highlight), 0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
        <div
          aria-hidden
          style={{
            width: 50,
            height: 50,
            borderRadius: 13,
            background: 'var(--bg-subtle)',
            border: '0.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9z" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
              margin: '0 0 2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </h2>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11.5,
              color: 'var(--text-muted)',
            }}
          >
            {industry || 'Set up in progress'}
          </div>
        </div>
        <span
          style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 9.5,
            letterSpacing: '0.08em',
            padding: '4px 9px',
            borderRadius: 999,
            background: 'var(--accent-fill)',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
          }}
        >
          {stageShort}
        </span>
      </div>

      <div
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.05,
          marginBottom: 4,
        }}
      >
        $2.4M – $2.9M
      </div>
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11.5,
          color: 'var(--text-muted)',
          marginBottom: 14,
        }}
      >
        Refined · Adjusted SDE $695K · 3.5×–4.2×
      </div>

      <div
        style={{
          height: 5,
          background: 'var(--bg-muted)',
          borderRadius: 3,
          position: 'relative',
          marginBottom: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '32%',
            right: '22%',
            top: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #6B6B70, #0A0A0B)',
            borderRadius: 3,
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10.5,
          color: 'var(--text-muted)',
        }}
      >
        <span>$1.5M</span>
        <span>$3.6M</span>
      </div>
    </div>
  );
}

/* ─── Stats strip ─── */
function StatsStrip({ stats }: { stats: Array<{ n: string; l: string }> }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        margin: '0 14px 12px',
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-inset-highlight)',
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            padding: '12px 6px',
            textAlign: 'center',
            borderRight: i < stats.length - 1 ? '0.5px solid var(--border)' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}
          >
            {s.n}
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Do-next card ─── */
function DoNextCard({
  title,
  meta,
  action,
}: {
  title: string;
  meta: string;
  action: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 18,
        padding: 16,
        margin: '0 14px 12px',
        boxShadow: 'var(--shadow-inset-highlight)',
      }}
    >
      <h3
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--text-primary)',
          margin: '0 0 3px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11.5,
          color: 'var(--text-muted)',
          margin: '0 0 12px',
          lineHeight: 1.45,
        }}
      >
        {meta}
      </p>
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 14px',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: 999,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11.5,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-primary-btn)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {action}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Activity row with status dot ─── */
const STATUS_LABEL: Record<'ready' | 'progress' | 'flag' | 'draft', string> = {
  ready: 'Ready',
  progress: 'In progress',
  flag: 'Needs attention',
  draft: 'Draft',
};

function ActivityRow({
  status,
  title,
  meta,
  last,
}: {
  status: 'ready' | 'progress' | 'flag' | 'draft';
  title: React.ReactNode;
  meta: string;
  last?: boolean;
}) {
  const resolvedStatus = STATUS_LABEL[status] ? status : 'draft';
  const dotColor: Record<string, string> = {
    ready: 'var(--dot-ready)',
    progress: 'var(--dot-progress)',
    flag: 'var(--dot-flag)',
    draft: 'var(--dot-draft)',
  };
  const statusLabel = STATUS_LABEL[resolvedStatus];

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '10px 0',
        borderBottom: last ? 'none' : '0.5px solid var(--border)',
        alignItems: 'flex-start',
      }}
    >
      <span
        role="img"
        aria-label={`Status: ${statusLabel}`}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: dotColor[resolvedStatus],
          marginTop: 7,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12.5,
            fontWeight: 500,
            color: 'var(--text-primary)',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10.5,
            color: 'var(--text-muted)',
          }}
        >
          {/* Status text pair-up satisfies WCAG 1.4.1 (Use of Color) — color
             is not the only means of conveying the status signal. */}
          <span style={{ fontWeight: 600 }}>{statusLabel}</span>
          <span aria-hidden> · </span>
          {meta}
        </div>
      </div>
    </div>
  );
}

/* ─── Empty state — no deal yet ─── */
function EmptyDealState() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 32px',
        textAlign: 'center',
        gap: 14,
      }}
    >
      <h1
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        Let's start a deal.
      </h1>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          color: 'var(--text-muted)',
          lineHeight: 1.55,
          margin: 0,
          maxWidth: 300,
        }}
      >
        Tell Yulia what you're working on and this tab will fill in with your valuation, progress, and next steps.
      </p>
    </div>
  );
}
