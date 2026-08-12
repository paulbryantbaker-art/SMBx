<!--cover
byline: Paul Baker
role: smbX.ai · Buy-side corporate development
headshot: founder-portrait.jpg
image: cover-{subject}.jpg
imagePos: 50% 50%
footer: {Short Title} — {Assessment Type}
eyebrow: MARKET ASSESSMENT
accent: {substring of a ## heading} | band-{name}.jpg | 50% 50%
accent: {substring of a ## heading} | band-{name}.jpg | 50% 50%
accent: {substring of a ## heading} | band-{name}.jpg | 50% 50%
stat: {figure} | {label, ≤6 words}
stat: {figure} | {label, ≤6 words}
stat: {figure} | {label, ≤6 words}
-->
# {Subject}: {A Comprehensive State of the Market}
## A Buy-Side Assessment for Acquirers · Published {D Month YYYY}

**{trade one} · {trade two} · {trade three}.**

1. **{Finding one, stated as a claim.}** The figure, the comparison, and why it matters to a buyer.
2. **{Finding two.}** Same shape. Something that changed, with its date.
3. **{Finding three.}** Something counterintuitive. Never a table of contents.

---

<!-- ─────────────────────────────────────────────────────────────────────
     COVER BUDGET. One-line title → hero + 3 stats + 4 cards.
     Two-line title → 3 cards. Stats run 3 per row.
     Overflow is silent: the byline slides onto page 2. Check page 1:
       pdftoppm -png -r 55 -f 1 -l 1 collateral/<slug>/<date>/<slug>.pdf /tmp/c
     ───────────────────────────────────────────────────────────────────── -->

## EXECUTIVE SUMMARY

- **{Claim in bold, then the evidence.}** Concise attributions only —
  `(Publisher, YYYY-MM-DD)`. No verification narration; see Report voice law.

---

# PART I — {NAME}

## 1.1 {Section}

<!-- Body rules, in short:
     · State what is true. Never narrate the fact-check.
     · Publisher + date where a figure lands. Nothing more.
     · Two live sources disagree → carry both in one sentence.
     · Never `~` for "approximately" (GFM strikethrough). Use ≈.
     · Never end a sentence right after a bare $figure (auditor false positive).
     · A rounded figure is a different figure.
-->

---

# APPENDIX — DATA CONFLICTS, CAVEATS & SOURCE NOTES

## A.0 Provenance

**Consolidated from:** {the research workstreams, named}

## A.0.1 Corrections applied {YYYY-MM-DD} — {pass name}

| Figure | Was | Now | Why |
|---|---|---|---|
| | | | |

<!-- One A.0.n section per verification pass, numbered in order.
     Each row: what it was, what it became, the named source that overturned it.
     Retired figures stay named so they are recognisable in an older copy. -->

## A.1 Reconciled data conflicts

| Item | Conflict | Resolution used |
|---|---|---|
| | | |

## A.2 Caveats

## A.3 Primary source families

**Government and official statistics.**
**Market research and industry data.**
**Trade and financial press.**
**Vendor-published benchmarks (interest disclosed).**

## A.4 How to read the figures, and where they came from

<!-- ══ STANDING BLOCK — every report carries this, near-verbatim ══ -->

**Everything in this report is drawn from publicly available information.** The
sources are U.S. government statistical releases, SEC filings and issuer
disclosures, published market-research and trade-association output, trade and
financial press, and the public websites and press releases of the companies
named. Each is cited where it is used and listed in full in the Sources section
below.

**No proprietary or confidential information was obtained or used in preparing
this report.** Nothing here derives from a confidentiality agreement, a data
room, management access, or a client engagement. No company named in this
document provided information for it.

**Every figure in the body sits in one of three classes.** The body does not
label them, because a reader should not have to read a footnote to reach a
sentence. The convention is:

| Class | What it means | How to recognise it |
|---|---|---|
| **Reported** | A named publisher states the figure. Government series, filings, research houses, trade press. | The publisher and date appear alongside it. |
| **Verified** | Checked against the primary source on the publication date — the table, the release, the filing itself. | Also carries its publisher; the verification record is A.0.n and the files in `research/`. |
| **Derived** | Arithmetic on reported figures, not published anywhere. | Registered in Derivations below with inputs, working and assumption. |

**One distinction the body does observe, because it changes what a number
means.** Where a transaction figure reaches print through trade press citing
unnamed sources, with the parties declining to disclose terms, it is public but
it is not a disclosure. The outlet is named wherever one appears.

**On the valuations shown.** Enterprise values are either figures reported by a
named outlet or estimates produced by the stated framework with its assumptions
exposed. Neither is an appraisal, and nothing here should be read as a valuation
of a business a reader might transact with. Market-level multiples and ranges
are market context, not target pricing.

**Where the figures are least stable.** <Named series with their refresh dates,
open earnings windows, pending decisions.>

**The correction record.** Corrections are recorded in A.0.1–A.0.n above rather
than quietly absorbed. Each entry states what the figure was, what it became,
and the named source that overturned it.

<!-- ══ END STANDING BLOCK ══ -->

## Sources

## Derivations

Figures below appear in no source and are arithmetic on figures that do. Each
states its inputs, its arithmetic and its assumption.

| Figure | Inputs | Arithmetic | Assumption |
|---|---|---|---|
| | | | |

---

*Published {D Month YYYY}. {One line on what this supersedes.}*
