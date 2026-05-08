# CD Handoff — Production Visual State

**Reference SHA:** `fd1c6b4` (`main` tip as of 2026-05-08).
**Reference tag:** `restore/pre-autonomous-2026-05-06` — points at the same commit.

If you're rendering anything that doesn't match this document, your repo snapshot is **stale**. Re-import the repo and confirm `git rev-parse main` returns `fd1c6b4`. Some autonomous-run commits between `fd1c6b4` and `44d3641` were reverted on 2026-05-08 — your prior snapshot likely has the reverted state.

This document is the single source of truth for the mobile visual baseline. Every value here is copied from the live source files at `fd1c6b4`. When in doubt, read the source — the file paths are listed in each section.

---

## 1 · The two-accent rule (the most-misrendered detail)

The mobile design has **two distinct accent colors** with strict semantic separation. Conflating them is the #1 source of CD's "close but not exactly" renders.

| Token | Hex | Role | Where it appears |
|---|---|---|---|
| `--mb-accent` | `#8A9AE8` | Periwinkle — **chrome / informational** | Eyebrows, links, soft pills, focus rings, Recommended-Next pills, the page floor gradient bottom stop |
| `--mb-action` | `#D6A35C` | Brand gold — **action / "do something now"** | The chat FAB, the active-tab indicator in the dark-glass pill, primary CTAs that initiate an action |

**Critical:** the chat FAB is **gold**, not periwinkle. The active tab in the bottom pill is **gold**, not periwinkle. If your render shows the FAB or active tab in the cool periwinkle family, the token mapping is wrong.

Source: `client/src/index.css:485-496`

```css
--mb-accent:      #8A9AE8;  /* periwinkle — chrome */
--mb-accent-2:    #6F82DC;
--mb-accent-ink:  #4F60BD;
--mb-accent-soft: #EEF1FB;

--mb-action:      #D6A35C;  /* gold — action */
--mb-action-soft: #FAF1E1;
```

The full token list lives at `client/src/index.css:468-535`. **Read that range.** It's the canonical token system.

---

## 2 · Page floor gradient — "the purple bottom fade"

Every mobile screen sits over a body-wide gradient that fades from white at the top to a soft periwinkle at the bottom. Long pages reveal more of the periwinkle band. On Safari mobile the bottom URL-bar zone reads through this gradient — that's why the bleed feels native.

```css
background: linear-gradient(to bottom,
  #FFFFFF 0%,
  #FBFCFE 40%,
  #A8B3E5 100%);
```

Three stops, no plateau. The 40% near-white intermediate keeps the top half visually pure white, and the bottom 60% smoothly curves to periwinkle (`#A8B3E5`).

Source: `client/src/components/v6/mobile/V6Mobile.tsx:405-417` (`rootGradient` function).

---

## 3 · Hero card recipe (the textured cards on Today / Pipeline)

Hero cards are **three layers stacked**. Missing any layer produces the flat-color rendering CD has been generating.

```
┌─────────────────────────────────────┐
│  Layer 3:  Verdict-tinted gradient  │  ← 165° linear-gradient overlay
│  Layer 2:  Watercolor texture PNG   │  ← from /textures/texture-*.png
│  Layer 1:  Verdict-tinted box-shadow│  ← ambient glow that radiates
│            outward beneath the card  │     the card's color onto the page
└─────────────────────────────────────┘
```

### 3a · Texture layer (Layer 2)

Textures live in `client/public/textures/` as PNG files. Each hero variant draws from a curated pool, and the pick is randomized at module load — every page-load gets a fresh look from the same family.

| Hero variant | Pool | Files (any one of these) |
|---|---|---|
| `welcome` (Today anon hero, Brief header) | GOLD | `texture-sunrise.png`, `texture-gold-marble.png`, `texture-orig-sunrise.png` |
| `pursue` (Today authed hero, Detail pursue) | GREEN | `texture-pursue.png`, `texture-sage-botanical.png`, `texture-orig-pursue.png` |
| `baseline` (Pipeline featured, Detail baseline) | COOL_BLUE | `texture-baseline.png`, `texture-mint-waves.png`, `texture-aqua-cloud.png`, `texture-orig-baseline.png` |
| `buyers` (Today Explore card, Detail buyers) | COOL_PURPLE | `texture-buyers.png`, `texture-sage-botanical.png`, `texture-mint-waves.png`, `texture-orig-buyers.png` |
| `watch` (Detail watch verdict) | FIXED | `texture-watch.png` (semantic, no rotation) |
| `pass` (Detail pass verdict) | FIXED | `texture-pass.png` (semantic, no rotation) |

Source: `client/src/lib/randomTextures.ts:25-50`. **The PNG files are git-tracked — fetch them from `client/public/textures/`.**

### 3b · Gradient overlay (Layer 3)

Each hero variant gets a verdict-tinted gradient *over* its texture. The gradient stops are tuned to clarify the hero's identity without muddying the texture.

| Variant | Overlay |
|---|---|
| `pursue` | `linear-gradient(165deg, rgba(63,138,106,0.30) 0%, rgba(40,92,70,0.62) 100%)` |
| `watch` | `linear-gradient(165deg, rgba(202,150,82,0.30) 0%, rgba(128,86,36,0.62) 100%)` |
| `pass` | `linear-gradient(165deg, rgba(216,139,132,0.30) 0%, rgba(140,68,60,0.62) 100%)` |
| `welcome` | `linear-gradient(165deg, rgba(202,150,82,0.28) 0%, rgba(128,86,36,0.60) 100%)` |
| `baseline` (Pipeline featured) | `linear-gradient(160deg, rgba(60,108,168,0.42) 0%, rgba(25,68,118,0.72) 100%)` |

Apply via `background-image` with both layers in one string:
```css
background-image:
  linear-gradient(165deg, rgba(63,138,106,0.30) 0%, rgba(40,92,70,0.62) 100%),
  url('/textures/texture-pursue.png?v=20260503');
background-size: cover, cover;
background-position: center, center;
background-repeat: no-repeat, no-repeat;
```

Source: `client/src/components/v6/mobile/screens/Today.tsx:305-327` (`HERO_OVERLAY` map) + `Pipeline.tsx:326-346` (featured hero).

### 3c · Verdict-tinted ambient glow (Layer 1, sits *under* the card via box-shadow)

The shadow under each hero card carries the card's own color — sage-tinted shadow under the pursue card, gold-tinted under welcome, etc. This is what makes the cards feel alive on a white page. Without it, they look pasted.

| Variant | Box-shadow |
|---|---|
| `pursue` | `0 14px 36px -10px rgba(63,138,106,0.32)` |
| `watch` | `0 14px 36px -10px rgba(180,130,50,0.30)` |
| `pass` | `0 14px 36px -10px rgba(180,90,80,0.28)` |
| `welcome` | `0 14px 36px -10px rgba(180,130,50,0.32)` |
| `baseline` (Pipeline) | `0 14px 36px -10px rgba(60,108,168,0.32)` |

The full hero card box-shadow stacks the verdict glow with a base shadow + inset highlight + inset bottom shadow:
```css
box-shadow:
  /* Verdict-tinted ambient glow */
  0 14px 36px -10px <verdict-tinted rgba>,
  /* Base lift */
  0 8px 20px -8px rgba(0,0,0,0.30),
  /* Inset top highlight — sells "lit from above" */
  inset 0 1px 0 rgba(255,255,255,0.24),
  /* Inset bottom shadow — depth at the cell boundary */
  inset 0 -1px 0 rgba(0,0,0,0.20);
```

Source: `client/src/components/v6/mobile/screens/Today.tsx:333-378` (`HeroFrame` component).

### 3d · Hero card border-radius

`22px` for Today heroes, `18px` for Pipeline featured. Both are App Store-grade rounded — not pill-rounded.

---

## 4 · The bottom tab pill — dark glass, NOT light translucent

The floating tab pill at the bottom is a **dark-glass surface** in the Music / Camera / Photos / Apple TV family — *not* the light-translucent App Store Today tab pattern. Many CD renders default to light; that's wrong for this product.

Properties:
- **Tint:** `dark` (`<GlassSurface tint="dark">`)
- **Shape:** Pill, `border-radius: 999px`
- **Position:** `position: fixed; bottom: calc(18px + env(safe-area-inset-bottom)); left: 20px; right: 20px;`
- **Background:** Dark translucent + backdrop-filter blur (the GlassSurface component handles this — see `client/src/components/v6/mobile/glass.tsx`)
- **Tab labels:** White (`#fff`) when inactive, **gold (`var(--mb-action)` = `#D6A35C`)** when active. Same for the icon.
- **Tab icon size:** 22px outline; icons fill (active) vs stroke-only (inactive).
- **Adjacent FAB:** Gold (`var(--mb-action)`) circle, 56×56px, sits to the *right* of the pill with a 10px gap. Carries the chat icon in white.

Source: `client/src/components/v6/mobile/TabBar.tsx` (whole file is the spec).

### Tabs at fd1c6b4

Three tabs **only**: `Today / Pipeline / Brief`. **No Library, no Search, no Portfolio** at this SHA. Any prior CD work that included those tabs was based on the autonomous-run snapshot (since reverted).

The 5-tab structure (Today / Pipeline / Portfolio / Search / Library) is the *target* design CD is being asked to design. Library + Search + Portfolio are **new screens to design** — they don't exist in prod yet.

---

## 5 · Section / card system (the "everything else" that wraps content)

Below heroes, content lives in white App Store-style cards. The CSS classes are scoped to `.mobile-root`.

### 5a · `.mb-as-card` — the white card

```css
.mobile-root .mb-as-card {
  background: var(--mb-card);  /* #FFFFFF */
  border-radius: 18px;
  overflow: hidden;
  border: 0.5px solid rgba(60, 60, 67, 0.10);
  border-top-color: rgba(60, 60, 67, 0.14);  /* heavier top edge */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 2px 4px rgba(0, 0, 0, 0.07),
    0 8px 16px -2px rgba(0, 0, 0, 0.10),
    0 16px 32px -8px rgba(0, 0, 0, 0.06);
}
```

Source: `client/src/index.css:570-593`. Used by Pipeline's stage-section wrapper, and by every "list of rows on white card" pattern.

### 5b · Section header pair — eyebrow + title

```css
.mobile-root .mb-section-eyebrow {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--mb-accent-ink);  /* periwinkle */
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.mobile-root .mb-section-title {
  font-family: var(--mb-font-display);
  font-weight: 800;
  font-size: 26px;
  letter-spacing: -0.7px;
  color: var(--mb-ink);
  line-height: 1.08;
  margin: 4px 0 0;
}
```

The contrast — small/wide eyebrow + big/tight title — is what reads as "magazine layout" rather than "form label + h2." Source: `client/src/index.css:626-645`.

### 5c · "Get" pill (action pill on rows)

The iOS App Store "GET" pill — used as the right-edge action affordance on Pipeline rows.

```css
.mobile-root .mb-get-pill {
  background: var(--mb-blue-soft);  /* #EAF0FA */
  color: var(--mb-blue-ink);        /* #4A7AB0 */
  font-weight: 700;
  font-size: 15px;
  padding: 6px 22px;
  border-radius: 999px;
  border: none;
  letter-spacing: -0.1px;
  min-width: 76px;
}
.mobile-root .mb-get-pill.dark {
  background: rgba(255,255,255,0.22);  /* on textured hero */
  color: #fff;
}
.mobile-root .mb-get-pill.solid {
  background: var(--mb-accent-2);
  color: #fff;
}
```

Source: `client/src/index.css:553-567`.

### 5d · Tap state (Emil Kowalski pattern)

Every interactive surface gets `.mb-tap` for press feedback.

```css
.mobile-root .mb-tap {
  transition: transform 160ms cubic-bezier(0.25, 1, 0.5, 1);
  -webkit-tap-highlight-color: transparent;
}
.mobile-root .mb-tap:active { transform: scale(0.985); }
```

Source: `client/src/index.css:657-661`.

---

## 6 · Typography stack

```css
--mb-font-display: "SF Pro Display", "Inter Tight", -apple-system, system-ui, sans-serif;
--mb-font-body:    "SF Pro Text",    "Inter",       -apple-system, system-ui, sans-serif;
--mb-font-mono:    "JetBrains Mono", ui-monospace, monospace;
```

- **Display** → hero headlines, section titles, big numbers
- **Body** → everything textual
- **Mono** → eyebrows, status badges, small uppercase metadata

Use the `.mb-mono` class for mono — it sets `font-family` AND `font-variant-numeric: tabular-nums` (so dollar amounts and counts align).

Source: `client/src/index.css:526-528, 545-548`.

---

## 7 · Top bar — `GlassTopBar` + `LargeTitle` (App Store collapse pattern)

The mobile top has two coordinated pieces:
- **`GlassTopBar`** — translucent sticky bar that sits over the safe-area zone. Title in the bar is *hidden* on scroll-top, fades in once the user scrolls past the LargeTitle. Avatar (initials) on the right; optional search icon to the left of the avatar.
- **`LargeTitle`** — 34px display title that sits below the bar at scroll-top. Collapses into the bar's title on scroll. Reports its visibility via `TitleCollapseContext`.

This is the iOS App Store / Notes / Mail collapse pattern, not a static header. Source: `client/src/components/v6/mobile/TopBar.tsx`.

---

## 8 · Existing screens at fd1c6b4

Five screens exist. Each lives at `client/src/components/v6/mobile/screens/`.

| Screen | File | What it shows |
|---|---|---|
| Today | `Today.tsx` | Welcome hero (gold, anon) OR pursue hero (sage, authed), Explore card (cool purple), persona-tip chips |
| Pipeline | `Pipeline.tsx` | Featured hero (cool blue), stage chips, "Yulia is watching" / per-stage rows in a `mb-as-card` |
| Brief | `Brief.tsx` | Editorial header w/ gold texture, news/insight feed |
| Detail | `Detail.tsx` | Per-deal page with FitGauge hero, stats, tags, Yulia narrative, artifact rail, recommendations |
| Watching | `Watching.tsx` | Sub-page of Pipeline — full watching list |

Plus the chat sheet (`ChatSheet.tsx`) — full-screen Yulia chat that slides up from below.

---

## 9 · How to verify your render matches prod

If your output is questionable, run through this checklist before showing it to the user:

1. ☐ Bottom tab pill is **dark translucent** (Music/Camera/Photos style), not light translucent (App Store Today style)
2. ☐ Active tab indicator is **gold** (`#D6A35C`), not periwinkle
3. ☐ Chat FAB is **gold** (`#D6A35C`), not periwinkle, not blue, not slate
4. ☐ Today welcome hero shows a **watercolor texture** (warm gold/amber tones), not a flat gold field
5. ☐ Pipeline featured hero shows a **watercolor texture** (cool blue tones), not a flat blue field
6. ☐ Page floor gradient is visible at bottom of long pages — fades to **`#A8B3E5`** periwinkle
7. ☐ Hero cards have a **verdict-tinted shadow glow** beneath them (sage under pursue, gold under welcome, blue under baseline)
8. ☐ `mb-as-card` containers are white with App Store-grade hairline border + layered shadow stack — not flat white rectangles, not heavy drop shadows
9. ☐ Section headers are **eyebrow (small/wide/periwinkle uppercase) + title (huge/tight/dark)** — not single h2 elements
10. ☐ Three tabs only: Today / Pipeline / Brief. Library / Search / Portfolio do **not exist yet** at this SHA.

---

## 10 · For "design new pages" tasks

When designing new screens (Library, Search, Portfolio, etc.), **use this document's primitives**:
- Wrap section content in `mb-as-card`, not freestanding hairline boxes
- Use `mb-section-eyebrow` + `mb-section-title` for section heads
- Use `mb-get-pill` for action pills, not custom tinted spans
- Use `mb-tap` on every interactive surface
- For new heroes, follow the 3-layer recipe (texture + tinted gradient + tinted glow shadow), and pick or extend `RANDOM_TEXTURES` for the texture pool
- Don't introduce new accent colors — the two-accent rule (`--mb-accent` periwinkle for chrome, `--mb-action` gold for actions) is fixed
- Don't introduce new font families — display/body/mono are it

If a CD design ships content that doesn't compose from these primitives, the screen will look like a foreign visitor and won't ship.

---

## Document maintenance

This file lives at the repo root and is git-tracked. When the production design system changes, update this file in the same commit as the code change. CD will pick up changes on its next repo import.

Last refreshed against: `fd1c6b4` (2026-05-08).
