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
 * FALSE since 2026-07-31 — the work moved to disk. The screens and the
 * `/api/research`, `/api/studio` routes remain mounted and functional, so a
 * direct URL and every existing export still work; Studio simply is not
 * advertised in the chrome.
 */
export const STUDIO_IN_APP = false;
