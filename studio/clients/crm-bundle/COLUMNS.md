# COLUMNS — who owns what in the buy-side register

**Moved here 2026-08-18.** This folder is the LIVING buy-side register. It was
`SMBx/content/crm-seed/` until today, which is the repo Railway builds and
deploys on every push to `main` — a register edit should not deploy a website.

`content/crm-seed/` still exists and must: `server/services/crmOutreachSeed.ts`
reads it by filename at runtime, so the app's "seed the plan" press would throw
`content/crm-seed is missing` without it. **That copy is now FROZEN** — the
2026-08-05 plan as shipped, and the header reference `CRM_BRIDGE.md` §2 points
at. Research changes land here, never there.

---

## The rule

**Git owns the facts. The app owns the state.**

A fact is something research established: who the firm is, where it is, what it
buys, and the URL that proves it. A fact is re-derivable from sources and a
fresh push should refresh it.

State is something Paul did: what stage a pursuit is at, what he owes them next,
who he called, what he sent. State exists nowhere but the app and a push must
never overwrite it.

This is `WHERE_THE_WORK_HAPPENS.md` §0 applied one register down — *documents
are files, pipelines are rows* — and it is the same shape as the `post_queue`
ownership law: markdown owns content, the table owns status.

## Git owns — edit here, push, they refresh

| File | Columns |
|---|---|
| `02_organizations.csv` | **31 columns, this exact order (2026-08-18 merge onward — copy from the file itself, never from a description):** `org_id` `firm` `firm_type` `segment` `bucket` `tier` `city` `state` `website` `aum_or_fund_size` `check_size` `ebitda_range` `vertical_fit` `internal_corpdev` `buyside_signal` `signal_date` `contact_count` `contact_ids` `confidence` `source_url` `notes` `account_type` `sponsor_parent` `verticals_active` `states_active` `platform_count` `texas_exposure` `trigger_type` `trigger_date` `verification` `last_checked` |
| `01_contacts.csv` | `record_id` `full_name` `title` `firm` `email` `phone` `source_url` `outreach_hook` `warm_path` `channel` `template_id` `verification_status` |
| `03`–`06` | the campaign plan — waves, steps, templates, events. Content columns refresh on push; status columns do not exist in the CSV and are the app's |
| `07_research_queue.csv` | `queue_id` `firm` `what_is_needed` `why_it_matters` `suggested_source` `linked_record` |

Upsert policy on these is `COALESCE(new, existing)`: a new non-null refreshes,
**a blank cell never erases**. Deleting a value means pushing a deliberate one,
not clearing the cell.

## The app owns — never write these from here

`stage` · `stage_entered_at` · `owner_email` · `next_action` · `next_action_on` ·
`archived` · `loss_reason` · every `crm_activity` row · every `crm_touches`
status, `sent_at`, `subject_sent`, `body_sent`.

Verified in `crmOutreachSeed.ts:43` — *"(stage/owner/next_action/archived) never
touched on UPDATE"* — and at `:326`, where `next_action` is
`COALESCE(next_action, …)`, so a push fills an empty one and never replaces a
live one.

## The three contested columns — decided

| Column | Owner | Why |
|---|---|---|
| `tier` (CSV) → `grade` (DB) | **git** | The researched conviction, stored as provenance. It is what the register believed and when. |
| `tier` (CSV) → `tier` (DB) | **the app**, once re-scored | `COALESCE(existing, new)` — an existing value wins, so a human re-score is never clobbered by a re-push. |
| `org_id`/`record_id` → `source_key` | **git, once** | `COALESCE(existing, new)`. It is the join key `parseTargets` resolves steps against; once stamped it must not move, or every targeting expression silently re-points. |

`next_action` on `01_contacts.csv` is the one column in the fact layer that is
state-shaped. It seeds an account that has none and is ignored on an account
that does. Treat it as a starting suggestion, not a field to maintain here.

## Two things that will bite

**Headers are load-bearing and a mismatch fails SILENTLY.** The loader keys off
exact header names and skips a non-conforming row with a bare `continue` — no
counter, no warning, no entry in `targetsUnmatched`. A bundle whose wave sheet
said `wave_key,name,start_on` imported firms and contacts fine and reported
`0 waves · 0 steps · 0 templates`, which is byte-identical to "you sent no
waves." **A zero in the campaign line is a header check, not an empty sheet.**
Copy the headers in this folder verbatim.

**Firm name is the whole matching key.** `crm_accounts` upserts on
`(user_id, lower(firm))` — exact lowercase string equality, nothing else. This
file already contains `Capital Southwest (NASDAQ: CSWC)`,
`Main Street Capital (NYSE: MAIN)` and `Genesis Park / GP Capital Partners`. A
later run that emits `Capital Southwest` creates a SECOND row, silently, and
merging it afterwards means adjudicating which row's human state survives.
Until `reconcile.mts` exists, changing a firm string in this file is a
destructive act — treat it as one.

**Three more loader behaviors that make a careless import destructive
(2026-08-19, written after a session projected a drop-in from a stale schema
description):**

- **`notes` REPLACES on import when non-empty.** `packNotes` builds a notes
  blob from the row and the upsert takes the new value over the existing one.
  Ship curated notes or ship the column empty — a key=value dump packed into
  notes overwrites the register's provenance (verification lines, correction
  records) on every name-matched firm, app-side, with no diff to find it by.
- **`kind` is set unconditionally from `bucket`, and a blank bucket means
  `acquirer`.** Never ship a bundle row without its bucket, or an
  `ECOSYSTEM_DO_NOT_PITCH` firm's kind flips to acquirer on import (its
  `disqualified` note survives, so the damage is quiet).
- **Unknown columns are ignored silently at the column level** (unrecognized
  FILES are named back; unrecognized COLUMNS are simply never read). A
  projection with wrong column names imports "successfully" and drops the
  facts — the worst outcome, because it looks like it worked.

## The row-universe law (2026-08-19)

**This file is the VERIFIED register — 154 rows as of 2026-08-19 — never the
research universe.** A research run's full emission (225 rows on 2026-08-18)
lands in `../candidates/` as a DATED file, and reconcile promotes what
verifies. A drop-in replacement of this file with the research universe would
have: dropped the 75 legacy rows (the referral layer and the firms the
campaign plan's targeting expressions resolve against by `source_key`),
re-admitted rows that FAILED primary-source verification (Rhino Ventures,
Schultz Brothers, Elm Fork — held 2026-08-19 with reasons in their funnel
notes), and replaced curated notes wholesale. The studio master keeps its own
richer schema; this file is the projection INTO the register, and the
projection is append/merge per reconcile — never file replacement.

## The workflow

Three transports, one idempotent loader (paths corrected 2026-08-19 — the
old block predated ONE CLONE and pointed at folders that no longer exist):

- **One press, no files (2026-08-19):** in the app, Leads → **"Sync register
  from the repo"** — the server reads THIS folder as shipped in its own
  deploy (`.dockerignore` un-ignores exactly `studio/clients/crm-bundle`).
  Merge the register change, let Railway rebuild, press. Works from a phone.
- **File picker:** Leads → **"Load the register from CSVs"**, pick this
  folder's `*.csv` — for files newer than the deploy.
- **Terminal:**

```bash
cd ~/Developer/smbx-prod/studio/clients   # push-crm.mts's first default is ./crm-bundle
SMBX_TOKEN=…  npx tsx ../../scripts/studio/push-crm.mts
```

One-way door. Facts flow git → app and never back. The copy rule from
`SMBX_WHAT_LIVES_WHERE.md` applies verbatim: **the app's copy is a copy and is
not allowed to be edited.** Correcting a firm name, a domain or a segment in the
app UI puts the two out of sync with no diff to find it by. Correct it here and
push.

---

## The two-stage shape (settled 2026-08-18)

The market side already works this way — `screen/candidates.csv` is the funnel
and a deal row in the app is the commitment; *"the CSV is the funnel; the deal is
the commitment"* (`WHERE_THE_WORK_HAPPENS.md` §6A). The client side now matches.

```
clients/candidates.csv          THE FUNNEL — everything, DISCOVERY included.
                                Never pushed. `push-crm.mts` cannot see it: it
                                sends only *.csv inside the bundle folder, and
                                this file sits one level up.

clients/crm-bundle/02_organizations.csv
                                THE REGISTER — VERIFIED only. This is what gets
                                pushed, scored, and pitched from.
```

**Promotion is the verification act.** A candidate row moves up when its
`primary_source_url` is a deep link somebody actually read, per
`STUDIO_ROTATION.md`: *"Only primary-source verification upgrades it, with the
confirming source cited."* Stamp `promoted_on` and let reconcile move it.

**The invariant:** no row in the register may carry `verification` other than
`VERIFIED`. `reconcile.mts` should refuse on it — add to `RECONCILE_SPEC.md` §9.
Blank is tolerated on the 75 legacy rows that pre-date the scale; they carry
`confidence` (High/Medium/Low) instead, and backfilling them is a follow-up.

`candidates.csv` carries `register_match` — six rows already correspond to a
register entry, so promotion must MERGE them, never append a duplicate.

## What the 2026-08-18 merge settled

- **Schema.** The bundle is canonical and absorbs the extras. Ten columns added:
  `account_type` `sponsor_parent` `verticals_active` `states_active`
  `platform_count` `texas_exposure` `trigger_type` `trigger_date` `verification`
  `last_checked`. The loader ignores columns it does not know and names them, so
  this costs nothing app-side.
- **`tier` is A/B/C.** The incoming 1/2/3 scale maps `1→A · 2→B · 3→C` on new
  rows. On a matched row the existing value wins, unchanged.
- **`account_type` and `bucket` are different axes and both are kept.** `bucket`
  says whether we pitch them; `account_type` says what kind of capital they are.
  This is the same argument as `kind` → `roles`, one file over.
- **`segment` is left BLANK on the 15 `P5_SEARCH_FUND_INVESTOR` rows.** No clean
  mapping exists in the bundle's vocabulary, and a visible gap beats a plausible
  guess.
- **A sponsor is a distinct entity from the platform it owns.** Altas Partners,
  Gridiron Capital and Highview Capital each matched the register row of a
  platform they own, via its parenthetical. All three resolved as separate firms.
