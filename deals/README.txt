One folder per CLIENT ENGAGEMENT — one mandate, not one target company.
Copy _example-deal/ and rename it for the engagement.

    deals/<engagement>/
        thesis-<market>.md   the position held FOR THIS CLIENT, one per market
                             they are looking at. Scaffold it with:
                             thesis.mts new <market> --client <engagement>
        documents/           what the seller sent (financials, CIM, contracts)
        analysis/            what we produced (QofE read, model output, memos)
        notes.md             the running record

CONFIDENTIAL, and the boundary is not soft. Nothing in here is a source for a
master or for anything in a market's collateral/. A client's mandate — hold
period, equity, leverage, check size — never reaches a posted document and never
appears in another client's thesis. audit.mts will NOT catch a breach: it checks
whether a figure traces, not where it came from. See THE LINE in CLAUDE.md.

THE LINE also applies as always: buy-side only, no unlicensed opinions —
coordinate the specialist instead.
