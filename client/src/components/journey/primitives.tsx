/**
 * Glass Grok · journey primitives
 * ─────────────────────────────────────────────────────────────────────
 * Shared building blocks for the public site. Every journey page
 * (/sell, /buy, /raise, /integrate, /pricing, /how-it-works, /enterprise)
 * composes from these. One source of structure; copy varies per page.
 *
 * Spec source: Glass Grok/Grok Glass Journey.html
 *              Glass Grok/glass-grok-style-guide.html
 */

import {
  type ReactNode, type FormEvent, type KeyboardEvent,
  useState, useRef, useEffect,
} from 'react';
import './glass.css';

/* ═════════════════════════════════════════════════════════════════════
   PAGE FRAME
   Desktop (≥1024px): app shell — Sidebar (68px) + TopBar (64px) + main
   Mobile (<1024px):  floating glass nav pill over main
   Canvas is always #F2F2F4. Footer renders at the bottom.
   ═════════════════════════════════════════════════════════════════════ */

export type JourneyTab = 'home' | 'sell' | 'buy' | 'raise' | 'integrate' | 'pricing' | 'how-it-works' | 'enterprise';

export interface PageProps {
  children: ReactNode;
  /** Active page — drives nav highlight state. */
  active?: JourneyTab;
  /** Called when user picks a top-bar or sidebar destination. */
  onNavigate?: (dest: JourneyTab) => void;
  /** Called when Sign-in link is clicked. Optional. */
  onSignIn?: () => void;
  /** Called when the primary CTA (Start free / Book a demo) fires. */
  onStartFree: () => void;
  /** Optional override for the nav CTA label. */
  ctaLabel?: string;
}

const TOPBAR_LINKS: { id: JourneyTab; label: string }[] = [
  { id: 'sell',         label: 'Sell' },
  { id: 'buy',          label: 'Buy' },
  { id: 'raise',        label: 'Raise' },
  { id: 'integrate',    label: 'Integrate' },
  { id: 'pricing',      label: 'Pricing' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'enterprise',   label: 'Enterprise' },
];

export function Page({ children, active, onNavigate, onSignIn, onStartFree, ctaLabel = 'Start free' }: PageProps) {
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--gg-bg-app, #F2F2F4)',
        color: 'var(--gg-text-primary, #0A0A0B)',
        minHeight: '100%',
        fontFamily: 'var(--gg-body)',
      }}
    >
      {/* ── Desktop shell ─────────────────────────────────────────── */}
      <div className="gg-desktop-only" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="gg-shell">
          <Sidebar active={active} onNavigate={onNavigate} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <TopBar active={active} onNavigate={onNavigate} onSignIn={onSignIn} onStartFree={onStartFree} ctaLabel={ctaLabel} />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </div>

      {/* ── Mobile shell (floating nav pill) ─────────────────────── */}
      <div className="gg-mobile-only" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
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
            onClick={onStartFree}
          >
            {ctaLabel}
          </button>
        </nav>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 108 }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   SIDEBAR — 68px icon-only nav, X logo at top
   ═════════════════════════════════════════════════════════════════════ */

function Sidebar({ active, onNavigate }: { active?: JourneyTab; onNavigate?: (d: JourneyTab) => void }) {
  const go = (d: JourneyTab) => onNavigate?.(d);
  return (
    <aside className="gg-sidebar">
      <button
        type="button"
        className="gg-sidebar__mark"
        onClick={() => go('home')}
        aria-label="Home"
        style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}
      >
        <img src="/X.png" alt="smbx" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
      </button>

      <div className="gg-sidebar__group-label">Explore</div>
      <NavIcon label="Sell"      active={active === 'sell'}      onClick={() => go('sell')}     icon={<path d="M3 9l9-6 9 6v11a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9z" />} />
      <NavIcon label="Buy"       active={active === 'buy'}       onClick={() => go('buy')}      icon={<><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M3 4h2l2.5 12h12l2-8H6" /></>} />
      <NavIcon label="Raise"     active={active === 'raise'}     onClick={() => go('raise')}    icon={<path d="M3 18l6-6 4 4 8-8M14 7h7v7" />} />
      <NavIcon label="Integrate" active={active === 'integrate'} onClick={() => go('integrate')} icon={<><circle cx="12" cy="8" r="4" /><path d="M5 21c0-4 3-7 7-7s7 3 7 7" /></>} />

      <div className="gg-sidebar__sep" />
      <div className="gg-sidebar__group-label">Learn</div>
      <NavIcon label="How it works" active={active === 'how-it-works'} onClick={() => go('how-it-works')} icon={<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></>} />
      <NavIcon label="Pricing"      active={active === 'pricing'}      onClick={() => go('pricing')}      icon={<><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></>} />
      <NavIcon label="Enterprise"   active={active === 'enterprise'}   onClick={() => go('enterprise')}   icon={<><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9v.01M9 13v.01M9 17v.01M15 9v.01M15 13v.01M15 17v.01" /></>} />
    </aside>
  );
}

function NavIcon({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`gg-sidebar__item${active ? ' active' : ''}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={label}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
    </button>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   TOPBAR — 64px glass, logo + text nav + sign-in + CTA pill
   ═════════════════════════════════════════════════════════════════════ */

function TopBar({ active, onNavigate, onSignIn, onStartFree, ctaLabel }: {
  active?: JourneyTab; onNavigate?: (d: JourneyTab) => void; onSignIn?: () => void; onStartFree: () => void; ctaLabel: string;
}) {
  return (
    <header className="gg-topbar">
      <button
        type="button"
        onClick={() => onNavigate?.('home')}
        style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
      >
        <span className="gg-logo" style={{ fontSize: 20 }}>smbx.ai</span>
      </button>
      <nav className="gg-topbar__nav">
        {TOPBAR_LINKS.map(l => (
          <button
            key={l.id}
            type="button"
            className={`gg-topbar__link${active === l.id ? ' active' : ''}`}
            aria-current={active === l.id ? 'page' : undefined}
            onClick={() => onNavigate?.(l.id)}
          >
            {l.label}
          </button>
        ))}
      </nav>
      <div className="gg-topbar__right">
        {onSignIn && (
          <button type="button" className="gg-topbar__signin" onClick={onSignIn}>Sign in</button>
        )}
        <button
          type="button"
          className="gg-btn gg-btn--primary"
          onClick={onStartFree}
          style={{ padding: '9px 18px' }}
        >
          {ctaLabel}
        </button>
      </div>
    </header>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   FOOTER — slim, monospace, hairline. Applied by Page automatically;
   exported so Home (which has a custom hero layout) can include it too.
   ═════════════════════════════════════════════════════════════════════ */

export function Footer() {
  const year = new Date().getFullYear();
  const links: { label: string; href: string }[] = [
    { label: 'Pricing',       href: '/pricing' },
    { label: 'How it works',  href: '/how-it-works' },
    { label: 'Enterprise',    href: '/enterprise' },
    { label: 'Privacy',       href: '/legal/privacy' },
    { label: 'Terms',         href: '/legal/terms' },
    { label: 'hello@smbx.ai', href: 'mailto:hello@smbx.ai' },
  ];
  return (
    <footer
      style={{
        borderTop: '0.5px solid var(--gg-border)',
        padding: '20px clamp(20px, 5vw, 56px)',
        background: 'var(--gg-bg-app)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11, letterSpacing: '0.02em',
        color: 'var(--gg-text-muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span className="gg-logo" style={{ fontSize: 13, fontFamily: 'var(--gg-display)' }}>smbx.ai</span>
        {links.map(l => (
          <a
            key={l.href}
            href={l.href}
            style={{
              color: 'var(--gg-text-muted)',
              textDecoration: 'none',
              transition: 'color var(--gg-t-feedback) var(--gg-ease-snap)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gg-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--gg-text-muted)')}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div style={{ color: 'var(--gg-text-faint)' }}>&copy; {year} smbx.ai</div>
    </footer>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CHAT INPUT — the conversion element. Inline on hero + bottom CTA.
   ═════════════════════════════════════════════════════════════════════ */

export interface ChatInputProps {
  placeholder: string;
  onSend: (text: string) => void;
  rotatingHints?: string[];   /* home only */
  onPlusClick?: () => void;
}

export function ChatInput({ placeholder, onSend, rotatingHints, onPlusClick }: ChatInputProps) {
  const [text, setText] = useState('');
  const [hintIdx, setHintIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Rotate placeholder every 4s when field is empty */
  useRotatingHint(text, rotatingHints?.length ?? 0, setHintIdx);

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

  const activePlaceholder = rotatingHints && !text
    ? rotatingHints[hintIdx % rotatingHints.length]
    : placeholder;

  return (
    <form onSubmit={onSubmit} style={{ width: '100%' }}>
      <div className="gg-chat">
        <button
          type="button"
          className="gg-chat__plus"
          aria-label="More"
          onClick={onPlusClick}
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
          placeholder={activePlaceholder}
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
    </form>
  );
}

function useRotatingHint(
  text: string,
  count: number,
  setIdx: (fn: (i: number) => number) => void,
) {
  useEffect(() => {
    if (text || count === 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => setIdx((i: number) => i + 1), 4000);
    return () => window.clearInterval(id);
  }, [text, count, setIdx]);
}

/* ═════════════════════════════════════════════════════════════════════
   JOURNEY HERO — eyebrow · H1 · tag · chat · chips (+ optional right peek)
   Desktop: 2-col (text left, rightPanel right). Mobile: stacked.
   Same structure across /sell, /buy, /raise, /integrate.
   ═════════════════════════════════════════════════════════════════════ */

export interface JourneyHeroProps {
  eyebrow: string;
  headline: ReactNode;
  tagline: ReactNode;
  chatPlaceholder: string;
  chips: readonly string[];
  onSend: (text: string) => void;
  onChip: (chip: string) => void;
  /** Desktop-only product mockup on the right of the hero. */
  rightPanel?: ReactNode;
}

export function JourneyHero(p: JourneyHeroProps) {
  return (
    <section
      className="gg-enter"
      style={{
        position: 'relative',
        padding: 'clamp(48px, 7vw, 96px) clamp(20px, 5vw, 72px) clamp(56px, 7vw, 96px)',
        maxWidth: 1520,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div className="gg-grid-bg" />
      <div className="gg-two-col" style={{ alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div>
          <div className="gg-eyebrow" style={{ marginBottom: 20 }}>{p.eyebrow}</div>
          <h1 className="gg-h1 gg-h1--journey" style={{ marginBottom: 28 }}>{p.headline}</h1>
          <p className="gg-body gg-body--lead" style={{ maxWidth: 560, marginBottom: 32 }}>{p.tagline}</p>
          <div style={{ maxWidth: 560, marginBottom: 20 }}>
            <ChatInput placeholder={p.chatPlaceholder} onSend={p.onSend} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxWidth: 720 }}>
            {p.chips.map(c => (
              <button key={c} type="button" className="gg-chip" onClick={() => p.onChip(c)}>{c}</button>
            ))}
          </div>
        </div>
        {p.rightPanel && <div className="gg-desktop-only">{p.rightPanel}</div>}
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   SECTION — the rhythm unit. app-bg | tint (card) | dark (inverted)
   ═════════════════════════════════════════════════════════════════════ */

export interface SectionProps {
  variant?: 'app' | 'tint' | 'dark';
  label?: string;          /* uppercase eyebrow above heading */
  children: ReactNode;
  tight?: boolean;         /* reduces vertical padding */
}

export function Section({ variant = 'app', label, children, tight }: SectionProps) {
  const cls = [
    'gg-section',
    variant === 'tint' ? 'gg-section--tint' : '',
    variant === 'dark' ? 'gg-section--dark' : '',
  ].filter(Boolean).join(' ');
  return (
    <section
      className={cls}
      style={tight ? { paddingTop: 'clamp(32px, 4vw, 56px)', paddingBottom: 'clamp(32px, 4vw, 56px)' } : undefined}
    >
      <div className="gg-section__inner">
        {label && <div className="gg-label" style={{ marginBottom: 20 }}>{label}</div>}
        {children}
      </div>
    </section>
  );
}

export function H2({ children, style, variant }: { children: ReactNode; style?: React.CSSProperties; variant?: 'block' }) {
  const cls = variant === 'block' ? 'gg-h2 gg-h2--block' : 'gg-h2';
  return <h2 className={cls} style={{ marginBottom: 20, ...style }}>{children}</h2>;
}

export function Body({ children, lead, style }: { children: ReactNode; lead?: boolean; style?: React.CSSProperties }) {
  const cls = lead ? 'gg-body gg-body--lead' : 'gg-body';
  return <p className={cls} style={{ marginBottom: 14, ...style }}>{children}</p>;
}

/* ═════════════════════════════════════════════════════════════════════
   STAT BAR — 3-column grid of big number + label
   ═════════════════════════════════════════════════════════════════════ */

export interface StatBarProps {
  items: readonly { value: string; label: string }[];
}

export function StatBar({ items }: StatBarProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
      gap: 'clamp(16px, 3vw, 40px)',
    }}>
      {items.map((it, i) => (
        <div key={i}>
          <div className="gg-stat">{it.value}</div>
          <div className="gg-body" style={{ marginTop: 6, marginBottom: 0, fontSize: 13, color: 'var(--gg-text-muted)' }}>
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CARD — content surface. Used for exit paths, structures, features, etc.
   ═════════════════════════════════════════════════════════════════════ */

export function Card({ children, padding = 22, style }: { children: ReactNode; padding?: number; style?: React.CSSProperties }) {
  return (
    <div className="gg-card" style={{ padding, ...style }}>
      {children}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CARD GRID — responsive grid for card collections
   ═════════════════════════════════════════════════════════════════════ */

export function CardGrid({ children, minCol = 260 }: { children: ReactNode; minCol?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minCol}px, 1fr))`,
      gap: 16,
    }}>
      {children}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   TIMELINE — vertical phase list (used on /sell, /buy, /integrate)
   ═════════════════════════════════════════════════════════════════════ */

export interface TimelinePhase {
  label: string;         /* "Phase 1 — UNDERSTAND" */
  window?: string;       /* "Months 1-2" */
  body: string;
  deliverables?: string;
  free?: boolean;
}

export function Timeline({ phases }: { phases: readonly TimelinePhase[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {phases.map((p, i) => (
        <div key={i} className="gg-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div className="gg-label">
              {p.label}
              {p.window && <span style={{ opacity: 0.6, marginLeft: 8 }}>· {p.window}</span>}
              {p.free && <span style={{ marginLeft: 8, background: 'var(--gg-band-hi-bg)', color: 'var(--gg-band-hi-fg)', padding: '2px 8px', borderRadius: 4, fontSize: 9 }}>FREE</span>}
            </div>
          </div>
          <div className="gg-body" style={{ marginBottom: p.deliverables ? 10 : 0 }}>{p.body}</div>
          {p.deliverables && (
            <div className="gg-body" style={{ fontSize: 13, color: 'var(--gg-text-muted)', marginBottom: 0 }}>
              <strong style={{ color: 'var(--gg-text-secondary)' }}>Deliverables:</strong> {p.deliverables}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   HORIZONTAL TIMELINE — 4- or 5-phase process (desktop layout)
   Numbered nodes on a dashed baseline. On narrow screens falls back to
   a vertical stack via the grid-template-columns media query.
   ═════════════════════════════════════════════════════════════════════ */

export interface HPhase {
  idx: string;            /* "Phase 1 · Free" or "Day 0 · Before the wire" */
  name: string;           /* "Understand" */
  meta?: string;          /* "Months 1–2" */
  body: string;
  deliverables?: string;
}

export function HorizontalTimeline({ phases }: { phases: readonly HPhase[] }) {
  return (
    <div className="gg-timeline">
      <div
        className="gg-timeline__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))`,
          gap: 24,
          position: 'relative',
        }}
      >
        {phases.map((p, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#fff',
                border: '1.5px solid var(--gg-text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 13,
                color: 'var(--gg-text-primary)',
                marginBottom: 24,
                position: 'relative', zIndex: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {i + 1}
            </div>
            <div style={{
              fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--gg-text-muted)', marginBottom: 6,
            }}>{p.idx}</div>
            <div style={{
              fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 22,
              letterSpacing: '-0.015em', color: 'var(--gg-text-primary)',
              marginBottom: 8,
            }}>{p.name}</div>
            {p.meta && (
              <div style={{
                fontFamily: 'var(--gg-display)', fontSize: 11.5, fontWeight: 600,
                letterSpacing: '0.04em', color: 'var(--gg-text-muted)',
                marginBottom: 14,
              }}>{p.meta}</div>
            )}
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--gg-text-secondary)', marginBottom: 14 }}>
              {p.body}
            </div>
            {p.deliverables && (
              <div style={{
                fontSize: 11.5, lineHeight: 1.6, color: 'var(--gg-text-muted)',
                paddingTop: 14,
                borderTop: '0.5px dashed var(--gg-border)',
              }}>
                <span style={{ color: 'var(--gg-text-primary)', fontWeight: 600 }}>Delivers: </span>
                {p.deliverables}
              </div>
            )}
          </div>
        ))}
        {/* Dashed baseline connecting the nodes (desktop only — lines up at y=56px) */}
        <div
          className="gg-desktop-only"
          style={{
            position: 'absolute',
            top: 16, left: 32, right: 32,
            height: 1,
            background: 'repeating-linear-gradient(to right, var(--gg-border-strong) 0 4px, transparent 4px 8px)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   BOTTOM CTA — mirrors hero, anchors every journey page
   ═════════════════════════════════════════════════════════════════════ */

export interface BottomCtaProps {
  heading: ReactNode;
  subhead: ReactNode;
  chatPlaceholder: string;
  onSend: (text: string) => void;
}

export function BottomCta(p: BottomCtaProps) {
  return (
    <Section variant="dark">
      <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <H2 style={{ marginBottom: 20 }}>{p.heading}</H2>
        <p className="gg-body--sub" style={{ marginBottom: 36, marginLeft: 'auto', marginRight: 'auto' }}>{p.subhead}</p>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <ChatInput placeholder={p.chatPlaceholder} onSend={p.onSend} />
        </div>
      </div>
    </Section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   Regulatory alert banner (dark-inverted) — used on /buy for SBA
   ═════════════════════════════════════════════════════════════════════ */

export interface AlertBannerProps {
  label: string;
  heading: ReactNode;
  leftHeading: string;
  leftItems: readonly string[];
  rightHeading: string;
  rightItems: readonly string[];
  ctaLabel: string;
  onCta: () => void;
}

export function AlertBanner(p: AlertBannerProps) {
  return (
    <Section variant="dark" label={p.label}>
      <H2>{p.heading}</H2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, marginTop: 24, marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, color: '#C5C5CA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            {p.leftHeading}
          </div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
            {p.leftItems.map((item, i) => (
              <li key={i} style={{ paddingLeft: 18, position: 'relative', fontSize: 14, lineHeight: 1.6, color: '#C5C5CA', marginBottom: 8 }}>
                <span style={{ position: 'absolute', left: 0, top: 0, color: 'var(--gg-dot-flag)' }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, color: '#C5C5CA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            {p.rightHeading}
          </div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
            {p.rightItems.map((item, i) => (
              <li key={i} style={{ paddingLeft: 18, position: 'relative', fontSize: 14, lineHeight: 1.6, color: '#fff', marginBottom: 8 }}>
                <span style={{ position: 'absolute', left: 0, top: 0, color: 'var(--gg-dot-ready)' }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        className="gg-btn"
        onClick={p.onCta}
        style={{
          background: '#fff', color: 'var(--gg-text-primary)',
          padding: '11px 20px',
        }}
      >
        {p.ctaLabel} &rarr;
      </button>
    </Section>
  );
}
