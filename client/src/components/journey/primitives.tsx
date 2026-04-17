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
   PAGE FRAME — floating glass nav + app-canvas background
   ═════════════════════════════════════════════════════════════════════ */

export interface PageProps {
  children: ReactNode;
  user?: { display_name?: string | null; email?: string | null } | null;
  /** Called when the nav "Start free" CTA is clicked. */
  onStartFree: () => void;
  /** Optional override for the nav CTA label (Enterprise uses "Book a demo"). */
  ctaLabel?: string;
}

export function Page({ children, onStartFree, ctaLabel = 'Start free' }: PageProps) {
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
   JOURNEY HERO — eyebrow · H1 · tag · chat · chips
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
}

export function JourneyHero(p: JourneyHeroProps) {
  return (
    <section style={{ padding: 'clamp(32px, 5vw, 72px) clamp(20px, 5vw, 56px) clamp(40px, 5vw, 80px)', maxWidth: 900, margin: '0 auto', width: '100%' }} className="gg-enter">
      <div className="gg-eyebrow" style={{ marginBottom: 16 }}>{p.eyebrow}</div>
      <h1 className="gg-h1 gg-h1--journey" style={{ marginBottom: 22 }}>{p.headline}</h1>
      <p className="gg-body gg-body--lead" style={{ maxWidth: 720, marginBottom: 28 }}>{p.tagline}</p>
      <div style={{ maxWidth: 640, marginBottom: 20 }}>
        <ChatInput placeholder={p.chatPlaceholder} onSend={p.onSend} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 720 }}>
        {p.chips.map(c => (
          <button key={c} type="button" className="gg-chip" onClick={() => p.onChip(c)}>{c}</button>
        ))}
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
      style={tight ? { paddingTop: 'var(--gg-s8)', paddingBottom: 'var(--gg-s8)' } : undefined}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {label && <div className="gg-label" style={{ marginBottom: 12 }}>{label}</div>}
        {children}
      </div>
    </section>
  );
}

export function H2({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <h2 className="gg-h2" style={{ marginBottom: 16, ...style }}>{children}</h2>;
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
    <Section variant="tint">
      <H2 style={{ maxWidth: 720 }}>{p.heading}</H2>
      <Body lead style={{ maxWidth: 640, marginBottom: 28 }}>{p.subhead}</Body>
      <div style={{ maxWidth: 640 }}>
        <ChatInput placeholder={p.chatPlaceholder} onSend={p.onSend} />
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
