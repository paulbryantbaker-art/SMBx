# The corp-dev documents — what each one is, and how to build it

Four documents come off a market's master. They are the practice's work
product — what an acquirer client is actually paying for. Collateral is a
byproduct; these are the job.

> **This file is the SPEC, not the method.** It says what a finished document
> contains. It does NOT tell you how to gather what goes in it — that is
> **`RESEARCH.md`**, and it is six passes and roughly twenty runs across several
> hours, usually more than one session.
>
> One check before anything here: `ls markets/<m>/research/`. **Empty or thin
> means you are at the wrong file.** Every document below is derived from the
> master, and the master is derived from that folder. An empty research folder
> does not produce a thin market map — it produces an invented one.
>
> RESEARCH.md carries **three separate hunts** — (A) clients to serve, (B) how a
> market works, (C) targets for a client to buy. The market map, who's who and
> thesis below all come off **B**. The **target map** below is the write-up of
> **C**, and C needs a named client, a thesis, a buy-box and B before it can
> start.

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

**`THE_LINE.md` in this workspace is the full text**, including the referral
register — which question belongs to the CPA, to counsel, to an appraiser, to a
title company, to the licensing board — and the sentence pattern that makes a
referral read as expertise rather than as a hedge. Read it before anything
client-facing. What follows is what binds these four documents specifically.

- **Buy-side only.** You write for an acquirer. Never advise a seller, never
  write from a neutral or two-sided position.
- **No specific-target valuations.** Market-level multiples and ranges with
  their sources, yes. A value, price, or "worth roughly X" on a named
  company — never. This is the rule most likely to be broken by accident in a
  target map, where naming a company and discussing price sit close together.
- **No unlicensed opinions** — securities, tax, legal, appraisal. Name the
  specialist to engage and what to ask them. That is the correct move, not a
  hedge.
- **No fee figures in these documents.** The schedule is real and it is one
  schedule for everyone, but it lives in exactly two places — the **email-gated
  pricing brochure** and the **engagement letter**. Not a market map, not a
  thesis, not a deal memo, and never in chat.
  *(Corrected 2026-08-14. This bullet previously read "Fees may be published",
  quoted "$15,000 to start, then $5,000 a month", and told you to source it from
  `PRACTICE_RECORD.md` — three things wrong at once. Site publication shipped
  2026-08-05 and Paul **reversed it after one day** on 2026-08-06 ("remove the
  public upfront pricing… entirely"). The cadence went quarterly ($15,000 up
  front) on 2026-08-06 and back to **monthly, $5,000 up front** on 2026-08-17 —
  which is exactly why no document in this playbook may carry a figure: the
  schedule has moved three times in a fortnight, and a fee quoted in a market
  map goes stale where a brochure gets rebuilt. And `PRACTICE_RECORD.md` does
  not exist anywhere in the repo — a session told to quote from it either could
  not, or improvised the number, which is the worse branch.)*
  Still forbidden regardless: any sell-side, two-sided or neutral-intermediary
  fee, and any fee comparison to a named bank, broker or advisor.
  *(Also retired, and for a different reason: the older "No fee talk. No
  retainers, success fees, commissions, compensation" absolute was written for
  the licensed-software business, when smbX was an app sold to brokers on a
  membership fee. That business is scrapped; the practice earns a buy-side
  success fee, which THE LINE v2 §Permitted allows. The prohibition here is
  about what these DOCUMENTS say, not about what the practice may charge.)*
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
>
> That research input has its own procedure: **`RESEARCH.md § C — Target hunt`**.
> The state licence registry is the authoritative list, not a search engine;
> Places is discovery, not evidence; affiliation is a register lookup, not a
> judgement. It needs a named client, a thesis held for them, a buy-box and a
> market master before it can start.

## Where the two halves file (2026-07-31, Paul)

The screen and the board are not the same document and they do not live in the
same place:

```
markets/<m>/screen/candidates.csv                    the SCREEN — public sources,
                                                     market-level, reusable
deals/<engagement>/analysis/target-map-<market>.md   the BOARD — tiered against
                                                     one client's buy-box
```

A Places-and-registry pull of a market is public-source discovery; the next
engagement in the same market reuses it. The **tiering** is not: it is written
against one client's mandate, and the ruled-out reasoning is often the most
revealing thing in the document about what that client will and will not do. So
the tiered board is client work — confidential in both directions, never a
source for a master, and it renders to `markets/<m>/decks/`, never
`collateral/`.

Filing a tiered board in `markets/<m>/documents/` is how it quietly gets reused
for the next client. Nothing mechanical catches that: `audit.mts` checks whether
a figure traces, not where it came from.

An **untiered screen specification** — the buy-box shape, where to look,
disqualifiers, how to source it — is a house asset and does belong in
`markets/<m>/documents/`. That is the version below with no company names in it.

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

**Check the top of the board by hand before anyone acts on it.** `rank` calls a
business independent when it is *not in* `consolidators.md` and nothing more, so
the top ten is exactly where a thin register shows up. That check is not
optional and it is not something the script can do for you.

```
# <market> — target screen                    (when there is no target data)
#   → markets/<m>/documents/ — a house asset, no company names
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
#   → deals/<engagement>/analysis/ — client work, renders to decks/
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

## A thesis is held for a client (2026-07-29)

A thesis is not a description of a market — it is a **position**, and a position
is held *for someone*. Paul, 2026-07-29: *"I will need a thesis and each client
may have their own thesis."*

So the thesis is **client-scoped**, and it lives with the engagement, because the
engagement is the unit of work:

```
deals/<engagement>/thesis-<market>.md
```

One per market the client is looking at. A client considering home services and
fire safety carries two, and they can reach opposite conclusions — that is not an
inconsistency, it is two markets.

A **house position** — a view you hold with no client attached yet, useful as
marketing and as a starting draft — still belongs in the market folder, named for
the buyer profile it serves:

```
markets/<m>/documents/thesis-family-office.md
```

Both scopes are scanned by `thesis.mts`. The register shows a house position as
`_house_` in the client column.

```
npx tsx $REPO/scripts/studio/thesis.mts new <market> --client <engagement>
npx tsx $REPO/scripts/studio/thesis.mts new <market> <buyer profile>    # house
```

Front matter records what it rests on. **`market:` is mandatory in a client
thesis** — it has no market folder to be inferred from, and without it staleness
can never resolve, so `thesis.mts` reports `NO MARKET NAMED` rather than
pretending the position is current:

```
---
market: home-services
client: northwind-holdings     ← omit for a house position
profile: family-office         ← still shapes the position; no longer names the file
master_version: 3              ← the master version this position was built from
date: 2026-07-29
status: draft                  ← draft · active · retired
---
```

**`master_version` is the load-bearing field.** When the master is re-synthesized
to v4, every thesis still stamped v3 is resting on facts that have moved — and
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

## The order of work — the buy-box comes LAST

This is the part that was backwards until 2026-07-29, and it cost nothing only
because nobody had run a screen yet.

```
1  research/     gather
2  master.md     synthesize, audit, then VERIFY against primary sources
3  the mandate   ask the client — this is an interview, not a form
4  thesis        the position, written for them
5  screen.md     the buy-box, transcribed from "What we would buy"
6  pull / rank   the target board
```

**A buy-box is a consequence, not a starting point.** `screen.mts init` now
refuses to seed one for a market with no thesis, and says why. The seed it would
otherwise write is `naics: 2382`, Phoenix/Mesa/Tucson — and `pull` spends real
money against a seed without complaining, returning a plausible board for a
market nobody scoped. `--force` exists for genuinely exploratory screening and
prints a warning that the front matter is a placeholder rather than a scope.

## The mandate interview

*The section that makes this thesis different from the one held for the next
client. None of it is in the market research, and an invented hold period is not
catchable — `audit.mts` checks numbers, not prose. So ask, and leave a line blank
rather than guessing. A blank is visible; a guess is not.*

The scaffold writes these unanswered into a `## The mandate` block. Work through
them in conversation rather than sending a questionnaire — most of the value is
in the follow-up, and two of these questions routinely change the whole thesis.

**Capital.** *Sets the hold period, and therefore what counts as a good business.*

- Hold period, and what happens at the end of it. A family office holding
  forever will buy a stable, boring, cash-generative business. A sponsor
  underwriting a five-year exit needs a story a buyer will pay a higher multiple
  for. These are different acquisitions in the same market.
- Equity available now, and where it comes from. Committed fund, balance sheet,
  or raised deal-by-deal — the last one changes the timeline and the certainty a
  seller is being offered.
- Leverage they will actually accept. Not what a lender would offer.
- Check size per acquisition, and total programme. One platform or a rollup.

**Shape of the deal.** *Sets what you screen for.*

- Platform first, or add-on to something they already own. An add-on can be
  smaller and worse-run than a platform, because the platform absorbs it.
- Control required, or will they take a minority.
- Are they buying a job or buying management. This one is worth asking twice —
  the answer people give first is often not the answer their capacity supports.

**Operating capacity.** *Decides "How value is created after close", and it is
the most over-claimed section in any thesis.*

- Can they install a GM, or must the seller stay through transition. If the
  seller must stay, deals with a retiring owner and no second-in-command are out
  — and in the trades that is a large fraction of what is for sale.
- Who runs it on day one. A name, not a plan to hire.
- Systems they would impose versus leave alone.

**Boundaries.** *The cheapest section to get wrong, because it reads as detail.*

- Geography they will genuinely travel to, not aspirationally. Ask how often
  they expect to be on site in year one.
- Trades or sub-verticals explicitly out of scope, and why.
- Hard noes — unionised, litigation history, franchise agreements, environmental.

**Definition of good.** *This is the thesis's actual test.*

- What "a good business" means in their words. Write down their words.
- What they have walked away from before, and why. The most informative answer
  in the whole interview, and the one nobody volunteers.
- What return, over what period, makes this worth doing.

**Timing.**

- What is driving the timeline.
- What happens if they buy nothing this year. If the answer is "nothing", the
  urgency in the room is not real and the thesis should not assume it.

**Confidential.** A mandate is client information. The engagement folder is
never a source for a master, its figures never reach a posted document, and
nothing in it is quoted in public collateral. See THE LINE.

## What the master cannot tell you

The market research describes a market. It does not know your buyer's hold
period, leverage tolerance, check size, operating bench, or what they consider a
good business. Those inputs are what make this thesis different from the one
held for the next buyer — and they decide two whole sections (*What we would buy*
and *How value is created after close*).

**So ask for them. Do not infer them from the research.** The scaffold opens
with a `## The mandate` block carrying the interview above, unanswered. Fill it
from the client before writing anything below it. A session that skips it will
quietly invent a buyer's preferences, and unlike an invented figure, nothing
mechanical will catch it — `audit.mts` checks numbers, not prose.

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

# 5. The deal documents — everything after the LOI

The four documents above are all **pre-LOI**: they decide what market to hunt
in, who is in it, which companies fit, and why a particular buyer should care.
This section is the other side of the line — a named target, a live mandate,
and a client who is about to spend real money.

Two things change once you cross it, and both change how you write:

- **The audience is one buyer's decision, not a market read.** A market map is
  interesting; a deal memo gets signed or walked away from. Write for the
  person who has to defend the decision to a partner or a lender.
- **Everything is confidential.** These live in `deals/<engagement>/`, they are
  never a public source, and nothing from them is reused as collateral. See the
  client-confidentiality law in `CLAUDE.md`.

**THE LINE, sharpened for this phase.** This is where the specialist questions
cluster — a live deal generates more of them in a week than a market master does
in its life. **`THE_LINE.md` §3 is the register**: tax, legal, the five separate
real-estate lanes, business valuation, securities, trade licensing, employment,
insurance and QoE, each with the question to hand over. Two from it that decide
deals in this practice's verticals and are routinely missed — **a trade licence
may not survive a change of control**, and **a one-spouse signature conveys
nothing** in a tenancy-by-the-entirety state.

The perimeter in §THE LINE binds everything here, and three edges get tested
constantly once a deal is live:

- **We advise the BUYER on what a target is worth to them.** That is the job.
  What we never do is issue an opinion of value as though it were an appraisal,
  or advise the seller on price. A range with its working shown is analysis; a
  number presented as *the* value is an appraisal, and that needs a licensed
  appraiser.
- **Deal terms are commercial until they are legal.** Working out the earnout
  mechanics, the escrow, the holdback and the working-capital peg is corp-dev
  work. Drafting the language that binds them is counsel's, and the moment a
  question is "does this clause do what we want", it goes to the attorney.
- **Tax structure goes to the CPA, always.** Asset versus stock, §338(h)(10),
  installment treatment, QSBS — these change the number materially and they are
  jurisdictional. Model the deal both ways if you must, label both as
  *pending confirmation*, and cite the CPA's answer when it arrives.
  `house/deal.ts` deliberately carries no tax surface for this reason.

## 5a. The deal model → `deals/<e>/analysis/<target>-model.md`

**Mechanical, not written.** Do not hand-build a model in markdown and do not
compute returns in your head or in a scratch file — the arithmetic is in
`house/deal.ts`, the same engine the app runs, and a second engine is how two
documents come to disagree about what a deal is worth.

```
npx tsx $REPO/scripts/studio/deal.mts new <engagement> "<target>"   # scaffold the spec
npx tsx $REPO/scripts/studio/deal.mts run deals/<e>/analysis/<t>.deal.mts
npx tsx $REPO/scripts/studio/deal.mts list                          # what is stale
```

The **spec is the artifact you maintain** — `<target>.deal.mts`, money in cents,
rates as decimals. The `-model.md` beside it is output: never hand-edit it,
because the next run overwrites it and your edit is gone. Change an assumption,
re-run, commit the spec. Its `git log` is the negotiation.

Three fields carry more weight than the rest:

- **`earningsSource`** is printed verbatim into the document and read by the
  audit. "Seller's P&L" is not enough — name the document and date it: *"Adj.
  EBITDA per the QoE dated 2026-07-02, tab 3."* If it is still a TODO, the CLI
  warns you, because every figure in the model inherits that provenance.
- **`unknowns`** is always printed, even empty — and an empty list is a *claim*
  that nothing material is unverified. It almost never is.
- **`league`** prints a band from `LEAGUE_MULTIPLES`. Those are **house
  assumptions**, not observed comps, and the document says so on the same line.
  Cite a real comparable before that band informs a price you recommend.

What the model refuses to do, and why you should not work around it: it will
not print an IRR that did not converge, and the straight-line debt paydown it
inherits from the app's canvas flatters exit equity on a long amortization —
the document flags both in place. If a number looks too good, read those notes
before you repeat it.

## 5b. The deal memo → `deals/<e>/analysis/<target>-memo.md`

The document the buyer's decision gets made from. One target, one
recommendation, and enough of the reasoning that a reader can disagree with a
specific assumption rather than with your conclusion.

```
# <target> — deal memo
## The recommendation        proceed / proceed at a lower number / walk, and the
                             price or range it is conditional on. First, not last.
## The business              what it does, for whom, how it makes money. Short.
                             A reader who knows the market should skim this.
## Why this one              what makes it a fit for THIS buyer — the thesis it
                             serves, the gap it fills. Not why the market is good.
## What we would pay         the range, the entry multiple, and what the number
                             is anchored to. Link the model; do not restate it.
## How it gets financed      the structure, the coverage, whose money is at risk.
                             Name the covenant that binds first.
## What we verified          the diligence that is DONE, and what it showed —
                             including what came back worse than expected.
## What would change the answer
                             the two or three findings that would move the price
                             or kill it, each with the diligence that tests it.
## The risks we are accepting
                             the ones that survive diligence and get priced in
                             rather than resolved. Say them plainly.
## What we don't know yet
```

**The recommendation goes first.** A memo that walks through analysis and
arrives at a view in the last paragraph makes the reader do the work twice, and
in practice they skip to the end anyway.

**"What we verified" must include the disappointments.** A memo that reports
only confirmations is not diligence, it is advocacy, and a reader who later
finds the thing you left out stops trusting the rest of it.

**Never restate the model's numbers by hand.** Reference the model document and
let it own the arithmetic. Two places carrying the same figure is two places
that drift, and the one in prose is always the one that goes stale.

## 5c. The diligence plan → `deals/<e>/analysis/<target>-diligence.md`

Written **early** — right after the LOI, before the work starts — because its
job is to decide what would change the answer while there is still time to
find out.

```
# <target> — diligence plan
## What we are trying to disprove
                             the two or three load-bearing assumptions from the
                             thesis and the model. Frame them as falsifiable.
## Workstreams               per stream: what gets checked, what document or
                             party answers it, who owns it, and by when.
                             Financial · Commercial · Operational · Legal · Tax ·
                             Insurance · IT — drop what does not apply, and say
                             you dropped it.
## The specialists           who is doing the licensed work — CPA for the QoE
                             and tax, counsel for the legal review, appraiser
                             where there is real property. Named, with scope.
## What would stop the deal  the findings that are disqualifying rather than
                             priceable, agreed with the client IN ADVANCE.
## Sequence                  what has to come back before the next money is
                             spent. Cheap disqualifiers first.
## What we don't know yet
```

**"What would stop the deal" is agreed before the work starts, not after.**
Deciding a finding is tolerable while looking at a fee already spent is how
buyers talk themselves into deals.

**Sequence by what kills the deal cheapest.** A $25k QoE that runs before a
$500 licence check is a fee spent to discover something a search would have
told you in an afternoon.

## 5d. The term framework → `deals/<e>/analysis/<target>-terms.md`

**This is not an LOI, and it is not a draft of one.** It is the commercial
position the practitioner takes to counsel so that counsel drafts once. Nothing
in this document is legal language, and it says so at the top.

```
# <target> — term framework
> Commercial positions for counsel to paper. Not legal language, not an offer.
## Price and structure       the number, cash at close, and what the rest is
## Consideration mix         seller note, rollover, earnout — amount and why
## The earnout, if any       metric, measurement window, who computes it, and
                             what happens on a dispute. The mechanics, not the
                             clause.
## Working capital           the peg, how it is measured, the collar. Reference
                             the model's peg section rather than re-deriving it.
## Escrow and holdback       amount, duration, what it secures
## What the seller keeps     excluded assets, real property, personal items
## Transition                the seller's role after close, for how long, paid how
## Conditions                what has to be true at signing and at closing
## Open for counsel          the questions we are explicitly handing over
## What we don't know yet
```

**"Open for counsel" is a required section, not an optional one.** It is the
list that keeps this document on the right side of the line, and an empty one
means you have almost certainly answered a legal question yourself.

**The earnout is where most value is lost.** Say who computes the metric and
what happens when the parties disagree. A payout formula with no dispute
mechanic is a lawsuit with a number attached.

---

# Turning any of these into something you send

They're markdown, so they render like anything else:

```
npx tsx $REPO/scripts/studio/build-report.mts markets/<m>/documents/thesis.md \
  --out markets/<m>/decks/<market>-thesis/$(date +%F) --slug <market>-thesis
```

A thesis is written **for one buyer profile** and goes to a named acquirer, so
it renders into that market's `decks/` — client-direct, not posted. Only send
something to `collateral/` when it can be published anywhere. That split, and
the dated-folder rule, are in `CLAUDE.md` under the filing law and the output
law.

Start from **`REPORT_TEMPLATE.md`** in the workspace root. It carries the cover
block, the cover budget note, the body rules, and the standing appendix — the
information-basis and confidentiality statements, the Reported / Verified /
Derived convention, and the `A.0.n` correction-ledger shape. Worked examples
live in `$REPO/scripts/studio/reports/`.

Two things the template exists to prevent, both of which have cost real time:

- **The body narrating its own fact-check.** Provenance belongs in the appendix.
  See *Report voice law* in `CLAUDE.md`.
- **A cover that silently overflows**, dropping the byline onto page 2. Render
  page 1 and look at it before you send anything.

A thesis or market map going to a client should be a **report PDF**. The
carousel and one-pager are for LinkedIn.
