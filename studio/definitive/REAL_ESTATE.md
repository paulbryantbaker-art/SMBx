# REAL ESTATE — the V18c property and contract-law layer

**DEFINITIVE V18c (`V18c.2026-07-16`) · M224–M234 and the `MODEL.RE.*` family ·
transcribed from `server/constants/realPropertyLaw.ts`,
`methodology/DEFINITIVE_V18C_REAL_PROPERTY_PASS.md` and the runtime · gate G30,
with G19 and G2 riding along**

**Why this layer exists.** The model set before it was *economically complete
and legally under-specified* — tax, environmental, financing, transfer tax,
CFIUS and ASC 842 covered the quantitative lenses, and **nothing parsed the
transaction documents for the property and contract issues that actually kill or
reprice deals.** That is what this closes.

**Why it matters in lane more than anywhere else.** Trade and services
businesses — the practice's core — sit on yards, shops, warehouses and
long leases. G30 fires on **a document appearing**, not on a percentage: one
lease with a consent clause trips this gate at any deal size.

**The anchor states are DE, NY, CA and TX.** Variation is encoded as **data, not
logic** — recording act, risk-of-loss default, transfer-tax regime and
lease-consent standard are per-state lookups, so a new state is a row, never a
new rule. Where a state is not in the table, the fallback says *verify*, and
that is an instruction rather than a hedge.

**Date-stamp this whole file.** Prop 19, the NYC step-transaction application,
and Garn/Fannie LLC policies all move. Re-verify on a cadence.

---

## The two entity-deal traps, first

These are the highest-value missed issues in the whole layer, and both fire
**with no deed changing hands.**

**Trap one — an entity deal still triggers property consequences.** A stock or
membership-unit purchase, or a merger, with no new deed, can still trigger:

- real estate transfer tax on a **controlling-interest transfer** (NY at ≥50%;
  CA documentary transfer tax **plus Prop 13 reassessment** on >50% entity
  control)
- **due-on-sale / due-on-transfer acceleration** under property loans
- **deemed assignment and change-of-control default** under leases
- **permit, licence and certificate-of-occupancy** transfer requirements

**Trap two — Garn-St. Germain does not protect you.** 12 U.S.C. §1701j-3(d)
restricts a lender's due-on-sale right **only** for a loan secured by residential
real property of **fewer than five dwelling units** (including co-op stock and
residential manufactured homes). **For commercial mortgages and entity-level
transfers, the lender's right to accelerate is essentially unconstrained, and
lender consent becomes a closing-condition critical path.** Discovering this at
close is a repricing event.

---

## Title

### Recording acts — three regimes, three different answers

| Type | Rule | States |
|---|---|---|
| **Race** | First to record wins, **even with actual notice** of a prior conveyance | DE (25 Del. C. §153) · NC (§47-18) · LA (Civ. Code arts. 3338–3340) |
| **Notice** | A later BFP **without notice** prevails **regardless of recording order** | TX (Tex. Prop. Code §13.001) |
| **Race-notice** | The later BFP must take without notice **and** record first | NY (RPL §291) · CA (Civ. Code §1214) |

**Delaware is one of only three pure-race jurisdictions.** And **Texas is a
NOTICE state** — secondary sources calling it race-notice are wrong, and V18c
flags this as a resolved conflict. Getting Texas wrong changes the priority
answer.

Priority ordering, given the state and the recording dates, is deterministic.
**Curing a priority defect is counsel's.**

### Deeds and covenants of title

The deed type is a **first-class deal term**, because it sets the seller's title
exposure.

| Deed | Covenants | Scope | After-acquired title |
|---|---|---|---|
| **General warranty** | All six | All defects, whenever arising | yes |
| **Special / limited warranty** | All six | **Grantor's own acts only** | yes |
| **CA grant deed** (Civ. Code §1113) | **Two** — no prior conveyance, no grantor-made encumbrances | Grantor's acts only | yes (§1106) |
| **NY bargain-and-sale with covenant** (RPL §258) | **One** — grantor has done nothing to encumber | Grantor's acts only | no |
| **Bargain and sale** | none | none | no |
| **Quitclaim** | none — releases whatever the grantor holds, if anything | none | no |

Present covenants: seisin · right to convey · against encumbrances.
Future covenants: quiet enjoyment · warranty · further assurances.

**The two dominant state instruments are not warranty deeds.** The California
grant deed implies exactly two covenants and the New York bargain-and-sale with
covenant implies one — treating either as a special warranty deed overstates the
seller's exposure by four or five covenants. **Texas narrows the statutory
seisin covenant** (Tex. Prop. Code §5.023) to a "grantor has not previously
conveyed" formulation.

**After-acquired title (estoppel by deed)** automatically vests later-acquired
title in the grantee of a warranty deed — which is why it is a column and not a
footnote.

Deed-type identification and covenant mapping are deterministic. **Whether a
covenant has been breached, and what remedy lies, is counsel's.**

### Who must sign — the signatory matrix

| Vesting | Required | The gap risk |
|---|---|---|
| Sole | The record owner, plus spousal joinder where homestead or community-property law requires | Homestead or marital joinder missed |
| **Tenancy in common** | **Every** cotenant for the whole; one conveys only its undivided share | A missing cotenant leaves a fractional interest outstanding |
| Joint tenancy | All joint tenants for the whole; one can sever and convey only its share | Unilateral severance; survivorship defeats a devise |
| **Tenancy by the entirety** | **Both spouses** — neither can convey or encumber alone | **The classic deal-killer: a one-spouse signature conveys nothing** |
| Community property | Both spouses (Cal. Fam. Code §1102; Tex. Fam. Code §5.001 for homestead) | One-spouse conveyance is voidable |
| Entity | Officers or managers per the organisational documents, plus required member or board consents | Authority defect — resolutions or consents missing |

Who-must-sign is deterministic once the vesting deed and the marital or entity
status are known. **Whether any signature block is effective is counsel's.**

Defeasible fees carry reverter or re-entry rights **that can defeat title on a
use change** — flag them. Life estates and remainders split signing authority.

### Marketable vs insurable — and the three buckets

**Marketable title** is free of defects a reasonably prudent buyer would object
to; it is the common-law contract default. **Insurable title is a lesser
standard** — a title insurer agrees to insure over a known defect at standard
rates.

**This distinction is a negotiation trap.** A contract promising only
"insurable" title can force the buyer to accept a defect the title company will
insure over **but that impairs resale**. Read the standard in the PSA before
anything else in the title section.

Defects triage into three buckets:

- **Curable** — pay it off and record a satisfaction
- **Insurable-over** — an old unreleased mortgage, a minor gap
- **Deal-killing** — unmarketable *and* uninsurable: a break in the chain, an
  un-locatable boundary, an adverse ownership claim

The triage is ours. **The marketability judgement and any title opinion are
counsel's — we are not a title agent.**

### Easements, covenants, survey

Easements appurtenant run with the land; easements in gross are personal.
Express, implied (prior use or necessity), and prescriptive easements each need
different proof. Real covenants (damages) and equitable servitudes (injunction),
plus CC&Rs, bind successors and can restrict use or transfer. Condominium, co-op
and PUD regimes carry transfer restrictions, rights of first refusal and
board-consent requirements — **surface all three.**

An **ALTA/NSPS Land Title Survey** reveals encroachments, boundary conflicts,
easement locations, access and setback issues. Adverse possession and
boundary-by-acquiescence can cloud title.

**Mechanic's and materialmen's liens** can attach and, in many states, **relate
back to the commencement of work**, priming later-recorded interests. Lien
waivers plus date-down and gap coverage at closing manage it. The checklist is
deterministic; validity and priority disputes are counsel's.

**Severed mineral estates** — dominant in Texas — can burden surface use. Water
rights split riparian (East) from prior appropriation (West).

### Merger doctrine — the silent one

**Once the deed is delivered and accepted, contract terms relating to title
merge into the deed and are extinguished.** Only collateral obligations,
expressly surviving terms, and fraud claims persist.

So **survival-clause tracking is a deterministic must-catch**: every
representation, indemnity and post-closing covenant the client is relying on
needs an express survival hook, or it vanishes at closing. Nothing announces
this — it just stops being true.

---

## Risk of loss between signing and closing

The contract almost always overrides the default. **The model detects the
override first**, then falls back to the state rule.

| Regime | Risk sits with | States |
|---|---|---|
| **Equitable conversion** (common-law majority) | **Buyer, from signing** | default where no statute |
| **NY Risk Act** | Seller | NY (Gen. Oblig. Law §5-1311) |
| **UVPRA** | Vendor, until legal title or possession passes | CA (Civ. Code §1662) · TX (Prop. Code §5.007) · HI · MI · NV |

The majority default putting risk on the **buyer at signing** is the one that
surprises people. A condemnation or a fire during the executory period lands
differently in each column.

---

## Leases

Leases are where in-lane deals actually live — a services business rarely owns
its yard.

**Consent standards when the lease requires consent but states no standard:**

| State | Default | Authority |
|---|---|---|
| **CA** | **Implied reasonableness** | *Kendall v. Ernest Pestana, Inc.*, 40 Cal.3d 488 (1985) |
| **NY** | **Sole discretion enforced as written** | NY common law |
| elsewhere | **Unsettled — verify before relying on implied reasonableness** | — |

Two states, two opposite answers, on the identical clause.

**Change of control is not automatically an assignment.** Absent express lease
language, a change of control of a corporate or LLC tenant is **generally not an
assignment "by operation of law"** (the NY rule) — **the lease must expressly
deem a control transfer an assignment.** Verify per state. This cuts both ways:
it is relief in an entity deal, and it is a gap when the client assumed the
lease would follow.

**What to abstract from every lease** (`RE.LEASE_ABSTRACTION`): term and
remaining term, extension options and who holds them, rent and escalations, CAM
and the true-up mechanic, assignment and change-of-control language and its
consent standard, use restrictions, exclusives, estoppel and SNDA requirements,
casualty and condemnation, and the landlord's recapture rights.

**Ground leases are financeable only if they clear the lender thresholds:**

- **remaining term, including unilateral extensions, of at least 20–25 years
  beyond loan maturity**
- mortgagee notice and cure rights
- a new-lease right on termination
- **no merger of fee and leasehold**
- a freely assignable and mortgageable tenant interest

**Missing any one of these is a financing deal-killer or a repricing event**, and
it is discoverable from the document on day one.

---

## Transfer tax, controlling interest, reassessment

| State | Deed tax | Controlling-interest tax | Threshold | Aggregation | Reassessment on control change |
|---|---|---|---|---|---|
| **NY** | yes | **yes** | **50%** | **3 years, acting in concert** | no |
| **CA** | yes | **yes** | **50%** | — | **YES — 100% reassessment** |
| **DE** | yes (among the highest combined rates) | no | — | — | no |
| **TX** | **no — constitutionally prohibited** (art. VIII §29) | no | — | — | no |

**New York** — NYC Admin. Code §11-2101 (controlling interest at 50% or more);
§11-2106(b)(8) and NY Tax Law §1405(b)(6) (the mere-change exemption); NY Pub.
576 (three-year acting-in-concert aggregation). **The step-transaction doctrine
can collapse a merger plus a follow-on interest transfer and defeat the
mere-change exemption** — *Matter of 105-02 Forest Hills*, NYC Tax App. Trib.
2025. Flag any mere-change claim for exactly this.

**California** — documentary transfer tax under Rev. & Tax. Code §11911, and
separately **Prop 13 change-in-ownership: a change in control of more than 50%
of an entity triggers 100% reassessment** (§§60–64). Cumulative transfers of
original co-owner interests above 50% also trigger. **This is independent of the
documentary transfer tax and it is economically enormous** — the property is
re-based to current market value and the tax runs forever after.

**Texas has no transfer tax at all**, which is a constitutional prohibition
rather than a policy that could change next session.

---

## Permits, certificates of occupancy, bulk sales

**A legal nonconforming ("grandfathered") use generally runs with the land and
survives a change of ownership** — but it can be **lost by abandonment,
discontinuance, or expansion.** Read that as a diligence question about what the
seller has been doing, not just what the zoning says.

**Many municipalities require a new or updated certificate of occupancy on
transfer, on change of use, or on re-occupancy**, which can trigger re-permitting
and code-compliance upgrades. This is a deterministic screen once the
jurisdiction is known, and it is a cost that lands after closing if nobody
checks.

**Bulk sales.** UCC Article 6 is repealed in most states, **but the tax
notification regimes survive:**

| State | Regime |
|---|---|
| **CA** | Cal. U. Com. Code §§6101–6111 — retained and actively enforced, plus tax clearance |
| **NY** | N.Y. Tax Law §1141(c) bulk-sale notification |
| **NJ** | N.J.S.A. 54:50-38 bulk-sale notification |
| **PA** | 69 P.S. §529; **72 P.S. §1403 — clearance reaches real-estate-only transfers** |

**Successor liability persists everywhere regardless** — through
fraudulent-transfer law, de facto merger and mere continuation, CERCLA, and
state tax statutes. Repeal of Article 6 removed the notice mechanic, not the
exposure.

---

## Fixtures — UCC §9-334

Classification changes **PPA allocation, transfer tax base, depreciation, and
lien priority** — four consequences from one line-drawing question, which is why
it sits on G2 as well as G30.

- **(c) — the general rule.** A fixture security interest is **subordinate** to a
  conflicting real-property interest.
- **(d) — the purchase-money exception.** A PMSI takes priority over a prior
  recorded real-property interest if it is **perfected by a fixture filing
  before the goods become fixtures or within 20 days after.** (Official Comment
  7: the former 10-day period was changed to 20.)
- **(h) — construction mortgage.** Can override the (d) exception.

Priority given the filing dates is deterministic. **The ultimate legal
characterisation is counsel's.**

---

## §1031 and FIRPTA

**§1031 timing** (`RE.1031.TIMING`) — 45 days to identify, 180 days to close,
running from the transfer of the relinquished property, and **the 180 is not
extended by the 45**. Both are calendar days. Reverse and improvement exchanges
need a qualified intermediary and an exchange accommodation titleholder. **The
common in-lane pattern:** separate the real estate into its own LLC **before
LOI**, then run the real estate as a §1031 and the business as an asset sale —
which only works if the separation happened early enough to be respected.

**FIRPTA** (`RE.FIRPTA.WITHHOLDING`) — withholding on the disposition of a US
real property interest by a foreign person. Screen the seller's status **at
intake**, not at closing: the withholding obligation lands on the **buyer**, and
a withholding certificate takes time to obtain.

---

## Structures: OpCo/PropCo, sale-leaseback, REIT

**OpCo/PropCo separation** (`RE.OPCO_PROPCO.SEPARATION`) and
**operating-business bifurcation** (`RE.OPBUS.BIFURCATION`) — split the real
estate from the operating business so each is valued and financed on its own
terms. In lane this is routine: the owner holds the building personally or in a
sibling LLC, and the lease between them is not at market. **Normalise the rent
to market before computing EBITDA** — rent paid to yourself is not a market
cost, and it is the single most common distortion in an owner-operator P&L.

**Sale-leaseback under ASC 842** (`RE.SALE_LEASEBACK.ASC842`) — whether the
transaction qualifies as a sale controls the whole accounting treatment; a
failed sale-leaseback is a financing, and the asset never leaves the balance
sheet.

**REIT compliance** (`RE.REIT.COMPLIANCE`) — 90% distribution requirement,
quarterly asset and income tests. M&A must preserve REIT status or trigger BIG
tax.

**NOI and cap-rate bridge** (`RE.NOI.CAP_RATE_BRIDGE`), **rent-roll
normalisation** (`RE.RENT_ROLL.NORMALIZE`), **CAM true-up** (`RE.CAM.TRUEUP`),
and **PCA reserves** (`RE.PCA.RESERVES`) are the property-side economics. The
Property Condition Assessment reserve is the one that gets skipped and then
shows up as capital expenditure in year one.

---

## Environmental

**ASTM E1527-21 Phase I is mandatory since 13 February 2024.** **PFOA and PFOS
were designated CERCLA hazardous substances on 19 April 2024** (effective 8 July
2024) — PFAS must now be addressed at AFFF, plating, semiconductor, textile and
cosmetics sites.

**State property-transfer statutes:** NJ ISRA (mandatory pre-transfer for
"industrial establishments") · **CT Transfer Act, sunset 1 March 2026 →
Release-Based Cleanup Regulations** · MA MCP · NY BCP · CA DTSC VCP.

CERCLA innocent-landowner and bona fide prospective purchaser defences depend on
having done **all appropriate inquiry** — which is what the Phase I is for, and
why its timing relative to closing matters.

---

## Where this layer stops — the ten defer triggers

The V18c pass ships a hard gate. On a match, the system routes to counsel with
options, implications and a drafted information request, and **structurally
cannot emit an enforceability judgement or a transaction-document draft.**

| | Trigger |
|---|---|
| **DTC.RE.01** | Judging whether **title is marketable** or whether a defect is fatal |
| **DTC.RE.02** | Opining on **enforceability of any clause** — liquidated damages, anti-assignment, consent standard, survival, option/ROFR, due-on-sale |
| **DTC.RE.03** | **Drafting a transaction document** — PSA, deed, lease, SNDA, estoppel as an instrument, title instrument, guaranty |
| **DTC.RE.04** | Concluding that a specific transfer **legally triggers** transfer tax, reassessment, due-on-sale, a preemptive right, or a deemed assignment |
| **DTC.RE.05** | Whether a **covenant of title has been breached** and what remedy lies |
| **DTC.RE.06** | **Recommending a structure to achieve a legal or tax result** — carve-out, F-reorg, drop-down |
| **DTC.RE.07** | Adverse possession, boundary, quiet title, or easement-scope disputes |
| **DTC.RE.08** | Bulk-sales, successor-liability, or CERCLA successor determinations |
| **DTC.RE.09** | Zoning or entitlement compliance, or nonconforming-use continuation |
| **DTC.RE.10** | Interpreting ambiguous contract language, or resolving a conflict between the contract and the deed |

**Note DTC.RE.04 carefully.** We compute the CITT screen, the reassessment
screen, the due-on-sale screen and the preemptive-right screen — and we do not
conclude that any of them *is* triggered. The screen says *this deal has the
shape that triggers it; here is what it would cost; take it to counsel.* That is
the difference between a useful flag and an unlicensed opinion.

**The handoff line the models attach:**

> "This raises a **[doctrine]** issue that turns on **[specific facts or
> clause]**. That is a legal determination for your real estate or transaction
> counsel — here are the options and implications for your decision, and here is
> a drafted information / estoppel / consent request you can send."

The drafted request is the part that makes it useful. Routing without it is just
a stop.

---

## The G30 diligence list

When G30 fires, ask for these. Most in-lane deals need the first six.

1. **The lease** — every lease, with all amendments and side letters
2. **The vesting deed** and the current title commitment with all exceptions
3. **The survey** — ALTA/NSPS if one exists, and the date
4. **Loan documents** on any property debt — specifically the transfer and
   due-on-sale provisions
5. **The rent roll and CAM reconciliations** for the last two years
6. **Certificates of occupancy and operating permits**, plus which do not
   transfer
7. Phase I, and any Phase II
8. The Property Condition Assessment, or the basis for the reserve
9. Estoppels and SNDAs — obtained, or the plan and the deadline for obtaining
   them
10. Entity organisational documents where the property is held in an entity —
    for the signatory matrix and the consent chain
