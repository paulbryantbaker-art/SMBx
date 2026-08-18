# Fire & Life Safety Teardown — Citation Independence Audit

**Artifact audited:** `scripts/studio/decks/fire-safety-teardown.deck.mts` (v1, 2026-08-10; cover art added 2026-08-10; last modified 2026-08-11)
**Master:** `markets/fire-safety/master.md` (2,324 lines, published 30 July 2026)
**Corpus:** `markets/fire-safety/research/` (15 files, incl. two prior verification passes)
**Audit date:** 12 August 2026
**Method:** every figure-bearing card traced figure → `source:` line → master → research file → that source's own citation → primary instrument or loop. Where a chain ended at a secondary source, that source was retrieved and read for **its** citation.

---

## Summary table

| # | Card | Figure | `source:` line as printed | Verdict |
|---|---|---|---|---|
| C1 | Cover numeral | **63%** | *(uncited on cover; cited p.2)* | **INDEPENDENT** |
| C2 | Cover stat | **17** platforms | *(uncited on cover; cited p.7)* | **SELF-CITED** |
| C3 | Cover stat | **11** visits | *(uncited on cover; cited p.3)* | **INDEPENDENT** (derived) |
| C4 | Cover stat | **5 years** | *(uncited on cover; cited p.9)* | **INDEPENDENT** |
| C5 | Cover CTA | **83 pages** | *(self-referential)* | **VERIFIED** (pdfinfo = 83) |
| P1 | The mandate | statutory wording | IFC §901.6; NYC Fire Code (2022) FC 901.6 | **INDEPENDENT — but MISQUOTED** |
| P2 | 63% | **1,313 of 2,083** | City of Rockville, MD, 31 Jan 2024 | **INDEPENDENT** (undisclosed vendor origin) |
| P3 | 11 visits | **11/yr** | NFPA 25, 72, 10 and 96; smbX, July 2026 | **INDEPENDENT** (primary intervals + house arithmetic) |
| P4 | Pull-through | **$3–$4 : $1** | APi investor day 21 May 2025; Q4 2025 call 25 Feb 2026 | **SINGLE ORIGIN** |
| P5 | Mix shift | **40% → 54%**, 20+ qtrs, 60% target | APi Q4 2025 call; investor day | **SINGLE ORIGIN** |
| P6 | The trap | 60 mo / 6%+CPI / 45 days / 30 days | Three executed inspection agreements, 2022–2025 | **INDEPENDENT — but UNVERIFIABLE AS CITED** |
| P7 | Register | **17** (+5, 3, 8, 5) | smbX consolidator register, as at 29 July 2026 | **SELF-CITED** |
| P8 | Domains | **144** brands · **31** divisions · **5** Guardians | Company brand pages and SEC exhibits, July 2026 | **INDEPENDENT** (drifting; vague) |
| P9 | The moat | **5 yrs / 3 direct / 90 pts / 3 yrs** | NICET candidate handbooks; Washington RCW 18.160 | **SPLIT: certification INDEPENDENT · Washington claim UNSUPPORTED** |
| P10 | The licence | **60 days**; **$75,164 / $66,225** | Fla. Stat. §633.328 (2024); 2022 Economic Census | **INDEPENDENT** (two separate primaries) |
| P11 | The multiple | the chain (11.8x, 7x–10x) | Capstone Partners, 2 Feb 2026; Breakwater M&A, 1 Feb 2026 | **CIRCULAR AS LABELLED — analysis CONFIRMED** |

**Tally:** 8 independent · 2 single-origin · 2 self-cited · 1 circular-as-labelled · 1 unsupported sub-claim · 1 misquotation.
**Figures materially wrong: 1** (the Washington statutory link, p.9). **Figures fabricated: 0.**

---

## The chains, card by card

### P1 — "systems shall be maintained in good working order at all times"
`source:` **IFC §901.6; NYC Fire Code (2022), FC 901.6`

```
statutory wording → IFC §901.6 → model code text, adopted by reference
                  → PRIMARY INSTRUMENT. Chain terminates correctly.
```

The structure of the argument (jurisdiction adopts code → code requires ITM by reference → referenced-standards chapter fixes the edition) is correct and is a primary-instrument chain. Table 901.6.1 does list NFPA 10, 25 and 72.

**But the wording is not the wording.** Retrieved from the Ohio adoption of the IFC (OAC 1301:7-7-09), §901.6 reads verbatim:

> "Fire detection, alarm and extinguishing systems, mechanical smoke exhaust systems, and smoke and heat vents shall be maintained in an **operative condition** at all times, and shall be replaced or repaired **where defective**."

The card prints: *"systems shall be maintained in **good working order** at all times, and where they are **not**, repaired or replaced **as necessary**"* — introduced by the sentence **"The wording does the work"**, which frames it as the statutory text.

Three substitutions, one of them material: **"where defective"** is a narrower trigger than **"where they are not [in good working order]"**. The card's paraphrase broadens the owner's duty beyond what the code says, on the one card whose entire argument is that the exact wording is load-bearing.

**Rescue:** quote IFC §901.6 verbatim. It is stronger than the paraphrase and it costs nine words.

*Secondary note:* NFPA 96 is **not** in Table 901.6.1. It reaches the code by a different route (IFC Ch. 6 / Ch. 80). P3's "NFPA 25, 72, 10 and 96" bundles four standards that do not all arrive through the same door.

---

### P2 — 63% current on annual inspection (1,313 of 2,083)
`source:` **City of Rockville, MD, 31 January 2024`

```
63% → City of Rockville press release, 2024-01-31
    → rockvillemd.gov/news/2024/01/31/compliance-engine-system-makes-rockville-safer/
    → PRIMARY: municipal government publication, retrieved and read
```

**Verified verbatim, every number.** Retrieved 12 Aug 2026: 2,083 systems; 1,313 (63%) current on annual inspections; 1,933 (90%) found compliant; 30% reduction in unwanted activations. Master §1.5 and the derivation table (lines 481–490) carry all four, and the master flags — correctly, and against its own interest — that the city's own 90% does not reconcile with its own counts (1,933 ÷ 2,083 = 92.80%), while the 63% reconciles exactly. The deck leans on the reconciling figure. That is the right choice, made for the right reason, and it is documented.

**Verdict: INDEPENDENT.** One primary government instrument, correctly quoted, correctly bounded on the card ("The city was chosen for its enforcement, not for neglect").

**The one thing nobody flagged.** Rockville's numbers are generated by **The Compliance Engine**, the third-party ITM reporting platform operated by **BRYCER** — a vendor with a direct commercial interest in a finding that mandatory electronic reporting reveals non-compliance. The city page does not credit the vendor; the city presents the figures as its own. Master §1.5 rigorously labels the *Burlington, VT* figures **"(BRYCER, vendor claim)"** and the false-alarm attribution likewise — but treats Rockville as clean municipal data, and the spec's docstring §4 explicitly refuses "the second instrumented city's rate" as vendor-published while keeping the first. **Both cities' numbers come off the same vendor's platform.** The asymmetry is not defensible on its own terms. The distinction that *does* hold is that Rockville is the AHJ adopting the output as its own official statement, and Burlington's figure was published by the vendor directly — but the master should say that, because right now it applies a disclosure standard to one city and not to its twin.

**Rescue (optional):** one clause on the card or in the master — "reported by the city from its mandated electronic-reporting platform."

---

### P3 — 11 contractor visits a year
`source:` **NFPA 25, 72, 10 and 96; smbX, July 2026`

```
11 → smbX arithmetic (master §2.5, line 411)
   → 4 sprinkler + 2 alarm + 1 extinguisher + 2 kitchen suppression + 2 hood
   → intervals in NFPA 25 / 72 / 10 / 96
   → PRIMARY INSTRUMENTS (consensus standards, adopted by reference into code)
```

The self-citation here is **honest and correctly placed**: `smbX, July 2026` labels the *arithmetic*, not the *frequencies*, and the card says so in terms — "The building mix is an assumption and should be replaced with the target's own site list in diligence. The frequencies are not an assumption." That is exactly how a house derivation should be cited.

**Verdict: INDEPENDENT.** Primary instruments at the bottom; the house contribution is disclosed as a derivation and bounded on the card.

---

### P4 — $3–$4 of service work per $1 of inspection work
`source:` **APi Group investor day, 21 May 2025; Q4 2025 call, 25 Feb 2026`

```
$3–$4 → APi investor day slide 19, 2025-05-21
      → footnote: "Based on leadership estimate for U.S. inspection revenues,
         excludes purely route based service revenues"
      → MANAGEMENT ESTIMATE. No methodology published.
      → restated by same CEO, same company, Q4 2025 call, 2026-02-25
      → SAME ORIGIN. Not corroboration.
```

**Retrieved and verified verbatim** from the APi investor day PDF (`s201.q4cdn.com/.../APG-Investor-Day-FINAL.pdf`): the quote and the footnote are on slide 19, exactly as the master records at §3.1.

**Verdict: SINGLE ORIGIN.** Two citations, one origin. The `source:` line prints two dated events nine months apart, which reads as two data points; it is one company's management estimate said twice. APi is also an **interested party** — it is selling an inspection-first equity story to its own investors, and the ratio is the load-bearing number in that story.

**In the deck's favour:** the card itself does the disclosure work the source line does not. It says "It is a leadership estimate covering US inspection revenue, and it excludes purely route-based service revenue" and calls it "the ceiling rather than the base case." Master §3.1 goes further — "no independent replication of it exists… the market's best-supported claim rather than an audited statistic" — and §7.6 warns that treating $3–$4 as a sector constant extends one company's disclosure across 114,427 establishments. The corpus knows precisely what this figure is.

**Rescue:** none available — no independent replication exists in the record, and the master says so. The honest source line is `APi Group management estimate, restated (investor day 21 May 2025; Q4 2025 call)`. The three ServiceTrade/ServiceTitan platform datasets in §3.1 corroborate *direction* only, are vendor-published, and measure narrower quantities — the master carries them as such and the deck correctly leaves them off.

---

### P5 — 40% → 54% mix shift
`source:` **APi Group Q4 2025 call, 25 Feb 2026; investor day, 21 May 2025`

```
40%→54%  → APi Q4 2025 earnings call (Becker), 2026-02-25  [verified: NOT in the investor day deck]
60% target → APi investor day slides 9/51/62, 2025-05-21    [verified in PDF]
20+ quarters → CFO, Q4 2025 call (investor day PDF says 19, slides 17 & 19)
           → SAME ISSUER, both events.
```

Retrieval confirms the split precisely as the master describes it: the investor day PDF contains the 60%+ objective and "19 consecutive quarters", and **does not** contain the 40%/54% pair — which is why the master attributes that pair to the call. The deck's "more than 20 consecutive quarters" tracks the CFO's update, not the stale slide. That is careful work.

**Verdict: SINGLE ORIGIN.** Same issue as P4 — one filer, two events. The card's defence is real and is stated on the card: "it is disclosed by a filer rather than asserted by a seller." A 10-K-adjacent disclosure by a listed company is a materially better class of evidence than a trade assertion. But it is still **n = 1 company**, and the deck generalises it to "THE MIX SHIFT" of a whole sector in the tag.

Master §3.1 also warns that two APi mix series are in circulation with different denominators and that blending them produces a false trend. The deck uses the correct one.

---

### P6 — Three executed inspection agreements
`source:` **Three executed inspection agreements, 2022–2025`

This is the source line that most invites the "unfalsifiable by a reader" charge — and the charge is **half right for entirely avoidable reasons.**

Master §3.2 names all three:

```
Contractor's own form  → Fire Protection, Inc. (Seattle), PUBLISHED master service agreement
Owner's paper          → Johnson Controls Fire Protection, LP — Physicians Realty L.P., contract 919272
Public-sector award    → Pye-Barker Fire & Safety — Lee County, FL, solicitation B210350NAT
```

**All three are publicly retrievable.** I retrieved the third in one search: `leegov.com/procurement/Project Documents/B210350NAT Fire Sprinkler Inspection, Testing, Repair, and Installation/B210350NAT Pye-Barker Fully Executed Contract OCR.pdf` — a fully executed, OCR'd contract sitting on a county procurement server. The first is a **published** standard form. The second carries a contract number.

So the evidence is **three genuinely independent instruments from three different counterparty classes** — the strongest structural card on the deck — and the `source:` line **throws away every handle a reader could use**, and mildly overstates the set ("three executed" — the master says "three executed **or published standard-form** agreements"; the Seattle document is a published form).

**Verdict: INDEPENDENT — but UNVERIFIABLE AS CITED.** The failure is 100% presentational.

**Rescue:** `Lee County, FL solicitation B210350NAT; JCI–Physicians Realty contract 919272; Fire Protection Inc. published MSA`. Same character count. This one line would have blunted a large share of the public criticism.

---

### P7 — 17 US fire and life-safety contractors under a live sponsor
`source:` **smbX consolidator register, as at 29 July 2026`

```
17 → smbX consolidator register (master §4.1 class table, §4.3 roster)
   → 17 named platforms, each with sponsor, entry date, footprint, scale evidence
   → each entry traceable to sponsor press releases, company sites, SDM 100 survey
   → BUT: the register is UNPUBLISHED. A reader can check none of it.
```

**Verdict: SELF-CITED.** Unambiguously. The practice cites its own compilation as authority on a public card, and the compilation is not published.

**Three things mitigate it, and two things make it worse.**

*Mitigating:* (1) The register is real, granular and internally consistent — I counted the §4.3 fire-led table and it contains exactly 17 rows; the 5 / 3 / 8 / 5 splits match §4.1's class table exactly. (2) It is a **compilation of primary and press sources**, not an assertion — each row carries a sponsor, a date and scale evidence. (3) The whole point of the card is that the number is *definitional* — that blended trackers overstate the competitive set by mixing classes — and the card explains the classes.

*Aggravating:* (1) **The card's own grading claim contradicts the master's own table.** The card says *"Two of the seventeen carry a sponsor named only by trade press or a directory listing."* Master §4.1 (line ~613) names those two as RapidFire and Telgian. But the §4.3 roster flags **three**: RapidFire (Concentric — *trade press only*), Telgian (The Miller Group — *directory listing only*), and **Security Fire Systems (Blackford Capital — *trade press only*)**. The master miscounts its own register, and the deck faithfully carries the miscount onto a public card. Neither the 2026-07-30 nor the 2026-08-10 verification pass caught it. (2) The card contrasts 17 with **"the thirty-odd a blended tracker counts"** and names no tracker. The reader can check neither side of the comparison.

**Rescue:** name the class boundaries and one checkable anchor on-card — e.g. "17 fire-led contractors under a live sponsor; 5 security-led integrators, 3 manufacturers, 8 permanent-capital holders and 5 already absorbed counted separately (register available on request)." And fix "Two" to "Three".

---

### P8 — 144 brands · 31 divisions · five Guardians
`source:` **Company brand pages and SEC exhibits, July 2026`

```
144 → Pye-Barker "Our Family of Brands" page → COMPANY SELF-PUBLISHED (primary as to itself)
31  → Sciens Building Solutions all-locations page → COMPANY SELF-PUBLISHED
5 Guardians → five separate company sites + sponsor pages → FIVE SEPARATE ORIGINS
"SEC exhibits" → APi Group EX-21 (23 legal-entity names) → PRIMARY FILING, unnamed on card
```

Retrieved 12 Aug 2026: the Pye-Barker brands page now renders **~170** brand tokens, not 144 — the roster has grown since the July 2026 capture, as it will, because Pye-Barker acquires continuously. **The load-bearing claim is confirmed exactly:** the logos are **display-only images with no hyperlinks and no brand-level domains**. That is the finding the card actually rests on, and it holds.

**Verdict: INDEPENDENT** — company self-publication is a primary instrument as to the company's own brand estate, and the five Guardian entities are five genuinely separate origins. But the source line is **vague in the way the brief flags**: "SEC exhibits" names no exhibit, and a dated count off a page that changes monthly needs a capture date, which "July 2026" only half-supplies.

**Rescue:** `Pye-Barker brands page and Sciens locations page (captured 29 July 2026); APi Group Form 10-K Exhibit 21`.

---

### P9 — Five years to make a Level III inspector
`source:` **NICET candidate handbooks; Washington RCW 18.160`

**This card splits, and the second half is the worst substantive error on the deck.**

**Half one — the certification figures. INDEPENDENT.**

```
5 years / 3 direct → NICET Inspection & Testing of Water-Based Systems (ITWBS)
                     candidate handbook
                   → PRIMARY INSTRUMENT (certifying body's own published requirement)
90 pts / 3 yrs    → same handbook
```

Retrieved and verified verbatim from `nicet.org/.../candidatehandbookitwbs.pdf`: ITWBS **Level III requires at least 5 years total, of which "a minimum of three (3) years of direct inspection and periodic testing of existing water-based fire protection systems."** Recertification every three years on 90 CPD points across at least two categories. Level III is the top level of the ITWBS ladder (the handbook describes I–III only), so "at its top level" is correct. Every number on this half of the card is right.

**Half two — the Washington sentence. UNSUPPORTED.**

The card says: *"Washington writes **the credential** straight into its licence, so the clock is a statutory cap on entry rather than a hiring problem."* In context, "the credential" is the inspection-and-testing credential just described.

```
"Washington writes the credential into its licence"
   → RCW 18.160 / WAC 212-80-093
   → retrieved: names NICET in "water-based fire protection system LAYOUT"
   → that is NICET's Automatic Sprinkler System Layout (ASSL) programme
   → a DIFFERENT programme from ITWBS, with a DIFFERENT experience ladder
   → the 5-year ITWBS clock is NOT written into any Washington licence
   → CHAIN TERMINATES IN THE WRONG INSTRUMENT
```

Two errors, one inherited and one original:

1. **Programme conflation.** RCW 18.160.040(1) and WAC 212-80-093 reference NICET certification in **sprinkler system *layout***, not in *inspection and testing*. Master §7.4 (line 1276) makes the join explicitly and wrongly: *"its Level U requires NICET Level III — a direct statutory link from a state licence to a certification level, **which converts the five-year clock of §7.3 into a hard cap on market entry**."* §7.3's five-year clock is the ITWBS ladder. §7.4's statutory hook is the ASSL ladder. The master bridges two different credentials, and the deck sharpens the bridge into a flat assertion by dropping the programme names.

2. **Level mismatch.** Master §1.3 (line 153) says **"Level U requires NICET ASSL Level III."** WAC 212-80-093 as retrieved says the opposite: **Level U → "pass an exam"**; it is **contractor Level 3** that requires **NICET Level 3 or 4**. Both the master's §1.3 table and its §7.4 narrative rest on this mapping.

The 5-year figure survives; the *statutory* amplification does not. The card's rhetorical payload — that this is a **cap written into law** rather than a labour-market condition — is the part that fails.

**Rescue:** either drop the Washington sentence, or replace it with the accurate version: *"Washington writes a NICET credential into its contractor licence (WAC 212-80-093, Level 3 — sprinkler system layout), so at least one state converts a certification ladder into a statutory gate."* That is still a good sentence and it is true.

*Minor:* NICET is a certifying body with an interest in the value of its own credentials, but it is the primary instrument for its own requirements. Not a defect.

---

### P10 — 60 days, and $75,164 against $66,225
`source:` **Fla. Stat. §633.328 (2024); 2022 Economic Census`

```
60 days → Fla. Stat. §633.328 → PRIMARY STATUTE, retrieved verbatim
$75,164 / $66,225 → 2022 Economic Census, NAICS 238220 → PRIMARY GOVERNMENT TABLE
   → TWO INDEPENDENT PRIMARY INSTRUMENTS, different branches of government,
     different subject matter, no shared ancestry.
```

Retrieved verbatim from flsenate.gov:

> "the business organization shall immediately notify the State Fire Marshal of the individual's termination and shall have a grace period of **60 days** from the date of termination in which to certify another person… failing which the certification of the business organization shall expire without further operation of law."

and

> "A certified individual who is the sole contractor on behalf of a business organization **may not affiliate simultaneously with another business organization**."

Both clauses on the card, both exact. Master derivation E18 shows the Census arithmetic in full: $56,060,961k ÷ 846,519 = $66,225; $24,290,824k ÷ 323,173 = $75,164.

**Verdict: INDEPENDENT.** This is the strongest card on the deck and the model for what the others should look like — two named instruments a reader can open in one click each, quoted accurately, doing genuinely different work in the same argument.

*One caveat the master names and the card drops:* both per-head figures divide an **annual** payroll numerator by a **first-quarter** employment denominator (that is how Census publishes the variables), so they indicate relative cost per head rather than exact annual compensation. Master E18 says this explicitly. The card presents them as flat wage figures.

---

### P11 — The multiple with one origin
`source:` **Capstone Partners, 2 Feb 2026; Breakwater M&A, 1 Feb 2026`

**This is the card the critic pointed at, and it is simultaneously the deck's best analysis and its worst citation.**

I re-walked the entire chain independently. Every link holds:

```
17–20x
 └─ ORIGIN: SDM Magazine art. 103337, Rodney Bosch, 2024-07-15
    "17x to 20x its $350 million EBITDA… exceeding $6 billion"
     └─ relaying PE HUB
        └─ PE Hub's sources: UNNAMED / anonymous
        └─ conditional ("could receive bids"), prospective, company declined to comment
        └─ NO TRANSACTION OCCURRED (Jan 2025 minority recap, terms undisclosed)
        └─ ⇒ CHAIN TERMINATES IN NOTHING
 ├─ RESTATEMENT: PE Hub, 2025-04-15 — same assertion as sector fact, no sample, paywalled
 ├─ LAUNDERING: ctacquisitions.com (CT Strategic Partners LLC, Sheridan WY)
 │   "Industry-data sources cite scaled PE-backed FLS platforms transacting as high as
 │    17x-20x EBITDA… Source: Breakwater M&A Fire Alarm & Life Safety Multiples 2026 |
 │    Capstone Partners Security Solutions M&A Update"   ← RETRIEVED VERBATIM
 │    ├─ Capstone, 2026-02-02 → ACTUALLY SAYS 11.8x. "17x"/"20x" appear NOWHERE. ✗
 │    └─ Breakwater, 2026-02-01 → top tier "Platform-ready" = 7x to 10x. No 17-20x. ✗
 └─ RE-CITATION: Zeus Fire and Security (Access Holdings portfolio co.), 2026-07-15
     "Scaled platforms with strong recurring revenue are transacting at 17x to 20x EBITDA"
      └─ cites "CT Acquisitions… May 2026" ← RETRIEVED VERBATIM. Cites the aggregator.
```

**Every link independently confirmed by retrieval.** Capstone's page says 11.8x and contains no 17x or 20x. Breakwater's top tier is 7x–10x. CT Acquisitions attributes 17–20x to both, by name, and neither contains it. Zeus cites CT Acquisitions. The master's §6.6 is accurate in every particular. **This is genuine citation forensics and it is the opposite of slop.**

**And the `source:` line destroys it.**

The line reads `Capstone Partners, 2 Feb 2026; Breakwater M&A, 1 Feb 2026`. Those are **the two houses that do not publish the figure** — they are the *falsely credited parties*, cited on the card as though they were the card's authorities. Every actual link in the chain — SDM 2024-07-15, PE Hub 2025-04-15, ctacquisitions.com, Zeus — appears **nowhere on the card**.

To an outside reader with no access to the master, this card presents as: *two M&A advisories, one day apart, cited together for a claim about M&A multiples.* That is textbook syndication-shaped. It is exactly the pattern the critic named. **The single most-quoted piece of evidence for the "AI slop" charge is a labelling error on the deck's most rigorous page.**

**Two further problems the master under-weights:**

1. **Breakwater is an interested party whose own chain is thin.** Breakwater M&A is a sell-side advisory that solicits fire-alarm and life-safety mandates. Its 7x–10x ceiling — which the master and the deck use as the rebuttal anchor — cites, on retrieval, only *"SDM Magazine's 2025 Industry Forecast"* and *"SDM Top 100 transaction data"*, with **no study, no dataset, no methodology**. The rebuttal instrument is as unsourced as the thing it rebuts, and it is published by a firm selling advisory in the sector it is pricing. The master calls it "a ceiling 7 turns below" without noting either fact.
2. **SDM Magazine sits on both sides.** SDM is the origin publication for the bogus multiple *and* the source of the SDM 100 revenue/RMR figures used throughout §4.3's register. Not circular — different functions — but it is a concentration of dependence on one trade outlet that nothing in the corpus flags.

**Verdict: CIRCULAR AS LABELLED — ANALYSIS CONFIRMED.**

**Rescue:** `SDM/PE Hub, 15 July 2024 (origin); PE Hub, 15 Apr 2025; ctacquisitions.com; Zeus, 15 July 2026 — Capstone publishes 11.8x, Breakwater 7x–10x`. Longer, but it *is* the card. The card's argument is a chain and the source line prints two nodes that are not on it.

---

### C5 — "83 pages · 10 August 2026"
`pdfinfo` on `collateral/fire-safety-market-assessment/2026-08-10/market-assessment.pdf` → **Pages: 83**, CreationDate Mon Aug 10 2026. **VERIFIED against a real render.**

Note the spec's own docstring is now stale: it states *"THE COVER CTA CLAIMS NO PAGE COUNT. No report has been rendered from this master."* The report was rendered on 2026-08-10 and the CTA was updated; the docstring was not. The claim is true; the documentation contradicts it. Housekeeping, not integrity — but the docstring is the deck's own audit trail, and an out-of-date audit trail is how the *next* error survives.

---

## Was the criticism fair?

**On the merits, no. On the artifact, yes — and that distinction is the whole finding.**

The accusation was that the sources all reference each other. I went looking for that, adversarially, and it is **not true of the research**. The fire-safety corpus is materially more rigorous than ordinary sell-side work. It refuses to publish a market size at all because every federal container fuses fire with an adjacent trade. It labels vendor-published compliance figures as vendor claims. It records that a city's own two numbers do not reconcile and tells you which one it is leaning on and why. It quotes the footnote under the ratio it likes most and calls that ratio a ceiling rather than a base case. It says in terms that no bank publishes a fire multiple by size tier and that the tuck-in end of the spread has **no observed transaction anywhere**. And §6.6 is a piece of citation forensics that I reproduced end to end by retrieval — origin, restatement, laundering, re-citation, four apparent sources and one assertion, every link confirmed. Nine of the eleven pages land on an instrument a reader could open: a municipal press release, a model code section, NFPA intervals, a Florida statute, an Economic Census table, a NICET handbook, an SEC exhibit, a county procurement contract, an investor-day PDF with its footnote intact. That is not what AI slop looks like. Slop has no negative space, and this deck is **built** out of negative space — the docstring lists nine substantive figures deliberately withheld, including the one everybody quotes.

**But the criticism was not made against the corpus. It was made against the card.** And on the card the practice did the following: it cited its own unpublished register as an authority (P7); it hid three publicly downloadable contracts — one of them a fully executed county PDF findable in a single search — behind the phrase "three executed inspection agreements" (P6); it wrote "SEC exhibits" without naming an exhibit (P8); and on P11 it printed, as its source line, **the names of the two advisory houses whose entire role in the story is that they do not publish the figure** — two M&A advisories, dated one day apart, sitting under a card about M&A multiples. A reader with no access to the master, looking at that line, sees syndication. The critic looked at that line and said syndication. **The critic was reading the artifact correctly.** The practice built a glass box and then shipped it with the labels facing inward.

And the audit turned up two things the criticism did not reach, both of which are worse than a bad label because they are wrong rather than merely opaque. **P9's Washington claim is false**: the state writes NICET's *sprinkler-layout* credential into its licence, not the *inspection-and-testing* credential whose five-year clock the card is about, and the master's own §1.3 puts that requirement on the wrong licence tier as well. **P1 presents a paraphrase as statutory wording** on the one card whose argument is that the exact wording is load-bearing, and the paraphrase is broader than the code. Two verification passes — 2026-07-30 and 2026-08-10 — checked whether figures appeared in sources. Neither asked whether the *instrument named* was the instrument that *contained* the claim. That is the same blind spot the brief describes, one level up: not "is this figure in a source" but "is this source the one that says it."

Add the miscount the practice made against itself (P7 says two weakly-sourced sponsors; its own roster shows three) and the Rockville/Burlington asymmetry (identical vendor platform, disclosure applied to one city and not the other), and the honest summary is: **the research is strong, the presentation is indefensible, and the checks were the wrong shape.** The right response is not to defend the deck. It is to fix five source lines, correct two claims, and re-run the verification with an independence test in it — after which this deck becomes the strongest public artifact the practice has, because the work underneath it already is.

**Fabricated figures: none. Figures that fail on the evidence: one (P9 Washington). Figures a reader cannot check as cited: four (P6, P7, P8, P11).**

---

## What this means for the other markets

**The pattern is worse elsewhere, and the evidence is on disk.** I pulled the `source:` lines from the two sibling deck specs in the same directory. They do not survive the same test.

**Home services** (`home-services-teardown.deck.mts`) — eleven figure-bearing cards, and the source lines are:

> `PitchBook; industry M&A reports (est.)` · `IBISWorld / U.S. Census / industry reports (avg.)` · `IBISWorld / PitchBook 2026` · `IBISWorld (avg.)` · `U.S. Census; IBISWorld` · `industry data 2025` · `PitchBook (est.)` · `GMInsights / industry (avg.)` · `industry M&A data 2024–25 (est.)` · `JLL; U.S. BLS (est.)` · `Bain & Company 2025; PitchBook`

Six of eleven carry `(est.)` or `(avg.)` — the deck is telling you on its face that the figure is an **average taken across unnamed sources**, which is the precise mechanism by which several syndicated repetitions of one study become a single confident number. **`industry data 2025`** (the 74% pest-control recurring figure) terminates in nothing at all; there is no instrument named, and no reader can proceed. **`$700B` across six trades** is sourced to `IBISWorld / U.S. Census / industry reports` — IBISWorld is a paywalled commercial aggregator that does not publish its own sourcing, so a chain ending there ends in a wall, not a primary; and blending it with Census means two incompatible containers averaged into one headline. **`~$250B` electrical** rests on `GMInsights / industry (avg.)`. **`2.1M skilled-trades jobs by 2030`** is `JLL; U.S. BLS (est.)` — that projection is widely syndicated and traces to a small number of originating studies; "JLL; BLS" names a consultancy and an agency without naming the table. And the **`15–20x` / `~16x` / `~18.5x` / `~20x`** multiple stack on the opening card is `PitchBook; industry M&A reports (est.)` — the identical shape to the fire-safety 17–20x chain, except that in fire safety the practice **traced it and refused to print the number**, and in home services it printed four of them. This deck is where the criticism would actually land.

**Elevator** (`elevator-teardown-1.deck.mts`) — the clearer failure, and the cleanest example of the pattern the brief describes. **Three consecutive figure-bearing cards** — the ~10%/60%/30% ownership split, the 40-deals-at-peak count, and the >90% retention claim — carry the **identical** source line: `elevatorworld.com · Dec 2025`. That is not three citations. It is **one trade article, printed three times**, and a reader flipping the carousel sees three independently sourced pages. It is the exact arithmetic of "five citations and one fact," at n=3, on the face of the deck. The moat card then cites `nationalelevatorindustry.org · iuec.org` — **NEII, the trade association of the elevator OEMs whose market share the deck is describing, and the IUEC, the union whose roster size is the figure being quoted.** Both are interested parties in the numbers they publish, presented without qualification. The fire-safety master would have caught both: it labels BRYCER a vendor claim and excludes Security 101 from a register on evidentiary grounds. That discipline did not travel.

**The structural diagnosis.** Fire safety is the market that got the full treatment — a 15-file corpus, a gate report, two verification passes, and a master that argues with itself in the appendix. Elevator and home services did not. Their decks were built off thinner substrates, and their source lines show it: fire safety's worst sin is naming the *wrong* real instrument, while home services' is naming *no* instrument and elevator's is naming *one* instrument three times. So the practice's exposure runs in the reverse order of the attack: **the deck that was publicly accused is the one that survives audit, and the two that were not accused are the two that would not.**

Three things follow, in order of urgency. **First, the independence test has to become a build-time gate, not a review habit.** The existing `verify-spec` checks that a figure appears in the master; add a check that no two figure-bearing cards in one deck share a `source:` line, and that any source line containing `(est.)`, `(avg.)`, `industry data`, or a bare aggregator name fails the build. Both sibling decks fail that gate today; fire safety passes it on ten of eleven cards. **Second, every source line must name an instrument a reader can open** — a statute section, a table identifier, a filing exhibit, a docket or solicitation number, a dated URL. `B210350NAT` is a source line. `Three executed inspection agreements` is not, and the underlying document was public the whole time. **Third, the corpus needs a standing rule that a figure's rebuttal is held to the same standard as the figure** — Breakwater's 7x–10x was used to knock down 17–20x while itself resting on unsourced trade-press data published by an interested advisory, and nothing in two verification passes noticed, because the rebuttal was pointing the way the study already wanted to go.
