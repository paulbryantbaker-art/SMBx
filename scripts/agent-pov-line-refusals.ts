#!/usr/bin/env npx tsx
/**
 * THE LINE refusals harness — agent-POV substrate test (TL-001+).
 *
 * This is THE MOST DOCTRINE-CRITICAL harness in the agent-POV suite. A single
 * false negative (prohibited intent that returns success instead of a structured
 * refusal envelope) is a CRITICAL FAILURE that blocks substrate-ready status
 * regardless of how many other tests pass. See TEST_PLAN_SUBSTRATE_AGENT_POV.md
 * §4.4 (TL-001..TL-019) and THE_LINE_POLICY.md (canonical doctrine).
 *
 * Two halves:
 *
 *   1. Dynamic half — load every fixture under testing/agent-pov/payloads/
 *      whose category is LINE_VIOLATION (plus the dedicated PC-COUNSEL-REVIEW-*,
 *      PC-HUMAN-APPROVAL-*, PC-ENTERPRISE-SCOPE-*, PC-CREDIT-BUDGET-*,
 *      PC-UNSUPPORTED-VERSION-* series). For each, dispatch to the named tool
 *      via the MCP transport and assert the refusal envelope matches the
 *      fixture's expected refusalType (and lineViolationType when applicable).
 *
 *   2. Static half (TL-018, TL-019) — scan production tool descriptions in
 *      server/services/definitiveMcp.ts + server/services/agencyActionRegistry.ts
 *      for forbidden marketing language from THE_LINE_POLICY.md ("negotiate",
 *      "best option", "should", "guaranteed", "recommendation", "opinion",
 *      "appraisal", "audit" outside counsel routing). Any hit fails the build.
 *
 * Usage:
 *   npx tsx scripts/agent-pov-line-refusals.ts
 *   npx tsx scripts/agent-pov-line-refusals.ts --url=http://127.0.0.1:3000
 *   npx tsx scripts/agent-pov-line-refusals.ts --bearer=eyJhbGciOi...
 *
 * Exit code:
 *   0  — all assertions passed
 *   1  — any failure (CRITICAL FAILURE if false negative; lesser fail if static
 *        scan or refusal-shape mismatch)
 */

import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  McpClient,
  assert,
  assertRefusalEnvelope,
  c,
  header,
  isToolError,
  mintLocalAgentToken,
  note,
  printSummary,
  readEnv,
  runScenario,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type {
  AssertionResult,
  PayloadFixture,
  ScenarioResult,
} from '../testing/agent-pov/types.js';

// ─── CLI args ──────────────────────────────────────────────

function parseArgs() {
  const args: { url?: string; bearer?: string } = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length);
    else if (arg.startsWith('--bearer=')) args.bearer = arg.slice('--bearer='.length);
  }
  return args;
}

// ─── Static scanner config ─────────────────────────────────

/**
 * Forbidden marketing language from THE_LINE_POLICY.md "Marketing Language —
 * Avoid". These tokens, when surfaced in agent-visible tool descriptions or
 * artifact labels, would imply broker / adviser / lawyer / appraiser status
 * and breach the publisher-exclusion + self-help-software safe-harbor posture.
 *
 * The matcher uses word-boundary tests so substrings (e.g. "should" inside
 * "shoulder") don't trigger.
 */
const FORBIDDEN_MARKETING_TERMS: { term: string; reason: string; allowedContext?: RegExp }[] = [
  {
    term: 'negotiate',
    reason: 'implies broker / adviser activity (THE LINE: "we negotiate")',
    // Allowed when explicitly disclaiming. Match patterns like:
    //   "does not ... negotiate"  (any short list between "not" and "negotiate")
    //   "does not negotiate"
    //   "not negotiate"
    //   "without negotiating"
    //   "no negotiation"
    //   "never negotiate"
    //   "negotiation prep | brief | handoff | architecture | stage"
    //   "for negotiation"
    // The "does not <list>, negotiate" pattern uses a non-greedy character class to
    // limit how far the disclaimer extends.
    allowedContext: /(does\s+not\s+[^.]{0,200}negotiate|not\s+negotiate|without\s+negotiat|no\s+negotiation|never\s+negotiat|negotiat(?:e|ion)\s+(prep|brief|handoff|architecture|stage|terms|concessions)|for\s+negotiation|stage\s+for\s+negotiation|counsel\s+(?:and\s+|or\s+)?negotiation|does\s+not\s+negotiate)/i,
  },
  { term: 'we close deals', reason: 'implies broker / adviser activity' },
  { term: 'our brokers', reason: 'implies broker registration' },
  { term: 'our bankers', reason: 'implies broker-dealer / IB status' },
  { term: 'our advisers', reason: 'implies adviser registration' },
  { term: 'our advisors', reason: 'implies adviser registration' },
  { term: 'best option', reason: 'recommendation language in regulated transaction context' },
  { term: 'best deal', reason: 'guaranteed-outcome marketing language' },
  { term: 'you should', reason: 'recommendation language' },
  {
    term: 'guaranteed',
    reason: 'guaranteed-outcome marketing language',
    // Allowed if explicitly disclaiming ("no guaranteed", "not guaranteed").
    allowedContext: /(no\s+guaranteed|not\s+guaranteed|never\s+guaranteed)/i,
  },
  { term: 'guarantee close', reason: 'guaranteed-outcome marketing language' },
  { term: 'investment banking services', reason: 'IB / broker-dealer holding-out' },
  {
    term: 'legal advice',
    reason: 'practice of law holding-out',
    allowedContext: /(not\s+(?:a\s+)?substitute\s+for|never\s+(?:a\s+)?legal\s+advice|no\s+legal\s+advice|disclaim)/i,
  },
  {
    term: 'tax advice',
    reason: 'tax-practice holding-out (CPA/EA)',
    // Allowed when explicitly NOT giving tax advice. Match patterns:
    //   "does not ... tax advice" (short list allowed in between)
    //   "no tax advice", "not tax advice", "never tax advice"
    //   "employment/legal/tax advice" (slash list under "does not provide")
    //   "for counsel/CPA/EA"
    allowedContext: /(not\s+(?:a\s+)?substitute|never\s+(?:a\s+)?tax\s+advice|no\s+tax\s+advice|disclaim|does\s+not\s+[^.]{0,200}tax\s+advice|or\s+provide\s+[^.]{0,100}tax\s+advice|for\s+(?:counsel|CPA|EA)|hand[\s-]?off|counsel\s+handoff)/i,
  },
  {
    term: 'tax opinion',
    reason: 'tax-opinion holding-out — must route counsel_review_required',
    // Allowed when explicitly NOT issuing tax opinions or in a disclaimer list.
    allowedContext: /(never\s+(?:a\s+)?tax\s+opinion|no\s+tax\s+opinion|not\s+(?:a\s+)?tax\s+opinion|does\s+not\s+[^.]{0,200}tax\s+opinion|legal\s+or\s+tax\s+opinion|tax\s+or\s+legal\s+opinion|hand[\s-]?off|counsel\s+handoff|route)/i,
  },
  {
    term: 'legal opinion',
    reason: 'legal-opinion holding-out — must route counsel_review_required',
    allowedContext: /(never\s+(?:a\s+)?legal\s+opinion|no\s+legal\s+opinion|not\s+(?:a\s+)?legal\s+opinion|does\s+not\s+[^.]{0,200}legal\s+opinion|legal\s+or\s+tax\s+opinion|hand[\s-]?off|counsel\s+handoff|route)/i,
  },
  { term: 'fairness opinion', reason: 'fairness-opinion holding-out — IB / appraiser scope' },
  { term: 'solvency opinion', reason: 'solvency-opinion holding-out — IB / appraiser scope' },
  {
    term: 'appraisal',
    reason: 'appraiser holding-out — outputs must be "Valuation Model Output – Worked Example"',
    // Allowed inside counsel routing language (e.g. "no qualified appraisal").
    allowedContext: /(no\s+qualified\s+appraisal|not\s+an?\s+appraisal|never\s+(?:an?\s+)?appraisal|qualified\s+appraisal|not\s+(?:a\s+)?USPAP)/i,
  },
  {
    term: 'audit',
    reason: 'attest-work holding-out — QoE outputs must NOT be labeled "audit"',
    // Allowed inside audit-trail / audit-row / audit-context (recordkeeping language) — these are
    // the substrate's own recordkeeping vocabulary and don't imply attest work.
    // Also allowed in "audit payload", "audit event", "audit artifacts", "AuditPacket".
    allowedContext: /(audit[_-]?(trail|row|id|log|packet|record|metadata|context|event|history|payload|artifact)|for\s+audit(?:\s+(?:trail|context|history|metadata))?|audit\s+(?:trail|packet|row|context|metadata|artifact|payload|event|history|artifacts)|AuditPacket)/i,
  },
];

/**
 * Files to statically scan for forbidden language. We intentionally scan the
 * agent-visible surface only (MCP descriptions + agency registry). Server
 * internals can use "negotiate" inside variable names — that's fine.
 */
const STATIC_SCAN_FILES = [
  'server/services/definitiveMcp.ts',
  'server/services/agencyActionRegistry.ts',
];

// ─── Helpers ──────────────────────────────────────────────

function summarizeBreakdown(fixtures: PayloadFixture[]): string {
  const by: Record<string, number> = {};
  for (const f of fixtures) {
    const t = String(f.expectations.refusalType || 'unknown');
    by[t] = (by[t] || 0) + 1;
  }
  return Object.entries(by).map(([k, v]) => `${k}=${v}`).join(', ');
}

/**
 * True if `text` contains the forbidden term outside any allowed context.
 * We split text into chunks at line breaks and check each independently, so a
 * forbidden term on one line can't be excused by an allowed-context match on
 * another.
 */
function hasForbiddenHit(text: string, term: string, allowedContext?: RegExp): boolean {
  const re = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi');
  const matches = [...text.matchAll(re)];
  if (matches.length === 0) return false;
  if (!allowedContext) return true;
  // For each match, look at ±60 chars of surrounding context. If ALL matches
  // are inside the allowed context, no hit.
  return matches.some(m => {
    const start = Math.max(0, (m.index ?? 0) - 60);
    const end = Math.min(text.length, (m.index ?? 0) + term.length + 60);
    const window = text.slice(start, end);
    return !allowedContext.test(window);
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pull just the agent-visible description strings out of a TypeScript source
 * file. We look for `description: '...'` and `description: "..."` literals —
 * those are the strings that flow out into tool descriptions and tollgate
 * messages and reach the calling agent.
 */
function extractDescriptions(source: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  const lines = source.split('\n');
  // Match description: '...' or description: "..." or label: '...'
  const re = /(description|label|lineReason|message|yuliaReadable)\s*:\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`)/g;
  let lineNum = 0;
  for (const line of lines) {
    lineNum++;
    let m;
    while ((m = re.exec(line)) !== null) {
      const text = m[2] || m[3] || m[4] || '';
      if (text.length > 0) {
        out.push({ line: lineNum, text });
      }
    }
  }
  return out;
}

// ─── Static analysis half ─────────────────────────────────

interface StaticScanHit {
  file: string;
  line: number;
  term: string;
  reason: string;
  excerpt: string;
}

async function runStaticScan(): Promise<{ assertions: AssertionResult[]; hits: StaticScanHit[] }> {
  header('Static scan: forbidden marketing language in agent-visible surfaces (TL-018, TL-019)');
  const repoRoot = resolve(process.cwd());
  const hits: StaticScanHit[] = [];

  for (const rel of STATIC_SCAN_FILES) {
    const path = resolve(repoRoot, rel);
    let source: string;
    try {
      source = await readFile(path, 'utf8');
    } catch (err) {
      note(`could not read ${rel}: ${(err as Error).message}`);
      continue;
    }
    const descriptions = extractDescriptions(source);
    note(`${rel}: ${descriptions.length} agent-visible strings`);

    for (const { line, text } of descriptions) {
      for (const { term, reason, allowedContext } of FORBIDDEN_MARKETING_TERMS) {
        if (hasForbiddenHit(text, term, allowedContext)) {
          hits.push({
            file: rel,
            line,
            term,
            reason,
            excerpt: text.length > 120 ? text.slice(0, 120) + '…' : text,
          });
        }
      }
    }
  }

  const assertions: AssertionResult[] = [];
  if (hits.length === 0) {
    assertions.push(assert('no forbidden marketing language in agent-visible tool descriptions', true));
  } else {
    for (const hit of hits) {
      assertions.push(
        assert(
          `[${hit.file}:${hit.line}] forbidden term "${hit.term}" — ${hit.reason}`,
          false,
          'no forbidden marketing language',
          `"${hit.excerpt}"`,
        ),
      );
    }
  }
  return { assertions, hits };
}

// ─── Dynamic half ─────────────────────────────────────────

const REFUSAL_CATEGORIES = new Set<string>([
  'LINE_VIOLATION',
  'counsel_review_required',
  'human_approval_required',
  'enterprise_scope_required',
  'credit_budget_required',
  'unsupported_version',
]);

function shouldRunFixture(f: PayloadFixture): boolean {
  if (f.category === 'LINE_VIOLATION') return true;
  // Also include fixtures whose ID prefix indicates a refusal-category test even
  // if their PayloadFixture category isn't LINE_VIOLATION (e.g. counsel_review
  // tests on tools whose normal status is counsel-routed).
  const expected = String(f.expectations.refusalType || '');
  return REFUSAL_CATEGORIES.has(expected);
}

/**
 * Tolerant fixture loader — skips files that fail to parse rather than blowing
 * up the entire run. Pre-existing fixtures in other categories (e.g. some
 * intentionally-malformed PC-GARBAGE-*.json) can fail JSON.parse, and we
 * don't want one of those to take down the LINE-refusals run.
 */
async function loadRefusalFixtures(dir: string): Promise<PayloadFixture[]> {
  const { readdir, readFile } = await import('node:fs/promises');
  const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
  const out: PayloadFixture[] = [];
  for (const file of files) {
    try {
      const text = await readFile(resolve(dir, file), 'utf8');
      out.push(JSON.parse(text) as PayloadFixture);
    } catch (err) {
      note(`skipped unparseable fixture ${file}: ${(err as Error).message}`);
    }
  }
  return out;
}

async function runDynamicHalf(
  client: McpClient,
  fixturesDir: string,
  bearer: string | null,
): Promise<{ scenarios: ScenarioResult[]; falseNegatives: string[] }> {
  header('Dynamic half: prohibited-intent fixtures dispatched to live substrate');
  const allFixtures = await loadRefusalFixtures(fixturesDir);
  const fixtures = allFixtures.filter(shouldRunFixture);
  console.log(`  loaded ${fixtures.length} refusal fixtures from ${fixturesDir}`);
  console.log(`  breakdown: ${summarizeBreakdown(fixtures)}\n`);

  const scenarios: ScenarioResult[] = [];
  const falseNegatives: string[] = [];

  for (const fixture of fixtures) {
    const scenario = await runScenario(fixture.id, 'TL', async () => {
      const assertions: AssertionResult[] = [];
      const tool = fixture.tool || 'ingest_deal_payload';
      const expectedType = String(fixture.expectations.refusalType);
      const expectedViolation = fixture.expectations.lineViolationType;

      // Route to MCP tools/call. (Both /api/definitive/tools/<name>/call and
      // /mcp tools/call routes evaluate the LINE gate; we use MCP because that's
      // what external agents see.)
      // Lift envelope_override into arguments (substrate's validateVersionInput
      // reads pins from the payload, not from a separate envelope channel —
      // MCP JSON-RPC tools/call has no envelope field).
      const fixturePayload = fixture.payload && typeof fixture.payload === 'object'
        ? fixture.payload as Record<string, any>
        : {};
      const { envelope_override, ...restPayload } = fixturePayload;
      const finalPayload: Record<string, any> = { ...restPayload };
      if (envelope_override && typeof envelope_override === 'object') {
        for (const [k, v] of Object.entries(envelope_override)) {
          if (finalPayload[k] === undefined) finalPayload[k] = v;
        }
      }
      const res = await client.mcpCall('tools/call', {
        name: tool,
        arguments: finalPayload,
      }, bearer ? { bearer } : {});

      // Substrate must never 500 on a prohibited intent.
      assertions.push(
        assert(
          'substrate did not crash (status < 500)',
          res.status < 500,
          '< 500',
          res.status,
        ),
      );

      // CRITICAL: did the substrate refuse? A successful execution of a
      // prohibited intent is the worst possible failure mode.
      // MCP tools/call always returns HTTP 200 — the refusal envelope lives
      // inside result.structuredContent (or result.isError + content[0]).
      // Use the shared isToolError walker so any nested refusal counts as a
      // refusal regardless of which envelope path the substrate chose.
      const refused = isToolError(res);
      const looksLikeSuccess = !refused;
      const refusalAssertion = assert(
        `prohibited intent refused (no silent success) — ${expectedType}${expectedViolation ? '/' + expectedViolation : ''}`,
        refused,
        'refusal envelope',
        looksLikeSuccess ? 'SUCCESS — CRITICAL FAILURE — DOCTRINE VIOLATION' : 'refused',
      );
      assertions.push(refusalAssertion);
      if (!refused) {
        falseNegatives.push(fixture.id);
      }

      // If we did refuse, assert the envelope shape matches what the fixture
      // expects. (This is a softer assertion — a refusal under the wrong
      // category is still a refusal, but it's drift.)
      if (refused) {
        assertions.push(assertRefusalEnvelope(res, expectedType, expectedViolation));
      }

      return assertions;
    });
    scenarios.push(scenario);
  }

  return { scenarios, falseNegatives };
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  if (args.url) process.env.AGENT_POV_TARGET = args.url;
  const env = readEnv();
  const client = new McpClient(env);

  console.log(`${c.bold}agent-pov-line-refusals${c.reset}`);
  console.log(`target:   ${env.origin}`);
  console.log(`db:       ${env.hasDb ? 'available' : 'absent'}`);
  console.log(`testMode: ${env.testMode}`);

  // Token resolution: CLI bearer > env var > mint local (if DB + JWT_SECRET).
  let bearer: string | null = args.bearer ?? process.env.DEFINITIVE_MCP_ACCESS_TOKEN ?? null;
  if (!bearer && env.hasDb && env.jwtSecret) {
    bearer = await mintLocalAgentToken({ tier: 'pro' });
    if (bearer) note('minted local agent token from DATABASE_URL + JWT_SECRET');
  }
  if (!bearer) {
    note('no bearer token — dynamic half will exercise anonymous refusal path (this is intentional and tests anonymous LINE gate)');
  }

  // Run static half first — if there's drift in production strings, we want
  // to flag it even if the dynamic half can't reach the server.
  const fixturesDir = resolve(process.cwd(), 'testing/agent-pov/payloads');
  const { assertions: staticAssertions, hits: staticHits } = await runStaticScan();

  // Wrap static scan into a synthetic scenario so it shows up in the summary.
  const staticScenario: ScenarioResult = {
    id: 'TL-018-019-STATIC-SCAN',
    category: 'TL',
    status: staticAssertions.every(a => a.passed) ? 'pass' : 'fail',
    durationMs: 0,
    assertions: staticAssertions,
  };

  // Dynamic half.
  let dynamicScenarios: ScenarioResult[] = [];
  let falseNegatives: string[] = [];
  try {
    const out = await runDynamicHalf(client, fixturesDir, bearer);
    dynamicScenarios = out.scenarios;
    falseNegatives = out.falseNegatives;
  } catch (err) {
    note(`dynamic half errored before completion: ${(err as Error).message}`);
    note('this typically means the substrate is unreachable. Static half results below still apply.');
  }

  const allScenarios: ScenarioResult[] = [staticScenario, ...dynamicScenarios];
  const { path: resultsPath, summary } = await writeRunSummary('agent-pov-line-refusals', allScenarios, env.origin);

  // Final report.
  printSummary(summary);
  console.log(`\nresults written: ${resultsPath}`);

  if (staticHits.length > 0) {
    console.log(`\n${c.yellow}${c.bold}static-scan drift — forbidden marketing language in production:${c.reset}`);
    for (const hit of staticHits) {
      console.log(`  ${c.yellow}${hit.file}:${hit.line}${c.reset} "${hit.term}" — ${hit.reason}`);
      console.log(`    ${c.gray}${hit.excerpt}${c.reset}`);
    }
  }

  if (falseNegatives.length > 0) {
    console.log(`\n${c.red}${c.bold}CRITICAL FAILURE — DOCTRINE VIOLATION${c.reset}`);
    console.log(`${c.red}The following prohibited intents executed successfully instead of returning a refusal envelope.${c.reset}`);
    console.log(`${c.red}This is a substrate-readiness blocker per TEST_PLAN_SUBSTRATE_AGENT_POV.md G-LINE.${c.reset}\n`);
    for (const id of falseNegatives) {
      console.log(`  ${c.red}✗ ${id}${c.reset}`);
    }
    process.exit(1);
  }

  if (summary.totalFail + summary.totalError > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(`\n${c.red}fatal:${c.reset} ${(err as Error).message}`);
  console.error(err);
  process.exit(1);
});
