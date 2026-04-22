/**
 * InlineArtifact — artifact preview card rendered beneath an assistant
 * message inside ChatFullscreen.
 *
 * Self-contained after the 2026-04-22 mobile UI strip: the ScoreDonut
 * + Pill atoms are inlined here (previously imported from the deleted
 * mobile/atoms.tsx). The deal shape is the lightweight ChatDeal from
 * ChatFullscreen — no dependency on the deleted adaptDeals.
 *
 * Kind routing (by deliverable.slug):
 *   - rundown / score           → ScoreDonut + Pursue/Hold/Pass pill
 *   - baseline / league_card    → revenue + SDE + EBITDA row
 *   - cim                       → "CIM draft" headline
 *   - loi                       → asking-price headline + rec line
 *   - dd / diligence            → status pill set
 *   - model / dcf / lbo         → EBITDA + asking row
 *   - default                   → generic "ready in data room" row
 */

import type { ReactNode } from 'react';
import type { AppDeliverable } from '../types';
import type { ChatDeal } from './ChatFullscreen';

interface Props {
  artifact: AppDeliverable;
  deal: ChatDeal;
}

export default function InlineArtifact({ artifact, deal }: Props) {
  const slug = (artifact.slug || '').toLowerCase();

  const frame = (inner: ReactNode) => (
    <div
      style={{
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 8,
        }}
      >
        {artifact.name}
      </div>
      {inner}
    </div>
  );

  /* ── Rundown (score + verdict) ───────────────────────── */
  if (/rundown|score/.test(slug) && deal.score != null) {
    const status = deal.score >= 70 ? 'Pursue' : deal.score >= 55 ? 'Hold' : 'Pass';
    const tone: PillTone = deal.score >= 70 ? 'ok' : deal.score >= 55 ? 'warn' : 'flag';
    return frame(
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ScoreDonut score={deal.score} size={84} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <Pill tone={tone}>{status}</Pill>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {deal.name}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
            {[deal.industry, deal.revenueLabel && `${deal.revenueLabel} rev`, deal.ebitdaLabel && `${deal.ebitdaLabel} EBITDA`]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      </div>,
    );
  }

  /* ── Baseline / league card (headline financials) ───── */
  if (/baseline|league/.test(slug)) {
    return frame(
      <div>
        <HeadlineStat label="Revenue" value={deal.revenueLabel ?? '—'} />
        <HeadlineStat label="SDE"     value={deal.sdeLabel ?? '—'} />
        <HeadlineStat label="EBITDA"  value={deal.ebitdaLabel ?? '—'} />
      </div>,
    );
  }

  /* ── CIM ────────────────────────────────────────────── */
  if (/cim/.test(slug)) {
    return frame(
      <div>
        <div style={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {deal.name} · CIM draft
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
          10–15 page marketing document — ready to review.
        </div>
      </div>,
    );
  }

  /* ── LOI (price + rec line) ─────────────────────────── */
  if (/loi/.test(slug) && deal.askingPriceLabel) {
    return frame(
      <div>
        <div style={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {deal.askingPriceLabel}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.04em' }}>
            REC
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
          Cash / seller note / rollover structure — ready for your review.
        </div>
      </div>,
    );
  }

  /* ── DD checklist ───────────────────────────────────── */
  if (/dd|diligence/.test(slug)) {
    return frame(
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Pill tone="ok">Gate cleared</Pill>
        {deal.score != null && <Pill tone="ink">Score {deal.score}</Pill>}
      </div>,
    );
  }

  /* ── Financial model (DCF / LBO) ────────────────────── */
  if (/model|dcf|lbo/.test(slug)) {
    return frame(
      <div>
        <HeadlineStat label="EBITDA" value={deal.ebitdaLabel ?? '—'} />
        <HeadlineStat label="Asking" value={deal.askingPriceLabel ?? '—'} />
      </div>,
    );
  }

  /* ── Default — generic "produced" row ───────────────── */
  return frame(
    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
      Ready in your data room · <strong style={{ color: 'var(--text-primary)' }}>{deal.name}</strong>
    </div>,
  );
}

/* ── Inlined atoms (ScoreDonut + Pill + HeadlineStat) ─── */

function ScoreDonut({ score, size = 84 }: { score: number; size?: number }) {
  const max = 100;
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

type PillTone = 'ok' | 'warn' | 'flag' | 'ink' | 'neutral';

const PILL_TONE: Record<PillTone, { bg: string; fg: string }> = {
  ok:      { bg: 'var(--band-high-bg)',  fg: 'var(--band-high-fg)' },
  warn:    { bg: 'var(--band-med-bg)',   fg: 'var(--band-med-fg)' },
  flag:    { bg: 'var(--band-flag-bg)',  fg: 'var(--band-flag-fg)' },
  ink:     { bg: 'var(--accent)',        fg: '#FFFFFF' },
  neutral: { bg: 'var(--bg-subtle)',     fg: 'var(--text-secondary)' },
};

function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
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

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '3px 0' }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}
