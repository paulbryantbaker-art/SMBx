# Site cutover — Deal Green → oxblood + coral

**The executable sequence for the site.** Values come from `DESIGN_LANGUAGE.md`;
scope and traps come from the 12-agent survey recorded in
`PALETTE_MIGRATION_PLAN.md`. Nothing here is a re-derivation — where this file
states a file:line, it was read and confirmed by a second agent.

## Preconditions

- [x] `main` merged into `claude-code` (`fc8d4e51`)
- [x] App-side diagnostic run — 81 occurrences / 23 files, listed in §1
- [ ] **SCOPE CONFIRMED** — see §1. Blocks everything below.
- [ ] `npx tsx@4.19.2` baseline recorded: `test:design` 103/103, `shoot:mobile` 257

**One commit, not several.** The guards hard-fail the moment the token moves, so
there is no valid intermediate state. `claude-code` does not deploy; only a merge
to `main` reaches Railway, so the branch can sit broken while the work is in
progress. Rollback is `git revert` of the single commit.

---

## 1. Scope — the one open decision

The diagnostic proved the boundary is **not** "site vs app". These are all
public surfaces living outside `client/src/practice/`:

| Surface | Occurrences | Why it is public |
|---|---|---|
| `pages/public/Privacy.tsx` · `Terms.tsx` | 7 | Footer-linked at `PracticeShell.tsx:667-668`, routed `/legal/*` |
| `Login` · `Signup` · `ForgotPassword` · `ResetPassword` | 10 | The doorway |
| `pages/public/SharedDocument.tsx` · `pages/SharedDocumentView.tsx` | 9 | `/shared/:token` — what a lawyer or CPA opens |
| `components/documents/*` | 12 + 3 rgba | The stylesheet they read the document through |
| `pages/public/ValueLensPage.tsx` | 3 | Token route |
| **Public subtotal** | **~41** | |
| `pages/admin/*` · `ChatDock` · `atlas.css` · `v2/tokens.ts` · others | ~31 + 6 rgba | Logged-in only |

**Recommended: public moves wherever it lives; internal stays.** Under that
boundary the danger-colour collision never arises — `#C2410C` and `#B42318` are
entirely inside the internal half and never sit beside the new accent.

---

## 2. Order of operations

Highest leverage first, so later steps have less to touch.

### Step 1 — Tokens (`house/tokens.ts`)
Replace the CARTA palette per `DESIGN_LANGUAGE.md` §3, and **fork** `CARTA_APP`
holding the current values for the internal shells. 16 files import CARTA by key,
so the mapping lands with no consumer edits.

**The trap:** `CARTA.dark` `#181818` → `#8A2B32` raises ground luminance 8.1×.
The whole on-dark ramp must be re-cut from §3.3 in the same edit — `darkSeam`,
`darkPlate`, `darkBtnBorder`, `darkMuted` and `darkLegal` all break, two by
inverting (they become *darker* than their own ground and read as holes).

Also in this step: `brandPaletteLines()` and `artworkPaletteClause()` carry the
words "deep green" as hardcoded prose, not interpolated hex. They feed model
prompts — miss them and generated art stays green with nothing to show for it.

### Step 2 — Guards, same commit
- `house/palette-guard.ts` — **no edit needed.** Its DEAD list derives from
  LEDGER-minus-CARTA, so the six greens retire automatically. Verify, don't touch.
- `scripts/studio/carta-guard.mts:153,163` — the warm test is channel-ordering
  only (`r > g+18 & g > b+18`) and **matches `#B8431E` exactly**. Add a hue
  window of **28–62°**: amber/honey/brass sit at 39–42°, the new accents at 14°.
  **Named cost:** terra cotta `#D4714E` sits at 15.7° and will no longer be
  caught by the artwork test. It remains caught by the document guard. Accept
  and comment it, or the next reader will treat it as an oversight.
- `scripts/studio/design-check.mts` — measures every contrast against
  `LEDGER.dark`. Point it at the new field.
- `house/__tests__/design.test.mts` — the hand-typed `DEAD` array (74-82), the
  app-wide `RETIRED_HEX` walker (508-518), and the literal at 564
  (`--at-blue: #0A7A58`). Under the recommended scope that literal keeps its
  current value; assert it deliberately rather than by accident.

### Step 3 — The indirection layer
Two edits reach ~100 call sites.

- **`carta.css:551-565`** — 15 `.ca-h-*` hover classes, **10 carrying retired
  values**, driving **53 call sites across 8 `.tsx` files**. The light/dark split
  is encoded **only in the class name**: `.ca-h-green` / `-deepgreen` /
  `-greenline` / `-greenbg` are on-light → `#B8431E`; `.ca-h-mint` / `-mintbg` /
  `-mintline` are on-field → `#FF7D55`. Rename in a follow-up, never in this
  commit — 53 call sites is a separate diff.
- **`practice.css:61-64`** — `--pd-coral`, `--pd-coral-link`, `--pd-cta`,
  `--pd-cta-hover`, consumed 44× via `var()`.

### Step 4 — The forks (a single hex serving two grounds)
Each of these must become two declarations:

| File | What | Light → | Field → |
|---|---|---|---|
| `carta.css:851` / `:860` | proof-chain conclusion node | `#B8431E` | `#FF7D55` |
| `carta.css:869` | connector dot (dark wire forks at `:865`, the dot never did) | `#B8431E` | `#FF7D55` |
| `SegmentPage.tsx:204` | "0 sell-side" chip on a `#181818` cell | — | `#FF7D55` |

### Step 5 — The mirror (fill vs text want opposite answers)
- **Fills under white text → oxblood, never coral.** `report.css:534`, `:672`,
  `:752`; `practice.css:601`; `TrackRecord.tsx:120-122`. White on `#FF7D55` is
  2.53:1 and renders perfectly happily.
- **Text on the field → `#FF7D55`, never `#B8431E`.** `About.tsx:82`,
  `SegmentPage.tsx:126`, **`Industries.tsx:224`** — the third instance was found
  by the adversarial pass, not the original survey.

### Step 6 — The dark bands become the field
18 live definitions of `#181818`, **16 of them inline in `.tsx` style objects**:
`Landing.tsx` 274, 418, 711, 1193, 1277 and others; `practice.css:85-87`
(`--pd-dark-bg/-top/-bot`). Then `practice.css:379-390`, the `.pd-dark` re-scope
— the existing light/dark fork mechanism, built entirely out of retired greens.

### Step 7 — The sweep a hex search misses
- **56–59 `rgba()` forms** — `rgba(10,122,88,…)`, `rgba(168,240,206,…)`,
  `rgba(15,169,124,…)`. ~43 are gradient stops on dark bands.
- **17 orphan greens across 11 hexes** never on the retired list: `#F2FBF6`
  `#06503A` `#CFEEE0` `#2E5F4C` `#084433` `#0D6B52` `#2E7A61` `#A8C9BA`
  `#C9E8DA` `#E4F4EB` `#16241E`.
- Scoped document languages, each self-contained: `.rp-*` in `report.css`
  (15 sites) and `.pd-map`/`.map-*` in `practice.css:1373-1400`.
- Named odds: `carta.css:545` `::selection`; `carta.css:264` two keyframes;
  `practice.css:2139` a mint→honey gradient clipped to dark stat numerals;
  `practice.css:1969` `.pd-anchorcard` `#0A6A4C`; `atmo.tsx:127,172` svg circles;
  `Landing.tsx:986-988` and `ReportsIndex.tsx:149-151` orbit ring strokes;
  `PracticeShell.tsx:602,609,610` the headshot ring and footer links;
  `carta.css:1023,1076,1130,1202,1258` the `.ca-engine` intake redress (20
  declarations across three responsive blocks).

### Step 8 — The ground moves to bone
`practice.css:118` is `background: #FFFFFF`. Four un-tokened landing places move
with it or the boot flashes white: `client/index.html:65,66` (two `theme-color`
metas), `:122` (the pre-paint boot script `var bg = '#FFFFFF'`), and
`client/public/manifest.json`.

### Step 9 — Assets
- **Logo masters.** The X is `#107F5E` and the dark variant `#61E5BE` — neither
  was ever a token, so `house/deck.ts:1007`'s "the typeset X matches the logo"
  law is already false. Regenerate both, then the tight-cropped derivatives
  (`crop-logo.py`), then the favicons (`build-icons.mts`, currently solid
  `#0A6A4C` tiles), then the OG card (`build-site-card.mts` — token-driven, so it
  re-renders for free).
- ~100 SVG illustrations across `/industries`, report media and `studio/assets`.

---

## 3. Verification

Run in this order. Each is a gate, not a formality.

1. `npx tsx@4.19.2` → `npm run test:design` — expect 103/103. A green suite that
   still describes the retired scheme is the failure mode here, so read the
   §4 assertions, don't just read the count.
2. `npm run test:api-lanes`, `npm run test:outreach` — unrelated, should be
   untouched. If either moves, something leaked.
3. **`npm run shoot:mobile`** — 9 failure classes across 15 public routes,
   baseline **257**, exit 1 on any finding. This is the real gate: it renders
   every public page at 360/390/430px and catches contrast-adjacent breakage a
   token test cannot see.
4. **Drive it.** Load the site, walk the five public pages plus `/legal/privacy`,
   `/legal/terms` and a `/shared/:token` document. Screenshot the dark bands
   specifically — the depth ramp is the thing most likely to look wrong while
   measuring right.
5. **`carta.css` is not read by the design gate.** It holds the largest
   concentration of live public-site colour. It has to be checked by eye.

---

## 4. Deliberately not in this cutover

The internal app and admin (~31 occurrences), the 11 canvas models
(`models/theme.ts:46`), the legacy `.mkt` scope, the four Python renderers, the
`studio-kit/` vendored copy, and **`server/`** — where `smbxBrand.ts:15` still
carries `#D44A78` hot pink from V3/V4 and no guard reads the directory at all.
Each is tracked in `PALETTE_MIGRATION_PLAN.md`. None blocks the site.
