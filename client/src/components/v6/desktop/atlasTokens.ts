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
 * The warm neutrals between bone and hair (page/hover/track/rowDiv…) are
 * DERIVED blends, documented here because LEDGER carries only the endpoints.
 * `page` #F9F6F0 is the bone↔well midpoint (2026-08-02, Paul on the first
 * deploy: "a little too dark — I don't think Aurora is that dark". The
 * first cut used the site's recessed-well #F6F3EB and it read dingy next
 * to Safari showing the site's bone canvas). White cards still read raised
 * the Cash-App way — by tone — but the step is one notch, not two.
 */
import { LEDGER, rgba } from '../../../../../house/tokens';

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
  ink: LEDGER.ink, ink2: '#181a1e', ink3: '#2d3136', label: '#393c41',
  muted: '#4d5765', muted2: '#4b5460', faint: '#4e5764',
  // primary / active — Deal Green (slot names historical, see header).
  // White on LEDGER.green measures 5.3:1 (documented in house/tokens.ts).
  blue: LEDGER.green, blueBg: LEDGER.greenTint, blueBg3: '#F2F9F5',
  navActive: rgba(LEDGER.green, 0.16), stageActiveBd: rgba(LEDGER.green, 0.32), approvalBd: rgba(LEDGER.green, 0.26),
  tabActive: rgba(LEDGER.green, 0.10), tabHover: rgba(LEDGER.green, 0.05),
  // verdict green — UNCHANGED on purpose (two-greens law, see header)
  green: '#1f8a5b', greenBg: '#e6f4ec', greenAv: '#cdeada',
  // semantic warning/danger — already Aurora-compatible warms; unchanged
  amber: '#9a6b00', amberBg: '#fdf0d5', amberBg2: '#fff3e0', amberAv: '#f3e0b0',
  terra: '#c2410c', terraBg: '#fdeee6',
  // the violet secondary collapses into the brand accent for Phase 1; if a
  // surface needs a genuine second hue in Phase 3, Aurora's answer is amber.
  violet: LEDGER.green, violetBg: LEDGER.greenTint,
  // surfaces / borders — bone canvas, white cards, warm hairlines (the
  // Aurora card grammar; separation by tone, per the Cash App reference)
  white: '#fff', surface: LEDGER.bone, page: '#F9F6F0', hover: '#F8F5EE',
  track: '#F2EEE5', railDiv: '#F0ECE3',
  border: LEDGER.rule, hair: LEDGER.hair, rowDiv: '#F2EEE5', rowDiv2: '#F6F2EA',
  inputBd: LEDGER.rule, progTrack: '#EDE9DF',
  // gradients — the AI sparkle speaks Aurora now: jade → green → amber
  spark: `linear-gradient(135deg,${LEDGER.jade},${LEDGER.green} 50%,${LEDGER.brass})`,
  avatarGrad: `linear-gradient(135deg,${LEDGER.jade},${LEDGER.green})`,
  // radii
  rCard: 14, rCardLg: 16, rPill: 999, rComposer: 24,
  // shadow — warm-ink tinted (was faintly violet for the purple wash era)
  shCard: '0 2px 6px rgba(22,24,26,.08), 0 1px 2px rgba(22,24,26,.05)',
  shSoft: '0 1px 3px rgba(22,24,26,.06)',
  shHover: '0 6px 16px rgba(22,24,26,.12)',
} as const;

export type AtlasTokens = typeof T;
