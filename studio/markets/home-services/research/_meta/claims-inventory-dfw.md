# What we can say, and with what standing — DFW HVAC, as of 2026-08-01

**This is a process file, not a source.** It lives in `_meta/` deliberately: it
restates figures that already exist in `research/`, and a flat copy would let a
number in the master trace to *this* file rather than to the primary source it
came from. `audit.mts` does not recurse, which is exactly why it belongs here.

Three standings, and the distinction is the whole point:

- **MEASURED** — a primary source states it. No arithmetic, no assumption.
- **DERIVED** — arithmetic on measured figures, with a stated assumption. Belongs
  in `## Derivations` wherever it appears.
- **UNKNOWN** — worked and not publicly available. Says so on the page.

---

## Metro level — Dallas–Fort Worth, 11 counties (OMB Bulletin 23-01)

### MEASURED

| Claim | Figure | Source |
|---|---|---|
| Establishments, NAICS 238220 | **2,412** | CBP 2023 county file |
| Employment | **31,980** | CBP 2023 |
| **Annual payroll** | **$2.418B** | CBP 2023 |
| Establishments under 10 employees | **1,797 — 74.5%** | CBP 2023 |
| Establishments 10–249 employees | **307** | CBP 2023 |
| Establishments 20–249 employees | **115** | CBP 2023 |
| Establishments 250+ | 7 published | CBP 2023 |
| Average employees per establishment | 13.3 | CBP 2023 |
| Current A/C contractor licences | **4,799** | TDLR `ltairref.csv` |
| Distinct licensed HVAC firms | **4,665** | TDLR |
| Environmental-air-capable HVAC firms | **2,806** | TDLR |
| Class B environmental firms — capped at 25 tons **by statute** | **1,738** | TDLR + Tex. Occ. Code § 1302.253 |
| Platform parents with a confirmed DFW location | **18** (10 residential, 8 commercial-mechanical) | Each parent's own site |
| Franchise businesses, Neighborly + Authority Brands | **37** (25 in 238220, 13 HVAC) | Franchisor location finders |

### DERIVED

| Claim | Figure | The assumption |
|---|---|---|
| DFW 238220 receipts | **$8.356B** (range $6.9–8.4B across three allocation bases) | DFW's receipts-per-payroll ratio matches Texas's. Unverifiable — Census publishes no sub-state construction receipts. |
| DFW HVAC-specific revenue | ≈$2.863B | The above, **plus** that DFW's trade mix matches Texas's. Two stacked assumptions. |
| Platform-owned share of the acquisition band | **8.5% (10–249) to 22.6% (20–249)** | Numerator is a named-location count, not an employee-banded one. Denominator is measured. |
| Independent residual, 10–249 band | ≈280 establishments | Same as above, and "independent" means unmatched, not confirmed. |

### UNKNOWN

- What Apex Service Partners owns in DFW. HQ confirmed in Irving; no operating
  brand findable in any source, including the state licence file.
- Employee band for any of the 26 platform-owned establishments. **The single
  input that would collapse 8.5–22.6% into a figure.**
- Service versus new construction. No source in this hunt separates it.
- How many of the 37 franchise businesses share an owner.
- Residential versus commercial *within DFW specifically*, as opposed to the
  Texas mix.

---

## State level — Texas

### MEASURED

| Claim | Figure | Source |
|---|---|---|
| **238220 receipts** | **$25.418B** | 2022 Economic Census EC2223KOB |
| **HVAC contractor share of 238220 receipts** | **34.3% — $8.710B** | EC2223KOB |
| **Plumbing contractor share** | **32.8% — $8.333B** | EC2223KOB |
| Mechanical contractor share | 17.7% — $4.492B | EC2223KOB |
| Commercial-leaning kinds of business combined | 24.3% | EC2223KOB, summed |
| Establishments | 8,909 across 173 counties | CBP 2023 |
| Employment | 105,086 | CBP 2023 |
| Annual payroll | $7.355B | CBP 2023 |
| **Receipts per employee** | **$241,879** | EC2223KOB ÷ CBP |
| A/C contractor licences, current | 19,065 (20,323 including expired) | TDLR |

### UNKNOWN at state level too

- Service versus new construction.
- Platform ownership statewide — only DFW was mapped.

---

## National

| Claim | Figure | Source |
|---|---|---|
| US 238220 receipts | **$297.609B** | 2022 Economic Census |
| Texas share of US | 8.5% | Arithmetic on the above |

---

## The structural fact that decides the reporting level

**Construction is one of a handful of sectors the Economic Census does not
publish below state level.** Agriculture, mining and management of companies
share that treatment. Retail, and NAICS 56 — which contains pest control — publish
at county and metro.

So for the 238xxx trades, **metro revenue does not exist and never will.** It is
not a gap in our research. It is a gap in the federal statistical system.

Two consequences, and they point in opposite directions:

1. **Any metro revenue figure anyone publishes for these trades is derived**,
   whether or not they say so. We can say so.
2. **Everything except revenue is available at metro level and measured** —
   establishments, employment, payroll, size distribution, licences, ownership.

---

## Where each level is strongest

**Metro is strongest on structure.** The acquirable universe, the size
distribution, who already owns what — all measured, all at metro, none of it
derived. This is the buy-side question and it is answerable at metro level today.

**State is strongest on dollars.** Every revenue figure is measured, the trade
split is measured, the per-employee benchmark is measured. Nothing derived.

That is not a conflict. It is a document design: **structure at metro, dollars at
state, and never a derived metro revenue figure on a public page.**

## The competitive point hiding in this

Every vendor report that quotes "the DFW HVAC market is worth $X billion" is
quoting a figure **no primary source publishes**. It cannot be traced, because
there is nothing to trace it to. The Economic Census stops at Texas.

So the constraint is not a weakness to be worked around. Stated plainly — *here
is what is measured, here is what is derived and what it assumes, here is what
nobody knows* — it is the clearest possible demonstration of the method, against
a field that quotes metro market sizes with no basis at all.

The strongest sentence available, and every word of it is measured:

> **Of the 2,412 plumbing and HVAC establishments in Dallas–Fort Worth, 1,797
> have fewer than ten employees. The acquirable universe is roughly 300
> businesses, not 2,400 — and not the 4,665 the state licence registry implies,
> because most licensed contractors have no employees at all.**
