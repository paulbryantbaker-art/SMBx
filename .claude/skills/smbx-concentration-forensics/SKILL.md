---
name: smbx-concentration-forensics
description: Maps revenue concentration across customers, channels, and cohorts, runs the walk-away simulation through the engine, and flags churn signals before they reach the price. Use when reviewing customer lists, top-account breakdowns, revenue by client, or any deal where a few relationships carry the business.
---

# Concentration Forensics

## When to use
Customer-level revenue data is available (or claimed) for a live deal. In SMB — and in the trades especially — concentration hides in places a PE checklist never looks: one general contractor feeding a sub, two property-management companies behind "hundreds of customers," a single municipal contract up for re-bid, a referral relationship that is really one person. Run this before pricing and before the SBA package goes in; lenders will run their own version.

## House rules
- **Engine:** the walk-away simulation is an engine run — remove revenue, recompute SDE/EBITDA and DSCR from the profile — not chat arithmetic.
- **Evidence:** "no customer over 10%" is an Asserted claim until the customer-level ledger proves it. Concentration findings carry the ledger reference as their source line.
- **`deal.json` is design, not yet built.** As of 2026-08-17 there is no IoI promotion packet — `house/where.ts` records it as the largest unbuilt piece of the seam. Keep the discipline (every figure carries a source; add-backs enter only when verified with evidence; everything else to the assumption log) but record it in the deal's `.deal.mts` spec (`earningsSource`, `unknowns`) and the analysis document. Do not tell anyone to open a file that is not there.

## Method
1. **Pyramid.** Top 1 / 3 / 5 / 10 / 20 customers and remainder, each tier's share of revenue, from the actual ledger — not the CIM summary. SMB thresholds: flag any customer above **10%**; above **20%** is a pricing and financing event (SBA underwriters treat it as one).
2. **Look through the customer to the channel.** Group customers by their true source: which GC, property manager, franchisor, municipality, insurer, or referrer stands behind them. A hundred end-customers routed through one relationship is one customer. State the channel pyramid alongside the customer pyramid.
3. **Contract status, top accounts.** Term, renewal date, notice period, pricing mechanism, whether the relationship is contractual at all or held personally by the owner (cross-reference `smbx-dependency-transfer-risk`). Municipal and GC work: when does it re-bid, and does the win transfer?
4. **Cohort test.** Top-10 revenue year N vs N−1. Growth above +50% in a year is event-driven and may not repeat; decline beyond −20% is an early churn signal. Note customers that appeared or vanished entirely.
5. **Growth source decomposition.** Of total revenue growth, how much came from new customers vs expansion within existing accounts? New-logo-heavy growth is fragile and repriced accordingly; expansion revenue within retained accounts is the quality signal.
6. **Walk-away simulation.** Remove the top 3 customers (or the top channel, whichever is larger) from the profile and re-run the engine: clean earnings impact at actual margin, and the resulting DSCR. **If DSCR crosses below 1.25 in the walk-away case, the deal has a financing structure problem, not just a risk footnote** — it argues for price adjustment, an earnout, or a seller note sized to the exposure.
7. **Findings.** The three highest concentration risks, each with a one-line evidence statement, the walk-away figure, and the recommended treatment (contract assignment pre-close, retention covenant, holdback, earnout tied to the account's retention, or price).

## Inputs
Customer-level revenue for 3 years (top 20 minimum); AR aging; contracts or terms for top accounts; the deal.json profile; channel/source data if the business tracks it.

## Output
Customer and channel pyramids; contract-status table; cohort table with flags; growth decomposition; engine-stamped walk-away results including DSCR; three priority risks with evidence and treatments — feeding the issues log and the IC memo risk register.
