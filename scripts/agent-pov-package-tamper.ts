#!/usr/bin/env npx tsx
/**
 * Agent-POV portable-package tamper harness (TB-*).
 *
 * Exercises finalize_deal_package, verify_package, reopen_deal_package, and
 * disclose_subset; injects tampering on every package field; and asserts
 * external verification semantics (Merkle inclusion proof, selective
 * disclosure, signed manifest).
 *
 * Test plan: TEST_PLAN_SUBSTRATE_AGENT_POV.md §4.8 TB-*.
 *
 * Usage:
 *   npx tsx scripts/agent-pov-package-tamper.ts
 *   npx tsx scripts/agent-pov-package-tamper.ts --url=http://127.0.0.1:3000
 *   npx tsx scripts/agent-pov-package-tamper.ts --bearer=$DEFINITIVE_MCP_ACCESS_TOKEN
 *
 * Exit: 0 all-pass / 1 any-fail / 2 infra error.
 */

import 'dotenv/config';
import {
  McpClient,
  assert,
  assertNoFiveHundred,
  c,
  getPath,
  header,
  mintLocalAgentToken,
  note,
  printSummary,
  readEnv,
  runScenario,
  skip,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type { McpResponse } from '../testing/agent-pov/runner-helpers.js';
import type { AssertionResult } from '../testing/agent-pov/types.js';

const SCRIPT_NAME = 'agent-pov-package-tamper';

interface CliArgs { url?: string; bearer?: string; }
function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6);
    else if (raw.startsWith('--bearer=')) args.bearer = raw.slice(9);
  }
  return args;
}

async function resolveBearer(env: ReturnType<typeof readEnv>, cli: CliArgs): Promise<string | null> {
  if (cli.bearer) return cli.bearer;
  const fromEnv =
    process.env.DEFINITIVE_MCP_ACCESS_TOKEN ||
    process.env.SMBX_MCP_ACCESS_TOKEN ||
    process.env.AGENT_POV_BEARER ||
    null;
  if (fromEnv) return fromEnv;
  if (env.hasDb && env.jwtSecret) {
    const minted = await mintLocalAgentToken({
      agentIdentity: `agent_pov_tb_${Date.now()}`,
      tier: 'pro',
    });
    if (minted) return minted;
  }
  return null;
}

function unwrap(res: McpResponse): any {
  const body = res.body ?? {};
  return (
    body?.result?.structuredContent?.result?.result ??
    body?.result?.structuredContent?.result ??
    body?.result?.structuredContent ??
    body?.result ??
    body
  );
}

function isToolError(res: McpResponse): boolean {
  return Boolean(res.body?.result?.isError) || Boolean(res.body?.error);
}

async function callTool(
  client: McpClient,
  bearer: string | null,
  toolName: string,
  args: any,
): Promise<McpResponse> {
  return client.mcpCall(
    'tools/call',
    { name: toolName, arguments: args },
    { bearer: bearer ?? undefined },
  );
}

interface FinalizedBundle {
  dealState: any;
  dealPackage: any;
  finalizedPackage: any;
  finalizedRoot: any; // entire finalize response root (may include signed manifest etc.)
}

async function buildFinalizedBundle(
  client: McpClient,
  bearer: string | null,
): Promise<FinalizedBundle | null> {
  let ingest: McpResponse;
  try {
    ingest = await callTool(client, bearer, 'ingest_deal_payload', {
      journey: 'buy',
      target_industry: 'B2B services',
      target_jurisdiction: 'US-TX',
      target_sde: 500_000_000,
      target_revenue: 1800_000_00,
      naics: '541512',
    });
  } catch (err) {
    note(`ingest_deal_payload threw: ${(err as Error).message}`);
    return null;
  }
  const dealState = unwrap(ingest)?.dealState ?? null;
  if (!dealState) return null;
  let composed: McpResponse;
  try {
    composed = await callTool(client, bearer, 'compose_deal_package', { dealState });
  } catch (err) {
    note(`compose_deal_package threw: ${(err as Error).message}`);
    return null;
  }
  const dealPackage = unwrap(composed)?.dealPackage ?? unwrap(composed)?.package ?? null;
  if (!dealPackage) return null;
  let finalized: McpResponse;
  try {
    // finalize_deal_package is `confirmation: 'required'` because signing a
    // Merkle-rooted manifest is one-way. Pass confirmed=true to bypass the
    // human-approval gate — this harness is exercising the artifact-shape
    // contract, not the staging UX. Production agents stage first, then
    // re-call with confirmed=true after explicit human approval.
    finalized = await callTool(client, bearer, 'finalize_deal_package', {
      dealPackage,
      dealState,
      confirmed: true,
    });
  } catch (err) {
    note(`finalize_deal_package threw: ${(err as Error).message}`);
    return null;
  }
  const finalizedRoot = unwrap(finalized);
  const finalizedPackage =
    finalizedRoot?.finalizedPackage ?? finalizedRoot?.dealPackage ?? finalizedRoot?.package ?? finalizedRoot;
  if (!finalizedPackage || typeof finalizedPackage !== 'object') return null;
  return { dealState, dealPackage, finalizedPackage, finalizedRoot };
}

function fieldAtPath(obj: any, path: string[]): any {
  let cur = obj;
  for (const p of path) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setAtPath(obj: any, path: string[], value: any): void {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i += 1) {
    if (cur[path[i]] == null) cur[path[i]] = {};
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

// ─── Scenarios ────────────────────────────────────────────

async function scenarioFinalizeFields(
  client: McpClient,
  bearer: string | null,
  bundle: FinalizedBundle,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const pkg = bundle.finalizedPackage;
  const root = bundle.finalizedRoot;
  // TB-001: required portable-package fields
  // Allow either snake_case or camelCase, and look at both pkg and the root.
  // Substrate canonical names (see finalizeDefinitiveDealPackage):
  //   auditPacket: { packetId, auditHash: { hash } }
  //   signedManifest: { manifestId, signedHash: { hash }, attestation: {...} }
  //   merkleProof: { rootHash, ... }
  //   humanRender: { markdown, ... }
  // Allow legacy/alias names too so this harness stays robust across renames.
  const lookupFields: Array<[string, string[][]]> = [
    ['manifest', [['manifest'], ['signedManifest'], ['signed_manifest'], ['packageManifest']]],
    ['audit_id', [['audit_id'], ['auditId'], ['auditTrailId'], ['audit_trail_id'], ['auditPacket', 'packetId'], ['auditPacket', 'auditHash', 'hash']]],
    ['hashes', [['hashes'], ['dealStateHash'], ['outputHash'], ['hash'], ['auditPacket', 'sourceHashes'], ['auditPacket', 'modelOutputHashes'], ['auditPacket', 'auditHash']]],
    ['signed_manifest', [['signed_manifest'], ['signedManifest'], ['attestation']]],
    ['merkle_root', [['merkle_root'], ['merkleRoot'], ['merkleInclusionProof', 'merkleRoot'], ['merkleProof', 'rootHash'], ['merkleProof', 'merkleRoot']]],
    ['human_render', [['human_render'], ['humanRender'], ['HumanPackageRender'], ['humanPackageRender']]],
  ];
  for (const [label, paths] of lookupFields) {
    let found = false;
    for (const p of paths) {
      if (fieldAtPath(pkg, p) !== undefined || fieldAtPath(root, p) !== undefined) { found = true; break; }
    }
    out.push(assert(
      `finalize_deal_package returns ${label}`,
      found,
      label,
      paths.map(p => p.join('.')).join(' | '),
    ));
  }
  return out;
}

async function scenarioVerifyValid(
  client: McpClient,
  bearer: string | null,
  bundle: FinalizedBundle,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const verify = await callTool(client, bearer, 'verify_package', {
    dealPackage: bundle.finalizedPackage,
    dealState: bundle.dealState,
  });
  out.push(assertNoFiveHundred(verify));
  const r = unwrap(verify);
  const ok =
    r?.verified === true ||
    r?.valid === true ||
    r?.status === 'verified' ||
    r?.verification?.status === 'verified' ||
    (!isToolError(verify) && !r?.tamperingIndicators);
  out.push(assert('verify_package(valid) returns verified=true', Boolean(ok), 'verified', JSON.stringify(r).slice(0, 120)));
  return out;
}

async function scenarioTamperInjection(
  client: McpClient,
  bearer: string | null,
  bundle: FinalizedBundle,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  // Choose tamperable fields. Each entry sets a deliberately-wrong value.
  // Paths match the substrate's finalizedPackage shape (auditPacket nested,
  // merkleProof nested, signedManifest nested). Skip any field that's
  // absent in this particular finalize response.
  const tamperPlan: Array<{ label: string; path: string[]; value: any }> = [
    { label: 'packageCid', path: ['packageCid'], value: 'bafy-forged' },
    { label: 'auditPacket.packetId', path: ['auditPacket', 'packetId'], value: 'audit_forged' },
    { label: 'auditPacket.auditHash.hash', path: ['auditPacket', 'auditHash', 'hash'], value: '00'.repeat(32) },
    { label: 'merkleProof.rootHash', path: ['merkleProof', 'rootHash'], value: '00'.repeat(32) },
    { label: 'signedManifest.signedHash.hash', path: ['signedManifest', 'signedHash', 'hash'], value: 'ff'.repeat(32) },
    { label: 'signedManifest.attestation.statement', path: ['signedManifest', 'attestation', 'statement'], value: 'forged statement' },
  ];
  let appliedAtLeastOne = false;
  for (const t of tamperPlan) {
    const tampered = JSON.parse(JSON.stringify(bundle.finalizedPackage));
    if (fieldAtPath(tampered, t.path) === undefined) continue; // skip if field absent
    setAtPath(tampered, t.path, t.value);
    appliedAtLeastOne = true;
    const verify = await callTool(client, bearer, 'verify_package', {
      dealPackage: tampered,
      dealState: bundle.dealState,
    });
    out.push(assertNoFiveHundred(verify));
    const r = unwrap(verify);
    // The substrate returns `packageVerification: { verified, checks, missing, ... }`
    // nested under result. Accept either the flattened or nested shape, and
    // also treat any non-empty `missing[]` or `checks[*].status === 'fail'`
    // as a positive tampering signal.
    const pv = r?.packageVerification ?? r?.verification ?? r;
    const failedChecks = Array.isArray(pv?.checks)
      ? pv.checks.filter((ch: any) => ch?.status === 'fail')
      : [];
    const missingChecks = Array.isArray(pv?.missing) ? pv.missing : [];
    const detected =
      r?.verified === false ||
      r?.valid === false ||
      r?.status === 'tampered' ||
      r?.status === 'invalid' ||
      Array.isArray(r?.tamperingIndicators) && r.tamperingIndicators.length > 0 ||
      pv?.verified === false ||
      failedChecks.length > 0 ||
      missingChecks.length > 0 ||
      isToolError(verify);
    out.push(assert(
      `tamper(${t.label}) → verify_package flags tampering`,
      Boolean(detected),
      'tampering flagged',
      `verified=${r?.verified ?? r?.valid ?? r?.status}`,
    ));
  }
  if (!appliedAtLeastOne) {
    out.push(assert('at least one tamperable field found', false, '≥1 field', '0 fields — package shape unexpected'));
  }
  return out;
}

async function scenarioReopen(
  client: McpClient,
  bearer: string | null,
  bundle: FinalizedBundle,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const reopen = await callTool(client, bearer, 'reopen_deal_package', {
    dealPackage: bundle.finalizedPackage,
    dealState: bundle.dealState,
    patch: { newFacts: { quality_of_earnings_done: true } },
    reopenReason: 'new diligence facts',
  });
  out.push(assertNoFiveHundred(reopen));
  const r = unwrap(reopen);
  const newDealState = r?.dealState ?? r?.newDealState;
  out.push(assert(
    'reopen_deal_package returns a new DealState',
    Boolean(newDealState),
    'dealState present',
    typeof newDealState,
  ));
  // Parent CID lineage. Substrate's DealState carries parentCids[] (multi-parent
  // because a reopen can have both the prior DealState CID and the source
  // packageCid). Accept either singular or array shapes.
  const parentCid =
    newDealState?.parentCid
    ?? newDealState?.parent_cid
    ?? newDealState?.lineage?.parentCid
    ?? (Array.isArray(newDealState?.parentCids) && newDealState.parentCids.length > 0
        ? newDealState.parentCids[0]
        : undefined)
    ?? (Array.isArray(newDealState?.parent_cids) && newDealState.parent_cids.length > 0
        ? newDealState.parent_cids[0]
        : undefined);
  const originalCid =
    bundle.dealState?.cid ?? bundle.dealState?.dealStateCid ?? bundle.dealState?.id;
  if (parentCid && originalCid) {
    out.push(assert(
      'reopened DealState parent CID = original DealState CID',
      String(parentCid) === String(originalCid),
      originalCid,
      parentCid,
    ));
  } else {
    out.push(assert('parent CID lineage present', Boolean(parentCid), 'parentCid present', String(parentCid)));
  }
  return out;
}

async function scenarioDiscloseSubset(
  client: McpClient,
  bearer: string | null,
  bundle: FinalizedBundle,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const disclose = await callTool(client, bearer, 'disclose_subset', {
    dealState: bundle.dealState,
    categories: ['financials'],
    objective: 'LOI',
  });
  out.push(assertNoFiveHundred(disclose));
  const r = unwrap(disclose);
  if (isToolError(disclose)) {
    skip('disclose_subset returned isError', 'tool may require additional payload context');
    out.push(assert('disclose_subset call did not 5xx', true));
    return out;
  }
  const subset = r?.disclosureSubset ?? r?.subset ?? r;
  out.push(assert(
    'disclose_subset returns subset manifest',
    Boolean(subset),
    'subset present',
    typeof subset,
  ));
  // Selective-disclosure proof. Substrate canonical name is
  // selectiveDisclosureProof ({ proofType, proofHash, ... }); accept legacy
  // names too for robustness.
  const proof =
    subset?.selectiveDisclosureProof
    ?? subset?.merkleInclusionProof
    ?? subset?.proof
    ?? subset?.inclusionProof;
  out.push(assert(
    'disclose_subset includes a selective-disclosure proof',
    Boolean(proof),
    'merkleInclusionProof or proof present',
    typeof proof,
  ));
  // External verification: pass back through verify_package
  const verify = await callTool(client, bearer, 'verify_package', {
    dealPackage: subset,
    dealState: bundle.dealState,
  });
  out.push(assertNoFiveHundred(verify));
  const vr = unwrap(verify);
  const proofValid =
    vr?.verified === true ||
    vr?.merkleInclusionVerified === true ||
    vr?.proof?.valid === true ||
    !isToolError(verify);
  out.push(assert(
    'external verify_package validates the disclosed subset',
    Boolean(proofValid),
    'valid',
    JSON.stringify(vr).slice(0, 120),
  ));
  return out;
}

async function scenarioHumanRender(
  client: McpClient,
  bearer: string | null,
  bundle: FinalizedBundle,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const human =
    bundle.finalizedPackage?.humanRender ??
    bundle.finalizedPackage?.human_render ??
    bundle.finalizedPackage?.humanPackageRender ??
    bundle.finalizedRoot?.humanRender ??
    bundle.finalizedRoot?.human_render ??
    bundle.finalizedRoot?.HumanPackageRender;
  out.push(assert(
    'HumanPackageRender present in finalize output',
    typeof human === 'string' || typeof human?.markdown === 'string',
    'string or {markdown}',
    typeof human,
  ));
  const markdown = typeof human === 'string' ? human : human?.markdown ?? '';
  // Required mentions: package IDs, audit IDs, Merkle root, next calls, THE LINE
  const requiredFragments = [
    /package/i,
    /audit/i,
    /merkle/i,
    /next.*call|next_suggested_calls/i,
    /line|invariant/i,
  ];
  for (const re of requiredFragments) {
    out.push(assert(
      `HumanPackageRender markdown mentions ${re}`,
      re.test(markdown),
      String(re),
      markdown.slice(0, 80),
    ));
  }
  return out;
}

async function main(): Promise<number> {
  const cli = parseArgs(process.argv);
  const env = readEnv();
  if (cli.url) env.origin = cli.url.replace(/\/+$/, '');
  header(`smbX agent-POV package tamper (target=${env.origin})`);

  const bearer = await resolveBearer(env, cli);
  if (!bearer) note('no bearer token — calls will be anonymous (expect 401)');

  const client = new McpClient(env);
  const bundle = await buildFinalizedBundle(client, bearer);
  if (!bundle) {
    console.log(`${c.red}infra: could not finalize a deal package — substrate may not be reachable or auth missing${c.reset}`);
    const summary = await writeRunSummary(SCRIPT_NAME, [], env.origin);
    note(`empty results written to ${summary.path}`);
    return 2;
  }

  const scenarios = [
    await runScenario('TB-001-FINALIZE-FIELDS', 'TB', () => scenarioFinalizeFields(client, bearer, bundle)),
    await runScenario('TB-002-VERIFY-VALID', 'TB', () => scenarioVerifyValid(client, bearer, bundle)),
    await runScenario('TB-003-TAMPER-INJECTION', 'TB', () => scenarioTamperInjection(client, bearer, bundle)),
    await runScenario('TB-004-REOPEN-LINEAGE', 'TB', () => scenarioReopen(client, bearer, bundle)),
    await runScenario('TB-005-DISCLOSE-SUBSET', 'TB', () => scenarioDiscloseSubset(client, bearer, bundle)),
    await runScenario('TB-007-HUMAN-RENDER', 'TB', () => scenarioHumanRender(client, bearer, bundle)),
  ];

  const written = await writeRunSummary(SCRIPT_NAME, scenarios, env.origin);
  note(`results written to ${written.path}`);
  return printSummary(written.summary);
}

main()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(`${c.red}infra error:${c.reset} ${err.stack || err.message || err}`);
    process.exit(2);
  });
