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
| `02_organizations.csv` | `org_id` `firm` `firm_type` `segment` `bucket` `city` `state` `website` `aum_or_fund_size` `check_size` `ebitda_range` `vertical_fit` `internal_corpdev` `buyside_signal` `signal_date` `contact_count` `contact_ids` `confidence` `source_url` `notes` |
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

## The workflow

```bash
export REPO=~/Documents/GitHubRepos/SMBx-live/SMBx
cd ~/Documents/smbx-studio/clients        # push-crm.mts's first default is ./crm-bundle
SMBX_TOKEN=…  npx tsx $REPO/scripts/studio/push-crm.mts
```

One-way door. Facts flow git → app and never back. The copy rule from
`SMBX_WHAT_LIVES_WHERE.md` applies verbatim: **the app's copy is a copy and is
not allowed to be edited.** Correcting a firm name, a domain or a segment in the
app UI puts the two out of sync with no diff to find it by. Correct it here and
push.
