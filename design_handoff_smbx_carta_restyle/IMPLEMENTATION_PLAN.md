# Carta-restyle handoff — Implementation Plan

**Status:** APPROVED TO BUILD — all six questions answered 2026-08-07 (recorded inline).

**Source of truth:** this folder. The README's rules of engagement are accepted verbatim —
**transcription, not interpretation**; values extracted from the HTML, never eyeballed;
where the spec is silent we stop and ask (§6). The `.dc.html` copy supersedes the TSX.

**Target:** `client/src/practice/` — the five logged-out pages. **Scope call (Paul,
2026-08-07):** the public site lands first and ships as one piece; the collateral
renderers follow in a second pass.

---

## 1. What arrived

Five high-fidelity desktop pages (Landing 84KB, About, Industries, Track Record,
Research), a 114-line README that is itself a spec, `support.js` (preview runtime —
reference only, not ported), and the repo's own image assets copied at their live paths.

**Headline finding — this is a REBUILD, not a re-skin, and the honest comparison is to
the 2026-07-16 v3 landing, which was cheap for the opposite reason.** v3's stylesheet was
a strict superset of the live one, so it dropped in. This bundle shares almost nothing
with Aurora at the value level:

| | Live (Aurora) | This handoff |
|---|---|---|
| Display face | Fraunces | **Source Serif 4** (550/600) |
| Working face | Inter | **Schibsted Grotesk** (returning; it was the pre-Ledger face) |
| Dark surface | jade `#0A6A4C` over a texture, curved mask edges | **flat near-black `#131512`**, square edges, no texture |
| Accent use | Deal Green as CTA fill | **green is NEVER a resting button fill** — primary is ink; green is hover, chips, links |
| Corners | pills (99px) + 16–24px cards | **radius 0 everywhere** except buttons/inputs (9–12px) |
| Signature device | curved band crests, ambient blooms | **corner handles** (8px ink squares at −4px), hairline grids, dot fields |
| Section rhythm | clamp(130,15vw,220) | clamp(100, 9–12vw, 150–200), exact per section |

Two of Paul's own recent laws are reversed by the design, and both are *his* to reverse:
**pills → squared buttons** (his 2026-07-18 "no squared buttons" law) and **mono eyebrow
labels return** as the kicker device (the 2026-06-01 no-eyebrows law — already amended
once today for exactly this). Neither is flagged as a question; the commissioned design
is the newer instruction. They are recorded here so the diff is not read as drift.

**What survives untouched, and it is a lot:** the section ORDER is nearly identical to
the sales-journey reflow shipped this morning — hero → dark proof → why → how → sample →
**dark pricing band** → who → sectors → dark quote band → owners → founder → CTA. Three
dark bands at the same three points in the scroll. Today's reflow guessed the same
skeleton this design specifies, which makes the port structural rather than
architectural. **All nine live anchors exist in the design** (`#proof #why #how #sample
#pricing #who #sectors #owners #cta`, plus `#top #yulia #disclosures`) — no emailed link
dies.

---

## 2. Page by page

### 2.1 Landing
Hero (viewport-height, H1 clamp 48–92, Acquisition Engine as a framed white card with
corner handles + green ACQUISITION ENGINE chip + caret prompt + lane chips) → **lane
marquee (new)** → dark proof band, 4 stat tiles on 1px seams → Why us, 6 `<details>`
evidence cards with dot-field headers and numbered green plates → **How it works becomes
a framed 2-column PHASE EXPLORER (new interaction)**: a 7-tab rail grouped
smbxCorpDev / Premium, auto-advancing every 5200ms, permanently paused by any click
inside `#how` → Getting started (the sample market-map artifact, its own section again) →
dark pricing band with the email gate → Who it's for as a 5-card hairline grid (replaces
the giant-names index) → Sectors as a 15-tile hairline grid → dark quote band → Owners
(3 think-columns + trade chips) → founder strip → CTA split → mega footer.

Nav gains a **"Who it's for" hover dropdown** (560px panel: buyer list + a FREE VALUATION
promo tile).

### 2.2 About
Breadcrumb hero → Why we built it (3 numbered columns, 2px ink top-rules with a green
tick) → dark "What we believe" band (4 convictions I–IV, mint numerals) → Firm leadership
(400px portrait with handles + FOUNDER chip; stat trio; two tenure rows; Deloitte ¶;
italic attribution shield with a green left rule) → CTA → footer.

### 2.3 Industries
Centered hero + full-width framed image → **15** alternating zig-zag theses (7fr/4fr ↔
4fr/7fr) with mint tag chips and WHO WE RUN IT FOR / WHY THIS LANE asides → Heritage panel
(tinted, framed image, attribution shield) → CTA → footer.
Live `lanes.ts` currently carries **16**; the delta is reconciled at build time against
the HTML, which is the copy source of truth. Four lanes have no image and stay text-only —
**the README forbids sourcing substitutes, and that stands** (photography law agrees).

### 2.4 Track Record
Centered hero → stat strip (4 tiles, the last dark) → Chapter 01 / 02 / 03 register cards
with green category chips over name lists → dark closer + booking CTA → footer.

### 2.5 Research
Hero → **filter bar (new): INDUSTRY / METRO mono chip groups, active = green fill, with a
combined empty state and SHOW EVERYTHING reset** → assessment cards (1fr/380px framed,
cover art `contain` on a dark dot-field panel) → dark CTA band → footer.
Renders from `shared/reports.ts`, not the reference's three hardcoded entries.

---

## 3. What must survive (the preservation contract applies)

`UI_RETOOL_READINESS.md` §3 was rewritten 2026-08-07 for this job; it governs. The
items this particular design puts at risk:

- **The intake engine is real machinery.** The design specifies its RESTING state (a
  framed card with a caret prompt). Everything behind it ports unchanged: SSE streaming
  of the 8-block market map, the map PDF, lead capture + the ENGAGED_LANES conflict
  check, `smbx_intake_v1` transcript survival, owner mode swapping the fold's voice, the
  `smbx:open-owner` / `smbx:open-intake` events. **Note:** the caret prompt reads as the
  self-typing ghost that v3 deliberately retired — porting it as a static caret (visual
  only, no typing animation) honours both.
- **Pricing stays the email-gated ask.** The design gets this right (dark band, email →
  sent state) — wire it to `POST /api/practice/pricing`, and no figure appears.
- **No logo wall, no testimonials** — the design correctly ships neither. Do not add.
- **The attribution shield travels with the deal names** on every page that carries them.
- **Anchors, `trackEvent` placements, the two-surface rule, the Safari fixed-div rule,
  the 13px floor.**

---

## 4. System drift — what moves together

`house/tokens.ts` → `practice.css` + `report.css` + `content/studio/DESIGN.md` +
`DESIGN_LANGUAGE.md` are gated as one unit by `npm run test:design` (76 cases). This
lands in one commit:

- New token set per the README's palette (bone `#FCFAF6` survives; ink `#16181A`
  survives; **jade `#0A6A4C` and honey `#F5C452` retire**, replaced by dark `#131512`
  and mint `#A8F0CE`).
- The retired Aurora hexes join the dead-systems table — that table is the antidote that
  stops a future session reproducing them from familiarity.
- **Fonts:** the site loads Source Serif 4 + Schibsted Grotesk from Google Fonts (fine in
  a browser). The **collateral pass will need `@fontsource` packages** for both — the PDF
  renderers must never depend on the Google CDN (Railway blocks it; the Docker image has
  only Noto). Flagged now so phase 2 isn't a surprise.
- `report.css` (`.rp-*`) holds PARITY WITH THE PDF, not with the site. It moves in the
  collateral pass, not this one — see Q4.

---

## 5. Questions for Paul

**Q1 — EMPLOYER NAMES. Blocking; no default.**
The design names **Wrench Group** and **JPMorgan Chase** in six places across About,
Industries and Track Record. The standing law (CLAUDE.md, 2026-07-18, your words: *"to
keep from getting into trouble… who knows the climate these days"*) says employers are
NEVER named on public surfaces — "a global investment bank", "a world-class PE-backed
aggregator", with Deloitte allowed. The README says copy was "user-edited in places
(…employer names)", which reads as you re-naming them deliberately during the design
session.
**ANSWERED (Paul, 2026-08-07): "Lets name — i have hidden any deals or other information
that is basically not on my resume."** Employers are NAMED; the 2026-07-18 anonymization
is retired (CLAUDE.md updated in the same commit so no future session reverses it).
**The reasoning sets the boundary and must be carried:** what appears publicly is what is
already on Paul's résumé, and he curated this bundle's copy himself to that standard.
**Therefore the handoff's name lists are the CLEARED SET — port them verbatim and never
merge in names from the older `TrackRecord.tsx`** (which carries additional deal names
that did not pass his filter). The other five attribution rules are untouched: led or
co-led · "selected transactions" (the design's register header already says it) · the
shield wherever names appear · names not logos · never "our clients" · JPMorgan is
integration, not origination.

**Q2 — "150+" and the $2B stat.**
The design writes **150+** (About, Landing, Track Record); the law says the total is
stated as **150**, no plus. The About stat trio also introduces **"$2B — SYNERGIES
CAPTURED"**, which is not in the sanctioned set (150 · $5B+ · ~$21B · 0 sell-side).
Zero-hallucination law: every public number is real and defensible or it does not ship.
**Confirm $2B is a figure you stand behind, and whether "+" returns.**
**ANSWERED (Paul, 2026-08-07): "all good here."** The design's copy stands — `150+`
returns and `$2B — SYNERGIES CAPTURED` joins the sanctioned stat set. The no-plus rule
in CLAUDE.md is superseded for the public site, and the sanctioned set becomes
150+ · $5B+ · ~$21B · $2B · 0. Both laws get updated in the tokens+shell commit so a
future session does not "correct" this back.

**Q3 — MOBILE. The biggest gap.**
The handoff is desktop-only and says so. Its four media queries only shrink the nav and
stack three grids — **at 840px the nav links `display:none` with nothing replacing them.**
On a phone the new site would have a logo, two CTAs and no navigation. Your standing law
is mobile-first, and your research traffic is mostly phones.
**ANSWERED (Paul, 2026-08-07): "no mobile yet."** Desktop ships first. The existing
mobile CSS is NOT deleted in the meantime — the live phone layout keeps working against
whatever survives, and the phone-specific machinery (intake bottom sheet, iOS scroll
lock, `--pd-kb` keyboard lift) is preserved intact for the mobile pass rather than being
torn out and rebuilt later. **Known consequence, stated plainly: between this ship and
the mobile pass, the phone experience will be a desktop layout squeezed down — and at
≤840px it has no nav links at all.** If that is not acceptable at ship time, the minimum
patch is a hamburger returning the existing mobile menu.

**Q4 — The report DETAIL pages (`/research/:slug`).**
Out of scope in the handoff. The Research INDEX gets the new language; the reports
themselves keep the current `.rp-*` document design, which holds parity with the PDF.
**Sharpened (2026-08-07) — also NOT legacy, and the newest surface on the site:**
`/research/:slug` is where a published assessment is actually READ (three live today:
commercial-mep, home-services, dfw-home-services). Research is in the top nav; the PDF
delivery flows through these pages. The handoff designs the research INDEX (the card
list) but not the reading page behind "Read the assessment".
*Default: leave them, and fold them into the collateral pass — `.rp-*` holds parity with
the PDF, so the page and the PDF must move together or they drift.*

**Q5 — The five segment pages (`/buyers/*`).**
Not in the bundle, and the new design links nothing to them (the "Who it's for" cards are
a hairline grid, not links to the five pages). They stay routed and reachable by direct
URL but would still be wearing Aurora.
**Sharpened after Paul asked what these are (2026-08-07) — they are NOT legacy:**
all five are live, routed, fully built (`/buyers/family-offices`, `-independent-sponsors`,
`-searchers`, `-operators`, `-pe-firms`), each carrying a tailored engagement walkthrough
and deliverables grid. **The LIVE landing links to them right now** — the Who-it's-for
rows are real links, fixed on 2026-08-02 after Paul's "These links don't go anywhere."
The new design's Who cards link only to `#cta` and `#sectors`, so **shipping the design
verbatim orphans five live pages and undoes that fix.**
*Default: wire the new Who cards to the five pages — a one-line deviation that keeps the
design's layout exactly and preserves the destinations. Say the word if you would rather
retire those pages instead.*

**Q6 — Getting started as its own section.**
This morning you asked for it to be *part of* How it Works, and I folded it in. The
design puts it back as its own section (`#sample`) directly after `#how`.
*Default: follow the design — it keeps the adjacency you wanted, and the phase explorer
is now a framed interactive block that a nested sub-section would fight.*

---

## 6. Where the spec is silent (per the README, we stop and ask)

Recorded, not guessed: sub-1080 layout (Q3) · report detail pages (Q4) · segment pages
(Q5) · the offering-PDF link target (`#` placeholder — we already have
`/collateral/smbx-corpdev-offering.pdf`) · error/empty states for the intake beyond the
resting card · the owner chat's full conversational surface (the design shows the trade
picker only) · print styles.

---

## 7. Build sequence

1. **Tokens + shell first** — `house/tokens.ts`, `practice.css` rewritten to the new
   system, `PracticeShell` (nav with dropdown + mega footer), the design gate updated in
   the same commit. Nothing renders correctly until this lands; everything after is a
   page.
2. **Landing** — the largest page and the one carrying the new interactions (phase
   explorer, marquee, parallax, count-ups). The intake card is re-skinned around the
   existing `YuliaIntake` component, not rebuilt.
3. **Industries · Track Record · About · Research** — mostly static; fast after 1.
4. **Motion pass** — the exact system in the README §Motion (one shared easing, the
   `data-hs` hero cascade with a timeout not rAF, `data-rv` observers, stagger, count-up,
   marquee, parallax, nav hairline).
5. **Mobile layer** (Q3).
6. **Full preview** — every page, both viewports, before anything ships.

**Acceptance** is the README's checklist, plus: `npm run test:design` green, no dead
anchors, intake mechanics verified live (send a map, capture a lead), and the
preservation contract walked item by item.
