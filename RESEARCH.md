# RESEARCH — the three hunts

> Paul, 2026-07-31: *"I don't want to get market research mixed up with
> 1. building out a potential client list, 2. building out an acquisition target
> list for clients when I get a client… they all need to be spot on."*

They are three different jobs. Different sources, different scorers, different
outputs, and mixing them produces the worst artifact this practice can make: a
list of companies that looks authoritative and is a category error.

|  | **A · CLIENT HUNT** | **B · MARKET HUNT** | **C · TARGET HUNT** |
|---|---|---|---|
| Looking for | Acquirers to **serve** | How a market **works** | Companies for a client to **buy** |
| For whom | The practice's own pipeline | An engagement's foundation | One named client |
| Sources | Sponsor sites, PR wires, Axial, SBIA roster | Census/BLS, regulators, platform disclosures | State licence registries, associations, Places |
| Scored by | `house/leads.ts` (`leads.mts`) | Not scored — **audited, then verified** | `house/screen.ts` (`screen.mts`) |
| Lands in | `clients/register.csv` | `markets/<m>/master.md` | `markets/<m>/screen/candidates.csv` |
| Needs first | Nothing | Nothing | **A client, a thesis, a buy-box, and B** |
| Confidential | No | No | **The tiered board is. See § C.** |

**The engagement sequence is B → thesis → C.** You cannot build a defensible
target list without understanding the market, and you cannot write a thesis
without one either. **A is separate from all of it** — it is how you get the
client in the first place, and it runs on its own clock.

**Never do C from B alone.** A market master contains no target list. Deriving
one from it invents companies, which is the single worst failure mode here.

**Where each one files** (the layout is market-first — see CLAUDE.md):

```
A → clients/register.csv                          the prospect board, house-wide
B → markets/<m>/research/  →  markets/<m>/master.md
C → markets/<m>/screen/candidates.csv             market-level, public sources
    deals/<engagement>/analysis/target-map-<market>.md   the TIERED board — client work
```

The split in C is deliberate and it is decided (Paul, 2026-07-31). The screen is
public-source discovery of a market and it is reusable; the tiered board is
written against one client's buy-box and it is confidential. They are not the
same document and they do not live in the same place.

---

# The run discipline — all three hunts

Any of these is 15–25 runs across several hours and will outlive a session. So
all three obey the same rules.

### The frame, before any searching

`<folder>/research/_meta/frame.md`. Ten minutes, and every later run inherits it:

```markdown
# Frame — hunt <A|B|C> · <subject>
hunt:       clients | market | targets
for:        the practice, or the named client
scope:      segments × trades, or trade × geography, or the buy-box
question:   the ONE question this must answer
decided:    what changes depending on the answer
```

If `question` and `decided` cannot be filled, **stop**. Twenty runs answering
nothing is the expensive mistake, and this is where it gets caught.

**Why `_meta/` and not the flat folder.** `audit.mts` reads every `.md` and
`.txt` one level down in `research/` **as a source**. A frame carrying a buy-box
revenue range is not a source — but leave it flat and a `$2M` in the master
traces to it and audits green. That is a laundering path into the one check this
practice relies on. `audit.mts` does not recurse, so a subfolder is invisible to
it, which is wrong for research and exactly right for process files.

> **This is the single exception to the flat-research law.** `research/` stays
> flat for everything else, because anything in a subfolder is silently never
> checked against — thirteen fire-safety research files sat in
> `research/FireSafetyResearch/` on 2026-07-29 for precisely that reason.
> `_meta/` holds `frame.md` and `log.md`. Nothing else. A read goes flat.

### One file per run, never overwritten

`research/NN-topic-source.md`, opening with what produced it:

```markdown
<!-- run: 07 | hunt: B | date: 2026-08-01
     query: "fire protection" inspection mandate NFPA 25 site:*.gov
     tool: web search + fetch -->
```

That header is what lets a figure be traced six months later, when a client
questions it. **Keep the source URLs inside the file** — `audit.mts` checks that
they survive into the master and will tell you when they have not.

### The log, updated after every run

`research/_meta/log.md` — a row per run, plus a **coverage table** whose rows are
the slots the output needs (below, per hunt). The coverage table is the resume
point and the stop condition. It is what makes a hunt survive a session ending
mid-way: read it, find the first row that is not `done`, continue from there.

### Never synthesize mid-gather

Writing the output after two passes produces a confident document about a
subject you have half-read, and the confident half is indistinguishable from the
rest. Gather everything, then write once.

### Citation law

Same as everywhere, and it binds during gathering, not just at the end. Every
figure appears in a source or is registered in `## Derivations` with its
arithmetic. **A rounded figure is a different figure.** Conflicting sources keep
**both** values — never an invented midpoint. Every output ends on *What we
don't know yet*.

### Never generate a company name, a domain or a figure

Not one that seems right, not one that is probably right. In a register, a
plausible invented domain is worse than a missing one: a missing domain is
visibly a gap, an invented one is silently wrong. When you cannot verify
something, leave it empty and say you left it empty.

### When to stop

Not "when it feels thorough". Two tests: every coverage row is `ok` or named
explicitly as unknown, **and** two consecutive runs on a slot return nothing new.

---

# A · CLIENT HUNT — acquirers to serve

**This is not market research and it is not a target list.** You are prospecting
for the practice's own business: firms that buy companies in trades we can speak
to, and that need what we sell.

Lands in `clients/register.csv`. It is a house asset, not client work — nothing
in it is confidential, and no client's mandate ever enters it.

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
   `grade: primary`, and the only source that discounts nothing.
2. **PR wires** (PR Newswire, BusinessWire) — platform formations and add-ons
   with dates. `grade: wire`. Dates are what separate `has_both` from
   `thesis_no_flow`.
3. **Trade press** — `grade: trade`.
4. **Axial, the SBIA independent-sponsor roster, family-office directories** —
   `grade: directory`. A directory-only firm is a **research task**, not a hot
   lead, and the scorer discounts it accordingly.

### The columns

```
firm · segment · website · hq_city · hq_state · trades · dfw · grade ·
buyer_moment · product_fit · key_person · key_person_title · sponsor ·
last_deal_on · evidence · source_url · notes
```

`evidence` is a sentence quoting what the source actually says. `notes` is where
your judgement goes — the scorer never touches either, and neither is ever
dropped.

`leads.mts init` writes the header and a commented column guide. Start there
rather than typing the header from this page.

### Coverage table

Rows are **segment × trade**: independent sponsor, family office, permanent
capital, holdco, PE fund, platform, strategic — against the trades we hold a
master for. A hunt is done when each cell is worked, not when the list feels
long.

### Rank it

```
npx tsx $REPO/scripts/studio/leads.mts init                    # seed the register
npx tsx $REPO/scripts/studio/leads.mts rank --top 25           # the board
npx tsx $REPO/scripts/studio/leads.mts rank --segment "family office"
```

Free, offline, no API. Re-run as often as you like; it rewrites `score`,
`score_basis` and `tier` in place and leaves every column you added untouched,
the same contract `screen.mts rank` has.

**Read the composition block, not just the top of the list.** It prints the
buyer-moment split, and that is the honest read on the hunt: if 75% come back
`has_both` you found active consolidators, not prospects, and the hunt needs
re-aiming rather than extending.

**Two things the scorer cannot do.**

- **It ranks FIT, not whether a buyer is real.** A well-written site with zero
  acquisitions scores like an active buyer. `last_deal_on` is the column that
  fixes this — fill it as you verify, and `rank` flags every row where it is
  empty rather than scoring around the gap.
- **It cannot tell you a firm exists.** Every row traces to `source_url`, and a
  row with no `source_url` is dropped from the board with a warning, not scored.

---

# B · MARKET HUNT — how a market works

**This is not a list of companies.** It is the understanding a thesis and a
target list both rest on. Six passes, lands in `markets/<m>/master.md`.

Coverage rows are the market-map sections from `PLAYBOOK.md`: *how the market is
structured · scale and fragmentation · who is consolidating · what a platform
looks like here · where the openings are · what would make us walk*.

### Pass 1 — Structure and scale (3–4 runs)

- Establishment and employment counts by NAICS and geography — **Census County
  Business Patterns**, **BLS QCEW**. Record the vintage and the table ID.
- Revenue-per-employee benchmarks, if you will band revenue in hunt C.
- **The regulatory layer, which in the trades IS the moat**: licence regimes,
  inspection and testing mandates, code adoption cycles (NFPA, IMC, IECC — name
  the edition the state is on). Recurring revenue a **code requires** is a
  different asset from recurring revenue a customer chooses.

### Sizing cross-checks — before a figure enters the master

**Added 2026-08-17.** Traceability is not sizing discipline. `audit.mts` proves a
number appears in a source; it cannot tell you it is the wrong number for the
market you actually defined. These four run here, at Pass 1, before any size
figure is written down.

- **Substitution test — define the market before sizing it.** One sentence: what
  would a buyer use if this category did not exist? That sentence anchors every
  figure that follows, and it kills the inflated-TAM problem at the definition
  stage instead of at review.
- **Top-down and bottom-up, within 3×.** Every market size gets both builds —
  top-down from a named, attributable source; bottom-up from establishment count
  × realistic spend. Divergence beyond 3× means the definition or an assumption
  is wrong. Investigate it before the figure enters the master, and never split
  the difference: an averaged figure is an invented one, and it audits green
  because both endpoints are cited.
- **Growth ceiling check.** Project any claimed growth rate five years forward.
  If it implies penetration above 30–40% of the serviceable market, the claim
  needs market expansion to hold — a different risk profile than the one the
  figure implies. Say so in the master.
- **Base-rate test.** A projected rate materially above the historical rate
  requires a named structural change. No name, no credit.

### Pass 1b — How the market PERFORMED, by segment, over time (3–4 runs)

**Added 2026-08-12.** Paul: *"how come in none of these reports do we get any
real market YoY performance in any of the segments, HVAC install, service,
plumbing repair and service, etc. This is important in understanding the
market."*

He was right, and the reason was structural rather than a data problem. **Every
pass above gathers a STOCK.** Pass 1 counts establishments and employment at one
date. Pass 2 records who owns what. Pass 3 collects costs and multiples. **No
pass asked how the market performed**, so no master carried it, so every
assessment described a market's shape and none described its direction. A buyer
underwriting a business needs both, and the second is the one that decides
price.

Coverage rows, and each has an instrument:

| Row | Instrument | What it gives |
|---|---|---|
| Employment and wages, by quarter | **BLS QCEW**, 6-digit NAICS, national and county | YoY employment and total wages — the closest thing to a volume series the government publishes for a trade |
| Prices | **BLS PPI**, industry series for the contractor NAICS | YoY price change. Pair with volume or the revenue read is price mistaken for demand |
| Construction volume | **Census Value of Construction Put in Place (C30)**, monthly | New versus improvement, residential versus non-residential — the install-side split NAICS cannot make |
| Equipment shipments | **AHRI** (HVAC), and the trade's equivalent elsewhere | The purest install-demand series that exists. See `home-services/research/dfw-22` — US A/C and heat-pump shipments fell **20%** in 2025, and no master carried it |
| Segment performance at the filers | **10-K / 10-Q segment notes and earnings calls** | The only place service is reported separately from install. Otis service vs new equipment, APi inspection/service vs install, Comfort Systems backlog, Watsco same-store |
| Establishment counts, several years | **CBP**, the same file pulled for 2–3 vintages | Formation and exit, not just a level |

Three rules that make this pass worth running rather than decorative:

- **Volume and price are different questions.** A revenue line that held up
  while unit shipments fell a fifth is price, and price normalises.
- **A filer's segment note is an instrument; an association's shipment count is
  its members' own data.** Both are usable; they are not the same class, and the
  card says which.
- **Divergence is the finding, not the aggregate.** "The market grew 4%" tells a
  buyer nothing. Cooling down 26% while furnaces rose 4% tells them what they
  are buying.

### Pass 2 — Who already owns what (5–6 runs, the longest)

Platform by platform: sponsor, footprint, brands, **add-on cadence as dates**.
Own newsroom → sponsor portfolio page → PR wire → trade press → directory.
Record what each is **not** buying — that is the opening.

Write it into `markets/<m>/screen/consolidators.md` as you go, in the register
format `house/screen.ts` parses. Hunt C needs it to tell an independent from an
owned business, and this is the same knowledge gathered once.

### Pass 3 — Operating economics (3–4 runs)

**Highest fabrication risk in the job.** Labour and wage inflation (QCEW, BLS
OES — not a vibe about "tight labour"), insurance, fleet, bonding, parts.
Multiples with their sources and the outlet that carried them.

### Pass 4 — The gap sweep (1–2 runs)

One targeted run per coverage row still thin. The pass people skip; the one that
makes a map defensible.

### Pass 5 — Synthesize and audit (no searching)

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md
npx tsx $REPO/scripts/studio/crossfoot.mts markets/<m>/master.md
npx tsx $REPO/scripts/studio/quote-check.mts markets/<m>/master.md
```

Exit `0` clean · `1` not clean · **`2` NOT AUDITED** (no machine-readable
source — not the same as passing). Crossfoot recomputes every piece of
arithmetic the master writes out; quote-check requires every quotation to
exist verbatim in `research/`. All three are pure computation and run
anywhere. Or run everything at once: `preflight.mts <market>` (CLAUDE.md, THE
LAWS).

**First session on a new market: class its outlets.** Add the market's trade
press, associations, vendors and operator domains to `DOMAIN_CLASS` in
`$REPO/scripts/studio/sourcing-protection.mts` while gathering, not after.
The guard refuses to verdict (exit 3, NOT ESTABLISHED) when it can classify
fewer than 90% of the corpus's origins — a verdict issued blind reads exactly
like a verdict issued sighted, which is how the fire-safety circle survived
every check.

### Pass 6 — Verify against primary sources (no searching until it fails)

**Do not stop at pass 5.** A clean audit checks *traceability* — that a figure
appears somewhere in `research/`. It cannot tell you the research is wrong, and
a faithfully-carried fabrication audits green.

On 2026-07-27 the home-services master audited clean and **six load-bearing
figures did not survive primary-source verification**: an all-sector buyout
total relabelled as sector-specific, a market size attributed to a Census table
it is not in, a recurring-revenue percentage with no source at all. All of it
was one step from a public post under Paul's name.

The procedure, the worked example and the three failure patterns —
*the relabelled total*, *the laundered citation*, *the corrected-to-another-guess* —
are **CLAUDE.md job 2**. Read it there; it is not duplicated here. Findings go to
`research/verification-pass-<date>.md` as a flat source file, corrections go into
the master's `## A.0.x` ledger, and then the audit runs again.

Two disciplines added 2026-08-12, both learned the expensive way:

- **Verify SENTENCES, not just figures.** The two errors no source check can
  catch — "Service is 35% of its sales" (two verified numbers, false
  assembly) and the A.0.7 band labels (correct sums, wrong names) — are
  sentence-level. So pass 6 reads each load-bearing CLAIM against its
  instrument and quotes the instrument's own line in the verification file,
  not just its number.
- **Hold the instrument.** Where the instrument is a file, keep a local copy
  (`smbx-search/`); otherwise pin URL + retrieval date + exact locator. The
  DFW recount was possible in an hour because `cbp23co.txt` was on disk.

A market hunt is not finished at pass 5. It is finished at pass 6.

Then derive the documents per `PLAYBOOK.md`, and audit each against the master.

---

# C · TARGET HUNT — companies for a client to buy

**Only start this when all four exist:** a named client, a thesis held for them,
their buy-box, and a market master. `screen.mts init` enforces the thesis
precondition and refuses to seed a buy-box without one — that refusal is the
feature, not an obstacle.

### The two outputs, and why they are filed apart

```
markets/<m>/screen/candidates.csv              the screen — public sources, market-level
deals/<engagement>/analysis/target-map-<market>.md   the board — tiered for one client
```

The screen is a pull of a market from public registries and Places. Nothing in
it is confidential and the next engagement in the same market reuses it.

The **tiered board is client work**: the tiering, the ruled-out reasoning and the
what-to-check-first notes are all written against one client's mandate. It is
confidential in both directions — it is never a source for a master, and if it
renders it renders to `markets/<m>/decks/`, never `collateral/`. See the client
confidentiality section of THE LINE in CLAUDE.md.

### Sources, in priority order

1. **The state licence registry is the authoritative list** — every licensed
   contractor, from the regulator. Fire marshal, contractor board, whichever
   governs the trade. **Start here, not with a search engine.**
2. **Association member directories**, state and national.
3. **A Places sweep**, for coverage cross-check:
   ```
   npx tsx $REPO/scripts/studio/screen.mts init <market>
   npx tsx $REPO/scripts/studio/screen.mts pull <market>
   npx tsx $REPO/scripts/studio/screen.mts rank <market>
   ```
   `pull` needs `GOOGLE_PLACES_API_KEY` and spends real money; `rank` is free and
   offline. **Ask Paul before a Places pull.**
4. **`consolidators.md` from hunt B** — used to **EXCLUDE**, never to find.

**Places is discovery, not evidence.** Verify a name against the licence registry
or the company's own site before it reaches a client document, and cite *that*.
"Google rating 4.7" is weak work product whatever anyone's terms say.

### The two things that must not be guessed

- **Affiliation is a register lookup, not a judgement.** Match on brand-in-name
  or website domain against `consolidators.md`. Never on phone number —
  franchise locations carry local numbers, and a miss that reads as independence
  is the expensive error. An unfilled register parses EMPTY, so everything comes
  back `unknown` rather than falsely `independent`. That is deliberate, and it is
  the correct answer when the register has not been written yet.
- **Revenue is a band with its arithmetic attached** — employee range × NAICS
  revenue-per-employee, emitting its own `## Derivations` entry. No benchmark or
  no employee proxy returns **no band**, never a guess. A band is a screening
  estimate and never a valuation, whatever the CSV says.

### Check the top of the board by hand

`rank` only knows the consolidators you listed. "Independent" means "not in the
register" and nothing more, so the top ten is exactly where a thin register shows
up. Eyeball those ten for anything obviously already owned before a single name
reaches the client.

### Retention

Google's terms let you keep place IDs indefinitely but treat name, phone, rating
and review count as a **temporary cache**. Rows carry `fetched_at`; `rank` warns
past 30 days; `refresh` re-pulls and `--forget` clears the borrowed columns while
keeping the place ID, your own columns and your affiliation and score judgements.
Those are your analysis, not Google's data.

### Coverage table

Rows are **query × geography** from `screen.md`. Done when each cell is pulled
and `rank` is stable across two runs.

### Before a name goes in a client document

Verified against the licence registry or the company's own site — and **no
specific-target valuation, ever** (THE LINE). Market-level multiples with their
sources, yes. "Worth roughly X" on a named company, never. This is the rule most
likely to be broken by accident in a target map, where naming a company and
discussing price sit two lines apart.

---

# Where all three run

**Cowork, on Paul's own subscription.** The same searching through the app's
`researchAgent` bills at $10/1,000 searches plus fetched pages re-entering
context on every resume round — $5–15 a run, so a 20-run hunt is $100–300.

The output is the same artifact either way. **Search outside, manage inside.**

# What to ask Paul, not infer

Three things per hunt are his, and asking costs a message where guessing costs a
document that has to be withdrawn:

- **Hunt A** — which segments and trades are in scope, and whether a firm that
  came back `has_both` is worth keeping on the board anyway.
- **Hunt B** — what to do when a headline figure's basis collapses in pass 6.
- **Hunt C** — the buy-box in full (NAICS and trades, states and metros, revenue
  range, the search queries), and approval before any Places pull.
