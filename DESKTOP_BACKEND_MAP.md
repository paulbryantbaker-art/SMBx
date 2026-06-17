# Desktop Backend Map & Build Plan

Last updated: 2026-06-17
Companion to `DESKTOP_REBUILD_BRIEF.md` (the hard rules). This doc is the
surface-by-surface map of the CD desktop spec (`smbx Desktop.dc.html`) against
the REAL backend, the two locked product decisions, and the build order.

> Method: six read-only backend investigations diffed the CD spec's implied
> data contracts (§3 of the CD brief) against the actual DB schema, services,
> and routes. Headline: **most of the spec is already real backend** — desktop
> is buildable on existing endpoints, NOT a parallel data world. Build it
> surface-by-surface on what's listed under "Real" below; treat "Gap" items as
> explicit, scoped backend work.

## Locked decisions (2026-06-17)

1. **Yulia placement — HYBRID.** Desktop home is a dashboard (matching how the
   working mobile app behaves), but with a **prominent persistent composer** so
   Yulia is always one keystroke away — not a collapsed right dock, and not
   chat-as-homepage. The shell = top nav + main content + an ever-present
   composer that expands into the conversation.
2. **Value-creation / "Integration" — NATIVE PMI, honest-empty captured.** Build
   on the existing `pmi_value_capture_plans / pmi_workstreams /
   pmi_value_capture_milestones` tables. **No Asana sync.** "Value captured"
   renders an honest "—" until a real finance/GL connector exists (Critical
   Rule #10 — never fabricate captured $). Drop the spec's `tool / synced /
   synTarget / synCaptured / synPct` fields from the Integration entity.

## Surface-by-surface backend map

Legend: ✅ Real & wired · 🟡 Exists, needs a thin route/read · 🔴 Genuine backend gap

### Today (home)
- ✅ Greeting/needs counts, lead deal, pipeline ledger, next-actions, market read —
  all from `/api/user/next-actions`, `/api/agency/today-operating-brief`,
  `/api/agency/deals/:id/brief`, `useV6WorkspaceData`.
- Note: operating-brief gate-countdown is only populated once a deal has a
  persisted DEFINITIVE DealState (written on agent tool calls). Deterministic
  next-actions work without agent activity — lead with those.

### Pipeline
- ✅ Stage chips + counts, KPI strip, ledger table (deal, stage, ask, fit,
  verdict). Fit = `seven_factor_composite`; verdict computed in the brief.
- Gates: real registry — BUY = B0 Thesis → B5 Closing (`shared/gateRegistry.ts`).
  Current gate is a string code (e.g. "B2"); map to index via `GATE_MAP`.

### Sourcing
- ✅ 5-stage engine, Google Places, candidate table, thesis CRUD
  (`/api/sourcing/theses`), screening-run counts (total + tier counts).
- 🔴 Per-candidate **EBITDA** (only revenue is scraped → EBITDA-positive filter
  can't be enforced).
- 🔴 Per-candidate **"draft outreach"** generator behind a staged confirm
  (deal-level outreach exists; candidate-level does not). This is the spec's
  signature Sourcing action.
- 🟡 "Ready for outreach" count — computable by query, not pre-aggregated.
- Status enum differs: backend `{new, reviewing, contacted, responded, meeting,
  pursuing, passed, archived}` vs spec `{New, Screening, Qualified, Outreach
  sent, Flagged}` — map at the read layer.

### Studio
- ✅ All 13 catalog analyses have a real compute path (client `core.ts` + server
  `v19ModelRuntime` + `deterministicAnalysisEngine`). 11 canvas model
  components exist. **Model state persists per-deal** (`model_executions`).
  **IRR/synergy honesty enforced in code** (null until a real run).
- 🟡 Catalog grouping (Value/Diligence/Structure) — labels in code, no API
  (client may group). 🟡 Restore-on-load — `listSavedModelExecutions` exists but
  isn't called on mount.

### Integration (value-creation) — NATIVE PMI
- ✅ Plan header, workstreams (title/owner/first_move/status/pct/due), milestones,
  value levers (cost/revenue/operational), `generate_integration_plan` tool,
  RBAC routes (`/api/deals/:id/integration-plan`, `/generate`,
  `/workstreams/:id`). Maps: Initiative→workstream, lever→`value_levers.category`.
- 🔴 No `captured_$` column **by design** → render "—" (honest). No `pmi_risks`
  table → risks are Claude-inferred, render honest-empty or from brief. No
  staff-retention column.

### Files
- ✅ data-room folders/docs, members + ACL (role · full/comment/read · folder
  scope), doc lifecycle (draft→approved→locked), comments, S3 storage,
  deliverable-vs-uploaded split. Provenance: `deliverable_id IS NOT NULL` ⇒
  Yulia-generated.
- 🟡 **External/seller sharing** — `documentShareService` is fully built
  (internal/cross-fence/external, watermark, NDA, expiry); no data-room route
  exposes it yet. The "Shared by (Seller)" badge is in the schema
  (`recipient_side='other_side'`) — just surface it.
- 🔴 **Nested folders** — folders are FLAT (gate-grouped, no `parent_id`).
  Finder-style nesting needs a schema change — OR v1 ships flat + gate groups.
- 🔴 Verdict **tags** on files (pursue/watch/pass across sources) — no tags table.
- 🔴 Personal **my-files / my-analysis / recents** namespace — deliverables are
  deal-scoped; no personal-collection endpoint.

### Yulia (hybrid composer + draft/approve)
- ✅ Draft→approve: `agency_staged_actions` + confirm route + governed executor;
  14 tools require confirmation. SSE tool-trace ("current work" live).
  Conversations/messages persisted. Notifications + gate_events real.
- 🔴 **Audit schema bug** — `agencyAuditLog` writes ~15 columns migration 061
  never created → silently falls back to a minimal row, so actor/mandate
  provenance ISN'T persisted. Fix regardless of desktop.
- 🔴 No persistent "current work" job table (tool progress is SSE-only — a
  reconnect loses it). 🔴 No unified cross-deal activity feed (fragmented across
  gate_events / notifications / deal_activity_log / deal_messages).

## Recommended build order

**Phase 1 — All-real surfaces (zero backend work).** Shell (hybrid: top nav +
main + persistent composer), Today, Pipeline, Deal Workspace (brief / stage
tracker / financials), Studio (catalog + models + canvas; wire restore-on-load).
Everything reads existing endpoints. This is the bulk of the desktop and it can
ship without touching the backend.

**Phase 2 — Thin backend wires (🟡 → surfaced).** Expose `documentShareService`
via a data-room shares route (the "Shared by Seller" badge); valuation-band
read on the deal; studio catalog grouping. Small, additive.

**Phase 3 — Genuine backend builds (🔴, scoped).** Integration surface on native
PMI (honest-empty captured); structured deal `risks[]`; sourcing candidate
EBITDA + per-candidate draft-outreach with staged confirm; audit-schema fix;
activity-feed unification. **Defer nested folders** (flat + gates likely suffices
for v1) and verdict-tags-on-files unless the design demands them.

## Honesty / THE LINE notes that ride along
- Captured $ (PMI), IRR/synergy (Studio), valuation actuals: honest "—" until a
  real run/connector exists. Never fabricate.
- Outreach, IOI, share, advance-gate: stay behind the existing staged-confirm
  (`agency_staged_actions`). Yulia drafts; the user approves anything
  irreversible.
- Verdict (Pursue/Watch/Pass) is analysis Yulia shows — not a recommendation to
  transact. Keep the framing on the analysis side of THE LINE.
