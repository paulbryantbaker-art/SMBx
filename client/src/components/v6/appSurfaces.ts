/**
 * WHICH SURFACES THE APP OFFERS — one switch, one place.
 *
 * Paul, 2026-07-31: "i think i want all Studio work to be on disc Cowork —
 * ill do CRM and Deal management in the app."
 *
 * That is the settled division of labour, and it is a division by SHAPE, not by
 * cost (see WHERE_THE_WORK_HAPPENS.md):
 *
 *   - STUDIO produces DOCUMENTS — research masters, corp-dev documents,
 *     carousels, one-pagers, reports. Files, versioned on disk, built by
 *     `scripts/studio/build-*.mts` with no API key and a ~30s loop. The
 *     workspace at `~/Documents/smbx-studio` is the system of record.
 *   - CRM AND DEALS are RECORDS — state that changes and gets queried. Rows in
 *     Postgres, because a folder cannot answer "who do I owe a touch to this
 *     week" and forks the moment two writers touch it.
 *
 * RETIRED IN PLACE, NOT DELETED (Paul's standing instruction, 2026-07-27:
 * "let's don't delete anything yet"). Every Studio screen, service, route and
 * migration stays exactly where it is and still compiles; this flag only takes
 * Studio out of the NAVIGATION so the app presents one coherent job. Flip it
 * back to `true` and Studio returns intact — no restoration work, no archaeology.
 *
 * Deliberately a build-time constant rather than an env var: this is a product
 * decision with a documented rationale, not per-deployment configuration. An env
 * var would invite the two halves to disagree between environments.
 */

/**
 * Is Studio offered inside the app?
 *
 * FALSE. The app is IoI → integration (Paul, 2026-08-15: *"there will be no
 * sourcing in the app the app is internal now IoI to integration"*).
 *
 * This flag has now been flipped three times and the history is the useful
 * part, because each move was reasonable on the axis in force at the time:
 *
 *   2026-07-31  FALSE — "all Studio work on disc Cowork", the cost axis
 *   2026-08-14  TRUE  — the input-vs-output axis put everything the practice
 *                       PRODUCES in the app, and collateral is produced
 *   2026-08-15  FALSE — THE_IOI_SEAM.md replaced that axis with AUDIENCE, and
 *                       collateral is market-shaped: one-to-many, speculative,
 *                       no counterparty. The app starts at the IoI.
 *
 * The seam is the one that holds because it is not a judgement about cost or
 * about verbs — it is the same split the workspace already makes between
 * `collateral/` and `decks/`, which nobody has ever had to relitigate.
 *
 * RETIRED IN PLACE, NOT DELETED (Paul's standing instruction, 2026-07-27:
 * "let's don't delete anything yet"). Every Studio screen, service, route and
 * migration stays where it is and still compiles; `/api/research` and
 * `/api/studio` stay mounted, so direct URLs and existing exports still work.
 * This constant only controls whether the chrome advertises them.
 */
export const STUDIO_IN_APP = false;

/**
 * Is target Sourcing offered inside the app?
 *
 * FALSE, same sentence, same reason: sourcing is how you find candidates, which
 * is entirely pre-IoI. `scripts/studio/screen.mts` is where it happens now, and
 * that is not a port — it is the CORRECTED implementation. The app's engine
 * carried two citation-law defects (a model guessing revenue from Google review
 * counts, and no independence check anywhere, so a franchise location could
 * rank as a target). Retiring it rather than fixing it is the call `where.ts`
 * flagged as Paul's and he has now made.
 *
 * Same retire-in-place rule: `Sourcing.tsx`, `sourcingPipelineService.ts` and
 * `/api/sourcing` all stay. The `sourcing` spend lane is off, and the three
 * unattended cron jobs in worker.ts are separately guarded, so nothing runs.
 */
export const SOURCING_IN_APP = false;
