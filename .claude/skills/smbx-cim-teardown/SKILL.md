---
name: smbx-cim-teardown
description: Converts a broker CIM, offering memorandum, or seller package into a structured analytical brief — stated thesis with confidence ratings, earnings bridge reconstruction, a claim-by-claim assertions tracker, growth narrative validation, and the ranked diligence questions. Use when a CIM, OM, teaser, or broker package for a live deal lands and before any management meeting or LOI work.
---

# CIM Teardown

## When to use
A CIM or offering memorandum has arrived for a deal candidate at or past IoI. Run the teardown before the first seller/broker call. It converts a marketing document into three things: what the seller claims, what is evidenced, and what diligence must resolve. SMB reality: broker packages run 10–40 pages, financials are recast by the broker, and the recast is the sales pitch — the teardown is where it stops being taken at face value.

## House rules
- **Seam:** deal-shaped, counterparty-confidential work. Runs app-side with CC from IoI. Pre-IoI candidate screening stays in the studio.
- **Engine:** any deal figure (SDE, Adjusted EBITDA, DSCR, valuation range) is computed by the engine from a deal profile, never in conversation. The teardown *extracts and grades* the seller's numbers; it does not adopt them.
- **Evidence:** every figure carries a source. Claims are graded **Primary** (tax returns, signed contracts, bank statements), **Secondary** (third-party data, named research), or **Asserted** (broker/management statement, no citation).

## Method
1. **Extraction without interpretation.** Business description in the seller's words; founded, location, headcount, licenses held and by whom; revenue mix; customer types; ownership and reason for sale; stated revenue/SDE/EBITDA for 3 years plus recast; asking price or process terms. League check per V17: L1–L2 lead with SDE, L3–L6 with Adjusted EBITDA — note which frame the broker used and whether it matches the league.
2. **Stated thesis pillars.** The 3–5 claims the package is built on (recurring service revenue, fragmented market platform, growth "on autopilot," absentee-ownable, expansion into adjacent trade). For each: claim near-verbatim, evidence grade, confidence high/medium/low.
3. **Business model decomposition.** Revenue lines with share and growth; contract vs time-and-material vs one-off; how work is won (referral, GC relationships, PPC, route density, municipal bids); which one or two lines drive margin — those are the diligence focus.
4. **Earnings bridge reconstruction.** Rebuild the path from reported revenue to the broker's recast SDE/EBITDA. List every add-back with its exact label and amount, then hand the list to `smbx-add-back-scrutiny` for the STAR pass. Demand the tax-return reconciliation: if the P&L and the returns diverge, the gap is a finding, not a footnote. Flag divergence between earnings and cash (AR build, deposit timing, WIP for contractors).
5. **Assertions tracker.** Two columns — Claim | Evidence provided — for every quantified statement in the package ("70% repeat customers," "no customer over 10%," "manager runs day-to-day"). Grade each Primary/Secondary/Asserted. Every Asserted claim generates a diligence question and the document that would resolve it.
6. **Growth narrative validation.** Base-rate test: 3–5 year actual revenue CAGR vs projected. Projection materially above history requires a named structural change — otherwise haircut it. Bear (Asserted claims removed, historical CAGR) / Base (Secondary at partial credit) / Bull (face value), with the year-3 revenue impact of each stated for the engine to model.
7. **Risk identification, three layers.** *Disclosed* (what the package admits, and whether the mitigation is credible). *Downplayed or omitted* (high add-back density, no customer list, revenue growth without margin, vague projections, "strong team" language masking owner dependence). *Structural SMB* (owner-run books, cash revenue claims, license held personally by seller, lease not assignable, family on payroll, bonding or franchise consents).
8. **Diligence priority list.** Top 10 questions, each with workstream owner, the data that answers it, and the risk if unanswered. Rank by (a) could cause a pass, (b) where the package's evidence is weakest. This list seeds `smbx-diligence-plan`.

## Inputs
CIM/OM text or file; the candidate's studio screen record and buy-box (promoted at IoI); asking terms; the deal.json shell if one exists.

## Output
A teardown memo: deal overview, thesis pillars with grades, model decomposition, bridge reconstruction with the add-back list staged for STAR, assertions tracker, growth validation with haircut scenarios, three-layer risk list, top-10 diligence questions. 900–1,400 words; readable in ten minutes.
