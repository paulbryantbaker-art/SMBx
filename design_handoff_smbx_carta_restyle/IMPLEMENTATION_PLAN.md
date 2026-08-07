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

---

## BUILD RECORD (2026-08-07, same day)

**Status: BUILT — all five pages transcribed 1:1 and live on the branch.** Paul's
correction mid-build set the method: *"this is not what Claude Design shipped.. it
shipped a new design for the existing content"* — so the pages were rebuilt from the
reference markup outright, not evolved from the Aurora components.

What shipped:

- **`carta.css`** — only what inline styles cannot express: the three keyframes
  (marquee/orbit/caret), the hover vocabulary (one `.ca-h-*` class per distinct
  `style-hover` in the handoff, `!important` because the transcribed markup styles
  inline), the responsive guards from all five references, and the `.ca-engine` scope
  that redresses the REAL intake as the Acquisition Engine card.
- **`PracticeShell.tsx`** — the shared chrome, transcribed: sticky 76px nav
  (hairline+shadow past 24px, never hides — the Aurora hide-on-scroll retired with
  Aurora), Who-it's-for hover dropdown (buyer names → their real `/buyers/*` pages,
  per the 2026-08-02 five-labels-one-destination lesson), dark mega footer. Kept
  load-bearing machinery: settleToAnchor, scroll-release, `data-rv` reveal, mobile
  burger menu (the bundle ships no mobile; a phone without nav is a regression, not a
  transcription), plus the shared `data-hs` cascade and `data-plx` parallax.
- **`Landing.tsx`** — full transcription with real machinery mounted: YuliaIntake in
  the framed hero card (its resting state now renders the reference card interior —
  header chip + logo, the opening line as a set paragraph, ink-border input, square ↑
  send, mono step label, uppercase chips), PricingRequest on the dark band
  (`POST /api/practice/pricing`, honest-send), owners chips dispatching
  `smbx:open-owner`, lanes/chips from the one register (`lanes.ts` — the reference's
  lists match it verbatim), phase explorer with 5.2s auto-cycle, proof-band count-up.
- **`About.tsx` · `Industries.tsx` · `ReportsIndex.tsx` · `TrackRecord.tsx`** — each
  transcribed; Research reads `REPORT_LIST` (real read-times on the meta line, real
  covers, cards → `/research/:slug`), Track Record ports the CLEARED SET verbatim.
- **Fonts:** Source Serif 4 variable added to the index.html payload (weight 550 via
  the axis). `--pd-font`/`--pd-display` moved to Schibsted/Source Serif 4, so legacy
  inner surfaces (segments, report pages) inherit the Carta voice.

Verified: `npm run test:design` 77/77 · tsc clean · production build green · every
page rendered at 1440px and inspected strip-by-strip (intake resting card, marquee,
proof band, phase explorer, sample read, pricing band, who/sectors grids, owners,
founder, CTA, mega footer; sector illustrations frame correctly on /industries; the
CLEARED SET renders under its attribution shield).

Two screenshot artifacts documented so nobody chases them: lazy images below the fold
don't load in a no-scroll full-page capture, and `data-rv` content photographs blank
if the capture script scrolls with `scroll-behavior:smooth`. Neither is a page defect.

Deferred (unchanged): mobile layer, collateral renderer pass (phase 2), report detail
pages and `/buyers/*` segment pages keep their current bodies under the new chrome.

---

## FIDELITY AUDIT (2026-08-07, adversarial verification run — Paul: "to-the-letter")

An 11-agent workflow audited every built surface against its reference (one auditor
per page + one for the shell/system, each finding then re-read by a skeptic before it
counted). About came back CLEAN; 27 findings survived verification elsewhere, all now
fixed or dispositioned:

**Fixed:**
- Landing: card-02 apostrophes back to the reference's straight quotes; featured
  chips render sentence case (the uppercase was a CSS transform — the reference
  uppercases only the two tail chips, now literal); the blinking green ghost caret
  restored (an overlay span, since a native placeholder can't carry a child; the fake
  caret yields on focus); the CONTINUE→chips gap corrected to 18px; `id="yulia"`
  moved onto the hero section (one anchor, one owner); the owners chip row reveals
  un-staggered; the send square renders the reference's 18px ↑ text glyph.
- Shell: the current page's nav link wears the reference's active state (green, 2px
  underline, aria-current); the Who-it's-for dropdown is landing-only (inner
  references show a plain link, no caret); #cta resolves to the page's OWN CTA on
  About and Research; the footer now varies per page exactly as the references do —
  Industries/Research compact (short blurb, no BUYERS column, six-link FIRM),
  Track Record omits its self-link, and Research/Track Record carry the #2A2E29
  seam above the footer; small corner handles moved to −4px (the references never
  use −3.5; `CARTA_HANDLE.offsetSmall` corrected).
- Industries: the Heritage kicker matched literally (a 12px/.15em one-off in the
  reference).
- Research: the shelf sort is stable on the August-2026 tie (order now matches the
  reference: Home Services → DFW → Commercial MEP); inactive facet chips lost their
  invented hover; card titles are plain text (the CTA is the card's one doorway).
- **/track-record's meta description carried the RETIRED employer anonymization** —
  now names Wrench Group and JPMorgan Chase per the 2026-08-07 attribution law
  (149 chars, inside the truncation cap).

**Dispositioned, not changed (documented judgment):**
- Landing sector tiles + "Read the full sector theses →" go to /industries (the
  reference's #sectors self-anchor is a no-op stand-in; the theses live there).
- The Research facet band keeps the ≥2-values rule ("a filter with one option is
  furniture" — established house doctrine; output identical with today's register).
- Page <title>s keep the 2026-08-01 SEO set rather than the prototype's short
  helmet titles — titles are content, not design, and the SEO pass was deliberate.

**Found outside the audit's scope, flagged for a later pass:**
`server/services/postcardFiller.ts` still INSTRUCTS employer anonymization in its
prompt — it will generate non-compliant copy under the reversed attribution law.

---

## CONSISTENCY AUDIT + 1–4 CONVERSION (2026-08-07, "fix ALL of the small things… NO INCONSISTENCIES")

A 12-agent adversarial pass over every visitor-reachable surface (segments,
report surface + subcomponents, legal/shell seams, map page-vs-PDF parity,
the owner flow, and a cross-site sweep) confirmed ~45 distinct issues after
dedup; all fixed except the content items listed for Paul below.

**The systemic fixes:**
- **One stat strip everywhere.** The sanctioned labels (ACQUISITIONS &
  INTEGRATIONS · ENTERPRISE VALUE ADDED · TRANSACTIONS TOUCHED · SELL-SIDE
  ENGAGEMENTS. EVER.) now render identically on the landing proof band,
  /track-record, and every segment page — the landing's "ACQUISITIONS
  CLOSED" (an attribution-law violation the handoff shipped) and About's
  bare "$5B" are gone.
- **Keyboard focus survives dark surfaces.** Every dark band and the footer
  carry .ca-dark; the focus ring flips to bone there (it was ink-on-black,
  1.02:1 — invisible on ~20 footer links per page).
- **The button law, fully enforced.** The report resume action and Contents
  FAB, the owner flow's delete button and Google gate, and the mobile-menu
  CTA all rest ink/bone now; the owner end-card lost its brass keyline and
  radius; OwnerChat's send is the same ↑ square as the buyer engine.
- **#cta resolves correctly on every route.** The Research index recovered
  the reference's id="cta"; report pages keep readers on their own closing
  band; the mobile menu agrees with the desktop nav on label, order, and
  destination.
- **The 761–1024px double-chrome bug** (desktop links AND burger both
  visible) is gone — the burger now wakes exactly where the links hide.
- **Map parity:** page and PDF agree on the answer rail, funnel treatment,
  and kicker voice; the live map wears the corner handles its own
  advertisement carries; reduced-motion now stills the orbit and map rises.
- **Dead code that invited regressions deleted:** PageCrumb + .pd-crumb, the
  orphaned sample-read map classes, the pre-Carta owners-section rules, the
  .rp-cta trio, stale "brass" comments.
- Legal pages joined pageMeta (own tab titles); Terms' contact line points
  at hello@smbx.ai instead of a footer contact that doesn't exist;
  breadcrumbs hover site-wide; report masthead spacing, kicker size, "By
  the numbers" grammar, placeholder tokens, and the error treatment unified.

**FOR PAUL — content calls the audit surfaced that are not mine to make:**
1. ~~Lane registers disagree~~ — RESOLVED 2026-08-07 by Paul: "Landscape
   and hardscape are ok" (the lane stands on the board without an
   /industries block, deliberately — do not re-flag the asymmetry) and
   "Add MEP" (Commercial mechanical, HVAC & plumbing joined HUNT_LANES,
   thesis line verbatim from the /industries block's desk line, seated
   after Home services to mirror the /industries adjacency). The board is
   now sixteen lanes; the hero's "ALL n LANES" chip derives.
2. ~~About "10 YEARS" vs Track Record "2016–2025 · over nine years"~~ —
   RESOLVED 2026-08-07: Paul updated the handoff himself and directed "use
   what is in the handoff". Both pages verified character-exact against his
   upload (About: 10 YEARS ×2; Track Record: 2016–2025 / 2005–2015 /
   2010–2011, "Over nine years… 36 acquisitions… $2.9B"). The figures stand
   as he wrote them.
3. ~~"The operator who closed the 150"~~ — RESOLVED 2026-08-07 by Paul:
   "150 is ok". The phrase is SANCTIONED verbatim on the Why-us card (a
   comment above the copy in Landing.tsx records it) — future audits must
   not re-flag or soften it.
4. ~~Privacy page product-era copy~~ — RESOLVED 2026-08-07: Paul's "How is
   there still copy from the old product pages" authorized the rewrite.
   Privacy.tsx now describes the practice site's actual mechanics (engine +
   owner valuation, Google sign-in name/email, reader cookie, removal
   rights), aligned with the Terms data story; Last-updated bumped to
   August 7, 2026. No public surface speaks product-era language any more.
5. `server/services/postcardFiller.ts` still instructs employer
   anonymization (flagged previously, still open).
