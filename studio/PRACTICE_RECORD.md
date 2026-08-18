# The practice record — smbX's own claims, and where each one comes from

**Written 2026-08-03.** Every other document in this workspace is about a market.
This one is about the practice, and it exists for a mechanical reason: house
collateral announcing smbX itself carries figures — the track record, the
perimeter — that appear in no market master, so `verify-spec.mts` has nothing to
check such a spec against. This is that source of truth.

Pass it explicitly:

```
npx tsx $REPO/scripts/studio/verify-spec.mts specs/<name>.post.mts --against PRACTICE_RECORD.md
```

## The track record

Source of truth: `client/src/practice/TrackRecord.tsx` in the repo — Paul's final
copy, 2026-07-13, with employer anonymisation applied 2026-07-18. The page
renders at smbx.ai/track-record. These are the four figures it publishes, in the
exact form it publishes them:

| Figure | Label, as published |
|---|---|
| **150** | Acquisitions |
| **$5B+** — more than $5 billion | Enterprise value added |
| **≈$21B** — roughly $21 billion | In transaction value touched |
| **0** | Sell-side transactions. Ever. |

The headline the page carries is "About 150 deals. One side of the table."
**CORRECTED 2026-08-06 (Paul): the $5B+ figure is ENTERPRISE VALUE, not revenue.**
It had been recorded and published as "Revenue added" since 2026-07-13. The two
are not close and they are not interchangeable — enterprise value is what an
acquirer paid for, revenue is what the business books in a year — so this is a
factual correction, not a wording preference.

**It is almost certainly still wrong in two places this file cannot reach:**

1. `client/src/practice/TrackRecord.tsx`, which is the source of truth for this
   table and renders at **smbx.ai/track-record** — a live public page.
2. Any collateral built before 2026-08-06 that carries the cover stat row.

Fix the component, or the next session will read the component, see "Revenue
added", and dutifully correct this file back. That is the drift loop: two
records disagreeing, and whichever gets read first wins.

Sense check that supports the correction: $5B+ of enterprise value across about
150 acquisitions is roughly $33M average deal size, which sits inside the
sub-$250M-revenue lower-middle-market perimeter. $5B+ of *revenue* added across
the same 150 would imply the same average in annual revenue, which is a
materially different and larger claim.


## The attribution line — standing, verbatim

> Selected transactions led or co-led by Paul Baker in the course of his
> employment at a world-class PE-backed aggregator and a global investment bank.
> These transactions were completed by those firms and were not smbX engagements.

**It appears wherever the deal names appear, and it is never a footnote.** The
six standing rules, from the same file:

1. Always "led or co-led" — never "closed" unqualified, never "deal captain".
2. Always "selected transactions" — the wall is a selection, which is what
   reconciles it with the 150 figure.
3. The attribution line goes wherever the deal names go.
4. Names, not logos — a logo implies a client relationship that never existed.
5. Never "our clients" for an employer-era transaction. Employers are anonymised
   on every public surface: "a world-class PE-backed aggregator" and "a global
   investment bank".
6. The bank role is integration, not origination — Director of Acquisition
   Integration. Do not stretch it.

**Rule 1 was set aside on collateral, 2026-08-03 (Paul).** "Led or co-led" read
as a hedge on a card whose whole job is to invite. House collateral now makes
**no claim about role at all** — "about 150 acquisitions", full stop. That is
the honest way to drop the qualifier: the alternative, upgrading to "closed", is
what rule 1 forbids outright and it stays forbidden.

**smbx.ai/track-record still carries rule 1 and the full attribution shield, and
should.** The two surfaces differ deliberately: the page names deals, so the
line is owed there; a card that names none does not owe it. If a card ever
carries a deal name, the shield comes back with it.

## The perimeter

Buy-side only. One buyer per target. No sell-side, no two-sided, no neutral
intermediary. No valuation on a named company. No unlicensed opinions on
securities, tax, legal or appraisal. Targets under $250M revenue. Full text in
`THE_LINE_POLICY.md` in the repo.

**"No fee talk on any public surface" was retired 2026-08-05 (Paul).** The
practice now publishes a single fee schedule, below, and the schedule *is* part
of the pitch — a set price is what lets a qualified buyer decide without another
discovery call. Everything else in the perimeter is unchanged, and the
publishing decision does not loosen any of it.

**Why the rule existed, and why it stopped applying.** Paul, 2026-08-06: "At one
time we were building this to be an app, which brokers and bankers would use, and
we would not collect a fee. It was only a membership or license fee. Since we
have scrapped the app and are now running corp dev ourselves, I will be
collecting a success fee." So "no fee talk" was never a modesty rule — it was
accurate to a **software** business whose revenue was a subscription and whose
users were the intermediaries. That business no longer exists. smbX is now the
operator, not the tool an operator buys, and a success fee is the honest
description of how it gets paid.

This matters well beyond the one rule. **Any document written before 2026-08-05
may be describing the app rather than the practice**, and a claim that was true
of a licensing business can be false of a services business without anyone having
changed a word. Treat pre-pivot copy as suspect on three things in particular:
how revenue is earned; who the customer is (intermediaries then, acquirers now);
and anything framed as neutral or two-sided — a tool sold to both sides could be
neutral, an operator on one side of the table cannot, and must never be described
as though it were.

**Both stale copies were amended 2026-08-06, and one of them never existed.**
`THE_LINE_POLICY.md` was checked directly and does NOT carry a "no fee talk"
rule — it is already v2, and §Permitted expressly allows a buy-side retainer and
a buy-side success fee. It also records the same pivot Paul described, from the
other side: v1 was "written to make a **software product** a regulatory safe
harbor". The claim that it needed amending was carried forward across sessions
without anyone opening the file. The real stale wording was one bullet —
"**No fee talk.** No retainers, success fees, commissions, compensation." — in
PLAYBOOK, in two synchronised copies (`SMBx-main/content/studio/PLAYBOOK.md` and
`smbx-studio/PLAYBOOK.md`). Both now permit the published schedule and keep the
prohibitions that survive: no sell-side, two-sided or neutral fee, and no fee
comparison to a named bank, broker or advisor.

`smbx-studio/smbx-search/PLAYBOOK.md` is a THIRD copy with different contents and
no fee bullet at all — left alone, but three divergent PLAYBOOKs is its own drift
problem and nothing reconciles them.

The category is a corporate development function, not a cheaper bank.

## The published fee schedule

Set by Paul 2026-08-05. **Exact — do not round, average or "improve".** Recorded
here so a spec that prints it can be checked in one pass.

| Line | Figure |
|---|---|
| Retainer, billed **quarterly in advance** | **$15,000** per quarter |
| The same rate, stated monthly | **$5,000** per month |
| Retainer treatment | **Every retainer dollar is credited against the success fee at close.** The retainer is non-refundable — it is earned as the work runs — and it is not an extra charge on top: it comes off the total. |
| **If the deal does not close** | **No success fee.** The client pays the retainer and nothing else. There is no closing fee to incur, no break fee, no expense tail. |
| Success fee, first $1M of transaction value | **5%** |
| Success fee, $1M – $5M | **4%** |
| Success fee, $5M – $10M | **3%** |
| Success fee, above $10M | **2%** |
| Minimum success fee | **$100,000** |
| smbXCorpDev Premium | **No second formula.** The retainer continues through integration and value creation; add-ons run the same schedule. |

Banded, so each dollar is priced in its own band and there are no cliffs.
**Changed 2026-08-05 → 2026-08-06 (Paul).** The retainer was *"$15,000 up front
for the first 90 days, then $5,000 a month, stop anytime."* It is now **$15,000 a
quarter, billed quarterly in advance** — the same $5,000 a month, collected three
at a time rather than one. The published figures do not move; the *billing
rhythm* does, and copy that still says "then $5,000 a month" now describes a
schedule that no longer exists.

**The no-close term is newly published, not newly true.** It was always the case
that a deal which does not close carries no success fee; it had simply never been
said out loud on a public surface. Paul, 2026-08-06: *"if a deal does not close,
they have no closing fee to incur, and will only pay the retainer — which is
non-refundable, but completely included in the total fee."* It belongs in the
small print of anything that publishes the schedule, because it is the question
every buyer asks second.


**Worked anchors** — arithmetic checked 2026-08-05. Only the $5M figure is
published; the rest are here so a future session can check a new one without
re-deriving the schedule.

| Transaction value | Success fee | Effective rate |
|---|---|---|
| $2.00M | $100,000 | 5.00% — the minimum binds |
| $2.25M | $100,000 | 4.44% — the minimum stops binding here |
| **$5.00M** | **$210,000** | **4.20%** ← the published anchor |
| $10.00M | $360,000 | 3.60% |
| $25.00M | $660,000 | 2.64% |
| $50.00M | $1,160,000 | 2.32% |

**Approved published form of the anchor, exact: `$210,000, or 4.2%`.** The table
above pads to two decimals so the column lines up; `4.20%` is a typesetting
artefact, not the published figure. Both forms are recorded deliberately, because
a rounded figure is a different figure and verify-spec matches the literal string
— it flagged `4.2%` against `4.20%` on 2026-08-06, correctly, the first time
percentages were ever checked at all.

Two properties worth keeping when the schedule is described in copy:

1. **The marginal rate falls as the deal grows** — 5% to 2%. Paying more never
   raises the rate on the next dollar, which is what keeps the schedule
   consistent with the standing "when we tell you to walk, walking costs us"
   claim. A flat percentage of price would not be.
2. **The $100,000 minimum is a floor, not a cliff.** It binds on any deal below
   $2.25M and is overtaken smoothly above it.

## What a standing corp-dev function costs

Set by Paul 2026-08-06, from practical experience setting one up:

| Figure | Basis |
|---|---|
| **$500,000 to $1,500,000 per year, all-in** | Paul's direct experience standing up a corporate development department. "All in — because it's more than just salary." |

**Publish it as a range. Never as a midpoint.** "About a million dollars" is not
this figure; it is an average of it, and an average nobody stated. The width is
real — it spans the seniority you hire at and the deal volume you resource for —
so narrowing it to a single number is a claim the source does not support.

**"All-in" means fully loaded, not a salary line.** That is as far as the source
goes, and copy must not go further: the composition is *not* itemised here, and a
future session must not invent line items — no software subscriptions, no data
fees, no overhead percentages — to make the number feel better evidenced. If an
itemised build-up is ever wanted, it has to come from Paul, and it gets recorded
here before it gets published.

**Approved published form, exact:** `$500,000 to $1,500,000 a year`. Not
`$500K–$1.5M` — the abbreviated form was already caught once by verify-spec in a
caption, and a rounded figure is a different figure.

**Retired claim, do not restore.** "Building corp dev in-house is a year and a
million dollars" shipped on the corp-dev offering sheet 2026-08-06 and was never
registered anywhere. It bypassed verify-spec because the extractor in
`house/audit.ts` required a digit, so a figure spelled out in words was invisible
to it. The extractor was widened the same day; the claim is replaced by the range
above.

## Figures quoted from a market master

Collateral about the practice sometimes cites the practice's own work as proof.
Those figures belong to their market's master and are reproduced here only so a
spec that quotes them can be checked in one pass. **The market master remains
the source of truth for every one of them.**

### Dallas–Fort Worth, HVAC and plumbing — `markets/home-services/master.md`, Part XI

NAICS 238220 across the eleven counties of the Dallas–Fort Worth–Arlington MSA
(Census County Business Patterns, 2023): **2,412 establishments**, **31,980
employees**, **$2.418 billion** of annual payroll. **1,797 establishments —
74.5% — have fewer than ten employees.** The 10–249 band holds **307
establishments**, **115** of them at 20–249.

**Eighteen platform parents hold a verified DFW operating location** — ten
residential-side, eight commercial-mechanical. Roughly **280 establishments** in
the 10–249 band match no consolidator in the register; "unmatched" is not
"confirmed independent".

The Texas air-conditioning contractor licence roster (TDLR) lists **4,665**
distinct licensed firms in the same counties — nearly double the establishment
count, because most licensed contractors have no payroll.

## Sources

| Source | What it carries |
|---|---|
| `client/src/practice/TrackRecord.tsx` (repo) | The four track-record figures, the standing attribution line, and the six attribution rules. Paul's final copy 2026-07-13; employer anonymisation 2026-07-18. |
| `THE_LINE_POLICY.md` (repo) | The practice perimeter in full. Already v2; §Permitted allows the buy-side retainer and success fee. Verified 2026-08-06 — it never carried the "no fee talk" rule. |
| `content/studio/PLAYBOOK.md` (repo) + `PLAYBOOK.md` (studio) | Voice and THE LINE for collateral. Fee bullet amended 2026-08-06. |
| Paul, direct, 2026-08-06 | The cost of a standing corp-dev function ($500,000 to $1,500,000 a year, all-in), and the app→services pivot that retired the fee-talk rule. |
| `markets/home-services/master.md` | Part XI — the Dallas–Fort Worth cut. Source of truth for every DFW figure reproduced above. |

## What we don't know yet

- **"A year to hire and ramp."** This ships on the corp-dev offering sheet and is
  a duration claim of exactly the same class as the money claim retired above —
  asserted, unsourced, and invisible to the extractor because it carries no
  digit. Paul supplied the annual cost on 2026-08-06 but was not asked about ramp
  time, and the two do not imply each other: "$500,000 to $1,500,000 **per year**"
  is a run rate, not a statement that the first deal takes a year. Either register
  it or cut it. **Flagged to Paul 2026-08-06, awaiting an answer.**
- **Which pre-pivot documents describe the app rather than the practice.** See
  §The perimeter. Nothing has been audited for this yet, and the failure mode is
  silent: the copy still reads well, it is just about a business that no longer
  exists.
- **Whether the track-record figures need a refresh date.** They were set
  2026-07-13 and nothing on disk says when they were last reconciled against the
  underlying deal list.
- **Where practice-level collateral files.** Filed to the studio root
  `collateral/` on 2026-08-03 at Paul's direction. The 2026-07-29 market law
  says nothing market-owned lives at the root; a practice artifact is not
  market-owned, so the law is not broken, but the root now has one folder the
  layout does not describe.
