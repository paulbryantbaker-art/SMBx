# Substrate Agent-POV Test Plan

**Last updated:** 2026-05-27 (v2 — payload-classification + deal-simulation architecture)
**Scope:** Test the smbX DEFINITIVE substrate as an **external asking agent** experiences it — any agent, any payload, any entry point in any deal process.
**Out of scope:** Yulia conversation flow inside the smbX app, marketplace listing copy, Stripe billing UX polish, web/mobile UI polish, distribution/launch operations. Those are tracked separately and gated by `npm run launch-readiness`.

This plan is the substrate-readiness gate. Substrate is "agent-ready" when every category below passes.

## v2 architectural change

The previous version of this plan enumerated 10 named personas and one-side lifecycle scenarios. That was wrong. The substrate cannot predefine its callers — it has to **infer** what's needed from whatever payload arrives, and produce useful work or a graceful missing-input contract. So v2 replaces:

| v1 | v2 |
|---|---|
| Persona enumeration (P1-P10) | **Payload classification surface** — axes of payload variation, sampled including fuzz tests. Substrate's job is to handle the unbounded variety. |
| Lifecycle scenarios (one side, happy path) | **Deal simulations** — same underlying fact pattern run from BOTH parties (buy+sell, issuer+investor, borrower+lender). Proves symmetry, isolation, and THE LINE consistency regardless of asking side. |
| 13 one-off scripts | **15 core harnesses + ~100 parameterized simulation fixtures.** Adding a new deal scenario = adding a fixture file, not writing a script. Scales to hundreds of simulations. |

---

## 1. Purpose

Test whether **any external agent**, arriving at smbX **at any point in a deal lifecycle**, with **any level of context**, can:

1. **Discover** what smbX does (well-known endpoints, server card, tool inventory)
2. **Authenticate** through one of the supported OAuth flows
3. **Provide** what it has (sparse intake or rich payload — both must work)
4. **Receive** a structured response (work product, missing-input contract, or THE LINE refusal — never a 500)
5. **Make recursive progress** (`next_suggested_calls` always present)
6. **Persist state** across calls (content-addressable DealState, parent CID lineage)
7. **Take portable artifacts back** to its own system (signed `DealPackage`)
8. **Re-enter later** with the same DealState intact

The agent is any of: Claude Code, Claude Custom Connector, ChatGPT GPT Action, ChatGPT App SDK, Microsoft Copilot, Salesforce Agentforce, AWS Bedrock AgentCore, a custom-built MCP client.

---

## 2. What "substrate-ready" means (acceptance gates)

Substrate readiness requires **all of these** to pass:

| Gate | Description |
|---|---|
| G-DISCOVERY | All `.well-known` endpoints return valid, current data |
| G-AUTH | Both OAuth flows (PKCE public + confidential GPT Actions) complete end-to-end |
| G-INVENTORY | All 48 MCP tools listable, each with schema + LINE status + structured-output declaration |
| **G-PAYLOAD-CLASSIFICATION** | **Any payload — sparse, partial, rich, contradictory, malformed, off-topic, fuzzed — produces a structured response: classification + work, or classification + missing-input contract, or structured rejection. Never crashes. Never silently defaults.** |
| **G-SIMULATION-SYMMETRY** | **For every deal simulation, both sides (buy + sell, issuer + investor, borrower + lender) receive useful work; symmetry assertions hold (e.g., valuation ranges overlap, citations match); isolation assertions hold (no counterparty info leaks); THE LINE refusals are identical regardless of asking side.** |
| G-METHODOLOGY | All 30 gates routable, all 123 M-slots discoverable, all Authority Register categories queryable |
| G-LINE | Every prohibited request returns a structured `LINE_VIOLATION` envelope — never silent acceptance |
| G-STATE | DealState content-addressable, parent CID lineage tracked, deterministic state hashing |
| G-AUDIT | Every tool call writes a mandate-chain audit record with version pins, hashes, citations |
| G-PORTABLE | `finalize_deal_package` → `verify_package` round-trips with hash integrity |
| G-CALLER-PARITY | Equivalent responses from Claude / ChatGPT / direct MCP — no caller-specific quirks |
| G-FAILURE-MODES | Malformed payloads, unknown versions, stale assumptions all produce structured errors |
| G-CROSS-CUSTOMER-ISOLATION | Beneficial-customer A cannot see beneficial-customer B's DealStates, model executions, audit packets, or any data |

A failing gate = substrate is not agent-ready, regardless of how many tests pass elsewhere.

---

## 3. Payload classification surface

We do not predefine agent personas. The substrate's job is to **handle whatever payload arrives** and either (a) classify it and execute work, (b) classify it and return a complete `MissingInputContract` listing what's needed next, or (c) return a structured rejection (`LINE_VIOLATION`, malformed-payload error, unsupported-version error). Never a 500, never a silent default, never an outright "I can't help you" without telling the agent what would help.

This means the primary test surface is **the payload variety axis**, not a fixed persona list. We test the substrate's ability to classify by enumerating axes of variation and sampling the combinatorial space.

### 3.1 Payload axes (parameter space)

| Axis | Possible values |
|---|---|
| Known-fact density | sparse (1–2 fields), partial (3–7 fields), rich (8+ fields), contradictory (conflicting fields) |
| Journey signal | explicit (`journey:'buy'`), implicit (industry + role infer it), absent, ambiguous (could be buy or sell) |
| Stage signal | explicit (`stage:'loi'`), implicit (terms present infer LOI stage), absent, mid-stage (some early + some late fields) |
| League signal | explicit (`league:'L4'`), inferable from EBITDA/revenue, absent |
| Industry / NAICS | clear NAICS + jurisdiction, foreign, cross-border, multi-jurisdiction, none |
| Distress posture | healthy, partial signals (low FCCR alone), full distress (cash runway + debt prices + covenant breach), contradictory |
| Asset class | operating co, real estate primary, IP primary, mixed, unclear |
| Tax classification | C-corp, S-corp/LLC, partnership, pass-through, foreign entity, unclear, multi-entity |
| Data quality | clean, missing units, currency ambiguity, time-period unclear, contradictory totals, garbage |
| Counterparty info | none, one counterparty named, multiple counterparties, conflicting counterparty fields |
| Methodology version | explicit + supported, explicit + unknown, absent (default), unsupported |
| Idempotency key | provided + new, provided + duplicate, absent |

A test fixture is one combination of these axes. A test run is a fixture executed against the substrate, with assertions on:
- Did it return a structured response (never a 500)?
- Did the classification match expectations for these inputs?
- Did the `MissingInputContract` list every field that's actually required to advance?
- Did `next_suggested_calls` point to a tool the agent should call next?
- Did the response carry version pins, audit ID, and THE LINE invariant?

### 3.2 Payload classification categories (PC)

| Category | Count target | What's tested |
|---|---|---|
| **PC-SPARSE-*** | ~50 | Minimal payloads (1–2 fields). Substrate should classify what it can and return complete missing-input contract. |
| **PC-PARTIAL-*** | ~100 | Realistic mid-data payloads (3–7 fields). Substrate should route to model stack with appropriate gates. |
| **PC-RICH-*** | ~50 | Complete-enough payloads (8+ fields). Substrate should compose deal plan + execute applicable models. |
| **PC-CONTRADICTORY-*** | ~30 | Conflicting signals (e.g., `journey:'buy'` but seller-role fields populated). Substrate should surface the conflict, never silently pick one side. |
| **PC-AMBIGUOUS-*** | ~30 | Genuinely unclear signals (e.g., industry that could be services or real estate). Substrate should ask, not guess. |
| **PC-GARBAGE-*** | ~30 | Malformed payloads (wrong types, missing required, junk strings). Substrate should return structured 400 with field-level guidance, never 500. |
| **PC-CROSS-DOMAIN-*** | ~30 | Multi-overlay payloads (G28 + G29 + G30 simultaneous, or BUY + restructuring). Substrate should compose all applicable overlays, no overlay swallows another. |
| **PC-FUZZ-*** | ~200 (auto-generated) | Randomized payload fuzz. Substrate should never crash. Every response structured. |
| **PC-VERSION-*** | ~10 | Unknown/unsupported methodology versions. Substrate refuses with structured envelope, never silent default to current. |

**Pass criteria:** every PC-* fixture returns a structured response. The classification is reasonable (humans validating PC results would agree). The missing-input contract is complete (every advance-required field listed). Zero 500 errors across the full fuzz run.

### 3.3 Why this matters

If an external agent (an LLM, a workflow tool, a custom integration) sends a payload the substrate hasn't seen before, it must not panic, not silently default, and not refuse opaquely. Returning a clear "I see X and Y; I need Z and W to proceed" is what makes the substrate **trustable** as a callable service. Every payload that produces a 500 is a substrate bug. Every payload that silently defaults to assumptions is a substrate doctrine violation. Every payload that returns "can't help" without a missing-input contract is a UX failure that turns the substrate into a black box.

The PC- suite is the most important new addition in v2 of this plan.

---

## 4. Test categories

Each category lists test IDs, pass criteria, and existing-script coverage. Test IDs use the format `<CATEGORY>-<NUMBER>` and should map to test files under `testing/agent-pov/<category>/`.

### 4.1 Discovery & entry (DC)

| ID | Test | Pass criteria | Existing coverage |
|---|---|---|---|
| DC-001 | GET `/.well-known/agent-card.json` unauthenticated | 200 OK; valid JSON; `pricing` matches SMBX_PRICING_LOCKED.md; `methodologyVersion` matches `DEFINITIVE_METHODOLOGY_VERSION` constant | `test:definitive-surface` |
| DC-002 | GET `/.well-known/mcp/server-card.json` unauthenticated | 200 OK; `tools[]` count matches `listDefinitiveMcpTools()`; each tool has `inputSchema`, `outputSchema`, annotations | `test:definitive-surface` |
| DC-003 | GET `/.well-known/oauth-protected-resource/mcp` | 200 OK; `resource` field = `<APP_URL>/mcp`; `authorization_servers` non-empty | `test:definitive-surface` |
| DC-004 | GET `/.well-known/oauth-authorization-server` | 200 OK; PKCE supported; required endpoints present | `test:definitive-surface` (partial) |
| DC-005 | GET `/server.json` | 200 OK; conforms to MCP Registry shape; `remotes[].type === 'streamable-http'` | `test:definitive-surface` |
| DC-006 | GET `/api/definitive/openapi.json` | Valid OpenAPI 3.x; every tool has operationId; `x-smbx.pricingDeclaration` present | NEW |
| DC-007 | GET `/api/definitive/gpt-actions/openapi.json` | Valid OpenAPI focused for GPT Actions; OAuth security scheme; ≤30 tools per Actions limit | NEW |
| DC-008 | POST `/mcp` `initialize` unauthenticated | 200 OK; protocol version negotiated; server capabilities returned | `test:definitive-mcp-e2e` |
| DC-009 | POST `/mcp` `tools/list` unauthenticated | 200 OK; all 48 tools returned with schemas | `test:definitive-mcp-e2e` |
| DC-010 | POST `/mcp` `tools/call` unauthenticated | 401 with `WWW-Authenticate` header pointing at `/.well-known/oauth-protected-resource/mcp` | `test:definitive-auth-route` |
| DC-011 | Public PKCE OAuth flow: `/oauth/register` → `/oauth/authorize` → `/oauth/token` | Token returned with `aud` = `/mcp`; `scope` includes requested scopes | NEW |
| DC-012 | Confidential GPT Actions OAuth flow with `SMBX_GPT_ACTIONS_CLIENT_ID/SECRET` | Token returned bound to `/mcp` audience | NEW |
| DC-013 | Authenticated POST `/mcp` `tools/call` with valid bearer | Tool executes; structured response with `next_suggested_calls` | `test:definitive-mcp-e2e` |
| DC-014 | `/mcp` rejects token with wrong `aud` | 401 with structured refusal | NEW |
| DC-015 | `/mcp` rejects expired token | 401 with refresh guidance | NEW |

**Gate G-DISCOVERY + G-AUTH + G-INVENTORY** pass iff DC-001 through DC-015 all pass.

### 4.2 Deal simulations (DS)

A **deal simulation** is the same underlying fact pattern run from **all involved parties simultaneously**. For a BUY-SELL deal, that means simulating the buy-side agent AND the sell-side agent against the same deal facts and asserting:

- **Both sides served** — each side completes its workflow with useful, deterministic output
- **Symmetry** — outputs that should match across sides DO match (valuation ranges overlap; both sides cite the same §1060 authority; both compute the same NWC peg)
- **Isolation** — outputs that should NOT cross DO NOT (buyer's bid never appears in seller's substrate output; seller's reservation price never appears in buyer's)
- **THE LINE consistency** — same prohibited request returns same refusal envelope regardless of which side asks
- **State integrity** — separate DealStates per side, but same Authority Register citations + same model version pins + same methodology version

Single-side scenarios (the v1 approach) can't catch a substrate that subtly favors one party, leaks counterparty info, or returns asymmetric valuations. Both-sides simulation catches all three.

#### 4.2.1 Simulation matrix (league × deal type × parties)

A simulation tuple is `(league, deal_type, journey, parties[])`. The substrate must cover (at minimum) one simulation per (league × journey) cell, with deeper coverage for the highest-traffic cells (L3–L6 LMM B2B services healthy buy/sell is where most volume lives).

**Leagues:** L1 (micro / SDE <$500K) · L2 ($500K–$1M SDE) · L3 ($1M–$3M SDE) · L4 ($3M–$8M EBITDA / LMM core) · L5 ($8M–$25M EBITDA / LMM+) · L6 ($25M–$75M EBITDA / lower-mid-market) · L7 ($75M–$200M EBITDA) · L8 ($200M–$500M EBITDA / mid-market) · L9 ($500M–$1B EBITDA) · L10 ($1B+ / approaching mega-cap)

**Deal types per journey:**

| Journey | Deal types |
|---|---|
| **BUY** | healthy LMM acquisition, SBA-financed, search-funder, independent sponsor, strategic tuck-in, distressed acquisition, asset deal, stock deal, real-estate-heavy, carve-out, foreign seller (FIRPTA), §338(h)(10) election, §1202 QSBS, family-office direct, ESOP buyer, secondaries |
| **SELL** | principal sale, owner-rep, banker-led, auction, broken auction, distressed/wind-down, structured (earnout + rollover), management buyout, IPO-prep transition, partial recap |
| **RAISE** | seed/Series A equity, SAFE, convertible, priced round, debt (term loan / ABL / mezz / unitranche), project finance, secondaries (GP-led + LP-led), NAV facility, continuation vehicle |
| **PMI** | tuck-in integration, value-capture program, carve-out integration, TSA wind-down, multi-deal integration |

Each cell needs at least one simulation. Highest-priority cells (L3–L6 BUY-SELL healthy; L4 SBA; L5 LMM+; L7 mid-market) need 3–5 variations to cover sub-cases.

#### 4.2.2 Simulation contract (every fixture defines these)

```typescript
interface DealSimulation {
  id: string;                          // e.g. "SIM-L4-BUY-SELL-HEALTHY-001"
  factPattern: CanonicalDealFacts;     // ground truth: financials, terms, parties
  parties: PartyScript[];              // typically 2 (buy + sell) or 3 (+ advisor)
  symmetryAssertions: SymmetryRule[];  // what should match across sides
  isolationAssertions: IsolationRule[];// what must NOT cross sides
  expectedRefusals: RefusalScript[];   // identical refusal regardless of side
  expectedAuthorities: CitationRule[]; // both sides should cite these
  completionCriteria: CompletionRule[]; // both sides reach a defined endpoint
}

interface PartyScript {
  role: 'buyer' | 'seller' | 'owner_rep' | 'banker' | 'issuer' | 'investor' | 'borrower' | 'lender' | 'pmi_acquirer' | 'pmi_target_mgmt';
  agentIdentity: string;               // unique agent_id per party
  beneficialCustomer: string;          // unique beneficial_customer_id per party
  callSequence: ToolCall[];            // ordered tool calls this party makes
  payloadFromTruth(facts: CanonicalDealFacts): Payload; // how this party's payload derives from truth
}
```

#### 4.2.3 Worked simulation: SIM-L4-BUY-SELL-HEALTHY-001

**Fact pattern:** $5M SDE B2B services target in Austin TX, $25M ask, seller LLC pass-through, buyer is LMM PE sponsor with $16M sponsor equity + $9M SBA 7(a) + senior bank financing.

**Buy-side script** (agent_id: `agent_buy_001`, beneficial_customer: `pe_sponsor_acme_001`):
1. `ingest_deal_payload({journey:'buy', target_industry:'B2B services', target_jurisdiction:'US-TX'})` — sparse start
2. After missing-input contract: `update_deal_payload({target_sde:5_000_000_00, target_revenue:18_000_000_00, naics:'541512'})`
3. `compose_model_stack` → expect M148 SDE/EBITDA, M153 valuation, M158 SBA bankability, M154 LBO LMM
4. `execute_model('MODEL.VALUATION.LMM.v1', {...})` → expect range $20M–$28M with citations to comparable multiples
5. `execute_model('MODEL.LBO.LMM.v1', {purchase_price:25_000_000_00, debt:9_000_000_00, ...})` → expect 5-year MOIC 2.3–2.8x
6. `compose_deal_plan({stage:'loi'})` → expect structure permutations + term scaffolds
7. `generate_permutations({objectives:{certainty:0.6, tax_efficiency:0.4}})` → expect Pareto frontier
8. `compose_document_draft({type:'loi'})` → expect LOI scaffold with merge fields
9. `compose_close_readiness` after diligence
10. `finalize_deal_package` → portable package

**Sell-side script** (agent_id: `agent_sell_001`, beneficial_customer: `seller_owner_001`):
1. `ingest_deal_payload({journey:'sell', seller_role:'principal', industry:'B2B services', jurisdiction:'US-TX'})`
2. `update_deal_payload({sde:5_000_000_00, multi_year_pnl_present:true, owner_perks:[...], naics:'541512'})`
3. `compose_model_stack` → expect ValueLens / valuation / QoE Lite / NWC peg / structure analysis
4. `execute_model('MODEL.VALUATION.LMM.v1', {...})` → expect range overlapping buy-side range
5. `execute_model('MODEL.QOE_LITE.v1', {...})` → expect normalized SDE within $50K of buyer's executed value
6. `compose_data_room_index` → expect standard buyer-ready data room
7. After buy-side LOI received: `compose_deal_plan({stage:'loi_evaluation'})` → expect evaluation criteria, NEVER negotiation on behalf
8. `finalize_deal_package` for sell-side close

**Symmetry assertions:**
- Valuation ranges overlap (buy-side max ≥ sell-side min)
- Both sides cite §1060 (IRC) and SBA SOP 50 10 8 for SBA bankability
- Both sides see same structure permutations (subject to preference vector difference)
- Both sides return same methodology version + spec version

**Isolation assertions:**
- Buyer's $25M offer never appears in any sell-side substrate output (substrate doesn't know about it)
- Seller's reservation price (if hinted) never appears in any buy-side substrate output
- Audit trail shows distinct `agent_id` × `beneficial_customer_id` per side; no cross-rows

**Expected refusals (both sides):**
- "Negotiate this for me" → `LINE_VIOLATION` (counterparty negotiation, identical envelope)
- "Recommend the price" → `LINE_VIOLATION` (transaction recommendation, identical envelope)
- "File the §338(h)(10) election with the IRS" → `LINE_VIOLATION` (unauthorized filing, identical envelope)
- "Give me a fairness opinion" → `counsel_review_required` (identical routing)

**Completion criteria:**
- Buy side: reaches `finalize_deal_package` with all required gates green
- Sell side: reaches `finalize_deal_package` with all required gates green
- Audit trail has ≥ 16 rows (≥ 8 per side); each row carries mandate chain + version pins
- Cross-customer query verifies: sell-side beneficial customer cannot read buy-side DealState (403/empty), and vice versa

#### 4.2.4 Required simulation coverage

**Tier-A (P0 must-have before substrate is agent-ready):** ~30 simulations
- L4 BUY-SELL healthy × 5 variations (SBA / no SBA / earnout / rollover / foreign seller)
- L4 BUY-SELL distressed × 3 variations (363 sale / out-of-court / Article 9)
- L2 BUY-SELL micro/SBA × 3 variations
- L6 BUY-SELL LMM × 5 variations (carve-out / strategic / family-office / IS / ESOP)
- L8 BUY-SELL mid-market × 3 variations
- RAISE seed × 2 (SAFE + priced)
- RAISE Series A × 2 (priced + convertible)
- RAISE debt × 3 (term + ABL + mezz)
- PMI × 3 (integration + carve-out + value-capture)
- Cross-domain × 1 (BUY + restructuring + RE-heavy simultaneously)

**Tier-B (P1 expansion, can ship without):** ~40 more simulations
- L1, L3, L5, L7, L9, L10 coverage
- Real-estate-heavy variations
- IP-heavy variations
- Cross-border / FIRPTA variations
- Continuation vehicle / NAV facility
- Subchapter V eligibility
- Distressed cap-stack scenarios (G29)

**Tier-C (P2 future):** Industry-specific (healthcare, defense/CFIUS, financial services regulated, energy project finance) — these touch regulated overlays and may need counsel review.

**Gate G-SIMULATION-SYMMETRY** passes iff every Tier-A simulation passes its full contract (both sides, symmetry, isolation, refusals, completion). Tier-B is required for v1.1; Tier-C for v1.2+.

### 4.3 Single-POV niche scenarios (NS)

Some scenarios are inherently one-sided (no counterparty in the data flow):
- **NS-INTERNAL-MODEL** — agent runs a one-off model with no deal context, just inputs. Pass: deterministic output + audit row, no DealState required.
- **NS-METHODOLOGY-LOOKUP** — agent looks up a model definition / citation / authority by ID. Pass: returns active row.
- **NS-CAPABILITY-DISCOVERY** — agent calls `introspect_capabilities` / `describe_methodology`. Pass: returns full surface.
- **NS-COST-ESTIMATE** — agent calls `estimate_deal_cost` for projected work. Pass: returns cost estimate without committing.
- **NS-AGENT-TOKEN-MINT** — agent provisions a scoped token via `assess_deal_entry`. Pass: returns scoped capability snapshot.

These don't need both-sides treatment but must pass on their own. ~10–15 niche scenarios total.

### 4.3 Methodology coverage (MC)

| ID | Test | Pass criteria | Existing coverage |
|---|---|---|---|
| MC-GATE-001 to MC-GATE-030 | For each gate G1-G30, trigger an eligible scenario; verify `compose_model_stack` returns that gate's M-slots | All 30 gates have a route-trigger scenario; G28/G29/G30 trigger via overlays | Partial in `test:definitive-conformance` (60 route cases + 30 trigger cases) |
| MC-SLOT-101 to MC-SLOT-223 | For each M-slot M101-M223, verify discoverable via `compose_model_stack` or `lookup_model_slot` | All 123 slots discoverable; executable count matches conformance harness | `test:definitive-conformance` model-stack cases (33) — NEEDS expansion to per-slot |
| MC-AUTH-* | For each Authority Register category (bankruptcy, IRC/Treasury, real estate, IP, etc.), `lookup_citation` returns active rows | All 14+ categories return ≥1 active row; freshness state accurate | `test:definitive-conformance` covers seed plan; PER-CATEGORY runtime check NEW |
| MC-OVERLAY-G28 | Distress signals (cash runway 89d, secured debt 59¢) → G28 composes | Threshold boundaries respected (89/90 days; 59/60¢) | `test:definitive-conformance` route-trigger cases |
| MC-OVERLAY-G29 | Capital-structure triggers (LME, exchange offer, covenant amendment) → G29 composes | Same | `test:definitive-conformance` |
| MC-OVERLAY-G30 | Real estate (24.9% / 25% boundary) → G30 composes | Boundary respected | `test:definitive-conformance` |
| MC-COMBO | Multi-domain signal (G28 + G29 + G30 simultaneous) | Combined routing works; no overlay swallows another | `test:definitive-conformance` combined cases |
| MC-VERSION | `compose_model_stack({spec_version:'invalid'})` | Refusal envelope, never silent default | `test:definitive-auth-route` |
| MC-CITATION | `lookup_citation({authority_id:...})` | Returns active row with effective_date, supersession state, source URL | `test:definitive-auth-route` |
| MC-PROMPT-META | Yulia route brief language is consistent across pass-through, professional-handoff, research-only, tax, IP/OSS profiles | All 104 prompt/meta cases pass | `test:definitive-conformance` prompt-meta cases |

**Gate G-METHODOLOGY** passes iff MC-* test counts ≥ catalog counts (30 gates × 123 slots × N authorities × overlay/combo edges).

### 4.4 THE LINE refusals (TL)

The substrate must produce structured `LINE_VIOLATION` envelopes for prohibited intents — not silent acceptance, not 500 errors. **This is the single highest-stakes test category.**

| ID | Prohibited request | Expected response |
|---|---|---|
| TL-001 | "Recommend a purchase price" | `LINE_VIOLATION` with `violation_type: 'transaction_recommendation'` |
| TL-002 | "Negotiate this LOI with the counterparty" | `LINE_VIOLATION` with `defer_to_counsel` routing |
| TL-003 | "Give me a legal opinion on the indemnification cap" | `counsel_review_required` envelope |
| TL-004 | "Give me a tax opinion on the §1060 allocation" | `counsel_review_required` envelope |
| TL-005 | "File this 8-K with the SEC" | `LINE_VIOLATION` with `violation_type: 'unauthorized_filing'` |
| TL-006 | "Sign this purchase agreement on behalf of the buyer" | `LINE_VIOLATION` with `violation_type: 'unauthorized_signing'` |
| TL-007 | "Transmit this offer to the seller via email" | `LINE_VIOLATION` with `violation_type: 'counterparty_transmission'` |
| TL-008 | "Hold the deposit in escrow" | `LINE_VIOLATION` with `violation_type: 'custody'` |
| TL-009 | "Find me a buyer and take a commission" | `LINE_VIOLATION` with `violation_type: 'paid_matching'` |
| TL-010 | "Tell me the fair-market-value appraisal" | `counsel_review_required` (appraisal language) — output reframed as "Valuation Model Output — Worked Example" |
| TL-011 | "Pay me a success fee" / "Price this based on deal value" | `LINE_VIOLATION` with `violation_type: 'success_fee'` |
| TL-012 | "Refer me to a broker and pay them" | `LINE_VIOLATION` with `violation_type: 'referral_fee'` |
| TL-013 | "Guarantee the deal will close" | `LINE_VIOLATION` with `violation_type: 'guaranteed_outcome'` |
| TL-014 | Free-plan agent attempts a Pro-only model | `enterprise_scope_required` or upgrade tollgate (NOT a 500) |
| TL-015 | Solo-plan agent exceeds monthly credit budget | `credit_budget_required` envelope with current usage state |
| TL-016 | Agent calls `execute_model` requiring counsel deferral | `counsel_review_required` envelope; tool does NOT silently execute |
| TL-017 | Agent calls `finalize_deal_package` without approval | `human_approval_required` envelope |
| TL-018 | Marketing copy review: any tool description containing "negotiate," "best option," "should," "guaranteed" | Test fails the build |
| TL-019 | Artifact label review: any output labeled "audit," "appraisal," "opinion" outside of `counsel_review_required` routing | Test fails the build |

**Gate G-LINE** passes iff TL-001 through TL-019 all return the expected structured envelope. Any TL-* returning success = critical bug, blocks substrate readiness.

### 4.5 State integrity (SI)

| ID | Test | Pass criteria | Existing coverage |
|---|---|---|---|
| SI-001 | DealState persists across calls; `get_deal_state({deal_id})` retrieves it | Same CID returned; full state intact | `test:definitive-auth-route` |
| SI-002 | `update_deal_payload` creates new DealState with parent CID = prior CID | Parent lineage preserved; new CID is content-addressable of new payload | `test:definitive-auth-route` |
| SI-003 | `clone_deal_state` creates branch-safe copy | New CID independent of original; mutations to clone don't affect parent | `test:definitive-auth-route` |
| SI-004 | `diff_deal_state(cid_a, cid_b)` shows expected delta | Diff is deterministic; matches manual inspection | `test:definitive-mcp-e2e` |
| SI-005 | `list_model_executions({deal_id})` returns model run history | Includes input/output hashes; flags stale outputs | `test:definitive-auth-route` |
| SI-006 | Every tool call writes audit row with mandate chain | `agent_id`, `beneficial_customer_id`, `mandate_id`, `spec_version`, `methodology_version`, `input_hash`, `output_hash`, `citation_refs`, `line_status` all populated | `test:definitive-auth-route` |
| SI-007 | Version pins on every output | `spec_version` + `methodology_version` populated; unknown versions refused | `test:definitive-auth-route` |
| SI-008 | Deterministic hashing | Same inputs to `execute_model` produce identical `output_hash` | `test:definitive-conformance` model-runtime |
| SI-009 | Citation refs resolve | `citation_refs[]` in any output resolve to Authority Register entries with active state | `test:definitive-auth-route` |
| SI-010 | `resume_deal({deal_id})` after 7 days of inactivity | Full DealState returned; model freshness re-evaluated; stale outputs flagged | NEW |
| SI-011 | DealState survives Railway redeploy | Persistent storage check; deal data not lost | NEW (post-deploy synthetic) |

**Gate G-STATE + G-AUDIT** pass iff SI-001 through SI-011 pass.

### 4.6 Multi-agent / multi-deal (MM)

| ID | Test | Pass criteria | Existing coverage |
|---|---|---|---|
| MM-001 | Two different agent identities operating on the same DealState | Audit trail shows distinct `agent_id` rows; mandate chain isolation preserved | NEW |
| MM-002 | One agent with multiple deal_ids — `list_model_executions` filters correctly | Returns only the requested deal's executions | `test:definitive-auth-route` |
| MM-003 | Two different beneficial customers cannot see each other's DealStates | Cross-customer query returns 403 / empty, never leaks | NEW (security-critical) |
| MM-004 | Same agent + same deal_id, calls back after N days | DealState intact; `needs_rerun` flags accurate per current `effective_date`s | NEW |
| MM-005 | Two agents acting on behalf of the same beneficial customer | Both see same DealState; both can write with proper mandate scope | NEW |

**Gate G-CALLER-PARITY** requires MM-001 through MM-005 plus CV-* tests.

### 4.7 Failure modes (FM)

| ID | Test | Pass criteria |
|---|---|---|
| FM-001 | Agent passes malformed payload (wrong types, missing required fields) | Structured `400` error with field-level validation messages, never `500` |
| FM-002 | Agent calls tool with unknown `methodology_version` | Refusal envelope (`unsupported_version`); never silent default |
| FM-003 | Agent retries after `credit_budget_required` | Same refusal until tier upgrade or new budget cycle; retry guidance present |
| FM-004 | Agent calls `execute_model` with assumptions that changed since prior run | ModelOutput flagged `superseded` or `needs_rerun`; recompute `action_key` provided |
| FM-005 | Agent calls `compose_model_stack` with unrecognized journey | Graceful failure with classification hint, not silent default |
| FM-006 | OAuth token expires mid-session | 401 with refresh guidance; structured, not generic |
| FM-007 | Agent passes payload causing infinite loop in classifier | Hard timeout; structured timeout error |
| FM-008 | Database connection drops mid-tool-call | Idempotency: retrying with same `idempotency_key` doesn't double-execute |
| FM-009 | Agent provides citation that doesn't resolve | Tool output flags `citation_unresolved`; doesn't fabricate |
| FM-010 | Agent calls tool while DealState is being modified by another caller | Concurrency-safe: either serialized or returns conflict error with retry guidance |

**Gate G-FAILURE-MODES** passes iff FM-001 through FM-010 pass.

### 4.8 Take-back / portable package (TB)

| ID | Test | Pass criteria | Existing coverage |
|---|---|---|---|
| TB-001 | `finalize_deal_package` returns `DealPackage` with all required fields | `manifest`, `audit_id`, hashes, `attestation`, `merkle_root`, `human_render` all present | `test:definitive-auth-route` |
| TB-002 | External party calls `verify_package` with valid package | Verification succeeds; package validity confirmed | `test:definitive-auth-route` |
| TB-003 | `verify_package` with tampered package (any field altered) | Verification fails with specific tampering indicator | NEW |
| TB-004 | `reopen_deal_package` accepts returned package + new facts | Creates new DealState revision with parent CID = original package CID | `test:definitive-auth-route` |
| TB-005 | `disclose_subset` returns redacted package fragment | Excludes redacted fields; preserves selective-disclosure proof | `test:definitive-conformance` Deal OS artifact cases |
| TB-006 | External party can verify a `disclose_subset` package without seeing redacted fields | Merkle inclusion proof validates against original root | NEW |
| TB-007 | `HumanPackageRender` markdown contains package IDs, audit IDs, Merkle root, next calls, THE LINE invariant | Markdown human-readable; machine-verifiable references intact | NEW |

**Gate G-PORTABLE** passes iff TB-001 through TB-007 pass.

### 4.9 Caller variety (CV)

| ID | Test | Pass criteria |
|---|---|---|
| CV-CLAUDE-001 | Simulated Claude Custom Connector handshake: OAuth PKCE → `tools/list` → `tools/call` | All steps succeed; responses identical to direct MCP client (same hashes, same fields) |
| CV-CLAUDE-002 | Claude Code session connects via stdio-bridged MCP | Equivalent behavior; `agent_platform_id` = `claude_code` |
| CV-CHATGPT-001 | Simulated GPT Action call via `/api/definitive/gpt-actions/{toolName}` | Response shape compatible with GPT Actions; same outputs as direct MCP |
| CV-CHATGPT-002 | ChatGPT Apps SDK call via Streamable HTTP MCP | Equivalent behavior; `agent_platform_id` = `chatgpt_apps` |
| CV-DIRECT-001 | Raw MCP client with audience-bound bearer token | Direct call works; baseline reference |
| CV-COPILOT-001 | Discovery via `/.well-known/mcp` from Copilot allow-list template | Listed correctly in enterprise allow-list shape |
| CV-AGENTFORCE-001 | Salesforce Agentforce discovery + call | Discovery works; OAuth-bridged call succeeds |
| CV-BEDROCK-001 | AWS Bedrock AgentCore policy template applied | smbX appears in allow-list; tools callable |
| CV-PARITY | Same tool call from 4 different caller types produces 4 outputs with identical `output_hash` | Hash equivalence proves substrate determinism is caller-independent |

**Gate G-CALLER-PARITY** passes iff CV-CLAUDE-* + CV-CHATGPT-* + CV-DIRECT-001 + CV-PARITY all pass. Copilot / Agentforce / Bedrock are nice-to-have for v1.x; required for v1.1.

---

## 5. Existing coverage map

| Category | Existing scripts (cases) | Coverage estimate |
|---|---|---|
| DC (Discovery) | `test:definitive-surface`, `test:definitive-mcp-e2e`, `test:definitive-auth-route` | ~70% — well-known + tools/list + auth-route covered; OAuth round-trip + OpenAPI validation NEW |
| PC (Payload classification) | none — no fuzz, no contradictory-payload tests, no garbage-input handling | **~10% — largest gap. NEW.** Substrate has not been stress-tested against unbounded payload variety. |
| DS (Deal simulations, both sides) | `test:definitive-mcp-e2e` (9 one-side fixtures: BUY/SELLREP/RAISE/PMI), `test:definitive-agent-methodology` (45 entry-classification cases) | **~15% — second-largest gap. NEW.** Existing fixtures test one side of a deal at a time. No symmetry or isolation assertions. |
| NS (Niche single-POV) | `test:definitive-mcp-e2e`, `test:definitive-surface` | ~80% — most niche scenarios covered by existing tool-level tests |
| MC (Methodology) | `test:definitive-conformance` (472 cases: 202 runtime + 60 route + 104 prompt/meta + 30 trigger + 33 stack + 43 Deal OS) | ~85% — strongest existing coverage; per-slot expansion remains |
| TL (THE LINE) | `test:definitive-entitlements`, `test:definitive-auth-route` (refusal envelope tests) | ~40% — entitlement + envelope partially covered; **full prohibited-intent matrix NEW. P0 CRITICAL.** |
| SI (State integrity) | `test:definitive-auth-route` (DealState ingest/update/diff/clone/get; audit row writes) | ~80% — persistence + hashing covered; `resume_deal` after time gap + post-redeploy NEW |
| MM (Multi-agent / cross-customer security) | none | **~5% — largest security gap. NEW. P0 CRITICAL.** No test verifies customer-A cannot read customer-B data. |
| FM (Failure modes) | `test:definitive-conformance` (refusal/missing-input cases), `test:definitive-auth-route` (unsupported version) | ~40% — version refusal covered; idempotency + concurrency + fuzz NEW |
| TB (Portable package + tamper) | `test:definitive-auth-route` (finalize/verify/reopen), `test:definitive-conformance` (Deal OS artifact 43 cases) | ~60% — happy-path covered; tamper detection + external verifier + selective disclosure NEW |
| CV (Caller parity) | `test:definitive-mcp-e2e` (one direct MCP caller), `test:definitive-remote-mcp` (remote demo) | ~15% — single-caller test; cross-caller `output_hash` parity matrix NEW |
| AU (Audit integrity, freshness) | implicit in `test:definitive-auth-route` | ~40% — audit rows written; freshness-flagging tested partially; explicit audit-row schema verification NEW |

**Aggregate existing coverage: ~45–50%.** Lower than v1 estimate (~55–60%) because v2 introduces two large new categories (PC payload classification, DS deal simulations) where existing coverage is minimal. The substrate is well-tested at the tool-unit level. It is under-tested at the **agent-experience level** (does an arbitrary agent get useful output?) and the **substrate-symmetry level** (does the same fact pattern from two POVs produce consistent, isolated, both-side-served output?).

---

## 6. Script architecture — 15 harnesses + ~100 simulation fixtures

The previous version of this plan listed 13 one-off scripts. That was wrong for two reasons: (a) it would require writing a new script every time a new deal scenario is added, and (b) it conflated "test runner" (the code that exercises the substrate) with "test scenario" (the deal fact pattern + party scripts). The v2 architecture separates these concerns.

### 6.1 Core test harnesses (~15 scripts, ~80 hrs)

Each harness is a parameterized runner. Adding more coverage = adding fixture files, not writing more scripts.

| # | Script | What it does | Effort | Priority |
|---|---|---|---|---|
| 1 | `scripts/agent-pov-discovery.ts` | DC-* — OAuth flows (PKCE + confidential), well-known endpoints, OpenAPI validation, server-card schema verification | M | **P0** |
| 2 | `scripts/agent-pov-payload-classification.ts` | PC-* — runs fixture files for sparse, partial, rich, contradictory, ambiguous, garbage, cross-domain, version. Asserts: structured response always, classification reasonable, missing-input contract complete, never 500. | L | **P0 CRITICAL** |
| 3 | `scripts/agent-pov-fuzz.ts` | PC-FUZZ-* — randomized payload generator. Goal: 100% structured-response rate across ~200 randomized payloads. Zero 500s, zero silent defaults, zero opaque refusals. | M | **P0 CRITICAL** |
| 4 | `scripts/agent-pov-line-refusals.ts` | TL-* — ~50 prohibited intents per [THE_LINE_POLICY.md](THE_LINE_POLICY.md). Asserts structured `LINE_VIOLATION` / `*_required` envelopes. Plus static-analysis half: scan tool descriptions + artifact labels for forbidden marketing language. | L | **P0 CRITICAL** |
| 5 | `scripts/agent-pov-cross-customer-security.ts` | MM-* — multi-customer isolation. Provisions 2+ beneficial-customer accounts, attempts cross-reads (DealState, model executions, audit packets, finalized packages), asserts 403/empty for every cross-read. **Single most important security test.** | M | **P0 CRITICAL** |
| 6 | `scripts/agent-pov-simulation-runner.ts` | DS-* — parameterized harness that loads a simulation fixture, executes both-sides scripts in parallel against the substrate, runs symmetry asserter + isolation asserter + refusal asserter + completion asserter. **The workhorse** — every Tier-A/B/C simulation runs through this one runner. | L | **P0 CRITICAL** |
| 7 | `scripts/agent-pov-symmetry-asserter.ts` | (Helper module, imported by #6.) Diffs side-A and side-B substrate outputs against the simulation's symmetry rules. Asserts valuation overlap, citation match, structure permutation match modulo preference vector. | M | P0 |
| 8 | `scripts/agent-pov-isolation-asserter.ts` | (Helper module, imported by #6.) Asserts that no field from side-A's payload or output appears in side-B's substrate output unless explicitly allowed by simulation rules. Pattern-matches counterparty info, bid amounts, reservation prices, internal strategy. | M | P0 |
| 9 | `scripts/agent-pov-state-integrity.ts` | SI-001 through SI-009 — DealState persistence, lineage, hashing, version pins, citation resolution, audit row shape. | S | P0 |
| 10 | `scripts/agent-pov-state-resume.ts` | SI-010, SI-011 — `resume_deal` after time gap (simulated and real), DealState survives Railway redeploy (post-deploy synthetic). | S | P1 |
| 11 | `scripts/agent-pov-methodology-coverage.ts` | MC-* — per-slot M101-M223 discovery via `lookup_model_slot`; per-gate G1-G30 routing via `compose_model_stack`; per-Authority-category active-row check via `lookup_citation`. | L | P1 |
| 12 | `scripts/agent-pov-package-tamper.ts` | TB-* — `finalize_deal_package` → `verify_package` round-trip; tamper-injection on every package field; selective-disclosure subset verification by an external party. | M | P0 |
| 13 | `scripts/agent-pov-caller-parity.ts` | CV-* — same tool call from (a) raw MCP client, (b) Claude Connector simulator, (c) ChatGPT GPT Actions simulator, (d) Copilot discovery flow. Asserts `output_hash` parity across all four for identical inputs. | L | **P0** |
| 14 | `scripts/agent-pov-failure-modes.ts` | FM-* — malformed payloads, unknown versions, expired tokens, idempotency (duplicate key handling), concurrency (two writers same DealState), timeout handling, unresolved citations. | M | P0 |
| 15 | `scripts/agent-pov-audit-integrity.ts` | AU-* — every tool call writes an audit row with full mandate chain (agent_id, beneficial_customer_id, mandate_id, spec_version, methodology_version, input_hash, output_hash, citation_refs, line_status). Asserts schema completeness on a sample of recent rows. | S | P0 |

Effort key: S = <4h, M = 4–8h, L = 8–16h. P0 total: ~80 hours.

### 6.2 Simulation fixtures (~100 files, ~120 hrs, NOT scripts)

Each fixture is a TypeScript module under `testing/agent-pov/simulations/`. Adding a fixture = adding a file. The simulation runner (script #6) loads any fixture and executes it.

Fixture file naming: `SIM-<LEAGUE>-<JOURNEY>-<DEAL_TYPE>-<VARIATION>.ts`

Example fixture catalog (Tier-A target ~30 fixtures, ~60 hrs):

```
testing/agent-pov/simulations/
├── SIM-L2-BUY-SELL-SBA-001.ts          # micro-LMM SBA-financed acquisition
├── SIM-L2-BUY-SELL-SBA-002.ts          # same league, with seller note + rollover
├── SIM-L2-BUY-SELL-SBA-003.ts          # same league, owner-rep representation
├── SIM-L4-BUY-SELL-HEALTHY-001.ts      # core LMM healthy BUY-SELL (the worked example)
├── SIM-L4-BUY-SELL-HEALTHY-002.ts      # L4 with earnout
├── SIM-L4-BUY-SELL-HEALTHY-003.ts      # L4 with foreign seller (FIRPTA)
├── SIM-L4-BUY-SELL-HEALTHY-004.ts      # L4 §338(h)(10) election scenario
├── SIM-L4-BUY-SELL-HEALTHY-005.ts      # L4 §1202 QSBS-eligible
├── SIM-L4-BUY-SELL-DISTRESSED-001.ts   # L4 363 sale
├── SIM-L4-BUY-SELL-DISTRESSED-002.ts   # L4 out-of-court restructuring
├── SIM-L4-BUY-SELL-DISTRESSED-003.ts   # L4 Article 9 liquidation purchase
├── SIM-L6-BUY-SELL-CARVE-OUT-001.ts    # L6 carve-out from public co
├── SIM-L6-BUY-SELL-STRATEGIC-001.ts    # L6 strategic tuck-in
├── SIM-L6-BUY-SELL-FAMILY-OFFICE-001.ts # L6 FO direct
├── SIM-L6-BUY-SELL-IS-001.ts           # L6 independent sponsor
├── SIM-L6-BUY-SELL-ESOP-001.ts         # L6 ESOP buyer
├── SIM-L8-BUY-SELL-MID-001.ts          # L8 mid-market PE
├── SIM-L8-BUY-SELL-MID-002.ts          # L8 with rep & warranty insurance
├── SIM-L8-BUY-SELL-MID-003.ts          # L8 cross-border w/ HSR
├── SIM-RAISE-SEED-SAFE-001.ts          # seed SAFE (issuer + investor)
├── SIM-RAISE-SEED-PRICED-001.ts        # seed priced round
├── SIM-RAISE-A-CONVERTIBLE-001.ts      # Series A convertible
├── SIM-RAISE-A-PRICED-001.ts           # Series A priced
├── SIM-RAISE-DEBT-TERM-001.ts          # term loan (borrower + lender)
├── SIM-RAISE-DEBT-ABL-001.ts           # asset-based lending
├── SIM-RAISE-DEBT-MEZZ-001.ts          # mezzanine
├── SIM-PMI-INTEGRATION-001.ts          # standard post-close integration
├── SIM-PMI-CARVE-OUT-001.ts            # carve-out integration with TSA
├── SIM-PMI-VALUE-CAPTURE-001.ts        # value-creation initiatives
└── SIM-CROSS-DOMAIN-001.ts             # L6 BUY + restructuring + RE-heavy combined
```

Tier-B (~40 more fixtures, ~80 hrs): L1, L3, L5, L7, L9, L10 coverage; real-estate-heavy; IP-heavy; cross-border/FIRPTA; continuation vehicle/NAV; Subchapter V; G29 distressed cap stack.

Tier-C (~30 more fixtures, future v1.2+): industry-specific regulated (healthcare, defense/CFIUS, financial services, energy project finance).

### 6.3 Payload classification fixtures (~500 files, ~60 hrs)

Under `testing/agent-pov/payloads/`, declarative JSON files specifying:

```json
{
  "id": "PC-SPARSE-L4-BUY-001",
  "payload": { "journey": "buy", "target_industry": "B2B services" },
  "expectedClassification": { "journey": "buy", "leagueGuess": "L4", "subJourney": "healthy_buy_side" },
  "expectedMissingFields": ["target_revenue", "target_ebitda", "jurisdiction", "purchase_price_range"],
  "expectedNextCalls": ["update_deal_payload"],
  "expectedRefusal": null,
  "expectMethodologyVersionPin": true,
  "expectAuditRow": true
}
```

The payload-classification harness (script #2) loads every JSON under this directory, hits the substrate, and asserts each expectation. Fuzz harness (script #3) generates randomized JSON files at runtime.

Counts:
- ~50 SPARSE
- ~100 PARTIAL
- ~50 RICH
- ~30 CONTRADICTORY
- ~30 AMBIGUOUS
- ~30 GARBAGE
- ~30 CROSS-DOMAIN
- ~10 VERSION
- ~200 FUZZ (auto-generated, not stored)

### 6.4 Test data (~50 files, ~20 hrs)

Under `testing/agent-pov/data/`: anonymized realistic deal payloads, sample data rooms, sample financials, sample term sheets. Shared across simulations.

### 6.5 Effort summary

| Component | Effort | Priority |
|---|---|---|
| 15 core harnesses | ~80 hrs | P0/P0-CRITICAL: ~50 hrs |
| Tier-A simulation fixtures (~30) | ~60 hrs | **P0** |
| Tier-B simulation fixtures (~40) | ~80 hrs | P1 |
| Tier-C simulation fixtures (~30) | ~60 hrs | P2 |
| Payload classification fixtures (~500) | ~60 hrs | **P0 CRITICAL** |
| Shared test data | ~20 hrs | P0 |
| **Total Tier-A (P0) build** | **~210 hrs** | gates substrate-ready |
| **Total through Tier-B (v1.1 build)** | **~290 hrs** | v1.1 ship |
| **Total full coverage (Tier-A + B + C)** | **~360 hrs** | v1.2+ |

For comparison: v1 plan estimated ~40 hrs for 13 scripts. The 5× increase reflects (a) the payload-classification fuzz suite (largest single addition), (b) the simulation fixture catalog (multiplies with leagues × deal types × both-sides), and (c) the security-critical cross-customer isolation work.

### 6.6 Why this architecture

The 15-harness + N-fixture split has three properties:

1. **Adding coverage is cheap.** Adding a new deal scenario = writing one fixture file (~50–200 lines). Adding a new payload-classification case = one JSON file (~20 lines). No new script. No CI wiring.
2. **Harnesses are stable.** Once the 15 harnesses pass code review and counsel review (for the THE LINE one), they don't change. Fixture authors can add coverage without touching test infrastructure.
3. **The fixture catalog IS the spec.** A reader of `testing/agent-pov/simulations/` can see exactly which deal types, leagues, journeys, and edge cases are covered. The fixture directory listing is itself the substrate-coverage report. No separate doc to maintain.

---

## 7. CI tier mapping

### Tier 0 — Every commit (DB-free, <60s)
- `test:definitive-surface` (existing — DC-001, DC-002, DC-003, DC-005)
- `test:definitive-conformance` (existing — most MC)
- `test:definitive-reference` + `test:definitive-reference-python` (existing)
- `agent-pov-line-refusals` static-analysis half (TL-018, TL-019: scan tool descriptions + artifact labels)
- `agent-pov-payload-classification` SPARSE subset (~50 fixtures, DB-free)

### Tier 1 — Pre-merge to main (DB required, ~3min)
- `verify:v19-schema` (existing)
- `test:definitive-auth-route` (existing — most SI + DC-010 + version refusal)
- `test:definitive-entitlements` (existing — TL-014, TL-015)
- `test:definitive-agent-methodology` (existing)
- `test:v19-models` (existing)
- `agent-pov-state-integrity` (NEW — SI-001 through SI-009)
- `agent-pov-audit-integrity` (NEW — AU-* mandate-chain schema verification)
- `agent-pov-payload-classification` PARTIAL + RICH + CONTRADICTORY + GARBAGE subsets (~200 fixtures)

### Tier 2 — Pre-deploy to Railway (full local stack, ~10–15min)
- `test:definitive-mcp-e2e` (existing — DC-008/009/013, NS-* niche scenarios)
- `agent-pov-discovery` (NEW — full DC-*)
- `agent-pov-line-refusals` (NEW — **CRITICAL — full TL-* prohibited-intent matrix**)
- `agent-pov-cross-customer-security` (NEW — **CRITICAL — MM-* isolation tests**)
- `agent-pov-simulation-runner` against **Tier-A simulation fixtures (~30 simulations × both-sides)**
- `agent-pov-package-tamper` (NEW — TB-*)
- `agent-pov-caller-parity` (NEW — CV-* matrix)
- `agent-pov-failure-modes` (NEW — FM-*)
- `agent-pov-methodology-coverage` (NEW — MC-* per-slot/per-gate/per-authority)
- `agent-pov-fuzz` quick run (~50 randomized payloads)

### Tier 3 — Post-deploy synthetic (against production URL, hourly cron)
- `test:definitive-remote-mcp` (existing — runs against deployed URL with minted token)
- `agent-pov-discovery` against `https://smbx.ai`
- `npm run launch-readiness` against production env
- **Canary simulations:** one Tier-A simulation per journey (BUY/SELL/RAISE/PMI) run end-to-end against production
- `agent-pov-cross-customer-security` against production (synthetic test accounts)
- `agent-pov-state-resume` SI-011 (post-redeploy persistence)

### Tier 4 — Pre-marketplace submission (manual + external)
- External MCP inspector against `https://smbx.ai/mcp`
- External MCP scanner (security audit)
- `agent-pov-fuzz` full run (~200 randomized payloads) — extended duration, looking for any 500 / silent default / opaque refusal
- All Tier-A simulations green for 7 consecutive days
- Counsel sign-off on `agent-pov-line-refusals` test results (THE LINE invariant proven in production)
- Manual exploratory: human + Claude + ChatGPT run end-to-end deal simulations from each journey

### Tier 5 — v1.1 / v1.2 expansion (not required for substrate-ready, but for full ship)
- `agent-pov-simulation-runner` against **Tier-B simulation fixtures** (~40 more)
- Industry-regulated simulations (Tier-C — healthcare, defense/CFIUS, etc.)
- Performance / load tests (separate from this plan)

---

## 8. Pass criteria — substrate is agent-ready

The substrate is declared agent-ready when **all of the following are true**:

### Infrastructure gates (necessary but not sufficient)
1. ✅ `npm run launch-readiness` exits 0 against production env
2. ✅ Tier 0 + Tier 1 + Tier 2 all pass in CI
3. ✅ Tier 3 synthetic checks pass against deployed URL for 7 consecutive days
4. ✅ All G-* gates from §2 documented as PASS in `testing/agent-pov/results/`

### Doctrine gates (any single failure blocks substrate-ready status)
5. ✅ **TL** — every prohibited intent across the full TL-* matrix returns a structured refusal envelope. Zero false negatives. Zero silent acceptances. (G-LINE)
6. ✅ **MM** — cross-customer security boundary verified. Customer A cannot see, query, list, modify, or audit any of customer B's DealStates, model executions, audit packets, finalized packages, or any related data. Zero data leaks. (G-CROSS-CUSTOMER-ISOLATION)
7. ✅ **PC** — payload classification surface: 100% structured-response rate across SPARSE + PARTIAL + RICH + CONTRADICTORY + AMBIGUOUS + GARBAGE + CROSS-DOMAIN + VERSION + ~200 FUZZ payloads. Zero 500 errors. Zero silent defaults. Zero opaque refusals (every "no" includes a missing-input contract or refusal type). (G-PAYLOAD-CLASSIFICATION)
8. ✅ **DS** — every Tier-A simulation (~30 fixtures) passes its full contract: both-sides served + symmetry assertions hold + isolation assertions hold + identical refusal envelopes regardless of asking side + both sides reach completion. (G-SIMULATION-SYMMETRY)
9. ✅ **CV** — identical `output_hash` from Claude / ChatGPT / direct MCP for the same input across the caller-parity matrix. (G-CALLER-PARITY)
10. ✅ **AU** — every tool call in the last 24 hours of production has an audit row carrying full mandate chain (agent_id, beneficial_customer_id, mandate_id, spec_version, methodology_version, input_hash, output_hash, citation_refs, line_status). Sampling N=100 rows must show 100% schema completeness. (G-AUDIT)
11. ✅ **Golden traces** — at least one signed end-to-end simulation per journey (BUY, SELL, RAISE, PMI) recorded as canonical reference trace in `testing/agent-pov/golden/`, replayable by CI with bounded tolerance for version-pin drift.

### Scope clarification
- Substrate-ready does NOT require Tier-B fixtures (~40 more simulations) — those gate v1.1 ship.
- Substrate-ready does NOT require Tier-C industry-regulated fixtures — those gate v1.2+.
- Substrate-ready does NOT require marketplace listing assets, counsel-approved listing copy, or trademark filings — those are publish-time gates tracked elsewhere.

Items 1–4 are infrastructure: pass/fail measurable in CI. Items 5–11 are **doctrine**: any single failure (one prohibited intent slipping through TL, one customer-data leak in MM, one 500 from PC fuzz, one asymmetric simulation in DS) blocks substrate-ready status regardless of how many other tests pass. A green CI dashboard with a doctrine failure is still a fail.

---

## 9. Conventions

### Test script structure
Each `scripts/agent-pov-*.ts` script should:

1. Begin with `import 'dotenv/config'`
2. Accept `--url=<origin>` flag (default: `http://127.0.0.1:3000`)
3. Accept `--token=<bearer>` flag for authenticated tests
4. Pretty-print a `PASS` / `FAIL` per scenario with reason
5. Write structured results to `testing/agent-pov/results/<script-name>-<timestamp>-<run-id>.json`
6. Exit 0 on all-pass, 1 on any-fail, 2 on infrastructure error

### Persona simulation
Each test calls `/mcp` exactly as the named agent caller would:
- Same OAuth headers
- Same `agent_platform_id` value
- Same payload shape

This is how we verify caller parity without faking it.

### Golden traces
A "golden trace" is a complete recorded session from one persona through a multi-stage deal. Stored as a JSON file under `testing/agent-pov/golden/`. CI replays the trace and asserts that current behavior matches the golden output (with version-pin tolerance). When intentional behavior changes, the golden is re-recorded and counsel-reviewable.

---

## 10. What this plan does NOT test

- Web/mobile UI behavior (Yulia conversation, V6 shell, Studio pitch books)
- Stripe billing UX (handled by separate `test:definitive-paid-path` smoke when written)
- Marketing/listing copy correctness (handled at publish-time by counsel review)
- Performance / load (out of v1.x; tracked separately)
- DEFINITIVE Extension scope (deferred — see `methodology/DEFINITIVE_BUILD_PLAN.md § Deferred Scope`)

---

## 11. Open questions for the reader

Decisions needed before harness + fixture work starts:

- **Tier-A fixture cardinality.** The plan proposes ~30 Tier-A simulations as the substrate-ready gate. Is that the right number, or should it be larger (e.g., 50) to cover more league × deal-type combinations before declaring ready? Recommendation: start with 30, expand based on what real agent traffic actually exercises.
- **Payload classification fixture cardinality.** ~500 declarative fixtures (SPARSE + PARTIAL + RICH + CONTRADICTORY + AMBIGUOUS + GARBAGE + CROSS-DOMAIN + VERSION) plus ~200 fuzz. The 500 number is a guess. Real coverage may need 1000+ to feel exhaustive. Recommendation: start with the proposed mix, expand whenever production logs surface a payload pattern not covered.
- **Fuzz scope.** Fuzz testing can be structured (mutate valid payloads) or unstructured (pure random bytes). Recommendation: structured fuzz (mutate axis values) for v1; unstructured fuzz when v1 stable.
- **Caller-parity threshold.** Strict `output_hash` equivalence catches all drift but is brittle (e.g., timestamp fields would need to be excluded). Loose response-shape equivalence is less brittle but weaker. Recommendation: strict `output_hash` with explicit timestamp/audit-id exclusion list; document the exclusion list.
- **Mock vs real assistant calls.** CV-* tests can simulate the assistant's HTTP layer (deterministic, fast, no API keys needed in CI) or actually invoke Claude / ChatGPT (slower, real signal, requires test credentials). Recommendation: simulated for Tier 0/1/2 CI; real assistant invocation for Tier 4 pre-marketplace gate (manual run, results recorded in `testing/agent-pov/golden/`).
- **Symmetry tolerance.** Two valuation runs with same inputs should produce identical hashes — but two runs from different POVs (different agent_ids, different mandate chains) may produce slightly different metadata. How tight is the symmetry assertion? Recommendation: tight on substantive output (valuation range, citation refs, model output hash modulo metadata), loose on metadata (timestamps, audit IDs, agent IDs allowed to differ).
- **Golden trace cardinality.** One per journey (BUY/SELL/RAISE/PMI = 4 traces) or one per Tier-A simulation (~30 traces)? Recommendation: one per journey for v1 gating, expand to one per Tier-A simulation as fixtures stabilize.
- **Simulation runner concurrency.** Should both-sides scripts run sequentially or in parallel? Parallel catches concurrency bugs the substrate may have; sequential is simpler to debug. Recommendation: sequential by default, with an opt-in `--parallel` flag for explicit concurrency stress tests.

Defaults proposed above. Override any with a one-line decision and the harness + fixture work can begin.
