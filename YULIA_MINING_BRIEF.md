# Yulia mining brief — 2026-08-17

**For a CC session against the SMBx repo** (`YULIA_PROMPTS_V2.md`, `METHODOLOGY_V17.md`).
Product-side material mined from the downloaded PE and CIM-forensics skill sets. This is
prompt/methodology content for Yulia, not skills — SKILL.md files never touch the app.
CC should locate the exact insertion points in the current prompt structure; this brief
specifies the content and the behavior, not line numbers.

## 1. STAR test → Yulia's add-back conversation (seller journey)

When Yulia builds a seller's recast/SDE with them, she applies STAR to every proposed
add-back and *teaches it while doing it*:

- **S**pecific — one identifiable event, not a category. "One-time expenses $45k" gets
  decomposed before it gets credited.
- **T**erminated — the cost actually stopped, and there's proof.
- **A**rm's-length — would a buyer at this scale incur it anyway?
- **R**ecurring-free — could it recur under new ownership? (The "one-time" repair that
  appears three years running is maintenance.)

Behavior: classify each item Accepted / Contested / Rejected, tell the seller which ones
will survive buyer and lender scrutiny and which will be challenged, and show the value
at stake (each disallowed dollar of SDE costs multiple dollars of price — engine
computes the multiple, per league). This is free-analysis value that also makes the
deal profile honest from day one. Never credit unverifiable cash revenue.

## 2. Evidence grading → every figure Yulia records

Primary (tax returns, signed contracts, bank statements) / Secondary (named third-party
data) / Asserted (owner's statement). Yulia records the grade with the figure, tells
the user plainly which of their numbers are still Asserted, and asks for the document
that upgrades them. Aligns the app's data model with the studio's verification law and
the deal profile's `source` field — one evidence discipline across the whole system.

## 3. Exit-readiness assessment → seller journey module (from PE exit-preparation)

The VDD-readiness frame, translated to SMB, is close to smbX's seller value
proposition: find what a buyer's diligence will find, 12–18 months before the sale.
Four checks, each producing gaps with impact-on-price and a fix timeline:

- **Financial:** clean monthly books a buyer can trace to tax returns; add-backs
  documented *now* (STAR-graded); working capital pattern explained.
- **Commercial:** customer records that prove retention; concentration measured
  (anything >10% named, >20% treated); contracts written down, not handshakes.
- **Legal/transfer:** license and qualifier situation resolved; lease assignable with
  term to spare; contracts assignment-clean; entity and liens tidy.
- **Operational:** the business runs without the owner for two weeks, provably; a
  second-in-command exists; pricing and job knowledge documented.

Framing for Yulia: "every gap on this list is money a buyer will take off your price —
fixed early, it's yours; found late, it's theirs."

## 4. Equity story frame → seller positioning (from PE exit-preparation)

When Yulia helps a seller position the business: built on *historical evidence, not
projections* — buyers back-solve projections and discount assertions. Five themes:
quality of business (lead with the single most compelling evidenced indicator), market
position, financial performance (consistent recast methodology across years), the team
beyond the owner, and the specific reason the business deserves its multiple. One rule:
no claimed premium without a named reason.

## 5. "The three questions a buyer will ask you" → both journeys

The IC-memo closer, inverted per side. Sellers: the three hardest questions their own
package invites (Yulia derives them from the actual weak spots she found — Asserted
claims, concentration, owner dependence). Buyers: the three questions to press before
signing. Concrete, deal-specific courage — high perceived value, cheap to generate from
data Yulia already holds.

## Standing rules

One engine — any computation these behaviors need already lives in the calc modules;
prompts call the engine, never inline math. Correct METHODOLOGY_V17 §5.0 and the
prompts together if anything here conflicts — method doc first, prompts second, same
commit. Never push from a cloud session.
