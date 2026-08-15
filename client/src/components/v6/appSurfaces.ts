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
 * TRUE again since 2026-08-14. It was false from 2026-07-31, when Studio work
 * moved to disk wholesale; Paul brought the output half back — "corp-dev
 * documents, deal memo / diligence plan / term framework, collateral is in app
 * too… Everything about the deal and CRM needs to be in app."
 *
 * The routing settled on a cleaner axis than the one that took Studio out:
 * Cowork is the INPUT layer (research, aggregation, deep search, data
 * wrangling) and the app is everything the practice PRODUCES or TRACKS. The
 * table is `house/where.ts`; the reasoning is WHERE_THE_WORK_HAPPENS.md.
 *
 * Nothing had to be restored — the screens, `/api/research` and `/api/studio`
 * stayed mounted the whole time. This constant only ever controlled whether
 * the chrome advertised them.
 *
 * IT IS SAFE TO SHOW because the spend split happened in the same change:
 * `research` is now its own lane and is OFF, so the expensive path is not
 * reachable from the returning screens. Showing Studio without splitting the
 * lane would have put a ~$18-a-press button back in the header.
 */
export const STUDIO_IN_APP = true;
