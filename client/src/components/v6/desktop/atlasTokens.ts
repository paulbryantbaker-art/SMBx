/**
 * Atlas desktop design tokens — the single source of truth for inline-styled
 * desktop components. `atlas.css` mirrors the palette as CSS vars under
 * `.atlas-root`; this object is what every screen imports.
 *
 * AURORA SKIN (2026-08-02, Paul: "how do we marry Aurora with Cash App…
 * I like the style guide of Aurora"). The app now IMPORTS the house palette
 * from `house/tokens.ts` — the same file the practice site, the PDF
 * composers and the studio builders read — so the app and every other
 * surface cannot drift apart. This executes Phase 1 of
 * UI_RETOOL_READINESS.md: token-level, reversible, the shells' grammar
 * untouched.
 *
 * SLOT NAMES ARE HISTORICAL, VALUES ARE AURORA. `blue` holds Deal Green now
 * — the same names-kept/values-swapped pattern practice.css uses for its
 * `--pd-coral*` slots. Renaming the keys is a 33-file churn for zero pixels;
 * do it in a quiet moment or never.
 *
 * TWO-GREENS LAW (UI_RETOOL_READINESS §3.6): `green`/`greenBg`/`greenAv` are
 * the VERDICT/"pursue" semantic and deliberately did NOT move to the brand
 * accent — verdict pills must stay visually distinct from primary actions.
 * With the brand itself now green, that law is under real pressure: #1f8a5b
 * vs #0A7A58 read as cousins. Flagged for a Phase 3 decision (likely a
 * shape/treatment distinction — tinted pill + check glyph — rather than a
 * third green). Until then the values stay put and the gate asserts they
 * differ.
 *
 * THE PAGE IS NEUTRAL NEAR-WHITE, NOT WARM (settled 2026-08-02 in three
 * steps: the site's recessed-well #F6F3EB read "a little too dark"; the
 * bone↔well midpoint #F9F6F0 was still not it; then Paul screenshotted the
 * Claude mobile app — "the background should be this color" — and the
 * sampled value is #F9F9F9, a pure neutral). So the marriage is: Aurora's
 * greens, accents and warm hairlines on a NEUTRAL airy page — the tool
 * reads calm and native, the color lives in the accents and cards. The
 * remaining warm in-card wells (track/rowDiv/progTrack…) sit on WHITE, not
 * on the page, and are one decision away from neutralizing if they read
 * yellowed against it.
 */
import { CARTA, rgba } from '../../../../../house/tokens';

export const T = {
  // The native system font (San Francisco on iOS/macOS, Segoe UI on Windows).
  // The OS hints it, so it renders crisper than any webfont — the app reads
  // as native (the Cash App note). Fraunces enters only for select display
  // moments in the Phase 3 screen sweep, never as working type.
  font: '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  // ink / text — the neutral AAA-tuned scale kept from Atlas (2026-06-23
  // lift); only the top step moves onto the house ink. Neutral grays sit
  // fine on warm surfaces; re-warming the whole ladder bought nothing in a
  // side-by-side.
  ink: CARTA.ink, ink2: '#181a1e', ink3: '#2d3136', label: '#393c41',
  muted: '#4d5765', muted2: '#4b5460', faint: '#4e5764',
  // primary / active — Deal Green (slot names historical, see header).
  // White on CARTA.green measures 5.3:1 (documented in house/tokens.ts).
  blue: CARTA.green, blueBg: CARTA.greenTint, blueBg3: '#F2F9F5',
  navActive: rgba(CARTA.green, 0.16), stageActiveBd: rgba(CARTA.green, 0.32), approvalBd: rgba(CARTA.green, 0.26),
  tabActive: rgba(CARTA.green, 0.10), tabHover: rgba(CARTA.green, 0.05),
  // verdict green — UNCHANGED on purpose (two-greens law, see header)
  green: '#1f8a5b', greenBg: '#e6f4ec', greenAv: '#cdeada',
  // SEMANTIC WARNING / DANGER — warm, and deliberately KEPT under Carta.
  //
  // Carta's "there is no warm colour" is a rule about the BRAND ACCENT, and it
  // was written for collateral, where nothing has a warning state: a poster has
  // no overdue task and a report has no failed import. An app does. Rendering a
  // caution in the same green as a healthy one removes the only pre-attentive
  // cue a status has, and "one accent" would then mean the interface can no
  // longer say anything is wrong.
  //
  // These are not the retired palette either — Ledger's amber was #E8A62B and
  // its honey #F5C452; these are a darker functional pair that predates it and
  // reads as state rather than as brand. 88 usages across the shell.
  //
  // Worth Paul's explicit call if he wants them gone; noted here rather than
  // decided quietly, because a warm pixel in a Carta app is exactly what a
  // future reader will flag as drift.
  amber: '#9a6b00', amberBg: '#fdf0d5', amberBg2: '#fff3e0', amberAv: '#f3e0b0',
  terra: '#c2410c', terraBg: '#fdeee6',
  // the violet secondary collapses into the brand accent for Phase 1; if a
  // surface needs a genuine second hue in Phase 3, Aurora's answer is amber.
  violet: CARTA.green, violetBg: CARTA.greenTint,
  // surfaces / borders — bone canvas, white cards, warm hairlines (the
  // Aurora card grammar; separation by tone, per the Cash App reference)
  // CARTA (2026-08-15). Every warm value here is gone: `rule` #DED8CC and
  // `hair` #EAE5DC are both in the retired table, and the five hard-coded
  // bone tints (#F8F5EE #F2EEE5 #F0ECE3 #F6F2EA #EDE9DF) were the same warmth
  // hand-mixed. Carta's neutrals are cool — panel #F3F0E9, hairline #E4DFD3 —
  // and its canvas is white, not bone.
  white: '#fff', surface: CARTA.bone, page: CARTA.boneAlt, hover: CARTA.panel,
  track: CARTA.panel, railDiv: CARTA.hair,
  border: CARTA.hair, hair: CARTA.hair, rowDiv: CARTA.hair, rowDiv2: CARTA.panel,
  inputBd: CARTA.chipBorder, progTrack: CARTA.panel,
  // The sparkle ran jade → green → AMBER, and amber is retired: Carta has
  // exactly one accent. It runs within the accent now — bright green to Deal
  // Green — so the mark still reads as a gradient without inventing a hue.
  spark: `linear-gradient(135deg,${CARTA.greenBright},${CARTA.green} 60%,${CARTA.greenHover})`,
  // FLAT, despite the slot name (2026-08-02, Paul: "my user icon needs to
  // be flattened — it's very 3-D right now"). The diagonal gradient read
  // as a bevel; a flat Deal Green disc with white initials is the Cash App
  // read. The name stays for the same reason `blue` does.
  avatarGrad: CARTA.green,
  // radii
  rCard: 14, rCardLg: 16, rPill: 999, rComposer: 24,
  // shadow — warm-ink tinted (was faintly violet for the purple wash era)
  shCard: '0 2px 6px rgba(22,24,26,.08), 0 1px 2px rgba(22,24,26,.05)',
  shSoft: '0 1px 3px rgba(22,24,26,.06)',
  shHover: '0 6px 16px rgba(22,24,26,.12)',
} as const;

export type AtlasTokens = typeof T;
