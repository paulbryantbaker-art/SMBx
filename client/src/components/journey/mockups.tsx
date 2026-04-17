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

import { type ReactNode } from 'react';

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
  return (
    <div
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
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0',
            borderBottom: i === lines.length - 1 ? '0' : '0.5px solid var(--gg-border)',
            gap: 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: 'var(--gg-text-primary)', fontWeight: 500 }}>{l.title}</div>
            {l.subtitle && (
              <div style={{ fontSize: 11.5, color: 'var(--gg-text-muted)', marginTop: 2 }}>{l.subtitle}</div>
            )}
          </div>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em', flexShrink: 0 }}>
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
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.75 }}>{totalLabel}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{totalNote}</div>
        </div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', flexShrink: 0 }}>
          {totalAmount}
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
            ? (<>{company.split(' ').slice(0, 2).join(' ')}<br />{company.split(' ').slice(2).join(' ')}</>)
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
  return (
    <div
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
            }}
          >
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 4 }}>{c.price}</div>
            <div style={{ fontSize: 10.5, opacity: 0.7 }}>{c.note}</div>
          </div>
        ))}
      </div>
      {footnote && (
        <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--gg-bg-subtle)', borderRadius: 10, fontSize: 12.5, color: 'var(--gg-text-secondary)', lineHeight: 1.55 }}>
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

export function ScoreRing({ score = 87, verdict = 'Pursue', band = 'hi' }: {
  score?: number; verdict?: string; band?: 'hi' | 'med' | 'low';
}) {
  const ringColor = band === 'hi' ? 'var(--gg-dot-ready)' : band === 'med' ? 'var(--gg-dot-progress)' : 'var(--gg-dot-flag)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 120, height: 120,
          borderRadius: '50%',
          border: '3px solid var(--gg-text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--gg-display)',
          fontWeight: 800,
          fontSize: 38,
          letterSpacing: '-0.025em',
          background: '#fff',
          position: 'relative',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: ringColor,
            borderRightColor: ringColor,
            transform: 'rotate(25deg)',
          }}
        />
        {score}
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
  const toneMap: Record<StackLayer['tone'], { bg: string; fg: string }> = {
    ink:   { bg: 'var(--gg-text-primary)',   fg: '#fff' },
    dark:  { bg: 'var(--gg-text-secondary)', fg: '#fff' },
    mid:   { bg: 'var(--gg-text-muted)',     fg: '#fff' },
    light: { bg: 'var(--gg-border-strong)',  fg: 'var(--gg-text-primary)' },
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 22, background: 'var(--gg-bg-subtle)', borderRadius: 14, border: '0.5px solid var(--gg-border)' }}>
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
              width: `${layer.width}%`,
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
  return (
    <div
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
      <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', color: 'var(--gg-text-primary)' }}>
        {value}
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
