# smbX Studio — Posting Plan

The single source of truth for what gets built next. A Cowork session reads
this file, finds the next slot marked `status: next`, verifies the numbers,
and builds the deck. Keep it current — this file replaces the app's campaign
scheduler for the off-app workflow.

> Paste your full weekly plan below in the same shape. Each slot is one entry.
> `format` is drawn from the posting-plan vocabulary; `status` is one of
> `next` · `drafting` · `posted` · `parked`.

## Format vocabulary (the post angles)

- **Teardown** — one trade/lane, the buyer math + the traps (e.g. Elevator Nº1)
- **Market Map** — a whole category's consolidation picture (e.g. Landscaping)
- **Contrarian Take** — the received wisdom vs. what the numbers actually say
- **How Buyers Think** — a mechanic of the deal (multiples, earnouts, QoE…)
- **Practitioner Note** — a short first-person read from the desk
- **Human Thread** — the story/relationship side of a deal
- **Hand-Raiser** — an explicit "here's who I'm looking to buy for" ask

## Standing laws for every slot (THE LINE)

- Buy-side framing only. Never sell-side/two-sided. No fees, no pricing.
- **Zero hallucination**: every number and source is verified before it goes
  on a page. If it can't be verified, it doesn't ship.
- Employer-anonymization law applies to any track-record reference.
- Headline copy stays tight; the deck carries depth, the caption hooks.

---

## Slots

### D02 · Elevator Teardown Nº1
- format: Teardown
- status: posted
- spec: `scripts/studio/decks/elevator-teardown-1.deck.mts`
- notes: PE ~10% of U.S. units; retention >90%; 1.03M elevators vs ~30k IUEC
  techs; traps = assignability + deferred maintenance.

### Landscaping · Consolidation Map (Fall 2026 refresh)
- format: Market Map
- status: posted
- notes: $3.7T dry powder; 90+ platforms; independents 3–5× vs platforms
  8–10× (the spread); commercial +14.1% YoY; H-2B FY2026 cap doubled & still
  sold out. Rebuild spec lives in scratch — port into that market's `specs/` when reused.

### Home Services · Six-Trade Teardown (rebuild)
- format: Teardown
- status: drafting
- spec: `markets/home-services/specs/home-services-teardown.deck.mts`
- source: `markets/home-services/master.md` (audit CLEAN, 258 figures cited)
- notes: rebuilt 2026-07-27 off the corrected master. The prior version of
  this spec carried four figures that failed primary-source verification —
  the "$700B six-trade total" (its electrical component is unsourced), the
  "$1.2T dry powder hunting essential services" (all-sector buyout total
  relabeled), pest control's "74% recurring" (real figure 85.4%, residential
  service revenue only), and electrical at "~$250B". Deck now opens on
  fragmentation instead of market size. Every platform comp hedged to
  "reportedly", outlet named — they are all anonymous-source trade press.
  Full evidence trail: `markets/home-services/research/verification-pass-2026-07-27.md`.

### D03 · Fire & Life Safety Teardown
- format: Teardown
- status: next
- notes: teased in the D02 closer ("Next Tuesday: fire & life safety").
  Research the lane — inspection/monitoring recurring revenue, code-mandated
  cadence, PE roll-up activity, the labor/licensing constraint — verify all
  numbers, then build with `build-deck.mts`.

<!-- Add the rest of the weekly plan below, same shape. -->
