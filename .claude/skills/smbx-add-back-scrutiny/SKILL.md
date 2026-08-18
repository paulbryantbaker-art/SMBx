---
name: smbx-add-back-scrutiny
description: Applies the STAR test to every add-back in a seller recast or broker bridge, classifies each as Accepted, Contested, or Rejected, and gates which ones enter the deal profile as verified — producing engine-computed clean SDE/EBITDA under bear, base, and bull. Use whenever adjusted earnings, a recast P&L, an add-back schedule, or seller discretionary earnings are presented or negotiated.
---

# Add-Back Scrutiny

## When to use
Any time a deal's earnings figure includes adjustments — the broker recast in a CIM, a seller's add-back schedule, a QoE draft, or a number quoted in negotiation. Add-backs are the single most contested arithmetic in SMB deals: the price, the SBA loan size, and the DSCR all hang on which ones survive. Run this before committing to any valuation range and before every price conversation.

## House rules
- **Engine:** clean SDE/EBITDA is computed by the engine from the deal profile. This skill decides *which add-backs enter the profile*; the engine does the math. Never total a bridge in conversation.
- **Evidence gate:** an add-back enters the math only when marked `verified: true` with `evidence` in deal.json. **This skill is the rubric for granting that flag.** Everything else goes to the assumption log.
- **League rule:** L1–L2 deals lead with SDE (one owner's compensation added back by definition — a second owner's is a red flag); L3–L6 lead with Adjusted EBITDA (a market-rate manager replacement wage must be *deducted*, not ignored).

## Method
1. **Inventory.** List every add-back preserving the exact source label and dollar amount, per year. No consolidation, no rounding — the label the seller chose is itself evidence.
2. **STAR test, each item.**
   - **S**pecific — a single identifiable event, not a category ("2023 flood repair — $18,400" passes; "one-time expenses — $45,000" fails until itemized).
   - **T**erminated — the cost has actually stopped, and there is proof it stopped.
   - **A**rm's-length — would a buyer at the same scale incur it anyway? (Owner's health insurance gets added back; the shop foreman's does not.)
   - **R**ecurring-free — could it recur under new ownership? (Equipment repair "one-times" that appear three years running are maintenance, not add-backs.)
3. **Classify.** *Accepted* (passes all four, evidence in hand) / *Contested* (passes some; name the document that would resolve it) / *Rejected* (recurring, unevidenced, or indefensible). Flag any single item above 10% of the total adjustment as automatic Contested-or-better scrutiny.
4. **The SMB bestiary — test these hardest:** owner compensation normalization (the replacement wage must be a real market wage for the actual role, not a token); family members on payroll (are they working? will they leave?); personal vehicles, insurance, travel, and phone; rent paid to a seller-owned entity at off-market rates (re-set to market, both directions); Section 179 / depreciation games; "one-time" legal or repair costs with a multi-year pattern; cash revenue claims (never credit unverifiable cash — if it isn't in the returns, it doesn't exist for pricing).
5. **Gate and run.** Accepted items get `verified: true` with the evidence reference and enter deal.json. Contested items stay in the assumption log with their resolving document named. Run the engine three ways: **Bear** (Accepted only), **Base** (Accepted + Contested resolved favorably where evidence is likely), **Bull** (all adjustments) — and carry the resulting clean SDE/EBITDA range into valuation, DSCR, and the IC memo. If bear-case DSCR falls below 1.25, say so immediately: the financing, not just the price, is at risk.
6. **Negotiation residue.** Every Rejected and unresolved Contested item is negotiating material: price adjustment, or an earnout trigger tied to the very earnings the seller claims (see `smbx-deal-scenarios`).

## Inputs
The add-back schedule or recast with exact labels; 3 years of tax returns and P&Ls; payroll register; the deal.json profile; supporting documents for any item claimed as verified.

## Output
Line-by-line classification with STAR results and evidence references; the updated verified/assumption-log split for deal.json; engine-stamped bear/base/bull clean earnings; a ranked data-request list for Contested items; the negotiation-residue list.
