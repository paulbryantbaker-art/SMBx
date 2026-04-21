/**
 * InlineArtifact — an artifact preview card that renders beneath an
 * assistant message bubble when Yulia produced a deliverable in that turn.
 *
 * Attribution pattern: we match message ↔ deliverable by temporal proximity
 * (computed in ChatFullscreen). This component just renders the preview.
 *
 * Kind routing (by deliverable.slug):
 *   - rundown / score           → ScoreDonut + Pursue/Hold/Pass pill
 *   - baseline / league_card    → revenue + SDE + EBITDA row
 *   - cim                       → "CIM draft · N pages" with page count
 *   - loi                       → asking-price headline + rec line
 *   - dd / diligence            → status pill set (cleared / today / flagged)
 *   - model / dcf / lbo         → EBITDA + multiple headline
 *   - default                   → generic "deliverable produced" pill row
 *
 * All kinds are bounded — fall back to the generic preview when a slug
 * doesn't match. This prevents runtime crashes on future deliverable types.
 */

import type { AppDeliverable } from '../types';
import type { MobileDeal } from './adaptDeals';
import { ScoreDonut, Pill } from './atoms';

interface Props {
  artifact: AppDeliverable;
  deal: MobileDeal;
}

export default function InlineArtifact({ artifact, deal }: Props) {
  const slug = (artifact.slug || '').toLowerCase();

  // Shared frame for every artifact kind — card with soft shadow,
  // same rhythm as the message bubble.
  const frame = (inner: React.ReactNode) => (
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
    const tone = deal.score >= 70 ? 'ok' : deal.score >= 55 ? 'warn' : 'flag';
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
        <HeadlineStat
          label="Revenue"
          value={deal.revenueLabel ?? '—'}
        />
        <HeadlineStat label="SDE" value={deal.sdeLabel ?? '—'} />
        <HeadlineStat label="EBITDA" value={deal.ebitdaLabel ?? '—'} />
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

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '3px 0',
      }}
    >
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
