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
}

export default function TopBar({ userInitial, onAccountTap }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px 4px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
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
  );
}
