# CRM_BRIDGE.md — the Cowork → app contract

Last updated: 2026-08-14; §0 added 2026-08-18. Written from the code and
verified by round-trip, not from any prior status document.

The division of labour is THE SPLIT applied to data. The **smart half** —
enumeration, entity resolution, enrichment, affiliation screening, tiering —
runs in a Cowork session on the subscription. The **app half** begins when a
scored list has to become accounts, contacts, waves and touches, and it is pure
code: `POST /api/crm/import-bundle` **calls no model**. That is the entire point
of the loop, and it is verified — `server/routes/crm.ts:441` imports only
`parseCsv` and `seedOutreachFromTables`, and neither reaches an API key.

---

## 0. Where the register lives (2026-08-18)

**The living register is in the WORKSPACE repo.**

```
~/Documents/smbx-studio/clients/crm-bundle/     ← edit here, push from here
~/Documents/GitHubRepos/SMBx-live/SMBx/content/crm-seed/   ← FROZEN fixture
```

It moved because this repo deploys: Railway builds `smbx.ai` on every push to
`main`, and a research edit to a register should not ship a website. The
workspace deploys nothing and pushing it costs nothing.

`content/crm-seed/` **stays and must stay** — `crmOutreachSeed.ts:88` resolves
it and reads all seven files by name at runtime, so the app's seed press throws
without it. It is now the 2026-08-05 plan exactly as shipped: a deploy fixture
and the header contract, never a working copy. See `content/crm-seed/README.md`.

**Column ownership is written down for the first time** in
`clients/crm-bundle/COLUMNS.md`: git owns the facts, the app owns the state, and
the three contested columns (`grade`, `tier`, `source_key`) are decided there
against the COALESCE policy in §5. The one-way door is the rule — facts flow
git → app and never back, and the app's copy is not allowed to be edited.

---

## 1. The payload

`POST /api/crm/import-bundle` · `server/routes/crm.ts:441` · auth: **required**
(`crmRouter.use(requireAuth)`, `crm.ts:26`) and subject to the practice
perimeter, so the bearer token must belong to a `TEAM_ALLOWLIST` identity.

```jsonc
{
  "files": {                       // REQUIRED. Object, not an array.
    "01_contacts.csv":      "<raw csv text>",
    "02_organizations.csv": "<raw csv text>"
    // …any of the seven slots
  }
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `files` | yes | object | plain object; an array or a non-object is a 400 |
| `files[name]` | — | string | anything not a string is **ignored and named** in `ignoredFiles` |

**Rejections**

| Condition | Response |
|---|---|
| `files` missing, not an object, or an array | `400 files (object of name → csv text) is required` |
| Neither contacts nor organizations resolved | `400 No contacts or organizations recognized — check the file names…` |
| Anything thrown inside the loader | `500 Bundle import failed: <message>` |

**Partial bundles are legal.** Only contacts *or* organizations must be present.
An updated contacts sheet alone is a valid push; everything else upserts.

### File-name → slot matching

`slotFor()` at `crm.ts:452`, matched on the lower-cased name by number prefix
**or** by meaning. Order matters — the first match wins.

| Slot | Matches | Canonical name |
|---|---|---|
| `contacts` | `^0?1[_\-.]` or contains `contact` (unless it also contains `queue`/`research`) | `01_contacts.csv` |
| `orgs` | `^0?2[_\-.]`, `organi[sz]`, `^orgs?\b` | `02_organizations.csv` |
| `waves` | `^0?3[_\-.]` or `wave` | `03_outreach_waves.csv` |
| `steps` | `^0?4[_\-.]`, `step`, `sequence` | `04_sequence_steps.csv` |
| `templates` | `^0?5[_\-.]`, `template`, `message` | `05_message_templates.csv` |
| `events` | `^0?6[_\-.]` or `event` | `06_events.csv` |
| `queue` | `^0?7[_\-.]`, `research`, `queue` | `07_research_queue.csv` |

Unmatched names are returned in `ignoredFiles` — **reported, never silently
dropped**. Two slots can be fed by several files; rows concatenate.

### CSV parsing

`parseCsv` (`crmOutreachSeed.ts`) is a hand-rolled RFC-4180-ish reader: strips a
BOM, honours `"` quoting and `""` escapes, accepts `\n` or `\r\n`, drops
all-blank rows, trims headers and every value. Row 1 is the header. Missing
columns read as `""`.

---

## 2. ⚠ Column names are load-bearing, and a mismatch fails **silently**

This is the single sharpest edge in the bridge and it cost a full round to find.

The loader keys off **exact header names**, and rows that miss the required ones
are skipped by a bare `continue` with **no counter, no warning, and no entry in
`targetsUnmatched`**:

```ts
for (const w of waves)     { if (!w.wave_id || !w.wave_name) continue; }   // crmOutreachSeed.ts:372
for (const t of templates) { if (!t.template_id || !t.body) continue; }    // :391
```

Observed directly: a bundle whose wave sheet used `wave_key,name,start_on`
instead of `wave_id,wave_name,start_date` imported **5 firms and 4 contacts
successfully** and reported `0 waves · 0 steps · 0 templates`. That output is
byte-identical to "you didn't send any waves." Re-pushed with the canonical
headers, the same file produced `1 waves · 3 steps · 2 templates · 4 touches`.

**A zero in the campaign line is ambiguous. Treat it as a header check, not as
an empty sheet.** The canonical headers are the ones in
`~/Documents/smbx-studio/clients/crm-bundle/*.csv` (and, frozen and identical,
`content/crm-seed/*.csv`); copy them verbatim.

Required headers per slot (everything else is optional):

| Slot | Required | Also read |
|---|---|---|
| contacts | `firm`; `full_name` (else the row parks as unnamed) | `record_id` `title` `email` `phone` `source_url` `warm_path` `channel` `template_id` `verification_status` `next_action` `wave` `bucket` `tier` `segment` `city` `state` `firm_website` |
| orgs | `firm` | `org_id` `bucket` `firm_type` `website`/`firm_website` `city` `state` `segment` `tier` `buyside_signal` `signal_date` `source_url` `aum_or_fund_size` `check_size` `ebitda_range` `vertical_fit` `internal_corpdev` `confidence` `notes` |
| waves | `wave_id`, `wave_name` | `start_date` `end_date` `primary_objective` `segments_in_play` `target_contacts` `anchor_event` `success_metric` `dependency` |
| steps | `step_id`, `wave_id` | `week_of` `action` `channel` `template_id` `target_records` `objective` `owner` `success_metric` `notes` |
| templates | `template_id`, `body` | `segment` `channel` `purpose` `subject_line` `cta` `guardrails` |
| events | `event_id`, `event_name` | `date` `location` `registration_status` `priority` `target_records` `objective` `prep_deadline` `notes` |
| queue | `queue_id` | `firm` `what_is_needed` `why_it_matters` `suggested_source` `linked_record` |

---

## 3. What `push-crm.mts` sends, and how it authenticates

`scripts/studio/push-crm.mts` (106 lines).

```bash
SMBX_TOKEN=… npx tsx scripts/studio/push-crm.mts <dir>
```

| Env | Default | Purpose |
|---|---|---|
| `SMBX_TOKEN` | — | Cowork access token (Settings → Connections → "Show my token"). The normal path: Paul signs in with Google and has no password. |
| `SMBX_EMAIL` + `SMBX_PASSWORD` | — | Fallback; POSTs `/api/auth/login` for a token. |
| `SMBX_APP_URL` | `https://smbx.ai` | App base. |
| `<dir>` | `./crm-bundle`, then `content/crm-seed` | Folder of CSVs. **Run from `~/Documents/smbx-studio/clients/` and the first default finds the living register with no argument.** |

It reads the directory, **sends only `*.csv`**, and POSTs
`{files: {basename: text}}` with `Authorization: Bearer <token>`.

> **The CLI pre-filters, so the server's "unrecognized files are reported"
> guarantee only covers files the CLI chose to send.** A `99_notes.txt` dropped
> in the bundle folder never reaches the server and appears in no report —
> confirmed: the CLI printed "Pushing 5 files" for a 6-file directory. Non-CSV
> strays are invisible, not flagged.

CLI tokens carry `tokenUse: 'cli'` and are checked against `users.cli_token_epoch`
on every request (`server/middleware/auth.ts:81`), so Regenerate kills one
without signing browsers out.

---

## 4. Record mapping

### `crm_accounts` (migration 113, + `source_key` from 120)

| CSV | Column | Note |
|---|---|---|
| `firm` | `firm` | identity; blank ⇒ row skipped |
| `bucket` | `kind` | via `kindFor()` — `ECOSYSTEM_DO_NOT_PITCH` ⇒ `other` |
| `firm_website`/`website` | `website`, `domain` | domain normalised |
| `city` / `state` | `hq_city` / `hq_state` | |
| `segment` | `segment` | |
| `org_id` | `source_key` | **the join key for step targeting** |
| `tier` | `grade` **and** `tier` | `grade` is the plan's conviction as provenance; `tier` is the sortable column a re-score later owns |
| `buyside_signal` (+`signal_date`) | `evidence` | concatenated |
| `source_url` | `source_url` | |
| `bucket == ECOSYSTEM_DO_NOT_PITCH` | `disqualified` | a sentence, not a flag; excludes from every queue |
| firm_type, AUM, check size, EBITDA range, vertical fit, internal corp dev, confidence | `notes` | packed as labelled lines |

### `crm_contacts`

`record_id → source_key` (the step-targeting join key), `full_name → name`,
plus `title`, `email`, `phone`, `source_url`. First contact on an account gets
`is_primary`. `warm_path`, `channel`, `template_id`, `verification_status` are
packed into `notes`.

A contact with no `full_name`, or `verification_status` matching
`/NAMED INDIVIDUAL REQUIRED/i`, is **parked** — counted in `unnamedParked`, no
row written, and the account's `next_action` is prefixed `[NAME THE PERSON
FIRST]`. This is the never-invent-a-person law made mechanical: a fabricated CRM
contact gets emailed.

### `crm_activity`

Research-queue rows land as `Research needed [queue_id]` activity on the matched
firm. Keyed by subject; a re-run skips ones already present.

### Campaign tables (migration 120)

`crm_waves` ← waves · `crm_templates` ← templates · `crm_events` ← events ·
`crm_sequence_steps` ← steps, each keyed by its plan key and scoped to `user_id`.

`crm_touches` is the derived work queue: each step's `target_records` expression
is expanded by `parseTargets` (`house/outreach.ts`, pure, 26 tests) into one row
per person. It reads three forms — explicit ids (`REF-901`), ranges
(`REF-001 through REF-015`), and segment selectors (`All CAPITAL records`,
underscore-guarded prefix match). **Anything unreadable lands in
`targetsUnmatched`, named in the report, never dropped.** Verified: a step
targeting `REF-999` returned `S-903: REF-999`.

Do-not-pitch accounts and unsubscribed contacts are excluded when the queue is
built **and re-checked at send**.

### Response

```jsonc
{ "accountsCreated": 5, "accountsUpdated": 0, "contactsAdded": 4,
  "activitiesAdded": 5, "unnamedParked": 1, "doNotPitch": 1,
  "wavesLoaded": 1, "templatesLoaded": 2, "stepsLoaded": 3, "eventsLoaded": 0,
  "touchesQueued": 4, "touchesExcluded": 0,
  "targetsUnmatched": ["S-903: REF-999"], "ignoredFiles": [] }
```

Note the asymmetry: firms report **created vs updated**, but
`wavesLoaded`/`stepsLoaded`/`templatesLoaded` count **rows processed**, so they
read the same on a first push and a no-op re-push.

---

## 5. Idempotency — **updates, never duplicates**

Verified by pushing the same bundle three times.

| Level | Key | Behaviour |
|---|---|---|
| accounts | `(user_id, lower(firm))` unique | UPSERT. `source_key` and `tier` use `COALESCE(existing, new)` — an existing value wins, so a human re-score is never clobbered. Every other column is `COALESCE(new, existing)` — a new non-null refreshes, a blank cell never erases. |
| contacts | `(account_id, lower(name))` unique | INSERT; `ON CONFLICT DO UPDATE` **only** to backfill `source_key`. No other column is touched. |
| activity | subject match | skipped when present |
| waves / templates / events / steps | `(user_id, <plan key>)` unique | UPSERT — content columns refresh from the CSV; status columns are human-owned and never touched |
| touches | `(step_id, COALESCE(account_id,0), COALESCE(contact_id,0), COALESCE(event_id,0))` unique | one row per step × person, ever |

**Round-trip result (10 synthetic records — 5 orgs, 5 contacts):**

```
push 1 (canonical headers) → 5 new · 4 contacts · 1 parked · 1 do-not-pitch
push 2 (identical bundle)  → 0 new · 5 refreshed · 0 contacts added · 0 touches queued
push 3 (identical bundle)  → 0 new · 5 refreshed · 0 contacts added · 0 touches queued

row counts before push 3 → after push 3, unchanged:
  crm_accounts=5  crm_contacts=4  crm_waves=1  crm_templates=2
  crm_sequence_steps=3  crm_touches=4  crm_activity=5
```

**A mandate can be re-run safely.** Re-pushing refreshes content and preserves
every human decision (stage, next_action, tier once re-scored, touch status).

---

## 6. Provenance — where `source_url` goes, and where `source_quote` cannot

| Field | Accounts | Contacts |
|---|---|---|
| `source_url` | ✅ real column, carried verbatim | ✅ real column, carried verbatim |
| `source_quote` | ❌ **no column anywhere in 113 or 120** | ❌ |
| `evidence` | ✅ but it is the `buyside_signal (+ signal_date)` string, not a quotation | — |
| `notes` | ✅ free text, but packed with eight labelled fields | ✅ same |

**One URL per RECORD, not per FIELD.** Cowork attaches a `source_url` *and* a
verbatim `source_quote` to every enriched field; the schema has one `source_url`
per row and nowhere at all for the quote. Today the only way through is to jam
quotes into `notes`, where they are unqueryable, not attributable to the field
they support, and mixed in with eight other packed labels.

**Cheapest addition, in order of cost:**

1. **One JSONB column per table** — `ALTER TABLE crm_accounts ADD COLUMN
   provenance JSONB;` (same on `crm_contacts`), shaped
   `{"<column>": {"url": "...", "quote": "...", "asof": "2026-08-14"}}`. One
   migration, two columns, no new tables, no FK work; the seeder writes it from
   a `provenance_json` CSV column and merges rather than replaces on upsert. It
   makes "which field, which source, which sentence" answerable in SQL.
2. A `crm_field_sources` side table (row per field) — normalised and queryable
   across accounts, but a new table, new indexes and a join on every read.

Option 1 is the recommendation; nothing here has been built, only measured.

---

## 7. The outreach queue as it stands (read-only survey — **nothing modified**)

`server/routes/outreach.ts` (283 lines) · `requireAuth` on the whole router.

**Wave → sequence.** A wave is a dated container (`wave_key`, start/end,
objective, segments, success metric). Steps belong to a wave by `wave_id` and
carry `week_of`, `action`, `channel`, a `template_id` and a `target_records`
expression. The seed expands each step's targets into `crm_touches` — the queue
is materialised at import, not computed at read.

**Endpoints.** `GET /outreach` (plan: waves + steps + templates + counts) ·
`GET /outreach/queue` (`?status=pending|sent|done|skipped|replied|all`, joined
to account and contact, template rendered) · `POST /outreach/touches/:id/send` ·
`PATCH /outreach/touches/:id` · `PATCH /outreach/steps/:id`.

**One press, one message, one human.** There is no batch-send endpoint. The send
handler takes the practitioner's *final* subject and body and refuses in this
order: unresolved `{merge_field}` (400) → touch not found (404) → not `pending`
(409) → no contact email (400) → contact unsubscribed (403) → account
disqualified (403) → account archived (403) → channel is not an email channel
(400).

Verified live:

```
POST /outreach/touches/2/send  {body: "…congratulations on {recent_fund_or_deal}."}
  → 400 "The draft still carries {merge_fields} — fill them before sending."
POST /outreach/touches/2/send  {clean draft}          (no RESEND_API_KEY configured)
  → 502 "…nothing was sent, the touch is still pending."
  → row: status=pending, sent_at=NULL,
         last_send_error='Email service declined or is not configured…'
```

**State written back on a true send:** `status='sent'`, `sent_at=NOW()`,
`subject_sent`/`body_sent` (the denormalised audit trail — the exact words that
left), `last_send_error=NULL`, `activity_id` pointing at an auto-logged
`crm_activity` email row. `sent_at` is stamped **only** when the mail service
actually accepted the message.

**Replies are not tracked.** There is no inbound webhook, no IMAP poll, no
reply-to parser — grep across the router and `emailService.ts` finds none.
`replied` is a status a human sets by hand via `PATCH /outreach/touches/:id`.
Note also that `TOUCH_STATUSES = ['pending','done','skipped','replied']`
excludes `'sent'`: `sent` is a stored status the send endpoint writes, and
deliberately not one a PATCH can claim.

**Channel handling.** `emailChannel()` matches any channel string containing
"email" (the plan writes prose like `"LinkedIn DM / email"`). LinkedIn-only,
Web and Phone touches are tracked as tasks and marked `done` by hand.

Rendering lives in `house/outreach.ts` — pure and tested — so a local Cowork
session and the app produce byte-identical drafts. `renderTemplate` refuses to
blank a field it cannot fill; `{recent_fund_or_deal}` stays visible and blocks
the send rather than mailing "congratulations on ."

---

## 8. Reproducing the round-trip

```bash
export SMBX_APP_URL=http://127.0.0.1:3000
export SMBX_TOKEN="…"                      # Settings → Connections
npx tsx scripts/studio/push-crm.mts ./crm-bundle
```

Use obviously synthetic firm names when testing. The fixtures used for the
verification above (`Northwind Synthetic Capital`, `Fabrikam Placeholder
Partners`, `Contoso Testco Holdings`, `Litware Dummy Group`, `Adventure Works
Sample LLC`) were written to be unmistakably fake, and were pushed to a scratch
database, never a real one.
