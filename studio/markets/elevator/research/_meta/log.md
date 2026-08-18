# Run log — hunt B · elevator & escalator

Companion to `frame.md`. One row per run. The coverage table below is the resume
point and the stop condition: read it, find the first row that is not `done`,
continue from there.

## Runs

| Run | Date | Pass | Topic | File |
|---|---|---|---|---|
| 01 | 2026-08-11 | 1 · structure & scale | NAICS 238290 container, Economic Census, installed base, vendor sizing | `01-structure-scale-census.md` |
| 02 | 2026-08-11 | 1 · regulatory | A17.1, the MCP mandate, inspection intervals, third-party independence, QEI | `02-regulatory-inspection-mandate.md` |
| 03 | 2026-08-11 | 2 · who owns what | the five OEMs, maintained units, the lock-in, antitrust, KONE–TKE | `03-oem-landscape-lockin.md` |
| 04 | 2026-08-11 | 2 · who owns what | PE platforms, the ~10% claim, deal activity, whitespace | `04-consolidators-deal-activity.md` |
| 04b | 2026-08-11 | 2 · who owns what | first-pass consolidator register | `04b-consolidator-register-draft.md` |
| 05 | 2026-08-11 | 3 · operating economics | BLS wages, IUEC, NEBA, contract pricing, multiples | `05-operating-economics-labor.md` |
| 06 | 2026-08-11 | 1 · structure & scale | metro density menu — produced the New York choice | `06-metro-density-menu.md` |
| 07 | 2026-08-11 | 3 · metro | NYC DOB NOW registry pull and every NYC computation | `07-nyc-metro-deepdive.md` |
| 08 | 2026-08-11 | 4 · gap sweep | A17.3 adoption, Census retry, QEI, OLMS | `08-gap-sweep-code-census.md` |
| 09 | 2026-08-11 | 4 · gap sweep | register gaps, multiples, contract tiers, route density | `09-gap-sweep-register-multiples.md` |
| 09b | 2026-08-11 | 4 · gap sweep | merged register v2 | `09b-consolidator-register-v2.md` |

## Coverage

Rows are the market-map sections from `PLAYBOOK.md`.

| Slot | Status | Note |
|---|---|---|
| How the market is structured | **done** | The MCP mandate is the structural finding. Code-compelled, not customer-chosen |
| Scale and fragmentation | **PARTIAL** | The 238290 employment-size-band table is STILL EMPTY — the buy-box table. Blocked on Census API key + gateway 403. Target identified: `us_state_naics_detailedsizes_2022.xlsx` |
| Who is consolidating | **done** | 10 PE platforms, 4 adjacent, 9 strategic. Unit counts unpublished across the board — structural, not a research failure |
| What a platform looks like here | **done** | Route book, contract tier mix, controller population, building-concentration profile |
| Where the openings are | **done** | Sub-750-unit floor; four whitespace regions; the KONE–TKE remedy window |
| What would make us walk | **done** | Labor. No arbitrage, 1:1 apprentice cap, growth capped by a 4-year pipeline |
| Metro cut (New York) | **done** | Computed from DOB NOW. Five boroughs only — ~1/3 of the MSA unmeasured |

## Stop condition

**Gathering stopped 2026-08-11 on budget, not on saturation.** The web-search budget
was exhausted (200/200) during the gap sweeps, and gateway policy returned 403 on
CONNECT for census.gov, bls.gov and dol.gov.

The standing test — every coverage row `ok` or named as unknown, AND two consecutive
runs on a slot returning nothing new — is **not** met for the fragmentation slot. It
is named as unknown instead. Six items in the draft's *What we don't know yet* are
blocked on access rather than on effort and need a session with working Census, BLS
and DOL access, not more searching.

**Pass 6 (primary-source verification) has NOT been run.** Highest-priority item:
A17.1 read verbatim. Every code section in the draft is triangulated from regulators
quoting it, not read from the code itself.
