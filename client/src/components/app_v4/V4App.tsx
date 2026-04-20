/**
 * V4App — root of the Claude Design rebuild.
 *
 * For now: just a mode switcher (desktop ↔ mobile) with placeholder bodies.
 * Real shells land in tasks #30+ (desktop) and #38+ (mobile).
 */

import { useEffect, useState } from 'react';
import './tokens.css';

type Mode = 'desktop' | 'mobile';

function readInitialMode(): Mode {
  if (typeof window === 'undefined') return 'desktop';
  const q = new URLSearchParams(window.location.search).get('mode');
  if (q === 'mobile' || q === 'desktop') return q;
  return 'desktop';
}

export default function V4App() {
  const [mode, setMode] = useState<Mode>(readInitialMode);

  // 'd' / 'm' keyboard shortcut to flip modes while focused on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'd') setMode('desktop');
      if (e.key === 'm') setMode('mobile');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`app-v4 app-v4--${mode}`}>
      <ModeSwitcher mode={mode} onChange={setMode} />
      {mode === 'desktop' ? <DesktopStub /> : <MobileStub />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Dev-only mode switcher. Small floating pill bottom-right.
   Removed once the real shells are in place + mode is user-selected
   inside the app proper.
   ───────────────────────────────────────────────────────────────────── */
function ModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const btnStyle = (active: boolean): React.CSSProperties => ({
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
      <button type="button" onClick={() => onChange('desktop')} style={btnStyle(mode === 'desktop')}>
        Desktop
      </button>
      <button type="button" onClick={() => onChange('mobile')} style={btnStyle(mode === 'mobile')}>
        Mobile
      </button>
    </div>
  );
}

/* Placeholder bodies until the real shells land. */
function DesktopStub() {
  return (
    <div style={{ ...stubBase, background: 'var(--v4-bg)' }}>
      <div>
        <div style={{ fontFamily: "'Sora', system-ui", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--v4-ink)' }}>
          Desktop shell — pending
        </div>
        <div style={{ fontFamily: "'Inter', system-ui", fontSize: 13, color: 'var(--v4-mute)', marginTop: 4 }}>
          V4Shell · V4Tool · V4Chat · V4Canvas · V4Rail
        </div>
      </div>
    </div>
  );
}
function MobileStub() {
  return (
    <div style={{ ...stubBase, background: 'var(--v4-bg)' }}>
      <div>
        <div style={{ fontFamily: "'Sora', system-ui", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--v4-ink)' }}>
          Mobile shell — pending
        </div>
        <div style={{ fontFamily: "'Inter', system-ui", fontSize: 13, color: 'var(--v4-mute)', marginTop: 4 }}>
          Today · Deals · Chat · Inbox
        </div>
      </div>
    </div>
  );
}
const stubBase: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};
