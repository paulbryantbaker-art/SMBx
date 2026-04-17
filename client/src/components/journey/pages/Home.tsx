/**
 * Glass Grok · Home (/)
 * ─────────────────────────────────────────────────────────────────────
 * Desktop: app shell (sidebar + topbar) + 2-col hero (text left, peek
 * stack right) + 3 feature cards with geometric monochrome visuals.
 * Mobile: centered chat-first hero, unchanged.
 *
 * Spec sources:
 *  - Glass Grok/Grok Glass Journey.html (mobile hero)
 *  - Glass Grok desktop spec (this session — 2-col + peek + features)
 *  - SMBX_SITE_COPY.md (page 1)
 */

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import '../glass.css';
import { Page, type JourneyTab } from '../primitives';
import { PeekStack, VizBigStat, VizScoreCard, VizCapitalStack } from '../mockups';

/* ─── Rotating placeholder hints ────────────────────────────────────── */
const ROTATING_HINTS = [
  'Screen a deal in 90 seconds…',
  'Find the add-backs hiding in your financials…',
  'Draft a CIM from a conversation…',
  'Model an SBA structure under SOP 50 10 8…',
  'Build your LP update in 20 minutes…',
  'What’s this business actually worth…',
];

/* ─── Plus-button journey shortcuts ─────────────────────────────────── */
type Journey = 'sell' | 'buy' | 'raise' | 'integrate';
const SHORTCUTS: { label: string; journey: Journey }[] = [
  { label: 'Sell my business', journey: 'sell' },
  { label: 'Buy a business',    journey: 'buy' },
  { label: 'Raise capital',     journey: 'raise' },
  { label: 'Just acquired',     journey: 'integrate' },
];

/* ─── 3 feature cards under hero ──────────────────────────────────────
   Middle card (Deal screening) inverts to dark fill for visual rhythm —
   three identical greys in a row reads templated; one dark in the
   middle breaks the grid without a color. */
const FEATURES: {
  idx: string; heading: string; body: string;
  viz: 'addback' | 'score' | 'stack';
  invert: boolean;
  journey: Journey;
  cta: string;
}[] = [
  { idx: '01 · Add-backs',       heading: 'Find the money hiding in your tax returns.',            body: 'Pre-LOI earnings quality analysis. Every legitimate add-back identified, documented, and defensible. 20 minutes, not 6 weeks.',         viz: 'addback', invert: false, journey: 'sell',  cta: 'See how sellers use it' },
  { idx: '02 · Deal screening',  heading: 'Score any deal in 90 seconds on seven dimensions.',     body: 'The Rundown. Concentration, margins, revenue quality, owner dependency, management depth, financial integrity, scalability. Pursue or pass.', viz: 'score',   invert: true,  journey: 'buy',   cta: 'See how buyers use it'  },
  { idx: '03 · SBA structure',   heading: 'Model SOP 50 10 8 capital stacks under current rules.', body: 'Senior, mezzanine, seller notes with correct standby terms, equity injection requirements. Restructures killed deals into closable ones.',   viz: 'stack',   invert: false, journey: 'raise', cta: 'See how borrowers use it' },
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

  useEffect(() => {
    if (text) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => setHintIndex(i => (i + 1) % ROTATING_HINTS.length), 4000);
    return () => window.clearInterval(id);
  }, [text]);

  useEffect(() => {
    if (!popupOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setPopupOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setPopupOpen(false); };
    window.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('mousedown', onDocClick); window.removeEventListener('keydown', onKey); };
  }, [popupOpen]);

  const submit = (raw: string) => {
    const msg = raw.trim();
    if (!msg) return;
    setText('');
    onSend(msg);
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(text); };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(text); }
  };

  const firstName = user?.display_name?.split(' ')[0];
  const onNavigate = (dest: JourneyTab) => {
    if (dest === 'home') return;
    if (dest === 'sell' || dest === 'buy' || dest === 'raise' || dest === 'integrate') {
      onNavigateJourney(dest);
      return;
    }
    /* pricing / how-it-works / enterprise — open via chat for now */
    onSend(`Tell me about ${dest}.`);
  };

  const heroEyebrow = 'Deal intelligence platform';
  const heroH1 = user && !authLoading
    ? <>Welcome back{firstName ? `, ${firstName}` : ''}.</>
    : <><span style={{ display: 'block' }}>The AI</span><span style={{ display: 'block' }}>deal team.</span></>;
  const heroTag = user && !authLoading
    ? 'Pick up where you left off. Tell Yulia what you’re working on.'
    : 'Valuations. CIMs. Deal scoring. Financial models. Due diligence. LOIs. Everything an investment bank delivers — without the retainer.';

  return (
    <Page
      active="home"
      onNavigate={onNavigate}
      onStartFree={() => inputRef.current?.focus()}
      onSignIn={() => onSend('Sign me in.')}
    >
      {/* ═════ Hero — 2-col desktop, stacked mobile ═════ */}
      <section
        className="gg-enter"
        style={{
          position: 'relative',
          padding: 'clamp(56px, 8vw, 120px) clamp(20px, 5vw, 72px) clamp(48px, 6vw, 88px)',
          maxWidth: 1520,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="gg-grid-bg" />
        <div className="gg-hero-bg" />

        <div className="gg-two-col" style={{ alignItems: 'center', position: 'relative', zIndex: 1, minHeight: 480 }}>
          {/* ── Left: copy + chat ── */}
          <div>
            <div className="gg-eyebrow" style={{ marginBottom: 24 }}>{heroEyebrow}</div>
            <h1 className="gg-h1" style={{ marginBottom: 28 }}>{heroH1}</h1>
            <p className="gg-body gg-body--lead" style={{ marginBottom: 40, maxWidth: 560 }}>{heroTag}</p>

            {/* Chat input */}
            <form onSubmit={onSubmit} style={{ position: 'relative', maxWidth: 560 }}>
              <div className="gg-chat" style={{ marginBottom: 24 }}>
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
                <button type="submit" className="gg-chat__send" aria-label="Send" disabled={!text.trim()}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </button>
              </div>

              {popupOpen && (
                <div
                  ref={popupRef}
                  className="gg-glass-strong"
                  style={{
                    position: 'absolute', top: '100%', left: 0,
                    marginTop: -12, padding: 8,
                    borderRadius: 'var(--gg-r-card)',
                    minWidth: 260, zIndex: 40,
                    animation: 'gg-fade-up 200ms var(--gg-ease-spring) both',
                  }}
                  role="menu"
                >
                  {SHORTCUTS.map(s => (
                    <button
                      key={s.journey}
                      type="button"
                      role="menuitem"
                      onClick={() => { setPopupOpen(false); onNavigateJourney(s.journey); }}
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

            {/* Trust bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              fontFamily: 'var(--gg-display)',
              fontSize: 11, fontWeight: 600,
              color: 'var(--gg-text-faint)', letterSpacing: '0.04em',
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--gg-text-muted)',
              }}>Built on</span>
              <span style={{ color: 'var(--gg-text-muted)', fontFamily: 'var(--gg-body)', fontWeight: 500 }}>
                U.S. Census &middot; BLS &middot; FRED &middot; SEC EDGAR &middot; SBA &middot; IRS SOI
              </span>
            </div>
          </div>

          {/* ── Right: product peek — desktop only ── */}
          <div className="gg-desktop-only">
            <PeekStack />
          </div>
        </div>
      </section>

      {/* ═════ What Yulia does — 3 feature cards ═════ */}
      <section
        style={{
          padding: 'clamp(40px, 5vw, 80px) clamp(20px, 5vw, 72px) clamp(72px, 8vw, 120px)',
          maxWidth: 1520, margin: '0 auto', width: '100%',
        }}
      >
        <div className="gg-label" style={{ marginBottom: 28 }}>What Yulia does</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map(f => (
            <FeatureCard key={f.idx} {...f} onClick={() => onNavigateJourney(f.journey)} />
          ))}
        </div>
      </section>
    </Page>
  );
}

function FeatureCard({ idx, heading, body, viz, invert, cta, onClick }: {
  idx: string; heading: string; body: string; viz: 'addback' | 'score' | 'stack'; invert?: boolean;
  cta: string; onClick: () => void;
}) {
  const dark = !!invert;
  return (
    <button
      type="button"
      onClick={onClick}
      className="gg-card"
      style={{
        padding: 32,
        minHeight: 320,
        display: 'flex', flexDirection: 'column',
        borderRadius: 22,
        background: dark ? 'var(--gg-accent)' : 'var(--gg-bg-card)',
        color: dark ? '#fff' : 'var(--gg-text-primary)',
        borderColor: dark ? 'var(--gg-accent)' : 'var(--gg-border)',
        boxShadow: dark
          ? 'inset 0 0.5px 0 rgba(255, 255, 255, 0.12), 0 6px 24px rgba(0, 0, 0, 0.12)'
          : undefined,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'var(--gg-body)',
        transition: 'transform var(--gg-t-snap) var(--gg-ease-snap), box-shadow var(--gg-t-snap) var(--gg-ease-snap)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {viz === 'addback' && <VizBigStat />}
      {viz === 'score'   && <VizScoreCard />}
      {viz === 'stack'   && <VizCapitalStack />}
      <div style={{
        fontFamily: 'var(--gg-display)',
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.55)' : 'var(--gg-text-faint)',
        marginTop: 24,
        marginBottom: 12,
      }}>{idx}</div>
      <h3
        className="gg-h3"
        style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.015em', marginBottom: 12, lineHeight: 1.15, color: dark ? '#fff' : 'var(--gg-text-primary)' }}
      >
        {heading}
      </h3>
      <p className="gg-body" style={{ marginBottom: 20, fontSize: 14, color: dark ? 'rgba(255,255,255,0.75)' : undefined }}>
        {body}
      </p>
      <span style={{
        marginTop: 'auto',
        fontFamily: 'var(--gg-display)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '-0.005em',
        color: dark ? '#fff' : 'var(--gg-text-primary)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        {cta}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}
