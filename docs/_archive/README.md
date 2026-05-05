# Archived docs

This folder holds documents that are kept for historical reference only. **Do not build against them.** For what's current, see `REPO_STATUS.md` at the repo root.

The archive covers two categories: superseded **design** eras and superseded **strategy / positioning / build prompts**.

## Design eras (most recent first)

| Era | Dates | Identity | Files |
|---|---|---|---|
| **V6 Files Workspace + V6 Mobile** | 2026-05-01 → present | Slate-blue desktop / periwinkle mobile / watercolor textures | `DESIGN_SOURCE.md`, `DESIGN_TOKENS.md`, `client/src/index.css`, `client/src/components/v6/` (LIVE — not in this archive) |
| **V4 hot-pink redesign** | April 14–15, 2026 | Pink `#D44A78` accent, single-saturated-color discipline, journey-pages-as-document | `DESIGN_LANGUAGE.md` |
| **Cowork DL era** | April 23–28, 2026 | Warm cream + clay accent, Instrument Serif + Figtree, editorial publication aesthetic | `CLAUDE_DESIGN_BRIEF.md`, `CLAUDE_DESIGN_BRIEF 2.md`, `stitch_claudeDl.zip` |
| **Stitch era** | Brief experiment | 3-page marketing front-end via Stitch tooling | `STITCH_BRIEF.md` |

## Strategy, positioning, and build prompts (archived 2026-05-05)

| Doc | Date | Why archived |
|---|---|---|
| `SMBX_PLATFORM_REFERENCE.md` (+ `.pdf`) | Mar 28, 2026 | Pre-V6, pre-V18. Superseded by `CLAUDE.md` + V6 design docs + V18a/V18b methodology amendments. |
| `SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md` | Mar 21, 2026 | Predates current monthly-subscription pricing and Yulia-as-front-door positioning. Superseded by `CLAUDE.md` + `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md`. |
| `SMBX_PRICING_HOOK_RETENTION_STRATEGY.md` | Mar 21, 2026 | Superseded by `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md` (May 3, 2026). |
| `SMBX_SITE_COPY_V11_1.md` | Mar 15, 2026 | Pre-V6 marketing copy. Live source is `journey_v2/` + `canvas_marketing/`. |
| `SMBX_CC_MEGA_PROMPT_V3.md` | Mar 24, 2026 | Pre-V6 build prompt. Architecture has moved on; see `CLAUDE.md`. |
| `BACKUP.txt` | Mar 2, 2026 | Old raw backup. Kept only because it was tracked in git history. |
| `SKILL.md` | Mar 16, 2026 | Generic skill template — not project-specific content. |
| `Building M&A Sourcing on a Bootstrapped Budget.pdf` | Mar 25, 2026 | Background reading, not a project source-of-truth doc. |

## Why these are archived, not deleted

1. Some commit history references concepts in these docs (e.g., "ported from claude_design/...").
2. They show the evolution of the visual system, which is useful when judging future redesigns.
3. They contain decisions and rationale that may be worth revisiting if a comparable problem reappears.

## What you should not do

- **Do not** copy palettes, typography, or component patterns from these docs into new work.
- **Do not** link to them from new docs as if they were authoritative.
- **Do not** restore them to the repo root.

If you need to know what the *current* design system is, read `DESIGN_SOURCE.md` and `DESIGN_TOKENS.md` at the repo root. The code in `client/src/index.css` and `client/src/components/v6/` is the source of truth.
