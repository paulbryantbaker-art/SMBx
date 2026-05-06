# _TRAVEL_LOG.md — Autonomous Run

**Started:** 2026-05-06
**Branch:** `claude/peaceful-diffie-c0502e`
**Worktree:** `.claude/worktrees/peaceful-diffie-c0502e`
**Restore point tag:** `restore/pre-autonomous-2026-05-06` (pushed to origin)

## Operating rules (locked in by user)

1. **Commit but DO NOT push.** Push happens together with the user on return.
2. **Chat-first architecture (load-bearing).** See `feedback_chat_first_yulia_conduit.md` in memory. Tools are primary, buttons are shortcuts. Don't design buttons for every workflow action — Yulia drives the deal via chat, the Canvas displays results.
3. **"Recommended Next" is the chat-first secondary surface.** See `feedback_recommended_next_pattern.md`. Context-aware shortcuts to actions Yulia would otherwise drive — NOT the same as buttons-everywhere. Surfaces on Deal Detail and Today (authed).
4. **Design language:** Mobile = App Store + Liquid Glass v2 (`--mb-*` tokens, periwinkle `#8A9AE8`). Desktop = App Store + Material 3 (`--m-*` tokens, slate-blue `#2E5C8A`).
5. **Strict design discipline.** Before any UI batch: invoke `Skill: load-design-skills`. After compaction: re-invoke if dropped.
6. **Blockers go to `BLOCKERS.md`.** Continue past them. If a blocker stops the rest of a phase, move to the next phase.
7. **No silent failures on API-key-blocked work.** Build the path; surface a visible "needs API key" message at the failing point.

## Phases (revised 2026-05-06 to integrate user clarifications)

### Phase 1 — Make Yulia visible
- B1.1 ✓ Expand canvas_action listener + TabKind union (e082919)
- B1.2 — create_deal returns canvas_action
- B1.3 — Authed gate-advance fires completion deliverable
- B1.4 — Gate-advance UI feedback in chat
- B1.5 — Empty-state on home + real ⌘K search
- B1.6 — Gate progress strip in chat
- B1.7 — Wire mode roots (Docs/Analysis/Intel/Library) to real APIs

### Phase 1.5 — Mobile information architecture (NEW)
Per user guidance 2026-05-06:
- B1.8 — Add **Library** tab to mobile TabBar (4 tabs total). Library renders three tiers: Editing → Data Room → Security (locked/approved). Backend lifecycle exists per CLAUDE.md.
- B1.9 — Reframe **Brief → Search**. Mobile's Brief tab becomes a Search/Lookup surface: search across deals/docs/people, internal team comms, "find an attorney" directory. Keeps team comms OUT of chat so Yulia chat stays clean.
- B1.10 — **Today (authed) re-cast.** Replace the logged-out "Explorer" card with a personal action queue: "10 things you need to look at right now about your deals" — mix of gate-stalled deals, expiring NDAs, unanswered shares, sourcing candidates that just landed.

### Phase 2 — BUY end-to-end + portfolio + Recommended Next
- B2.0 — **"Recommended Next" surface** on Deal Detail (mobile + desktop). Context-aware shortcuts driven by gate state. Tap → Yulia executes the action. Per memory `feedback_recommended_next_pattern.md`.
- B2.1 — UX-09 + UX-10: model tabs + commit_valuation. Mount ValuationExplorer.tsx for kind:"model".
- B2.2 — UX-06 + UX-07: sourcing tool + panel. Mount orphan SourcingPanel.tsx for kind:"sourcing", restyle V6.
- B2.3 — UX-08: promote-target-to-deal tool.
- B2.4 — UX-15: record_dd_complete tool.
- B2.5 — UX-17 + UX-18: record_loi_executed + record_financing_secured.
- B2.6 — UX-19 + UX-20: close_deal + closing ceremony.
- B2.7 — UX-11 + UX-12: paid-deliverable trigger + progress UI.
- B2.8 — **Portfolio rollup** (NEW): on desktop SearchRoot top, weighted-pipeline aggregation (count by gate, weighted EV, expected close window). On mobile Pipeline screen header, same. Reads from `deals` + `seven_factor_composite`.
- B2.9 — **Model comparison surface** (NEW): extend ComparisonModel for BUY-side 3-deal comparisons. New tool `compare_deals(dealIds[])` returns `canvas_action: 'create_model_tab', modelType: 'comparison', dealIds: [...]`.

### Phase 3 — SELL end-to-end (UX-22–30)
- Unchanged from original plan. The mobile Library tab from B1.8 becomes the data-room surface SELL needs.

### Phase 4 — RAISE + cross-cutting
- Unchanged. Notifications, reminders, team invites, paywall hints.

### Phase 4.5 — Merger Lite (NEW, slotted 2026-05-06)
~5 days. Gives the merger journey a working spine without the §368 depth.
- B4.5.1 — DB migration: `parent_deal_id`, `merger_pairings` table, `journey_type` enum gets `'merger'`.
- B4.5.2 — `create_deal` accepts `journeyType: 'merger'`. New `pair_merger_deals(dealAId, dealBId, structure, exchangeRatio, surviving)` tool.
- B4.5.3 — `loiGenerator` `deal_structure` enum extended (forward triangular, reverse triangular, share exchange, MOE) + merger-specific section templates (exchange ratio, treatment of fractional shares, board composition, surviving entity).
- B4.5.4 — `cimGenerator` carve-out detection branch (`financials.is_carve_out===true` adds TSA + separation cost narrative + allocated overhead schedule).

### Phase 5 — Merger Pro
~10 days. Adds analytical depth.
- B5.1 — `MergerExchangeModel` interactive surface (pre-merger valuations, exchange ratio, surviving entity → combined cap table, post-merger ownership %, §368 compliance check).
- B5.2 — `taxImpactAnalysis.ts` §368 reorg branch (§368(a)(1)(A)-(G), continuity-of-interest, continuity-of-business-enterprise, business-purpose tests, F-reorg).
- B5.3 — HSR checklist generator (15 USC §18a thresholds; size-of-transaction + size-of-person tests).
- B5.4 — `spawn_carve_out` tool + `DealLineage` family-tree view.

### Phase 6 — Merger Governance (likely DEFERRED until customer-driven)
- Board resolution generator, proxy materials, `governance_actions` table, vote tracking. Big lift; edge-case demand.

## Locked defaults (no questions outstanding)

User left 2026-05-06; not waiting on answers. Defaults locked:

- **Merger Lite slotted as Phase 4.5.** Merger Pro = Phase 5. Governance = Phase 6 (deferred until customer ask).
- **Search tab = 6 discovery cards + side-chat at bottom.** See `architecture_search_tab_spec.md`. Categories: Find business opportunities · Find buyers · Find service providers · Find financing · Understand structures · Find deal-team specialists.
- **Today (authed) action queue = 3-8 dynamic items.** No fixed cap.
- **Recommended Next tap = auto-execute** (Yulia runs the action; chat-thread receipt confirms).
- **Portfolio overview card** = below Yulia brief on home (desktop), Pipeline header (mobile). Weighted EV + deals by gate + expected close window. Aggregations only.

## Batches log

Format: `BATCH ID — title — status (committed sha if landed) — notes`

---

### Phase 1

- **B1.1** ✓ Expand canvas_action listener + TabKind union — committed `e082919`. Verified: `create_model_tab` / `open_sourcing` / `open_deliverable` open tabs with chat-first PendingSurface card; `open_pipeline` switches mode. Screenshot taken.

- **B1.2** in progress
