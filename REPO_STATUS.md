# REPO_STATUS.md — what's current, what's stale

**Last updated: 2026-05-23.**

This file is a stable reading-order map for anyone (human or AI) reviewing this repo on GitHub or as a fresh clone. Read this **first** after `CLAUDE.md`.

The short version: production runs on `main`. V6 is live. V19 is the current methodology/runtime baseline, **DEFINITIVE v1.0** is the current agent-access/spec/runtime pin, and **DEFINITIVE v1.1 / V20** is the expanded deal-mechanics catalog and gate-routing target. Week 1 V19 foundation work started in migration `067_v19_foundation.sql`, `server/constants/v19Regulatory.ts`, and `server/constants/v19Leagues.ts`; DEFINITIVE rolls that work forward into Authority Register, MCP/API, beneficial-customer identity, mandate-chain audit, conformance, THE LINE contracts, and the v1.1 123-model / 30-gate deal-mechanics catalog plus route map. `compose_model_stack` now exposes applicable mechanics, readiness, tool surfaces, and THE LINE boundaries for Yulia/agents by deal profile. The public pass-through substrate catalog and discovery surface are exposed through `/.well-known/definitive.json`, `/.well-known/mcp`, `/.well-known/mcp/server-card.json`, `/api/definitive/spec`, `/api/definitive/pass-through-catalog`, and the agent card with per-call pricing posture, fixed-margin policy, source type, dependent model slots, and no-referral/no-success-fee boundaries. The new terminal substrate architecture plan is code-addressable at `definitive://v1.1/substrate-architecture` and exposed through `/api/definitive/substrate-architecture`, the spec manifest, and the agent card; it defines the next spine around the 123-model corpus: DealPayload ingest, eight-axis classification, persistent DealState, dependency graph/action cache, completeness/DRL, permutation/best-vehicle, signed portable package, capability discovery, next-call hints, and the Deal OS no-rejection lifecycle for agents entering at intake, IOI, LOI, diligence, modeling, negotiation prep, close, or PMI with incomplete information. It also now exposes Deal OS work surfaces and portable handoff artifacts so agents can manage Today, Pipeline, Files, Data Room, Studio, Models, and Audit Package work just like a person and take state diffs, source indexes, data-room indexes, document drafts, model outputs, audit packets, and packages back to their own systems after each iteration. The substrate architecture now also names the agent-discoverability stack: canonical MCP registry, third-party directories, well-known server-card discovery, client app stores, enterprise allow-list registries, query-aligned tool metadata, structured output schemas, The Diligence Standard publication doctrine, and THE LINE regulatory-neutrality metadata. The spec and agent card also expose per-surface mechanics summaries for Today, Pipeline, Files, and Studio, including executable counts, pass-through dependencies, professional-handoff counts, research-only counts, visible model slots, and Yulia guidance. The conformance harness has 472 DB-free cases: 202 model-runtime cases, 60 deal-mechanics route cases, 104 prompt/meta cases, 30 route-trigger cases, 33 model-stack cases, and 43 Deal OS artifact cases covering lifecycle trace, IOI, LOI, data room, diligence request, disclosure subset, document draft, negotiation brief, close readiness, funds flow, PMI, package take-back, package verification/finalization/reopen, partial ingest/update/diff/clone, package mismatch detection, close/funds-flow blocker behavior, permutation/best-vehicle behavior, MCP server-card/well-known discovery, enterprise allow-list templates, and the resume/lifecycle/data-room/Studio/close/PMI iterative agent loop. Authority Register staged ingestion now reaches 233 active seed rows, with batch 5 adding bankruptcy procedure depth, cramdown/1111(b) case-law anchors, deferred-payment and FIRPTA form anchors, REIT sections, and UCC Article 9 liquidation/lien mechanics. The TypeScript and Python reference implementations have started at `reference/definitive-ts` and `reference/definitive-python` with cloneable, DB-free pure functions for M109, M139, M199, and M206; `npm run test:definitive-reference` and `npm run test:definitive-reference-python` run the shared 4-case fixture set with sample-only authority refs, spec/methodology pins, input/output hashes, and THE LINE boundaries. The first v1.1 executable mechanics slices are live for 1060 allocation, FIRPTA withholding, 1031 timing, sale-leaseback/ASC 842, REIT compliance, rent-roll normalization, CAM true-up, RE-heavy asset/entity election, RE/operating-business bifurcation, NOI/cap-rate bridge, lease abstraction, property escrow/holdback sizing, title/survey checklist, PCA reserve modeling, FIRPTA v1.1, CITT transfer tax, OpCo/PropCo separation, ground lease mechanics, convertible/SAFE conversion, venture-debt warrant coverage, ABL borrowing base, make-whole/call protection, covenant baskets, 280G, 382 NOL limitation, connected transaction tax, SALT transaction tax, indemnity ladder, survival periods, escrow/holdback sizing, RWI stack architecture, closing true-up, conditions logic, termination-fee economics, earnout architecture, IP chain-of-title, IP lien search, IP representation set, license dependency mapping, IP carve-out/license-back, source-code escrow, employee IP assignment verification, OSS exposure process, IP-specific 1060 allocation, domain/trademark transfer mechanics, three-prong solvency, 363 sale mechanics, plan feasibility, best-interests-of-creditors, APR/new-value, cramdown-rate, 1111(b) election, Chapter 7 waterfall, DIP sizing, exchange-offer mechanics, fulcrum security, RSA economics, ABC/Article 9 liquidation, claims trading, Subchapter V eligibility, Chapter 22 recidivism, LP-secondary/ECI withholding, strip-sale pricing, and NAV facility LTV. Research-only runtime scaffolds are also live for §355, LME uptier/drop-down/double-dip, project-finance coverage, token taxonomy, stablecoin PPS, and digital-asset reporting while the route map still keeps those mechanics research-only. Runtime tax/legal prompt distillations are still V18-era until the V19/DEFINITIVE prompt migration lands.

---

## ✅ Current — read these as authoritative

### Architecture & operating instructions
- `CLAUDE.md` — project instructions (canonical entry point)
- `methodology/V19_BUILD_PLAN.md` — current build state and sequencing
- `BUILD_STATUS.md` — May 3 pre-V19 audit; historical baseline, not the active V19 build list
- `V6_WIRING_LOG.md`, `V6_MOBILE_WIRING_LOG.md` — what V6 wiring landed and where

### Methodology and agent substrate (V19 baseline -> DEFINITIVE target)
- `methodology/DEFINITIVE_BUILD_PLAN.md` — current agent-access/spec/substrate build plan; read this first for new MCP/API/agent work
- `methodology/DEFINITIVE_V1_1_DEAL_MECHANICS.md` — V20 deal-mechanics expansion: 123 model slots, G28-G30, 800+ Authority Register target, THE LINE categories, route map, and pass-through substrate rule
- `methodology/METHODOLOGY_V19.md` — V19 methodology master
- `methodology/CC_V19_IMPLEMENTATION_BRIEF.md` — V19 runtime implementation brief
- `methodology/V19_BUILD_PLAN.md` — V19 baseline/status map and sequencing; new agent-access work maps to DEFINITIVE

### Yulia (AI) reference set
- `YULIA_PROMPTS_V3.md` — current shipped system prompts until V19 prompt migration lands
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
- `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md` (May 3, 2026) — V19 monthly subscription model: Free / $79 Solo / $199 Pro / $499 Team / $2,500+ Enterprise

### Process
- `TESTING.md` — testing tracker

### Code (always authoritative — read code over docs when they disagree)
- `client/src/components/v6/V6App.tsx` — current app shell / catch-all workspace
- `server/migrations/067_v19_foundation.sql` — V19 schema and citation seed
- `server/constants/v19Regulatory.ts`, `server/constants/v19Leagues.ts` — V19 constants foundation
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
| `METHODOLOGY_V17.md` | V17/V18 virtual master base | `methodology/METHODOLOGY_V19.md` |
| `METHODOLOGY_V18a_TAX_AMENDMENT.md` | V18 tax amendment | `methodology/METHODOLOGY_V19.md` + `server/constants/v19Regulatory.ts` |
| `METHODOLOGY_V18b_LEGAL_AMENDMENT.md` | V18 legal amendment | `methodology/METHODOLOGY_V19.md` |

---

## How to tell if a doc has gone stale

1. **Does it predate V6 (May 2026) and talk about the design system or marketing surface?** → Probably stale. V6 redesigned both desktop and mobile.
2. **Does it talk about pricing without mentioning monthly subscriptions (Free / $79 Solo / $199 Pro / $499 Team / $2,500+ Enterprise)?** → Stale. The wallet model is dead; do not recreate.
3. **Does it treat Methodology V17/V18 as the current build target?** -> Stale. V19 is the methodology baseline; DEFINITIVE v1.0 is the active agent-access/spec target. V18 tax/legal runtime remains only as shipped implementation until migration.
4. **Does it use Cowork DL (warm cream + clay), V4 hot pink `#D44A78`, or V3 indigo+emerald palettes?** → Stale design language.

When in doubt, trust **code on `main`** over **docs**. The build is the source of truth.
