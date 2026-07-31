# smbX — DESIGN LANGUAGE (canonical)

**Status: CURRENT · Last updated 2026-07-30 · Supersedes every other design doc in this repo for visual decisions.**
This is the one document to hand to any Claude, designer, or design tool working on smbX surfaces. If a doc, screenshot, or memory disagrees with this file, this file wins.

> **Producing COLLATERAL — a carousel, a one-pager, a report PDF? Read
> `content/studio/DESIGN.md` instead.** It is this system applied to the three
> builders: the same palette and type, plus the page-by-page layout grammar,
> the standing marks, and the drift checklist. It also travels — `init-workspace`
> copies it into the studio workspace as `DESIGN.md`, which this file does not
> do, and that gap is why collateral was drifting toward retired palettes.
>
> The two cannot disagree: both describe `house/tokens.ts`, and
> `npm run test:design` checks the collateral doc against that module **and**
> against the live site stylesheet on every run. This file stays canonical for
> the site and for the system as a whole.

---

## PASTE-THIS-INTO-CLAUDE SUMMARY

> smbX is a buy-side corp-dev practice. The visual language ("Ledger") is a quiet fintech-editorial system: **bone paper `#FCFAF6`**, ink `#16181A`, white hairline cards, and **exactly one accent — Deal Green `#0A7A58`** (with vivid jade `#0FA97C` for large numerals, edges and ambient blooms — never small text, it does not hold contrast) — plus **amber `#E8A62B`** as jewelry on signature numbers, `#F5C452` where that sits on the block. **Nothing in this system is near-black.** The full-bleed rhythm break is a **saturated jade block `#0A6A4C`** with ivory text `#F2FBF6` and mint `#A8F0CE` rules. Display type is **Fraunces** (serif, weight ~545); working type is **Inter** with tabular figures; labels are **IBM Plex Mono**, 13–13.5px, ≤0.12em tracking, never smaller. Buttons are **pills** (fully rounded); cards are 12–16px radius. Giant cited numerals ARE the graphics. **Never use:** the retired Ledger green-black `#16624C` `#0F4E3C` `#0F1A16`, terra cotta `#D4714E`, coral/pink `#FF385C` `#E61E4D`, office blue `#185ABD`, neon green `#00D632`, lavender/periwinkle, or gradients on CTAs. No decorative micro-labels ("eyebrows"). Photography is real (founder photos) or absent — no stock, no AI-gloss people.

---

## 1. DEAD SYSTEMS — never output these

Every one of these appeared in an older doc or screenshot and is **retired**. If your draft contains any of these hexes or moods, you anchored on a stale source — stop and re-read this file.

| Dead system | Signature colors | Died |
|---|---|---|
| Terra cotta wireframe pass | `#D4714E`, clay/apricot terracotta anything | 2026-07-10 |
| Liquid-glass product marketing | neon `#00D632`, canvas gradients, glass/ink cards | 2026-07-11 (unrouted) |
| Coral practice site v1–v3 | `#FF385C`, `#E61E4D`, `#D70466`, pink/rose ambient washes | 2026-07-17 |
| Office-blue pivot (one day) | `#185ABD`, `#124A9E`, `#9EC1FF` | 2026-07-17 (same evening) |
| V6 slate/lavender/periwinkle (Material) | slate-blue chips, lavender surfaces | 2026-06-24 cutover |
| Hot pink V3/V4 | `#D44A78` | 2026 spring |
| Warm-cream "Edition" era | cream editorial with serif columns | 2026 spring |

**Trap to know:** in the live CSS the custom-property *names* still say `--pd-coral*` for historical reasons, but their *values* are the greens below. Never infer color from a variable name.

---

## 2. CURRENT TOKENS — the Ledger system (public site + all shareable artifacts)

### Surfaces
| Token | Value | Use |
|---|---|---|
| Bone canvas | `#FCFAF6` | Page background. Tonal-bone ambient only — **no chromatic washes** |
| Card | `#FFFFFF` | Raised elements. 1px hairline `#EAE5DC`, radius 12–16, soft-lift shadow |
| Hairline | `#EAE5DC` | Borders, rules, table lines |
| Jade block | `#0A6A4C` (top `#0C7554` → bot `#085F43`) | Full-bleed rhythm-break sections. Not near-black — see the recipe below |

### Ink
| Token | Value | Use |
|---|---|---|
| Ink | `#16181A` | Headlines, strong text |
| Slate body | `#5A6169` | Body copy |
| Muted | `#83898F` | Tertiary, timestamps, sources |
| Ivory (on dark) | `#F2FBF6` | All reading text on dark bands — hierarchy comes from size/weight, not color |
| Ivory-sub (on dark) | `#DED8CC` | Secondary on dark |

### The one accent + jewelry
| Token | Value | Use |
|---|---|---|
| **Deal Green** | `#0A7A58` | THE accent: CTAs, links, active states, rules, dots |
| Green hover | `#086348` | Hover/pressed |
| Green tint chip | `#DFF5EC` | Chip/soft-pill backgrounds (green text on top) |
| Mint on dark | `#A8F0CE` | Links/labels on dark bands; the X in the dark logo |
| **Brass** | `#E8A62B` | JEWELRY ONLY: the bar under a signature numeral, one mono label (e.g. KEY FINDINGS), never body text, never buttons |

### Dark-band recipe
Base `#0A6A4C`, the blackbleed texture (`/textures/blackbleed.webp`, cover), **then an 0.84 glaze of the base colour OVER the texture** — `linear-gradient(rgba(10,106,76,.84), rgba(10,106,76,.84))` — then a **jade top halo** `radial-gradient(rgba(15,169,124,~.20–.28) at top)`. Text ivory. Never aubergine, never warm ember, never neutral charcoal.

**The 0.84 glaze is mandatory and it is the easiest thing here to get wrong.** The texture is a near-black image sitting ABOVE the colour in the background stack, so it wins outright at a low alpha and the colour underneath is only ever the no-image fallback. Written the intuitive way — `background: #0A6A4C url(texture)` — every block renders near-black while the code reads as though it is jade, with no error and no visual diff to catch it. Use `blockBackground()` from `house/tokens.ts`; do not hand-roll the stack.

---

## 3. TYPE

| Role | Face | Spec |
|---|---|---|
| Display (H1/H2/pull-quotes) | **Fraunces** | weight ~545, tracking ≈ −0.012em, generous leading; site H1 clamp(42–68), H2 clamp(38–62) |
| Working (everything else) | **Inter** | 400–800; body 18px/1.7 on site; **`font-variant-numeric: tabular-nums` globally** |
| Labels/kickers/sources | **IBM Plex Mono** | 13–13.5px, ≤0.12em tracking, uppercase allowed. **Hard floor: no customer-facing text below 13px** |
| Signature numerals | Inter 800 | Giant (92–190px in artifacts; 92–168px on site), tight −0.03em, often with the brass bar |

Ladder law: one size per role, one header measure (≈18em). No per-section bespoke sizes.

## 4. SHAPE & COMPONENTS

- **Buttons: pills** (radius 999). Primary = solid Deal Green with white text; secondary = ghost with ink hairline. Never squared, never gradient.
- **Cards:** white, hairline, radius 12–16, soft shadow. Surfaces separate by tone, not heavy borders.
- **Chips:** green-on-tint (`#0A7A58` on `#DFF5EC`), pill.
- **Chat console:** 16px-radius white card (not a 999 pill).
- **Nav:** solid bone, no backdrop-blur.
- **NO decorative eyebrows/micro-labels** ("PIPELINE", "deal intelligence · online"). Lead with the real header. A label exists only when it carries information the reader can't infer.
- Layout: two widths only — rail `1360px`, artifact/mid `1040px`. Section pads clamp(130px–220px).

## 5. LOGO LAW

Current files: `/logo-green-x.png` (light surfaces, as-is), `/logo-x-green.png` (X-only), `/logo-green-x-dark.png` (dark surfaces: white wordmark, **mint X**). On dark, either use the dark file or white-invert the light file (`filter: brightness(0) invert(1)`). Never redraw, recolor, stretch, or add effects. Dead logo files you may see referenced in old docs: `G3L.png`, `G3D.png`, `x-logo.png`, `GX.png`, `redx.png`, any rose-gold/3D variant — all deleted.

## 6. GRAPHICS DOCTRINE (LinkedIn + documents)

1. **The number IS the graphic.** A cited stat rendered as a giant numeral with a brass bar beats illustration. Every number must come from a cited source — zero fabrication, no fake charts, no invented benchmarks.
2. **The face is the trust layer.** Paul's real headshot (round crop, mint ring on dark) appears on every produced artifact: report byline, 1-pager footer, carousel cover + closer.
3. **Photography is real or absent.** Founder photos from the media library (focal-point cropped). No stock, no photoreal AI people, no AI-gloss.
4. Dark closers use the boardroom band recipe; light pages use bone + wash-free white cards.

## 7. VOICE (for any copy on designed surfaces)

- Describe the work, never a competitor. No grievance copy.
- Category = corporate development function (not "cheaper investment bank").
- AI language stays out of customer copy except the sanctioned outcome claim ("we cover a market in days").
- Buy-side loyalty stated warmly, once — never a stacked oath. Sanctioned closer: "Every transaction above was done for a buyer. That hasn't changed."
- Track-record attribution law: "led or co-led", "selected transactions", employers anonymized as "a global investment bank" / "a world-class PE-backed aggregator", total stated as **150 acquisitions**, shield sentence wherever deal names appear.
- No fee/pricing content anywhere public.

## 8. SCOPE NOTES

- This file governs the **public practice site** (`client/src/practice/`, `.pd` scope) and **all shareable artifacts** (report PDF, 1-pager, carousel, announcement/post cards — `server/services/researchComposer.ts`).
- The **in-app shells keep their own languages** (desktop "Atlas": Google-blue `#0b57d0`; mobile: neutral-grey pages with brand-green `#2BFF77` fills) — do not apply the site language to app chrome, or app tokens to public surfaces.
- Historical docs that must NOT be designed from: `CLAUDE_DESIGN_BRIEF.md`, `CLAUDE_DESIGN_SOCIAL_BRIEF.md`, `CLAUDE_DESIGN_COPY.md`, `DESIGN_TOKENS.md`, `DESIGN_SOURCE.md`, `AGENTS.md`, `design_handoff_*/`, `smbx-ai-marketing-redesign/`, anything in `docs/_archive/`.
