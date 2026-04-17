/**
 * Glass Grok · Home (/)
 * ─────────────────────────────────────────────────────────────────────
 * The front door. Minimal hero: H1, tagline, chat input, trust bar.
 * Nothing else competes. On send, the existing AppShell landing→chat
 * morph takes over via onSend(text).
 *
 * Spec source: Glass Grok/Grok Glass Journey.html (prototype 1)
 *              Glass Grok/SMBX_SITE_COPY.md (page 1)
 */

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import '../glass.css';
import { Footer } from '../primitives';

/* ─── Rotating placeholder hints ────────────────────────────────────── */
const ROTATING_HINTS = [
  'Screen a deal in 90 seconds…',
  'Find the add-backs hiding in your financials…',
  'Draft a CIM from a conversation…',
  'Model an SBA structure under SOP 50 10 8…',
  'Build your LP update in 20 minutes…',
  'What\u2019s this business actually worth…',
];

/* ─── Plus-button journey shortcuts ─────────────────────────────────── */
type Journey = 'sell' | 'buy' | 'raise' | 'integrate';
const SHORTCUTS: { label: string; journey: Journey; prefill: string }[] = [
  { label: 'Sell my business', journey: 'sell',
    prefill: 'I\u2019m thinking about selling my business. ' },
  { label: 'Buy a business', journey: 'buy',
    prefill: 'I\u2019m looking at a deal. ' },
  { label: 'Raise capital',    journey: 'raise',
    prefill: 'I want liquidity but I\u2019m not sure I want to sell entirely. ' },
  { label: 'Just acquired',    journey: 'integrate',
    prefill: 'I just closed on an acquisition. ' },
];

interface HomeProps {
  user: { display_name?: string | null; email?: string | null } | null;
  authLoading: boolean;
  onSend: (text: string) => void;
  onNavigateJourney: (journey: Journey) => void;
}

export default function Home({ user, authLoading, onSend, onNavigateJourney }: HomeProps) {
  const [text, setText] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  /* Rotate placeholder every 4s — only when the field is empty and
     unfocused. Respects reduced-motion (no rotation). */
  useEffect(() => {
    if (text) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setHintIndex(i => (i + 1) % ROTATING_HINTS.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [text]);

  /* Close plus-popup on outside click or Escape */
  useEffect(() => {
    if (!popupOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setPopupOpen(false);
    };
    window.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [popupOpen]);

  const submit = (raw: string) => {
    const msg = raw.trim();
    if (!msg) return;
    setText('');
    onSend(msg);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(text);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(text);
    }
  };

  const firstName = user?.display_name?.split(' ')[0];

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--gg-bg-app)',
        color: 'var(--gg-text-primary)',
        minHeight: '100%',
        fontFamily: 'var(--gg-body)',
      }}
    >
      {/* ── Floating glass nav pill ─────────────────────────────────── */}
      <nav
        className="gg-nav"
        style={{
          position: 'absolute',
          top: 24, left: 16, right: 16,
          zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px 10px 18px',
          height: 56,
        }}
      >
        <div className="gg-logo" style={{ fontSize: 18 }}>smbx.ai</div>
        <button
          type="button"
          className="gg-btn gg-btn--primary gg-btn--pill"
          style={{ padding: '9px 16px', fontSize: 12 }}
          onClick={() => inputRef.current?.focus()}
        >
          Start free
        </button>
      </nav>

      {/* ── Centered hero ───────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 20px 80px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 680 }} className="gg-enter">
          {/* Logged-in greeting branch — tight, personal */}
          {user && !authLoading ? (
            <>
              <h1 className="gg-h1" style={{ marginBottom: 18 }}>
                Welcome back{firstName ? `, ${firstName}` : ''}.
              </h1>
              <p className="gg-body gg-body--lead" style={{ marginBottom: 36, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Pick up where you left off. Tell Yulia what you&rsquo;re working on.
              </p>
            </>
          ) : (
            <>
              <h1 className="gg-h1" style={{ marginBottom: 20 }}>
                The AI deal team.
              </h1>
              <p
                className="gg-body gg-body--lead"
                style={{ marginBottom: 36, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}
              >
                Valuations. CIMs. Deal scoring. Financial models. Due diligence. LOIs. Everything an investment bank delivers &mdash; without the retainer.
              </p>
            </>
          )}

          {/* ── Chat input (the conversion element) ───────────────── */}
          <form onSubmit={onSubmit} style={{ position: 'relative' }}>
            <div className="gg-chat" style={{ marginBottom: 16 }}>
              {/* Plus button → journey shortcuts popup */}
              <button
                type="button"
                className="gg-chat__plus"
                aria-label="Journey shortcuts"
                aria-expanded={popupOpen}
                onClick={() => setPopupOpen(v => !v)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <input
                ref={inputRef}
                className="gg-chat__field"
                type="text"
                value={text}
                placeholder={ROTATING_HINTS[hintIndex]}
                onChange={e => setText(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="gg-chat__send"
                aria-label="Send"
                disabled={!text.trim()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </button>
            </div>

            {/* ── Plus-button popup: 4 journey shortcuts ────────── */}
            {popupOpen && (
              <div
                ref={popupRef}
                className="gg-glass-strong"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 'var(--gg-r-card)',
                  minWidth: 240,
                  zIndex: 40,
                  textAlign: 'left',
                  animation: 'gg-fade-up 200ms var(--gg-ease-spring) both',
                }}
                role="menu"
              >
                {SHORTCUTS.map(s => (
                  <button
                    key={s.journey}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setPopupOpen(false);
                      onNavigateJourney(s.journey);
                    }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '10px 12px',
                      border: 0, background: 'transparent', cursor: 'pointer',
                      fontFamily: 'var(--gg-body)',
                      fontSize: 14, fontWeight: 600,
                      color: 'var(--gg-text-primary)',
                      borderRadius: 'var(--gg-r-btn)',
                      transition: 'background var(--gg-t-feedback) var(--gg-ease-snap)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--gg-accent-fill)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* ── Trust bar ──────────────────────────────────────────── */}
          <div style={{ marginTop: 32, fontFamily: 'var(--gg-display)' }}>
            <div
              style={{
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--gg-text-muted)',
                marginBottom: 8,
              }}
            >
              Built on
            </div>
            <div
              style={{
                fontSize: 12, fontWeight: 600,
                letterSpacing: '0.05em',
                color: 'var(--gg-text-faint)',
                lineHeight: 1.6,
                maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
              }}
            >
              U.S. Census &middot; BLS &middot; FRED &middot; SEC EDGAR &middot; SBA &middot; IRS SOI
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
