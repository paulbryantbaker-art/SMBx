# Design Source of Truth

**The design system is the production code.** Docs describe; code decides. If a doc and the code disagree, the code is right and the doc is stale — open a PR to fix the doc.

This file tells you where to look. Read it first, every time.

---

## Where the design lives (in priority order)

### 1. Tokens — `client/src/index.css`
The two V6 systems are defined as scoped CSS custom properties:

| System | Selector | Lines | Hex examples |
|---|---|---|---|
| **Desktop V6** (Files Workspace) | `:root` (V6 block, after the `V6 — Files Workspace` banner) | ~184–232 | `--m-primary: #2E5C8A` (slate-blue), `--m-surface-1: #ECEAF2` (lavender chrome) |
| **Mobile V6** (App Store + Liquid Glass) | `.mobile-root` (after the `V6 MOBILE` banner) | ~451–513 | `--mb-accent: #8A9AE8` (periwinkle), `--mb-tex-pursue: url("/textures/texture-pursue.png")` |

When tokens change, regenerate the projection:
```bash
npm run design:extract
```

This rewrites **`DESIGN_TOKENS.md`** at the repo root — a read-only mirror of the CSS, organized into tables by cluster. Use that doc for quick lookup; never edit it by hand.

### 2. Components — `client/src/components/v6/`
Component code IS the component documentation. There is no separate component reference doc.

| Path | What's there |
|---|---|
| `client/src/components/v6/` | Desktop V6: Files Workspace shell, sidebar, canvas, modes (Search/Docs/Analysis/Intel/Library), Learn doc |
| `client/src/components/v6/mobile/` | Mobile V6: TabBar, TopBar, ChatSheet, screens (Today/Pipeline/Brief/Detail), Liquid Glass primitives |

To understand how a token is used, grep the component tree:
```bash
grep -rn "var(--mb-accent)" client/src/components/v6/mobile/
```

### 3. Visual ground truth — committed screenshots
Tokens describe colors; screenshots describe *feel*. When in doubt, look at the shipped UI.

| Path | What's there |
|---|---|
| `client/src/components/claude_design/mobile_pics/` | 17 live shipped mobile screens (`IMG_3497.jpeg` … `IMG_3513.jpeg`) |
| `client/public/textures/` | The six watercolor PNGs used by mobile heroes (pursue/watch/pass/baseline/buyers/sunrise) |
| Desktop screenshots | Not yet committed. Run the dev server (`npm run dev` + `npx tsx server/index.ts`) and screenshot the V6 routes yourself, then drop the PNGs into a fresh `_design/screens/desktop/` directory if you're building marketing material. |

### 4. Voice and copy — `STYLE_GUIDE.md` (voice section only)
`STYLE_GUIDE.md` is mostly stale on visuals (it describes pre-V6 logo files and the hot-pink era), but the **voice and copy patterns** sections remain the closest thing to a brand voice doc. Treat the rest of it as historical.

For approved marketing copy, read `SMBX_SITE_COPY_V11_1.md`.
For pricing, read `SMBX_PRICING_HOOK_RETENTION_STRATEGY.md`.

---

## What's stale (do not anchor on these)

These files describe earlier design eras. The root-level briefs have been moved to `docs/_archive/`. The component-tree handoffs are still in place but should not be read as design references. Do not build against any of these:

| File | Era it describes |
|---|---|
| `CLAUDE.md` (any old "Design System" section in older commits) | Pre-V3 hot-pink era (`#D44A78`, Sora/Inter, dot grid) — section was replaced 2026-05-02 with a pointer to this doc |
| `docs/_archive/DESIGN_LANGUAGE.md` | V3/V4 hot-pink redesign (April 2026) — replaced by V6 |
| `STYLE_GUIDE.md` logo + visual sections | References logo files that no longer exist (`G3L.png`, `G3D.png`); only the voice/copy sections are still useful |
| `docs/_archive/CLAUDE_DESIGN_BRIEF.md`, `docs/_archive/CLAUDE_DESIGN_BRIEF 2.md` | Cowork-DL era brief (warm cream + clay) — retired 2026-04-29 |
| `docs/_archive/STITCH_BRIEF.md` | Stitch tooling brief — short-lived experiment |
| `client/src/components/claude_design/design_handoff_v3/` | V3 era CD work — superseded; left in place because it has not been verified as safe to remove from the component tree |
| `client/src/components/claude_design/design_handoff_v4_home/` | V4 era CD work — same caveat |
| `client/src/components/app_v4/tokens.css` | V4 era token file — V6 tokens are in `client/src/index.css`, not here |

---

## The rule for every agent reading this repo

1. Read this file (`DESIGN_SOURCE.md`).
2. Read `DESIGN_TOKENS.md` for current token values.
3. Open the component path in `client/src/components/v6/` for the surface you're touching.
4. Look at the screenshots in `client/src/components/claude_design/mobile_pics/` for mobile feel.
5. **If your output has hot pink (`#D44A78`) anywhere, you read a stale doc. Stop and re-read step 1.**

---

## When tokens change

1. Edit `client/src/index.css` (`:root` for desktop, `.mobile-root` for mobile).
2. Run `npm run design:extract` to regenerate `DESIGN_TOKENS.md`.
3. Commit both files in the same commit so the projection never lags the source.

When components change in a way that changes the visual feel (not just refactors), commit a fresh screenshot under `client/src/components/claude_design/mobile_pics/` (mobile) or a `_design/screens/desktop/` directory (desktop, when you create one).
