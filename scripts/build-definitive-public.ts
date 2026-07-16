#!/usr/bin/env npx tsx
/**
 * DEFINITIVE Public Edition compiler v2 — punch-list build
 * (methodology/DEFINITIVE_PUBLIC_EDITION_PLAN.md + Paul's Publication Punch
 * List, 2026-07-16). Emits the publishable tree for
 * github.com/smbx-ai/definitive to dist/definitive-public/.
 *
 * v2 upgrades (punch list §§1–9):
 *  - Two-tier structure: Tier 1 Normative (reference-implementation binding,
 *    ten-section contract template) vs Tier 2 Catalog (informative).
 *  - EMPIRICAL extraction: every bound model is EXECUTED against its
 *    conformance fixtures — input/output contracts, worked examples, error
 *    semantics, and conformance bindings come from real runs, never hand
 *    authoring (§2.2, §2.3, §2.6, §2.7, §2.9).
 *  - Deal-fact data dictionary unioned from observed model inputs (§4).
 *  - Conformance publication: case-format schema, harness contract, REQ
 *    numbering, and the model-runtime cases shipped into the tree (§5).
 *  - Authority normalization: case-variant dedupe, type classification,
 *    practice-norm relabeling, provisional stable AUTH ids (§6; real
 *    authority_register export runs where the DB lives).
 *  - Machine companion: spec.json + per-model JSON Schemas + gates.json (§7).
 *  - Canonical count block injected everywhere (§9).
 *  - Draft mode: single banner + GAP_LEDGER.md. Publish mode (--publish):
 *    no banners, and the build FAILS on any editorial gap (§8).
 *  - Internal lineage notes stripped to dist/definitive-internal/
 *    INTERNAL_SLOT_CROSSWALK.md (§8).
 *
 * Run: npx tsx scripts/build-definitive-public.ts [--publish]
 */
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFINITIVE_DEAL_MECHANICS_CATALOG,
  DEFINITIVE_GATE_EXPANSIONS,
  type DefinitiveModelCatalogEntry,
} from '../server/services/definitiveDealMechanicsCatalog.js';
import { listRegisteredModels } from '../server/services/modelRegistry.js';
import { executeV19Model } from '../server/services/v19ModelRuntime.js';
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
import {
  AUTHORITY_MERGES,
  AUTHORITY_TYPES,
  ENUMS,
  GOVERNING_RULE,
  MODEL_OVERLAYS,
  type ConstantSpec,
  type FieldSpec as OverlayFieldSpec,
  type ModelOverlay,
} from './definitivePublicOverlay.js';

/* ── Release identity ─────────────────────────────────────────────────── */
const PUBLISH = process.argv.includes('--publish');
const PUBLIC_VERSION = '1.0.0';
const DRAFT = !PUBLISH;
const RELEASE_DATE = '2026-07-16';
const CANONICAL_HOME = 'https://definitive.smbx.ai';
const REPO_URL = 'https://github.com/smbx-ai/definitive';
const TITLE = 'DEFINITIVE M&A Specification';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../dist/definitive-public');
const OUT_INTERNAL = path.resolve(__dirname, '../dist/definitive-internal');
const gaps: string[] = [];
const gap = (s: string) => { gaps.push(s); };

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

`;
}

const BANNER = DRAFT ? '> **DRAFT — internal review build. Not yet published; do not cite.**\n\n' : '';

/* ── Substrate load ───────────────────────────────────────────────────── */
const catalog = DEFINITIVE_DEAL_MECHANICS_CATALOG;
const registry = new Map(listRegisteredModels().map(m => [m.modelId, m]));
const expansions = new Map(DEFINITIVE_GATE_EXPANSIONS.map(g => [g.gateId, g]));
const gateIds = [...new Set(catalog.flatMap(e => e.gates))].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
const modelsByGate = new Map<string, DefinitiveModelCatalogEntry[]>();
for (const e of catalog) for (const g of e.gates) {
  if (!modelsByGate.has(g)) modelsByGate.set(g, []);
  modelsByGate.get(g)!.push(e);
}

/* ── Tiering (§1) ─────────────────────────────────────────────────────── */
type Tier = 'normative' | 'catalog' | 'reserved';
function tierOf(e: DefinitiveModelCatalogEntry): Tier {
  if (e.status === 'reserved' || e.lineCategory === 'reserved') return 'reserved';
  if (e.implementedRuntimeModelId && e.lineCategory !== 'research_only') return 'normative';
  return 'catalog';
}
const TIER_LABEL: Record<Tier, string> = {
  normative: `Normative (v${PUBLIC_VERSION})`,
  catalog: 'Catalog (informative) — normative specification scheduled',
  reserved: 'Reserved',
};

const BOUNDARY: Record<string, string> = {
  deterministic: 'Deterministic computation — arithmetic and rule application on supplied facts.',
  professional_handoff: 'Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.',
  research_only: 'Research scaffold — organizes authorities and considerations; not an executable determination.',
  reserved: 'Reserved slot — allocated, not yet specified.',
};

/* ── Conformance fixtures + empirical extraction (§2) ─────────────────── */
interface Fixture { id: string; title: string; modelId: string; input: Record<string, any>; expect: { status: string; outputs?: Record<string, any>; missingInputsIncludes?: string[] } }
const fixtures: Fixture[] = JSON.parse(readFileSync(path.resolve(__dirname, '../testing/definitive/conformance/v1/model-runtime.cases.json'), 'utf8'));
const fixturesByModel = new Map<string, Fixture[]>();
for (const f of fixtures) {
  if (!fixturesByModel.has(f.modelId)) fixturesByModel.set(f.modelId, []);
  fixturesByModel.get(f.modelId)!.push(f);
}

function inferType(key: string, v: unknown): string {
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') {
    if (/_cents$/.test(key) && Number.isInteger(v)) return 'integer (cents)';
    if (Number.isInteger(v)) return 'integer';
    return 'number';
  }
  if (typeof v === 'string') return /_date$/.test(key) ? 'string (ISO date)' : 'string';
  if (Array.isArray(v)) return v.length && typeof v[0] === 'object' ? 'object[]' : `${v.length ? typeof v[0] : 'any'}[]`;
  if (v === null) return 'null';
  if (typeof v === 'object') return 'object';
  return typeof v;
}

interface FieldSpec { type: Set<string>; required: boolean }
interface Extraction {
  inputs: Map<string, FieldSpec>;
  outputs: Map<string, Set<string>>;
  workedExample: { fixture: Fixture; actualOutputs: Record<string, any> } | null;
  missingInputFormat: string[];
  caseIds: string[];
  deferCapable: boolean;
}
const extractions = new Map<string, Extraction>();

async function extractModel(modelId: string, requiredInputs: string[]): Promise<Extraction> {
  const fx = fixturesByModel.get(modelId) ?? [];
  const ex: Extraction = {
    inputs: new Map(), outputs: new Map(), workedExample: null,
    missingInputFormat: [], caseIds: fx.map(f => f.id), deferCapable: false,
  };
  for (const r of requiredInputs) ex.inputs.set(r, { type: new Set(), required: true });
  for (const f of fx) {
    for (const [k, v] of Object.entries(f.input)) {
      if (!ex.inputs.has(k)) ex.inputs.set(k, { type: new Set(), required: false });
      ex.inputs.get(k)!.type.add(inferType(k, v));
    }
    try {
      const run = await executeV19Model({ modelId, input: f.input });
      if (run.status === 'complete') {
        for (const [k, v] of Object.entries(run.outputs)) {
          if (!ex.outputs.has(k)) ex.outputs.set(k, new Set());
          ex.outputs.get(k)!.add(inferType(k, v));
        }
        if (run.outputs.defer_to_counsel !== undefined) ex.deferCapable = true;
        if (!ex.workedExample && Object.keys(run.outputs).length > 0 && f.expect.status === 'complete') {
          ex.workedExample = { fixture: f, actualOutputs: run.outputs };
        }
      }
    } catch { /* extraction is best-effort per fixture */ }
  }
  try {
    const empty = await executeV19Model({ modelId, input: {} });
    ex.missingInputFormat = empty.missingInputs;
  } catch { /* ignore */ }
  return ex;
}

/* ── Authority normalization (§6) ─────────────────────────────────────── */
const AUTH_CANON: Record<string, string> = {
  'Kendall v. Ernest Pestana, 40 Cal.3d 488': 'Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985)',
  'Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985)': 'Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985)',
  'ABA Deal Points': 'ABA Private Target Deal Points Study',
  'ABA Private Target Deal Points Study 2023': 'ABA Private Target Deal Points Study',
};
function canonAuthority(raw: string): string {
  const s = raw.replace(/^\[|\]$/g, '').trim();
  const first = AUTH_CANON[s] ?? s;
  // Authored de-dup map (§7): collapse case-variant twins + shorthand/containment.
  return AUTHORITY_MERGES[first] ?? first;
}
function classifyAuthority(a: string): string {
  // Hand-tagged overrides (§7) win over the heuristic classifier.
  if (AUTHORITY_TYPES[a]) return AUTHORITY_TYPES[a];
  if (/practice-norm/.test(a)) return 'practice-norm';
  if (/Rev\. Proc|Rev\. Rul|IRS Notice|Priv\. Ltr|PLR/i.test(a)) return 'guidance';
  if (/v\.|In re|Matter of|\d+ Cal\.|\d+ F\.|Trib\./i.test(a)) return 'case';
  if (/Treas\. Reg|C\.F\.R|Reg\./i.test(a)) return 'regulation';
  if (/IRC|U\.S\.C|Code|Stat|DGCL|UCC|Law §|§|Act\b|Const/i.test(a)) return 'statute';
  if (/Form|Schedule/i.test(a)) return 'form';
  if (/Study|Survey|Damodaran|Kroll|Pepperdine|FRED|Publication|Pub\./i.test(a)) return 'study/dataset';
  return 'practice-or-guidance';
}
const authoritySet = new Set<string>();
for (const e of catalog) for (const a of e.authorityAnchors) authoritySet.add(canonAuthority(a));
for (const m of registry.values()) for (const t of m.citationTags ?? []) authoritySet.add(canonAuthority(String(t)));
const authorities = [...authoritySet].filter(Boolean).sort((a, b) => a.localeCompare(b));
const authId = new Map(authorities.map((a, i) => [a, `AUTH-${String(i + 1).padStart(4, '0')}`]));
// §7 acceptance: build FAILS on two register rows with identical normalized names.
{
  const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const byNorm = new Map<string, string[]>();
  for (const a of authorities) {
    const k = normKey(a);
    if (!byNorm.has(k)) byNorm.set(k, []);
    byNorm.get(k)!.push(a);
  }
  for (const [, variants] of byNorm) {
    if (variants.length > 1) gap(`Authority Register: duplicate normalized rows — ${variants.map(v => `"${v}"`).join(' / ')} — add a merge to AUTHORITY_MERGES`);
  }
}

/* ── Canonical counts (§9) ────────────────────────────────────────────── */
const tierCounts = { normative: 0, catalog: 0, reserved: 0 } as Record<Tier, number>;
for (const e of catalog) tierCounts[tierOf(e)]++;
const COUNTS = {
  slots: catalog.length,
  normative: tierCounts.normative,
  catalogTier: tierCounts.catalog,
  reserved: tierCounts.reserved,
  gatesFramework: 30,
  gatesRouted: gateIds.length,
  gatesSpecified: DEFINITIVE_GATE_EXPANSIONS.length,
  authorities: authorities.length,
  conformanceTotal: DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT,
  conformanceRuntime: DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT,
};
const countBlock = `**${COUNTS.slots} model slots** (${COUNTS.normative} Normative · ${COUNTS.catalogTier} Catalog · ${COUNTS.reserved} Reserved) · **30-gate routing framework** (${COUNTS.gatesRouted} gates carry routed models; ${COUNTS.gatesSpecified} fully specified) · **${COUNTS.authorities} authority anchors** (as referenced) · **${COUNTS.conformanceTotal}-case conformance suite** (${COUNTS.conformanceRuntime} model-runtime)`;

/* ── Page builders ────────────────────────────────────────────────────── */

function renderFieldTable(inputs: Map<string, FieldSpec>): string {
  const L = ['| Field | Type | Required |', '|---|---|---|'];
  const rows = [...inputs.entries()].sort(([a], [b]) => (inputs.get(b)!.required ? 1 : 0) - (inputs.get(a)!.required ? 1 : 0) || a.localeCompare(b));
  for (const [k, spec] of rows) L.push(`| \`${k}\` | ${[...spec.type].join(' \\| ') || '—'} | ${spec.required ? 'MUST' : 'MAY'} |`);
  return L.join('\n');
}

function renderOutputTable(outputs: Map<string, Set<string>>): string {
  const L = ['| Field | Type |', '|---|---|'];
  for (const [k, t] of [...outputs.entries()].sort(([a], [b]) => a.localeCompare(b))) L.push(`| \`${k}\` | ${[...t].join(' \\| ')} |`);
  return L.join('\n');
}

function jsonBlock(v: unknown): string {
  return '```json\n' + JSON.stringify(v, null, 2) + '\n```';
}

/* ── Authored-overlay rendering (§§1–6, 8) ────────────────────────────── */
function overlayOf(e: DefinitiveModelCatalogEntry): ModelOverlay | undefined {
  return MODEL_OVERLAYS[e.slotId];
}
const BANNED_TYPE = /(^|\b)(any|any\[\]|—|unknown|undefined)($|\b)/;
function enumInline(name: string | undefined, mg: (s: string) => void, slot: string): string {
  if (!name) return '';
  const spec = ENUMS[name];
  if (!spec || !spec.values.length) { mg(`${slot}: enum \`${name}\` referenced but not defined with values`); return ''; }
  return ` One of ${spec.values.map(v => `\`${v}\``).join(', ')}.`;
}
function fieldType(f: OverlayFieldSpec): string {
  if (f.enum) return `enum(${f.enum})`;
  return f.type;
}
function renderAuthoredInputs(inputs: Record<string, OverlayFieldSpec>, requiredSet: Set<string>, mg: (s: string) => void, slot: string): string {
  const L = ['| Field | Type | Required | Description |', '|---|---|---|---|'];
  const keys = Object.keys(inputs).sort((a, b) => (requiredSet.has(b) ? 1 : 0) - (requiredSet.has(a) ? 1 : 0) || a.localeCompare(b));
  for (const k of keys) {
    const f = inputs[k];
    if (!f.desc) mg(`${slot}: input \`${k}\` lacks a description`);
    if (BANNED_TYPE.test(f.type)) mg(`${slot}: input \`${k}\` has an inferred/banned type \`${f.type}\``);
    const desc = (f.desc || '—') + enumInline(f.enum, mg, slot);
    L.push(`| \`${k}\` | ${fieldType(f)} | ${requiredSet.has(k) ? 'MUST' : 'MAY'} | ${desc} |`);
  }
  return L.join('\n');
}
function renderAuthoredOutputs(outputs: Record<string, OverlayFieldSpec>, mg: (s: string) => void, slot: string): string {
  const L = ['| Field | Type | Description |', '|---|---|---|'];
  for (const k of Object.keys(outputs)) {
    const f = outputs[k];
    if (!f.desc) mg(`${slot}: output \`${k}\` lacks a description`);
    if (BANNED_TYPE.test(f.type)) mg(`${slot}: output \`${k}\` has an inferred/banned type \`${f.type}\``);
    const desc = (f.desc || '—') + enumInline(f.enum, mg, slot);
    L.push(`| \`${k}\` | ${fieldType(f)} | ${desc} |`);
  }
  return L.join('\n');
}
const KIND_LABEL: Record<ConstantSpec['kind'], string> = {
  statutory_must: 'MUST (binding)',
  cited_median_should: 'SHOULD (cited median)',
  table_data: 'table (jurisdictional)',
};
function renderConstants(constants: ConstantSpec[]): string {
  if (!constants.length) return '_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._';
  const L = ['| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |', '|---|---|---|---|---|---|---|'];
  for (const c of constants) {
    L.push(`| ${c.name} | ${c.value} | ${KIND_LABEL[c.kind]} | ${c.citation} | ${c.pin ?? '—'} | ${c.effective ?? '—'} | ${c.nextCheck ?? '—'} |`);
  }
  return L.join('\n');
}
function collectNumbers(v: unknown, out: number[] = []): number[] {
  if (typeof v === 'number' && Number.isFinite(v)) out.push(v);
  else if (Array.isArray(v)) for (const x of v) collectNumbers(x, out);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) collectNumbers(x, out);
  return out;
}
/** §2 acceptance: every numeric literal in a worked-example OUTPUT traces to a
 *  constant, a supplied input, or an algorithm-derived field. */
function traceGoldenLiterals(overlay: ModelOverlay, input: Record<string, any>, outputs: Record<string, any>, mg: (s: string) => void, slot: string): void {
  const inputNums = new Set(collectNumbers(input));
  const constNums = new Set<number>();
  for (const c of overlay.constants) for (const t of c.traceValues ?? []) constNums.add(t);
  const derived = new Set(overlay.derivedOutputs ?? []);
  for (const [key, val] of Object.entries(outputs)) {
    if (derived.has(key)) continue; // author-attested algorithm-derived
    for (const n of collectNumbers(val)) {
      if (inputNums.has(n) || constNums.has(n)) continue;
      mg(`${slot}: worked-example output \`${key}\` carries untraceable literal ${n} — add it as a constant traceValue, a supplied input, or mark the field derived`);
    }
  }
}

async function modelPage(e: DefinitiveModelCatalogEntry): Promise<string> {
  const tier = tierOf(e);
  const reg = e.implementedRuntimeModelId ? registry.get(e.implementedRuntimeModelId) : null;
  const overlay = overlayOf(e);
  // Per-model gap capture so we can render the conditional "implementable" note.
  const localGaps: string[] = [];
  const mg = (s: string) => { localGaps.push(s); gap(s); };

  const L: string[] = [fm(`${e.slotId} — ${e.name}`, `§${e.slotId}`)];
  L.push(`# ${e.slotId} — ${e.name}\n`);
  L.push(`**Status:** ${TIER_LABEL[tier]}`);
  L.push(`**Boundary classification:** ${BOUNDARY[e.lineCategory] ?? e.lineCategory}`);
  L.push(`**Gates:** ${e.gates.join(', ')}${e.dealTypes.length ? `\n**Deal contexts:** ${e.dealTypes.join(' · ')}` : ''}\n`);

  if (tier === 'reserved') {
    L.push(`Reserved slot — allocated in the specification's numbering; contents to be specified in a future version.\n`);
    return L.join('\n');
  }

  // §1 Purpose
  if (overlay) {
    L.push(`## 1. Purpose\n\n${overlay.purpose}\n`);
    if (overlay.scopeFlag) L.push(`> **Scope note.** ${overlay.scopeFlag}\n`);
  } else {
    L.push(`## 1. Purpose\n\n${e.deterministicComputation}\n`);
    if (tier === 'normative') mg(`${e.slotId}: purpose is a one-line fragment (needs 2–3 authored sentences)`);
  }

  if (tier === 'catalog') {
    L.push(`> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.\n`);
    L.push(`## Boundary statement\n\n${boundaryStatement(e)}\n`);
    if (e.authorityAnchors.length) L.push(`## Authorities\n\n${e.authorityAnchors.map(a => { const c = canonAuthority(a); return `- ${authId.get(c)} — ${c}`; }).join('\n')}\n`);
    return L.join('\n');
  }

  // Tier 1 — Normative, ten sections
  const ex = extractions.get(e.implementedRuntimeModelId!)!;
  const requiredSet = new Set([...ex.inputs.entries()].filter(([, s]) => s.required).map(([k]) => k));

  L.push(`## 2. Input contract\n`);
  L.push(`Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [\`${e.slotId}.schema.json\`](${e.slotId}.schema.json).\n`);
  if (overlay) L.push(renderAuthoredInputs(overlay.inputs, requiredSet, mg, e.slotId) + '\n');
  else { L.push(renderFieldTable(ex.inputs) + '\n'); mg(`${e.slotId}: input types inferred, not authored; fields lack descriptions/enums`); }

  L.push(`## 3. Output contract\n`);
  if (overlay) L.push(renderAuthoredOutputs(overlay.outputs, mg, e.slotId) + '\n');
  else if (ex.outputs.size) { L.push(renderOutputTable(ex.outputs) + '\n'); mg(`${e.slotId}: output types inferred, not authored; fields lack descriptions/enums`); }
  else { L.push(`*(extraction produced no complete runs — see gap ledger)*\n`); mg(`${e.slotId}: no output contract extracted`); }

  L.push(`## 4. Algorithm\n`);
  if (overlay) {
    for (const step of overlay.algorithm) L.push(step);
    L.push('');
  } else {
    L.push(`> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.\n`);
    L.push(`${e.deterministicComputation}\n`);
    if (reg?.description) L.push(`${reg.description}\n`);
    mg(`${e.slotId}: algorithm not yet formalized (RFC-2119 steps)`);
  }

  L.push(`## 5. Constants & authorities\n`);
  if (overlay) {
    L.push(renderConstants(overlay.constants) + '\n');
  } else {
    L.push(`> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and \`next_check_due\` land with the Authority Register export.\n`);
    mg(`${e.slotId}: constants table lacks pin-cites/effective dates`);
  }
  if (e.authorityAnchors.length) {
    L.push(`\n**Authorities**\n`);
    L.push(`| Authority | ID | Type |`);
    L.push(`|---|---|---|`);
    for (const a of e.authorityAnchors) { const c = canonAuthority(a); L.push(`| ${c} | ${authId.get(c)} | ${classifyAuthority(c)} |`); }
    L.push('');
  }

  L.push(`## 6. Worked example\n`);
  if (overlay) {
    const run = await executeV19Model({ modelId: e.implementedRuntimeModelId!, input: overlay.golden.input });
    if (run.status === 'complete') {
      L.push(`*${overlay.golden.narrative}*\n`);
      L.push(`**Inputs**\n\n${jsonBlock(overlay.golden.input)}\n`);
      L.push(`**Outputs (executed against the reference implementation \`${e.implementedRuntimeModelId}\`)**\n\n${jsonBlock(run.outputs)}\n`);
      if (overlay.precisionRule) L.push(`Precision: ${overlay.precisionRule}\n`);
      traceGoldenLiterals(overlay, overlay.golden.input, run.outputs, mg, e.slotId);
    } else {
      L.push(`*(authored golden example did not execute to completion — see gap ledger)*\n`);
      mg(`${e.slotId}: golden example returned status ${run.status} (missing: ${JSON.stringify(run.missingInputs)})`);
    }
  } else if (ex.workedExample) {
    const w = ex.workedExample;
    L.push(`Conformance case \`${w.fixture.id}\` — *${w.fixture.title}*.\n`);
    L.push(`**Inputs**\n\n${jsonBlock(w.fixture.input)}\n`);
    L.push(`**Outputs (reference implementation, verified by the suite)**\n\n${jsonBlock(w.actualOutputs)}\n`);
  } else { L.push(`*(no complete fixture available — see gap ledger)*\n`); mg(`${e.slotId}: no worked example`); }

  L.push(`## 7. Error semantics\n`);
  L.push(`- **Missing inputs:** the model returns \`status: "needs_inputs"\` with \`missingInputs\` as a field-name list${ex.missingInputFormat.length ? ` — for an empty input record: \`${JSON.stringify(ex.missingInputFormat)}\`` : ''}. No partial outputs are emitted.`);
  if (ex.deferCapable) L.push(`- **Specialist boundary:** outputs include \`defer_to_counsel\` (boolean) and, when true, \`counsel_handoff\` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.`);
  L.push(`- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with \`defer_to_counsel: true\`, never a guessed rule.\n`);

  L.push(`## 8. Boundary statement\n\n${overlay ? overlay.boundary : boundaryStatement(e)}\n`);
  if (!overlay) mg(`${e.slotId}: boundary statement is the mail-merged template (needs an authored, specific statement)`);

  L.push(`## 9. Conformance bindings\n`);
  if (ex.caseIds.length) L.push(`Requirement \`REQ-${e.slotId}\` is verified by ${ex.caseIds.length} published case(s): ${ex.caseIds.map(c => `\`${c}\``).join(', ')}.\n`);
  else { L.push(`*(no published cases — see gap ledger)*\n`); mg(`${e.slotId}: normative model has zero conformance cases`); }

  L.push(`## 10. Version\n\nReference binding \`${e.implementedRuntimeModelId}\` · entered the specification at internal lineage stage \`${e.status}\` · spec v${PUBLIC_VERSION}.\n`);

  // Conditional "implementable from this document alone" (§9) — per-model.
  if (overlay && localGaps.length === 0) {
    L.splice(5, 0, `> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.\n`);
  }
  return L.join('\n');
}

function boundaryStatement(e: DefinitiveModelCatalogEntry): string {
  if (e.lineCategory === 'deterministic') {
    return 'This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.';
  }
  if (e.lineCategory === 'professional_handoff') {
    return `This model produces deterministic schedules and routing only. The governing determination for ${e.name.toLowerCase()} is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.`;
  }
  return 'Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.';
}

function gatePage(gateId: string): string {
  const exp = expansions.get(gateId as any);
  const models = modelsByGate.get(gateId) ?? [];
  const name = exp?.name ?? `Gate ${gateId}`;
  const L: string[] = [fm(`${gateId} — ${name}`, `§${gateId}`)];
  L.push(`# ${gateId} — ${name}\n`);
  if (exp) {
    L.push(`${exp.purpose}\n`);
    L.push(`## Trigger conditions\n\n${exp.triggerSummary.map(t => `- ${t}`).join('\n')}\n`);
    L.push(`## Boundary notes\n\n${exp.lineNotes}\n`);
  } else {
    L.push(`> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.\n`);
    gap(`${gateId}: gate name/purpose/predicate pending founder approval`);
  }
  L.push(`## Models routed through ${gateId}\n`);
  L.push('| Slot | Model | Status |');
  L.push('|---|---|---|');
  for (const m of models) L.push(`| [${m.slotId}](../models/${m.slotId}.md) | ${m.name} | ${TIER_LABEL[tierOf(m)].split(' ')[0]} |`);
  L.push('');
  return L.join('\n');
}

function statLawPage(): string {
  const L: string[] = [fm('Anchor-State Law Tables — Real Property', '§State-Law')];
  L.push(`# Anchor-State Law Tables — Real Property & Contract Law\n`);
  L.push(`Table version: \`${REAL_PROPERTY_LAW_VERSION}\`. Anchor states DE / NY / CA / TX; other states are added as data rows. Where a state is not tabled, conforming implementations MUST emit a table-gap flag rather than guessing.\n`);
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
  for (const [st, r] of Object.entries(TRANSFER_TAX_REGIMES)) L.push(`| ${st} | ${r.deedTax ? 'yes' : 'no'} | ${r.controllingInterestTax ? 'yes' : 'no'} | ${r.controllingInterestThresholdPct != null ? `≥${r.controllingInterestThresholdPct}%` : '—'} | ${r.aggregationYears != null ? `${r.aggregationYears} yr` : '—'} | ${r.reassessmentOnControlChange ? 'yes' : 'no'} | ${r.citation} |`);
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
  L.push(`The following are legal determinations. A conforming implementation MUST classify and route them (requirements \`REQ-DTC-RE-01\`…\`REQ-DTC-RE-10\`); answering one violates this specification:\n`);
  for (const t of DEFER_TO_COUNSEL_TRIGGERS) L.push(`- **${t.id}** — ${t.trigger}`);
  L.push('');
  return L.join('\n');
}

/* ── Narrative chapters ───────────────────────────────────────────────── */

function overviewDoc(clean: boolean): string {
  const implementableClause = clean
    ? 'and are implementable from this document alone'
    : 'and each carries its contract in full; entries marked **implementable from this document alone** have a complete authored contract today, while the remainder are being authored family by family (see the changelog)';
  return `${fm('Overview', '§Overview')}# ${TITLE} — Overview

DEFINITIVE is an open, versioned specification for the deterministic mechanics
of mergers and acquisitions: the computations, classifications, routing gates,
and authority citations that govern how a transaction's quantitative and
rule-driven questions are answered. It spans valuation normalization, quality
of earnings, financing and DSCR mechanics, purchase-price allocation, tax and
reorganization structure, distressed and restructuring waterfalls, capital
structure and liability management, IP transfer mechanics, and a real
property & contract law layer with anchor-state law encoded as data.

**At a glance:** ${countBlock}.

The specification publishes at two maturity tiers, labeled on every entry and
in the index. **Normative** entries carry the full contract — input and output
schemas, algorithm, worked example, error semantics, and conformance
bindings — ${implementableClause}. **Catalog** entries
are informative maps of scope, boundary, routing, and authorities whose
normative contracts are scheduled. The breadth claim (${COUNTS.slots} slots
mapped) and the rigor claim (${COUNTS.normative} slots normative) are distinct
claims, made separately and never blurred.

Three design rules run through everything. **Determinism**: a model computes
from supplied facts and cited constants — same inputs, same outputs, no
estimation dressed as calculation. **Data over logic**: jurisdictional
variation lives in versioned lookup tables; an implementation confronted with
an untabled jurisdiction must surface the gap rather than guess. **Boundary
honesty**: every model declares whether it is arithmetic, a schedule feeding a
licensed professional's determination, or a research scaffold — and
conforming implementations route accordingly.

## Normative language

The key words MUST, MUST NOT, SHALL, SHOULD, and MAY in this specification are
to be interpreted as described in RFC 2119 and RFC 8174 when, and only when,
they appear in all capitals.

## What this specification is not

This specification is an educational and engineering reference. It is not
legal, tax, accounting, investment, or appraisal advice; it renders no
opinions; and nothing in it creates a professional relationship. Questions it
classifies as specialist determinations belong to licensed professionals.
`;
}

const BOUNDARIES = `${fm('Professional Boundaries', '§Boundaries')}# Professional-Boundary Classification

Every model slot carries one of three boundary classifications. The
classification is normative — implementations that surface DEFINITIVE
computations MUST preserve it.

**Deterministic computation.** Arithmetic and rule application on supplied
facts and cited constants. These produce answers.

**Deterministic schedules with a specialist boundary.** The model computes
real schedules — a three-prong solvency table, a marketability triage, a
consent-path classification — but the *governing determination* is a legal,
tax, accounting, appraisal, or judicial conclusion that belongs to a licensed
professional. These models produce the workpapers and the routing, never the
conclusion. Each such model's entry states which conclusion is out of scope
and to whom it routes.

**Research scaffolds.** Organized authorities and considerations for areas
where rulemaking or market practice is still moving. These produce oriented
reading, not determinations.

The specification also publishes explicit **professional-determination
boundary catalogs** (e.g., the ten real-property triggers in the state-law
chapter), each carrying a numbered conformance requirement. A system that
answers a question the specification routes has not implemented the
specification; it has violated it — and the conformance suite tests for it.
`;

const METHODOLOGY = `${fm('Methodology', '§Methodology')}# Methodology

**Zero-hallucination architecture.** Financial figures are extracted or
supplied, never invented; monetary values are integer cents; published
constants carry citation anchors; models that lack a required input MUST
return a named missing-input list instead of a guess.

**Model anatomy.** A Normative entry specifies: identity, boundary
classification, gate routing, deal contexts, input contract, output contract,
algorithm, constants with authorities, a worked example (which is also a
published conformance case), error semantics, boundary statement, conformance
bindings, and version. Implementations execute models as pure functions over
a supplied input record and emit outputs plus an audit payload (spec version,
input/output hashes, timestamps).

**Gate routing.** Transactions activate model families through gates —
predicates over the deal-fact data dictionary. Gates make coverage
inspectable: for a given transaction shape, the set of applicable models is
enumerable in advance.

**Jurisdictional data tables.** Where the law varies by state, the variation
is a versioned data table. Adding a jurisdiction is a data change with its
own conformance cases, not a code change. Unknown jurisdictions MUST produce
explicit table-gap flags.

**Conformance.** ${COUNTS.conformanceTotal} cases
(${COUNTS.conformanceRuntime} model-runtime across
${DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES.length} categories), with
expected values derived from governing authorities independently of any
implementation. See the conformance chapter for the case format, the harness
contract, and the numbered requirements.
`;

/* ── Emit ─────────────────────────────────────────────────────────────── */

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  rmSync(OUT_INTERNAL, { recursive: true, force: true });
  for (const dir of ['', 'spec', 'spec/gates', 'spec/models', 'spec/state-law', 'spec/conformance', 'spec/conformance/cases', 'reference/ts', 'reference/python', 'machine']) {
    mkdirSync(path.join(OUT, dir), { recursive: true });
  }
  mkdirSync(OUT_INTERNAL, { recursive: true });
  const write = (rel: string, content: string) => writeFileSync(path.join(OUT, rel), content);

  // Extraction pass (Tier 1 models)
  for (const e of catalog) {
    if (tierOf(e) === 'normative') {
      extractions.set(e.implementedRuntimeModelId!, await extractModel(e.implementedRuntimeModelId!, registry.get(e.implementedRuntimeModelId!)?.requiredInputs ?? []));
    }
  }

  /* scaffold */
  write('CITATION.cff', `cff-version: 1.2.0
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
`);
  write('CHANGELOG.md', `# Changelog\n\n## v${PUBLIC_VERSION} — ${RELEASE_DATE}${DRAFT ? ' (DRAFT — unpublished review build)' : ''}\n\nInitial public release: ${countBlock}.\n`);
  write('LICENSE', `MIT License

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
`);
  write('LICENSE-SPEC', `Creative Commons Attribution 4.0 International (CC BY 4.0)

The specification text in this repository (the contents of spec/,
DEFINITIVE.md, llms.txt, and llms-full.txt) is licensed under the Creative
Commons Attribution 4.0 International License.

You are free to share and adapt the material for any purpose, even
commercially, provided you give appropriate credit ("${TITLE}
v${PUBLIC_VERSION}, smbX, ${CANONICAL_HOME}"), link the license, and indicate
changes. No warranties are given.

Full legal code: https://creativecommons.org/licenses/by/4.0/legalcode
`);
  write('README.md', `# ${TITLE}

${BANNER}DEFINITIVE is an open, versioned specification for M&A deal
mechanics — the deterministic computations, boundary classifications, routing
gates, jurisdictional data tables, and authority citations that govern how a
transaction's quantitative and rule-driven questions are answered.

**At a glance:** ${countBlock}.

**Start here:** [\`spec/README.md\`](spec/README.md) (index) · [\`DEFINITIVE.md\`](DEFINITIVE.md) (single-file volume) · [\`llms.txt\`](llms.txt) (agent index) · [\`machine/spec.json\`](machine/spec.json) (machine-readable registry)

## How to cite

> ${TITLE} v${PUBLIC_VERSION} (smbX, ${RELEASE_DATE.slice(0, 4)}). ${CANONICAL_HOME}

Per-section citation lines appear in each page's front matter; machine-readable metadata in [\`CITATION.cff\`](CITATION.cff).

## Licensing

- **Specification text** (\`spec/\`, \`DEFINITIVE.md\`, \`llms*.txt\`): [CC BY 4.0](LICENSE-SPEC).
- **Code** (\`reference/\`, \`machine/\`, conformance cases): [MIT](LICENSE).

## Not advice

This specification is an educational and engineering reference. It is not
legal, tax, accounting, investment, or appraisal advice, and it renders no
opinions. Questions it classifies as specialist determinations belong to
licensed professionals.
`);
  write('reference/ts/README.md', `# DEFINITIVE reference implementation — TypeScript\n\nReference implementation of the ${TITLE} (v${PUBLIC_VERSION}). Scaffold — lands with the conformance harness. License: MIT.\n`);
  write('reference/ts/package.json', JSON.stringify({ name: '@definitive-spec/reference', version: PUBLIC_VERSION, private: true, license: 'MIT' }, null, 2) + '\n');
  write('reference/python/README.md', `# DEFINITIVE reference implementation — Python\n\nReference implementation of the ${TITLE} (v${PUBLIC_VERSION}). Scaffold — lands with the conformance harness. License: MIT.\n`);
  write('reference/python/pyproject.toml', `[project]\nname = "definitive-spec-reference"\nversion = "${PUBLIC_VERSION}"\nlicense = { text = "MIT" }\n`);

  /* narrative (overview deferred until gaps are known — §9 conditional claim) */
  write('spec/professional-boundaries.md', BOUNDARIES);
  write('spec/methodology.md', METHODOLOGY);
  write('spec/state-law/real-property.md', statLawPage());

  /* data dictionary (§3/§4) — a DESIGNED vocabulary, not a telemetry report */
  {
    // Authored fields: type + description + enum, from the overlays (union).
    const authored = new Map<string, OverlayFieldSpec>();
    for (const e of catalog) {
      const overlay = overlayOf(e);
      if (!overlay) continue;
      for (const [k, spec] of Object.entries(overlay.inputs)) if (!authored.has(k)) authored.set(k, spec);
      for (const [k, spec] of Object.entries(overlay.outputs)) if (!authored.has(k)) authored.set(k, spec);
    }
    // Fields observed in models still pending normative authoring (no contract yet).
    const pending = new Set<string>();
    for (const e of catalog) {
      if (tierOf(e) !== 'normative' || overlayOf(e)) continue;
      for (const k of extractions.get(e.implementedRuntimeModelId!)!.inputs.keys()) if (!authored.has(k)) pending.add(k);
    }
    const L: string[] = [fm('Deal-Fact Data Dictionary', '§Data-Dictionary')];
    L.push(`# Deal-Fact Data Dictionary\n`);
    L.push(`The designed field vocabulary used by model input and output contracts and by gate predicates. Each field carries an authored type and description; enumerated fields carry their values (below). This is the specification's vocabulary, not a usage report.\n`);
    L.push(`**Conventions (normative):** monetary values are integer cents; percentages are numbers on a 0–100 scale unless the field name ends in \\_pct as a fraction; rates are 0–1; dates are ISO-8601 strings; US jurisdictions are two-letter state codes.\n`);
    L.push('| Field | Type | Description |');
    L.push('|---|---|---|');
    for (const [k, f] of [...authored.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const t = f.enum ? `enum(${f.enum})` : f.type;
      L.push(`| \`${k}\` | ${t} | ${f.desc} |`);
    }
    L.push('');
    L.push(`## Enumerations\n`);
    L.push(`Enumerated values are part of the normative contract — a conforming implementation accepts and emits only these values for the field types below.\n`);
    for (const [name, spec] of Object.entries(ENUMS).sort(([a], [b]) => a.localeCompare(b))) {
      L.push(`- **\`${name}\`** — ${spec.description}\n  - Values: ${spec.values.map(v => `\`${v}\``).join(', ')}`);
    }
    L.push('');
    if (pending.size) {
      L.push(`## Fields pending normative authoring\n`);
      L.push(`These field names appear in models whose normative contracts are still being authored; they are listed for completeness and are **not** yet part of the designed vocabulary. Their types and descriptions land as each model's overlay is authored.\n`);
      L.push([...pending].sort().map(k => `\`${k}\``).join(' · ') + '\n');
    }
    write('spec/data-dictionary.md', L.join('\n'));
  }

  /* gates + models */
  const gatePages = new Map<string, string>();
  for (const g of gateIds) { const p = gatePage(g); gatePages.set(g, p); write(`spec/gates/${g.length === 2 ? g[0] + '0' + g[1] : g}.md`, p); }
  const statLaw = statLawPage();
  const modelPages = new Map<string, string>();
  for (const e of catalog) {
    const page = await modelPage(e);
    modelPages.set(e.slotId, page);
    write(`spec/models/${e.slotId}.md`, page);
    if (tierOf(e) === 'normative') {
      const ex = extractions.get(e.implementedRuntimeModelId!)!;
      const overlay = overlayOf(e);
      const jsonTypeOf = (t: string): any => {
        const nullable = / \| null$/.test(t);
        const base = t.replace(/ \| null$/, '');
        let jt: any = base.startsWith('integer') ? 'integer' : base === 'number' ? 'number' : base === 'boolean' ? 'boolean' : base.endsWith('[]') ? 'array' : base === 'object' ? 'object' : 'string';
        return nullable ? [jt, 'null'] : jt;
      };
      const authoredSchema = (fields: Record<string, OverlayFieldSpec>, requiredKeys: string[]) => ({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        title: `${e.slotId} contract`,
        type: 'object',
        properties: Object.fromEntries(Object.entries(fields).map(([k, f]) => {
          const prop: any = { type: f.enum ? 'string' : jsonTypeOf(f.type), description: f.desc };
          if (f.enum && ENUMS[f.enum]) prop.enum = ENUMS[f.enum].values;
          if (f.unit) prop.unit = f.unit;
          return [k, prop];
        })),
        ...(requiredKeys.length ? { required: requiredKeys } : {}),
      });
      const empiricalSchema = (m: Map<string, any>, isInput: boolean) => ({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        title: `${e.slotId} ${isInput ? 'input' : 'output'} contract`,
        type: 'object',
        properties: Object.fromEntries([...m.entries()].map(([k, v]: [string, any]) => {
          const types = isInput ? [...v.type] : [...v];
          const t = types[0] ?? 'string';
          const jt = t.startsWith('integer') ? 'integer' : t === 'number' ? 'number' : t === 'boolean' ? 'boolean' : t.endsWith('[]') ? 'array' : t === 'object' ? 'object' : t === 'null' ? ['null', 'string'] : 'string';
          return [k, { type: jt, description: t }];
        })),
        ...(isInput ? { required: [...m.entries()].filter(([, v]: [string, any]) => v.required).map(([k]) => k) } : {}),
      });
      const requiredKeys = [...ex.inputs.entries()].filter(([, s]) => s.required).map(([k]) => k);
      const schema = overlay
        ? { input: authoredSchema(overlay.inputs, requiredKeys), output: authoredSchema(overlay.outputs, []) }
        : { input: empiricalSchema(ex.inputs, true), output: empiricalSchema(ex.outputs as any, false) };
      write(`spec/models/${e.slotId}.schema.json`, JSON.stringify(schema, null, 2) + '\n');
    }
  }

  /* authorities (§6) */
  {
    const L: string[] = [fm('Authority Register (as referenced)', '§Authorities')];
    L.push(`# Authority Register — as referenced\n`);
    L.push(`The ${authorities.length} distinct authorities referenced by published entries, with provisional stable IDs. This public register is deliberately the *cited subset*: the full curated register (supersession chains, citator treatment, pin-cite validation, \`next_check_due\` machinery) is maintained internally and exported here only as published entries cite it. Entries typed \`practice-norm\` are market conventions without a controlling citation and are labeled as such rather than dressed as authority.\n`);
    L.push('| ID | Authority | Type |');
    L.push('|---|---|---|');
    for (const a of authorities) L.push(`| ${authId.get(a)} | ${a} | ${classifyAuthority(a)} |`);
    L.push('');
    write('spec/authorities.md', L.join('\n'));
  }

  /* conformance (§5) */
  {
    const L: string[] = [fm('Conformance', '§Conformance')];
    L.push(`# Conformance\n`);
    L.push(`A conforming implementation passes the published suite: **${COUNTS.conformanceTotal} cases**, of which **${COUNTS.conformanceRuntime} model-runtime cases** ship in this repository ([\`cases/model-runtime.cases.json\`](cases/model-runtime.cases.json), MIT).\n`);
    L.push(`## Case format\n`);
    L.push(jsonBlock({
      case_id: 'string — stable identifier',
      title: 'string',
      specVersion: 'string — spec version the case targets',
      modelId: 'string — the reference-binding id (see each model page §10)',
      input: 'object — the model input record',
      expect: { status: 'complete | needs_inputs', outputs: 'object — expected output fields (subset match, exact values)', missingInputsIncludes: 'string[] — required missing-input names' },
    }) + '\n');
    L.push(`## Harness contract\n`);
    L.push(`An implementation exposes \`execute(modelId, input) -> { status, outputs, missingInputs }\`. The harness loads the case files, executes each case, and asserts: (1) \`status\` matches; (2) every field in \`expect.outputs\` matches exactly (deep equality; monetary values integer-cents); (3) every name in \`expect.missingInputsIncludes\` appears in \`missingInputs\`. All cases MUST pass; there is no partial conformance.\n`);
    L.push(`## Requirements\n`);
    L.push(`Each Normative model carries requirement \`REQ-<slot>\` (its I/O contract, worked example, and error semantics — verified by its bound cases, listed on the model page). Each professional-determination boundary carries \`REQ-DTC-*\` (the implementation routes, never answers — verified by boundary cases asserting \`defer_to_counsel: true\` outputs).\n`);
    const reqs: string[] = [];
    for (const e of catalog) if (tierOf(e) === 'normative') reqs.push(`- \`REQ-${e.slotId}\` — ${e.name} conforms to its published contract (${(extractions.get(e.implementedRuntimeModelId!)?.caseIds.length ?? 0)} case(s))`);
    for (const t of DEFER_TO_COUNSEL_TRIGGERS) reqs.push(`- \`REQ-DTC-${t.id.replace('DTC.', '').replace('.', '-')}\` — implementations MUST route, not answer: ${t.trigger}`);
    L.push(reqs.join('\n') + '\n');
    write('spec/conformance.md', L.join('\n'));
    write('spec/conformance/cases/model-runtime.cases.json', JSON.stringify(fixtures, null, 2) + '\n');
  }

  /* lineage */
  write('spec/lineage.md', `${fm('Version Lineage', '§Lineage')}# Version Lineage\n\nPublic versions start at v1.0.0. Internal development lineage, for readers of earlier private materials: methodology generations V17–V19 (math, tax, legal engines; model catalog; stack architecture; anti-hallucination) were consolidated into the DEFINITIVE catalog (internal v1.0 → v1.1), extended in 2026-07 with the real property & contract law layer (internal V18c), and published as this specification.\n`);

  /* spec index */
  {
    const L: string[] = [fm('Specification Index', '§Index')];
    L.push(`# ${TITLE} v${PUBLIC_VERSION} — Index\n`);
    L.push(`**At a glance:** ${countBlock}.\n`);
    L.push(`1. [Overview](overview.md) · 2. [Professional Boundaries](professional-boundaries.md) · 3. [Methodology](methodology.md) · 4. [Data Dictionary](data-dictionary.md) · 5. [Gates](gates/) · 6. Models (below) · 7. [State-Law Tables](state-law/real-property.md) · 8. [Authorities](authorities.md) · 9. [Conformance](conformance.md) · 10. [Lineage](lineage.md)\n`);
    L.push(`## Model index\n`);
    L.push('| Slot | Model | Tier | Gates |');
    L.push('|---|---|---|---|');
    for (const e of catalog) L.push(`| [${e.slotId}](models/${e.slotId}.md) | ${e.name} | ${TIER_LABEL[tierOf(e)].split(' ')[0]} | ${e.gates.join(' ')} |`);
    L.push('');
    write('spec/README.md', L.join('\n'));
  }

  /* machine companion (§7) */
  {
    const spec = {
      spec: TITLE, version: PUBLIC_VERSION + (DRAFT ? '-draft' : ''), date: RELEASE_DATE, canonical: CANONICAL_HOME,
      counts: COUNTS,
      models: catalog.map(e => ({
        slot: e.slotId, name: e.name, tier: tierOf(e), boundary: e.lineCategory, gates: e.gates,
        dealContexts: e.dealTypes, authorities: e.authorityAnchors.map(a => ({ id: authId.get(canonAuthority(a)), citation: canonAuthority(a) })),
        binding: e.implementedRuntimeModelId, requiredInputs: e.implementedRuntimeModelId ? registry.get(e.implementedRuntimeModelId)?.requiredInputs ?? [] : [],
        uri: `${CANONICAL_HOME}/v1/models/${e.slotId}`,
      })),
      gates: gateIds.map(g => ({
        id: g, name: expansions.get(g as any)?.name ?? null, specified: expansions.has(g as any),
        models: (modelsByGate.get(g) ?? []).map(m => m.slotId), uri: `${CANONICAL_HOME}/v1/gates/${g}`,
      })),
      authorities: authorities.map(a => ({ id: authId.get(a), citation: a, type: classifyAuthority(a) })),
      conformance: { total: COUNTS.conformanceTotal, modelRuntime: COUNTS.conformanceRuntime, categories: DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES },
    };
    write('machine/spec.json', JSON.stringify(spec, null, 2) + '\n');
  }

  /* overview — written now that the full gap state is known (§9 conditional) */
  const cleanBuild = gaps.length === 0;
  const overviewMd = overviewDoc(cleanBuild);
  write('spec/overview.md', overviewMd);

  /* single volume + llms */
  {
    const strip = (s: string) => s.replace(/^---[\s\S]*?---\n\n/, '');
    const vol: string[] = [];
    vol.push(`# ${TITLE} — v${PUBLIC_VERSION}${DRAFT ? ' (DRAFT — internal review build)' : ''}\n`);
    vol.push(`Released ${RELEASE_DATE} · ${CANONICAL_HOME} · License: CC BY 4.0 (text) / MIT (code)\n`);
    if (DRAFT) vol.push(BANNER);
    vol.push(strip(overviewMd), '\n---\n', strip(BOUNDARIES), '\n---\n', strip(METHODOLOGY), '\n---\n');
    vol.push(strip(readFileSync(path.join(OUT, 'spec/data-dictionary.md'), 'utf8')), '\n---\n\n# Gates\n');
    for (const g of gateIds) vol.push(strip(gatePages.get(g)!));
    vol.push('\n---\n\n# Model Catalog\n');
    for (const e of catalog) vol.push(strip(modelPages.get(e.slotId)!));
    vol.push('\n---\n', strip(statLaw));
    vol.push('\n---\n', strip(readFileSync(path.join(OUT, 'spec/authorities.md'), 'utf8')));
    vol.push('\n---\n', strip(readFileSync(path.join(OUT, 'spec/conformance.md'), 'utf8')));
    const volume = vol.join('\n');
    write('DEFINITIVE.md', volume);
    write('llms-full.txt', volume);
    write('llms.txt', `# ${TITLE}\n\n> Open, versioned specification for M&A deal mechanics. ${countBlock}. v${PUBLIC_VERSION} (${RELEASE_DATE}). Educational/engineering reference — not legal, tax, accounting, investment, or appraisal advice.\n\n## Core\n- [Overview](${CANONICAL_HOME}/spec/overview)\n- [Professional boundaries](${CANONICAL_HOME}/spec/professional-boundaries)\n- [Methodology](${CANONICAL_HOME}/spec/methodology)\n- [Data dictionary](${CANONICAL_HOME}/spec/data-dictionary)\n- [State-law tables](${CANONICAL_HOME}/spec/state-law/real-property)\n- [Authorities](${CANONICAL_HOME}/spec/authorities)\n- [Conformance](${CANONICAL_HOME}/spec/conformance)\n\n## Reference\n- Gates: ${CANONICAL_HOME}/spec/gates/\n- Models M101–M234: ${CANONICAL_HOME}/spec/models/\n- Machine registry: ${CANONICAL_HOME}/machine/spec.json\n- Full volume: ${CANONICAL_HOME}/llms-full.txt\n`);
  }

  /* internal crosswalk (§8) — NOT part of the public tree */
  {
    const L = ['# INTERNAL slot crosswalk — not for publication\n'];
    L.push('| Slot | Internal note | Internal status |');
    L.push('|---|---|---|');
    for (const e of catalog) if (e.notes) L.push(`| ${e.slotId} | ${e.notes} | ${e.status} |`);
    writeFileSync(path.join(OUT_INTERNAL, 'INTERNAL_SLOT_CROSSWALK.md'), L.join('\n') + '\n');
  }

  /* governing rule (delta preamble) — printed atop the build + shipped internal */
  {
    const overlaid = catalog.filter(e => tierOf(e) === 'normative' && overlayOf(e)).map(e => e.slotId);
    writeFileSync(path.join(OUT_INTERNAL, 'GOVERNANCE.md'), `# Governing rule\n\n> ${GOVERNING_RULE}\n\nThis rule governs the public-edition build. The generator MERGES an authored\noverlay (\`scripts/definitivePublicOverlay.ts\`) over the empirical extraction:\nRFC-2119 algorithms, typed contracts with enums and descriptions, constants\nwith pin-cites, golden examples, de-boilerplated boundary statements, purpose\nprose, and authority de-duplication are AUTHORED, not extracted. Where the\ncode's behavior is narrower than the M&A concept, the entry is scoped\nhonestly and cross-referenced (see the scope notes), never silently narrowed.\n\n**Normative models carrying a complete authored overlay (${overlaid.length}):** ${overlaid.join(', ') || '(none yet)'}\n\n**Publish gate (\`--publish\`) fails on any of:** pending-formalization banner;\ninferred/\`any\` type; field without description; enum-like field without\nenumerated values; untraceable numeric literal in a worked example; duplicate\nnormalized Authority Register rows; pin-cite-pending banner in a Normative\nconstants table; a golden example that does not execute; a gate pending\nfounder approval. Draft mode carries these in the gap ledger.\n`);
  }

  /* gap ledger / publish enforcement (§8/§9) */
  if (DRAFT) {
    writeFileSync(path.join(OUT_INTERNAL, 'GAP_LEDGER.md'), `# Gap ledger — ${gaps.length} open\n\n> Governing rule: ${GOVERNING_RULE}\n\n${gaps.map(g => `- ${g}`).join('\n')}\n`);
  } else if (gaps.length) {
    console.error(`PUBLISH BLOCKED — ${gaps.length} editorial gaps:\n${gaps.map(g => `  ✗ ${g}`).join('\n')}`);
    process.exit(1);
  }

  console.log(`\n${GOVERNING_RULE}\n`);
  console.log(`DEFINITIVE public tree built at ${OUT} ${PUBLISH ? '(PUBLISH mode)' : '(draft mode)'}`);
  console.log(`  slots: ${COUNTS.slots} (normative ${COUNTS.normative} / catalog ${COUNTS.catalogTier} / reserved ${COUNTS.reserved})`);
  console.log(`  normative overlays authored: ${catalog.filter(e => tierOf(e) === 'normative' && overlayOf(e)).length} · clean build: ${cleanBuild}`);
  console.log(`  gates routed: ${COUNTS.gatesRouted} · authorities: ${COUNTS.authorities} · gaps: ${gaps.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
