# TOKENS-USED — figure-card finals (2026-08-19)

Four deliverables: `2a-green-monolith-{light,dark}.html`, `2b-stepped-portal-{light,dark}.html`, 1080×1350 exact.

## Hex → token (`laws/tokens.ts`, CARTA block)

| Hex | Token | Where |
|---|---|---|
| #FFFFFF | `bone`/`white` | light canvas, 47% numeral, headshot ring, dark-CTA, F/hook on green |
| #F9F7F1 | `boneAlt` | light panel gradient mid stop |
| #F3F0E9 | `panel` | light panel gradient end stop |
| #16181A | `ink` | light text, 2a-light offset plate, 2b-dark bar+label on greenBright |
| #4A4F54 | `body` | light body copy |
| #7C8187 | `muted` | light source lines, titles |
| #E4DFD3 | `hair` | light seams, foot hairlines |
| #D8D3C6 | `chipBorder` | orbit ring (light), dots (light), ring outline |
| #0A7A58 | `green` | monolith / p3, kickers, hook turns, chips text, CTA on light; bloom color (rgba-derived) |
| #086348 | `greenHover` | monolith inner seam, p4 (light portal) / p2 (dark portal) |
| #DFF5EC | `greenTint` | chips, monolith label, p1 (light portal) |
| #0FA97C | `greenBright` | 2a-dark offset rim plate, p2 (light) / p4 (dark) portal steps |
| #A8F0CE | `mint` | mint bars, dark kickers, dark hook turns, orbit nodes (dark) |
| #181818 | `dark` | dark canvas + dark foot |
| #2A2E29 | `darkSeam` | dark seams, orbit (dark), foot hairline |
| #22261F | `darkPlate` | dark panel gradient start, dark chips, p1 (dark portal) |
| #F4F5F1 | `darkInk` | dark headlines/names |
| #D7DBD2 | `darkSub` | dark lede |
| #ABB2AB | `darkMuted` | dark point bodies, titles |
| #8A9088 | `darkLegal` | dark source line |
| #4A4F44 | `darkBtnBorder` | dark ring outline, dots (dark) |

## Amendments sanctioned by Paul in this thread (2026-08-19)

1. **Gradients, scoped to this card family.** "let's be imaginative on this and have some depth feel and gradient to it."
   - Left copy panel: `linear-gradient(170deg, bone→boneAlt 46%→panel)` light; `(170deg, darkPlate→dark 62%)` dark. All stops are tokens.
   - 2a-dark bloom: `radial-gradient(620px 880px at 655px 620px, rgba(green,.55)→rgba(green,.22) 42%→0 85%)` — the approved C-treatment geometry, re-aimed. Derived via `rgba(CARTA.green, α)`, never hand-typed.
   - Renderer-proof law still applies: rasterise at 2× before PDF/post (no gradient reaches a vector layer).
2. **Exposure lift on the figure, in CSS never the asset:** `brightness(1.16) contrast(1.05)` on dark (the pre-approved values), `brightness(1.08) contrast(1.02)` on light (new — sanctioned by "add just a little lighting to my image").
3. **Deal Green as a plate surface** (the monolith / portal steps) — follows from picking 2a/2b.

Depth mechanics otherwise geometric: 14px offset plates (ink on light, greenBright on dark = rim light), 38px receding portal steps, staggered plate bottoms.

Copy verbatim from `laws/day-four-questions.post.mts`; the one mono label is a verbatim substring of the lede. Type: Source Serif 4 (550) · Schibsted Grotesk · IBM Plex Mono from `assets/fonts/`. Radius 0 except the round headshot crop.
