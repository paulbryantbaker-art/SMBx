# Market maps — the operating model

**Settled (Paul, 2026-07-24).** Read this before touching a trade dossier or
the market-map pipeline. It fixes what runs in Cowork, what runs in the app,
how knowledge crosses between them, and when a map is allowed to reach a
client. Companion to `STUDIO_COWORK.md` (the studio's local-first runbook);
the build spec for the engine itself is the Market Map Engine prompt.

> **Status: model only.** No pipeline code exists yet. This doc is the contract
> the build has to satisfy — agree the schema here before anything is written
> against it.

## The seam

**Cowork produces knowledge. The app produces inventory.**

Work belongs in Cowork when it is *expensive to acquire, slow to change, and
needs judgment*. It belongs in the app when it is *cheap, mechanical, and
varies per deal*. Those three tests agree on every artifact below, which is how
we know the seam is real and not just a convenience.

| Artifact | Changes | Runs in | Cost |
|---|---|---|---|
| **Trade dossier** — NAICS + commercial split, PE-platform roster, franchise brands, large independents, consolidation state, valuation bands | Quarterly | **Cowork** | $0 marginal |
| **Narrative report** (e.g. The Quiet Repricing) | Occasional | **Cowork** | $0 marginal |
| Census / BLS / BDS framing | Per geography | **App** | Free APIs |
| Places discovery | Per map | **App** | Free tier, field-masked |
| Classification (rules → dossier match → Haiku for ambiguous) | Per target | **App** | ~$0 |
| Website enrichment | Per target | **App** | ~$3/map, batched |
| Fit scoring | Per target | **App** | $0 |
| Ledger PDF | Per map | **App** | $0 |

### Why the split is about meters, not preference

There are two meters and they are easy to confuse:

- **The Claude subscription** (Cowork / Claude Code) — flat, already paid.
- **The app's `ANTHROPIC_API_KEY`** — metered per token, and subject to the org
  monthly cap that blocked July 2026.

Deep research is the only genuinely expensive step in this whole pipeline
(fetched pages bill as input tokens against Sonnet). Putting it on the
subscription and leaving the mechanical work in the app is what makes a map
cost ~$3 instead of ~$50. Same doctrine as the studio: narrative work on the
subscription, deterministic work in the app.

## The trade dossier

The dossier is the *only* thing that crosses from Cowork into the app. It is a
typed constant with provenance on every fact:

```
server/constants/tradeDossiers/commercialMechanical.ts

  tradeLabel:       'Commercial mechanical, HVAC & plumbing'
  naics:            '238220'
  commercialShare:  { value: 0.50, band: [0.45, 0.55],
                      basis: 'Census value-of-construction-work series',
                      asOf: '2026-07' }

  peBackedPlatforms: [
    { name: 'Service Logic', sponsor: 'Bain Capital + Mubadala',
      source: 'company announcement', asOf: '2025-12-16' },
    …
  ]
  publicStrategics:  [ { name: 'EMCOR Group', ticker: 'EME', … } ]
  largeIndependents: [ { name: 'Southland Industries', … } ]
  franchiseBrands:   [ … ]
  valuationBands:    [ … ]   // GF Data closed-deal bands, for fit scoring

  dossierAsOf:      '2026-07-24'
  sources:          [ … ]
```

Every entry carries its own `source` and `asOf`. That is not decoration — the
artifact has to answer "where did this come from" for any number a client
interrogates, and per-entry vintages are what let the app flag two stale
platform entries instead of condemning a whole map.

### Delivery is a commit, not an import

Cowork sessions already have the repo checked out, so "bringing it over" means
writing the file and committing it. No export step, no upload UI, no sync
problem — exactly how `scripts/studio/decks/*.mts` already works.

Dossiers live in the repo rather than a database because:

- Git history **is** the vintage record the artifact requires.
- Code review catches a bad roster *before* it misclassifies a target.
- Adding a lane needs no migration.
- The app is Paul-only forever (practice mode), so there is no multi-user
  argument for runtime storage.

The one tradeoff — a roster edit needs a deploy — is a feature here. A silent
roster change is precisely the edit that should never happen unreviewed.

## Staleness rules

A stale roster produces the failure the build spec calls worse than no map:
listing a PE-backed platform as an acquirable independent target. So freshness
is enforced by the app, not remembered by a human.

- **5 months — warn.** The map renders normally and prints a "refresh due"
  notice on the methodology page.
- **6 months — hard block on the client artifact.** The Ledger PDF refuses to
  render. An **internal draft still renders, visibly watermarked**, so work is
  never blocked mid-engagement — only client delivery is.
- **Per-entry vintages.** Census/BLS/Places layers do not decay; only the
  roster does. A dossier with fresh framing and two stale platform entries
  flags those two entries as "verify before outreach" rather than failing the
  whole map.
- **The vintage is always printed.** Dossier `asOf` appears on the methodology
  page of every map, blocked or not.

## Lane status

| Lane | Research state | Cowork work needed |
|---|---|---|
| **Commercial mechanical / HVAC / plumbing** | `the-quiet-repricing.md` + `commercial-mep-buy-side-assessment.md` + home-services §4.3 | **None** — extraction only |
| **Residential home services** (six trades) | `home-services-master-assessment.md` §2.2 / §4.2 / §4.4 / §4.5 / §5.1 | **None to light** — extraction, verify ownership currency |
| **Elevator** | D02 deck facts only (PE ~10% of units, retention >90%, IUEC labor) | **Top-up** — needs a platform roster |
| **Landscaping** | Researched for the Fall post; spec uncommitted, lives in scratch | **Recovery + top-up** |
| **Fire & life safety** | Not started (posting plan status `next`) | **Full research run** |

Target state is 3–4 lanes.

## Sequencing

Target state is 3–4 lanes, but **not** four dossiers before the first map —
that puts days of research ahead of any evidence the pipeline works.

1. **Extract commercial mechanical** (no research — it is already written) and
   build the pipeline against it. First real map here.
2. **Extract residential home services** — nearly free, and it proves the
   schema generalizes across trades.
3. **Then** top-up runs for elevator / landscaping / fire & life safety, once
   the schema has survived contact with two real lanes.

The schema will be wrong in some way we cannot predict. Better to find that
after extracting two lanes than after researching four.

## The two flows

**New lane (Cowork, once per trade):** research the trade → emit *two* outputs
from the same work — the client-facing narrative report **and** the structured
dossier → commit both.

**New map (app, unlimited):** trade + geography → Census/BLS/BDS framing →
Places discovery (Essentials, strict field masks) → dedupe → classify against
the dossier → Haiku enrichment (batched) → fit scoring → Ledger PDF. ~$3, no
research.

## Refresh runbook (Cowork, quarterly per lane)

1. Open the lane's dossier and read `dossierAsOf` and the per-entry vintages.
2. Re-verify the volatile fields only — **platform ownership** first (it moves
   fastest; Service Logic changed hands in December 2025), then franchise
   brands, then consolidation state.
3. Update changed entries with a fresh `source` + `asOf`. Leave unchanged
   entries alone so their original vintage survives.
4. Bump `dossierAsOf`, commit, open a PR. The diff is the audit trail.
5. If the narrative report is materially out of date too, refresh it in the
   same session — same research, two outputs.

## Non-negotiables

1. No Google Places Detail data in PostgreSQL, ever. Place IDs only.
2. Every number on the artifact carries a source and a vintage. Zero
   fabrication; estimates are labeled as estimates with their method.
3. Classification evidence is always stored and always shown. Exclusions and
   uncertainties are shown, never hidden.
4. Never use Sonnet or Opus for bulk classification or enrichment — Haiku,
   deterministic rules first. That single choice is the difference between a
   $3 map and a $60 one.
5. A dossier past its block window does not reach a client. Internal drafts
   are watermarked.
6. Deep research runs on the subscription, in Cowork — never as a per-map cost
   on the app's metered key.
