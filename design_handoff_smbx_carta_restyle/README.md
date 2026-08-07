# Handoff: smbx.ai marketing site — Carta-discipline restyle (desktop)

## Overview
Complete visual + structural redesign of the five logged-out pages of smbx.ai (Landing, About, Industries, Track Record, Research). Content is **verbatim** from the existing production site (`client/src/practice/*.tsx` in the SMBx repo); only the design system changed. Direction: carta.com's structure and discipline translated into smbx's own brand — serif display / grotesque body / mono labels, bone + ink neutrals, one green accent, hairline grids, selection-handle frames, dark full-bleed bands, and a restrained motion system.

## ⚠ Rules of engagement — read first
These files are **high-fidelity design references, not suggestions**. The intended workflow is *transcription, not interpretation*:

1. **The HTML is the spec.** Every color, size, weight, spacing, and easing is an explicit inline value in the `.dc.html` files. When implementing, **extract values from the source — never eyeball, never round, never "improve."** If the reference says `padding:26px 22px 60px`, the port says `26px 22px 60px`.
2. **No creative license.** Do not substitute fonts, adjust the palette, add border-radius, add shadows, re-space sections, reword copy, or reorganize sections. Deviations are bugs.
3. **Where the reference is silent** (mobile/tablet layout, report detail pages), **stop and ask** — do not invent. Desktop ≥1080px is fully specified; sub-1080 behavior beyond the included media-query guards is deliberately out of scope for this handoff.
4. **Port, don't paste.** Recreate in the repo's existing React + CSS environment (`client/src/practice/` patterns). The `.dc.html` files run in a design tool; their markup/styling transfers 1:1, their small runtime does not.
5. **Verify by diff, not by feel.** Acceptance = side-by-side screenshot of the reference file vs. the implementation at 1440px and 1920px with no visible differences (see checklist at the end).

Suggested standing instruction for the implementing agent's CLAUDE.md:
> "design_handoff_smbx_carta_restyle/ contains the binding visual spec. Recreate exactly; extract all values from the HTML source; never restyle, reinterpret, or 'modernize'; ask when the spec is silent."

## Fidelity
**High-fidelity.** Pixel-perfect: final palette, type, spacing, copy, and motion. Copy was ported word-for-word from production and then user-edited in places (About headline, stat trio, employer names) — **the HTML in this folder is the current source of truth for copy**, not the old TSX.

## Design tokens
Light surfaces
- Page ground `#FCFAF6` (bone) · panel/tint `#F3F0E9` (hover `#EFEBE1` / `#ECE8DC`) · card white `#FFFFFF`
- Ink (headlines, primary buttons) `#16181A` · body text `#4A4F54` · muted/labels `#7C8187` · placeholder `#8B9088`
- Hairlines `#E4DFD3` · chip borders `#D8D3C6`

Dark bands & footer
- Ground `#131512` · hairline/grid seams `#2A2E29` · label plate `#22261F`
- Text `#F4F5F1` · secondary `#D7DBD2` · muted `#ABB2AB` · legal `#8A9088` · dark outline-button border `#4A4F44`

Accent (Deal Green — identity & wayfinding, never a resting button fill)
- Green `#0A7A58` · hover-deep `#086348` · bright (rare) `#0FA97C` · mint (dark-surface accent) `#A8F0CE` · mint tint (light-surface wash) `#DFF5EC`
- Selection: `::selection { background:#DFF5EC; color:#16181A }`

Type (Google Fonts)
- Display: **Source Serif 4**, weight 550 (headlines) / 600 (card titles), letter-spacing −0.01…−0.015em, line-height 1.04–1.25
- UI/body: **Schibsted Grotesk** 400–700, body 15–20px, line-height 1.6–1.7
- Labels/chips/kickers: **IBM Plex Mono** 400–600, 10.5–13px, letter-spacing .05–.16em, UPPERCASE
- `font-variant-numeric: tabular-nums` on body

Geometry
- Content rail **1360px**, page gutter 32px
- Section padding `clamp(100px, 9–12vw, 150–200px)` (exact clamp per section in source); header→content gap `clamp(52px, ~5vw, 84px)`
- **Radius: 0 everywhere except buttons/inputs (9–12px)** — cards, chips, tags, images are square
- Corner handles: 8px (7px small) ink squares at −4px offsets on framed cards — the signature frame device
- Hairline grids: `gap:1px` + background `#E4DFD3` (light) / `#2A2E29` (dark) behind tiles
- Dot fields: `radial-gradient(rgba(...) 1.1–1.2px, transparent) / 14–17px`; green on light `rgba(10,122,88,.2)`, ink `rgba(22,24,26,.14-.16)`, mint on dark `rgba(168,240,206,.14-.2)`

Buttons — the law
- **Primary** = ink fill `#16181A` + bone text (on light) / bone fill `#FCFAF6` + ink text (on dark). Hover: green `#0A7A58` fill (light) / mint `#A8F0CE` fill (dark).
- **Secondary** = 1.5px outline (ink on light / `#4A4F44` on dark), transparent fill; hover `#F3F0E9` wash (light) / mint border+text (dark).
- **Green is never a resting button fill.** It appears as hover feedback, label chips, kickers (8px green square + mono text), links, active filter states.
- All pill CTAs and mono chips carry `white-space:nowrap`.
- Text links: green, `border-bottom:1(.5)px solid`, hover `#086348`.

## Motion system (exact)
- Easing everywhere: `cubic-bezier(.2,.7,.3,1)`
- **Hero entrance**: elements tagged `data-hs="n"` start `opacity:0; translateY(26px)`, reveal after 80ms via .85s transition, stagger n×130ms. (Use a timeout, not rAF-gating — rAF stalls in background tabs.)
- **Scroll reveal**: IntersectionObserver threshold .12 (.1 Industries); below-fold `[data-rv]` elements start `opacity:0; translateY(22px)`, reveal .7s. Elements already within 90% of viewport on load never hide.
- **Stagger**: `[data-rv][data-stagger]` reveals children individually, delay `min(i×70ms, 560ms)`.
- **Count-up**: `[data-count]` animates 0→target over 1300ms cubic ease-out on first reveal, preserving prefix/suffix ("$", "+", "~", "B+").
- **Marquee**: lane strip duplicated ×2, `translateX(0→−50%)` linear 46s infinite.
- **Parallax**: `[data-plx]` dot fields translate `(elementCenter − viewportCenter) × −factor` (factors ±0.02–0.04) on scroll, anchored to cached untransformed document position.
- **Nav**: sticky; below 24px scroll the bottom border is transparent, past it `#E4DFD3` + soft shadow `0 10px 30px rgba(22,24,26,.05)`.
- **Phase explorer (Landing)**: auto-advances every 5200ms; any click inside `#how` pauses auto-cycle permanently; clicking a rail tab selects it.

## Screens
Each page: sticky nav (76px, logo → links → outline CTA "Confidential consultation" + primary CTA "Build your market map") and the mega footer (dark; brand blurb + founder mini-card, FIRM links, BUYERS links, WHERE WE WORK, legal disclosure block, © row). Copy: see the HTML — it is the copy deck.

### 1. Landing (`Landing - Carta Style.dc.html`)
Sections in order: viewport-height hero (H1 clamp 48–92px + Acquisition Engine card: framed white card w/ corner handles, green ACQUISITION ENGINE chip, typing-caret prompt line, lane chips row) → lane marquee → dark proof band (4 stat tiles on 1px seams: 150+ / $5B+ / ~$21B / 0-in-mint) → Why us (6 expandable `<details>` evidence cards, dot-field headers, numbered green plates) → How it works (framed 2-col phase explorer: 7-tab rail grouped smbxCorpDev / Premium, auto-cycling detail pane) → Getting started (sample market-map artifact card: funnel row, dark "9" callout, 3-row criteria table, WHAT MOST BUYERS MISS panel, $6–8M figure, OUR READ) → dark Pricing band (email gate → sent state) → Who it's for (5-card hairline grid row) → Sectors (15-tile hairline grid, 3-col) → dark quote band ("The seller has a broker…") → Owners (3 think-columns + 22 trade chips) → Founder strip (portrait + quote plate) → CTA split (H2 + framed booking card) → footer.
Nav extra: "Who it's for" hover dropdown (560px panel: BUYERS link list + FREE VALUATION promo tile).
State: `phase` (0–6), `whoOpen`, `priceEmail/priceState`, paused flag.

### 2. About (`About - Carta Style.dc.html`)
Breadcrumb hero (SMBX / ABOUT, centered H1, smbx.ai intro ¶) → Why we built it (3 numbered columns, 2px ink top-rules w/ green tick) → dark What we believe band (4 convictions I–IV, mint numerals, corner-handled seam grid) → Firm leadership (400px portrait col w/ handles + FOUNDER chip; right: intro ¶, stat trio 150+ / $5B / $2B with green underscores + mono labels, two tenure rows "10 YEARS — Wrench Group / JPMorgan Chase", Deloitte ¶, italic attribution shield w/ green left rule) → CTA split → footer.

### 3. Industries (`Industries - Carta Style.dc.html`)
Centered hero + full-width framed image (FIFTEEN LANES chip) → 15 alternating zig-zag theses (7fr/4fr ↔ 4fr/7fr): number + hairline, serif H2, bold lead + green period, mint tag chips, 1–2 ¶s; aside: WHO WE RUN IT FOR / WHY THIS LANE (2px rules) + optional framed 4:3 image → Heritage panel (tinted, corner handles, framed image, attribution shield) → centered CTA → footer.
No images exist for: Elevator & escalator, Building automation, Energy-adjacent, Food co-packing — asides stay text-only. **Do not source substitute imagery.**

### 4. Track Record (`Track Record - Carta Style.dc.html`)
Centered hero (kicker, "More than 150 deals. One side of the table.", attribution shield) → stat strip (150+ & INTEGRATIONS / $5B+ EV / ~$21B / dark 0 tile) → Chapter 01 Wrench Group (380px intro col + framed register card: FOUNDING PLATFORMS (2016) / PLATFORM ADDITIONS / REGIONAL TUCK-INS / GREENFIELD green chips over name lists) → Chapter 02 JPMorgan Chase (same pattern) → Chapter 03 Deloitte (rule-topped row) → dark closer + booking CTA → footer.

### 5. Research (`Research - Carta Style.dc.html`)
Hero (PUBLISHED ASSESSMENTS kicker, H1, positioning ¶) → filter bar (INDUSTRY / METRO mono chip groups, active = green fill; combined empty state w/ SHOW EVERYTHING reset) → assessment cards (framed 1fr/380px: green kicker chip + date, serif title, abstract, ink "Read the assessment" + meta; right: cover art `contain` on dark dot-field panel w/ drop shadow) → dark CTA band → footer.
State: `industry`, `metro`. Report data lives in `shared/reports.ts` (registry) — render from it; the three current entries are hardcoded in the reference.

## Interactions & behavior (beyond motion spec)
- Evidence cards: native `<details>/<summary>`, no marker, tint hover.
- Pricing gate: naive `includes('@')` check → swap to sent state ("Sent — the pricing brochure is on its way to your inbox."). Wire to real capture in production.
- Booking links: `https://calendar.app.google/rA9vC7RRdR2wLJbV6` (new tab).
- Cross-page links: nav/footer link the five pages + landing anchors (`#why #how #sample #pricing #who #owners #yulia #cta #disclosures`); `aria-current="page"` green underline state on Industries/Research nav items.
- Placeholders to wire later: "Take this with you — the smbxCorpDev offering (PDF)" (`#`, asset TBD); research "Read the assessment" → report pages (out of scope here).

## Assets (all under `client/public/`, paths preserved from the repo)
- `logo-green-x.png` (nav, light), `logo-green-x-dark.png` (footer), `logo-x-green.png` (engine-card mark)
- `founder-portrait.jpg` — large crops use `object-position:50% 0%` (top-anchored; do not re-crop mid-face)
- `industries/*.jpg` — 17 trade images (hero + square aside images; exact mapping in Industries source)
- `reports/*-cover.jpg` — 3 report covers (render `contain`, never crop)
- Brand text: always **smbx.ai** lowercase with green `x`; product mark **smbxCorpDev**; mono kickers may be all-caps.

## Files in this bundle
- `Landing - Carta Style.dc.html`, `About - Carta Style.dc.html`, `Industries - Carta Style.dc.html`, `Track Record - Carta Style.dc.html`, `Research - Carta Style.dc.html` — the binding references (open directly in a browser; `support.js` is their preview runtime — reference only, do not port)
- `client/public/…` — all imagery/logos above

## Acceptance checklist
- [ ] Side-by-side at 1440px & 1920px: no visible diff vs. reference (layout, type, spacing, color)
- [ ] All copy character-identical (incl. smbx.ai/smbxCorpDev casing, em-dashes, attribution shields naming Wrench Group + JPMorgan Chase)
- [ ] Button law holds everywhere; no green resting fills; hovers per spec
- [ ] Motion: hero cascade, scroll reveals + staggers, count-ups, marquee, parallax, nav hairline, phase auto-cycle w/ pause-on-click
- [ ] Interactive: who-dropdown, details cards, pricing gate, research filters + empty state, cross-page nav
- [ ] Zero corner radius outside buttons/inputs; corner handles present on framed cards; images uncropped per spec
- [ ] No console errors; fonts loaded (Source Serif 4, Schibsted Grotesk, IBM Plex Mono)
