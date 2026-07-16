# Practice Site v3 — Claude Design Handoff: Implementation Plan

**Status:** PLAN — approved-for-build pending Paul's answers to the five open questions (§5; each has a default, so silence = defaults).
**Source of truth:** this folder (`practiceSite/`) — `LandingPage.dc.html`, `SectorsPage.dc.html`, `assets/pd.css`, `README.md` (handoff notes). Copy in the HTML is **final and approved — do not rewrite**.
**Target:** `client/src/practice/` (the live `.pd` coral site). Prototype runtime (`x-dc`, `sc-for`, `{{ }}`) is ignored per the handoff — we recreate in React/wouter.

---

## 1. What arrived, and the headline finding

Two high-fidelity pages: a reflowed **Landing** and a brand-new **Industries (sectors) page** with 12 sector theses + a Heritage block. Design language is the same coral system — because the Claude Design project was seeded from our production stylesheet, and **the new `pd.css` is a strict superset of the live `practice.css`**: every class the live site uses still exists; the rule-level diff is ~205 lines. This makes the port dramatically cheaper than a redesign:

> **The stylesheet can land as a near-drop-in replacement, and every surviving inner page (segments, track record, about) keeps its styling automatically.**

Also shipped in the copy: the **real booking link** — `https://calendar.app.google/rA9vC7RRdR2wLJbV6` — which resolves the long-standing "`VITE_BOOKING_URL` awaiting the scheduling link" TODO.

## 2. What changes vs the live site

### 2.1 Landing information architecture

| New order | Section | vs live |
|---|---|---|
| 1 | Sticky nav (links: **Why us · How it works · Industries · Who it's for**) | "Track record" leaves the nav; Industries now routes to the new page |
| 2 | Hero — statement + **chat engine** (`.pd-hero-fold`: fills viewport minus nav minus curve so the dark band's crest peeks at the fold; new `.pd-heromesh` dot-matrix bloom) | H1 back up to clamp(42–68) (reverses the calm-fold shrink); same engine mechanics |
| 3 | **Dark proof band** `#proof` — TWO DECADES ON THE BUY SIDE; 150+ · $5B+ · **~$21B (new stat)** · 0 (coral `#FF8298`); count-up on enter | Replaces the hero proof row AND the employer track-record band |
| 4 | **Why us** `#why` — 3×2 hairline grid of six `<details>` evidence cards (01–06) | New section; retires the problem ledger |
| 5 | **How it works** `#how` — vertical 7-phase `<details>` accordion (Thesis → Value creation·add-on) | Replaces the per-customer-type pill-tab HowItWorks |
| 6 | **Sample read** `#sample` — static 760px `.pd-map` with the NEW blocks: `map-flow` (funnel with arrows) → `map-nine` (giant coral 9) → `map-screens` (3 numbered screens) → `map-insight` → `map-number` (near-black $6–8M block) → `map-verdict` | Replaces the showcase sample tab; the engine⇄sample toggle state dies |
| 7 | **Who it's for** `#who` — interactive index: 5 giant names left, sticky panel right (click swaps body + "Talk to us…" link → `#cta`); mobile shows names only | Reworks WhoSelector; segment links now go to `#cta`, not `/buyers/*` |
| 8 | **Key industry verticals** `#sectors` — 12 two-column hairline rows (index numbers removed) → `/industries` | Same hunt-board bones, new 12-sector list, links off-page |
| 9 | Dark **Whose side** band (pull-quote + two pills) | Kept, same shape |
| 10 | **CTA** `#cta` — H2 + gray booking card ("Book 30 minutes", mono meta, **Pick a time →** to Google Calendar, new tab). **No form fields.** | Retires the `#book` lead form |
| 11 | **Footer — flat warm charcoal `#2B2A27`** (var remaps to white text, logo inverted via filter) | Was light; deliberately NOT a textured bleed band |
| — | Sticky CTA pill after 0.9 viewport heights | Threshold change (was 1.1) |

Retired landing components: problem ledger, EngagementShow (left-nav engagement showcase), per-type HowItWorks pill-tabs, 180-value dark band, landing track-record band, hero proof row, showcase sample tab, self-typing ghost placeholder (the new bar has a **static** placeholder: `Sector & Strategy — "HVAC roll-up in the Southeast"`).

New chip set (5): Fire & life safety · Elevator service · NDT & inspection · Environmental services · MRO distribution.

### 2.2 New Industries page (`/industries`)

Hero (seclabel + H2 + retainer/success-fee lede) → **12 `.pd-sector` blocks** (1.5px ink top rule, big name, zig-zag 7/5 split alternating; left "know" column with coral-full-stop lead + body + optional tag pills; right aside = coral-rule "Who we run it for" + near-black "Why this lane" desk card) → **Heritage block** (`.pd-sector.her`: gray card, no rule, first-person Wrench-era copy, **attribution line** "Selected transactions led or co-led in the course of employment at Wrench Group and JPMorgan Chase.") → centered CTA section → footer (shortened FIRM column).

Sector order: Fire & life safety · Elevator & escalator · Power & grid infrastructure · Building automation & critical power · TIC/NDT · Environmental & industrial cleaning · Water & wastewater O&M · Specialty & MRO distribution · Machine shops & precision mfg · Food co-packing · NEMT · RCM & medical billing.

**Copy guardrail (from the handoff, keep enforced):** no directional market numbers on these pages — only named regulations (NFPA 25/72, RCRA, AS9100, ISO 13485).

### 2.3 Token / rule drift (the full list — everything else is identical)

- **Two-width law (new hard rule):** `--pd-max: 1360px` (was 1440) for section rails; **new `--pd-mid: 1040px`** for every centered artifact (showcase, accordion, cards). No other section widths.
- Section rhythm up: `.pd-section` top pad `clamp(130,15vw,220)`; `.pd-dark-pad` and footer margin up in step.
- `.pd-h2`: max-width 18em→**24em**, `text-wrap: balance`→**pretty**; `.pd-sechead` loses its own measure cap.
- Hero H1: `clamp(42px,5.2vw,68px)` lh 1.04.
- Chat: input row is now **pill-radius (999px) matching the herobar** ("the bar becomes the card's input row"); new `.pd-chat.enter` rise-in with staggered first message rows (reduced-motion killed).
- Map artifact: `map-pdf` button flips from ink-outline to **solid coral CTA**; five new `.map-*` blocks (flow/nine/screens+scr/number/verdict).
- Hunt rows: index-number column deleted (2-col grid).
- New components: `.pd-heromesh`, `.pd-whygrid`/`.pd-why`(+`-close`), `.pd-phases`/`.pd-phase`(+`-close`), `.pd-sector`(+`.her`), `.pd-hero-fold`.
- Dark band: accent stat color `#FF8298`; `.pd-samplelink` recolors to body gray.
- Footer: charcoal `#2B2A27` + var remaps + `img { filter: brightness(0) invert(1) }`.
- **Port fix:** texture URL must stay `/textures/blackbleed.webp` (prototype uses a relative `../assets/` path).

Both fonts already load globally in `client/index.html` (Schibsted 400–800, IBM Plex Mono 400–600) — no font work.

## 3. Preservation contract (must survive the port, verbatim)

1. **The real Acquisition Engine** — the prototype chat is a scripted 2-step demo; production keeps `YuliaIntake.tsx` wholesale: `/api/practice/intake` + `/intake/stream` SSE, the streamed 8-block MARKET MAP artifact + `/api/practice/map-pdf`, lead persistence + ENGAGED_LANES close, `sessionStorage` session survival, and the entire mobile bottom-sheet stack (readOnly doorway bar → fixed sheet, drag-to-dismiss, iOS scroll lock, `--pd-kb` keyboard lift, ghost-click trap, `smbx:open-intake`). We adopt the new *visuals* (chips, static placeholder, `.enter` animation, pill input row) onto the existing logic. The sample-tab toggle dies, which *simplifies* the engine (no more unmount/remount path).
2. **Lead capture** — `/api/practice/leads` stays (the engine posts it); only the `#book` form section retires.
3. **Analytics** — keep `trackEvent` instrumentation; re-point placements (nav, sticky, whose-side, CTA card) and add `practice_sector_clicked` on hunt rows.
4. **THE LINE + copy law** — the new copy is Paul-approved and stays verbatim; disclosure paragraph unchanged; no fee talk beyond the sanctioned "retainer plus success fee, paid by the acquirer" line on the sectors hero.
5. **Attribution doctrine** — deal-name content now lives only in the Heritage block, which carries the shield sentence. `/track-record` page keeps its own enforcement as-is.
6. **Safari toolbar rule** — ambient wash stays `position:absolute` in the isolated `.pd` root; nothing fixed + colored (the mobile chat sheet remains the sanctioned transform-parked exception).
7. **Scroll-reveal upgrade, not regression** — port the prototype's improved `_rvScan` (MutationObserver re-scan + immediate reveal for elements already above the viewport) into PracticeShell; keep reduced-motion kill.

## 4. Sanctioned deviations from pixel-parity (deliberate, small)

- **Texture path** `/textures/blackbleed.webp` (served asset), not the bundle-relative path.
- **Real engine** in the hero instead of the scripted demo (per handoff intent — the demo illustrates states we already have for real).
- **Sticky CTA** keeps our retire-while-`#yulia`/`#cta`-visible behavior on top of the new 0.9-viewport threshold (strictly better; prototype simply never hides it).
- **Footer legal row**: Terms/Privacy/Disclosures stay real links (prototype renders them as plain text), and — pending Q3 — a quiet "Sign in" link stays for the team.
- **Subpage chrome**: surviving inner pages keep `PageCrumb` and their current heroes until their own redesign pass.

## 5. Open questions for Paul (defaults apply if unanswered)

| # | Question | Default |
|---|---|---|
| 1 | **/buyers/* segment pages** — the new design routes all "Who it's for" interest to `#cta` and the footer BUYERS column to `#who`. Keep the five segment pages **routed but unlinked** (direct URLs still work), or unroute them? | Keep routed, unlinked |
| 2 | **/track-record and /about** — both leave nav/footer in the new design ("Track record" now anchors to the `#proof` band). Same treatment? | Keep routed, unlinked |
| 3 | **Team sign-in link** — the prototype footer has none. Keep a quiet "Sign in" in the footer legal row? | Keep it |
| 4 | **~$21B "Transactions touched"** — new public stat in the proof band. Confirm it's blessed (zero-hallucination law: your number, your call). | Assume blessed (it's in your approved copy) |
| 5 | **Sub-13px mono labels** — `.pd-phase .ph` (12px) and `.pd-why .more` (12.5px) sit below the 13px floor from the 2026-07-13 readability law. Keep the approved design values, or bump both to 13px? | Keep design values (pixel-parity wins; they're uppercase mono accents, not reading text) |

## 6. Build plan (one atomic PR — the CSS swap and the pages that wear it must land together)

**Step 1 — Stylesheet swap.** Replace `client/src/practice/practice.css` with `practiceSite/assets/pd.css` + the texture-path fix. Sanity-scan every `client/src/practice/*.tsx` for classes (already verified: new CSS is a superset — zero missing).

**Step 2 — Landing rebuild** (`Landing.tsx`). New section order per §2.1. Components: `ProofBand` (stats + count-up hook), `WhyGrid` (6 details cards, copy verbatim), `Phases` (7-phase accordion), `SampleRead` (static new-format map; reuses `data-rv` staggers), `WhoIndex` (click-to-swap panel, `whoData` from the DC script verbatim), `HuntBoard` (12 rows → `/industries`), whose-side band, `CtaSection` (booking card). Engine: keep `YuliaIntake`, restyle (new chips, static placeholder, `.enter` class on card mount, remove sample-tab plumbing). Sticky CTA threshold to 0.9vh.

**Step 3 — Industries page** (new `client/src/practice/Industries.tsx`). 12 `SectorBlock`s + Heritage + CTA, copy verbatim from `SectorsPage.dc.html`. Route `/industries` in `App.tsx` (marketing-or-app fork like the other practice routes); nav "Industries" gets active state on it.

**Step 4 — Shell & chrome** (`PracticeShell.tsx`). Nav links (`#why`/`#how`/`/industries`/`#who`, subpage-anchored via the existing `anchor()` helper); charcoal footer with the new column set (+ kept legal links / sign-in per Q3); port improved `_rvScan`; add the shared count-up utility.

**Step 5 — Booking.** `leads.ts` `bookHref()` fallback becomes the Google Calendar URL (env `VITE_BOOKING_URL` still wins); delete the `#book` form section; all "Confidential consultation"/"Book a call" targets → `#cta` (landing) / `/#cta` (subpages).

**Step 6 — Survivor smoke pass.** Segments ×5, `/track-record`, `/about` under the new stylesheet at 1440/900/390 — fix local breaks only (expected: airier section padding, 24em/pretty H2 wraps, charcoal footer inheriting correctly via the var remaps).

**Step 7 — Verify & ship.** Playwright side-by-sides against the prototypes (both pages × 3 widths, reveal-suppressed); interaction checks: accordions, why-cards, who-index swap, count-up, hunt-row nav, engine open/converse/persist/minimize (desktop + sheet), booking link new-tab, sticky CTA in/out; `npm run build`; PR with screenshots; squash-merge → Railway.

**Step 8 — Docs.** Update `CLAUDE.md` design-system section (v3 IA, two-width law, charcoal footer, heromesh, `/industries`) + `REPO_STATUS.md`; mark `practiceSite/` as "source design bundle — implemented".

## 7. Risks & watchpoints

- **Chat-sheet regression risk (highest).** The mobile drawer stack is the most hardened code on the site; the restyle must not touch its gesture/lock logic. Mitigation: visual-only edits to `YuliaIntake`, then re-run the full sheet gesture checklist on a 390px viewport.
- **`.pd-hero-fold` vs the engaged card.** `100svh − nav − curve` is sized for the resting bar; verify the engaged conversation card doesn't overflow the fold on short viewports (design allows the section to grow — confirm no clipping).
- **Charcoal footer var remaps** — inline styles in `PracticeShell` read `--pd-tert`/`--pd-body`; the remap handles them, but the segment pages' footer must be spot-checked (same component, so once is enough).
- **Details-accordion a11y** — native `<details>` keeps keyboard/AT behavior for free; don't reimplement with divs.
- **Count-up + React** — the DC version mutates `textContent`; in React, run it on refs after mount (band is static content, no re-render conflict).
- **Superset CSS keeps dead component styles** (showtabs, gets, ledger…) — harmless now, prune in a later cleanup pass, not this PR.

## 8. Estimate

Steps 1–5 are the bulk (~a focused session), 6–7 the safety net. Single PR, fully screenshot-verified before merge, same-day deployable.
