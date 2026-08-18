# The IoI seam — where the studio ends and the app begins

> **ONE CLONE (2026-08-18) — read before acting on any path in this document.**
> The studio workspace now lives at **`studio/` inside this repo** (the one
> clone: `~/Documents/GitHubRepos/smbx-prod`). `~/Documents/smbx-studio` and
> its remote `smbx-ai/smbx-studio` are history (brought in by `git subtree`,
> history kept); `content/studio/` keeps only the app-read posting files
> (`POST_QUEUE.md`/`post-queue.json`, `CAMPAIGN_*.md`/`campaign-*.json`,
> `queue-export.mjs`); `init-workspace.mts` is retired. Where this document says
> `~/Documents/smbx-studio` read `studio/`; where it says "the workspace repo"
> read this repo. **Nobody commits to `main`** — branch (`claude/<topic>` ·
> `cowork/<topic>`), PR, Paul merges. Full statement: the ONE CLONE section of
> `CLAUDE.md`. Everything below is otherwise unchanged and still binding.


**2026-08-15.** Paul: *"what i see working well is running CRM (client outreach
and deals) in the smbx app… and of course running all of the deal math,
documents, data room — everything from the start of IoI — in the app."* And,
deciding the deal-math question: *"being able to use the in-app scenario
modeling is going to be much more advantageous than a Google Sheet — plus that
is where the data room and financial docs will be housed."*

This file records the boundary, the bridge, and the data plan. It supersedes
`SMBX_DEAL_MATH_WORKBENCH_2026-08-14.md` **on the question of where live deal
math runs** — in the app, not Cowork. The workbench itself survives with a
narrower job (below). Companion to `SMBX_OPERATING_ARCHITECTURE_2026-08-10.md`,
whose boundary law this extends, and `SMBX_WHAT_LIVES_WHERE.md`.

> **Where the companions live (added by CC, 2026-08-15).** The three documents
> named above, plus `ENGINE_PROVENANCE.md`, `METHODOLOGY_V17.md`,
> `YULIA_PROMPTS_V2.md` and `BUILD_PLAN_v8.md`, are **not in this repository** —
> they live in the Claude project and the studio repo. Checked before writing
> this note, because a law that cites a file its reader cannot open is the
> failure this practice keeps hitting: `THE_LINE_POLICY.md` and
> `DESIGN_LANGUAGE.md` were cited from a workspace that cannot read them, and a
> fee rule was sourced from `PRACTICE_RECORD.md`, which exists nowhere at all.
> Cite them by name and by home, never as though they were beside you.

---

## The seam

Work splits on **who it is for** — the same law that splits `collateral/` from
`decks/`.

- **Market-shaped** work is one-to-many and speculative: research, masters,
  verification, screens, buy-boxes, collateral, and the preliminary math that
  decides whether a candidate deserves an IoI. That is the **studio**, done in
  Cowork, versioned in `smbx-ai/smbx-studio`.
- **Deal-shaped** work is one-to-one and counterparty-confidential: outreach,
  pipeline, deal math on real financials, documents, the data room. That is the
  **app**, with Claude Code as the brain.

One asymmetry: **CRM starts before the IoI.** Outreach is app-side from the
first touch, so a candidate has a CRM row early while its analysis still lives
in `markets/<m>/screen/`. At IoI the two meet — the promotion.

| Work | Home | Runs in |
|---|---|---|
| Market research, masters, verification | studio `markets/<m>/` | Cowork |
| Screens, buy-boxes, registers, pre-IoI candidate math | studio `markets/<m>/screen/` + workbench | Cowork |
| Collateral and client decks | studio, rendered by the engine | Cowork + Mac |
| Outreach, contacts, pipeline | app (CRM) | app — from first touch |
| Deal math, scenario modeling, documents, data room | app | app — from IoI, CC as brain |
| Decisions, handoffs, session records | the Claude project | Cowork |

---

## One engine, two consumers

"One engine, two consumers" is not a competitor to "deal math runs in the app."
It says where the **formulas** live, not where you use them.

The calc modules — `calculateSDE`, `calculateDSCR`, `calculateIRR`,
`buildProForma`, `calculateSBAEligibility`, the rest — live **once**, in the
SMBx repo. Two things run them:

1. **The app**, natively — the primary consumer. Live-deal scenario modeling
   happens in the app UI, beside the data room and the financial documents,
   from IoI onward.
2. **The Cowork workbench**, through a **vendored copy at a pinned commit** —
   the secondary consumer, for pre-IoI screening math only. Screening thirty
   candidates off a register does not require thirty deal records in the app;
   it requires the same formulas the app would use. The vendored copy is
   verbatim, recorded in `ENGINE_PROVENANCE.md` (repo + commit), proven
   identical by the parity tests (24 canon cases), and every output is stamped
   with which engine version ran.

The disease this prevents is the two-studios disease wearing a calculator: two
implementations of DSCR that drift, the app saying 1.31 and a Cowork analysis
saying 1.28, and nobody knowing which is right. One set of formulas, copied by
commit, parity-tested — the copy can be stale, but it can never be *silently
different*, and the stamp says exactly how stale.

**Re-vendoring** is the same move as report publishing: when the app's engine
changes, copy the modules again at the new commit and re-run parity. The copy
is never edited in place. (12 August rule.)

The workbench's xlsx output is a **deliverable** — a workbook you can hand
someone — not a modeling surface. Live scenario work is in-app, full stop.
Google Sheets is not in the architecture anywhere.

---

## The bridge: GitHub, copy-by-commit

Three bridges, one rule.

1. **Studio → app.** The app reads the private studio repo at *path + commit* —
   the `collateral_path`/`collateral_commit` design from 2026-08-10, extended
   to deal promotion: the IoI packet is committed to the studio repo, the app
   imports it and records the source commit. The app never holds an editable
   copy of studio content.
2. **App repo → Cowork.** Already live: the Claude project's GitHub sync pulls
   `METHODOLOGY_V17.md`, `YULIA_PROMPTS_V2.md`, `BUILD_PLAN_v8.md` and the
   design system, so Cowork sessions read the app's canon without cloning.
3. **App → Cowork** (rare). When Cowork needs deal data to analyze, CC commits
   a snapshot export (`deal.json` / `result.json`); Cowork reads it by commit.
   No live DB access from Cowork, no screen-scraping.

> **The rule:** whatever crosses the bridge is a copy pinned to a commit, never
> edited on the far side, replaced wholesale on correction.

Standing constraint, unchanged: **never push from a cloud session.** Commit
through the bridge if necessary; push from GitHub Desktop on the Mac.

---

## The promotion at IoI

A **promotion, not a migration** — a defined event, a packet, a receipt on both
sides.

**Moves into the app:** the deal profile (`deal.json` — every figure carrying a
`source`, add-backs only when `verified: true` with `evidence`, everything else
in the assumption log), documents collected so far, the candidate's screen
record, and any pre-IoI model runs (engine-stamped, so the app can re-run and
verify continuity).

**Links but does not move:** the market master and research. The app records
`master@commit` so the deal knows what market context priced it. The master
stays in the studio; the app holds a pointer, not a copy.

**Never crosses back:** nothing counterparty-confidential enters the studio
repo after promotion. `STUDIO/deals/<deal>/` becomes **pre-IoI staging only** —
after promotion it goes *stop writing, keep reading, drop nothing*, the same
retire rule that killed the app-studio duplication on 2026-08-10.

---

## What changes from the 8/14 plan, and what stands

| 8/14 item | Status now |
|---|---|
| Workbench = home of all deal math | **Narrowed.** Pre-IoI screening + scratch scenarios only. Live deals model in-app. |
| Vendor the engine from the SMBx repo (open item 1) | **Stands.** Still required — it is what makes the workbench a consumer rather than a rival. |
| Install workbench to `STUDIO/_engine/deal-math/` (item 3) | Stands. |
| Package and deliver `deal-math.skill` (item 4) | Stands — the skill's rule ("Claude never computes deal figures in conversation") applies to pre-IoI work too. |
| Cap-table model deferred until vendoring (item 2) | Stands. |
| `deals/<deal>/models/` accumulating post-IoI | **Dropped.** Post-IoI model runs live in the app. |

---

## The migration law, generally

When data has to move homes — this promotion, the app-studio retirement, any
future one — the same four steps: a **defined event** that triggers it, a
**packet** that is a copy-by-commit, a **receipt** recorded on both sides, and
the old home going **read-only** (stop writing, keep reading, drop nothing).
A `DROP TABLE`, a deleted folder, or a copy that keeps taking edits are the
three ways this has gone wrong before; the four steps exist to make each one
impossible.

---

## Implementation status in THIS repository (CC, 2026-08-15)

The seam above is the decision; this section is what the code currently does
about it, so the two are never confused.

### Matches the seam already

- **`house/deal.ts`** is the single set of formulas — SDE, EBITDA, DSCR,
  amortization, SBA sizing, IRR/MOIC, LBO and pro forma, sensitivity, FCF,
  working-capital peg, covenants, earnout, DCF. Pure: no db, no key, no clock.
- **The parity test exists and is the mechanism the seam depends on.**
  `house/__tests__/deal.test.mts` imports BOTH `house/deal.ts` and the app's
  own `client/src/lib/calculations/core.ts` and runs them on identical inputs —
  20 parity assertions including the whole LBO result. Verified it can fail by
  injecting a one-cent drift into the paydown: three assertions go red. This is
  the "app says 1.31, Cowork says 1.28" disease, caught by a test rather than
  by a client.
- **The app is the primary consumer.** `v19ModelRuntime` (132 `MODEL.*`
  definitions), the DEFINITIVE catalog (169 gate/slot references) and the
  eleven canvas models are app-only and call no model API.
- **CRM from first touch** — `crm_accounts` / `crm_contacts` / `crm_activity`
  and the outreach queue are app-side and free.

### Differs from the seam, and needs work

- **The workbench is not vendored.** Today a Cowork session runs the engine
  through `$REPO/scripts/studio/deal.mts`, reading the engine clone directly.
  That is always-current and therefore never stale — but it also carries **no
  provenance stamp**, so an output cannot say which engine version produced it,
  and it breaks entirely if the clone is missing or stale (which
  `sync.mjs` proved can happen silently: the engine sat two directories deeper
  than discovery looked). Vendoring at a pinned commit with
  `ENGINE_PROVENANCE.md` is the 8/14 open item and it still stands.
- **No IoI promotion exists.** There is no `deal.json` packet, no
  `master@commit` pointer on a deal, no receipt on either side, and no
  read-only flip of `STUDIO/deals/<deal>/`. This is the largest unbuilt piece
  of the seam.
- **The app cannot yet produce two documents the practice needs** — the target
  map (`corpDevDocs.ts` generates market map, who's who and thesis only) and
  PLAYBOOK §5's deal memo / diligence plan / term framework (nothing in the app
  produces them). Both are recorded as `gap` in `house/where.ts` and both stay
  in the studio until closed.

### Corrected by this file

`house/where.ts` was written on 2026-08-14 against a different axis — raw INPUT
versus practice OUTPUT — and put corp-dev documents and collateral in the app.
The IoI seam splits on **audience** instead, which is the same law that already
separates `collateral/` from `decks/`, and it returns both to the studio.
The table has been updated to match; `WHERE.md` in the workspace is regenerated
from it. Where the two ever disagree, **this file wins** and the table is the
thing to fix.
