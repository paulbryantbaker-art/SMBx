---
name: smbx-deal-scenarios
description: Defines internally consistent bear/base/bull cases, encodes them in the deal profile, runs the engine's valuation, SBA/DSCR, LBO, and earnout models, and interprets the results — including DSCR headroom, the bid ceiling, and earnout structures tied to contested earnings. Use for any scenario modeling, returns analysis, offer-price setting, financing stress test, or "what can we pay" question on a live deal.
---

# Deal Scenarios

## When to use
Setting an offer price, testing a financing structure, preparing the IC memo's returns section, or deciding how much contested earnings should move price versus structure. This skill is the discipline layer over the engine: it defines what to run and reads what comes back. It is most valuable at three moments — before the LOI number, after diligence updates the profile, and before the IC memo.

## House rules
- **The engine computes; Claude never does.** All figures come from engine runs on deal.json — `valuation`, `sba` (DSCR, eligibility, amortization), `lbo` (returns with growth×exit sensitivity grid), `earnout`, `compare`. Every output is engine-stamped. If the engine lacks an input, the answer is a data request, not an estimate.
- **League rule:** L1–L2 scenarios run on SDE; L3–L6 on Adjusted EBITDA. The earnings base is always the *verified* figure from `smbx-add-back-scrutiny` — never the broker recast.
- **Scenarios are internally consistent.** A bear case is conservative on every line at once — revenue, margin, capex, working capital — not selectively pessimistic on one.

## Method
1. **Define the three cases.** For each of revenue, margin, capex/equipment replacement, and working capital: *Base* = verified history plus diligence-supported trajectory (not the seller's projection); *Bull* = a named, bounded upside (new territory, price increase the market supports, add-on) — plausible, not hoped; *Bear* = the specific stress this deal is exposed to — the walk-away simulation from concentration forensics, the owner-transition revenue dip (standard in SMB: assume one), margin compression from a replacement manager wage, or equipment catch-up capex identified on site. Write one line per case stating what it assumes and what would trigger it.
2. **Encode and run.** Each case becomes a variant of the deal profile (verified figures untouched; scenario deltas in the assumption log with rationale). Run the full model set per case.
3. **Read DSCR first.** SBA reality gates everything: DSCR below **1.25** in any case means that structure doesn't finance; **1.50+** is strong. State bear-case DSCR headroom explicitly — the percentage cushion above 1.25 — and which assumption erodes it fastest. If the bear case breaches, the fix is structural: lower price, larger equity injection, seller note (on standby if the lender requires), or an earnout shifting risk to the seller.
4. **Find the bid ceiling.** The entry price at which base-case returns fall below the client's threshold (engine grid: growth × exit), and separately the price at which bear-case DSCR breaks. The lower of the two is the ceiling. State it as a number with its two determinants — this is the single most useful line in the IC memo.
5. **Structure the contested gap.** Where verified earnings and seller-claimed earnings diverge (the Contested/Rejected residue from add-back scrutiny), price the deal on verified and bridge the gap with structure: an earnout triggered by the very performance the seller claims, a seller note, or a holdback against specific transfer risks. Run the `earnout` model to size triggers and payments; the principle is that the seller finances their own assertions.
6. **Present.** Side-by-side case comparison (engine `compare`): price, structure, DSCR, returns per case; the ceiling; the recommended offer and structure with the one sentence explaining what must be true for it to work.

## Inputs
deal.json with verified earnings and assumption log; proposed structure (or the lender's term sheet); client return threshold and hold assumptions; concentration and dependency findings for bear-case design.

## Output
Three defined cases with rationale lines; engine-stamped results per case; DSCR headroom statement; the bid ceiling with its determinants; earnout/structure recommendation for the contested gap; the comparison table for the IC memo.
