/**
 * PipelineTab — mode-adaptive pipeline view.
 *
 * Three modes (auto-detected from user role / data):
 *   - Portfolio: multi-deal buyer with active deals + scored watchlist
 *   - Sourcing: buyer mid-search with scored match list
 *   - Activity: solo seller with chronological activity feed
 *
 * Score bands are the primary content-level color in this tab
 * (green/amber/grey tinted pills with dark text).
 *
 * For v1 this is stubbed with the portfolio pattern. Mode detection + the
 * other two views land in the polish pass.
 */

type ScoreBand = 'high' | 'med' | 'low' | 'flag';

export default function PipelineTab() {
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
        Pipeline
      </h1>

      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Chip active>Active · 0</Chip>
        <Chip>Watch · 0</Chip>
        <Chip>Pass</Chip>
      </div>

      <EmptyHint />
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

// Score band component — content-level color. Used once real data lands.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ScoreBand({ band, n }: { band: ScoreBand; n: number }) {
  const bg: Record<ScoreBand, string> = {
    high: 'var(--band-high-bg)',
    med: 'var(--band-med-bg)',
    low: 'var(--band-low-bg)',
    flag: 'var(--band-flag-bg)',
  };
  const fg: Record<ScoreBand, string> = {
    high: 'var(--band-high-fg)',
    med: 'var(--band-med-fg)',
    low: 'var(--band-low-fg)',
    flag: 'var(--band-flag-fg)',
  };
  return (
    <span
      style={{
        padding: '2px 8px',
        background: bg[band],
        color: fg[band],
        borderRadius: 999,
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: 10,
      }}
    >
      {n}
    </span>
  );
}

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
