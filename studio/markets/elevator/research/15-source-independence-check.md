# Elevator collateral — source-independence check

**Scope:** `markets/elevator/specs/elevator-teardown-1.deck.mts`, `elevator-teardown-2.deck.mts`,
`markets/elevator/documents/market-assessment.md`, traced through `master.md` and the 17 files in
`markets/elevator/research/`.
**Date:** 2026-08-12. **Posture:** adversarial. The question is not "does a source exist" but
"are the sources independent, and does the citation shown to a reader carry the claim made."

---

## Summary table

| # | Figure / claim | Where | Chain | Verdict |
|---|---|---|---|---|
| 1 | Otis 25.1% service margin vs 4.8% new equipment | D1 p1, report ES | SEC 10-K accn 0001781335-26-000011 → R121 segment note; margins also stated in Otis's own 28 Jan 2026 release; total $14,431m independently reconfirmed by me via SEC XBRL companyconcept API | **INDEPENDENT** |
| 2 | **"Service is 35% of its sales"** | **D1 p1 + caption** | Arithmetically false. Service = 9,442 ÷ 14,431 = **65.4%**. 35% is *New Equipment*'s share (4,989 ÷ 14,431 = 34.6%) | **UNSUPPORTED — inverted** |
| 3 | Service = 91% of segment operating profit | D1 p1 | 2,374 ÷ 2,614 = 90.8%; verified figure 6 | **INDEPENDENT** |
| 4 | MCP required; annual / 5-year clock | D1 p2 | A17.1 §8.6.1.2 is paywalled and was not read. Carried on Florida 61C-5.0015 quoting the section + A17.2-2010 + six states' own rules returning 12/36/60 | **INDEPENDENT** (regulators are separate issuers, not republishers) |
| 5 | NYC 27.8% / 34.5% / 59.7% / 7.1% | D1 p3 | Self-computed from NYC Open Data DOB NOW; re-queried live and cross-footed in the verification pass (43,454 buildings; 3,072 hold 32,208) | **INDEPENDENT** (primary self-derivation) |
| 6 | 1.79× elevator vs HVAC; median $102,420 | D1 p4 | BLS OEWS May 2023, four figures same vintage/table family. **But May 2025 is the current OEWS release** — two vintages stale, flagged pre-publication and unresolved | **INDEPENDENT but stale** |
| 7 | Controller lock-in | D1 p5 | *In re Elevator Antitrust Litig.*, 2d Cir. 06-3128-cv, 4 Sep 2007 — court opinion, primary | **INDEPENDENT** |
| 8 | **Callback economics ("callbacks alone eat most of the revenue")** | **D1 p6** | Driving input is 4 callbacks/yr → `master.md:745` "Traction units **average** 4 callbacks/year (Schloss, **via** Koshak)" → `research/09:261` = Koshak in *Elevator World* reporting Schloss's suggestion of an **achievable best case**, not an average. `research/05:406` records callback frequency as "**Nothing found.**" Hours-per-callback is **unsourced** (`research/09:443`). Never entered the verification pass | **SINGLE ORIGIN + SELF-CITED** |
| 9 | CA DIR SC-62-X-999-2023-1 wage | D1 p6 | dir.ca.gov PDF, primary. **Expired 2023-12-31**; report says so, deck does not | **INDEPENDENT but expired** |
| 10 | Wisconsin contract 19-5971 pricing | D1 p6 | Public procurement contract, primary | **INDEPENDENT** |
| 11 | A17.3 is retroactive | D2 p1 | 41 Ill. Adm. Code 1000.60; Ga. Rule 120-3-25-.02 — two state codes, separately issued | **INDEPENDENT** |
| 12 | **"12 states" adopt A17.3** | **D2 p2 (headline numeral)** | `master.md:355`: "the ten above plus **Chicago** and Vermont, both from summary sources only." Chicago is a city inside already-counted Illinois; the ten includes **New York City**, also not a state. `research/08:504` found only 3 adopters reached (IL/TX/WA) and "**no published national table exists**". Card's own source line cites NFPA/CMS, which do not support the count | **UNSUPPORTED** |
| 13 | NFPA 101 §9.4.2.2 → A17.3 | D2 p2 | See analysis below | **INDEPENDENT (corroboration)** |
| 14 | CMS-2786R tag K531 | D2 p2–3 | cms.gov form PDF retrieved, class (a); K531 2012 EXISTING carries the A17.3 sentence verbatim | **INDEPENDENT** |
| 15 | 26 TAC §505.164 cites §9.4.x | D2 p3 | Cornell/Texas admin code, primary. Adopts NFPA 101-2003 / A17.3-1996 — old editions; deck's narrow claim ("cites the section by number") is correctly scoped | **INDEPENDENT** |
| 16 | Ohio / Colorado defanged | D2 p4 | OAC 4101:5-3-02(B); 7 CCR 1101-8-2-7 — verbatim from state codes | **INDEPENDENT** |
| 17 | NYC 92,075 devices; 132 contractors; ≈700/contractor | D2 p5 | DOB NOW + NYS DOL licence counts, both verified; 92,075 ÷ 132 = 697 | **INDEPENDENT** |
| 18 | **"Roughly 10,000 have never had their five-year test filed"** | **D2 p5** | `research/07:325` = **1,691** with no CAT1 ever **+ 8,442** with no CAT5 ever = ~10,133. The CAT5-never population is **8,442**. Deck attributes the union of two different categories to one of them. Not in the verification pass | **UNSUPPORTED as worded** |
| 19 | KONE–TKE, 3.2M units, divestment clause | D2 p6 | KONE inside-information release 29 Apr 2026, issuer primary; quoted verbatim | **INDEPENDENT** |
| 20 | **"below ~750 contracted units no sponsor process"** | **D2 p7** | The practice's own consolidator register. Deck source line reads "smbX.ai consolidator register · 11 Aug 2026" | **SELF-CITED** (labelled) |
| 21 | Four whitespace regions | D2 p7 | Same register — absence of evidence from the practice's own screen | **SELF-CITED** (labelled) |
| 22 | 1.03M+ US elevators | **report only, not on decks** | NEII fact sheet; NEII's own 2019 sheet says "A majority of this data was compiled in 2007." `research/01:338`: Axios repeats NEII and "**adds no independent measurement**" | **SINGLE ORIGIN** (correctly labelled) |
| 23 | 8–9% PE share | **report only, not on decks** | Divides published platform unit counts by #22 | **SINGLE ORIGIN** (labelled estimate) |

---

## The NFPA 101 → CMS chain: corroboration, not circularity

The task asks whether (a) a third-party full text of NFPA 101, (b) CMS-2786R and (c) a state rule
are genuinely independent, or all derive from NFPA's own text. **They do all derive from NFPA's
text — and for this claim that is corroboration, not circularity.** The distinction:

- Circularity is a defect when the referent is a **measurement**. Five outlets repeating one study
  is one fact, because each retelling adds no observation.
- Here the referent is a **text**. The code *is* the primary instrument. Independent parties
  correctly reproducing it is convergent verification — the same logic by which four manuscripts
  of a statute confirm its wording. More reproductions is more evidence, not less.

And the load-bearing half of the claim does not depend on NFPA at all. The deck's assertion is
that *every Medicare-participating hospital sits inside the requirement*. That obligation is
created by **CMS's own instrument**, retrieved class (a) from cms.gov, whose K531 tag states in
the regulator's own words: "Existing elevators conform to ASME/ANSI A17.3." CMS is not quoting
NFPA; it is enforcing a condition of participation it wrote. That is a genuinely independent
federal instrument and it is the strongest evidence in either deck.

**Two caveats that belong in the report, not on the deck.** First, the verification pass never
obtained a class (a) or (b) copy of §9.4.2.2 itself — public.resource.org and the CMS-hosted
full texts both truncate before Chapter 9. The wording rests on class (c)/(d): the NEII matrix,
an ASHE crosswalk, and UpCodes search-index snippets of state-adopted editions. It already caught
and fixed a three-word misquote there ("shall be in accordance with" → "shall conform with").
So the report's line *"Three independent evidence classes support this: the code text in two
editions, a federal survey instrument, and state administrative code"* **overstates the first
item** — the code text was never read at class (a)/(b). Second, one of those props is the **NEII
matrix**, a trade-association document this same report retires for adoption-mapping use. Using an
interested party to establish code wording is defensible; it should not be described as
independent evidence of the code text. Neither caveat touches the decks, which paraphrase rather
than quote.

## The New York self-computation: primary, not self-citation

Self-citation is a defect when the reader cannot falsify the claim — the practice asserting its
own prior conclusion. A computation over a **public** dataset is the opposite: NYC Open Data DOB
NOW is open, the Socrata endpoint is public, and the verification pass documented the query
including a NULL-`bin` trap that produces a plausible false "correction" (43,455 groups instead of
43,454). Every value cross-foots to control totals. This is **primary-source derivation** and is
the best-evidenced material in either deck.

One residual: the decks mix bases. Deck 1's concentration percentages are computed on the **93,454**
active base; Deck 2 headlines **92,075** (active less construction devices). Both are correct
against their own base, but a reader comparing the two decks sees two New York totals with no
explanation. Deck 2's ≈700-per-contractor also uses 92,075.

## Wisconsin 19-5971 and the CA DIR determination: the claim outruns the documents

Both documents are real, public and verified. The question is whether they carry the claim.

They do not. The Deck 1 card says: *"Run four callbacks a year against a loaded California wage
and a double-time overtime rule, and at the bottom of real published contract pricing the
callbacks alone eat most of the revenue."* Source line: `Wisconsin contract 19-5971 · CA DIR
SC-62-X-999-2023-1`.

A reader who pulls both cited documents finds contract pricing and a wage schedule. **Neither
contains the callback frequency, and neither contains the hours per callback.** Those are the two
variables that produce the conclusion:

- **4 callbacks/year** is Koshak in *Elevator World* reporting a suggestion by Ron Schloss of an
  **achievable** rate for *reliably maintained* equipment. `research/09` labelled it precisely and
  honestly: "`Press-derived`; an attributed practitioner suggestion of an *achievable* rate, i.e. a
  **best-case** figure, not a survey mean." By `master.md:745` it reads "Traction units **average**
  4 callbacks/year." **Best case silently became average** in transit, and `research/05:406`
  independently recorded callback frequency as "Nothing found."
- **Hours per callback** is admitted unsourced: "the hours per callback are not [sourced], which is
  why §3.3 is a sensitivity table rather than a figure" (`research/09:443`).

So a sensitivity table became the report's "54–107%" and then the deck's "eat most of the revenue,"
under a citation naming two documents that contain neither input. The directional argument survives
— a best-case rate means real books run *worse*, which strengthens the point — but the **evidentiary
presentation does not**. This is the single clearest case in the set of a claim doing more work than
its cited instruments can carry.

Note also that the deck presents the California wage without the qualifier the report carries:
SC-62-X-999-2023-1 **expired 31 December 2023**, 31 months before posting.

---

## What would survive a hostile reader

Imagine a competitor motivated to call this slop. They will not start with methodology. They will
open the first content card of Deck 1, because it is the most checkable claim in the set and
because Otis's 10-K is two clicks away.

**The card they attack first is Deck 1, page 1 — the 25.1% numeral card.** And they are right, but
not about the number they were aimed at.

The margins are impeccable. 25.1% and 4.8% are stated by Otis in its own earnings release and tie
to R121 of the 10-K; I independently reconfirmed the $14,431m total against the SEC XBRL
companyconcept API. That half is unattackable.

The sentence beside it is not. The card says **"Service is 35% of its sales and 91% of its segment
operating profit."** Service is **65%** of sales. 35% is what *New Equipment* contributes. Anyone
who opens the filing to check the impressive number finds the adjacent number is wrong, and the
error is of the specific kind that reads as machine-generated: two correct figures combined into a
false sentence. It also appears **verbatim in the LinkedIn caption**, which is the text most people
actually read.

Worse, it is self-refuting on its own card. The card argues service is where the profit is. "35% of
sales producing 91% of profit" describes the *equipment* business relative to profit — it inverts
the deck's own thesis. A hostile reader does not need the filing; they need arithmetic.

The error's origin is `master.md` D-3: *"$2,374m ÷ $2,614m = 90.8%, against service being 35% of
sales."* The verification pass checked 9,442, 4,989, 14,431, 2,374, 2,614 and 91% — **every
component individually VERIFIED** — and never checked the sentence assembling them. This is
precisely the failure the verification pass itself warns about in its opening: *"A clean audit
proves traceability, not truth."* It proved it again, one layer up.

**Their second target is Deck 2's "12 states" numeral**, because it is a headline number whose own
source line (`NFPA 101 §9.4.2.2 · CMS-2786R tag K531`) cites two documents that say nothing about
state adoption. If they dig, `master.md:355` concedes the twelve are "the ten above plus **Chicago**
and Vermont, both from summary sources only" — Chicago being a city inside Illinois, already
counted, and the ten including New York City. `research/08` records that **no published national
A17.3 adoption table exists** and only three adopters were actually reached. The defensible count
is about ten states, two of which (Ohio, Colorado) the deck itself says force no spend. The card is
built to say "twelve is an undercount"; the honest version is stronger, because the number is
softer than claimed and the federal channel is real regardless.

**Third: "roughly 10,000 devices have never had their five-year test filed."** The registry says
8,442 have no CAT5 ever; the other 1,691 have no CAT1 ever. Same dataset the card cites, so it is
checkable by a reader in one query.

**What holds under any pressure:** the Otis margins; the CMS-2786R federal hook, which is the best
claim in either deck and is genuinely primary; the KONE release; the Second Circuit opinion; the
Ohio and Colorado retroactivity clauses; and the New York registry computations. The two decks also
**correctly quarantine** the practice's weakest material — the 2007-vintage NEII denominator and
the 8–9% PE estimate that divides by it appear **nowhere on either deck**. That discipline is real
and should be credited: the disease the earlier carousel caught is largely absent here. What is
present is different — not circular sourcing, but **three checkable errors and one citation that
does not carry its claim.**

---

## Fix list

Ordered by exposure.

1. **MUST NOT SHIP — Deck 1 p1 and caption.** Change "Service is 35% of its sales and 91% of its
   segment operating profit" to **"Service is 65% of its sales and 91% of its segment operating
   profit."** Fix both the card body and the caption line. Correct `master.md` D-3 and
   `market-assessment.md` lines 34 and 132 ("Thirty-five per cent of sales produced 91%" → "Sixty-five
   per cent"). This is a falsifiable arithmetic error on the lead card that inverts the deck's own
   thesis.

2. **MUST NOT SHIP AS WRITTEN — Deck 2 p2, "12 states."** Either drop to the defensible state count
   (~10, excluding Chicago and NYC as cities and Chicago as already inside Illinois), or reframe the
   numeral away from a count the practice cannot source — the card's argument does not need it. Add
   an adoption source to the card's source line, or remove the numeral. Correct `master.md:355`,
   which currently counts a city as a state.

3. **Deck 1 p6 — callback economics.** The claim is not carried by its two cited documents. Either
   (a) put the driving input on the card — "at a best-case four callbacks a year (trade press)" —
   and add the source, or (b) restate qualitatively: every tier does the same work, the tiers differ
   on who absorbs parts and callbacks, and cheap contracts exclude parts and restrict hours for that
   reason. Option (b) needs no callback rate and loses nothing. Also fix `master.md:745`:
   "average" → "an achievable best case," restoring what `research/09` actually recorded.

4. **Deck 1 p6 — expired wage.** Label the California rate as the 2023 determination, or refresh to
   the current one. Do not present a 31-month-expired prevailing wage as "a loaded California wage."

5. **Deck 2 p5 — the 10,000.** Change to **"roughly 8,400 have never had their five-year test
   filed"**, or keep 10,000 and reword to the union: "sit outside the inspection cycle entirely."

6. **Deck 1 p4 — OEWS vintage.** May 2025 is the current release; the deck carries May 2023. The
   card is date-labelled, so this is defensible, but a reader may call it stale. Either refresh all
   four wage figures together (the verification pass warns they move together or not at all — the
   "within 1%" claim breaks otherwise) or accept the label.

7. **Deck 2 p7 — self-citation.** "smbX.ai consolidator register" is unverifiable by a reader. The
   body's "we found" already signals it. Strengthen to state the basis on the card: "our register of
   21 platforms, 11 Aug 2026." Keep it — labelled own-work is legitimate; unlabelled would not be.

8. **Report only — NFPA evidence-class wording.** `market-assessment.md` line 79: "the code text in
   two editions" overstates. The code text was reached only at class (c)/(d). Reword to "a trade
   matrix and state-adopted renderings of the code text, a federal survey instrument, and state
   administrative code," and note the NEII matrix is an interested party.

9. **Both decks — New York base.** Deck 1 uses the 93,454 active base, Deck 2 the 92,075 base. Add
   one clarifying word to Deck 2 ("92,075 permanent devices, excluding construction") so the two
   decks do not appear to disagree.
