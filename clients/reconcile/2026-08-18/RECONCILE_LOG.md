# RECONCILE LOG — clients register

Newest first. One section per run.

---

## 2026-08-18 · `2026-08-18-client-register-v1.csv` → `crm-bundle/02_organizations.csv`

**Run by hand.** `reconcile.mts` is specced (`SMBx/RECONCILE_SPEC.md`) and not
built, so the spec's ladder was executed manually. **The register was NOT
modified** — the merge needs four decisions that are Paul's, listed at the
bottom. The candidate file is landed unmodified at
`clients/candidates/2026-08-18-client-register-v1.csv`; nothing is lost.

```
candidates in   225
register in      81
register out     81   (unchanged — merge held on the four gates below)

MATCHED          12   (name-only 11 · domain+name 1)
NEW             210
AMBIGUOUS         3
UNMATCHABLE       0
DROPPED           0
                ---
                225   arithmetic closes: 12 + 210 + 3 + 0 == 225  ✓
```

**Register coverage.** 26/81 register rows carry a domain — 68% can only be
matched on the name string. On the candidate side, 125/225 carry a domain.
That asymmetry is why 11 of the 12 matches landed on the `name-only` tier and
only one on `domain+name`.

### AMBIGUOUS — 3, all one failure mode, none auto-merged

Every one is a **sponsor matched against the platform it owns**:

| | Candidate | Matched | Why it is wrong |
|---|---|---|---|
| RQ-001 | Altas Partners | ORG-076 Redwood Services (Altas Partners) | the parenthetical is the sponsor |
| RQ-002 | Gridiron Capital | ORG-072 Legacy Service Partners (Gridiron Capital) | same |
| RQ-003 | Highview Capital | ORG-039 National Fire & Safety (Highview Capital) | same |

**The proof is in the log itself:** ORG-072, ORG-076 and ORG-039 each appear
TWICE — once correctly, matched by the platform's own name (RQ-011, RQ-014,
RQ-012), and once wrongly, matched by the sponsor in its parenthetical. A
register row cannot be two firms.

This is exactly what `RECONCILE_SPEC.md` §5.1 predicts: of the six meanings a
parenthetical carries, the **sponsor** must be stripped for the match key and
kept as data, never treated as an alias. A first-cut implementation that treated
all parentheticals as aliases produced all three false positives. **The spec's
rule is load-bearing, and this run is its first evidence.**

### MATCHED — 12, every one carrying the same conflict

All twelve collide on `tier`, because the two files use different scales for the
same column name: the register is **A/B/C** (17/36/28), the candidate file is
**1/2/3** (33/52/140). Not a value conflict — a **vocabulary collision**, the
same failure named in `CRM_RESTART.md` as the reason the CRM chrome was blown
up on 16 August.

`tier` is app-owned once re-scored (`COLUMNS.md`, `COALESCE(existing, new)`), so
overwriting it from a candidate file is doubly wrong. Held.

### The eligibility gate — 161 of 225 cannot enter a register today

`STUDIO_ROTATION.md`: *"Every new record starts DISCOVERY. Only primary-source
verification upgrades it, with the confirming source cited. **DISCOVERY records
never touch `research/`, any register, or any master.**"*

```
VERIFIED    64   ->  57 NEW · 6 MATCHED · 1 AMBIGUOUS
DISCOVERY  161   ->  barred from the register by the rule above
```

The bar is correct on inspection. The DISCOVERY rows cite pages like
`ctacquisitions.com/guides/private-equity-hvac-2026/`, `bluwave.net/pe-awards`
and `axiaadvisors.com/private-equity-roofing-platforms/` — content-marketing
listicles and directories, which is the class `sourcing-protection.mts` exists
to catch. 17 of them cite a bare homepage with no path at all.

**So the file is one decision away from adding 57 verified rows**, not 210.

### Scope limits, stated rather than omitted

- Contacts not reconciled — v1 scope, and this file has `contact_name` /
  `contact_title` on many rows that would want it.
- `sponsor_parent`, `trigger_type`, `trigger_date`, `platform_count`,
  `texas_exposure`, `verticals_active`, `states_active`, `last_checked` have **no
  column in `02_organizations.csv`**. They are real research and would be lost in
  a naive append.

### The four decisions — Paul's, not the session's

1. **Which schema is canonical?** Three now exist for one register: the bundle's
   21 columns (names are load-bearing for `push-crm.mts`), this file's 23, and
   the 16 `house/leads.ts` scores. Recommend: the bundle stays the wire format,
   this file's extra columns get added to it, and `leads.mts` is repointed or
   retired.
2. **Which `tier` scale survives** — A/B/C or 1/2/3? One of them has to go.
3. **`account_type` vs `bucket`.** They are different axes, not rival vocabularies:
   `bucket` says whether we pitch them, `account_type` says what kind of capital
   they are. Both are needed, which is the `roles` argument from 18 August in a
   second place.
4. **The DISCOVERY policy.** Hold the 161 in `candidates/` until verified (the
   rule as written), or admit them carrying `verification` as a column with every
   downstream consumer filtering on it.

---

## APPLIED — 2026-08-18, same day

Paul's four answers: **(1)** bundle schema canonical, extras folded in ·
**(2)** `tier` stays **A/B/C** · **(3)** keep `account_type` *and* `bucket`, they
are different axes · **(4)** handed back — resolved below.

```
register    81 rows / 21 cols  ->  139 rows / 31 cols
candidates  (did not exist)    ->  161 rows / 26 cols

  +58 appended   ORG-082 … ORG-139   (57 VERIFIED new + Highview Capital, see below)
    6 merged     in place, org_id and tier kept, notes appended
  161 held       DISCOVERY -> candidates.csv
  ---
  225           58 + 6 + 161 == 225  ✓
```

### Decision 4, resolved — the funnel and the commitment

Not "hold them" or "admit them." **A third place, which the practice already
uses on the market side.** `WHERE_THE_WORK_HAPPENS.md` §6A on the target screen:
*"Building the list is a document job … the moment a target becomes a live
pursuit it becomes a deal row in the app. **The CSV is the funnel; the deal is
the commitment.**"*

The client side now has the same two stages: `clients/candidates.csv` is the
funnel and holds everything including DISCOVERY; `crm-bundle/02_organizations.csv`
is the register and holds VERIFIED only. **Promotion is the verification act**,
which is exactly what `STUDIO_ROTATION.md` already says upgrades a DISCOVERY
record. Nothing rots in a drawer and nothing unverified reaches the outreach
queue.

It is also structurally safe rather than remembered: `push-crm.mts` sends only
`*.csv` **inside** the bundle folder, and `candidates.csv` sits one level up, so
a DISCOVERY row cannot reach `crm_accounts` even by accident. No code change.

`candidates.csv` carries `register_match` — **six held rows already correspond to
a register entry**, so promoting them must merge, not append a duplicate.

### How the merge was applied

| | Rule |
|---|---|
| `org_id` | existing kept on every merge; new rows continue `ORG-082…139` |
| `tier` | existing kept on merges. New rows map `1→A · 2→B · 3→C` |
| `notes` | **appended**, never replaced, as `[2026-08-18 client-register-v1 / P1-0NN] …` |
| `source_url` | new wins; the prior value preserved as a dated `notes` line |
| `city` `state` `website` | filled only where the register cell was empty |
| `segment` | left **blank** on the 15 `P5_SEARCH_FUND_INVESTOR` rows — no clean mapping, and a visible gap beats a guess |
| `bucket` | `CLIENT` on all 58 — every one is an acquirer we would serve, none are referral or ecosystem |

### The three sponsors resolved as separate firms

RQ-001/002/003 were **not** merges. Altas Partners, Gridiron Capital and Highview
Capital each matched the register row of a platform they own, through its
parenthetical. A sponsor and its platform are two entities. Highview Capital was
VERIFIED and is now `ORG-088` in its own right; the other two are DISCOVERY and
sit in the funnel.

### Self-check against the spec's own refusals

```
  duplicate org_id                     none
  duplicate normalized firm key        none
  register rows not VERIFIED           0
```

### Two follow-ups this created

1. **75 of the original 81 rows carry no `verification` value.** They pre-date
   the scale and carry `confidence` (High/Medium/Low) instead. Blank is tolerated
   for now; backfilling them is the honest fix, and until then register coverage
   on this field is 64/139.
2. **`reconcile.mts` should refuse on a register row whose `verification` is
   anything but `VERIFIED` or blank.** Add to `RECONCILE_SPEC.md` §9 — it makes
   the funnel/register boundary mechanical rather than remembered.
