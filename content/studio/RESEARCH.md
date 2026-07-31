# RESEARCH — how to build a market map
A multi-session procedure, not a web search.

> Paul, 2026-07-31: *"it's probably really 20 runs and it's probably really a
> deep research… something that Cowork is going to have to go spend several
> hours compiling. This needs to be a built out process."*
>
> Correct. A market map is **6 passes, ~20 runs, several hours**, and it usually
> spans more than one session. So this file makes it RESUMABLE: every run lands
> in its own file, a ledger records what is covered, and a stop condition tells
> you when the map is done rather than when you are tired.
>
> `PLAYBOOK.md` says what the finished documents look like. This says how to
> gather what they need. Read both before starting.

---

## 0. Why this file exists

Two failure modes, both expensive:

1. **Searching without a frame.** You gather 40 interesting pages and find at
   the end that three of the seven sections the client is paying for have
   nothing in them. Every pass below is aimed at a NAMED section of the market
   map, so a gap is visible while there is still time to fix it.
2. **Synthesizing too early.** Writing the master after pass 2 produces a
   confident document about a market you have half-read, and the confident half
   is indistinguishable from the rest. **Gather everything, then synthesize
   once.**

## 1. Before any searching — the frame

Write `markets/<m>/research/00-frame.md` first. Ten minutes, and every later run
inherits it:

```markdown
# Frame — <trade> in <geography>
client:        <acquirer, or "practice" if speculative>
buy-box:       revenue $Xm–$Ym · EBITDA $Xm+ · <ownership/structure>
naics:         <code(s)>
geography:     <metros, counties — be specific; "Texas" is not a geography>
question:      <the ONE question this map must answer for this client>
decided:       <what the client will DO differently depending on the answer>
```

If you cannot fill `question` and `decided`, stop. A map that answers nothing is
20 runs of wasted hours, and the frame is where that gets caught.

## 2. The coverage ledger

Create `markets/<m>/research/_log.md` and keep it current as you go. It is the
resume point when a session ends mid-job:

```markdown
# Run log — <market>
| # | pass | topic | file | status | date |
|---|------|-------|------|--------|------|
| 1 | structure | NAICS establishment counts | 01-census-cbp.md | done | 2026-08-01 |
| 2 | structure | TX fire alarm licence regime | 02-tx-fire-marshal.md | done | 2026-08-01 |

## Section coverage
| Market-map section | Filled by | State |
|---|---|---|
| How the market is structured | pass 1, 4 | thin |
| Scale and fragmentation | pass 1 | ok |
| Who is consolidating | pass 2 | not started |
| What a platform looks like here | pass 3, 4 | not started |
| Where the openings are | pass 2 + 3 | not started |
| What would make us walk | pass 4, 5 | not started |
| What we don't know yet | everything left thin | — |
```

**The section table is the point.** "Where the openings are" is the section the
client is paying for, and it is derived — it needs pass 2 AND pass 3 done before
it can be written honestly.

## 3. The six passes

One file per run: `research/NN-topic-source.md`, never overwrite, and open each
one with what produced it:

```markdown
<!-- run: 07 | pass: consolidators | date: 2026-08-01
     query: "fire protection" acquisition 2025 site:prnewswire.com
     tool: web search + fetch -->
```

That header is what makes a 20-run job auditable six months later, when a figure
in the master gets questioned.

### Pass 1 — Structure and scale (3–4 runs)
The skeleton. Primary, stable, and the cheapest to get right.

- Establishment and employment counts by NAICS and geography — **Census County
  Business Patterns**, **BLS QCEW**. Pull the actual tables, record the vintage.
- Revenue-per-employee benchmarks, if you will band revenue later.
- **The regulatory layer, which in the trades IS the moat**: licence regimes
  (state fire marshal, contractor boards), inspection and testing mandates,
  code adoption cycles (NFPA, IMC, IECC — name the edition the state is on).
  Recurring revenue that a code *requires* is a different asset from recurring
  revenue a customer chooses. Get this right and half the thesis writes itself.

→ fills *Scale and fragmentation*, and the underwriting half of *How the market
is structured*.

### Pass 2 — Who already owns what (5–6 runs, the longest pass)
The consolidator register. This is the pass that decides whether the map is
worth anything, because "where the openings are" is the inverse of it.

- Platform by platform: sponsor, footprint, brands, **add-on cadence** (dates,
  not adjectives). Sources in priority order: the platform's own newsroom → the
  sponsor's portfolio page → PR wires → trade press → directories.
- Public strategics: their investor materials say what they intend to buy.
- Record **what each one is NOT buying** — that is the opening.

Write the outcome into `screen/consolidators.md` as you go, in the register
format `house/screen.ts` parses. It is the same knowledge, and the screen needs
it to tell an independent from an owned business.

→ fills *Who is consolidating*, and half of *Where the openings are*.

### Pass 3 — The independent universe (3–4 runs)
What is left to buy.

- **The licence registry is the authoritative list** — every licensed
  contractor in the state, from the regulator. Start there, not with a search
  engine.
- Association member directories (state and national trade bodies).
- A Places sweep (`screen.mts pull`) as a cheap cross-check on coverage, never
  as the source. **Places is discovery, not evidence.**

→ feeds `screen/candidates.csv`, and fills *What a platform looks like here*.

### Pass 4 — Operating economics (3–4 runs)
**Highest fabrication risk in the whole job.** Every figure needs a source on
the same line you write it.

- Labour: wage levels and inflation for the trade (QCEW, BLS OES — not a
  vibe about "tight labour").
- Insurance, fleet, bonding, parts inflation.
- Multiples: what the market pays, with the source. If the only sources are
  ranges from advisors, say so and cite them; **conflicting sources keep both
  values, never an invented midpoint.**

→ fills *What would make us walk*, and the margin half of *How the market is
structured*.

### Pass 5 — The gap sweep (1–2 runs)
Re-read the section table. For every row still "thin", one targeted run. This is
the pass people skip, and it is the one that turns a decent map into a defensible
one.

### Pass 6 — Synthesis (1 run, no searching)
Only now:

```
# fold everything in research/ into the one master
# then, mechanically:
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md
```

The audit checks that every figure appears in a source or is registered in
`## Derivations` with its working. **It checks NUMBERS, not prose** — a
fabricated qualitative claim carries no figure and passes, so the honest reading
of the master is still yours to do.

Then derive the client documents per `PLAYBOOK.md`, and audit each against the
master.

## 4. When is it done

Not "when it feels thorough". Two tests:

1. **Every section in the coverage table is `ok`**, or is named explicitly in
   *What we don't know yet*. Naming a gap is a finished state; leaving it blank
   is not.
2. **Two consecutive runs on a section produce nothing new.** If a third
   consolidator search returns only names you already have, that pass is done.
   Chasing a fourth is how an afternoon disappears.

## 5. Running it across sessions

A market map will not fit in one session. So:

- **Never hold findings in the conversation.** A run is not done until its file
  is on disk. The session will end; the folder is what survives.
- **Update `_log.md` after every run**, not at the end.
- **Resuming:** read `00-frame.md`, then `_log.md`, then the section table. That
  is the entire handoff — no summary needed, no memory required.
- **Do not re-run a done row.** The log exists so you don't pay for the same
  search twice.

## 6. Where this runs, and why

In **Cowork, on Paul's own subscription.** The same job through the app's
`researchAgent` bills searches at $10/1,000 plus fetched pages re-entering
context on every resume round — roughly $5–15 per deep run, so a 20-run map is
$100–300. The searching is identical; only the meter differs.

The output is the same artifact either way: files in `research/`, a `master.md`,
a `candidates.csv`. The app imports the register and the screen board and manages
the pipeline from there. **Search outside, manage inside.**
