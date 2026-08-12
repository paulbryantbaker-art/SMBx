<!-- run: VP | hunt: — | date: 2026-08-12
     query: (1) recompute the DFW size-band distribution from the primary Census
            instrument, independently of run 06; (2) test whether the source-
            independence guard is actually testing this corpus
     tool: direct recomputation of cbp23co.txt on disk (no API, no aggregator);
           sourcing-protection.mts before and after a domain-classification pass
     coverage rows: 2, 5, 7, 8 -->

# Verification pass — the DFW establishment bands, and what the sourcing guard was not checking

Two questions, asked by Paul on 2026-08-12: **how do we know 598 is right**, and
**is the source-independence method actually solid** after the fire-safety
circular-citation failure. They have different answers. The first figure survives
and gets tighter. The second question found a real hole.

---

## 1. 598 — recomputed from the instrument, not from the note

`run 06` reported the band distribution from `cbp23co.txt`, the Census Bureau's
County Business Patterns 2023 Complete County File. That file is still on disk at
`smbx-search/cbp23co.txt` — 107,735,449 bytes, 1,100,962 rows. **It was
recomputed today from the raw file, without reading run 06's table**, filtering
`naics == 238220`, `fipstate == 48`, and the eleven OMB Bulletin 23-01 counties.

Every published cell reproduces exactly:

| County | Estabs | Emp | Payroll ($k) | <5 | 5–9 | 10–19 | 20–49 | 50–99 | 100–249 | 250–499 |
|---|---|---|---|---|---|---|---|---|---|---|
| Collin | 264 | 2,939 | 217,084 | 151 | 52 | 28 | 20 | 5 | 8 | N |
| Dallas | 727 | 13,292 | 1,078,697 | 386 | 126 | 93 | 69 | 25 | 22 | 4 |
| Denton | 234 | 2,371 | 178,943 | 142 | 39 | 22 | 20 | 8 | 3 | N |
| Ellis | 112 | 942 | 65,928 | 67 | 21 | 13 | 7 | 3 | N | N |
| Hunt | 68 | 415 | 25,218 | 37 | 20 | 7 | 4 | N | N | N |
| Johnson | 88 | 702 | 40,541 | 44 | 23 | 15 | 4 | N | N | N |
| Kaufman | 89 | 670 | 44,760 | 54 | 18 | 9 | 7 | N | N | N |
| Parker | 86 | 649 | 39,296 | 49 | 20 | 11 | 4 | N | N | N |
| Rockwall | 68 | 672 | 49,449 | 45 | 12 | 6 | N | N | 3 | N |
| Tarrant | 631 | 9,078 | 664,889 | 331 | 124 | 78 | 57 | 25 | 13 | 3 |
| Wise | 45 | 250 | 12,931 | 24 | 12 | 9 | N | N | N | N |
| **DFW MSA** | **2,412** | **31,980** | **2,417,736** | **1,330** | **467** | **291** | **192** | **66** | **49** | **7** |

`10–249 = 291 + 192 + 66 + 49 = 598.` The arithmetic in run 06 and in ledger
A.0.7 is correct, and **598 is the correct sum of the published cells.**

### What `N` means, settled empirically

Run 06 read `N` as disclosure suppression rather than zero. That reading is
right, and it can now be demonstrated from the file itself rather than asserted.

Across all 1,100,962 rows, partition by whether any size-class cell is `N`:

| | rows | `est` − Σ(published classes) |
|---|---|---|
| No `N` anywhere | 2,043 | **0 in every single row** |
| At least one `N` | 1,098,918 | 0 → 9+, distributed |

Where nothing is suppressed the classes sum to the establishment total exactly,
2,043 times out of 2,043. The decomposition is therefore complete by
construction, and every non-zero gap is suppressed establishments. `N` is not
zero. For DFW the gap is **10 establishments** across six counties.

### Where the ten can actually sit — the bound run 06 did not compute

Run 06 said the ten sit "all of them in the 20-plus range." That is close but it
was not derived. Two constraints pin it much harder: which cells are `N` in each
county, and how much employment the published cells already claim.

| County | hidden | cells suppressed | employment head-room | forced conclusion |
|---|---|---|---|---|
| Dallas | 2 | 500–999, 1000+ **only** | 5,516 | **cannot** be in 10–249 |
| Rockwall | 2 | 20–49, 50–99, 250+ | 207 | **must** be in 10–249 — two at 250+ needs ≥500 |
| Ellis | 1 | 100–249, 250+ | 350 | could be either |
| Johnson | 2 | 50–99, 100–249, 250+ | 313 | could be either |
| Kaufman | 1 | 50–99, 100–249, 250+ | 296 | could be either |
| Parker | 2 | 50–99, 100–249, 250+ | 310 | could be either |

Head-room is `emp` minus the minimum employment the published cells require
(each cell × its band floor). Dallas publishes every class up to 249, so its two
hidden establishments are provably above the band. Rockwall's two are provably
inside it: its lowest suppressed cell is 20–49, and a single 250+ establishment
would need 250 employees against 207 available.

**Therefore: the true 10–249 count is between 600 and 606. Published 598 is a
floor, and it is at least two low.**

The same reasoning on the other cuts:

| Band | published | true range |
|---|---|---|
| 10–249 | 598 | **600 – 606** |
| 20–249 | 307 | **309 – 315** |
| 50–249 | 115 | **115 – 123** |

### What this does to the headline share

| Share | as published | across the true range |
|---|---|---|
| 26 ÷ 10–249 | 4.3% | 4.29% – 4.33% → **4.3%, unchanged** |
| 26 ÷ 20–249 | 8.5% | 8.25% – 8.41% → **8.3%–8.4%, one notch lower** |
| 26 ÷ 50–249 | 22.6% | 21.1% – 22.6% → **21%–22.6%** |

**The 4.3% headline is robust to suppression and does not move.** The narrow-band
figures do, and the narrower the band the more they move — which is the opposite
of the intuition that a tighter band is a tighter number. Suppression bites
hardest exactly where the denominator is smallest.

### What survives, stated plainly

598 is not an estimate, a vendor figure or a derived number. It is the sum of six
published cells in a federal statistical instrument that this practice holds a
local copy of and has now recomputed twice from that copy. Its failure modes are
not sourcing failure modes — nobody is retelling anybody. They are: **disclosure
suppression** (quantified above, ±8), **the county set** (OMB 23-01, eleven
counties — a different vintage of the MSA definition gives a different number),
**NAICS scope** (238220 is plumbing *and* HVAC, commercial *and* residential),
**the employer universe** (CBP counts payroll establishments only; the 4,665
TDLR licensees include non-employers), and **vintage** (2023 data published 2025).

Every one of those is a definitional question a reader can check, not a question
of whether the number is real.

---

## 2. The sourcing guard was passing this corpus for the wrong reason

`sourcing-protection.mts` reported **✓ CLEAN** on both home-services documents
this morning. It was not clean. It was unable to see.

The header it printed was the tell, and it was not read:

```
Origins   instrument 6 · issuer 3 · press 2 · vendor 2 · interested 4 · unclassified 53
```

**53 of 70 origins were unclassified.** The script's own stated rule is that it
"will not assert a collapse on a domain it cannot class" — a deliberate silence,
and correct in isolation. But at 53-of-70 the silence had swallowed the check.
`unclassified` was doing the work of `sound`.

The single largest gap was **`homepros.news` — the third most-cited domain in the
entire corpus, 10 URLs, and the primary trade outlet for home-services M&A.**
`achrnews.com` was in the table. The one outlet this market actually runs on was
not. Confirmed today from the publisher's own about page: Homepros Media, Inc.,
Charlotte NC, an ad-supported digital trade publication — **press**, and now
classed as press.

Fifty-two more domains were classed by hand in the same pass: consultancies
(`bain.com`, `mckinsey.com`) as **vendor**, not instrument, however well regarded
the name; field-service software vendors publishing benchmarks
(`servicetitan.com`, `tradesly.ai`, `getjobber.com`) as **interested**, because a
benchmark from a company selling into the trade is marketing collateral with a
number in it; sponsors' and operators' own sites (`apollo.com`,
`blackstone.com`, the Neighborly and Authority brand sites) as **issuer**; law
firms' client alerts as **interested**; `onetonline.org` and the two Federal
Reserve bank sites as **instrument**, since they are federal statistical
publishers that happen not to sit on a `.gov` host.

### Re-running the same files against the same corpus

| | before | after |
|---|---|---|
| unclassified origins | 53 of 70 | **1 of 70** |
| ORIGIN COLLAPSE | 0 | **2** |
| NO INSTRUMENT | 0 | **21** |
| verdict | ✓ CLEAN | **✗ not ready to post** |

Nothing about the research changed. One lookup table changed.

**The two collapses are the fire-safety shape exactly:**

- **`$100M`** — 3 citations, one origin, `homepros.news`.
- **`17x`** — 4 citations, one origin, `homepros.news`, *via* `businesswire.com`.
  The wire is distribution of the issuer's own words, not a second observation.
  Three sources reading as independent; one origin underneath.

Both sit on the Redwood/Sila platform-multiple line in §4 and the sponsor table —
`"about 17x EBITDA"`, `≈$1.7B / ≈17x`, `over $100M annualized EBITDA`. That is
the tier-2 valuation anchor.

**Twenty-one figures have no instrument underneath** — however many outlets carry
them, none is a filing, a statute or a government table. The worst are the ones
that *look* best corroborated: `15%` has 9 citations across 15 origins and not
one of them is terminal, which is precisely the pattern that reads as
overwhelming support and is not support at all. The private-market totals
(`$2.62 trillion`, `$1.3T`, `$1.2T`) rest on `bain.com` and `spglobal.com` — two
vendors, no instrument.

### No DFW Census figure is in any finding

598, 2,412, 307, 115, 1,797, 31,980, 24.8%, 74.5% and 4.3% appear in no collapse
and no no-instrument finding. They terminate at the instrument, which is what
"instrument" is for. **The metro map is not what this pass calls into question.**

---

## 3. What this changes about the method

**The rule that failed was not "check your sources." It was that a guard's
silence looked like a pass.** The script printed `unclassified 53` and then
printed `✓ CLEAN`, and the second line was read while the first was not.

Two changes follow, and neither is about research technique:

1. **A classification-coverage floor.** A run where a large share of origins are
   unclassified should not be able to print `CLEAN`. It should print the
   coverage and refuse. The threshold is a judgment — but 53 of 70 must not pass.
2. **The domain table needs a market's outlets added when the market is opened,
   not after a post is called slop.** `homepros.news` should have entered the
   table the first time a home-services run cited it.

## Sources

- U.S. Census Bureau, County Business Patterns 2023, Complete County File
  (`cbp23co.txt`), local copy at `smbx-search/cbp23co.txt`, retrieved from
  https://www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23co.zip
- County set: OMB Bulletin No. 23-01
- Homepros Media, Inc. — publisher self-description, https://homepros.news/about/
- `scripts/studio/sourcing-protection.mts`, run before and after the
  classification pass of 2026-08-12

## What we don't know yet

- **Which band each of the eight non-Dallas suppressed establishments is in.**
  Bounded to 600–606 at 10–249; not resolvable from published CBP.
- **Whether `$100M` and `17x` have a second origin.** Neither Redwood nor Altas
  files, and the transactions are private. If no second origin exists, the
  figures stay with the outlet named on the line and the line has to say so.
- **What the right classification-coverage threshold is.** Paul's call.
- **The 21 no-instrument figures, one at a time.** Some will have a filing
  behind them that the corpus simply does not cite; some will not.
