<!-- run: 13 | hunt: B | date: 2026-08-12
     query: EDGAR accession numbers for the filings this market's load-bearing
            company figures rest on, so the corpus cites the FILING rather than
            the filer's own website
     tool: SEC EDGAR full-text search + filing index pages, opened directly
     coverage rows: 2 (who owns what), 3 (operating economics) -->

# EDGAR instrument pass — citing the filing, not the corporate page

**Why this run exists.** On 2026-08-12 `sourcing-protection.mts`, run against a
fully classified corpus for the first time, reported a set of company figures as
**NO INSTRUMENT — press/vendor/interested/self all the way down**. The figures
were not wrong and were not thinly sourced: they are APi Group's own reported
results, quoted verbatim in `research/03`. They flagged because the corpus
reached them through **`apigroupinc.com`**, the company's own website, which
this practice classes as `issuer` — the party speaking about itself.

That classification is deliberate and conservative. A company's website is the
company talking; an SEC filing is the company talking **under a legal
obligation, to a regulator, in a document with an accession number**. The two
are not the same evidentiary object even when they carry the same sentence.

So the fix is not to re-argue the class. It is to cite the filing.

## What was opened

**APi Group Corporation** — CIK **0001796209**.

| | |
|---|---|
| Form | 10-K, annual report |
| Period of report | **2025-12-31** |
| Filed | **2026-02-25** |
| Accession | **0001628280-26-011620** |
| Primary document | `apg-20251231.htm` (iXBRL) |

- Filing index — https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/0001628280-26-011620-index.htm
- Primary document — https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231.htm

Both were opened for this run. The index page states the registrant as **APi
Group Corp**, the form as **10-K**, the period as **2025-12-31** and the filing
date as **2026-02-25**, which is the record this file exists to establish.

## What this changes, and what it does not

**It changes the class of the evidence, not the figures.** Every APi figure in
`research/03` stands exactly as recorded. Nothing here re-measures anything.
What changes is that a reader following the citation now arrives at a filing
rather than at a marketing page, and the sourcing guard can see an instrument
underneath the figure.

Each figure below is restated against the accession, so the instrument sits on
the same line as the number rather than in a register underneath it — which is
how a source line is actually read, by a person and by the guard:

| Figure | As APi states it | Instrument |
|---|---|---|
| **$7,911 million** FY2025 net revenues | "Net revenues increased by 12.7% (7.9% organic)" against $7,018 million in 2024 | 10-K, accession 0001628280-26-011620, period 2025-12-31 — https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231.htm |
| **12.7%** net revenue growth, **7.9%** organic | same sentence | https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231.htm |
| **$7,018 million** FY2024 net revenues | the prior-year comparative in the same statement | https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231.htm |

The **$5 million** reconciliation gap already flagged in `research/03` —
$5,456M + $2,460M = $7,916M against a stated total of $7,911M, presumed
intersegment elimination — is unaffected and still stands as a flag rather than
an averaged figure.

**It does not clear the figures that have no instrument and never will.** Three
classes in this market are terminal at a non-instrument source, and no amount of
EDGAR work moves them:

- **Private-transaction multiples** — GF Data's 6.4x / 6.7x. Private deal
  multiples are not filed anywhere by anyone. GF Data's subscription database
  *is* the primary source, and a card carrying the figure names it.
- **Broker and advisor surveys** — the Capstone 9.8x "premium" expectation, the
  Marsh insurance index. These are surveys of opinion about the future. Naming
  the surveyor is the whole of the sourcing that is available.
- **Deal values with terms undisclosed** — reached through trade press citing
  unnamed sources, with the parties declining to state terms. Public, but not a
  disclosure. The standing appendix already carries this distinction and the
  body names the outlet.

**A NO INSTRUMENT finding on any of those three is correct and should stay
visible.** It is the guard describing the evidence honestly, not a defect to be
cleared. The response is the sentence on the page, not a search for a filing
that does not exist.

## The coverage numbers this run produced

Recorded here so the master's A.0.3 ledger cites a source rather than asserting
its own diligence. `sourcing-protection.mts` refuses to verdict below a **90%**
classification floor. This market's corpus classified at **30%** of 273 origins
on first run — it was refused, correctly. After 188 domains were classed by
hand, coverage reached **98%** and the sighted run reported **15** findings,
down from 17 once the APi figures above were re-cited to the filing.


## Sources

- SEC EDGAR full-text search, APi Group Corp (CIK 0001796209), form 10-K,
  filed 2026-02-25 — https://efts.sec.gov/LATEST/search-index
- APi Group Corporation, Form 10-K for the year ended 31 December 2025,
  accession 0001628280-26-011620, filed 2026-02-25 —
  https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/0001628280-26-011620-index.htm
- APi Group Corporation, Form 10-K primary document, `apg-20251231.htm` —
  https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231.htm

## What we don't know yet

- **The other filers in this market have not had this pass.** Cintas, Johnson
  Controls, ADT and EMCOR figures still reach the corpus through issuer pages
  and press. Each needs its own accession recorded the same way. That is a
  mechanical run and it is not done.
- **Whether an issuer-hosted filing should count as instrument-grade.** This
  practice currently says no, and this file is the workaround. If the answer
  becomes yes, the guard's class table changes and runs like this one become
  unnecessary for figures the filer hosts itself. **Paul's call.**
