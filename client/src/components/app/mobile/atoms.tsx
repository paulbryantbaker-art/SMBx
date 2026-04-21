/**
 * Mobile atoms — ScoreDonut, Pill, DimRow.
 *
 * Ported from app_v4/shared/cards.tsx and rebuilt on the Glass Grok
 * monochrome token set. No v4 CSS dependencies — all styles inline or
 * in mobile.css.
 */

import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   ScoreDonut — rounded stroke ring with score/100 centered in Sora.
   Ink-colored progress on a muted track.
   ═══════════════════════════════════════════════════════════════════ */

interface ScoreDonutProps {
  score: number;
  max?: number;
  size?: number;
}

export function ScoreDonut({ score, max = 100, size = 140 }: ScoreDonutProps) {
  const R = 90;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, score / max));
  const off = C * (1 - pct);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r={R} fill="none" stroke="#F0F0F2" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={R}
          fill="none" stroke="var(--accent)" strokeWidth="14"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.19,1,0.22,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.3,
            letterSpacing: '-0.035em',
            lineHeight: 1,
            color: 'var(--text-primary)',
          }}
        >
          {score}
          <span style={{ fontSize: size * 0.11, color: 'var(--text-faint)' }}>/{max}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Pill — status chip. Tone drives background/text. Monochrome content
   pills (ok / warn / flag use dot-colored tints; ink is inverted black).
   ═══════════════════════════════════════════════════════════════════ */

export type PillTone = 'ok' | 'warn' | 'flag' | 'ink' | 'neutral';

const PILL_TONE: Record<PillTone, { bg: string; fg: string }> = {
  ok:      { bg: 'var(--band-high-bg)',  fg: 'var(--band-high-fg)' },
  warn:    { bg: 'var(--band-med-bg)',   fg: 'var(--band-med-fg)' },
  flag:    { bg: 'var(--band-flag-bg)',  fg: 'var(--band-flag-fg)' },
  ink:     { bg: 'var(--accent)',        fg: '#FFFFFF' },
  neutral: { bg: 'var(--bg-subtle)',     fg: 'var(--text-secondary)' },
};

export function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
  const { bg, fg } = PILL_TONE[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DimRow — a scored dimension line. Dot · label · progress bar · value.
   Normalises input values that may be 0-10 or 0-100 by detecting max.
   ═══════════════════════════════════════════════════════════════════ */

export type DimTone = 'green' | 'amber' | 'red';

const TONE_HEX: Record<DimTone, string> = {
  green: 'var(--dot-ready)',
  amber: 'var(--dot-progress)',
  red:   'var(--dot-flag)',
};

export interface DimRowProps {
  label: string;
  value: number;       // 0-10 or 0-100 — auto-detected
  /** Optional explicit tone. If omitted, derived from value. */
  tone?: DimTone;
  /** Assumed max. Defaults to 10. */
  max?: number;
}

function toneFromValue(value: number, max: number): DimTone {
  const pct = value / max;
  if (pct >= 0.75) return 'green';
  if (pct >= 0.45) return 'amber';
  return 'red';
}

export function DimRow({ label, value, tone, max = 10 }: DimRowProps) {
  const effectiveMax = value > 10 ? 100 : max;
  const effectiveTone = tone ?? toneFromValue(value, effectiveMax);
  const pct = Math.max(0, Math.min(1, value / effectiveMax));
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: TONE_HEX[effectiveTone],
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          flex: '0 0 112px',
          textTransform: 'capitalize',
        }}
      >
        {label.replace(/_/g, ' ')}
      </span>
      <span
        style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          background: 'var(--bg-muted)',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${pct * 100}%`,
            background: 'var(--accent)',
            transition: 'width 800ms cubic-bezier(0.19,1,0.22,1)',
          }}
        />
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 700,
          color: 'var(--text-primary)',
          flex: '0 0 28px',
          textAlign: 'right',
          letterSpacing: '-0.005em',
        }}
      >
        {effectiveMax === 100 ? value : value.toFixed(1)}
      </span>
    </div>
  );
}
