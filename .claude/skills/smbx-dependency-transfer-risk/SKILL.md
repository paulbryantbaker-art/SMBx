---
name: smbx-dependency-transfer-risk
description: Maps owner and key-person dependency (bus-factor, succession depth) and triages everything that must legally or practically transfer at close — licenses, franchise and dealer agreements, leases, bonding, contracts with change-of-control or assignment clauses, SBA consents. Use when assessing management depth, an owner's role, or reviewing contracts and licenses before LOI or close.
---

# Dependency & Transfer Risk

## When to use
Twice in every deal: early (before LOI, to price the owner's true role) and again in confirmatory diligence (to clear everything that must move at close). In SMB the two questions are the same question — the defining risk is that *the owner is the business*: the qualifying license, the GC relationships, the estimating knowledge, the bonding history, and half the customer goodwill may all sit in one person who is leaving.

## House rules
- **Evidence:** "strong second-tier team" is Asserted until org chart, tenure, payroll, and license records prove it. Revenue-at-risk from transfer failures is an engine computation from the profile, not an estimate in chat.
- **Seam:** counterparty-confidential; app-side from IoI.
- **`deal.json` is design, not yet built.** As of 2026-08-17 there is no IoI promotion packet — `house/where.ts` records it as the largest unbuilt piece of the seam. Keep the discipline (every figure carries a source; add-backs enter only when verified with evidence; everything else to the assumption log) but record it in the deal's `.deal.mts` spec (`earningsSource`, `unknowns`) and the analysis document. Do not tell anyone to open a file that is not there.

## Method
1. **Map the people.** Every named person by function: owner(s), managers, estimators/service leads, license holders, office/books. Tenure, family relationship to seller, compensation (cross-check the add-back schedule — a "redundant" family member who actually dispatches every job is not an add-back), and whether a deputy exists.
2. **Owner dependency, three dimensions.** *Revenue* — which customers, GCs, or referrers deal with the owner personally? *Operational* — what breaks in 30 days without them (estimating, scheduling, pricing, the one crew lead)? *Knowledge* — undocumented pricing, supplier terms, job history, code-compliance practice. Rate each high/medium/low with evidence.
3. **Bus-factor.** The minimum set of people whose simultaneous departure materially disrupts the business — define material as revenue at risk, operational failure, or *loss of the legal right to operate*. In a licensed trade the bus-factor is often exactly 1, and it is the seller.
4. **Succession depth.** For each high-dependency role: *Deep* (internal successor ready), *Shallow* (12–24 months development), *Absent*. Absent + high dependency = a deal-structure item, not an HR note.
5. **Transfer triage — the SMB register.** RAG-classify every instrument the business runs on:
   - **Licenses & qualifications:** who holds the contractor/professional license? Does the jurisdiction allow a qualifier arrangement (RMO/RME or equivalent), and for how long? What happens to open permits mid-transfer?
   - **Bonding & insurance:** surety re-underwrites the new owner — bonding capacity does not automatically transfer. Workers' comp mod rating, carrier continuity.
   - **Franchise / dealer / distributor agreements:** consent rights, transfer fees, training requirements, territory terms on transfer.
   - **Customer contracts:** change-of-control and assignment clauses; municipal contracts that re-bid on ownership change; asset vs stock sale consequences (asset sales technically require assignment of *every* contract).
   - **Premises lease:** assignability, term remaining vs SBA loan term (lenders want lease term ≥ loan term), landlord consent, seller-owned real estate rent terms.
   - **Debt, guarantees, SBA:** existing liens to clear, personal guarantees to release, SBA change-of-ownership requirements and timing.
   - Classification: **Red** (automatic termination/repricing, no cure), **Amber** (consent required, obtainable but not assured), **Green** (routine or waivable).
6. **Quantify and treat.** Engine-computed revenue at risk from Red + Amber items; cost exposure from supplier-side triggers. Top three single-point risks, each with a treatment and timeline: seller employment/transition agreement with the license bridged, key-employee retention bonuses effective at close, consent obtained pre-close as a condition precedent, escrow/holdback sized to the exposure, or price.

## Inputs
Org chart and payroll register; license and permit records; franchise/dealer/lease/customer/supplier contracts; bonding and insurance records; the deal.json profile; the add-back schedule for cross-reference.

## Output
Dependency map with ratings and bus-factor; succession depth per key role; the RAG transfer register with clause references; engine-stamped revenue/cost at risk; top-3 risks with treatments and a pre-close consent checklist — feeding the diligence plan, the IC memo, and the 100-day plan's retention actions.
