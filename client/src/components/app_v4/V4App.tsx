/**
 * V4App — root of the Claude Design rebuild.
 *
 * Owns session state, mode (desktop/mobile), and composes the shell.
 * Individual region contents (V4Tool, V4Chat, V4Canvas, V4Rail) come
 * from `./chrome/*`. Mobile lives in `./mobile/MobileApp.tsx`.
 */

import { useEffect } from 'react';
import { useV4Session } from './session';
import V4Shell from './chrome/V4Shell';
import './tokens.css';

export default function V4App() {
  const session = useV4Session();
  const { ui, setUI } = session;

  // Read initial mode from query string on first mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('mode');
    if (q === 'mobile' || q === 'desktop') setUI({ mode: q });
  }, [setUI]);

  // 'd' / 'm' keyboard shortcut to flip modes (dev convenience).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'd') setUI({ mode: 'desktop' });
      if (e.key === 'm') setUI({ mode: 'mobile' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setUI]);

  return (
    <div className={`app-v4 app-v4--${ui.mode}`} data-density={ui.density}>
      <ModeSwitcher mode={ui.mode} onChange={(mode) => setUI({ mode })} />
      {ui.mode === 'desktop' ? (
        <V4Shell
          ui={ui}
          tool={<RegionStub label="V4Tool" width="var(--v4-tool-w)" side="left" />}
          chat={<RegionStub label="V4Chat" width="var(--v4-chat-w)" side="left-chat" />}
          canvas={<RegionStub label="V4Canvas" width="center" side="center" />}
          rail={<RegionStub label="V4Rail" width="var(--v4-rail-w)" side="right" />}
        />
      ) : (
        <MobileStub />
      )}
    </div>
  );
}

/* ─── Dev-only mode switcher (bottom-right pill). ─────────────────── */
function ModeSwitcher({ mode, onChange }: { mode: 'desktop' | 'mobile'; onChange: (m: 'desktop' | 'mobile') => void }) {
  const btn = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    borderRadius: 999,
    border: 'none',
    background: active ? 'var(--v4-ink)' : 'transparent',
    color: active ? 'var(--v4-on-ink)' : 'var(--v4-mute)',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
  });
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        padding: 4,
        background: 'var(--v4-card)',
        border: '0.5px solid var(--v4-card-line)',
        borderRadius: 999,
        boxShadow: 'var(--v4-shadow-md)',
        display: 'flex',
        gap: 2,
      }}
    >
      <button type="button" onClick={() => onChange('desktop')} style={btn(mode === 'desktop')}>
        Desktop
      </button>
      <button type="button" onClick={() => onChange('mobile')} style={btn(mode === 'mobile')}>
        Mobile
      </button>
    </div>
  );
}

/* ─── Region placeholders until the real components land. ────────── */
function RegionStub({ label, width, side }: { label: string; width: string; side: 'left' | 'left-chat' | 'center' | 'right' }) {
  const frame: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    bottom: 16,
    background: 'var(--v4-card)',
    border: '0.5px solid var(--v4-card-line)',
    borderRadius: 16,
    boxShadow: 'var(--v4-shadow-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--v4-faint)',
  };

  const sideStyle: React.CSSProperties =
    side === 'left'
      ? { left: 14, width }
      : side === 'left-chat'
        ? { left: `calc(14px + var(--v4-tool-w) + 14px)`, width }
        : side === 'right'
          ? { right: 14, width }
          : {
              left: `calc(14px + var(--v4-tool-w) + 14px + var(--v4-chat-w) + 14px)`,
              right: `calc(14px + var(--v4-rail-w) + 14px)`,
              borderRadius: 18,
              boxShadow: 'var(--v4-shadow-lg)',
            };

  return <div style={{ ...frame, ...sideStyle }}>{label}</div>;
}

function MobileStub() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <div style={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--v4-ink)' }}>
          Mobile shell — pending
        </div>
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: 'var(--v4-mute)', marginTop: 4 }}>
          Today · Deals · Chat · Inbox
        </div>
      </div>
    </div>
  );
}
