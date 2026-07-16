#!/usr/bin/env npx tsx
/**
 * DEFINITIVE Public Edition compiler (methodology/DEFINITIVE_PUBLIC_EDITION_PLAN.md
 * Phase 2). Reads the LIVE substrate — catalog, registry, state-law tables,
 * conformance manifests — and emits the complete public-repo tree to
 * dist/definitive-public/: scaffold files (CITATION.cff, CHANGELOG, README,
 * licenses, reference/ stubs) + the generated spec (per-gate and per-model
 * pages, state-law tables, authorities, conformance) + llms.txt /
 * llms-full.txt / DEFINITIVE.md single-volume builds.
 *
 * Single source of truth: generated pages can never drift from the shipped,
 * tested code. Publishing = review the output, then copy the tree into
 * github.com/smbx-ai/definitive and push.
 *
 * Public framing rules (Paul, 2026-07-16):
 *  - THE LINE is smbX-internal and is NOT exported. lineCategory publishes as
 *    a neutral "boundary classification" (deterministic computation vs.
 *    specialist determination vs. research scaffold).
 *  - No pricing, no personas, no internal codenames, no competitor names.
 *  - Claim only what exists (authorities = the anchors actually referenced).
 *
 * Run: npx tsx scripts/build-definitive-public.ts
 */
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFINITIVE_DEAL_MECHANICS_CATALOG,
  DEFINITIVE_GATE_EXPANSIONS,
  type DefinitiveModelCatalogEntry,
} from '../server/services/definitiveDealMechanicsCatalog.js';
import { listRegisteredModels } from '../server/services/modelRegistry.js';
import {
  DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES,
} from '../server/services/definitiveConformanceStatus.js';
import {
  BULK_SALES_NOTIFICATION_STATES,
  DEED_COVENANTS,
  DEFER_TO_COUNSEL_TRIGGERS,
  GARN_ST_GERMAIN,
  GROUND_LEASE_FINANCEABILITY,
  LEASE_CONSENT_DEFAULTS,
  LEASE_CONSENT_FALLBACK,
  REAL_PROPERTY_LAW_VERSION,
  RECORDING_ACTS,
  RISK_OF_LOSS,
  RISK_OF_LOSS_DEFAULT,
  SIGNATORY_MATRIX,
  TRANSFER_TAX_REGIMES,
} from '../server/constants/realPropertyLaw.js';

/* ── Release identity ─────────────────────────────────────────────────── */
const PUBLIC_VERSION = '1.0.0';
const DRAFT = true; // review build — strips to false at publish
const RELEASE_DATE = '2026-07-16';
const CANONICAL_HOME = 'https://definitive.smbx.ai';
const REPO_URL = 'https://github.com/smbx-ai/definitive';
const TITLE = 'DEFINITIVE M&A Specification';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../dist/definitive-public');

const draftBanner = DRAFT
  ? '> **DRAFT — internal review build. Not yet published; do not cite.**\n\n'
  : '';

function fm(title: string, section: string): string {
  return `---
title: "${title}"
spec: "${TITLE}"
version: "${PUBLIC_VERSION}${DRAFT ? '-draft' : ''}"
date: "${RELEASE_DATE}"
section: "${section}"
canonical: "${CANONICAL_HOME}"
license: "CC BY 4.0 (spec text) / MIT (code)"
cite-as: "${TITLE} v${PUBLIC_VERSION}, ${section} (smbX, ${RELEASE_DATE.slice(0, 4)}), ${CANONICAL_HOME}"
---

${draftBanner}`;
}

/* ── Neutral boundary-classification labels (never "THE LINE") ────────── */
const BOUNDARY: Record<string, string> = {
  deterministic: 'Deterministic computation — arithmetic and rule application on supplied facts.',
  professional_handoff: 'Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.',
  research_only: 'Research scaffold — organizes authorities and considerations; not an executable determination.',
  reserved: 'Reserved slot — allocated, not yet specified.',
};

const STATUS_LABEL: Record<string, string> = {
  v1_0_core: 'Core (since spec v1.0 internal lineage)',
  v1_1: 'Added in internal lineage v1.1',
  v1_1_research: 'Research addition (internal lineage v1.1)',
  v1_2: 'Added in internal lineage v1.2 (real property & contract law layer)',
  v1_2_research: 'Research addition (internal lineage v1.2)',
  reserved: 'Reserved',
};

/* ── Load the substrate ───────────────────────────────────────────────── */
const catalog = DEFINITIVE_DEAL_MECHANICS_CATALOG;
const registry = new Map(listRegisteredModels().map(m => [m.modelId, m]));
const gateIds = [...new Set(catalog.flatMap(e => e.gates))].sort(
  (a, b) => Number(a.slice(1)) - Number(b.slice(1)),
);
const modelsByGate = new Map<string, DefinitiveModelCatalogEntry[]>();
for (const e of catalog) for (const g of e.gates) {
  if (!modelsByGate.has(g)) modelsByGate.set(g, []);
  modelsByGate.get(g)!.push(e);
}
const expansions = new Map(DEFINITIVE_GATE_EXPANSIONS.map(g => [g.gateId, g]));

const authoritySet = new Set<string>();
for (const e of catalog) for (const a of e.authorityAnchors) authoritySet.add(a.trim());
for (const m of registry.values()) for (const t of m.citationTags ?? []) authoritySet.add(String(t).replace(/^\[|\]$/g, '').trim());
const authorities = [...authoritySet].filter(Boolean).sort((a, b) => a.localeCompare(b));

/* ── Page builders ────────────────────────────────────────────────────── */

function modelPage(e: DefinitiveModelCatalogEntry): string {
  const reg = e.implementedRuntimeModelId ? registry.get(e.implementedRuntimeModelId) : null;
  const lines: string[] = [];
  lines.push(fm(`${e.slotId} — ${e.name}`, `§${e.slotId}`));
  lines.push(`# ${e.slotId} — ${e.name}\n`);
  lines.push(`**Boundary classification.** ${BOUNDARY[e.lineCategory] ?? e.lineCategory}\n`);
  lines.push(`**Lineage.** ${STATUS_LABEL[e.status] ?? e.status}.\n`);
  lines.push(`**Gates.** ${e.gates.join(', ')}\n`);
  if (e.dealTypes.length) lines.push(`**Deal contexts.** ${e.dealTypes.join(' · ')}\n`);
  lines.push(`## Computation\n\n${e.deterministicComputation}\n`);
  if (e.authorityAnchors.length) {
    lines.push(`## Authorities\n\n${e.authorityAnchors.map(a => `- ${a}`).join('\n')}\n`);
  }
  if (reg) {
    lines.push(`## Reference implementation\n`);
    lines.push(`Implemented as \`${reg.modelId}\` (${reg.name}).`);
    lines.push(`\n**Required inputs:** ${reg.requiredInputs.map(i => `\`${i}\``).join(', ')}\n`);
    if (reg.description) lines.push(`${reg.description}\n`);
  } else if (e.implementedRuntimeModelId) {
    lines.push(`## Reference implementation\n\nImplemented as \`${e.implementedRuntimeModelId}\`.\n`);
  }
  if (e.notes) lines.push(`## Notes\n\n${e.notes}\n`);
  return lines.join('\n');
}

function gatePage(gateId: string): string {
  const exp = expansions.get(gateId as any);
  const models = modelsByGate.get(gateId) ?? [];
  const lines: string[] = [];
  const name = exp?.name ?? `Gate ${gateId}`;
  lines.push(fm(`${gateId} — ${name}`, `§${gateId}`));
  lines.push(`# ${gateId} — ${name}\n`);
  if (exp) {
    lines.push(`${exp.purpose}\n`);
    lines.push(`## Trigger conditions\n\n${exp.triggerSummary.map(t => `- ${t}`).join('\n')}\n`);
    lines.push(`## Boundary notes\n\n${exp.lineNotes}\n`);
  } else {
    lines.push(`> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.\n`);
  }
  lines.push(`## Models routed through ${gateId}\n`);
  lines.push('| Slot | Model | Classification |');
  lines.push('|---|---|---|');
  for (const m of models) lines.push(`| ${m.slotId} | ${m.name} | ${m.lineCategory.replace(/_/g, ' ')} |`);
  lines.push('');
  return lines.join('\n');
}

function statLawPage(): string {
  const L: string[] = [];
  L.push(fm('Anchor-State Law Tables — Real Property', '§State-Law'));
  L.push(`# Anchor-State Law Tables — Real Property & Contract Law\n`);
  L.push(`Table version: \`${REAL_PROPERTY_LAW_VERSION}\`. Anchor states DE / NY / CA / TX; other states are added as data rows. Where a state is not tabled, the specification's models emit a table-gap flag rather than guessing.\n`);

  L.push(`## Recording acts\n`);
  L.push('| State | Type | Citation | Note |');
  L.push('|---|---|---|---|');
  for (const [st, r] of Object.entries(RECORDING_ACTS)) L.push(`| ${st} | ${r.type.replace('_', '-')} | ${r.citation} | ${r.note ?? ''} |`);

  L.push(`\n## Risk of loss between signing and closing\n`);
  L.push('| State | Regime | Citation |');
  L.push('|---|---|---|');
  for (const [st, r] of Object.entries(RISK_OF_LOSS)) L.push(`| ${st} | ${r.regime.replace(/_/g, ' ')} | ${r.citation} |`);
  L.push(`| (default) | ${RISK_OF_LOSS_DEFAULT.regime.replace(/_/g, ' ')} | ${RISK_OF_LOSS_DEFAULT.citation} |`);

  L.push(`\n## Deed types and title covenants\n`);
  L.push('| Deed type | Covenants | Scope | After-acquired title |');
  L.push('|---|---|---|---|');
  for (const [d, r] of Object.entries(DEED_COVENANTS)) L.push(`| ${d.replace(/_/g, ' ')} | ${r.covenants.length ? r.covenants.join(', ') : '—'} | ${r.scope.replace(/_/g, ' ')} | ${r.afterAcquiredTitle ? 'yes' : 'no'} |`);

  L.push(`\n## Concurrent ownership — signatory requirements\n`);
  L.push('| Vesting | Who must sign | Gap risk |');
  L.push('|---|---|---|');
  for (const [v, r] of Object.entries(SIGNATORY_MATRIX)) L.push(`| ${v.replace(/_/g, ' ')} | ${r.required} | ${r.gapRisk} |`);

  L.push(`\n## Lease consent standards (consent required, no standard stated)\n`);
  L.push('| State | Default | Citation |');
  L.push('|---|---|---|');
  for (const [st, r] of Object.entries(LEASE_CONSENT_DEFAULTS)) L.push(`| ${st} | ${r.whenConsentRequiredNoStandard.replace(/_/g, ' ')} | ${r.citation} |`);
  L.push(`| (other) | ${LEASE_CONSENT_FALLBACK.whenConsentRequiredNoStandard.replace(/_/g, ' ')} | ${LEASE_CONSENT_FALLBACK.citation} |`);

  L.push(`\n## Transfer tax and reassessment regimes\n`);
  L.push('| State | Deed tax | Controlling-interest tax | Threshold | Aggregation | Reassessment on control change | Citation |');
  L.push('|---|---|---|---|---|---|---|');
  for (const [st, r] of Object.entries(TRANSFER_TAX_REGIMES)) {
    L.push(`| ${st} | ${r.deedTax ? 'yes' : 'no'} | ${r.controllingInterestTax ? 'yes' : 'no'} | ${r.controllingInterestThresholdPct != null ? `≥${r.controllingInterestThresholdPct}%` : '—'} | ${r.aggregationYears != null ? `${r.aggregationYears} yr` : '—'} | ${r.reassessmentOnControlChange ? 'yes' : 'no'} | ${r.citation} |`);
  }

  L.push(`\n## Due-on-sale — federal overlay\n`);
  L.push(`${GARN_ST_GERMAIN.citation}: consumer transfer protections apply only to residential real property of fewer than ${GARN_ST_GERMAIN.residentialUnitCeiling} dwelling units. Protected transfer kinds:\n`);
  for (const k of GARN_ST_GERMAIN.protectedTransferKinds) L.push(`- ${k.replace(/_/g, ' ')}`);

  L.push(`\n## Ground-lease financeability thresholds\n`);
  L.push(`Minimum remaining term beyond loan maturity: ${GROUND_LEASE_FINANCEABILITY.minRemainingTermBeyondLoanMaturityYears} years (institutional standards run 20–25). Required protections: ${GROUND_LEASE_FINANCEABILITY.requiredProtections.map(p => p.replace(/_/g, ' ')).join('; ')}.\n`);
  L.push(GROUND_LEASE_FINANCEABILITY.note + '\n');

  L.push(`## Bulk-sales / tax-clearance notification states\n`);
  L.push('| State | Regime |');
  L.push('|---|---|');
  for (const [st, r] of Object.entries(BULK_SALES_NOTIFICATION_STATES)) L.push(`| ${st} | ${r} |`);

  L.push(`\n## Professional-determination boundaries (real property)\n`);
  L.push(`The following questions are legal determinations. Conforming implementations classify and route them to licensed counsel; they do not answer them:\n`);
  for (const t of DEFER_TO_COUNSEL_TRIGGERS) L.push(`- **${t.id}** — ${t.trigger}`);
  L.push('');
  return L.join('\n');
}

/* ── Narrative chapters (DRAFT — hand-curated at publish) ─────────────── */

const OVERVIEW = `${fm('Overview', '§Overview')}# ${TITLE} — Overview

DEFINITIVE is an open, versioned specification for the deterministic mechanics
of mergers and acquisitions: the computations, classifications, routing gates,
and authority citations that govern how a transaction's quantitative and
rule-driven questions are answered. It spans valuation normalization, quality
of earnings, financing and DSCR mechanics, purchase-price allocation, tax and
reorganization structure, distressed and restructuring waterfalls, capital
structure and liability management, IP transfer mechanics, and a real
property & contract law layer with anchor-state law encoded as data.

The specification is organized as:

- **${catalog.length} model slots** (M101–M234) — each a named computation or
  classification with a boundary classification, gate routing, deal contexts,
  authority anchors, and (for most) a reference implementation binding
- **A 30-gate routing framework** — the conditions under which model families
  activate for a given transaction. G28–G30 are fully specified in this
  volume; ${gateIds.length} gates carry catalog-routed models today, and the
  complete gate registry (names and trigger narratives for the remainder) is
  pending curation for publication
- **Anchor-state law tables** — statutory variation (recording acts, risk of
  loss, transfer tax, lease consent) encoded as per-state data, never as
  hidden branching logic
- **A conformance suite** — ${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT} cases
  (${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT} model-runtime) that a
  conforming implementation must pass

Three design rules run through everything. **Determinism**: a model computes
from supplied facts and cited constants — same inputs, same outputs, no
estimation dressed as calculation. **Data over logic**: jurisdictional
variation lives in versioned lookup tables; an implementation confronted with
an untabled jurisdiction must surface the gap rather than guess. **Boundary
honesty**: every model declares whether it is arithmetic, a schedule feeding a
licensed professional's determination, or a research scaffold — and
conforming implementations route accordingly.

DEFINITIVE is published for practitioners, tool builders, and AI agents that
need a citable, versioned reference for M&A deal mechanics.

## What this specification is not

This specification is an educational and engineering reference. It is not
legal, tax, accounting, investment, or appraisal advice; it renders no
opinions; and nothing in it creates a professional relationship. Questions it
classifies as specialist determinations belong to licensed professionals.
`;

const BOUNDARIES = `${fm('Professional Boundaries', '§Boundaries')}# Professional-Boundary Classification

Every model slot in this specification carries one of three boundary
classifications. The classification is part of the specification itself —
implementations that surface DEFINITIVE computations are expected to preserve
it.

**Deterministic computation.** Arithmetic and rule application on supplied
facts and cited constants. Examples: a §1060 seven-class allocation, a DSCR
stress grid, recording-act priority ordering given a state's statute and the
recording facts. These produce answers.

**Deterministic schedules with a specialist boundary.** The model computes
real schedules — a three-prong solvency table, a marketability triage of
title exceptions, a lease consent-path classification — but the *governing
determination* (Is this transfer a fraudulent conveyance? Is title
marketable? Is this clause enforceable?) is a legal, tax, accounting,
appraisal, or judicial conclusion that belongs to a licensed professional.
These models produce the workpapers and the routing, never the conclusion.

**Research scaffolds.** Organized authorities and considerations for areas
where rulemaking or market practice is still moving. These produce oriented
reading, not determinations.

The specification also publishes explicit **professional-determination
boundary catalogs** (for example, the ten real-property triggers in the
state-law chapter): questions that a conforming implementation must classify
and route rather than answer. This is a correctness feature, not a
disclaimer — a system that answers an enforceability question has not
implemented the specification; it has violated it.
`;

const METHODOLOGY = `${fm('Methodology', '§Methodology')}# Methodology

**Zero-hallucination architecture.** Financial figures are extracted or
supplied, never invented; monetary values are integer cents; every published
constant carries a citation anchor; models that lack a required input return
a named missing-input list instead of a guess.

**Model anatomy.** A model slot specifies: identity (slot + name), boundary
classification, gate routing, deal contexts, authority anchors, a
deterministic-computation description, and — where implemented — a reference
binding with required inputs. Implementations execute models as pure
functions over a supplied input record and emit outputs plus an audit payload
(spec version, input/output hashes, timestamps).

**Gate routing.** Transactions activate model families through gates —
predicates over deal facts (asset vs. entity form, distress markers, real
property share of enterprise value, regulated-industry flags). Gates make
coverage inspectable: for a given transaction shape, the set of applicable
models is enumerable in advance.

**Jurisdictional data tables.** Where the law varies by state, the variation
is a versioned data table (see the state-law chapter). Adding a jurisdiction
is a data change with its own conformance cases, not a code change. Unknown
jurisdictions produce explicit table-gap flags.

**Conformance.** The specification ships with a
${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT}-case conformance suite
(${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT} model-runtime cases across
${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES.length} categories).
Expected values are derived from the governing authorities independently of
any implementation. A conforming implementation passes all cases and never
emits an answer to a question the specification classifies as a specialist
determination.
`;

/* ── Scaffold files (per Paul's instruction, 2026-07-16) ──────────────── */

const CITATION_CFF = `cff-version: 1.2.0
message: "If you use or cite this specification, please cite it as below."
title: "${TITLE}"
version: ${PUBLIC_VERSION}
date-released: "${RELEASE_DATE}"
url: "${CANONICAL_HOME}"
repository-code: "${REPO_URL}"
license: CC-BY-4.0
authors:
  - family-names: Baker
    given-names: Paul
`;

const CHANGELOG = `# Changelog

## v${PUBLIC_VERSION} — ${RELEASE_DATE}${DRAFT ? ' (DRAFT — unpublished review build)' : ''}

Initial public release: ${catalog.length} model slots across 30 gates,
anchor-state law tables (DE/NY/CA/TX), authority register as referenced
(${authorities.length} distinct anchors), and the
${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT}-case conformance manifest.
`;

const ROOT_README = `# ${TITLE}

${draftBanner}DEFINITIVE is an open, versioned specification for M&A deal
mechanics — the deterministic computations, boundary classifications, routing
gates, jurisdictional data tables, and authority citations that govern how a
transaction's quantitative and rule-driven questions are answered. It covers
valuation normalization through tax and reorganization structure, distressed
waterfalls, capital-structure mechanics, IP transfer, and a real property &
contract law layer, with ${catalog.length} model slots, 30 gates, and a
${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT}-case conformance suite.

**Canonical home:** ${CANONICAL_HOME}
**Start here:** [\`spec/README.md\`](spec/README.md) (index) · [\`DEFINITIVE.md\`](DEFINITIVE.md) (single-file volume) · [\`llms.txt\`](llms.txt) (agent index)

## How to cite

> ${TITLE} v${PUBLIC_VERSION} (smbX, ${RELEASE_DATE.slice(0, 4)}). ${CANONICAL_HOME}

Per-section citation lines appear in each page's front matter. Machine-readable
citation metadata: [\`CITATION.cff\`](CITATION.cff).

## Licensing

- **Specification text** (\`spec/\`, \`DEFINITIVE.md\`, \`llms*.txt\`):
  [CC BY 4.0](LICENSE-SPEC) — reuse with attribution.
- **Code** (\`reference/\`, tooling): [MIT](LICENSE).

## Not advice

This specification is an educational and engineering reference. It is not
legal, tax, accounting, investment, or appraisal advice, and it renders no
opinions. Questions it classifies as specialist determinations belong to
licensed professionals.
`;

const LICENSE_MIT = `MIT License

Copyright (c) ${RELEASE_DATE.slice(0, 4)} smbX

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const LICENSE_SPEC = `Creative Commons Attribution 4.0 International (CC BY 4.0)

The specification text in this repository (the contents of spec/,
DEFINITIVE.md, llms.txt, and llms-full.txt) is licensed under the Creative
Commons Attribution 4.0 International License.

You are free to share (copy and redistribute the material in any medium or
format) and adapt (remix, transform, and build upon the material) for any
purpose, even commercially, under the following terms: you must give
appropriate credit ("${TITLE} v${PUBLIC_VERSION}, smbX, ${CANONICAL_HOME}"),
provide a link to the license, and indicate if changes were made. You may not
apply legal terms or technological measures that legally restrict others from
doing anything the license permits. No warranties are given.

Full legal code: https://creativecommons.org/licenses/by/4.0/legalcode
Human-readable summary: https://creativecommons.org/licenses/by/4.0/
`;

const REF_TS_README = `# DEFINITIVE reference implementation — TypeScript

Reference implementation of the ${TITLE} (v${PUBLIC_VERSION}).
Scaffold — implementation lands with the spec's conformance harness.

License: MIT.
`;

const REF_PY_README = `# DEFINITIVE reference implementation — Python

Reference implementation of the ${TITLE} (v${PUBLIC_VERSION}).
Scaffold — implementation lands with the spec's conformance harness.

License: MIT.
`;

/* ── Emit ─────────────────────────────────────────────────────────────── */

rmSync(OUT, { recursive: true, force: true });
for (const dir of ['', 'spec', 'spec/gates', 'spec/models', 'spec/state-law', 'reference/ts', 'reference/python']) {
  mkdirSync(path.join(OUT, dir), { recursive: true });
}
const write = (rel: string, content: string) => writeFileSync(path.join(OUT, rel), content);

write('CITATION.cff', CITATION_CFF);
write('CHANGELOG.md', CHANGELOG);
write('README.md', ROOT_README);
write('LICENSE', LICENSE_MIT);
write('LICENSE-SPEC', LICENSE_SPEC);
write('reference/ts/README.md', REF_TS_README);
write('reference/ts/package.json', JSON.stringify({ name: '@definitive-spec/reference', version: PUBLIC_VERSION, private: true, description: `Reference implementation of the ${TITLE}`, license: 'MIT' }, null, 2) + '\n');
write('reference/python/README.md', REF_PY_README);
write('reference/python/pyproject.toml', `[project]\nname = "definitive-spec-reference"\nversion = "${PUBLIC_VERSION}"\ndescription = "Reference implementation of the ${TITLE}"\nlicense = { text = "MIT" }\n`);

write('spec/overview.md', OVERVIEW);
write('spec/professional-boundaries.md', BOUNDARIES);
write('spec/methodology.md', METHODOLOGY);
write('spec/state-law/real-property.md', statLawPage());

for (const g of gateIds) write(`spec/gates/${g.length === 2 ? g[0] + '0' + g[1] : g}.md`, gatePage(g));
for (const e of catalog) write(`spec/models/${e.slotId}.md`, modelPage(e));

/* authorities */
{
  const L: string[] = [fm('Authority Register (as referenced)', '§Authorities')];
  L.push(`# Authority Register — as referenced\n`);
  L.push(`The ${authorities.length} distinct statutes, regulations, cases, forms, and market-practice anchors referenced by the specification's model slots and reference implementations. This register lists what the specification actually cites — nothing aspirational.\n`);
  for (const a of authorities) L.push(`- ${a}`);
  L.push('');
  write('spec/authorities.md', L.join('\n'));
}

/* conformance */
{
  const L: string[] = [fm('Conformance', '§Conformance')];
  L.push(`# Conformance\n`);
  L.push(`A conforming implementation passes the DEFINITIVE conformance suite: **${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT} cases**, of which **${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT} are model-runtime cases** across ${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES.length} categories:\n`);
  for (const c of DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES) L.push(`- ${String(c).replace(/_/g, ' ')}`);
  L.push(`\nExpected values are derived from the governing authorities independently of any implementation. Two properties are blocking: numeric outputs must match exactly, and no case may elicit an answer to a question the specification classifies as a specialist determination.\n`);
  write('spec/conformance.md', L.join('\n'));
}

/* lineage */
{
  const L: string[] = [fm('Version Lineage', '§Lineage')];
  L.push(`# Version Lineage\n`);
  L.push(`Public versions restart at v1.0.0. Internal lineage, for readers of earlier private materials:\n`);
  L.push(`| Internal | Content | Public disposition |`);
  L.push(`|---|---|---|`);
  L.push(`| Methodology V17–V19 | Math engine, tax engine (post-OBBBA), legal frameworks, model catalog, stack architecture, anti-hallucination | Curated into Overview/Methodology chapters |`);
  L.push(`| DEFINITIVE v1.0 → v1.1 | 38→123-slot catalog, gates G28–G30 | Model and gate chapters |`);
  L.push(`| V18c (2026-07) | Real property & contract law layer, M224–M234, anchor-state tables | Model chapter + state-law tables |`);
  L.push(`| Conformance | ${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT}-case suite | Conformance chapter |`);
  L.push('');
  write('spec/lineage.md', L.join('\n'));
}

/* spec index */
{
  const L: string[] = [fm('Specification Index', '§Index')];
  L.push(`# ${TITLE} v${PUBLIC_VERSION} — Index\n`);
  L.push(`1. [Overview](overview.md)`);
  L.push(`2. [Professional-Boundary Classification](professional-boundaries.md)`);
  L.push(`3. [Methodology](methodology.md)`);
  L.push(`4. Gates — G1–G30 ([directory](gates/))`);
  L.push(`5. Models — ${catalog.length} slots, M101–M234 ([directory](models/))`);
  L.push(`6. [Anchor-State Law Tables](state-law/real-property.md)`);
  L.push(`7. [Authority Register](authorities.md) (${authorities.length} anchors)`);
  L.push(`8. [Conformance](conformance.md) (${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT} cases)`);
  L.push(`9. [Version Lineage](lineage.md)`);
  L.push('');
  write('spec/README.md', L.join('\n'));
}

/* single volume + llms files */
{
  const vol: string[] = [];
  vol.push(`# ${TITLE} — v${PUBLIC_VERSION}${DRAFT ? ' (DRAFT — internal review build)' : ''}\n`);
  vol.push(`Released ${RELEASE_DATE} · ${CANONICAL_HOME} · License: CC BY 4.0 (text) / MIT (code)\n`);
  const strip = (s: string) => s.replace(/^---[\s\S]*?---\n\n/, '');
  vol.push(strip(OVERVIEW));
  vol.push('\n---\n');
  vol.push(strip(BOUNDARIES));
  vol.push('\n---\n');
  vol.push(strip(METHODOLOGY));
  vol.push('\n---\n\n# Gates\n');
  for (const g of gateIds) vol.push(strip(gatePage(g)));
  vol.push('\n---\n\n# Model Catalog\n');
  for (const e of catalog) vol.push(strip(modelPage(e)));
  vol.push('\n---\n');
  vol.push(strip(statLawPage()));
  vol.push('\n---\n\n# Authority Register (as referenced)\n');
  vol.push(authorities.map(a => `- ${a}`).join('\n') + '\n');
  vol.push('\n---\n\n# Conformance\n');
  vol.push(`${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT} cases (${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT} model-runtime) across ${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES.length} categories.\n`);
  const volume = vol.join('\n');
  write('DEFINITIVE.md', volume);
  write('llms-full.txt', volume);

  const llms: string[] = [];
  llms.push(`# ${TITLE}\n`);
  llms.push(`> Open, versioned specification for M&A deal mechanics: ${catalog.length} model slots, 30 gates, anchor-state law tables, ${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT}-case conformance suite. v${PUBLIC_VERSION} (${RELEASE_DATE}). Educational/engineering reference — not legal, tax, accounting, investment, or appraisal advice.\n`);
  llms.push(`## Core\n`);
  llms.push(`- [Overview](${CANONICAL_HOME}/spec/overview): what DEFINITIVE is and its three design rules`);
  llms.push(`- [Professional boundaries](${CANONICAL_HOME}/spec/professional-boundaries): deterministic vs. specialist-determination classification`);
  llms.push(`- [Methodology](${CANONICAL_HOME}/spec/methodology): zero-hallucination architecture, model anatomy, gates, data tables, conformance`);
  llms.push(`- [State-law tables](${CANONICAL_HOME}/spec/state-law/real-property): recording acts, risk of loss, transfer tax, lease consent (DE/NY/CA/TX)`);
  llms.push(`- [Authorities](${CANONICAL_HOME}/spec/authorities): ${authorities.length} referenced anchors`);
  llms.push(`- [Conformance](${CANONICAL_HOME}/spec/conformance): ${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT} cases`);
  llms.push(`\n## Reference\n`);
  llms.push(`- Gates G1–G30: ${CANONICAL_HOME}/spec/gates/`);
  llms.push(`- Models M101–M234: ${CANONICAL_HOME}/spec/models/`);
  llms.push(`- Full volume, single file: ${CANONICAL_HOME}/llms-full.txt`);
  llms.push('');
  write('llms.txt', llms.join('\n'));
}

const modelCount = catalog.length;
console.log(`DEFINITIVE public tree built at ${OUT}`);
console.log(`  models: ${modelCount}, gates: ${gateIds.length}, authorities: ${authorities.length}`);
console.log(`  conformance: ${DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT} (${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT} model-runtime)`);
