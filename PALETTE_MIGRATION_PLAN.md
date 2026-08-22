# Palette migration — Deal Green → oxblood + coral

**Written 2026-08-22 from a 12-agent survey (5 lanes, 7 adversarial checks, 0 errors).
Every silent-failure finding below was confirmed by a second agent trying to refute it.**
Nothing has been committed. Working tree is clean apart from `SERVICE_OFFERINGS.md`.

## The scheme (decided, Paul 2026-08-22)

| Role | Value | Verified |
|---|---|---|
| **60** ground | `#FCFAF6` bone | — |
| **30** field | `#8A2B32` oxblood | white on it 8.49:1 |
| **10** accent, light | `#B8431E` | 5.22:1 on bone |
| **10** accent, on field | `#FF7D55` | 3.36:1 — **display sizes only** |
| small text on field | `#FFAA90` | 4.61:1 |
| accent hover | `#9C3717` | 6.78:1 |
| ink / body / muted | `#1A1A1A` / `#57534E` / `#76726B` | 16.69 / 7.32 / 4.59 |
| on-field primary / secondary | `#FFFFFF` / `#E5C9C6` | 8.49 / 5.46 |
| panel / rule / field-rule | `#F3EFE9` / `#E3DDD4` / `#A8484E` | non-text |

RETIRED by this: `#0A7A58` `#086348` `#DFF5EC` `#A8F0CE` `#0FA97C` `#0A6A4C`.

---

## 0. THE ONE DECISION BLOCKING THE BUILD

**Does the logged-in app move too?**

`client/src/components/v2/tokens.ts:22` imports `CARTA` directly, as do
`v6/desktop/atlasTokens.ts` and `atlasmobile/mobileTokens.ts`. A token edit repaints
the live app — Today / Leads / Campaigns — which the decision never scoped.

And it cannot simply be allowed, because **the new accent collides with the app's
semantic danger colour**:

| Pair | RGB distance | Hue gap |
|---|---|---|
| accent `#B8431E` vs Atlas `T.terra` `#C2410C` (danger) | 20.7 | 3.1° |
| accent `#B8431E` vs V2 `C.danger` `#B42318` | 32.8 | 10.2° |

Moving danger to a crimson does not escape — **oxblood is itself a deep red**, so a
crimson danger lands 20–33 from the *field*. The warm-red family now belongs to the brand.

- **(a) App stays on the current values — RECOMMENDED.** Fork the token: `CARTA` serves
  the site + collateral, a pinned `CARTA_APP` (or a frozen copy) serves the shells. This
  is literally the scope Paul set, and it avoids repainting the working instrument
  mid-flight. Cost: the app and the site diverge until a later, deliberate pass.
- **(b) App moves, semantic states get an icon/label as well as a hue.** Correct
  practice anyway (never encode state in colour alone) but it is its own design pass
  across every state surface in two shells.
- **(c) App moves, danger is redesigned.** Most work, least certain outcome.

**Everything below assumes (a).** Under (b)/(c) add a phase.

---

## 1. What the survey corrected in the earlier estimate

| Earlier claim | Truth |
|---|---|
| 187 green refs | **289** in `client/src/practice` alone (+73 more app-side) |
| Dark band is `#131512` / `#1A1A1A` | **`#181818`** — 18 live definitions, 16 inline in `.tsx`. The other two appear **nowhere** |
| Ground is bone | Ground is **`#FFFFFF`** — moving to `#FCFAF6` is its own edit, with four un-tokened landing places |
| `test:design` = 58 cases | **103**, currently 103/103 |
| Collateral is a big lift | `researchComposer` / `deckDesigner` / `artworkService` were **deleted** in `246e6c33`. `house/deck.ts` + `house/report.ts` are token-driven — **one token edit moves ~90% of collateral** |
| Brochure has no source in repo | **Stale.** `studio/specs/smbx-corpdev-offering-pricing.deck.mts` is the spec — but the slug differs from the served filename |

---

## 2. Build order

### Phase 0 — Ground work (no palette change yet)
1. `git merge main` into `claude-code` (currently 1 behind, `a58eae67`).
2. **Teach `design.test.mts:508-518` the six retired greens.** The app-wide walker over
   `components/pages/hooks/lib` already exists; it just does not know them yet. One edit
   surfaces all 73 client-side occurrences in a single run. **This is the highest-leverage
   discovery step in the whole migration — do it first and read the output.**
3. Baseline: `npx tsx@4.19.2` (the repo's local tsx is broken), record 103/103.

### Phase 1 — Fix the guards, or they reject the correct work
These currently **fight the change and two of them lie**:
- `house/palette-guard.ts` derives its dead list from **LEDGER minus CARTA** → the instant
  `CARTA.green` becomes oxblood, all four greens retire and it hard-exits **code 4** on
  every builder still carrying them.
- `scripts/studio/carta-guard.mts` flags `r > g+18 && g > b+18` as a forbidden amber/gold
  mass — **that matches `#B8431E` exactly.** It will REJECT every correctly converted
  illustration and PASS every stale green one.
- `scripts/studio/design-check.mts` measures every contrast against `LEDGER.dark`.
- `design.test.mts` checks dead hexes against `{...LEDGER, ...REPORT}` — and LEDGER **is**
  the Deal Green archive, so adding `#0A7A58` to DEAD fails its own "is a house token"
  assertion. (This is why `#0A6A4C` is already in DESIGN.md's dead table but deliberately
  absent from the test array.)
- `design.test.mts:564` pins `--at-blue: #0A7A58` as a hand-written literal — fails loudly.

### Phase 2 — Tokens
`house/tokens.ts`. Fork `CARTA_APP` per decision (a). The two-value accent pattern already
exists (`green` light / `mint` dark) and 16 files read CARTA **by key**, so the mapping
`green → #B8431E`, `mint → #FF7D55` lands with no consumer edits.

**THE BIGGEST SINGLE TRAP:** `CARTA.dark` `#181818` → oxblood raises ground luminance ~8×
and silently breaks the whole on-dark ink ladder — `darkBtnBorder` lands at **1.01:1**
(invisible), `darkSeam`/`darkPlate` become *darker* than their own ground and read as
shadow instead of lift, `darkLegal` drops 5.4:1 → 2.6:1. The entire dark-neutral ramp is
green-tinted and must be re-cut warm against a red field.

Also: `brandPaletteLines()` and `artworkPaletteClause()` generate the palette paragraph
handed to **models** — the words "deep green" are hardcoded prose, not interpolated hex.

### Phase 3 — The site, role-aware (289 refs)
A hex sweep misses a third. Order by leverage:
1. `carta.css:551-565` — the `.ca-h-*` hover vocabulary. **10 of 15 classes carry retired
   values and drive 53 call sites across 8 files.** The names encode the hue
   (`.ca-h-mint`, `.ca-h-greenbg`) and the light/dark split is encoded **only** in the name.
2. `practice.css:61-64` — the four `--pd-coral*` token defs, consumed 44× via `var()`.
3. **The both-grounds traps** (one hex serving light AND dark with no fork):
   `carta.css:851`/`860` proof-chain node · `carta.css:869` connector dot ·
   `SegmentPage.tsx:204` chip on `#181818`.
4. **The mirror trap** (fill vs text): `report.css:534/672/752` + `practice.css:601` hover
   ink buttons to a green FILL under white text → must take **oxblood**, never `#FF7D55`
   (white on coral = 2.53:1). Meanwhile `About.tsx:82`, `SegmentPage.tsx:126` and
   `Industries.tsx:224` use green as TEXT on dark → must take `#FF7D55`, never `#B8431E`.
5. 56–59 `rgba()` forms invisible to a hex search (~43 gradient stops).
6. 17 orphan greens across 11 hexes never on the retired list — incl. the entire
   `.pd-dark` text scale at `practice.css:379-386`.
7. `carta.css` holds the largest concentration of live green **and is the one stylesheet
   the design gate never reads.**

### Phase 4 — Collateral
~90% free via Phase 2. The remaining 10%, all silent:
- Raw decimal `rgba()` in `build-og-card.mts:137`, `build-deck.mts:115`,
  `build-onepager.mts:214` — `assertCarta` passes them clean.
- `build-onepager.mts:317` `.rule` is declared unconditionally with no light fork.
- **5 Python renderers hold the palette as decimal RGB tuples** — invisible to grep and to
  `carta-guard` (which only walks `.mts|.ts|.md|.css`).
- `studio-kit/build-deck.mts` + both copies of `machine.html`: fully hardcoded, never
  converted to Carta at all.
- `art-normalize.mts` quantizes generated art **back to LEDGER green/brass**.

### Phase 5 — Assets (~110 files carry baked-in green)
- Logo masters use greens that **are not tokens**: X is `#107F5E`, dark variant `#61E5BE`.
  `house/deck.ts:1007`'s "the typeset X matches the logo" law is **already false**.
- Every favicon + PWA icon is a solid `#0A6A4C` tile — a hex this decision retires —
  generated by `build-icons.mts` from `LEDGER.dark`.
- ~100 SVG illustrations (17 `/industries`, 22 report media, ~60 `studio/assets`).
- `client/index.html:65,66,122` two `theme-color` metas + the pre-paint boot
  `var bg = '#FFFFFF'`, plus `manifest.json` — all must move with the ground.

### Phase 6 — Server (NOT in the original scope; flagging, not assuming)
No guard in this repo reads `server/` at all, and it is **five systems stale**:
- `server/templates/smbxBrand.ts:15` `COLORS.terra = '#D44A78'` — V3/V4 **hot pink** —
  imported by `exportService` and `chartService`.
- `documentShareService.ts:96` — the email carrying a share link to a **lawyer or CPA** is
  hot pink on terra-era near-black.
- `reportAccess.ts:261,365,373` — the research-PDF delivery email paints retired Ledger
  amber and a green pill.

### Phase 7 — Docs and law files (must be in the SAME commit as Phase 2)
- `studio/DESIGN.md` states the palette in **six** places, and its §10 drift checklist
  tells any session that **"anything warm" is a drift tell** and bans "terracotta" as an
  intent word. After the swap that page actively rejects correct work.
- `DESIGN_LANGUAGE.md` is checked by nothing, is three systems stale, points at a dead path.
- `CLAUDE.md`: "ONE accent (Deal Green …)", "flat near-black dark bands", the BUTTON LAW
  wording, and the brochure-has-no-source claim all become false.
- `design_handoff_smbx_carta_restyle/*.dc.html` — CLAUDE.md names these the transcription
  source of truth ("port them verbatim"); all five carry Deal Green.

---

## 3. Found in passing — a real pre-existing bug

`client/src/components/documents/DocumentToolbar.tsx:38`

```
bg-[rgba(10, 122, 88,0.12)]
```

A Tailwind arbitrary value containing **spaces**, which Tailwind cannot compile. The
active-state background has never rendered. A palette swap that recolours this line
changes nothing on screen — fix the syntax or delete it.

---

## 4. Explicitly NOT in scope unless asked
The 11 canvas models (`models/theme.ts:46` `greenWash`), the legacy `.mkt` marketing
scope, `client/public/collateral/` (34 shipped binaries), and the emailed pricing
brochure — which needs a rebuild whose **slug differs from the filename the route
serves**, so a naive rebuild lands beside the live file rather than replacing it.
