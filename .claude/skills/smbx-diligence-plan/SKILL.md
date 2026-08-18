---
name: smbx-diligence-plan
description: Builds the SMB-scaled diligence workplan — workstreams sized to a lean team, a document request list (DDQ) tailored to the deal, and a living issues log seeded from the CIM teardown — with earnings verification on the critical path. Use after a teardown or accepted LOI, when organizing due diligence, document requests, or a diligence timeline.
---

# Diligence Plan

## When to use
The teardown is done, or an LOI has been signed with a diligence window running. This skill turns the teardown's question list into an executable plan for a lean team — the buyer, a CPA, a lawyer, and CC — not eight advisor workstreams. Nothing material may exist without an owner and a deliverable date, because in an SMB process the window is 45–90 days and unanswered questions default in the seller's favor.

## House rules
- **Seam & engine:** deal-shaped, app-side. Documents land in the deal's data room; every finding that carries a figure is engine-verified from documents before it enters the profile.
- **Evidence:** the DDQ exists to convert Asserted claims to Primary evidence. Each request traces to a specific teardown question — no boilerplate requests, no unowned findings.
- **`deal.json` and `master@commit` are design, not yet built.** As of 2026-08-17 there is no IoI promotion packet and no master pointer on a deal — `house/where.ts` records this as the largest unbuilt piece of the seam. Keep the discipline (every figure carries a source; add-backs enter only when verified with evidence; everything else to the assumption log) but record it in the deal's `.deal.mts` spec (`earningsSource`, `unknowns`) and the analysis document. Do not tell anyone to open a file that is not there.

## Method
1. **Activate workstreams (SMB set).**
   - *Financial / earnings verification* — owner: CPA or the engine-backed QoE-lite. Deliverable: verified clean SDE/EBITDA (via `smbx-add-back-scrutiny`), working-capital picture, tax-return reconciliation. **This is the critical path: price and the SBA package both hang on it.**
   - *Commercial* — owner: buyer + CC. Deliverable: concentration forensics, revenue quality, pipeline/backlog reality, competitive position vs the studio's market master (`master@commit` pointer — read, don't copy).
   - *Legal & transfer* — owner: counsel. Deliverable: the RAG transfer register cleared (via `smbx-dependency-transfer-risk`), entity and lien status, asset-vs-stock structure consequences, consents in motion.
   - *People & operations* — owner: buyer. Deliverable: dependency map, retention plan, facility and equipment condition, systems reality (often: one aging server and the owner's phone).
   - *Financing* — owner: buyer + lender. Deliverable: SBA eligibility, DSCR at proposed structure (engine: `sba` model, 1.25 floor / 1.50 strong), lease-term condition, appraisal and environmental if real estate is involved.
2. **Build the DDQ.** Grouped by workstream, each request answerable with a document. Core SMB list: monthly P&L 3 years + LTM by revenue line; 3 years business tax returns *with reconciliation to the P&L*; bank statements 12 months; customer-level revenue (top 20 minimum) and AR aging; complete add-back documentation; payroll register with roles and tenure; licenses, permits, bonding, insurance, and claims history; all contracts (customer, supplier, franchise, lease, equipment); equipment list with age/condition; WIP schedule and backlog for contractors; open litigation and warranty exposure. Cut anything that doesn't trace to a teardown question; add whatever the thesis makes critical. Every request carries delivery tracking: requested date, promised date, status (received / partial / refused / silent) — the DDQ is a register, not a wish list.
3. **Seed the issues log.** Every teardown risk becomes an opening entry: ID, one-sentence description, workstream, severity (high = potential deal-stopper), status, resolution/mitigant, impact on price or structure if unresolved. The log is the single living document from first seller call to IC memo — update it after every call, document batch, and site visit. The IC memo's risk register is built from it, not from memory. **The non-delivery register feeds it:** a document requested twice and not produced is promoted to an issues-log finding graded like an Asserted claim — "the customer-level ledger has not been produced after two requests" carries the same analytical weight as an unsupported claim — and the pattern of WHAT the seller stalls on (invariably the add-back support, the customer ledger, the tax-return reconciliation) actively redirects diligence priority toward it. Near exclusivity expiry, open non-deliveries trigger an explicit action — extension request, price consequence, or a named condition precedent — never silent acceptance. Unanswered defaults in the seller's favor only when nobody is counting; this is the counting.
4. **Timeline and critical path.** Realistic SMB spans: LOI to close 60–120 days; SBA adds 30–45 days after loan package submission; licenses and landlord consents run on their own clocks — start them the week diligence opens, not at the end. Map each workstream's deliverable date against the LOI window and flag anything that cannot land before exclusivity expires.
5. **Site visit and seller sessions.** Schedule deliberately: first visit early (calibrates everything), verification visit late (test the answers, meet the key people identified in the dependency map — carefully, if employees don't yet know).

## Inputs
Teardown memo and its top-10 questions; LOI terms and window; advisor roster; deal.json; data-room state.

## Output
Workstream plan (owner, deliverable, date); the tailored DDQ; the seeded issues log; the timeline with critical path and consent clocks flagged.
