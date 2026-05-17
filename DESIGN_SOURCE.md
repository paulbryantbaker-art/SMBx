# Design Source of Truth

**The V6 design language IS the two handoff bundles delivered by Claude Design (CD):**
- `design_handoff_smbx_desktop_material/` — desktop V6 (Files Workspace, Material 3, slate-blue)
- `design_handoff_smbx_app store/` — mobile V6 (App Store + Liquid Glass, periwinkle)

For a practical usage guide to current production surfaces — which cards are white, textured, art-house, accented, or Liquid Glass — read `docs/V6_DESIGN_LANGUAGE_REVIEW.md`.

**Production faithfully implements them.** Tokens, component structure, and visual language all match the bundles 1:1, with one documented mobile deviation (watercolor texture heroes replaced CD's pastel gradients). When in doubt, the running app at `npm run dev` is the tiebreaker.

This file is the implementation map: where each handoff lives in the codebase, what's identical, and what diverged.

---

## Implementation map

### Desktop V6 — `design_handoff_smbx_desktop_material/`

**Status: 1:1 with production. No deviations.**

| Handoff file | Production path |
|---|---|
| `v6-styles.css` `:root` block (34 `--m-*` tokens) | `client/src/index.css` `:root` lines 184–232 — same 34 tokens, same values |
| `v6-shell.jsx` | `client/src/components/v6/V6App.tsx` (mounted by `client/src/App.tsx:74`) |
| `v6-canvas.jsx` | `client/src/components/v6/Canvas.tsx` |
| `v6-modes.jsx` | `client/src/components/v6/modes/` (SearchRoot, DocsRoot, AnalysisRoot, IntelRoot, LibraryRoot) |
| `v6-views.jsx` | `client/src/components/v6/Sidebar.tsx`, `Chat.tsx`, related |
| `v6-learn.jsx` | `client/src/components/v6/Learn.tsx` |
| `V6 Files Workspace.html` | The composed live UI at `/` (desktop viewport) |

### Mobile V6 — `design_handoff_smbx_app store/`

**Status: 1:1 with production except for one documented deviation (watercolor textures).**

| Handoff file | Production path |
|---|---|
| `mobile-styles.css` `:root` block (unprefixed: `--accent`, `--bg`, `--ink`, …) | `client/src/index.css` `.mobile-root` lines 451–513 — same values, renamed with `--mb-*` prefix and scoped to `.mobile-root` to avoid colliding with desktop `--m-*` |
| `mobile-primitives.jsx` | `client/src/components/v6/mobile/V6Mobile.tsx` + sibling primitives |
| `glass-primitives.jsx` | `client/src/components/v6/mobile/glass.tsx`, `VerdictPill.tsx`, `Sparkline.tsx` |
| `ios-frame.jsx` | `client/src/components/v6/mobile/TopBar.tsx`, `TabBar.tsx`, `YIcon.tsx` |
| `screen-today.jsx`, `screen-pipeline.jsx`, `screen-detail.jsx` | `client/src/components/v6/mobile/screens/` |
| `Mobile iOS.html` | The composed live UI at `/` (mobile viewport) |

**Deviation — mobile heroes:**

| In the handoff | In production |
|---|---|
| `--hero-pursue-1: #A8D4BD` … `--hero-pass-2: #C6857D` (pastel two-tone gradients) | `--mb-tex-pursue: url("/textures/texture-pursue.png")` … and 5 sibling textures in `client/public/textures/` |
| Sparkline strokes drawn on cards | Removed from cards |

The pastel gradients were replaced with watercolor PNG washes; sparkline strokes were dropped to quiet the cards. Commits `2a3ecda` and `9c821a1`. **For marketing artwork, use the watercolor PNGs — they're what ships.**

---

## Quick reference for token lookup

`DESIGN_TOKENS.md` at the repo root is a read-only projection of `client/src/index.css`, organized into tables by cluster. Use it as a quick reference.

When tokens change, regenerate it:

```bash
npm run design:extract
```

The generator script lives at `scripts/extract-design-tokens.mjs`. Edit tokens in `client/src/index.css` (`:root` for desktop, `.mobile-root` for mobile) and the corresponding handoff bundle CSS, then regenerate and commit both files together.

---

## Visual ground truth

| Path | What's there |
|---|---|
| `design_handoff_smbx_desktop_material/V6 Files Workspace.html` | CD's pixel-true desktop reference, openable in a browser |
| `design_handoff_smbx_app store/Mobile iOS.html` | CD's pixel-true mobile reference, openable in a browser |
| `client/public/textures/` | The six watercolor PNGs used by mobile heroes (pursue/watch/pass/baseline/buyers/sunrise) |
| `client/src/components/claude_design/mobile_pics/` | 17 iOS reference screenshots (App Store, Apple TV remote, etc.) the maintainer captured from a real iPhone on April 21 and gave to CD as inspiration for V6 mobile's "App Store + Liquid Glass" visual language. **Inspiration material, not shipped smbx screens.** Local only, not committed to git. |

For desktop screenshots of shipped state, run `npm run dev` + `npx tsx server/index.ts` and screenshot the V6 routes yourself.

---

## Voice and copy

| Source | Use for |
|---|---|
| `STYLE_GUIDE.md` voice/copy sections | Brand voice, tone, copy patterns (the visual sections of this doc are stale; ignore them) |
| `SMBX_SITE_COPY_V11_1.md` | Approved marketing copy |
| `SMBX_PRICING_HOOK_RETENTION_STRATEGY.md` | Current pricing ladder |

---

## What's stale (do not anchor on these)

These describe earlier design eras. Root-level briefs have been moved to `docs/_archive/`. Component-tree handoffs are still in place but should not be read as design references.

| File | Era it describes |
|---|---|
| Old `CLAUDE.md` "Design System" sections (in commits before `8d700f4`) | Pre-V3 hot-pink era (`#D44A78`, Sora/Inter, dot grid) — replaced 2026-05-02 with a pointer to this doc |
| `docs/_archive/DESIGN_LANGUAGE.md` | V3/V4 hot-pink redesign (April 2026) — replaced by V6 |
| `STYLE_GUIDE.md` logo + visual sections | References logo files that no longer exist (`G3L.png`, `G3D.png`); only voice/copy sections are still useful |
| `docs/_archive/CLAUDE_DESIGN_BRIEF.md`, `docs/_archive/CLAUDE_DESIGN_BRIEF 2.md` | Cowork-DL era "Edition" brief (warm cream `#F4EEE3` + terra `#D4714E` + Sora + Instrument Serif) — retired 2026-04-29 |
| `docs/_archive/STITCH_BRIEF.md` | Stitch tooling brief — short-lived experiment |
| `new claude design/design_handoff_v22b/` (untracked, local only) | Same Cowork-DL "Edition" era as above (CD's internal `v22b` iteration tag) — superseded by V6 |
| `client/src/components/claude_design/design_handoff_v3/` | V3 era CD work — superseded; left in place because it has not been verified as safe to remove from the component tree |
| `client/src/components/claude_design/design_handoff_v4_home/` | V4 era CD work — same caveat |
| `client/src/components/app_v4/tokens.css` | V4 era token file — V6 tokens are in `client/src/index.css`, not here |

> **Heads-up on version numbers:** CD's internal iteration tags (v17, v22, v22b…) are NOT chronological with the project's V-series (V3 → V4 → V6). v22b is *older* than V6 by date, despite the larger number. CD numbers within a single delivery; the project numbers across rewrites.

---

## The rule for every agent reading this repo

1. Read this file (`DESIGN_SOURCE.md`) — implementation map.
2. Open the relevant handoff bundle (`design_handoff_smbx_desktop_material/` or `design_handoff_smbx_app store/`) — that's the canonical V6 design.
3. Cross-reference `DESIGN_TOKENS.md` for the production token values.
4. Open the component path in `client/src/components/v6/` for the surface you're touching.
5. **If your output has hot pink (`#D44A78`) or warm cream (`#F4EEE3`) or terra (`#D4714E`), you read a stale doc. Stop and re-read step 1.**

---

## When the design changes

If CD ships a new V7 (or any new design):

1. The new handoff bundle becomes the canonical source.
2. Implementation in `client/src/components/v6/` (or a new `v7/`) and `client/src/index.css` is updated to match.
3. `npm run design:extract` regenerates `DESIGN_TOKENS.md`.
4. This file (`DESIGN_SOURCE.md`) is updated to swap the implementation map.
5. The old V6 bundle and component tree get the same SUPERSEDED treatment as the V3/V4/Cowork eras above.

If V6 itself is iterated (a small CSS or component edit):

1. Edit both the handoff bundle CSS and `client/src/index.css` so they stay in lockstep.
2. Run `npm run design:extract`.
3. Commit all three (handoff CSS, `index.css`, regenerated `DESIGN_TOKENS.md`) together.
