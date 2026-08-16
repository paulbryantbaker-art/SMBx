/**
 * WHICH SURFACES THE APP OFFERS.
 *
 * ── THIS FILE IS NOW EMPTY OF FLAGS, AND THAT IS THE POINT (2026-08-16) ──
 *
 * It used to export `STUDIO_IN_APP = false` and `SOURCING_IN_APP = false`, two
 * build-time constants that hid Studio and Sourcing from the chrome while
 * leaving every screen, service, route and migration in the tree. That was the
 * right intermediate step — the practice changed its mind about the boundary
 * four times in three weeks, and three of those reversals would have been
 * expensive if the code had gone.
 *
 * Phase A of `FRONT_END_REBUILD.md` deleted them for real. So the flags went
 * too: **a flag guarding a file that no longer exists is a lie about what is
 * reachable.** Reading `SOURCING_IN_APP === false` would suggest the screen is
 * one boolean away from returning, and it is not — it is one `git revert` away,
 * which is a different and more honest thing.
 *
 * WHAT SURVIVED THE DELETE, because a sweep should say what it did not take:
 *   · the TABLES. `research_lanes`, `research_runs`, `studio_assets`,
 *     `sourcing_candidates` and the rest keep their data. Nothing was dropped
 *     except the six product-era tables (migration 128).
 *   · `marketKnowledgeTools` — Yulia keeps `list_markets`, `read_market` and
 *     `search_market`, because it reads `research_lanes` through `sql`
 *     directly rather than through the deleted service layer.
 *   · `/api/studio` (`routes/studio.ts`), which serves the pitch-book and
 *     export surfaces, not the collateral studio.
 *
 * The file is kept rather than deleted so this note has somewhere to live, and
 * so the next person to reach for a build-time surface flag finds the argument
 * about when one is appropriate before they add it.
 */

export {};
