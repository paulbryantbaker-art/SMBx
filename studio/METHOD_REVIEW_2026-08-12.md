# The method, reviewed — and what now refuses instead of nodding

**smbX.ai · methodology review · 12 August 2026**

Commissioned after two public failures in one week: the fire-safety teardown
called AI slop on LinkedIn because its sources referenced each other, and the
DFW band-label error live on smbx.ai for nine days after the studio had
corrected it. Paul's brief: *"for the methodology to be 100% repeatable and
reproducible without variation, we need to be solid on sourcing, citation, and
accurate accounting."*

This document is the review, the diagnosis, and the record of what was built
today. The laws it created live in `CLAUDE.md` (THE LAWS) and `RESEARCH.md` —
this file explains them; those files bind.

---

## 1. What the method already gets right

The written method is sound, and the review found nothing wrong with its
architecture. Six passes with verification as a separate, named, non-optional
step. One master per market, derived documents audited against it. A
correction ledger (A.0.n) that records rather than absorbs. Conflicting
sources carried as both endpoints, never a midpoint. A rounded figure treated
as a different figure. "Never generate a company name, a domain or a figure."
Every document ending on what we don't know yet. The audit with a pinned test
suite behind it.

None of this week's failures came from the method as written. Every one came
from the gap between what the rules said and what the code enforced — or from
a check whose silence read as a pass.

## 2. The five failure classes — every incident this practice has had, sorted

**Class 1 — the blind guard.** A check that cannot see prints the same CLEAN
as a check that saw everything. The `%\b` regex meant the audit had never
checked a percentage on any master. The sourcing guard's 53-of-70 unclassified
origins meant CLEAN was issued blind — the fire-safety circle passed inside
that blindness. carta-guard's static-import regex caught 1 builder of 5.
`audit.mts` reads `research/` one level deep, so thirteen fire-safety files in
a subfolder were never checked at all. Four phantom guards named in the rules
did not exist in the repo. **This class is the deepest one, because every
instance prints success.**

**Class 2 — true parts, false sentence.** "Service is 35% of its sales" — 35%
is New Equipment; both numbers verified, the sentence false. A.0.7: five
Census cells summed correctly, the sums filed under band names one step too
low. The ≈280/$2–6B pairing running two denominators through one sentence. No
source check can catch these, because every component traces.

**Class 3 — the drifted copy.** The website reports drifted from the studio
documents (band labels, nine days live). `content/studio/` method docs at half
their studio size. Two engines on disk, one of them a stale snapshot. `REPO`
pointing at an empty folder for two weeks.

**Class 4 — the unfiled word.** A quotation attributed to Otis that no
transcript contains. Words are figures too, and nothing checked them.

**Class 5 — fabrication under pressure.** The $59k median that research
recorded as $57,300. Caught by the audit — the one class the existing
machinery handled.

## 3. What was built today, mapped to the classes

| Built | Class it closes | The proof it works |
|---|---|---|
| **Coverage floor** in `sourcing-protection.mts` — below 90% classified origins, or any figure resting solely on an unclassified domain, the guard exits 3 NOT ESTABLISHED and refuses to verdict | 1 | Ran against elevator: refused at 40% coverage — the corpus every "clean" elevator artifact had been judged against. After classing 100+ domains: 96%, and **13 findings that were invisible this morning** |
| **`quote-check.mts`** — every quoted span verbatim in `research/` (ellipsis joins fragments; emphasis and trailing punctuation are typography; wording never loosened) | 4 | Caught a planted fabrication; on the live masters found 19 (elevator) and 57 (home-services) unverifiable quotations |
| **`crossfoot.mts`** — every written sum, difference, product and quotient recomputed at printed precision; declined chains are printed, never silent | 2 (the arithmetic half) | Caught planted errors; on the elevator master found `92,075 ÷ 132 = 697` where the quotient is 697.54 — real printed working that does not compute |
| **`drift-check.mts`** — published report bodies byte-identical to their studio sources below the cover; method-doc copies byte-identical, no exemption; unmapped reports named | 3 | Caught a planted drift with the first diverging line; the real four report pairs and seven doc pairs verified in sync as of today |
| **`preflight.mts`** — every guard, one command, one table, one verdict; SKIPPED rows fail the run | 1 (the assembly half) | Ran on both markets; tables below |
| **`build-record.mts`** + three builder patches — every render now writes `BUILD.txt`: engine commit, node, spec and master sha256 | 3 (artifact provenance) | Proven on a live render; today's 08-12 PDFs had no receipt, the next ones cannot avoid one |
| **~120 domains classed** in `DOMAIN_CLASS` — home-services and elevator outlets, sponsors, operators, associations, federal publishers off-.gov | 1 | The before/after numbers above |

What already existed and stands unchanged: `audit.mts` + its 44-assertion test
suite, `verify-spec.mts`, `voice-check.mts`, `design-check.mts`,
`art-prompt.mts`, `carta-guard.mts`, `retired-check.mjs`, the A.0.n ledger
discipline, and the render law.

## 4. The doctrine, stated once

1. **No pass on silence.** A guard reports its own coverage and refuses below
   its floor. A refusal (exit 3) is neither a pass nor a finding — it is "I
   cannot know," said out loud. This is now a law in CLAUDE.md.
2. **A quotation is a figure made of words.** Verbatim in the corpus or not on
   the page.
3. **Written arithmetic must compute.** At the precision printed, rounding
   half up, with declined chains printed.
4. **Hold the instrument.** Local copy where feasible; URL + retrieval date +
   exact locator always. The DFW recount took an hour because `cbp23co.txt`
   was on disk. That is the norm now, not the luck.
5. **The copy is never edited.** Studio document changes → website copy
   replaced wholesale → drift-check before every push.
6. **One command gates everything.** `preflight.mts <market>` before any
   render or post. Eight checks assembled by memory is how the Ledger
   teardown happened.
7. **Verification reads sentences, not numbers.** Job 2 quotes the
   instrument's own line against each load-bearing claim. This is the one
   step no guard can do, and every guard's closing text says so.

## 5. Where the two live markets actually stand tonight

Preflight, run against both markets this evening — the honest table, most of
which was invisible this morning:

**home-services:** audit **FAIL** (123 unexplained figures on the master —
pre-existing, now counted); crossfoot PASS (12 statements); quote-check
**FAIL** (57 master + 52 assessment + 1 DFW-map unverifiable quotations);
sourcing **FAIL** (23 findings on the assessment, 1 on the DFW map — the 17x/
$100M single-origin collapses and 21 no-instrument figures); retired **FAIL**
(84 candidates to read); carta PASS.

**elevator:** audit PASS (141 cited, 3 derived); crossfoot **FAIL** (the 697
truncation, twice); quote-check **FAIL** (19 + 7 unverifiable); sourcing
**FAIL** (13 findings — company figures cited via corporate pages rather than
the filings themselves); retired **FAIL** (ledger citations to read); carta
PASS.

Two things to hold while reading that. First, none of it says the research is
wrong — it says the evidence trail has holes where it was never checked
before, and each row is a named, finite work item. Second, **the DFW census
spine is clean through every new check**: 598 recomputed from the raw
instrument, every crossfoot computes, no sourcing finding touches a Census
figure, and the honest statement of suppression (true 10–249 count is
600–606; the 4.3% headline is invariant across it) is in the master's
verification pass.

## 6. What no guard can do — the standing limits

Stated here so nobody mistakes the new machinery for the whole method. No
check we own can tell whether a source actually SUPPORTS the claim citing it.
None can catch a false sentence assembled from true figures — the 35% error
passed every mechanical check that exists or could exist. None can catch a
right quotation credited to the wrong speaker, an invented qualitative claim
carrying no figure and no quote, or a confidentiality breach (a client figure
in a public deck audits clean). Job 2 — a person reading the load-bearing
claims against the primary instruments and quoting those instruments' own
lines — is the only check on all of these. The machinery's job is to make
sure that when job 2 is done, nothing else can quietly undo it.

## 7. The queue this creates

In order: read the 13 + 24 sourcing findings and fix the LINES (cite the
filing, not the corporate page; name the outlet where no instrument exists —
per the elevator caveat pattern, a figure that says "trade press citing
unnamed sources" is stronger than one pretending otherwise); work the 57 + 19
quotations (file the source text or unquote to paraphrase); resolve the
home-services master's 123 unexplained figures; read retired-check's
candidates; fix the 697/698 rounding; then re-render the four Carta rebuilds
still pending, each of which will now carry a BUILD.txt. The two orphan
reports (`home-services-master-assessment.md`, `the-quiet-repricing.md`)
need retiring or a manifest row. One decision is Paul's: whether a regulated
disclosure on an issuer's own domain (KONE's inside-information release, the
Otis 10-K via otis.com) counts as instrument-grade — the guards currently say
no, which is conservative, and the cheap fix is citing the sec.gov copy.

*Nothing posts from either market until its preflight is green. That is the
sentence this review exists to make true.*
