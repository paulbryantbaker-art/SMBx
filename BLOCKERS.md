# BLOCKERS — Autonomous Run 2026-05-06

Things found during autonomous Phase 1-2 execution that **definitely need to be fixed** but couldn't be resolved without input or that exceed the batch's scope. Review on return.

Format: one entry per blocker. Most-recent first.

---

## B-01 · Mobile DetailScreen ErrorBoundary trips on stale Vite HMR snapshots

**Where:** `client/src/components/v6/mobile/screens/Detail.tsx`
**Symptom:** Browser console shows repeated `ReferenceError: VERDICT_BG is not defined` (line 93) and `ReferenceError: MarketTile is not defined` (line 353), each triggering ErrorBoundary. Errors come from old Vite HMR-cache file versions (URL params `?t=1778032559468` and `?t=1778032931165`).
**Diagnosis:** The current file (781 lines) HAS both refs defined — `VERDICT_BG` at line 32, `MarketTile` at line 265. So the runtime errors are from stale cached module versions, not the live source. Hard reload should clear them, but the fact that the cache produced 24+ ErrorBoundary trips during a single dev session means HMR retained broken intermediate states across edits.
**What to do:** Confirm with a hard reload that the live mobile route renders cleanly. If not, the file likely had refactor churn during the recent commits (ed2526c, fd1c6b4) and a clean ESM export trace is needed. Either way: clear `node_modules/.vite/` cache between edits to this file.
**Severity:** MEDIUM — production bundle is fine (Vite cache only affects dev). But mobile dev experience is broken.
**Discovered:** 2026-05-06, during Batch 1.1 verification.
