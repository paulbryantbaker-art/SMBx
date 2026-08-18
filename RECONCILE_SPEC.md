# RECONCILE_SPEC.md — `reconcile.mts`, the register merge

**Spec written 2026-08-18. Nothing below is built yet.** Companion to
`CRM_BRIDGE.md` (the app-side contract this sits one layer upstream of) and
`~/Documents/smbx-studio/clients/crm-bundle/COLUMNS.md` (who owns which column).

Build order: `house/reconcile.ts` first, pure and tested. The CLI is thin.

---

## 1. What it is

Candidate rows + the existing register in → **merged register, a review queue,
and a log of what it did** out.

```
house/reconcile.ts                  pure. no fs, no network, no DB, no model.
scripts/studio/reconcile.mts        the CLI. does the fs, nothing else.
house/__tests__/reconcile.test.mts  npm run test:reconcile
```

Same shape as `house/audit.ts`+`audit.mts`, `house/screen.ts`+`screen.mts`,
`house/leads.ts`+`leads.mts`. The pure half exists so a cloud session with no
disk can still test it, and so there is exactly one implementation of the
matching rules. **`dealexplorer.html` is the counter-example** — it re-derived
deal math in a second file because `house/` had none, and now two engines must
agree about what a deal is worth.

---

## 2. The problem, measured against the real register

`crm_accounts` upserts on `(user_id, lower(firm))` — exact lowercase string
equality on the firm name. That **is** the entity matching in this system today.
Measured against the 81 live rows in `clients/crm-bundle/02_organizations.csv`:

- **55 of 81 rows carry no website** (68%). Domain matching covers under a third
  of the register. Any coverage number must say this out loud.
- **17 of 81 firm names carry a parenthetical or a slash** — every one of which
  breaks `lower(firm)` against a differently-written candidate.

A later run emitting `Capital Southwest` instead of
`Capital Southwest (NASDAQ: CSWC)` creates a second row, silently. Merging it
afterwards means adjudicating which row's stage, next action and touch history
survives. **That is why this is built before the next research run, not after.**

---

## 3. Scope — v1

**Organizations only.** `02_organizations.csv`. Contacts are a different problem
(person + firm, and a person moves firms), and pretending otherwise produces a
tool that is confidently wrong about half its input.

**This limit is logged on every run**, per the no-silent-caps rule: the log
prints `contacts: not reconciled (v1 scope)` rather than omitting them.

---

## 4. Two verbs

```bash
export REPO=~/Documents/GitHubRepos/SMBx-live/SMBx
cd ~/Documents/smbx-studio/clients

npx tsx $REPO/scripts/studio/reconcile.mts propose --candidates <file.csv>
npx tsx $REPO/scripts/studio/reconcile.mts apply   --queue reconcile/<date>/review-queue.csv
```

| Verb | Reads | Writes |
|---|---|---|
| `propose` | `--candidates`, `--register` (default `./crm-bundle/02_organizations.csv`) | the register **in place** (MATCHED merges + NEW appends only) · `reconcile/<date>/review-queue.csv` · `reconcile/<date>/RECONCILE_LOG.md` |
| `apply` | a review queue whose `decision` column is filled | the register in place · appends an `## Applied` section to that run's log |

`--dry-run` on either: compute everything, write nothing, print the log to
stdout. **`propose` never touches an AMBIGUOUS row.** `apply` only ever acts on
rows carrying a decision. The destructive step is gated behind a human filling
in a column.

**The register is rewritten in place, which is the point.** With the register in
git, the merge is a diff you read before it lands — `WHERE_THE_WORK_HAPPENS.md`
§6A: *"an agent that rewrites a master with no diff to read is a liability, one
that opens a PR is a colleague."*

---

## 5. Matching — reuse, do not rewrite

`house/screen.ts` already has the matcher. **Export two more symbols from it and
import them; do not copy them.**

```ts
const norm = (s: string) => …          // line 100 — NOT exported today. Export it.
function wordMatch(h, n): boolean      // line 163 — NOT exported today. Export it.
export function normDomain(s): string  // line 105 — already exported.
```

Two entity-matchers that disagree is how a coverage number starts depending on
which reader you asked — the failure `rank` already guards against by printing
`SKIPPED` when its two readers disagree.

### 5.1 The parenthetical is not one thing — classify it, never blind-strip it

All six of these are in the live register. A blanket `\([^)]*\)` strip destroys
four of them.

| Meaning | Live examples | Rule |
|---|---|---|
| **Ticker** | `(NASDAQ: CSWC)` · `(NYSE: MAIN)` · `(NASDAQ: LOB)` · `(NASDAQ: HBAN)` | Strip. Pattern `\((NYSE|NASDAQ|AMEX|OTC|OTCMKTS)[:\s][^)]*\)` only. Safe — a ticker is never a name. |
| **Sponsor** | `(Highview Capital)` · `(Gridiron Capital)` · `(OMERS)` · `(Altas Partners)` · `(Alpine/Partners Group/Apollo)` | **Do not discard.** Strip for the match key, emit as a proposed `sponsor` value in the review queue. It is research, and it is the affiliation answer. |
| **Parent** | `(Gulf Coast Bank & Trust)` | Alias candidate. |
| **Rebrand** | `(now Cherry Bekaert)` | Alias candidate, and flag it: `now …` means the parenthetical is the CURRENT name. A candidate row saying "Cherry Bekaert" must MATCH this row, not create a new one. |
| **Expansion** | `A.R.I. (Applied Real Intelligence) Senior Secured…` | Alias candidate. Mid-string, so a trailing-only strip misses it. |
| **Redaction** | `(name undisclosed)` | **Not a name.** Excluded from matching entirely, can never match, never auto-merges, and is named in the log every run. |

Slash forms are two aliases for one entity: `Genesis Park / GP Capital
Partners`, `Serata Capital Partners / Calidant Capital`, `Centerfield Capital /
Centerfield`. Split on ` / `, ` | `, ` dba `, ` d/b/a `.

Legal suffixes strip from the key: `llc l.l.c. lp l.p. inc corp corporation co
ltd plc llp`, trailing, iteratively. **`Holdings`, `Group`, `Partners`,
`Capital`, `Management` do NOT strip** — they distinguish real firms.

### 5.2 The ladder

Strongest first. First hit wins, and the tier that fired is recorded on the row.

| # | Signal | Verdict |
|---|---|---|
| T0 | `org_id` equal | **MATCHED** `source_key` |
| T1 | `normDomain` equal **and** stripped names equal | **MATCHED** `domain+name` |
| T2 | `normDomain` equal, names differ | **AMBIGUOUS** `possible-rebrand` — the case the whole system exists to catch |
| T3 | Stripped names equal, both domains present and differing | **AMBIGUOUS** `same-name-two-domains` |
| T4 | Stripped names equal, one or both domains absent | **MATCHED** `name-only` — counted separately, because 68% of the register lands here |
| T5 | Any alias equals any alias | **MATCHED** `alias` |
| T6 | `wordMatch` containment either direction, needle ≥ 5 chars | **AMBIGUOUS** `token-containment` |
| T7 | Edit distance ≤ 2 on the stripped key | **AMBIGUOUS** `near-miss` |
| T8 | nothing | **NEW** |

**T4 auto-merges deliberately.** Refusing it would make reconcile stricter than
the database it feeds, send every row to review, and get the tool switched off.
It is flagged and counted, not hidden.

**T7 can only ever move a row from NEW to review, never from review to merged.**
State that invariant in a test.

**The short-token rule carries over.** `screen.ts` discards needles under five
characters because `ARS` and `One` collide with ordinary words. Reconcile does
the same and **names every candidate whose key was too short or too generic to
match on** — stated, not assumed.

---

## 6. Merge policy — must not fight the loader

Read `crm-bundle/COLUMNS.md`. It is decided there against the COALESCE policy
already in the code; reconcile implements the same rule one layer up.

| Column | On a MATCHED row |
|---|---|
| Fact columns (`firm_type` `segment` `bucket` `city` `state` `website` `check_size` `ebitda_range` `vertical_fit` `internal_corpdev` `buyside_signal` `signal_date` `confidence`) | New non-empty wins. New empty → keep existing. **A blank never erases.** |
| `org_id` | Existing wins, **always**. Never reassign — it is the key `parseTargets` resolves step targeting against, and moving it silently re-points every targeting expression. |
| `tier` | Existing wins. It is the app's after a re-score. |
| `notes` | **Append, never replace.** New content lands as a dated line. `notes` carries the sharpest judgement in the file — "MOST EXPLICITLY DFW-ACTIVE SPONSOR IN THE SCAN" — and replacing it destroys analyst work that exists nowhere else. |
| `source_url` | New wins; the old one is preserved as a dated `notes` line. A changed source_url is evidence something moved. |
| `firm` · `website` · `city` · `state` | If both non-empty and different → **the row merges, but that field is held in the review queue as a CONFLICT.** Identity fields are not silently refreshed. |

A row can therefore be MATCHED and still have fields awaiting review. That is
correct; do not collapse it.

**NEW rows** get the next free `ORG-NNN` (zero-padded to 3, continuing the
existing sequence). Never reuse a retired id.

---

## 7. `review-queue.csv`

One row per held item. CSV because Paul adjudicates in a sheet; it lives in git
so the adjudication is reviewable.

```
queue_id,kind,reason,candidate_firm,candidate_domain,candidate_row_json,
register_org_id,register_firm,register_domain,match_tier,confidence_note,decision,decided_by,decided_on
```

`kind` ∈ `AMBIGUOUS` · `CONFLICT` · `UNMATCHABLE` · `ALIAS_PROPOSAL`

**`decision` is a fixed vocabulary — anything else is a refusal, by name.** Fixed
sets are the house pattern (`loss_reason`, the quarterly direction words):

| Token | Means |
|---|---|
| `merge:ORG-0NN` | the same firm as that register row — merge under §6 |
| `new` | a genuinely different firm — append with a fresh `org_id` |
| `skip` | leave the register alone; re-raise next run |
| `disqualify` | append/flag with `bucket=ECOSYSTEM_DO_NOT_PITCH` |
| `alias:<text>` | record the text as an alias on `register_org_id` |

An empty `decision` is not an error — it means undecided, and `apply` leaves it.

---

## 8. `RECONCILE_LOG.md` — and the one guard that matters most

Newest first, one section per run: date, candidate file, candidate count,
register count before → after.

```
MATCHED    n   (source_key n · domain+name n · name-only n · alias n)
NEW        n
AMBIGUOUS  n   ← every one listed by name, with its tier and both sides
CONFLICT   n   ← every one listed by field
UNMATCHABLE n  ← redacted/short/generic keys, listed
DROPPED    0
```

**The arithmetic must close.** `candidates_in == matched + new + ambiguous +
unmatchable`. If it does not, **exit non-zero and write nothing.**

That single line is the reason this tool exists. The documented bug in this
bridge is exactly the silent `continue`: a wave sheet with a bad header imported
firms fine and reported `0 waves · 0 steps · 0 templates`, byte-identical to
"you sent no waves." A reconcile that drops an ambiguous row quietly rebuilds
that bug one layer upstream.

Also printed every run: **register coverage** — how many rows carry a matchable
domain, in `rank`'s style, because "matched" means nothing without it.

```
  register   81 organization(s)
  coverage   26/81 carry a domain — 68% can only be matched on the name string
```

---

## 9. Refusals — exit non-zero, write nothing

A guard that warns and proceeds is not a guard.

1. Register file missing, unparseable, or empty.
2. Candidate file missing the required `firm` header. **Not a skip — a refusal.**
3. Candidate file carrying an unknown header → named, per the bridge's
   reported-never-silently-dropped rule. Warn, do not refuse.
4. Duplicate `org_id` in the register → the join key is already broken.
5. Duplicate stripped-name key in the register → it already has the disease;
   fix before merging into it.
6. `apply` with an unrecognised `decision` token, or `merge:ORG-XXX` naming a row
   that does not exist.
7. The arithmetic does not close.

---

## 10. Run 0 — the alias backfill, before any candidates

The first useful run takes **no candidates at all**. It reads the 81 existing
rows, extracts the ticker / sponsor / parent / rebrand / expansion / slash forms
from §5.1, and emits them as `ALIAS_PROPOSAL` rows for adjudication.

Paul decides once. After that, matching is durable and the 17 decorated names
stop being landmines. Add an `aliases` column (pipe-separated) to
`02_organizations.csv`; it is a fact column, git-owned, and the loader ignores
unknown columns and names them, so it costs nothing app-side.

---

## 11. Tests — `npm run test:reconcile`

Add to `package.json` beside the other sixteen:
`"test:reconcile": "npx tsx house/__tests__/reconcile.test.mts"`.

Must cover, at minimum, the real cases:

- `Capital Southwest (NASDAQ: CSWC)` ↔ `Capital Southwest` → MATCHED, ticker strip
- `Calvetti Ferguson (now Cherry Bekaert)` ↔ `Cherry Bekaert` → MATCHED via alias
- `Genesis Park / GP Capital Partners` ↔ `GP Capital Partners` → MATCHED via alias
- `National Fire & Safety (Highview Capital)` — sponsor survives as data, is not swallowed
- `Texas HVAC services platform (name undisclosed)` → UNMATCHABLE, never merges
- `Monroe Capital` ↔ `Monroe Capital Partners` → AMBIGUOUS, never auto-merged
- same domain, different names → AMBIGUOUS `possible-rebrand`
- `notes` append preserves the existing text verbatim
- a blank candidate cell never erases a populated register cell
- `org_id` is never reassigned on a merge
- T7 near-miss can move NEW → AMBIGUOUS and never AMBIGUOUS → MATCHED
- arithmetic-close failure exits non-zero and writes nothing
- `apply` with a bad decision token refuses and names the row

---

## 12. What it must never do

Call a model. Touch the app or the database. Invent a firm name, a domain or a
figure. Fill an `UNKNOWN` with a plausible value. Auto-merge an AMBIGUOUS row.
Replace `notes`. Reassign an `org_id`. Push anything — `push-crm.mts` is a
separate, deliberate press.

## 13. Not in v1 — named, not forgotten

Contacts (`01_contacts.csv`). The `crm_accounts.kind` → `roles` migration —
correct in principle, but `idx_crm_accounts_kind` exists, the Clients board
filters `kind='acquirer'`, and the CRM chrome has been behind
`CRM_SURFACES_IN_APP` since 16 August; hold it until the restart spec names what
the screens need. Field-level provenance (`CRM_BRIDGE.md` §6 recommends one
JSONB column) — reconcile should be the thing that eventually writes it.
