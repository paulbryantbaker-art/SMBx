AN ENGAGEMENT — one client mandate.

thesis-<market>.md   the position held for this client, one per market they are
                     looking at. The mandate block in it comes from THE CLIENT,
                     asked in conversation — PLAYBOOK.md section 4 has the
                     interview. Leave a line blank rather than guessing; a blank
                     is visible and a guess is not.
documents/           what the seller sent (financials, CIM, contracts)
analysis/            what we produced (QofE read, model output, memos)
notes.md             the running record

Scaffold the thesis:
  npx tsx <repo>/scripts/studio/thesis.mts new <market> --client <engagement>
  npx tsx <repo>/scripts/studio/thesis.mts list      (standing, per thesis)
  npx tsx <repo>/scripts/studio/thesis.mts register  (rewrite THESES.md)

The buy-box comes AFTER the thesis, never before — screen.mts init refuses to
seed one for a market with no thesis. "What we would buy" in the thesis is the
buy-box in prose; screen.md is a transcription of it, not a new decision.

CONFIDENTIAL. Nothing here is a source for a master or for public collateral.
A mandate figure never reaches a posted document. audit.mts cannot catch that —
it checks whether a figure traces, not where it came from. See THE LINE.

Buy-side only. No unlicensed opinions — name the specialist to engage instead.
