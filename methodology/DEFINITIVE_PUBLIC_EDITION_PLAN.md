# DEFINITIVE Public Edition — Publication Readiness Assessment & Plan

**Status:** PLAN (2026-07-16). Paul's ask: publish a public MD version of
DEFINITIVE for agents, people, and MCP servers — primarily for **agentic
search citation** (Google AI results, LLM retrieval). This doc answers "what
do we need to do to get to a well-organized, publishable volume?"

## 1. What exists today (measured)

**The machine layer — the real substrate, and it's in publishable-grade shape:**
- 134 catalog slots (M101–M234) / 30 gates in `definitiveDealMechanicsCatalog.ts`, each entry carrying name, status, LINE category, gates, deal types, authority anchors, and a deterministic-computation description
- 114 executable `MODEL.*.v1` runtime models (+92 registry descriptions with required inputs and citation tags)
- Anchor-state law tables as data (`realPropertyLaw.ts`, `v19Regulatory.ts`, `v19Leagues.ts`)
- 655-case conformance suite (385 model-runtime; 13+ categories), all green
- Schemas, route map, stack overlays, DealState definition-of-done

**The prose layer — ~49,000 words across six active methodology docs** (plus
~3,600 lines archived V17/V18): METHODOLOGY_V19 (20.4k words), BUILD_PLAN
(8.8k), CC_V19 brief (7.6k), V18c pass (5.6k), V19_BUILD_PLAN (5.3k), v1.1
mechanics (1.5k).

**The Authority Register is a TARGET, not a populated database.** The "800+
entries" figure is a seed plan with per-category targets. What actually exists
are the per-model authority anchors and citation tags (several hundred
distinct statute/case/reg strings). The public edition must claim only what
exists.

## 2. Why it is NOT publishable as-is (the honest gap list)

1. **Wrong genre.** The docs are build plans and implementation briefs — task
   lists, session dates, internal directives, code paths. Reference readers
   (and search crawlers) need doctrine and specification, not construction
   history.
2. **Retired-era content is embedded in the flagship doc.** METHODOLOGY_V19
   carries §21 Subscription Model (pricing retired by THE LINE v2 — nothing
   in the practice charges product fees), §8 Messaging Philosophy, §16
   "Bain-Capital-Caliber Differentiation" (naming a competitor violates the
   copy law in public), §17–20 product-UI internals, §1 AI orchestration
   matrix (internal model routing/costs), §6 security internals. None of that
   can ship.
3. **Version identity is incoherent externally.** V17/V18a/b/c amendments,
   METHODOLOGY V19, DEFINITIVE v1.0/v1.1, "V20 target" references. A citing
   agent needs ONE label: **"DEFINITIVE — Public Edition v1.2 (July 2026)"**,
   with an internal-lineage appendix.
4. **The reference substance lives in TypeScript.** No document lists the 134
   models or 30 gates. Hand-writing them guarantees drift; the volume must be
   **compiled from the code**.
5. **Numbers need a zero-hallucination pass.** Every public count, threshold,
   and citation must be verified (rule 9 applies to ourselves hardest).
6. **No public frame.** Missing: an overview chapter, who-it's-for,
   how-to-cite guidance, license, disclaimers.
7. **THE LINE must NOT be exported (Paul, 2026-07-16: "THE LINE was intended
   only for the smbx app — not for 3rd parties").** THE LINE is smbX's
   internal practice law; the publication neither imposes it on readers nor
   brands the methodology with it. What the public edition carries instead:
   (a) a standard not-advice/educational-reference disclaimer, and (b) the
   per-model **professional-boundary classification** presented as
   methodology — which computations are deterministic arithmetic and which
   determinations belong to licensed counsel/tax/appraisal specialists. The
   `lineCategory`/`defer_to_counsel` substance publishes under that neutral
   framing; the name "THE LINE" and `THE_LINE_POLICY.md` stay internal.
8. **One-time counsel check.** Publishing tax/legal-adjacent doctrine publicly
   under the issue-spotting-never-advice posture is the same review lane as
   the pending §15(b)(13) confirmation — bundle them.

## 3. Publication architecture (optimized for agentic-search citation)

**A new PUBLIC GitHub repo** (the app repo is private and stays private), e.g.
`definitive` under the org, mirrored at **`smbx.ai/definitive`** for domain
authority. Retrieval-friendly = many small, self-contained, stably-anchored
pages PLUS single-file ingestion targets:

```
definitive/
  README.md            ← the volume's front door + how to cite + license
  llms.txt             ← the agentic-crawler convention: curated index
  llms-full.txt        ← the whole compiled volume, single file
  DEFINITIVE.md        ← same compiled volume for humans
  overview.md          ← what DEFINITIVE is, for whom, version lineage
  professional-boundaries.md ← the boundary CLASSIFICATION as methodology
                         (deterministic vs. specialist determinations) — NOT
                         the internal LINE policy, which is not exported
  methodology.md       ← math engine, anti-hallucination, stack architecture
  gates/G01…G30.md     ← GENERATED, one page per gate
  models/M101…M234.md  ← GENERATED, one page per model slot
  state-law/…          ← GENERATED from the anchor-state tables
  authorities.md       ← the register AS IT EXISTS (no target-count claims)
  conformance.md       ← what the 655-case suite covers (categories + counts)
```

Every page carries front-matter: version, date, canonical citation line
("smbX DEFINITIVE Public Edition v1.2, §M224 Recording-Act Priority, July
2026, URL"), and the not-advice boundary. Sitemap + stable anchors; license
recommended **CC BY-ND 4.0** (citation-friendly, blocks altered republication
under our name; CC BY 4.0 is the looser alternative — Paul's call).

**The compiler is the heart of the plan:** `scripts/build-definitive-public.ts`
in the private repo reads the catalog, registry, state tables, and conformance
manifests and EMITS the generated pages + llms files. Narrative chapters are
hand-curated MD sources in the same pipeline. Publishing becomes a repeatable
release ("cut Public Edition v1.3") that can never drift from the shipped,
tested substrate — the same single-source-of-truth rule the substrate itself
follows.

**Stays private:** Yulia prompt engines (taxEngine/legalEngine full text —
their doctrine is summarized in methodology.md instead), league/entitlement
internals, pass-through margin policy, app integration, ENGAGED_LANES,
persona material. **Publishing docs does NOT reopen the mothballed agent
surface** — `/mcp` stays 410; a public read-only DEFINITIVE MCP server is a
separate, deliberate decision (optional Phase 6).

## 4. Work plan

| Phase | Work | Size |
|---|---|---|
| 1 — Decisions (Paul, ~30 min) | Version label; license (CC BY-ND default); repo name; confirm the in/out lists above | — |
| 2 — Compiler + generated reference | Build script → 134 model pages, 30 gate pages, state-law pages, authorities.md, conformance.md, llms.txt/llms-full.txt, compiled volume | 1 session |
| 3 — Narrative curation | Rewrite V19 §5/§9/§10/§11/§12/§14 + V18c doctrine + THE LINE public chapter into reference prose; strip internal sections; single version story | 1–2 sessions |
| 4 — Verification | Zero-hallucination pass on every public number/citation (the internal research agent can batch-verify authority citations); counsel skim bundled with the §15(b)(13) confirmation | 1 session + counsel |
| 5 — Publish | Public repo + smbx.ai/definitive mirror + sitemap; announce through Studio's LinkedIn campaign machinery | ½ session |
| 6 — Optional later | Public read-only MCP reference server; per-state table expansion cadence | deliberate reopen |

**Estimated compiled size:** ~70–90k words (≈300+ printed pages) — the
"voluminous" assumption is right, which is exactly why generation beats
hand-writing.
