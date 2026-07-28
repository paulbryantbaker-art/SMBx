# The corp-dev documents — what each one is, and how to build it

Four documents come off a market's master. They are the practice's work
product — what an acquirer client is actually paying for. Collateral is a
byproduct; these are the job.

Build them by asking, in a session opened on this workspace:

> Build the market map for home-services.
> Build the target map for home-services from the research in `research/`.
> Build the home-services investment thesis for a family office.

Each lands in `markets/<market>/documents/`. Audit it before it goes anywhere:

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/documents/<doc>.md --against markets/<m>/master.md
```

---

## THE LINE — binds every document here

These go to acquirer clients, so the perimeter is not decorative.

- **Buy-side only.** You write for an acquirer. Never advise a seller, never
  write from a neutral or two-sided position.
- **No specific-target valuations.** Market-level multiples and ranges with
  their sources, yes. A value, price, or "worth roughly X" on a named
  company — never. This is the rule most likely to be broken by accident in a
  target map, where naming a company and discussing price sit close together.
- **No unlicensed opinions** — securities, tax, legal, appraisal. Name the
  specialist to engage and what to ask them. That is the correct move, not a
  hedge.
- **No fee talk.** No retainers, success fees, commissions, compensation.
- **Nothing the source doesn't say.** No invented companies, people,
  transactions, or numbers.
- Lower-middle-market framing: targets under $250M revenue.
- Never criticize a named competitor, bank, or advisor.

## Citation law — same as everywhere

Every figure appears in the source, or is registered in a `## Derivations`
section with inputs, arithmetic and assumption. **A rounded figure is a
different figure.** Conflicting sources keep **both** values and cite both —
never an invented midpoint. Every document ends on **What we don't know yet**.

---

# 1. Market map

*How this market is actually structured and where an acquirer can enter it.*

**Source:** the master.

```
# <the market>, mapped
## How the market is structured
      The operating shape a buyer has to underwrite — how work is won, what
      drives margin. Not a textbook description of the industry.
## Scale and fragmentation
      The size and concentration figures the master reports, each with its
      source. State plainly what is known versus estimated.
## Who is consolidating
      The platforms, strategics and sponsor-backed roll-ups the master names,
      and what each is buying. Named entities only. No valuations of any.
## What a platform looks like here
      The profile of a business worth building around: revenue quality,
      contract structure, customer concentration, licensure, workforce.
      Specific to this trade.
## Where the openings are
      The parts of the market the consolidators are not covering, and why.
      This is the section the client is paying for. Make it a judgment.
## What would make us walk
## What we don't know yet
## Derivations          (only if you inferred a figure)
```

---

# 2. Who's who

*The participants, and what each is actually doing.*

**Source:** the master. **Only entities the master names.** If it names few,
write a short honest document rather than padding it with invented participants.

```
# Who's who in <the market>
## Strategic acquirers          what they own, what they've been buying, what
                                that implies about how they compete for deals
## Sponsor-backed platforms     with their backer where stated, and the pattern
## Notable independents         significant operators not yet consolidated —
                                these are the market, and often the targets
## Who else is at the table     advisors, lenders, insurers, associations,
                                regulators — and what each one gates
## What this tells a buyer
## What we don't know yet
```

Use a markdown table per group where the master gives enough per entity.

---

# 3. Target map — the draft board

*The specific companies worth going after, tiered.*

**This one is different, and the difference matters.**

A market master describes a market. It does **not** contain a target list. The
independents that make good acquisitions are, almost by definition, the
companies nobody wrote a research report about. So:

> **A target map requires its own research input.** Do not build one from the
> master alone — you will produce plausible-sounding companies that do not
> exist, which is the single worst failure mode this practice has.

**If you have target-level research** (a directory pull, a sourcing export, a
research pass on operators in named metros), put it in `research/` and build
from it.

**If you do not**, the document is a **screen specification** instead — and it
says so in its own title. That is a genuinely useful deliverable: it tells the
client exactly what to go find.

## Building the list mechanically

`screen.mts` produces the target-level data the draft board needs, without a
model inventing a single company. Everything it lists came back from Google
Places; everything it tags came out of a register you wrote.

```
npx tsx $REPO/scripts/studio/screen.mts init <market>   # seed the three config files
npx tsx $REPO/scripts/studio/screen.mts pull <market>   # Places → screen/candidates.csv
npx tsx $REPO/scripts/studio/screen.mts rank <market>   # classify, size, score — free, offline
```

Three files in `markets/<m>/screen/` drive it:

- **`screen.md`** — the buy-box (NAICS, states, metros, revenue range) in front
  matter, the search matrix as `## Queries` × `## Geographies`, and the
  review-count→employee proxy that feeds the revenue band.
- **`consolidators.md`** — **the register, and the load-bearing file.** `rank`
  calls a business independent when it is *not in here*, so a thin register
  produces a confident wrong answer. Write it from the master's who's-who:

  > Write `markets/<m>/screen/consolidators.md` from the master's consolidating-
  > platforms section — named entities only, with their brands and domains.

- **`benchmarks.md`** — revenue-per-employee per NAICS. Pin the sources before
  any figure reaches a client document; the seeds are honest placeholders.

`rank` writes `revenue_basis` on every row as a complete derivation — employee
range × revenue-per-employee, naming both assumptions — so a band you carry into
the target map has its `## Derivations` entry already written.

**The list lives in a Google Sheet.** Import `candidates.csv` (File → Import →
Upload), sort and annotate it there, export back over the same file, and re-run
`rank` — columns you added survive untouched.

**Two things `rank` cannot do for you.** It only knows the consolidators you
listed, so check the top of the board by hand before anyone acts on it. And a
band is a screening estimate, never a valuation — the no-specific-target-
valuation rule above still binds, whatever the CSV says.

## What you may keep

Google's terms let you store **place IDs indefinitely** — an explicit carve-out —
but treat the rest (name, phone, rating, review count) as a **temporary cache**.
A CSV parked in a Google Sheet for a year is not a cache. So the board ages:

```
npx tsx $REPO/scripts/studio/screen.mts refresh <market>            re-pull it
npx tsx $REPO/scripts/studio/screen.mts refresh <market> --forget   drop it, keep your work
```

`--forget` clears only the borrowed columns. The place ID, your own columns, and
the affiliation and score judgements are **yours** — those are your analysis, not
Google's data — so they survive, and you can re-pull the rest any time.

**The deeper point: Places is discovery, not evidence.** A target map that cites
"Google rating 4.7" is weak work regardless of anyone's terms. Before a company
name reaches a client document, verify it against a primary source — the state
licence registry, the company's own site, the trade association directory — and
cite *that*. The screen tells you who to go look at; it is not the look.

```
# <market> — target screen                    (when there is no target data)
## The buy-box                  size, revenue mix, contract structure,
                                geography, owner situation — concrete enough
                                to screen against
## Where to look                the metros and sub-segments, with the reasoning
                                from the market map
## Disqualifiers                what takes a company off the list immediately
## How to source it             the specific directories, associations,
                                licence registries and data sources that would
                                produce this list
## What we don't know yet
```

```
# <market> — target map                       (when there IS target data)
## How this list was built      the sources, the screen applied, the date.
                                A draft board with no provenance is a rumour.
## Tier 1 — fits the buy-box    per target: what they do, where, size signal
                                WITH ITS SOURCE, why they're interesting, what
                                to check first. NO VALUATION.
## Tier 2 — worth a look        the same, with what would move them up
## Tier 3 — watch               why they're not actionable yet
## Ruled out                    named, with the reason. As useful as the list.
## What we don't know yet
```

**Per-target rules:**

- Every company **named** must come from a source in `research/`. Never
  generate a company name.
- Size signals (employee count, van count, revenue estimate) carry their
  source and their date. An estimate is labelled as one.
- **No valuation, no price, no multiple applied to a named company.** Market
  multiples belong in the market map, not next to a company name.
- No commentary on owners as people. Situation, yes — "founder in his
  sixties, no successor named in the source" — character, no.
- Nothing about willingness to sell unless a source says it.

---

# 4. Investment thesis

*The buy-side case, stated so a principal can act on it or reject it.*

**Source:** the master, plus the market map if one exists.

A thesis that cannot be falsified is worthless. Make it specific enough to be
wrong.

## One market, several theses

A thesis is not a description of a market — it is a **position**, and a position
is held *for someone*. The same home-services research supports a different case
for a family office holding forever than for an independent sponsor underwriting
a five-year exit: different hold period, different leverage, different definition
of a good business. So a market carries **one thesis per buyer profile**, named
for that profile:

```
markets/home-services/documents/
    thesis-family-office.md
    thesis-independent-sponsor.md
    thesis-strategic-platform.md
```

Scaffold one — this stamps it with the market's current master version, which is
what makes staleness checkable later:

```
npx tsx $REPO/scripts/studio/thesis.mts new home-services family-office
```

Each thesis opens with front matter recording what it rests on:

```
---
market: home-services
profile: family-office
master_version: 2        ← the master version this position was built from
date: 2026-07-27
status: draft            ← draft · active · retired
---
```

**`master_version` is the load-bearing field.** When the master is re-synthesized
to v3, every thesis still stamped v2 is resting on facts that have moved — and
that is now a fact on disk rather than something to remember:

```
npx tsx $REPO/scripts/studio/thesis.mts list        # every thesis, with standing
npx tsx $REPO/scripts/studio/thesis.mts check       # same, exits 1 if an ACTIVE one is behind
npx tsx $REPO/scripts/studio/thesis.mts register    # rewrite THESES.md at the workspace root
```

Run `register` after writing or revising one. `THESES.md` is generated — edit the
theses, never that file.

When you bring a thesis current, re-read it against the new master, change what
moved, and update `master_version` to the version you actually read.

## What the master cannot tell you

The market research describes a market. It does not know your buyer's hold
period, leverage tolerance, check size, operating bench, or what they consider a
good business. Those inputs are what make this thesis different from the one
held for the next buyer — and they decide two whole sections (*What we would buy*
and *How value is created after close*).

**So ask for them. Do not infer them from the research.** The scaffold opens with
a `## The buyer` block for exactly this; fill it from the mandate before writing
anything below it. A session that skips it will quietly invent a buyer's
preferences, and unlike an invented figure, nothing mechanical will catch it —
`audit.mts` checks numbers, not prose.

```
# <the market>: investment thesis — <buyer profile>
## The thesis in one paragraph   the claim, plainly. What we believe and what
                                 follows.
## Why this market, now          the structural conditions, with figures and
                                 sources. Separate durable structure from
                                 cyclical noise.
## What we would buy             the acquisition profile, concrete enough to
                                 screen against
## How value is created after close
                                 the specific operating moves that justify the
                                 price, in this trade. Not "professionalize the
                                 back office" — what actually moves margin here.
## What has to be true           the load-bearing assumptions, each stated so
                                 it can be tested. If one is false, the thesis
                                 fails. Mark each: [ ] untested · [?] testing ·
                                 [~] partial · [x] confirmed — `register` pulls
                                 these into THESES.md as the standing work list.
## What would kill it            the real risks specific to this trade, not a
                                 generic risk register
## How we would test it          the diligence that would confirm or break it,
                                 and the order to do it in
## What we don't know yet
```

---

# Turning any of these into something you send

They're markdown, so they render like anything else:

```
npx tsx $REPO/scripts/studio/build-report.mts markets/<m>/documents/thesis.md \
  --out markets/<m>/collateral --slug <market>-thesis
```

Add a cover block at the top of the document for the branded treatment —
byline, headshot, stat cards, a hero image. See the worked examples in
`$REPO/scripts/studio/reports/`.

A thesis or market map going to a client should be a **report PDF**. The
carousel and one-pager are for LinkedIn.
