/**
 * Glass Grok · desktop product mockups
 * ─────────────────────────────────────────────────────────────────────
 * Real-UI visuals for the two-column heroes. These "peeks" of the
 * product supply the visual interest on journey pages — no stock art,
 * no abstract gradients, no illustrations. Just small pieces of the
 * product, drawn in the same components they'd render as.
 *
 * Spec source: Glass Grok/Desktop spec (this repo).
 */

import { type ReactNode, useEffect, useRef, useState } from 'react';

/* ═════════════════════════════════════════════════════════════════════
   Shared motion hooks — used by every animated mockup.
   ═════════════════════════════════════════════════════════════════════ */

/** Fires true the first time the element enters the viewport. */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setInView(true); return; }
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { setInView(true); observer.disconnect(); return; }
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, inView];
}

/** Animates a numeric target from 0 to `to` over `duration` ms when
 *  `active` flips true. Returns the current value. */
export function useCountUp(to: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setValue(to); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      /* ease-out-expo: decisive entrance, clean settle */
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, active, duration]);
  return value;
}

/** Parse a currency string like "+$47K" or "$1.1M" into { prefix, value,
 *  suffix, scale } so useCountUp can animate the numeric portion. */
function parseCurrency(s: string): { prefix: string; target: number; suffix: string; scale: number } {
  const match = /^([^\d.\-]*)([\d.,]+)([A-Za-z%]*)$/.exec(s.trim());
  if (!match) return { prefix: '', target: 0, suffix: s, scale: 1 };
  const [, prefix, numStr, suffix] = match;
  const n = parseFloat(numStr.replace(/,/g, ''));
  const scale = suffix.toLowerCase() === 'm' ? 1e6 : suffix.toLowerCase() === 'k' ? 1e3 : 1;
  return { prefix, target: n, suffix, scale };
}

function formatCount(current: number, target: number, suffix: string, prefix: string): string {
  if (suffix.toLowerCase() === 'm') return `${prefix}${current.toFixed(current < 10 ? 1 : 0)}${suffix}`;
  if (suffix.toLowerCase() === 'k') return `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
  if (suffix === '%')                return `${prefix}${Math.round(current)}${suffix}`;
  /* Plain integer with commas (e.g., $22,000) */
  if (target >= 1000) return `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
  return `${prefix}${Math.round(current)}${suffix}`;
}

/** Count-up a currency-style string to its target value. Returns the
 *  formatted string at the current animation frame. */
export function useCountUpString(s: string, active: boolean, duration = 1200): string {
  const { prefix, target, suffix } = parseCurrency(s);
  const live = useCountUp(target, active, duration);
  if (!target) return s;
  return formatCount(live, target, suffix, prefix);
}

/* ═════════════════════════════════════════════════════════════════════
   PEEK STACK — home hero right column
   Three floating cards at slight rotations: conversation, baseline,
   floating "ready" glass tag. Shows what Yulia does without a bullet.
   ═════════════════════════════════════════════════════════════════════ */

export function PeekStack() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 480 }}>
      {/* Floating "ready" tag — top, glass */}
      <div
        className="gg-glass-strong"
        style={{
          position: 'absolute',
          top: 0, right: 80,
          padding: '10px 14px 10px 12px',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          borderRadius: 'var(--gg-r-pill)',
          transform: 'rotate(3deg)',
          zIndex: 3,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gg-dot-ready)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gg-text-primary)' }}>Baseline ready · 22 min</span>
      </div>

      {/* Conversation card — middle, slight left tilt */}
      <div
        className="gg-card"
        style={{
          position: 'absolute',
          top: 40, left: 0, right: 40,
          padding: '24px 26px',
          transform: 'rotate(-1deg)',
          zIndex: 1,
          boxShadow: '0 20px 50px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)',
        }}
      >
        <Bubble role="user">Dallas HVAC, $4.2M revenue, 15 years. Thinking about selling.</Bubble>
        <Bubble role="yulia">Lower-middle market, above Main Street. Let me build your baseline while we talk. Three numbers to tighten the range &mdash; SDE last year, recurring contract mix, and any non-operating expenses on the P&amp;L?</Bubble>
        <Bubble role="user">SDE $695K. 60% recurring. About $47K in personal.</Bubble>
      </div>

      {/* Baseline draft card — bottom right, slight right tilt */}
      <div
        className="gg-card"
        style={{
          position: 'absolute',
          top: 270, right: 0, width: 300,
          padding: '20px 22px',
          transform: 'rotate(2deg)',
          zIndex: 2,
          boxShadow: '0 20px 50px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)',
        }}
      >
        <div className="gg-label" style={{ marginBottom: 8 }}>Baseline · draft</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 6 }}>
          $2.4M &ndash; $2.9M
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--gg-text-muted)', marginBottom: 14 }}>
          SDE $695K · 3.5&times;–4.2&times;
        </div>
        <div style={{ position: 'relative', height: 5, background: 'var(--gg-bg-muted)', borderRadius: 3, marginBottom: 6 }}>
          <div style={{ position: 'absolute', left: '32%', right: '22%', top: 0, bottom: 0, background: 'linear-gradient(90deg, #6B6B70, #0A0A0B)', borderRadius: 3 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--gg-text-muted)' }}>
          <span>$1.5M</span><span>$3.6M</span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: 'user' | 'yulia'; children: ReactNode }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <div
          style={{
            background: 'var(--gg-bg-muted)',
            color: 'var(--gg-text-primary)',
            borderRadius: '14px 14px 4px 14px',
            padding: '9px 13px',
            fontSize: 12.5,
            lineHeight: 1.5,
            maxWidth: '78%',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
      <div
        className="gg-yulia"
        style={{ width: 26, height: 26, borderRadius: 9, fontSize: 12 }}
      >Y</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--gg-text-primary)', padding: '3px 0' }}>
        {children}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   ADD-BACK SCHEDULE — /sell hero + Add-backs Hero 1
   Line items with labels + amounts, dark total strip at bottom.
   ═════════════════════════════════════════════════════════════════════ */

export interface AddBackLine { title: string; subtitle?: string; amount: string; }

export function AddBackSchedule({
  label = 'Live preview · Acme HVAC',
  heading = 'Add-back schedule',
  lines,
  totalLabel = 'Blind Equity™',
  totalNote = 'Adds ~0.35× to multiple on upper band',
  totalAmount,
}: {
  label?: string;
  heading?: string;
  lines: readonly AddBackLine[];
  totalLabel?: string;
  totalNote?: string;
  totalAmount: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const totalLive = useCountUpString(totalAmount, inView, 1400);

  return (
    <div
      ref={ref}
      className="gg-card"
      style={{
        padding: '28px 30px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)',
      }}
    >
      <div className="gg-label" style={{ marginBottom: 6 }}>{label}</div>
      <h4 style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.01em', color: 'var(--gg-text-primary)', marginBottom: 20 }}>
        {heading}
      </h4>
      {lines.map((l, i) => (
        <div
          key={i}
          className="gg-addback-row"
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0',
            borderBottom: i === lines.length - 1 ? '0' : '0.5px solid var(--gg-border)',
            gap: 16,
            /* Stagger rows in after the card enters viewport */
            ...(inView
              ? { opacity: 1, transform: 'translateY(0)' }
              : { opacity: 0, transform: 'translateY(8px)' }),
            transition: 'opacity 400ms var(--gg-ease-spring), transform 400ms var(--gg-ease-spring)',
            transitionDelay: `${150 + i * 110}ms`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: 'var(--gg-text-primary)', fontWeight: 500 }}>{l.title}</div>
            {l.subtitle && (
              <div style={{ fontSize: 11.5, color: 'var(--gg-text-muted)', marginTop: 2 }}>{l.subtitle}</div>
            )}
          </div>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            {l.amount}
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: 12,
          padding: '16px 18px',
          background: 'var(--gg-accent)',
          color: '#fff',
          borderRadius: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.12)',
          gap: 16,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 500ms var(--gg-ease-spring), transform 500ms var(--gg-ease-spring)',
          transitionDelay: `${150 + lines.length * 110 + 40}ms`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.75 }}>{totalLabel}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{totalNote}</div>
        </div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
          {totalLive}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CIM COVER — /sell Hero 2
   Faux document cover — 8.5:11 aspect, stats strip, prepared date.
   ═════════════════════════════════════════════════════════════════════ */

export function CIMCover({
  company = 'Acme HVAC Services, Inc.',
  locationLine = 'Dallas, TX · Founded 2011',
  stats = [
    { n: '$4.2M', l: 'Revenue' },
    { n: '$695K', l: 'Adj. SDE' },
    { n: '60%',   l: 'Recurring' },
    { n: '14',    l: 'Technicians' },
  ],
  prepared = 'Prepared October 2026 · 32 pages',
}: {
  company?: string;
  locationLine?: string;
  stats?: readonly { n: string; l: string }[];
  prepared?: string;
}) {
  return (
    <div
      className="gg-card"
      style={{
        aspectRatio: '8.5 / 11',
        maxWidth: 460,
        margin: '0 auto',
        overflow: 'hidden',
        padding: 0,
        borderRadius: 16,
        boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)',
      }}
    >
      <div style={{ height: '100%', padding: '48px 40px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div className="gg-label" style={{ letterSpacing: '0.18em', marginBottom: 'auto' }}>
          Confidential Information Memorandum
        </div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--gg-text-primary)', marginBottom: 14 }}>
          {company.split(' ').length > 2
            ? (<><span style={{ display: 'block' }}>{company.split(' ').slice(0, 2).join(' ')}</span><span style={{ display: 'block' }}>{company.split(' ').slice(2).join(' ')}</span></>)
            : company}
        </div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 13, color: 'var(--gg-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 32 }}>
          {locationLine}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '18px 0', borderTop: '0.5px solid var(--gg-border)', borderBottom: '0.5px solid var(--gg-border)', marginBottom: 14 }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.015em', color: 'var(--gg-text-primary)' }}>{s.n}</div>
              <div style={{ fontSize: 10.5, color: 'var(--gg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', fontSize: 10, color: 'var(--gg-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--gg-display)', fontWeight: 600 }}>
          {prepared}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   IOI GRID — /sell Hero 3 (competitive process)
   3 offer cards side by side; winner in black with white text.
   ═════════════════════════════════════════════════════════════════════ */

export interface IOICell { name: string; price: string; note: string; winner?: boolean; }

export function IOIGrid({
  title = 'IOIs received',
  count = '3 offers · active',
  cells,
  footnote,
}: {
  title?: string;
  count?: string;
  cells: readonly IOICell[];
  footnote?: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="gg-card"
      style={{
        padding: 26,
        boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{count}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 10 }}>
        {cells.map((c, i) => (
          <div
            key={i}
            style={{
              padding: '14px',
              border: '0.5px solid var(--gg-border)',
              borderRadius: 12,
              background: c.winner ? 'var(--gg-accent)' : 'var(--gg-bg-subtle)',
              borderColor: c.winner ? 'var(--gg-accent)' : 'var(--gg-border)',
              color: c.winner ? '#fff' : 'var(--gg-text-primary)',
              boxShadow: c.winner ? 'inset 0 0.5px 0 rgba(255,255,255,0.12)' : undefined,
              /* Stagger each cell in; winner lands last for emphasis */
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
              transition: 'opacity 500ms var(--gg-ease-spring), transform 500ms var(--gg-ease-spring)',
              transitionDelay: `${100 + i * 160}ms`,
            }}
          >
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{c.price}</div>
            <div style={{ fontSize: 10.5, opacity: 0.7 }}>{c.note}</div>
          </div>
        ))}
      </div>
      {footnote && (
        <div
          style={{
            marginTop: 16, padding: '14px 16px',
            background: 'var(--gg-bg-subtle)',
            borderRadius: 10, fontSize: 12.5,
            color: 'var(--gg-text-secondary)', lineHeight: 1.55,
            opacity: inView ? 1 : 0,
            transition: 'opacity 500ms var(--gg-ease-spring)',
            transitionDelay: `${100 + cells.length * 160 + 100}ms`,
          }}
        >
          {footnote}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   SCORE RING — /buy Hero 1 (The Rundown)
   Ring with big number + verdict label.
   ═════════════════════════════════════════════════════════════════════ */

export function ScoreRing({ score = 87, verdict = 'Pursue', band = 'hi', size = 120 }: {
  score?: number; verdict?: string; band?: 'hi' | 'med' | 'low'; size?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const liveScore = useCountUp(score, inView, 1400);
  const ringColor = band === 'hi' ? 'var(--gg-dot-ready)' : band === 'med' ? 'var(--gg-dot-progress)' : 'var(--gg-dot-flag)';

  /* SVG ring — the progress arc draws in via stroke-dashoffset on enter.
     Circumference = 2πr; dasharray = circumference; dashoffset animates
     from full (invisible) to fraction proportional to score. */
  const r = (size - 8) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = inView ? circumference * (1 - progress) : circumference;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size} height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          aria-hidden
        >
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--gg-bg-muted)" strokeWidth={4} />
          {/* Progress arc — draws from 12-o'clock clockwise on inView */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1400ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--gg-display)',
            fontWeight: 800,
            fontSize: size * 0.3,
            letterSpacing: '-0.025em',
            color: 'var(--gg-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(liveScore)}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gg-text-muted)' }}>
        {verdict}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CAPITAL STACK — /buy Hero 2 (SBA structure)
   4 stacked bars representing layers of the cap stack.
   ═════════════════════════════════════════════════════════════════════ */

export interface StackLayer { label: string; width: number; tone: 'ink' | 'dark' | 'mid' | 'light'; }

export function CapitalStack({
  layers = [
    { label: 'Senior · SBA 7(a)',  width: 100, tone: 'ink' },
    { label: 'Mezz · 12%',         width: 75,  tone: 'dark' },
    { label: 'Seller · standby',   width: 58,  tone: 'mid' },
    { label: 'Equity · 10%',       width: 42,  tone: 'light' },
  ] as readonly StackLayer[],
}: {
  layers?: readonly StackLayer[];
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const toneMap: Record<StackLayer['tone'], { bg: string; fg: string }> = {
    ink:   { bg: 'var(--gg-text-primary)',   fg: '#fff' },
    dark:  { bg: 'var(--gg-text-secondary)', fg: '#fff' },
    mid:   { bg: 'var(--gg-text-muted)',     fg: '#fff' },
    light: { bg: 'var(--gg-border-strong)',  fg: 'var(--gg-text-primary)' },
  };
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 22, background: 'var(--gg-bg-subtle)', borderRadius: 14, border: '0.5px solid var(--gg-border)' }}>
      {layers.map((layer, i) => {
        const t = toneMap[layer.tone];
        return (
          <div
            key={i}
            style={{
              height: 28,
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 12px',
              fontFamily: 'var(--gg-display)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: t.bg,
              color: t.fg,
              /* Width animates from 0 → target on viewport enter. Stagger
                 from the widest senior layer down so the stack "fills in"
                 top-to-bottom like capital being layered. */
              width: inView ? `${layer.width}%` : '0%',
              transition: 'width 700ms cubic-bezier(0.22, 1, 0.36, 1)',
              transitionDelay: `${150 + i * 120}ms`,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{layer.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   VIZ — geometric monochrome visuals for feature cards on Home
   ═════════════════════════════════════════════════════════════════════ */

export function VizBigStat({ value = '$1.1M', label = 'avg hidden value' }: { value?: string; label?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const live = useCountUpString(value, inView, 1400);
  return (
    <div
      ref={ref}
      style={{
        height: 140,
        borderRadius: 14,
        background: 'linear-gradient(135deg, #F5F5F7 0%, #E8E8EB 100%)',
        border: '0.5px solid var(--gg-border)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 6,
      }}
    >
      <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', color: 'var(--gg-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {live}
      </div>
      <div style={{ fontFamily: 'var(--gg-display)', fontSize: 10, color: 'var(--gg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export function VizScoreCard({ score = 87, verdict = 'Pursue' }: { score?: number; verdict?: string }) {
  return (
    <div
      style={{
        height: 140,
        borderRadius: 14,
        background: 'linear-gradient(135deg, #F5F5F7 0%, #E8E8EB 100%)',
        border: '0.5px solid var(--gg-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 8,
      }}
    >
      <div
        style={{
          width: 72, height: 72,
          borderRadius: '50%',
          border: '3px solid var(--gg-text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fff',
          position: 'relative',
          fontFamily: 'var(--gg-display)',
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: '-0.02em',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: -3,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--gg-dot-ready)',
            borderRightColor: 'var(--gg-dot-ready)',
            transform: 'rotate(25deg)',
          }}
        />
        {score}
      </div>
      <div style={{ fontFamily: 'var(--gg-display)', fontSize: 9, color: 'var(--gg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
        {verdict}
      </div>
    </div>
  );
}

export function VizCapitalStack() {
  return (
    <div
      style={{
        height: 140,
        borderRadius: 14,
        background: 'linear-gradient(135deg, #F5F5F7 0%, #E8E8EB 100%)',
        border: '0.5px solid var(--gg-border)',
        display: 'flex', flexDirection: 'column', gap: 3,
        padding: 16,
      }}
    >
      {([
        { w: '100%', bg: 'var(--gg-text-primary)',   fg: '#fff',                      label: 'Senior · SBA 7(a)' },
        { w: '75%',  bg: 'var(--gg-text-secondary)', fg: '#fff',                      label: 'Mezz · 12%' },
        { w: '58%',  bg: 'var(--gg-text-muted)',     fg: '#fff',                      label: 'Seller · standby' },
        { w: '42%',  bg: 'var(--gg-border-strong)',  fg: 'var(--gg-text-primary)',    label: 'Equity · 10%' },
      ] as const).map((l, i) => (
        <div
          key={i}
          style={{
            height: 22, borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 8px',
            fontFamily: 'var(--gg-display)',
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: l.bg,
            color: l.fg,
            width: l.w,
          }}
        >
          <span>{l.label}</span>
        </div>
      ))}
    </div>
  );
}
