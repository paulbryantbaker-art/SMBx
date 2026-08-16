/**
 * THE RETIREMENT REGISTER — what is dead, why, and what proves it stays dead.
 *
 * Paul, 2026-08-15: *"we can start marking things for deletion that are no
 * longer needed."*
 *
 * The standing rule since 2026-07-27 has been "let's don't delete anything
 * yet", and it was a good rule: this practice has changed its mind about the
 * boundary four times in three weeks, and three of those reversals would have
 * been expensive if the code had gone. So marking is the right intermediate
 * step — but a list of things-to-delete-later rots exactly like every other
 * prose law in this repo. `DESIGN.md` claimed four builders were converted when
 * two were not. `THE_LINE_POLICY.md` was cited from a workspace that cannot
 * open it. A fee rule was sourced from a file that does not exist.
 *
 * So the register is DATA and every entry carries a mechanical `proof` that its
 * retirement still holds. `house/__tests__/retired.test.mts` runs them. An
 * entry whose proof fails is not "still dead but noisy" — it means something
 * came back to life and nobody noticed, which is the only failure mode a
 * register like this exists to catch.
 *
 * THREE KINDS, and getting them confused is why a naive check misfires. Only
 * one of these is "nothing references it":
 *
 *   ORPHANED    nothing imports it at all. Safe to delete on sight.
 *   DARK        fully wired and still compiles, but no user can reach it —
 *               a nav flag is off, a lane is off, a route is unadvertised.
 *               Reference counts stay HIGH. Counting imports would report
 *               these as alive, which is exactly backwards.
 *   SUPERSEDED  a better implementation exists elsewhere and this one is the
 *               stale copy. Often still reachable, which is the danger:
 *               someone uses it and gets the old answer.
 *
 * NOTHING HERE IS DELETED BY THIS FILE. It is a register, not a sweep.
 */

export type RetirementKind = 'orphaned' | 'dark' | 'superseded';

export interface Retired {
  /** Path, table, or symbol. What you would actually remove. */
  id: string;
  kind: RetirementKind;
  /** Plain sentence: why this is no longer needed. */
  why: string;
  /** What does this job now, if anything does. */
  replacedBy?: string;
  /** ISO date it was marked. */
  marked: string;
  /**
   * What must stay true for the retirement to hold.
   *
   * `unreferenced` — no import outside itself (ORPHANED only).
   * `flagOff`      — a named constant is false.
   * `laneOff`      — a spend lane is not in DEFAULT_LANES.
   * `exists`       — the replacement is present (SUPERSEDED).
   */
  proof:
    | { check: 'unreferenced'; pattern: string; selfPath: string }
    | { check: 'flagOff'; file: string; constant: string }
    | { check: 'laneOff'; lane: string }
    | { check: 'exists'; path: string };
  /** Anything a future sweep must know before pulling the thread. */
  note?: string;
}

export const RETIRED: readonly Retired[] = [
  /* ── SWEPT 2026-08-16 (Phase A of FRONT_END_REBUILD.md) ────────────────
     Eight of this register's entries have been DELETED, not merely marked.
     They are recorded here as `swept` rather than dropped from the file,
     because the register's value is that it can answer "did this come back",
     and an empty list answers nothing. Each carries an `unreferenced` proof
     now: if the path reappears anywhere, the test goes red.

     Deleted: the Studio screens and services, the Sourcing screen, engine,
     scorer and prompt, the app's artifact renderers, and paletteGate — which
     went with them, because a choke point with nothing left to stand in front
     of reads as protection it no longer provides. */
  {
    id: 'server/services/sourcingPipelineService.ts',
    kind: 'orphaned',
    why: 'SWEPT. The 5-stage engine. Target discovery is entirely pre-IoI and the app begins at the IoI.',
    replacedBy: 'house/screen.ts + scripts/studio/screen.mts — affiliation by register lookup, revenue as a band with its arithmetic',
    marked: '2026-08-15',
    proof: { check: 'unreferenced', pattern: 'sourcingPipelineService', selfPath: 'server/services/sourcingPipelineService.ts' },
    note: 'Its three worker cron jobs and its two Yulia tools (get_sourcing_portfolio, start_sourcing_run) went with it. sourcing_candidates rows survive — they are a Places content cache with a retention rule; read house/screen.ts PLACES_CONTENT before dropping any.',
  },
  {
    id: 'server/prompts/deepAnalysisPrompt.ts',
    kind: 'orphaned',
    why: 'SWEPT. Asked a model to estimate revenue from Google review counts — an uncited figure in a practice where every number must trace.',
    replacedBy: 'house/screen.ts revenue_basis',
    marked: '2026-08-15',
    proof: { check: 'unreferenced', pattern: 'deepAnalysisPrompt', selfPath: 'server/prompts/deepAnalysisPrompt.ts' },
  },
  {
    id: 'server/services/sevenFactorScoring.ts',
    kind: 'orphaned',
    why: 'SWEPT. Scored candidates with no independence check anywhere, so a franchise location could rank as a target.',
    replacedBy: 'house/screen.ts — affiliation GATES rather than weights',
    marked: '2026-08-15',
    proof: { check: 'unreferenced', pattern: 'sevenFactorScoring', selfPath: 'server/services/sevenFactorScoring.ts' },
    note: 'Its last caller was routes/anonymous.ts — sourcing functionality riding inside the retired public chat. That block went too.',
  },
  {
    id: 'client/src/components/v6/desktop/screens/Sourcing.tsx (+ atlasmobile/screens/Sourcing.tsx)',
    kind: 'orphaned',
    why: 'SWEPT. Both shells. Target discovery is pre-IoI.',
    replacedBy: 'scripts/studio/screen.mts',
    marked: '2026-08-15',
    proof: { check: 'unreferenced', pattern: 'screens/Sourcing', selfPath: 'client/src/components/v6/desktop/screens/Sourcing.tsx' },
  },
  {
    id: 'the Studio screens (StudioCreate · StudioResearch · StudioAnnouncement · CollateralBuilder · MarketWorkspace · atlasmobile Studio + StudioResearchM)',
    kind: 'orphaned',
    why: 'SWEPT. Collateral and research are market-shaped — one-to-many, speculative, no counterparty — so THE_IOI_SEAM.md puts them in the studio.',
    replacedBy: 'the four builders in scripts/studio/, against ~/Documents/smbx-studio',
    marked: '2026-08-15',
    proof: { check: 'unreferenced', pattern: 'screens/StudioCreate', selfPath: 'client/src/components/v6/desktop/screens/StudioCreate.tsx' },
    note: 'STUDIO_IN_APP and SOURCING_IN_APP went with them. A flag guarding a file that no longer exists is a lie about what is reachable.',
  },
  {
    id: 'the Studio/research services (researchAgent · researchComposer · researchLanes · deckDesigner · studioAssets · studioRepos · collateralComposer · corpDevDocs · linkedinAnalytics · artworkService · postcardFiller) + routes/research.ts',
    kind: 'orphaned',
    why: 'SWEPT with the screens. researchAgent was additionally the only unattended path that could spend real money on a timer.',
    replacedBy: 'scripts/studio/*.mts run in a Cowork session on Paul\'s own subscription',
    marked: '2026-08-16',
    proof: { check: 'unreferenced', pattern: 'services/researchComposer', selfPath: 'server/services/researchComposer.ts' },
    note: 'The TABLES survive — research_lanes, research_runs, studio_assets and the rest keep their data. marketKnowledgeTools reads research_lanes through sql directly, not through the service, so Yulia KEEPS list_markets / read_market / search_market.',
  },
  {
    id: 'server/services/paletteGate.ts',
    kind: 'orphaned',
    why: 'SWEPT. A choke point that threw before an off-language artifact could leave the server. With no server-side renderer left there is nothing for it to stand in front of, and an unreferenced guard is worse than no guard because it reads as protection.',
    replacedBy: 'assertCarta in the local builders — the guard now sits where the rendering does',
    marked: '2026-08-16',
    proof: { check: 'unreferenced', pattern: 'paletteGate', selfPath: 'server/services/paletteGate.ts' },
  },
  {
    id: 'server/services/sectorArt.ts',
    kind: 'orphaned',
    why: 'SWEPT. 21 line-art trade illustrations Paul rejected on sight in 2026-07-20; no composer had referenced them since.',
    marked: '2026-08-15',
    proof: { check: 'unreferenced', pattern: 'sectorArt', selfPath: 'server/services/sectorArt.ts' },
  },
];


/** Everything marked, grouped by how it is dead. */
export function byKind(kind: RetirementKind): readonly Retired[] {
  return RETIRED.filter(r => r.kind === kind);
}

/** The one-line summary a session or a sweep reads first. */
export const SWEEP_RULE =
  'Nothing in this register is deleted by being in it. ORPHANED is safe on sight; '
  + 'DARK still compiles and is reachable by direct URL, so check the note before pulling; '
  + 'SUPERSEDED is reachable and gives the older answer, which makes it the most urgent '
  + 'and the least obvious.';
