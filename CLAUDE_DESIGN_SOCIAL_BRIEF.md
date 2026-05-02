# smbx.ai — Social Marketing Brief for Claude Design

**Scope:** Social posts only (LinkedIn, Twitter/X, Instagram). Not a redesign.
**Audience:** Claude Design, picking up after the V6 desktop + V6 mobile drops have shipped.
**Repo:** this branch, `main`. Read paths below directly — they are the source of truth, not any earlier brief.

---

## 0. STOP — read this before anything else

**You already designed V6. The two handoff bundles you delivered are the canonical V6 design language:**
- `design_handoff_smbx_desktop_material/` — desktop V6 you shipped (Files Workspace, slate-blue, Material 3)
- `design_handoff_smbx_app store/` — mobile V6 you shipped (App Store + Liquid Glass, periwinkle)

Production faithfully implements both. Marketing material must match these bundles, not anything older.

**Read `DESIGN_SOURCE.md` at the repo root first.** It maps every handoff file to its production path so you can verify your artwork against either layer.

**Self-check, before you make any artwork:**
- Is your palette pink (`#D44A78`)? **Stale.** V6 desktop is slate-blue `#2E5C8A`; V6 mobile is periwinkle `#8A9AE8`. Pink was retired around V4.
- Is your palette warm cream (`#F4EEE3`) + terra/clay (`#D4714E`)? **Also stale — and this one might fool you because of the version number.** That's your "Edition" v22 / v22b delivery from late April (Cowork-DL era). It was retired 2026-04-29 and replaced by V6 about a week later. v22 is *older* than V6, despite the bigger number.
- Are your fonts Sora or Instrument Serif? **Same problem (Edition era).** V6 mobile is SF Pro Display / Inter Tight via `--mb-font-display`; V6 desktop uses system sans via `--font-body`.
- Are your backgrounds dot grids or warm cream? **Stale.** V6 desktop is `#F1F1F4` cool grey + `#ECEAF2` lavender chrome; V6 mobile is `#FFFFFF` + watercolor texture PNGs from `client/public/textures/`.

**One mobile deviation to know about:** your original mobile drop had `--hero-pursue-1: #A8D4BD` etc. (pastel two-tone gradients on hero cards). Production replaced those with watercolor PNGs in `client/public/textures/` (commits `2a3ecda` + `9c821a1`). For marketing, **use the watercolor PNGs as full-bleed backgrounds with verdict tints layered on top — that's what ships.**

**Stale docs to ignore:** `docs/_archive/DESIGN_LANGUAGE.md`, `STYLE_GUIDE.md` visual sections, `docs/_archive/CLAUDE_DESIGN_BRIEF.md`, `docs/_archive/CLAUDE_DESIGN_BRIEF 2.md`, `docs/_archive/STITCH_BRIEF.md`, `new claude design/design_handoff_v22b/` (Edition v22 era), `client/src/components/claude_design/design_handoff_v3/`, `client/src/components/claude_design/design_handoff_v4_home/`.

The remainder of this file is the social-marketing brief itself. Read it after `DESIGN_SOURCE.md`.

---

## 1. What we are (one paragraph)

smbx.ai is an AI deal intelligence platform for M&A professionals running real transactions ($300K to mega-cap). Yulia (the AI) is the front door — chat-first, no sales team, no contact form. Two product surfaces have shipped in V6: a **desktop Files Workspace** (operational, dense, Linear-adjacent) and a **mobile App Store-style app** (editorial, periwinkle + watercolor textures, iOS Liquid Glass chrome). Marketing must express both personalities.

For voice, audience, and pricing details, read these in repo:
- `CLAUDE.md` — platform identity, critical rules, pricing tiers
- `STYLE_GUIDE.md` — voice and brand
- `DESIGN_LANGUAGE.md` — current design language doc
- `SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md` — positioning
- `SMBX_PRICING_HOOK_RETENTION_STRATEGY.md` — current pricing ladder (5-tier with QofE Lite Pro wedge)
- `SMBX_SITE_COPY_V11_1.md` — approved marketing copy for reference

If `CLAUDE.md` and a more specific doc disagree on pricing or feature details, trust the more specific doc — `CLAUDE.md` is updated less frequently.

---

## 2. The two design systems (read the tokens, not the bundle)

Both systems are scoped to root selectors in **`client/src/index.css`**. Pull hexes from there, not from any handoff bundle CSS, because the bundles drift from production:

| Surface | Selector | Lines | Primary accent | Chrome |
|---|---|---|---|---|
| Desktop V6 | `.v6-root` | ~235–447 | Slate-blue `#2E5C8A` | Cool lavender `#ECEAF2` |
| Mobile V6 | `.mobile-root` | ~451–600 | Periwinkle `#8A9AE8` (`--mb-accent`) | White / `#F5F5F7` |

Mobile token prefix is `--mb-*`. Desktop tokens are inside `.v6-root`. When you reference a hex in a Figma layer, comment the token name next to it (e.g., `#8A9AE8 // --mb-accent`) so future updates stay traceable.

### Mobile palette highlights (read full block at `client/src/index.css:451`)

- Ink ramp: `#1A2233` → `#555E6F` → `#7A8395` → `#A6AEBC` → `#C5CBD6`
- Accent: periwinkle `#8A9AE8` / `#6F82DC` / ink `#4F60BD` / soft `#EEF1FB`
- Verdict palette:
  - Pursue (sage): `#6FB89A` / ink `#3F8A6A` / soft `#E6F3EC`
  - Watch (amber): `#D6A35C` / ink `#9C7128` / soft `#FAF1E1`
  - Pass (coral): `#D88B84` / ink `#A85248` / soft `#FBEAE7`
- Display font: SF Pro Display → Inter Tight fallback
- Hairlines: `rgba(60,60,67,0.16)` (the iOS separator color)

---

## 3. Original handoff bundles (your own prior drops)

These are CD's previously delivered design artifacts. Use them for layout/composition reference and to recognize your own visual language. Do **not** copy CSS values from them — copy from `client/src/index.css` (production tokens have moved).

- `design_handoff_smbx_desktop_material/` — V6 desktop drop
  - `V6 Files Workspace.html`, `v6-styles.css`, `v6-shell.jsx`, `v6-canvas.jsx`, `v6-modes.jsx`, `v6-views.jsx`, `v6-learn.jsx`, `design-canvas.jsx`
- `design_handoff_smbx_app store/` — V6 mobile drop
  - `Mobile iOS.html`, `mobile-styles.css`, `mobile-primitives.jsx`, `glass-primitives.jsx`, `ios-frame.jsx`, `screen-today.jsx`, `screen-today-glass.jsx`, `screen-pipeline.jsx`, `screen-detail.jsx`, `design-canvas.jsx`

---

## 4. Mobile diverged from your drop — read this carefully

We made three small changes to your mobile drop after shipping. Marketing material must reflect the **shipped** look, not the original drop:

1. **Pastel hero gradients → watercolor texture PNGs.** Six textures live at `client/public/textures/`:
   - `texture-pursue.png`, `texture-watch.png`, `texture-pass.png`, `texture-baseline.png`, `texture-buyers.png`, `texture-sunrise.png`
   - The verdict tint is now layered **over** the texture, not a flat gradient. Use these PNGs as backgrounds in mobile-track social posts.
2. **Texture overlays deepened.** Higher opacity than your drop showed (commit `9c821a1`).
3. **Sparkline strokes removed from cards.** Cards are quieter now — number + verdict pill, no inline trend line (commit `9c821a1`).

Commit context for orientation:
- `2a3ecda` — replaced CD pastel gradients with watercolor textures
- `9c821a1` — deepened texture overlays, dropped sparkline strokes
- `8fb9752 → 7c48283` — original V6 mobile build (M0 through M8)

Desktop V6 ships exactly as you delivered it. No deviations.

---

## 5. Live screenshots (ground truth)

No shipped V6 screenshots are committed to the repo yet — for either surface. Two ways to see the live UI:

- **Open the handoff bundles' HTML files in a browser** — `design_handoff_smbx_desktop_material/V6 Files Workspace.html` and `design_handoff_smbx_app store/Mobile iOS.html`. These are pixel-true references CD authored, and production matches them (with the watercolor mobile deviation noted in §4).
- **Run the live app** — `npm run dev` + `npx tsx server/index.ts`, then open in browser at desktop and mobile viewports. Components live at `client/src/components/v6/` (desktop) and `client/src/components/v6/mobile/` (mobile).

> **Note:** there is a folder `client/src/components/claude_design/mobile_pics/` containing 17 iPhone screenshots (`IMG_3497.jpeg` … `IMG_3513.jpeg`). **These are NOT shipped V6 screens** — they are iOS reference screenshots the maintainer captured (Apple App Store Today tab, Roblox listing, Apple TV remote, etc.) and gave to CD on April 21 as inspiration for V6 mobile's "Apple App Store + Liquid Glass" visual language. Use them to confirm the visual idiom V6 mobile is *aiming at*, not as ground truth for what shipped.

---

## 6. Brand assets

- **Logo:** `client/public/logo.png` is the only logo committed today.
  - **Note:** `CLAUDE.md` references `final logo.png`, `x.png`, `DG Trans.png` — these are stale and not in the repo. If you need a transparent or dark-mode variant, ask first; do not invent or regenerate the mark.
- **Favicon / manifest:** `client/public/manifest.json`

---

## 7. The deliverable

### Platforms and sizes

| Platform | Format | Pixels |
|---|---|---|
| LinkedIn | Single image | 1200 × 627 |
| LinkedIn | Square | 1080 × 1080 |
| Twitter/X | Landscape | 1600 × 900 |
| Instagram | Portrait | 1080 × 1350 |
| Instagram | Square (carousel) | 1080 × 1080 |

### Two visual tracks

**Desktop track**
- Slate-blue `#2E5C8A` accent on lavender `#ECEAF2` chrome
- Dense, operational, Linear-adjacent
- Type-led layouts; show the workspace as the artifact
- Use real V6 desktop UI captures, not stylized mockups

**Mobile track**
- Periwinkle `#8A9AE8` accent over watercolor textures from `client/public/textures/`
- App Store editorial; iOS Liquid Glass chrome cues (translucent surfaces, hairline strokes, soft shadows)
- Hero compositions can use the texture PNGs as full-bleed backgrounds with a verdict tint layered on top

### Five post archetypes (deliver one of each per track = 10 posts × 5 sizes)

1. **Feature spotlight** — single capability (e.g., ValueLens, sourcing engine, LBO model, CIM generator)
2. **Customer outcome** — a deal stat, time-to-LOI, or matching result (use anonymized illustrative numbers)
3. **Methodology insight** — a Yulia-voiced line about how a real M&A decision gets made (pull from `SMBX_SITE_COPY_V11_1.md` or `METHODOLOGY_V17.md`)
4. **Pricing / tier** — surface the Free → Pro ladder (read pricing from `SMBX_PRICING_HOOK_RETENTION_STRATEGY.md`)
5. **Recruit** — broker / searcher / advisor invitation, "Talk to Yulia" CTA

### Voice rules (non-negotiable)

- "Talk to Yulia" — never "Contact Sales"
- "ValueLens" — never "Bizestimate" (the old name is dead)
- Yulia never says "As an AI"
- Editorial / restrained / operator-to-operator. Not "AI helper friendly." Closer to a *WSJ* deal column than a SaaS landing page.
- Never invent financial numbers — illustrative figures must be flagged as such or pulled from approved copy.

### Format

- Figma file with all 10 posts × 5 sizes, organized by track (Desktop / Mobile) then archetype
- Exported PNG (1×) and JPEG (q90) per size
- A README in the Figma cover page listing every token used and its repo source

---

## 8. Reading order for a fresh start

If you are picking this up cold, read in this order:

1. This file
2. `CLAUDE.md` (skim — platform identity, critical rules)
3. `client/src/index.css` lines 235–600 (the actual current tokens)
4. `client/src/components/claude_design/mobile_pics/` (live shipped mobile)
5. `design_handoff_smbx_desktop_material/V6 Files Workspace.html` and `design_handoff_smbx_app store/Mobile iOS.html` (your prior drops)
6. `STYLE_GUIDE.md`, `DESIGN_LANGUAGE.md`, `SMBX_SITE_COPY_V11_1.md` (voice and approved copy)
7. `SMBX_PRICING_HOOK_RETENTION_STRATEGY.md` (current pricing — overrides any older mention)

Questions, missing assets, or token ambiguities → flag in PR before designing, not after.
