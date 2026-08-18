A DEAL — one transaction.

documents/   what the seller sent (financials, CIM, contracts)
analysis/    what we produced (QofE read, model output, memos)
notes.md     the running record

MODEL WITH THE CLI, never by hand — house/deal.ts is the same arithmetic
the app runs, and a test fails if the two ever disagree. Working a return
out in a scratch file is how a second answer gets born.

  npx tsx <repo>/scripts/studio/deal.mts new <engagement> "<target>"
  npx tsx <repo>/scripts/studio/deal.mts run analysis/<target>.deal.mts
  npx tsx <repo>/scripts/studio/deal.mts list

The .deal.mts spec is the artifact you maintain; <target>-model.md is
output and the next run overwrites it. Money in CENTS, rates as DECIMALS.

Document specs — model, memo, diligence plan, term framework — are in
PLAYBOOK.md section 5. Deal documents render to decks/, never collateral/:
collateral is publishable anywhere, and these name a live target.

THE LINE applies: buy-side only, no unlicensed opinions — coordinate the
specialist instead. Tax goes to the CPA (deal.mts carries no tax surface
on purpose); clause language goes to counsel. See THE_LINE_POLICY.md.
