/**
 * models/theme.ts — the canvas models' palette, in LITERALS.
 *
 * (2026-08-16, the canvas-model leg of the Trainline/Carta conversion.)
 *
 * WHY THIS FILE EXISTS — two defects, one cause:
 *
 * 1. Charts.tsx set `ChartJS.defaults.color = 'var(--cd-ink)'` directly above
 *    a comment saying "literal strings — CSS vars don't reach canvas". It was
 *    right the first time: a CSS variable inside a <canvas> 2D context is not
 *    resolved, so chart ticks and series painted in whatever Chart.js fell
 *    back to. Worse, `--cd-*` is SCOPED under `.cd-root` and neither shell
 *    mounts one, so even the DOM-side `var(--cd-*)` styles resolved to
 *    nothing. The models were not wearing a stale palette; they were wearing
 *    a MISSING one.
 *
 * 2. The model files themselves read `--m-*` — the retired V6 "Ramp"
 *    neon-green/warm-paper layer (#2BFF77 era), which is on the dead-systems
 *    list.
 *
 * So every colour the models use now comes from HERE, as hex literals derived
 * from the same tokens the shell reads (`T` ← house/tokens CARTA). Canvas and
 * DOM read the identical values, and the retired-hex gate in
 * house/__tests__/design.test.mts walks this directory too.
 *
 * SEMANTICS KEEP THEIR HUES. Deal Green is the ACCENT (series, sliders,
 * active); the ok/warn/bad triple is for THRESHOLD state (DSCR floors, IRR
 * targets) — the two-greens law and the amber/terra rationale are documented
 * in atlasTokens.ts. A heatmap that painted "below covenant" in brand green
 * would be decoration eating the only pre-attentive cue the number has.
 */
import type { CSSProperties } from 'react';
import { T } from '../v6/desktop/atlasTokens';

export const MC = {
  /* text */
  ink: T.ink,
  muted: T.muted,
  faint: T.muted2,

  /* the accent — Deal Green, for series fills, sliders, active states */
  green: T.blue,
  greenTint: T.blueBg,
  /* the accent at wash strength, for area fills under lines (literal rgba —
     canvas gradients cannot read tokens) */
  greenWash: 'rgba(10, 122, 88, 0.14)',

  /* threshold semantics — verdict green / amber / terra (NOT the accent) */
  ok: T.green,
  okBg: T.greenBg,
  warn: T.amber,
  warnBg: T.amberBg,
  bad: T.terra,
  badBg: T.terraBg,

  /* surfaces + lines */
  white: T.white,
  track: T.track,     // the filled-cell grey every input sits on
  border: T.border,
  inputBd: T.inputBd,
  grid: 'rgba(22, 24, 26, 0.06)', // chart gridlines
} as const;

/* ── the transcription's shared shapes, for the model bodies ─────────── */

/** A filled stat cell — the criteria-cell shape (fill IS the boundary). */
export const mCell: CSSProperties = {
  background: MC.track, borderRadius: 8, padding: '10px 12px',
};

/** A white bordered card, radius 8 — the sheet shape for chart wells. */
export const mCard: CSSProperties = {
  background: MC.white, border: `1px solid ${MC.border}`,
  borderRadius: 8, padding: '14px 16px',
};

/** Small label over a value. */
export const mLabel: CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
  textTransform: 'uppercase', color: MC.faint,
};

/** A filled input/select, radius 8 — the transcription's control shape. */
export const mInput: CSSProperties = {
  font: 'inherit', fontSize: 13.5, color: MC.ink,
  background: MC.track, border: 'none', borderRadius: 8,
  padding: '8px 10px', outline: 'none',
};

/** Section heading inside a model body. */
export const mHead: CSSProperties = {
  fontSize: 15, fontWeight: 700, color: MC.ink, margin: 0,
};
