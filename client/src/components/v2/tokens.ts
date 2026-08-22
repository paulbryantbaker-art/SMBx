/**
 * V2 tokens — THE CARTA SITE LANGUAGE, IN THE APP.
 *
 * (2026-08-16, Paul on the restart: "i dont want train UI -- can you just
 * use the Carta UI that we have for the external site.")
 *
 * So this reads the SAME source the public site reads — `house/tokens.ts`
 * CARTA — and carries the site's laws into the workspace:
 *   · white canvas, panel #F3F0E9 fills, hairline #E4DFD3 structure
 *   · radius 0 everywhere EXCEPT buttons and inputs
 *   · THE BUTTON LAW: green is never a resting fill — primary is ink,
 *     green lives on links, chips, kickers, and hover
 *   · Source Serif 4 for display, Schibsted Grotesk for working type,
 *     IBM Plex Mono for counts, dates and aging (all three load in
 *     index.html for the practice site already)
 *
 * The Trainline kit (v6/desktop/kit) is RETIRED for new surfaces with the
 * chrome it belonged to; its honesty grammar (missing ≠ zero, stated
 * orderings, grounds on every endorsement) carries forward as law, in this
 * language.
 */
/* OXBLOOD CUTOVER, 2026-08-22: the app is scoped OUT of the palette change
   (the new accent #B8431E sits 20.7 RGB from this shell's danger colour).
   Aliased so every CARTA.* below keeps working against the frozen values —
   see CARTA_APP in house/tokens.ts before repointing this back. */
import { CARTA_APP as CARTA } from '../../../../house/tokens';

export const C = {
  /* surfaces */
  bg: CARTA.bone,            // #FFFFFF — the measured Carta canvas
  panel: CARTA.panel,        // #F3F0E9
  panelHover: CARTA.panelHover,
  hair: CARTA.hair,          // #E4DFD3
  chipBd: CARTA.chipBorder,  // #D8D3C6

  /* ink scale */
  ink: CARTA.ink,            // #16181A
  body: CARTA.body,          // #4A4F54
  muted: CARTA.muted,        // #7C8187

  /* the one accent */
  green: CARTA.green,        // #0A7A58 — links, chips, kickers, active
  greenHover: CARTA.greenHover,
  greenTint: CARTA.greenTint,

  /* functional state (not brand): overdue/danger reads warm on purpose —
     the site has no warning states; a workspace does. */
  danger: '#B42318',
  dangerTint: '#FDECEA',

  /* type */
  display: '"Source Serif 4", Georgia, serif',
  sans: '"Schibsted Grotesk", Inter, system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
} as const;

import type { CSSProperties } from 'react';

/* ── the shared shapes, stated once ─────────────────────────────────── */

/** Filled input — the site's control shape: panel fill, chip border, small radius. */
export const input: CSSProperties = {
  font: 'inherit', fontFamily: C.sans, fontSize: 14, color: C.ink,
  background: C.bg, border: `1px solid ${C.chipBd}`, borderRadius: 6,
  padding: '8px 11px', outline: 'none', minWidth: 0,
};

/** THE BUTTON LAW: primary is ink; green arrives on hover (via onMouse in situ
 *  or just stays ink — never a resting green fill). */
export const btnPrimary: CSSProperties = {
  font: 'inherit', fontFamily: C.sans, fontSize: 14, fontWeight: 700,
  color: '#fff', background: C.ink, border: 'none', borderRadius: 6,
  padding: '9px 16px', cursor: 'pointer',
};

export const btnGhost: CSSProperties = {
  font: 'inherit', fontFamily: C.sans, fontSize: 13.5, fontWeight: 600,
  color: C.ink, background: C.bg, border: `1px solid ${C.chipBd}`,
  borderRadius: 6, padding: '7px 13px', cursor: 'pointer',
};

/** Mono meta — counts, dates, aging. */
export const mono: CSSProperties = {
  fontFamily: C.mono, fontSize: 12.5, color: C.muted, letterSpacing: '0.01em',
};

/** A green text chip (tint ground) — status, kickers. Radius 0: not a control. */
export const chip: CSSProperties = {
  fontFamily: C.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
  color: C.green, background: C.greenTint, padding: '3px 8px',
  display: 'inline-block',
};
