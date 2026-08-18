---
name: smbx-ic-deal-memo
description: Drafts the answer-first deal memo — recommendation in the opening line, five-section assessment with evidence citations, a risk register built from the issues log, engine-stamped returns, conditions, and the three pressure-test questions. Use when diligence findings must become a decision document: an investment memo, IC memo, deal recommendation, or go/no-go for a client.
---

# IC Deal Memo

## When to use
Diligence is substantially complete and the client must decide. The memo is the written argument for the decision — for smbX the "committee" is the client (a searcher, family office, or consolidator's deal council), which raises the bar: it must survive the scrutiny of someone writing a personal check and personally guaranteeing the SBA note. Also use it for a *pass* memo — a documented pass protects the client relationship and feeds the studio's pattern library.

## House rules
- **Answer-first.** The recommendation is the first sentence of the memo and of its own section. Nothing is buried.
- **Evidence:** every figure is engine-stamped; every claim cites its source (document, engine run, or call note). Anything still Asserted at memo time is named as such — an Asserted claim load above a handful of items means the memo is early, not that the language should soften.
- **The risk register is built from the issues log,** not reconstructed from memory. Risks that appear in the memo but not the log indicate a broken process; fix the log.
- **`master@commit` is design, not yet built.** As of 2026-08-17 a deal carries no pointer to the market master that priced it — `house/where.ts` records it as part of the largest unbuilt piece of the seam. Cite the master by name and version instead, and read it in the studio rather than copying it.

## Method
1. **Executive summary (write last, present first).** One page: the company in a sentence; the deal (price, structure, multiple on verified earnings, equity and debt); the thesis in three bullets; the primary risk and its mitigant in one; the recommendation; base-case returns and bear-case DSCR headroom.
2. **Five-section assessment.** Each section leads with its top finding in one sentence, then evidence.
   - *Commercial* — market position vs the studio master (`master@commit`), concentration findings, revenue quality, backlog reality.
   - *Financial* — verified clean SDE/EBITDA vs the broker recast (state the haircut in dollars and percent), the add-back battleground summary, working capital, capex reality.
   - *People & operations* — dependency map conclusions, bus-factor, retention plan status, what the site visit showed.
   - *Legal & transfer* — the RAG register state: consents obtained, pending, and conditioned; license bridge; lease; structure (asset/stock) and why.
   - *Thesis check* — does the original buy-box thesis still hold after diligence, and what materially changed from the CIM? Say plainly what the seller's package claimed that diligence did not support.
3. **Risk register.** 5–8 material risks from the issues log, each: one-sentence description, probability (H/M/L), severity (H/M/L), mitigant, and residual risk after mitigant. Every High/High carries a specific treatment — price adjustment, escrow/holdback, earnout, condition precedent, or walk — already reflected in the recommended structure.
4. **Returns and structure.** The `smbx-deal-scenarios` output: three cases side by side, the bid ceiling and its determinants, DSCR headroom, and how the contested-earnings gap is structured. State what must go right to hit base case, and what can go wrong without breaching 1.25.
5. **Recommendation with conditions.** *Proceed* (with the closing checklist: consents, license bridge, retention agreements, financing conditions), *proceed conditionally* (each condition precise, with its consequence if unresolved), or *pass* (the reasons, stated without equivocation, and what would change the answer).
6. **Close with the three questions no one wants to ask.** The three hardest questions the client should press before signing — the ones the memo's own weakest evidence invites. Writing them down is the final honesty check: if the memo can't survive its own three questions, it isn't done.

## Inputs
Issues log (current); teardown memo; workstream outputs (add-back scrutiny, concentration, dependency/transfer, scenarios); LOI and draft terms; the client's buy-box and return threshold.

## Output
A 2,000–3,500 word memo in the nine-part shape above, every figure engine-stamped, every claim sourced — plus the one-page executive summary usable standalone.
