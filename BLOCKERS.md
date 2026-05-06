# BLOCKERS — Autonomous Run 2026-05-06

Things found during autonomous Phase 1-2 execution that **definitely need to be fixed** but couldn't be resolved without input or that exceed the batch's scope. Review on return.

Format: one entry per blocker. Most-recent first.

---

## B-04 · Live chat verification blocked: `ANTHROPIC_API_KEY is not set`

**Where:** `server/routes/chat.ts:100` `getAnthropicClient()` throws on every chat request.
**Impact on the autonomous run:** I can't trigger a real Yulia conversation in the local preview to verify Phase 1 batches end-to-end. Every chat batch (B1.2, B1.3, B1.4, future) is verified by:
1. TypeScript contract (`npx tsc --noEmit -p server` passes)
2. Code-path read (confirm import + call site + return shape match)
3. Client-side simulation of the event payload — already used to verify B1.1, B1.2.
**What to do on return:** Set `ANTHROPIC_API_KEY` in the local `.env` and run a real cold-start BUY scenario through chat. If contracts hold, no further work needed.
**Severity:** MEDIUM — blocks live verification only. Committed code is type-checked + contract-verified.
**Discovered:** 2026-05-06, during B1.3 verification.

---

## B-03 · Gate-completion deliverables that need Claude (VRR, Thesis) will fail without ANTHROPIC_API_KEY

**Where:** `server/services/gateCompletionDeliverables.ts` (new in B1.3).
**Impact:** With no key, the off-thread generator catches and writes status='failed' on the deliverables row. SSE event still fires with `completionDeliverableId`, V6 placeholder tab opens, content never lands. Once the key is set, all three completion deliverables work — SDE Analysis is pure JS and works without a key; VRR + Thesis call Claude.
**What to do:** Same as B-04 — set `ANTHROPIC_API_KEY`. No code change needed.
**Severity:** LOW — degraded path is well-behaved (status='failed' is a terminal state, not a hang).
**Discovered:** 2026-05-06.

---

## B-02 · Pre-existing migration + schema drift on backend startup (HIGHEST RISK on chat-key restore)

**Where:** Backend startup logs.
**Symptoms (verbatim):**
- `[migrations] Failed: 006_menu_items_and_wallets.sql — column "user_id" does not exist`
- `[migrations] Failed: 024_improvement_actions.sql — relation "idx_improvement_actions_profile" already exists`
- `[migrations] Failed: 025_naics_benchmarks.sql — syntax error at or near "("`
- `Conversation GC error: column c.is_general does not exist`
- `[migrations] Failed: 056_conversation_cleanup.sql — update or delete on table "conversations" violates foreign key constraint`
**Impact:** Most are idempotency/drift — nothing crashes. **But `is_general` will block every cold-start `create_deal`** the moment chat works again, because `tools.ts:461` does `UPDATE conversations SET deal_id=…, is_general=false WHERE id=…`. Postgres will throw "column is_general does not exist" → tool returns error → Yulia can't create a deal at all.
**What to do on return — DO THIS BEFORE ENABLING CHAT:**
1. Add a small migration: `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_general BOOLEAN DEFAULT false;`
2. Audit the other failures for harmless-vs-real (most look harmless on inspection — the IF NOT EXISTS guards aren't perfectly applied).
**Severity:** HIGH (post-key-restore). Currently latent because chat doesn't work without the key.
**Discovered:** 2026-05-06, during B1.3 verification.

---

## B-01 · Mobile DetailScreen ErrorBoundary trips on stale Vite HMR snapshots

**Where:** `client/src/components/v6/mobile/screens/Detail.tsx`
**Symptom:** Browser console shows repeated `ReferenceError: VERDICT_BG is not defined` (line 93) and `ReferenceError: MarketTile is not defined` (line 353), each triggering ErrorBoundary. Errors come from old Vite HMR-cache file versions (URL params `?t=1778032559468` and `?t=1778032931165`).
**Diagnosis:** The current file (781 lines) HAS both refs defined — `VERDICT_BG` at line 32, `MarketTile` at line 265. So the runtime errors are from stale cached module versions, not the live source. Hard reload should clear them, but the fact that the cache produced 24+ ErrorBoundary trips during a single dev session means HMR retained broken intermediate states across edits.
**What to do:** Confirm with a hard reload that the live mobile route renders cleanly. If not, the file likely had refactor churn during the recent commits (ed2526c, fd1c6b4) and a clean ESM export trace is needed. Either way: clear `node_modules/.vite/` cache between edits to this file.
**Severity:** MEDIUM — production bundle is fine (Vite cache only affects dev). But mobile dev experience is broken.
**Discovered:** 2026-05-06, during Batch 1.1 verification.
