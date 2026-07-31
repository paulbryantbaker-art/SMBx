# RESEARCH — the three hunts

> Paul, 2026-07-31: *"I don't want to get market research mixed up with
> 1. building out a potential client list, 2. building out an acquisition target
> list for clients when I get a client… they all need to be spot on."*
>
> Right, and the first version of this file blurred them. **They are three
> different jobs.** Different sources, different scorers, different outputs, and
> mixing them produces the worst artifact this practice can make: a list of
> companies that looks authoritative and is actually a category error.

| | **A · CLIENT HUNT** | **B · MARKET HUNT** | **C · TARGET HUNT** |
|---|---|---|---|
| Looking for | Acquirers to **serve** | How a market **works** | Companies for a client to **buy** |
| For whom | The practice's own pipeline | An engagement's foundation | One named client |
| Sources | Sponsor sites, PR wires, Axial, SBIA roster | Census/BLS, regulators, platform disclosures | State licence registries, associations, Places |
| Scored by | `house/leads.ts` (`leads.mts`) | Not scored — **audited** (`audit.mts`) | `house/screen.ts` (`screen.mts`) |
| Output | Register CSV → app **Clients** | `markets/<m>/master.md` | `markets/<m>/screen/candidates.csv` |
| Needs first | Nothing | Nothing | **A client, a buy-box, and B** |

**The engagement sequence is B → thesis → C.** You cannot build a defensible
target list without understanding the market, and you cannot write a thesis
without one either. A is separate from all of it — it is how you get the client
in the first place.

**Never do C from B alone.** A market master contains no target list. Deriving
one from it invents companies, which is the single worst failure mode here.

---

# The run discipline — all three hunts

Any of these is 15–25 runs across several hours and will outlive a session. So
all three obey the same rules.

### The frame, before any searching

`<folder>/research/00-frame.md`. Ten minutes, and every later run inherits it:

```markdown
# Frame — <hunt A/B/C> · <subject>
hunt:       clients | market | targets
for:        <the practice, or the named client>
scope:      <segments × trades, or trade × geography, or the buy-box>
question:   <the ONE question this must answer>
decided:    <what changes depending on the answer>
```

If `question` and `decided` cannot be filled, **stop**. Twenty runs answering
nothing is the expensive mistake, and this is where it gets caught.

### One file per run, never overwritten

`research/NN-topic-source.md`, opening with what produced it:

```markdown
<!-- run: 07 | hunt: clients | date: 2026-08-01
     query: "independent sponsor" "fire protection" platform site:axial.net
     tool: web search + fetch -->
```

That header is what lets a figure be traced six months later, when a client
questions it.

### The log, updated after every run

`research/_log.md` — a row per run, plus a **coverage table** whose rows are the
slots the output needs (below, per hunt). The coverage table is the resume point
and the stop condition.

### Never synthesize mid-gather

Writing the output after two passes produces a confident document about a
subject you have half-read, and the confident half is indistinguishable from the
rest. Gather everything, then write once.

### Citation law

Every figure appears in a source or is registered in `## Derivations` with its
arithmetic. **A rounded figure is a different figure.** Conflicting sources keep
**both** values — never an invented midpoint. Every output ends on *What we don't
know yet*.

### When to stop

Not "when it feels thorough". Two tests: every coverage row is `ok` or named
explicitly as unknown, **and** two consecutive runs on a slot return nothing new.

---

# A · CLIENT HUNT — acquirers to serve

**This is not market research and it is not a target list.** You are prospecting
for the practice's own business: firms that buy companies in trades we can speak
to, and that need what we sell.

Lands in `clients/register.csv` (or straight into the app's Clients import).

### What you are actually diagnosing

The columns are easy. **`buyer_moment` is the job**, and it decides the ranking:

- **`thesis_no_flow`** — they have declared what they want to own and cannot
  fill it. *This is the sale.* Evidence: a stated mandate plus a thin or stalled
  add-on record.
- **`capital_no_thesis`** — capital looking for a lane. Longer cycle, real work.
- **`has_both`** — a declared thesis AND a live cadence of add-ons. They already
  have the function in-house. **Hardest sale on the list, not the best lead** —
  do not let an impressive firm read as a good prospect.

Diagnose from their own disclosures, not from impression: a portfolio page plus
a dated add-on history tells you which of the three they are.

### Sources, in priority order

1. **The firm's own site** — portfolio page, stated mandate, named principals.
   This is `grade: primary` and it is the only source that discounts nothing.
2. **PR wires** (PR Newswire, BusinessWire) — platform formations and add-ons
   with dates. Dates are what separate `has_both` from `thesis_no_flow`.
3. **Trade press** — `grade: trade`, ×0.92.
4. **Axial, SBIA independent-sponsor roster, family-office directories** —
   `grade: directory`, ×0.80. A directory-only firm is a **research task**, not
   a hot lead.

### The columns to fill

`firm · segment · website · hq_city · hq_state · trades · dfw · grade ·
buyer_moment · product_fit · key_person · key_person_title · sponsor · evidence ·
source_url · notes`

`evidence` is a sentence quoting what the source actually says. `notes` is where
your judgement goes — it is never dropped.

### Coverage table

Rows are **segment × trade**: independent sponsor, family office, permanent
capital, holdco, PE fund, platform, strategic — against the trades we hold a
master for. A hunt is done when each cell is worked, not when the list feels
long.

### Rank it

```
npx tsx $REPO/scripts/studio/leads.mts rank clients/register.csv --top 25
```

Free and offline. Re-run as often as you like. The printed picture tells you the
truth about the list — if 75% come back `has_both`, you found active
consolidators, not prospects, and the hunt needs re-aiming.

**The known limit:** the model ranks FIT, not whether a buyer is real. No column
records whether a firm has ever closed a deal, so a well-written site with zero
acquisitions scores like an active buyer. Fill `last_deal_on` as you verify.

---

# B · MARKET HUNT — how a market works

**This is not a list of companies.** It is the understanding a thesis and a
target list both rest on. Six passes, lands in `markets/<m>/master.md`.

Coverage rows are the market-map sections from `PLAYBOOK.md`: *how the market is
structured · scale and fragmentation · who is consolidating · what a platform
looks like here · where the openings are · what would make us walk*.

### Pass 1 — Structure and scale (3–4 runs)
- Establishment and employment counts by NAICS and geography — **Census County
  Business Patterns**, **BLS QCEW**. Record the vintage.
- Revenue-per-employee benchmarks, if you will band revenue in hunt C.
- **The regulatory layer, which in the trades IS the moat**: licence regimes,
  inspection and testing mandates, code adoption cycles (NFPA, IMC, IECC — name
  the edition the state is on). Recurring revenue a **code requires** is a
  different asset from recurring revenue a customer chooses.

### Pass 2 — Who already owns what (5–6 runs, the longest)
Platform by platform: sponsor, footprint, brands, **add-on cadence as dates**.
Own newsroom → sponsor portfolio page → PR wire → trade press → directory.
Record what each is **not** buying — that is the opening.

Write it into `markets/<m>/screen/consolidators.md` as you go, in the register
format `house/screen.ts` parses. Hunt C needs it to tell an independent from an
owned business, and this is the same knowledge.

### Pass 3 — Operating economics (3–4 runs)
**Highest fabrication risk in the job.** Labour and wage inflation (QCEW, BLS
OES — not a vibe about "tight labour"), insurance, fleet, bonding, parts.
Multiples with their sources.

### Pass 4 — The gap sweep (1–2 runs)
One targeted run per coverage row still thin. The pass people skip; the one that
makes a map defensible.

### Pass 5 — Synthesize and audit (no searching)
```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md
```
Exit `0` clean · `1` not clean · **`2` NOT AUDITED** (no machine-readable
source — not the same as passing). **It checks NUMBERS, not prose** — a
fabricated qualitative claim carries no figure and passes, so the honest read is
still yours.

Then derive the documents per `PLAYBOOK.md`, and audit each against the master.

---

# C · TARGET HUNT — companies for a client to buy

**Only start this when all three exist:** a named client, their buy-box, and a
market master (hunt B). Lands in `markets/<m>/screen/candidates.csv`.

### Sources, in priority order

1. **The state licence registry is the authoritative list** — every licensed
   contractor, from the regulator. Fire marshal, contractor board, whichever
   governs the trade. **Start here, not with a search engine.**
2. **Association member directories**, state and national.
3. **A Places sweep** for coverage cross-check only:
   ```
   npx tsx $REPO/scripts/studio/screen.mts pull    # then: rank
   ```
   **Places is DISCOVERY, not evidence.** Verify a name against the licence
   registry or the company's own site before it reaches a client document, and
   cite that.
4. **`consolidators.md` from hunt B** — used to EXCLUDE, not to find.

### The two things that must not be guessed

- **Affiliation is a register lookup, not a judgement.** Match on brand-in-name
  or website domain against `consolidators.md`. Never on phone number —
  franchise locations carry local numbers, and a miss that looks like
  independence is the expensive error. An unfilled register parses EMPTY, so
  everything reads `unknown` rather than falsely `independent`.
- **Revenue is a band with its arithmetic attached** — employee range × NAICS
  revenue-per-employee, emitting its own `## Derivations` entry. No benchmark or
  no employee proxy returns **no band**, never a guess.

### Retention

Google's terms let you keep place IDs indefinitely but treat name/phone/rating
as a temporary cache. Rows carry `fetched_at`; `rank` warns past 30 days;
`refresh` re-pulls and `--forget` clears the borrowed columns while keeping the
place ID, your own columns and your affiliation/score judgements.

### Coverage table

Rows are **query × geography** from `screen.md`. Done when each cell is pulled
and `rank` is stable across two runs.

### Before a name goes in a client document

Verified against the licence registry or the company's own site — and **no
specific-target valuation, ever** (THE LINE). Market-level multiples with
sources, yes. "Worth roughly X" on a named company, never.

---

# Where all three run

**Cowork, on Paul's own subscription.** The same searching through the app's
`researchAgent` bills at $10/1,000 searches plus fetched pages re-entering
context on every resume round — $5–15 a run, so a 20-run hunt is $100–300.

The output is the same artifact either way, and the app imports both registers:
the client register into **Clients**, and `candidates.csv` into the screen.
**Search outside, manage inside.**
