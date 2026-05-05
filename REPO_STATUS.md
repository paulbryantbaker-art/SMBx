# REPO_STATUS.md — what's current, what's stale

**Last updated: 2026-05-05.**

This file is a stable reading-order map for anyone (human or AI) reviewing this repo on GitHub or as a fresh clone. Read this **first** after `CLAUDE.md`.

The short version: production runs on `main`. Production is current as long as **Yulia Prompts V3** + **Methodology V18a (tax)** + **Methodology V18b (legal)** + the **V6 design handoff bundles** are wired in, and they are.

---

## ✅ Current — read these as authoritative

### Architecture & operating instructions
- `CLAUDE.md` — project instructions (canonical entry point)
- `BUILD_STATUS.md` — current build state
- `V6_WIRING_LOG.md`, `V6_MOBILE_WIRING_LOG.md` — what V6 wiring landed and where

### Methodology (virtual V18 master)
- `METHODOLOGY_V17.md` — base (§1–§8, §11–§15 still live)
- `METHODOLOGY_V18a_TAX_AMENDMENT.md` — replaces §9 (post-OBBBA tax engine)
- `METHODOLOGY_V18b_LEGAL_AMENDMENT.md` — replaces §10 (Harvard Law–grade U.S. M&A)

### Yulia (AI) reference set
- `YULIA_PROMPTS_V3.md` — system prompts (V3 is the current rev)
- `YULIA_INDUSTRY_INTELLIGENCE.md`, `YULIA_INDUSTRY_PROFILES.md`, `YULIA_NEGOTIATION_PLAYBOOK.md`, `YULIA_VALUATION_MASTERY.md` — stable knowledge bases (domain content, not era-specific)

### Design system — V6 (May 2026)
- `DESIGN_SOURCE.md` — file-by-file map: handoff bundles → production code
- `DESIGN_TOKENS.md` — token reference (auto-generated from `client/src/index.css`)
- `design_handoff_smbx_desktop_material/` — V6 desktop bundle (slate-blue `#2E5C8A`, lavender chrome `#ECEAF2`, App Store + Material 3)
- `design_handoff_smbx_app store/` — V6 mobile bundle (periwinkle `#8A9AE8`, watercolor textures, App Store + Liquid Glass v2)
- `STYLE_GUIDE.md` — brand & UI style guide for marketing materials
- `CLAUDE_DESIGN_SOCIAL_BRIEF.md` — social marketing brief (V6-aware, May 2026)

### Strategy & positioning (current)
- `SMBX_FEATURE_AUDIENCE_VALUE_MATRIX.md` (May 3, 2026)
- `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md` (May 3, 2026) — current Free / $49 / $149 / $999 monthly subscription model

### Process
- `TESTING.md` — testing tracker

### Code (always authoritative — read code over docs when they disagree)
- `client/src/pages/public/AppShell.tsx` — THE layout
- `server/index.ts` — Express entry + auto-migrations
- `server/prompts/taxEngine.ts` — V18a runtime distillation
- `server/prompts/legalEngine.ts` — V18b runtime distillation
- See `CLAUDE.md` "Key File Map" for the full table

---

## 🗄️ Archived — kept for history, do NOT build against

Archived files live in `docs/_archive/`. Each archived markdown also carries an in-file banner. See `docs/_archive/README.md` for the full timeline.

| File | Era | Superseded by |
|---|---|---|
| `BACKUP.txt` | March 2026 | n/a — old raw backup |
| `SMBX_PLATFORM_REFERENCE.md` (+ `.pdf`) | Mar 28, 2026 | `CLAUDE.md` + V6 docs + V18a/b |
| `SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md` | Mar 21, 2026 | `CLAUDE.md` + `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md` |
| `SMBX_PRICING_HOOK_RETENTION_STRATEGY.md` | Mar 21, 2026 | `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md` (May 3, 2026) |
| `SMBX_SITE_COPY_V11_1.md` | Mar 15, 2026 | Live source under `journey_v2/` + `canvas_marketing/` |
| `SMBX_CC_MEGA_PROMPT_V3.md` | Mar 24, 2026 | `CLAUDE.md` + V6 architecture |
| `stitch_claudeDl.zip` | Apr 22, 2026 | V6 design handoff bundles |
| `SKILL.md` | Mar 16, 2026 | Generic skill template — not project content |
| `Building M&A Sourcing on a Bootstrapped Budget.pdf` | Mar 25, 2026 | Reading material, not project source |
| (earlier design eras) | various | See `docs/_archive/README.md` |

---

## How to tell if a doc has gone stale

1. **Does it predate V6 (May 2026) and talk about the design system or marketing surface?** → Probably stale. V6 redesigned both desktop and mobile.
2. **Does it talk about pricing without mentioning monthly subscriptions (Free / $49 / $149 / $999)?** → Stale. The wallet model is dead; do not recreate.
3. **Does it reference Methodology V17 §9 (tax) or §10 (legal) without the V18a/V18b amendments?** → Stale on those sections.
4. **Does it use Cowork DL (warm cream + clay), V4 hot pink `#D44A78`, or V3 indigo+emerald palettes?** → Stale design language.

When in doubt, trust **code on `main`** over **docs**. The build is the source of truth.
