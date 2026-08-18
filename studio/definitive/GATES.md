# GATES — what the deal trips, and who owns it

**DEFINITIVE v1.1 · 30 gates · transcribed from
`server/services/definitiveDealMechanicsCatalog.ts` and
`definitiveStackOverlays.ts`**

A gate is a **condition on the deal that switches a body of mechanics on**. It
is not a stage and not a checklist item. G15 is live from the moment a deal form
exists; G8 does not exist until there is an indemnity structure to size. Two
deals at the same stage can trip completely different gates, which is the whole
point — the gates are what make an L3 HVAC asset deal and an L3 software stock
deal need different work.

**Read a gate as three things:** what turns it on, what it activates, and where
we stop. That last part is not decoration. Every gate below carries a boundary
line, and the boundary is where DEFINITIVE's answer ends and a licensed
person's begins.

---

## How to use this file

At intake and again on every new document, walk the trigger column and write
the tripped gates into the deal file. Then:

1. **Gates tell you what work exists.** Each names its models; MODELS.md says
   what each model computes.
2. **Gates tell you what to ask for.** A tripped gate with no supporting
   document is a P0 gap, not a completed analysis.
3. **Gates tell you who to call, and when.** The boundary line names the
   specialist. Calling them at LOI instead of at close is most of the value.

**A gate nobody wrote down is a gate nobody closed.** The commonest failure in
deal work is not getting a gate wrong — it is never noticing it fired.

---

## The seventeen defined gates

### G1 · Reps, Warranties & Indemnification
**Trips when** the deal reaches definitive-agreement drafting.
**Activates** the representation-and-warranty architecture and the
indemnification ladder — M206, M207, M217.
**We do** size the indemnity, the survival periods and the standard-rep
architecture.
**Counsel does** draft it, negotiate it, and answer whether any of it is
enforceable.

### G2 · Transaction Form & Purchase-Price Allocation
**Trips when** an asset, stock or merger form is chosen and there is a price.
**Activates** the form fork and everything that follows from it — M187, M188,
M194, M200–M205, M222, M234.
**We do** compute the form-driven allocation and the structure math.
**Tax advisor and counsel do** take the binding positions. §1060 allocation is
in **TAX.md**; the fixture question that rides along with it is in
**REAL_ESTATE.md**.

### G6 · Closing Conditions
**Trips when** the deal is signed but not closed.
**Activates** condition-precedent tracking — M211.
**We do** track the condition nodes and what is blocking close.
**Counsel does** decide whether a condition is satisfied or waivable. That is a
legal determination every time, including the ones that look obvious.

### G7 · Execution & Closing Certainty
**Trips when** the deal is signed **or** an LOI is executed.
**Activates** the execution-risk stack — regulatory reportability, MAE
durational significance, insurance architecture, TSAs, closing mechanics —
M108, M123, M128, M144, M210, M211, M212.
**We do** compute reportability, true-up and closing/fee math; map the
architecture for MAE and insurance.
**Counsel does** every regulatory and enforceability determination.
**Note** this gate fires at **LOI**, not at signing. Fire it late and the HSR
clock and the RWI underwriting window are both already compressed.

### G8 · Post-Closing Recourse
**Trips when** an indemnity or escrow recourse structure is required.
**Activates** escrow, holdback, survival and insurance-backed recourse sizing —
M206–M209.
**We do** size all four.
**Counsel and the broker/underwriter do** the binding terms and the policy
wording.

### G9 · Contingent Consideration
**Trips when** any part of the price is contingent.
**Activates** earnout design, measurement and dispute mechanics — M213.
**We do** structure the architecture and the dispute path.
**Counsel does** the enforceable covenant set; **the tax advisor does** the
§453/§483/§1274 characterisation. Both, not either — an earnout is a legal
instrument and a tax event at the same time, and the two answers can pull in
opposite directions.

### G10 · Intellectual Property Mechanics
**Trips when** IP is material to value.
**Activates** chain-of-title, encumbrance, license-dependency and transfer
mechanics — M214–M223.
**We do** run the chain-of-title and dependency work.
**IP counsel does** enforceability and freedom-to-operate.
**In lane this fires more than people expect** — proprietary software in a
services business, a licensed brand, an assigned patent that was never actually
assigned because the inventor was a contractor.

### G14 · Seller Proceeds & Price Adjustment
**Trips when** there is a sell-side context — proceeds treatment and price
adjustment.
**Activates** M101 (QSBS) and M109 (working-capital peg).
**We do** compute the peg. QSBS is a screen, not a determination.
**The tax advisor, counsel and the accountants do** the binding position and the
negotiated adjustment.
**Buy-side note.** We are never the seller's advisor — but the seller's tax
position drives what the seller will accept, so this gate is read from the
buyer's side of the table as a *negotiation input*. QSBS also routes through
G15.

### G15 · Tax & Corporate Structure
**Trips when** any deal form is set — so, effectively always.
**Activates** the master structuring gate: elections, reorganisation
qualification, corporate-law mechanics and equity-structure math. Forty-two
slots, the largest gate in the catalog: M101–M105, M108, M109, M111–M115,
M119, M121–M127, M135, M136, M139–M150, M180–M186, M199.
**We do** compute the implemented elections and equity-structure math.
**The tax advisor and counsel do** the return positions and the legal opinions.
Reorganisation qualification (M140), §338(h)(10) (M105) and §355 (M143) are
catalog-only — mapped, not computed.
**All of it is in TAX.md.**

### G19 · State & Local Transaction Tax
**Trips when** one or more US state jurisdictions are involved — so, always,
and usually more than one.
**Activates** transfer tax, controlling-interest transfer tax, SALT and
clearance mechanics — M191, M200, M205, M232, M233.
**We do** screen against the state tables.
**Tax counsel does** decide whether a transfer is taxable.
**The trap** is treating this as a real-estate gate. It is not. A stock or LLC
interest sale in NY, NJ, PA, CT or FL can be taxed as if the real property had
been deeded directly — see the CITT section in **REAL_ESTATE.md**, and note
that it fires on entity deals, which is where it gets missed.

### G23 · Cross-Border Deal Terms
**Trips when** a non-US jurisdiction is in play.
**Activates** non-US deal-term and merger-control overlays — M106, M107, M110.
**We do** overlay the considerations.
**Local counsel does** every local-law determination.

### G24 · Regulatory & Compliance Diligence Overlays
**Trips when** regulated data or operations are present.
**Activates** privacy, cyber, sanctions, ESG and sector-regulation diligence —
M129–M134.
**We do** organise the overlays.
**Regulatory counsel does** compliance and enforcement determinations.

### G26 · Fund Secondaries & GP-Led Transactions
**Trips when** the counterparty is a fund LP or GP, or the deal is a secondary,
continuation, strip sale or NAV facility.
**Activates** M120, M177, M178, M179.
**We do** the fund-level mechanics.
**Fund counsel and the tax advisor do** the fund-document and tax
determinations.

### G27 · Sponsor, Search & Employee-Ownership Economics
**Trips when** the acquirer is an independent sponsor, a search fund, or an
ESOP.
**Activates** promote structures, search-fund step-ups and ESOP economics —
M102, M116, M117, M118.
**We do** compute the archetype economics.
**The trustee and the appraiser do** the ESOP fiduciary and valuation
determinations — and that boundary is absolute: an ESOP valuation is a licensed
appraisal, which is on THE LINE's forbidden list twice over.
**This gate fires on most in-lane deals**, because independent sponsors and
searchers are exactly who buys L2–L4.

### G28 · Distressed / Restructuring *(overlay)*
### G29 · Capital Structure & Liability Management *(overlay)*
### G30 · Real Estate & Asset-Class Overlays *(overlay)*
The three overlays have numeric triggers and get their own section below.

---

## The three overlay gates

Overlays differ from the gates above in one way that matters: **they fire on
measured signals, not on a choice somebody made.** You do not elect into G28.
You discover you are in it, usually from a number in a document that arrived
last week.

### G28 · Distressed / Restructuring

**Fires on any of:**
- the solvency test (M148) fails **any** prong
- cash runway **below 90 days**
- FCCR **below 1.0×**
- secured debt trading **below 60 cents**
- a bankruptcy filing, RSA, forbearance, DIP lender, stalking horse, distressed
  fund or trustee appears anywhere in the record

**Activates** the distressed-sale, Chapter 11 / 7, DIP, claims, solvency and
recovery mechanics — M148, M151–M159, M164–M168.
**We do** the mechanics. **Courts, counsel, CROs and financial advisors do**
the legal, feasibility and opinion determinations.

**Two things to know before this gate fires on a live deal.** First, V19's hard-
halt list puts *any distressed deal with Chapter 11 plan involvement* on the
stop-and-route list — so the trigger firing is itself the finding. Second, the
solvency prongs are not a formality: a target that fails one is a target where
the seller may not be able to give the reps, and the fraudulent-transfer
exposure runs to the buyer.

### G29 · Capital Structure & Liability Management

**Fires on any of:**
- a maintenance-covenant breach projected **within four quarters**
- secured debt trading **below 80 cents**
- a capital-structure action, LME, recapitalisation, exchange offer or covenant
  amendment appears

**Activates** recap, exchange-offer, covenant, DIP, convertible, ABL,
make-whole and LME mechanics — M148, M158, M160–M164, M180–M184.
**We do** the math and flag the contract language.
**Counsel does** everything else — and note the catalog's own caveat: **the LME
models ship research-only until the case law stabilises.** Uptier, drop-down and
double-dip are live litigation, not settled doctrine. Treat any output as a
framing of the question.

**Note the 80-cent threshold sits above G28's 60.** A deal can be in G29 and not
G28 — that is the normal path, and it is the window where something can still be
done.

### G30 · Real Estate & Asset-Class Overlays

**Fires on any of:**
- real estate **≥ 25% of enterprise value**
- digital assets **≥ 10% of enterprise value**
- infrastructure / project finance, REIT, LP or GP secondary, strip sale, NAV
  facility, title, survey, lease, CITT, FIRPTA, §1031, OpCo/PropCo or PCA
  appears
- **a deed, lease assignment, change of control with property, preemptive
  right, due-on-transfer loan, or title exception appears** — this is the V18c
  property and contract-law layer

**Activates** the largest model set in the catalog — 35 slots, M169–M179,
M187–M199 and M224–M234.
**We do** the mechanics. **Counsel does** the legal conclusions, and the
digital-asset and industry-regulated overlays are **research-only** until
rulemaking settles.

**This gate fires constantly in lane and is the one most often missed.** A
home-services business with an owned yard and shop, an elevator company with a
warehouse, an HVAC business on a twenty-year lease with a change-of-control
clause — all G30. The fourth trigger is the one to internalise: it is not about
the *percentage*, it is about a **document** appearing. One lease with a consent
clause fires this gate at any deal size. **REAL_ESTATE.md** is the whole layer.

---

## The reserved gates

The catalog numbers 30 gates and expands 17. **G3, G4, G5, G11, G12, G13, G16,
G17, G18, G20, G21, G22 and G25 are reserved** — numbered in the scheme,
without a shipped expansion.

Do not invent them. If a deal seems to need a gate that is not here, it needs a
**specialist**, and the correct output is a named handoff with the question
written out — not a new gate number that will not mean anything to anyone
reading the file next quarter.

---

## Gate → file map

| Gate | Read |
|---|---|
| G1, G6, G7, G8, G9, G24 | **LEGAL.md** |
| G2 | **LEGAL.md** (form) + **TAX.md** (§1060 allocation) |
| G10 | **LEGAL.md** (IP section) |
| G14, G15, G19 | **TAX.md** |
| G23 | **TAX.md** (international) + **LEGAL.md** (merger control) |
| G26, G27 | **VALUATION.md** (sponsor and ESOP economics) |
| G28, G29 | **VALUATION.md** (solvency, coverage) — then stop and route |
| G30 | **REAL_ESTATE.md** |
| any | **MODELS.md** for what a slot computes |
