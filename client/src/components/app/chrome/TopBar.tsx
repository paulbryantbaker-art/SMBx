/**
 * TopBar — the minimal app header.
 *
 * Left: smbx.ai plain-text wordmark (Sora 800, inherits color).
 * Right: profile avatar (opens account sheet).
 *
 * Never glass — the top bar sits directly on the app canvas (--bg-app) and
 * scroll content slides up behind the tab bar at the bottom, not behind the
 * top. So no blur here, just a solid transparent surface.
 */

interface Props {
  userInitial: string;
  onAccountTap: () => void;
  onHelpTap: () => void;
}

export default function TopBar({ userInitial, onAccountTap, onHelpTap }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        /* #app-root already adds paddingTop: env(safe-area-inset-top).
           DO NOT add it again here — it doubles the top gap. Small 6px
           paddingTop is enough to breathe off the status bar. */
        padding: '6px 18px 2px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 19,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        smbx.ai
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onHelpTap}
          type="button"
          aria-label="Help and glossary"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '0.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.9)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>

        <button
          onClick={onAccountTap}
          type="button"
          aria-label="Account"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '0.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.9)',
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {userInitial}
        </button>
      </div>
    </div>
  );
}
