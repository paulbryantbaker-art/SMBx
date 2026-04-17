/**
 * DocsTab — App Store Apps pattern for deliverables.
 *
 * Structure:
 *   - Page title "Documents"
 *   - Filter chips: All · Ready · In progress · By stage
 *   - Featured card: Ready for review (Sora title, hero number, CTAs)
 *   - In-progress list: icon + title + status pill
 *
 * Peek → fullscreen + canvas tab switcher come in the polish pass.
 */

export default function DocsTab() {
  return (
    <div style={{ paddingBottom: 8 }}>
      <h1
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          padding: '6px 20px 10px',
          margin: 0,
        }}
      >
        Documents
      </h1>

      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Chip active>All</Chip>
        <Chip>Ready</Chip>
        <Chip>In progress</Chip>
        <Chip>By stage</Chip>
      </div>

      <SectionLabel>Ready for your review</SectionLabel>
      <FeaturedDoc
        kind="Baseline · v2"
        title="Acme HVAC"
        big="$2.4M – $2.9M"
        meta="SDE $695K · 3.5×–4.2× market multiple"
      />

      <SectionLabel>In progress</SectionLabel>
      <div style={{ padding: '0 16px' }}>
        <DocRow title="CIM draft" meta="10-page marketing doc · section 3 of 7" status="progress" pct={45} />
        <DocRow title="Add-back schedule" meta="47 candidates identified" status="ready" last />
      </div>
    </div>
  );
}

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

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        padding: '7px 12px',
        background: active ? 'var(--accent)' : 'var(--bg-card)',
        color: active ? '#fff' : 'var(--text-primary)',
        border: active ? 'none' : '0.5px solid var(--border)',
        borderRadius: 999,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: active ? 'none' : 'inset 0 0.5px 0 rgba(255,255,255,1)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function FeaturedDoc({
  kind,
  title,
  big,
  meta,
}: {
  kind: string;
  title: string;
  big: string;
  meta: string;
}) {
  return (
    <div
      style={{
        margin: '0 14px 12px',
        padding: 22,
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--r-card-lg)',
        boxShadow: 'var(--shadow-inset-highlight), var(--shadow-gg-card)',
      }}
    >
      <div
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {kind}
      </div>
      <h3
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: '-0.015em',
          color: 'var(--text-primary)',
          margin: '0 0 4px',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          lineHeight: 1.05,
          marginBottom: 6,
        }}
      >
        {big}
      </div>
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12.5,
          color: 'var(--text-muted)',
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        {meta}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '0.5px solid var(--border-strong, #D1D1D4)',
            borderRadius: 999,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Open fullscreen
        </button>
        <button
          type="button"
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-primary-btn)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Share PDF
        </button>
      </div>
    </div>
  );
}

function DocRow({
  title,
  meta,
  status,
  pct,
  last,
}: {
  title: string;
  meta: string;
  status: 'ready' | 'progress' | 'flag' | 'draft';
  pct?: number;
  last?: boolean;
}) {
  const dotColor: Record<string, string> = {
    ready: 'var(--dot-ready)',
    progress: 'var(--dot-progress)',
    flag: 'var(--dot-flag)',
    draft: 'var(--dot-draft)',
  };
  const label = status === 'progress' && pct != null ? `${pct}%` : status[0].toUpperCase() + status.slice(1);
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '12px 4px',
        borderBottom: last ? 'none' : '0.5px solid var(--border)',
        alignItems: 'center',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--bg-subtle)',
          border: '0.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3v5h5M5 3h9l5 5v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          {meta}
        </div>
      </div>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px 5px 9px',
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border)',
          borderRadius: 999,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10.5,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor[status] }} />
        {label}
      </span>
    </div>
  );
}
