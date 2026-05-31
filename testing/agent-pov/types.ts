/**
 * Shared type contracts for the agent-POV substrate test suite.
 *
 * All harnesses, fixtures, and asserters import from this file. Adding a new
 * test type means adding it here first so every harness picks it up.
 *
 * Read the test plan first: TEST_PLAN_SUBSTRATE_AGENT_POV.md at the repo root.
 */

// ─── Common primitives ─────────────────────────────────────

export type TierId = 'free' | 'solo' | 'pro' | 'team' | 'enterprise';

export type Journey = 'buy' | 'sell' | 'raise' | 'pmi';

export type SubJourney =
  | 'healthy_buy_side' | 'distressed_buy_side' | 'strategic_tuck_in'
  | 'principal_seller' | 'owner_rep' | 'banker_led' | 'broken_auction'
  | 'early_stage_raise' | 'growth_raise' | 'debt_raise' | 'secondary_raise'
  | 'pmi_day_0' | 'pmi_stabilization' | 'pmi_assessment' | 'pmi_optimization';

export type League = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'L9' | 'L10';

export type DistressPosture = 'healthy' | 'partial_distress' | 'full_distress' | 'unknown';
export type AssetClass = 'operating_co' | 'real_estate' | 'ip_heavy' | 'mixed' | 'unknown';
export type TaxClassification = 'c_corp' | 's_corp' | 'llc_partnership' | 'pass_through' | 'foreign_entity' | 'unknown';

/** Money is always in cents. Never floats. (See CLAUDE.md Critical Rule #10.) */
export type Cents = number;

// ─── Payload fixture (declarative JSON under payloads/) ───

export interface PayloadFixture {
  /** Unique ID, e.g. "PC-SPARSE-L4-BUY-001" */
  id: string;
  /** One of the payload categories from test plan §3.2 */
  category:
    | 'SPARSE' | 'PARTIAL' | 'RICH' | 'CONTRADICTORY' | 'AMBIGUOUS'
    | 'GARBAGE' | 'CROSS_DOMAIN' | 'VERSION' | 'FUZZ'
    | 'LINE_VIOLATION';
  /** Human description of what this fixture is testing */
  description: string;
  /** The actual payload sent to ingest_deal_payload (or other tool) */
  payload: Record<string, unknown>;
  /** Which MCP tool to invoke. Defaults to ingest_deal_payload. */
  tool?: string;
  /** Expected response shape — fields the harness should assert on */
  expectations: PayloadExpectations;
  /** Optional metadata for grouping/filtering */
  tags?: string[];
}

export interface PayloadExpectations {
  /** Must return a structured response (never 500). Default true. */
  structuredResponse?: boolean;
  /** Expected response category */
  responseType: 'classification_with_work' | 'classification_with_missing_inputs' | 'refusal' | 'structured_error';
  /** Expected classification fields (partial match — assert these are present + correct) */
  classification?: {
    journey?: Journey;
    subJourney?: SubJourney;
    league?: League;
    leagueGuess?: League; // for sparse cases where league is inferred
    jurisdiction?: string;
    industry?: string;
    distressPosture?: DistressPosture;
    assetClass?: AssetClass;
    taxClassification?: TaxClassification;
  };
  /** Fields that MUST appear in the missing-input contract */
  missingFields?: string[];
  /** Fields that should NOT appear in the missing-input contract (already provided) */
  notMissingFields?: string[];
  /** next_suggested_calls must include at least these tool names */
  nextCallsInclude?: string[];
  /** If refusal expected, the refusal envelope type */
  refusalType?: 'LINE_VIOLATION' | 'human_approval_required' | 'counsel_review_required' | 'enterprise_scope_required' | 'credit_budget_required' | 'unsupported_version' | 'malformed_payload';
  /** If LINE_VIOLATION, the violation_type field value */
  lineViolationType?: string;
  /** Substrate must persist DealState (CID returned, retrievable via get_deal_state). Default true unless refusal. */
  persistsDealState?: boolean;
  /** Response must include methodology + spec version pins. Default true. */
  versionPins?: boolean;
  /** Response must write an audit row. Default true for authenticated calls. */
  auditRowWritten?: boolean;
}

// ─── Deal simulation (TypeScript module under simulations/) ───

export interface DealSimulation {
  /** Unique ID, e.g. "SIM-L4-BUY-SELL-HEALTHY-001" */
  id: string;
  /** Human description */
  description: string;
  /** League */
  league: League;
  /** Primary journey (a BUY-SELL simulation is journey:'buy' from one side, 'sell' from the other) */
  journeys: Journey[];
  /** Canonical truth — both sides derive their payloads from this */
  factPattern: CanonicalDealFacts;
  /** Party scripts that run against the substrate */
  parties: PartyScript[];
  /** Assertions that should hold across the parties' outputs */
  symmetry: SymmetryRule[];
  /** Assertions that must NOT hold (no info leakage across parties) */
  isolation: IsolationRule[];
  /** Prohibited requests that must return identical refusal regardless of asking side */
  refusals: RefusalScenario[];
  /** Each party must reach a defined endpoint */
  completion: CompletionCriterion[];
  /** Required tier for each party (so the runner can mint correct entitlements) */
  partyTiers?: Record<string, TierId>;
}

export interface CanonicalDealFacts {
  /** Free-text scenario summary for human readers */
  summary: string;
  /** Industry, NAICS, jurisdiction */
  industry: string;
  naics?: string;
  jurisdiction: string;
  /** Target financials (in cents) */
  targetRevenue?: Cents;
  targetEbitda?: Cents;
  targetSde?: Cents;
  /** Deal economics (in cents) */
  purchasePrice?: Cents;
  sponsorEquity?: Cents;
  senorDebt?: Cents;
  subordinatedDebt?: Cents;
  earnout?: Cents;
  rollover?: Cents;
  /** Tax classification + structure */
  taxClassification?: TaxClassification;
  electionType?: '338(h)(10)' | '338(g)' | '336(e)' | 'none';
  /** Distress signals (if any) */
  cashRunwayDays?: number;
  fccr?: number;
  securedDebtPriceCents?: number; // out of 100
  /** Asset/jurisdiction overlays */
  assetClass?: AssetClass;
  foreignSeller?: boolean;
  /** Free-form additional fields */
  extra?: Record<string, unknown>;
}

export interface PartyScript {
  /** Role this party plays */
  role: 'buyer' | 'seller' | 'owner_rep' | 'banker' | 'issuer' | 'investor' | 'borrower' | 'lender' | 'pmi_acquirer' | 'pmi_target_mgmt';
  /** Unique agent identity for this party (for audit isolation) */
  agentIdentity: string;
  /** Beneficial customer this party represents */
  beneficialCustomer: string;
  /** Tier this party operates under */
  tier: TierId;
  /** Ordered tool calls this party makes */
  callSequence: PartyToolCall[];
  /** Function that derives this party's payload from the canonical fact pattern */
  payloadFromTruth: (facts: CanonicalDealFacts) => Record<string, unknown>;
}

export interface PartyToolCall {
  /** Step name for results reporting */
  step: string;
  /** MCP tool to call */
  tool: string;
  /** Input — either static, a function of party state, or 'derived' (from prior step) */
  input: Record<string, unknown> | ((state: Record<string, unknown>) => Record<string, unknown>);
  /** Per-call expectations the runner asserts */
  expect: Partial<PayloadExpectations> & {
    /** Specific tool output fields to capture into party state for later steps */
    captureToState?: string[];
  };
}

// ─── Cross-party rules ─────────────────────────────────────

export interface SymmetryRule {
  /** Human description, e.g. "valuation ranges overlap" */
  description: string;
  /** Field path to compare across party outputs, e.g. "valuation.range" */
  field: string;
  /** Comparison mode */
  mode: 'overlap' | 'equal' | 'within_tolerance' | 'subset';
  /** Tolerance for `within_tolerance` mode (as fraction, e.g. 0.05 = 5%) */
  tolerance?: number;
  /** Parties to compare (by role). If omitted, compares all parties pairwise. */
  parties?: string[];
}

export interface IsolationRule {
  /** Human description, e.g. "buyer's bid never appears in seller output" */
  description: string;
  /** Field on the source party that should NOT appear in target party's output */
  sourceField: string;
  /** Source party role */
  sourceParty: string;
  /** Target party role */
  targetParty: string;
  /** Search depth in target party's output */
  searchDepth?: number;
}

export interface RefusalScenario {
  /** Human description, e.g. "asking to negotiate is refused regardless of side" */
  description: string;
  /** The prohibited request payload */
  prohibitedRequest: {
    tool: string;
    input: Record<string, unknown>;
  };
  /** Expected refusal type */
  expectedRefusal: 'LINE_VIOLATION' | 'human_approval_required' | 'counsel_review_required';
  /** If LINE_VIOLATION, the violation_type value */
  lineViolationType?: string;
  /** Which parties this refusal applies to. Default: all. */
  parties?: string[];
}

export interface CompletionCriterion {
  /** Party role this applies to */
  party: string;
  /** Endpoint description, e.g. "reaches finalize_deal_package with all gates green" */
  endpoint: string;
  /** Minimum number of audit rows expected for this party */
  minAuditRows?: number;
  /** Required final tool calls */
  requiredFinalCalls?: string[];
}

// ─── HTTP response (re-exported from runner-helpers for harness convenience) ───
//
// Several harnesses import McpResponse from this module. The implementation lives
// in runner-helpers.ts (where the McpClient class is defined); we re-export the
// type here so harnesses can do `import type { McpResponse } from '../types.js'`
// alongside their other type imports without having to know it lives in helpers.
export type { McpResponse } from './runner-helpers.js';

// ─── Runner results ────────────────────────────────────────

export interface ScenarioResult {
  id: string;
  category: 'PC' | 'DS' | 'TL' | 'MM' | 'SI' | 'MC' | 'TB' | 'CV' | 'FM' | 'AU' | 'DC' | 'NS';
  status: 'pass' | 'fail' | 'skip' | 'error';
  durationMs: number;
  assertions: AssertionResult[];
  notes?: string;
  /** Files / outputs produced by this scenario */
  artifacts?: { name: string; path: string }[];
}

export interface AssertionResult {
  description: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  diff?: string;
}

export interface RunSummary {
  runId: string;
  startedAt: string;
  finishedAt: string;
  target: string; // origin URL
  scenarios: ScenarioResult[];
  totalPass: number;
  totalFail: number;
  totalSkip: number;
  totalError: number;
}
