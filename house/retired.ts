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
  /* ── the sourcing engine (2026-08-15) ──────────────────────────────────
     Paul: "there will be no sourcing in the app the app is internal now IoI
     to integration." Retired rather than fixed, which is the important word:
     the app's engine had two citation-law defects and house/screen.ts is the
     corrected reimplementation, not a port. Fixing this one would have meant
     maintaining two screens, one of which can invent a revenue figure. */
  {
    id: 'client/src/components/v6/desktop/screens/Sourcing.tsx',
    kind: 'dark',
    why: 'Target discovery is entirely pre-IoI, and the app begins at the IoI.',
    replacedBy: 'scripts/studio/screen.mts + house/screen.ts',
    marked: '2026-08-15',
    proof: { check: 'flagOff', file: 'client/src/components/v6/appSurfaces.ts', constant: 'SOURCING_IN_APP' },
    note: 'Still routed at AtlasApp case "sourcing" — a direct URL reaches it. Deleting the screen means deleting that case and the mobile More row together.',
  },
  {
    id: 'server/services/sourcingPipelineService.ts',
    kind: 'dark',
    why: 'The 5-stage engine behind the Sourcing screen. Its lane is off, so every entry point refuses.',
    replacedBy: 'house/screen.ts — affiliation by register lookup, revenue as a band with its arithmetic',
    marked: '2026-08-15',
    proof: { check: 'laneOff', lane: 'sourcing' },
    note: 'THREE unattended cron jobs in worker.ts call into this and are separately guarded. Delete those guards WITH the service, never before it.',
  },
  {
    id: 'server/prompts/deepAnalysisPrompt.ts',
    kind: 'dark',
    why: 'Asks a model to estimate revenue from Google review counts ("<10 reviews typically = <$500K rev") — an uncited figure in a practice where every number must trace.',
    replacedBy: 'house/screen.ts revenue_basis — employee range x NAICS revenue-per-employee, emitting its own Derivations entry',
    marked: '2026-08-15',
    proof: { check: 'laneOff', lane: 'sourcing' },
    note: 'Imported by sourcingPipelineService stage 3 only. It goes with that service, not separately — deleting the prompt alone leaves a stage that calls nothing.',
  },
  {
    id: 'server/services/sevenFactorScoring.ts',
    kind: 'dark',
    why: 'Scores candidates with no independence check anywhere, so a franchise location can rank as a target — the expensive error: it sends a client into diligence on a business a sponsor already owns.',
    replacedBy: 'house/screen.ts — affiliation GATES rather than weights',
    marked: '2026-08-15',
    proof: { check: 'laneOff', lane: 'sourcing' },
    note: 'Writes the score columns the Sourcing screen reads and the candidates table stores. Deleting it means deciding what happens to sourcing_candidates — the rows are a Places content cache with a retention rule, so read house/screen.ts PLACES_CONTENT before dropping anything.',
  },

  /* ── Studio in the app (2026-08-15) ────────────────────────────────────
     Collateral is market-shaped, so it is the studio's. These screens are
     dark rather than orphaned: /api/research and /api/studio stay mounted so
     direct URLs and existing exports keep working. */
  {
    id: 'client/src/components/v6/desktop/screens/StudioResearch.tsx (+ StudioCreate, StudioAnnouncement, CollateralBuilder, MarketWorkspace, atlasmobile/screens/StudioResearchM.tsx)',
    kind: 'dark',
    why: 'Collateral and research are market-shaped — one-to-many, speculative, no counterparty — so THE_IOI_SEAM.md puts them in the studio.',
    replacedBy: 'the four builders in scripts/studio/, against ~/Documents/smbx-studio',
    marked: '2026-08-15',
    proof: { check: 'flagOff', file: 'client/src/components/v6/appSurfaces.ts', constant: 'STUDIO_IN_APP' },
    note: 'This flag has flipped three times. Do NOT delete these on the strength of it being false today — read the history in appSurfaces.ts first. The audience axis is the one that has held, but it has held for one day.',
  },

  /* ── the Ledger artifact renderers (2026-08-15) ────────────────────────
     Not dark by a flag — dark because the palette gate throws on them. That
     is a stronger proof than a flag, and a stranger one: the code runs, gets
     all the way to a finished document, and is refused at the last step. */
  {
    id: 'researchCardHtml / announcementCardHtml / postCardHtml in server/services/researchComposer.ts',
    kind: 'dark',
    why: 'Still render in the retired Ledger palette. server/services/paletteGate.ts throws before any of them can ship, so their downloads fail rather than producing off-language collateral.',
    replacedBy: 'scripts/studio/build-onepager.mts',
    marked: '2026-08-15',
    proof: { check: 'exists', path: 'server/services/paletteGate.ts' },
    note: 'Deleting these means deleting the Ledger consts they are the last users of (BRASS, WARM, CARD, DARK_TEXTURE_URI) and the legacy deck template in linkedInDocHtml. That is the change that finally removes LEDGER from researchComposer.',
  },
  {
    id: 'server/services/sectorArt.ts',
    kind: 'orphaned',
    why: '21 hand-drawn line-art trade illustrations. Paul rejected them on sight in 2026-07-20 ("awful… looks terrible") and no composer has referenced them since.',
    marked: '2026-08-15',
    proof: { check: 'unreferenced', pattern: 'sectorArt', selfPath: 'server/services/sectorArt.ts' },
    note: 'The only genuinely orphaned entry in this register — safe to delete without touching anything else.',
  },

  /* ── superseded documents ──────────────────────────────────────────────
     The dangerous kind: reachable, and gives an older answer than the thing
     that replaced it. */
  {
    id: 'server/services/corpDevDocs.ts',
    kind: 'superseded',
    why: 'Duplicates the PLAYBOOK document specs and is missing the target map entirely — so a document derived here is built from an incomplete spec.',
    replacedBy: 'content/studio/PLAYBOOK.md, which travels to the workspace',
    marked: '2026-08-15',
    proof: { check: 'exists', path: 'content/studio/PLAYBOOK.md' },
    note: 'REACHABLE — routes/research.ts imports it in three places. Retire the routes with it; leaving them is how someone generates a who\'s-who against the stale spec.',
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
