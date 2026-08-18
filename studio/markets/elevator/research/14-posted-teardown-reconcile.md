<!-- run: 14 | hunt: B | date: 2026-08-11
     query: read of the posted deck spec, recovered from the engine repo
     tool: file read — scripts/studio/decks/elevator-teardown-1.deck.mts -->

# What the posted Elevator Teardown Nº1 actually carried

**Why this file exists.** The RECONCILE of an already-published artifact is a research
input like any other, and it was missing. Without it the master's `## A.0.1` and
`## A.0.2` ledgers quote figures that appear in no source on disk — so the audit
correctly flags them, and more importantly nobody could reproduce the reconcile.

**Source document:** `scripts/studio/decks/elevator-teardown-1.deck.mts`, recovered
2026-08-11 from `~/Documents/GitHubRepos/SMBx-live/SMBx/` after `SMBx-main` was found
empty. A copy is filed at `markets/elevator/specs/elevator-teardown-1.deck.mts`.

**Nothing here is a verified figure.** This is a record of what was published, quoted
verbatim, so the corrections can be traced. Read it as evidence of what we said, not
as evidence about the market.

## The figures, page by page, as published

| Page | Kind | Figure(s) as printed | `source:` line on the card |
|---|---|---|---|
| 1 | numeral | **~10%** "of U.S. units are maintained by PE-backed platforms — early, not hot." Body: "OEMs hold **~60%**. Independents still hold **~30%**." | `elevatorworld.com · Dec 2025` |
| 2 | numeral | **40** "deals at the 2021 peak — and **10+** transactions every year since." | `elevatorworld.com · Dec 2025` |
| 3 | statement | "Customer retention on the platform books typically exceeds **90%**." | `elevatorworld.com · Dec 2025` |
| 4 | diagram | Bars labelled **5** ("5 stops / route") and **8** ("8 stops / route") | **none — no `source:` line** |
| 5 | statement | "The U.S. runs **1.03M+** elevators; the IUEC roster is roughly **30,000** constructors — and that covers the U.S. and Canada." | `nationalelevatorindustry.org · iuec.org` |
| 6 | statement | Trap Nº1 — assignability. No figure. | — |
| 7 | statement | Trap Nº2 — deferred maintenance. No figure. | — |

**Caption, verbatim:** "PE-backed platforms now maintain roughly 1 in 10 U.S.
elevators — OEMs still hold **~60%**, independents **~30%**."

**Cover and closer:** no figures.

## What each one resolved to on verification

- **~10%** — the card names `elevatorworld.com · Dec 2025`. That article is paywalled;
  403 to direct fetch, reader proxy and Wayback. **Never read.** Base year, denominator,
  and whether PE-owned OEMs sit inside it are all unknown. Retired as a citation, A.0.1.
- **~60% / ~30%** — **contradicted by a primary source.** Otis's 10-K states independents
  hold approximately 50% of service units. Retired, A.0.1. The three published shares
  also sum to exactly 100%, which no real ownership estimate does.
- **40 deals / 10+ per year** — same unread article. Unverified; do not restate.
- **90% retention** — same unread article, and directionally wrong: the one *disclosed*
  retention figure in this market is Otis's own, on the OEM's own book, and it fell from
  93.5% to 92.4%.
- **5 / 8 stops** — illustrative numbers rendered as a measured bar chart, with no source.
- **1.03M+ elevators / ~30,000 IUEC** — **VERIFIED and stands.** Reproduces against NEII
  and iuec.org, and the card correctly states the US-and-Canada scope of the union figure.

## What we don't know yet

- What the Elevator World article actually says. It is the one document that would settle
  the base year and denominator behind the ~10% figure, and it has never been read.
- Whether the rendered PDF that was posted matches this spec exactly. The spec's header
  describes it as a "WORKED EXAMPLE + FIELD REFERENCE" and its cover points at a repo
  photo, so the posted artwork may have differed from what this file specifies.
