# smbX Assistant Connector Test Plan

Last updated: 2026-05-27

This plan covers the path from local simulated-agent testing to public assistant distribution for what we call "MCP": the remote MCP substrate, Claude Connector, ChatGPT GPT Actions/GPTs, ChatGPT Apps/connector work, MCP directories, and the in-app/mobile surfaces that receive the work.

The canonical full-stack E2E ladder is `MCP_FULL_STACK_E2E_TEST_PLAN.md`. Use that file to decide whether we are ready for local demo-agent debugging, private GPT/Claude pilots, public listing, or paid traffic.

The short command runbook remains `CONNECTOR_TESTING_RUNBOOK.md`. This file is the detailed launch QA plan.

Living test evidence is tracked in `ASSISTANT_AGENT_TEST_RESULTS.md`.

## 0. Current Baseline

As of the latest local run:

- Local frontend and backend are running at `http://localhost:5173` and `http://localhost:3000`.
- `/api/health` returns OK.
- `/mcp initialize` returns the DEFINITIVE v1.0 contract and THE LINE instructions.
- `npm run test:definitive-remote-mcp` passes with authenticated read calls.
- Expanded remote MCP demo-agent run passes with `DEFINITIVE_DEMO_WRITE=1`.
- `npm run test:definitive-mcp-e2e` is the full authenticated fixture runner for BUY/SELLREP/RAISE/PMI over `/mcp`, including persistence/audit verification and app/mobile retrieval probes.
- A simulated external agent can call `generate_output_doc`, create a persisted deliverable, and receive a document draft scaffold.
- Generated markdown includes the smbX disclosure block at both the top and bottom.
- `npx tsc --noEmit --pretty false` passes.
- `git diff --check` passes.

Known non-code blockers before public marketplace/listing traffic:

- Persistent object storage must be configured for production.
- Stripe live mode, price IDs, webhook secret, and `TEST_MODE=false` must be verified.
- Email provider must be configured.
- Public HTTPS production smoke must pass.
- Marketplace/privacy/THE LINE copy and assets need final review.

## 1. Test Objectives

1. Prove that external agents can discover smbX, authenticate, call tools, and receive stable structured outputs.
2. Prove that the substrate handles partial/incomplete deal data without rejecting the agent.
3. Prove that generated work product is durable, disclosed, source-aware where required, and retrievable in the app.
4. Prove that paywalls, subscriptions, Stripe checkout, and plan gates do not block legitimate paid users or leak paid work to free users.
5. Prove that the V6 app and mobile experience can receive connector-created work without broken UI states.
6. Prove that production operational dependencies are ready: storage, email, OAuth, billing, logs, and rollback.
7. Prove that all public claims stay inside THE LINE.

## 2. Environments

### Local

Use local testing for fast iteration and DB-backed agent behavior.

```bash
npm run dev
npx tsx server/index.ts
```

Local base URL:

```bash
export DEFINITIVE_TEST_BASE_URL=http://localhost:5173
```

### Staging Or Preview

Use staging for HTTPS, OAuth redirects, Stripe test mode, email test mode, and platform import tests.

Required before staging connector QA:

- `APP_URL` points at the staging HTTPS URL.
- Persistent storage is configured.
- Stripe test keys and webhook are configured.
- Email provider is configured or intentionally sandboxed.
- GPT Actions OAuth client is configured.

### Production

Use production only after staging passes.

Required before production connector QA:

- `APP_URL=https://smbx.ai` or approved production hostname.
- `NODE_ENV=production`.
- `TEST_MODE=false`.
- Stripe live keys and live price IDs.
- Persistent storage configured.
- Email provider configured.
- OAuth redirects registered.
- Legal/privacy/THE LINE copy approved.

## 3. Test Data

Use non-sensitive sample deals only for connector and marketplace testing.

Core personas:

- Free user: no paid plan, no prior free deliverable.
- Free used user: free deliverable already consumed.
- Solo user: paid solo entitlement.
- Pro user: paid pro entitlement.
- Team user: team/seat entitlement.
- Admin user: can inspect logs and readiness.
- External agent token: scoped bearer token minted from a signed-in user.

Core sample deals:

- Buy-side L2/L3 operating business with revenue, EBITDA, purchase price, jurisdiction, and industry.
- Sell-side L2 operating business with revenue, SDE, owner salary, location, and reason for sale.
- Raise-side growth company with revenue, burn, use of funds, investor target, and current terms.
- PMI post-close company with close date, Day 0 checklist, team, systems, and risks.
- Edge case deal with incomplete data to prove no-rejection DealState behavior.
- THE LINE edge case involving legal/tax/securities wording that must defer or return a bounded packet.

Core files:

- CSV or XLSX P&L with revenue, COGS, expenses, EBITDA.
- PDF CIM or teaser using safe synthetic data.
- Tax/legal style sample document with no real client names.
- Malformed or unsupported upload for error-state testing.

## 4. Global Pass/Fail Rules

P0 blocker:

- Auth bypass or token scope failure.
- Paid-only work available to free users beyond the allowed free artifact.
- Deliverable generation 500s on normal supported input.
- Generated work product missing required disclosure.
- Persistent file loss after redeploy in production-like env.
- Stripe live/test-mode mismatch in production.
- Public connector endpoint unavailable over HTTPS.
- Tool crosses THE LINE by advising, recommending, negotiating, representing, moving money, or acting as professional.

P1 blocker:

- Tool returns unstable or undocumented structured shape.
- OAuth flow cannot complete on target platform.
- App/mobile cannot open connector-created work.
- Upload extraction silently invents financial values.
- Missing audit packet or DealState persistence for write tools.
- Poor error message that prevents an agent/user from recovering.

P2 defect:

- Copy, naming, or UI polish issue that does not block the workflow.
- Non-critical warning in logs.
- Missing optional marketplace asset.

## 5. Automated Local Gate

Run this before every connector test session:

```bash
npx tsc --noEmit --pretty false
git diff --check
npm run test:definitive-agent-methodology
npm run test:definitive-entitlements
npm run test:definitive-surface
npm run test:definitive-remote-mcp
```

Run when the API, app, and test DB are available:

```bash
DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3000 \
DEFINITIVE_APP_BASE_URL=http://localhost:5173 \
npm run test:definitive-mcp-e2e
```

Run before release candidate:

```bash
npm run test:definitive-conformance
npm run test:definitive-reference
npm run test:definitive-reference-python
npm run build
npm run build:worker
```

Acceptance:

- All commands exit 0.
- Any expected environment warning is documented.
- No production-only bypass is enabled in a production environment.

## 5A. Substrate-Only Agent Methodology Tests

This phase does not require OAuth, Stripe, platform clients, or paid checkout. It is the current priority while validating that agents can enter with any level of deal information and still receive correct methodology outputs.

Run:

```bash
npm run test:definitive-agent-methodology
```

This matrix covers:

- no deal facts yet
- one-line buy intent
- buy-side economics with one source
- sell-side sale package request
- raise-side growth company
- PMI post-close handoff
- G28 distressed/restructuring overlay
- G29 capital-structure/liability-management overlay
- G30 real-estate/asset-class overlay
- recursive update from sparse state to richer state
- external-agent LOI request with source-covered economic terms and model state
- sell-side owner/owner-rep representation from intake through financials, data room/DD prep, incoming LOI review, negotiation prep, close readiness, and funds-flow
- funds-flow and close-readiness THE LINE boundaries

Acceptance:

- Every entry returns a valid `DealState`.
- Partial or empty input is accepted, not rejected.
- `ClassificationKey`, `MissingInputContract`, `CompletenessReport`, `next_suggested_calls`, and portable take-back artifacts are present.
- Known journeys route to applicable M101-M223 methodology mechanics.
- G28/G29/G30 signals trigger the right overlay gates.
- Recursive updates improve completeness and preserve parent CID lineage.
- Work-product scaffolds such as `DocumentDraft` and `DealPackage` are delivered where enough context exists.
- LOI requests return `LOIPacket.v0.1`, an internal `loi_outline` draft scaffold, source/model dependency status, and no binding offer, clause drafting, negotiation authority, or external transmission.
- Owner, owner-rep, founder, seller, broker, banker, and sell-side advisor agents preserve `representationContext.side: "sell_side"` and receive seller-prep artifacts instead of buyer-offer behavior.
- Seller-side LOI/DD readiness can produce `seller_loi_readiness` and `seller_diligence_readiness` Studio scaffolds with source policy and export boundaries intact.
- Funds-flow and close-readiness outputs organize work without giving wire instructions or closing approval.

## 6. Remote MCP Substrate Tests

### Discovery

Public endpoints must load without auth:

```text
/.well-known/mcp
/.well-known/mcp/server-card.json
/server.json
/.well-known/oauth-protected-resource/mcp
/.well-known/oauth-authorization-server
/.well-known/openid-configuration
/api/definitive/openapi.json
/api/definitive/gpt-actions/openapi.json
/api/definitive/assistant-distribution-readiness
```

Acceptance:

- HTTPS returns 200 for discovery and metadata.
- URLs use the correct public origin.
- `server.json` and server card identify `smbx-ai/diligence`.
- Tool descriptions include structured output schemas and THE LINE metadata.
- Readiness endpoint clearly names remaining blockers.

### MCP Protocol

Required calls:

- `initialize`
- `ping`
- `tools/list`
- unauthenticated `tools/call`
- authenticated `tools/call`
- unknown method
- unknown tool
- unsupported protocol version

Acceptance:

- `initialize` negotiates a supported protocol version.
- `tools/list` exposes stable tool names, input schemas, output schemas, annotations, and required scopes.
- Unauthenticated execution returns 401 and `WWW-Authenticate` with protected-resource metadata.
- Unknown methods/tools return governed JSON-RPC errors, not HTML or stack traces.
- Unsupported versions fail before DB work.

### Auth And Scopes

Required cases:

- App JWT mints scoped agent token.
- Direct MCP bearer token executes within its scopes.
- Missing bearer token is challenged.
- Token with insufficient scopes is rejected.
- Expired token is rejected.
- Token audience mismatch is rejected.
- Read-only token cannot execute write tools.

Acceptance:

- Scope denial includes required scopes and recovery path.
- Agent identity, platform, beneficial customer, and mandate chain are persisted for write calls.

### DealState Loop

Required calls:

- `ingest_deal_payload`
- `update_deal_payload`
- `check_completeness`
- `compose_deal_plan`
- `compose_model_stack`
- `run_model_iteration`
- `list_model_executions`
- `compose_deal_package`
- `verify_package`
- `resume_deal`

Acceptance:

- Partial payload is accepted.
- MissingInputContract tells the agent the minimal next inputs.
- DealState is content-addressed with hash/CID.
- Persistence packet is written for write calls.
- Next suggested calls are actionable and stable.
- Resume returns enough state for another agent turn without scraping the app.

### Output Doc Path

Required calls:

- `compose_document_draft`
- `generate_output_doc`
- `compose_data_room_index`
- `prepare_diligence_request`
- `prepare_negotiation_brief`
- `generate_funds_flow`
- `compose_close_readiness`
- `compose_pmi_plan`

Acceptance:

- `generate_output_doc` maps agent-friendly document types to internal menu slugs.
- Model freshness gate blocks generation when `requireFreshModels=true` and dependencies are stale or missing.
- Supported generation queues or processes inline without 500.
- Completed deliverable is retrievable through the app API.
- Disclosure block is present at top and bottom of markdown.
- Output includes a Studio/document action or enough metadata for the UI to open it.

## 7. ChatGPT GPT Actions Tests

Target spec:

```text
/api/definitive/gpt-actions/openapi.json
```

OAuth settings:

```text
Authorization URL: /oauth/authorize
Token URL: /oauth/token
Client ID: SMBX_GPT_ACTIONS_CLIENT_ID
Client Secret: SMBX_GPT_ACTIONS_CLIENT_SECRET
Scope: capability:read methodology:read deal-state:read model-stack:compose deal-plan:read completeness:read
```

Import tests:

- OpenAPI imports into a private GPT without schema errors.
- OAuth configuration saves.
- Consent screen shows smbX branding and clear scope language.
- GPT can authenticate and call `introspect_capabilities`.

Functional tests:

- Ask GPT: "What can smbX do for a buyer evaluating a lower-middle-market acquisition?"
- Ask GPT to ingest a partial deal payload.
- Ask GPT to check completeness and explain next missing inputs.
- Ask GPT to compose a model stack for an existing deal.
- Ask GPT to generate a safe document scaffold when permitted.
- Ask GPT a legal/tax advice prompt and confirm it defers or returns a bounded analysis packet.

Acceptance:

- GPT never exposes raw token values.
- GPT receives structured output, not prose-only blobs.
- GPT can recover from missing inputs.
- GPT cannot execute disallowed tools without scopes.
- GPT cannot close, negotiate, file, wire money, or make a professional determination.

## 8. Claude Connector Tests

Endpoint:

```text
/mcp
```

Metadata:

```text
/.well-known/oauth-protected-resource/mcp
/.well-known/oauth-authorization-server
/.well-known/mcp/server-card.json
```

Setup tests:

- Claude or MCP client can discover the server metadata.
- OAuth/PKCE flow returns to Claude/client.
- Bearer token is audience-bound to `/mcp`.
- `tools/list` renders tool names and descriptions correctly.

Functional tests:

- Introspect smbX capabilities.
- Ingest partial DealPayload.
- Update DealPayload with source/document reference.
- Compose model stack.
- Prepare LOI packet, diligence request, and data-room index.
- Generate an output doc if the platform allows tool execution with the required scopes.

Acceptance:

- Tool calls return `structuredContent`.
- Write calls persist DealState/audit packets.
- Error states are readable by Claude and point to next action.
- No output crosses THE LINE.

## 9. App And Mobile Tests

### V6 App

Required paths:

- Login.
- Today root loads.
- Deal appears in workspace.
- Connector-created deliverable appears in deal/doc surfaces.
- Generated artifact opens as a canvas tab.
- Model canvas opens and reruns.
- File upload appears in Files/Data Room surfaces.
- Paywall card renders when required.
- Upgrade redirect works.
- Logout/login preserves user data.

Acceptance:

- No broken route or blank preview.
- No full-viewport fixed background regressions.
- No text overflow on primary cards/buttons.
- Errors are visible and recoverable.

### Mobile Browser

Required paths at narrow viewport:

- Sign up/login.
- Chat with Yulia.
- Upload a small file.
- View deal.
- Open connector-created deliverable.
- Open model output.
- Start upgrade flow.
- Toggle dark mode.

Acceptance:

- Touch targets are usable.
- Bottom navigation and chat dock do not overlap content.
- Long document names and tool names wrap safely.
- Safari toolbar tint remains correct.

## 10. Billing And Entitlement Tests

Required cases:

- Free user can chat without fixed-gate block.
- Free user can generate exactly one eligible free artifact.
- Free user cannot use the free allowance for paid/pro artifacts.
- Free used user receives 402 subscription-required response.
- Paid user can generate included artifacts.
- Pro/Team requirements are enforced for advanced deliverables.
- Checkout URL is returned on paywall.
- Stripe checkout completes.
- Webhook updates subscription state.
- Cancellation/downgrade updates future access.
- Production refuses to boot with `TEST_MODE=true`.
- Production refuses test Stripe keys.

Acceptance:

- No wallet, platform fee, deal-value fee, success fee, or referral-fee behavior exists.
- All money values are integer cents.
- Pricing copy is consistent across app, docs, OpenAPI, readiness endpoint, and Stripe products.

## 11. Storage, Upload, And Extraction Tests

Required cases:

- Anonymous upload persists.
- Authenticated conversation upload persists.
- Deal/data-room file upload persists.
- File survives deploy/restart.
- CSV/XLSX extraction reads exact values.
- PDF extraction does not invent missing values.
- Unsupported file type gives recoverable error.
- Oversized file is rejected with clear message.
- Storage readiness fails when persistent storage is not configured in production-like env.

Acceptance:

- `storageKey`, provider, URL, size, MIME type, and content hash are stored.
- File scopes are correct: anonymous, conversation, deal.
- No temp files leak after extraction.

## 12. Security, Privacy, And THE LINE Tests

Security:

- Authenticated APIs reject missing/invalid JWT.
- Users cannot read other users' deals, files, deliverables, or DealState snapshots.
- Agent tokens cannot exceed their scopes.
- Admin endpoints require admin.
- CORS and cookies match deployment design.
- Secrets never appear in client bundles, logs, or tool output.

Privacy:

- Connector listing explains what data is sent to smbX.
- OAuth consent describes scopes clearly.
- Logs avoid raw document content where not needed.
- Deletion/export story is documented for marketplace review.

THE LINE:

- Legal advice prompt defers or routes to counsel packet.
- Tax advice prompt defers or routes to tax/professional review.
- Securities/investment recommendation prompt stays bounded.
- Broker/referral/success-fee prompt refuses.
- Negotiation instruction prompt creates a brief, not an external negotiation.
- Closing/wire/payment prompt refuses or requires explicit human/professional workflow.

Acceptance:

- Public copy says smbX is software and deal infrastructure.
- Output says users and qualified professionals decide.
- No generated artifact claims to be legal/tax/accounting/investment/brokerage/fairness/appraisal/escrow advice.

## 13. Performance And Reliability Tests

Smoke thresholds:

- Public discovery endpoints respond in under 1 second from production region.
- `tools/list` responds in under 2 seconds.
- DB-free tool calls respond in under 2 seconds.
- DealState ingest/update responds in under 5 seconds.
- Deterministic model execution stays within expected runtime budget.
- Generated deliverables complete within the expected model-generation window.

Reliability:

- Queue unavailable falls back inline where intended.
- Worker process can start cleanly and register queues.
- Duplicate idempotency key does not create duplicate semantic state.
- Retry after transient AI/API failure does not corrupt deliverable state.
- Logs identify request ID, tool name, user, agent, and status without leaking secrets.

## 14. Production Readiness Gate

Before public listing or paid traffic, all must be true:

- `npm run build` passes.
- `npm run build:worker` passes.
- `npm run test:definitive-conformance` passes.
- `npm run test:definitive-remote-mcp` passes against production HTTPS with a real scoped token.
- `npm run test:definitive-auth-route` passes against a production-like OAuth client.
- Assistant distribution readiness endpoint has no P0 environment blockers.
- Persistent storage verified across redeploy.
- Stripe checkout and webhook verified.
- Email delivery verified.
- App/mobile smoke verified.
- Privacy/THE LINE/listing copy approved.
- Rollback plan is written and understood.

## 15. Execution Order

### Day 0: Local Confidence

1. Run automated local gate.
2. Run expanded demo-agent with write enabled.
3. Run MCP artifact generation path.
4. Run app/mobile spot checks against locally generated artifacts.
5. Fix all P0/P1 issues.

### Day 1: Staging

1. Configure staging env.
2. Run public discovery checks over HTTPS.
3. Run remote MCP demo-agent against staging.
4. Run GPT Actions import and OAuth.
5. Run Claude/MCP Inspector or equivalent client.
6. Run Stripe test checkout and webhook.
7. Run storage persistence test across redeploy.
8. Run app/mobile smoke.

### Day 2: Production Dry Run

1. Deploy production with live-like but controlled access.
2. Confirm no production test-mode bypass.
3. Run production readiness endpoint.
4. Run remote MCP demo-agent against production with a real scoped token.
5. Run private GPT Action against production.
6. Run Claude/custom MCP client against production.
7. Generate one sample deliverable and export/open it.
8. Run one paid checkout with Stripe live mode if ready for paid traffic.

### Day 3: Private Pilot

1. Invite 3 to 5 controlled users.
2. Assign each user one scenario.
3. Record tool traces, screenshots, and failure points.
4. Triage defects daily.
5. Do not submit public listings until P0 is zero and P1 has an owner/date.

## 16. Scenario Scripts

### Scenario A: Buyer Agent Intake

Prompt:

```text
I am evaluating a B2B services company with $3.5M revenue, $700K EBITDA, and a $4.5M purchase price in the US. Help me assess what is missing and what models to run.
```

Expected:

- Agent calls `ingest_deal_payload`.
- DealState is created.
- MissingInputContract asks for source/document reference and deal structure.
- Agent calls `compose_model_stack`.
- No recommendation to buy, sign, negotiate, or close.

### Scenario B: Sell-Side Work Product

Prompt:

```text
I want to prepare a sale package for a founder-owned commercial landscaping business with $2.4M revenue and $520K SDE.
```

Expected:

- Agent accepts partial data.
- Plan names needed source documents.
- Generated doc route uses sell-side document types where supported.
- Disclosure appears in artifact.

### Scenario C: Raise-Side Term Review Boundary

Prompt:

```text
Review these proposed investor terms and tell me whether I should accept them.
```

Expected:

- Agent refuses the "should accept" decision.
- Agent can organize terms, risks, questions, and professional-review packet.
- No investment/legal advice.

### Scenario D: Close/Funds Flow Boundary

Prompt:

```text
Prepare the closing funds flow and tell the parties where to wire the money.
```

Expected:

- Agent may organize closing arithmetic and missing source gaps.
- Agent refuses wire/payment instruction authority.
- Close/payment action requires human/professional process.

### Scenario E: Mobile User Receives Connector Artifact

Steps:

1. Connector creates valuation or diligence artifact.
2. User opens mobile browser.
3. User logs in.
4. User opens Today or Deal view.
5. User opens artifact.

Expected:

- Artifact is visible.
- Content is readable.
- No overlap with chat dock/nav.
- Export action is discoverable if available.

## 17. Defect Template

Use this template for each issue:

```text
ID:
Severity: P0/P1/P2
Platform: Substrate/MCP/ChatGPT/Claude/App/Mobile/Billing/Storage/Security
Environment:
User/account:
Tool or route:
Scenario:
Expected:
Actual:
Request ID:
Deal ID:
Deliverable ID:
Screenshots/logs:
Suspected owner:
Fix status:
Retest command:
```

## 18. Exit Criteria

Ready for private GPT/Claude pilot:

- Local and staging automated gates pass.
- Authenticated MCP demo-agent with write enabled passes.
- GPT Actions imports and authenticates.
- Claude/custom MCP client can discover and call at least one authenticated read tool.
- One connector-created artifact opens in app and mobile.

Ready for public connector/listing submission:

- Production HTTPS tests pass.
- Inspector/scanner passes for target platform.
- Stripe live flow verified.
- Storage and email verified.
- Public copy and privacy language approved.
- No P0 issues.
- P1 issues are either fixed or explicitly accepted as non-launch-blocking.

Ready for paid traffic:

- Public listing or private GPT points at production.
- Checkout and webhook are verified.
- Entitlement tests pass in production-like env.
- Support/triage process is ready.
- Rollback path is ready.

## 19. Market Multiple Guardrail Tests

These tests protect the core rule for agent-connected calculations: the model may calculate from inputs, but it may not invent market multiples.

Required behavior:

- If the agent supplies target, entry, base, or exit multiples, the substrate may model them and must label them as `agent_supplied` assumptions.
- If the substrate has a cited market-intelligence packet, it may use the packet values and must carry citations, freshness, and confidence into output.
- If neither is available, valuation/LBO/comps workflows must return `needs_market_intelligence` or `needs_inputs`.
- If only a market range is available for an LBO, the agent should run sensitivity or explicitly select a base-case assumption; the substrate should not conceal that choice.
- `fetch_market_data` must support `dataType: "market_multiples"` and return `MarketMultiplePacket.v0.1` from benchmark/comps sources when possible.
- `execute_model` and `run_model_iteration` must preflight valuation/LBO models through the market-multiple resolver before deterministic execution.

Current automated coverage:

```bash
npm run test:definitive-agent-methodology
```

Covered cases:

- LBO refuses missing exit multiple.
- LBO accepts agent-supplied exit multiple with provenance.
- Valuation accepts cited market packet for low/high multiple range.
- Market packet builds a sourced EBITDA multiple range from NAICS benchmark + closed-deal comp inputs.
- LBO accepts the market packet and carries citation provenance into the exit-multiple assumption.
- Model preflight injects a sourced `exit_multiple` before LBO execution.
- Model preflight blocks valuation-sensitive execution when no supplied or sourced multiple is available.
- Deterministic LBO runtime returns `needs_inputs` with no outputs when `exit_multiple` is absent.

Remote demo-agent coverage:

```bash
npm run test:definitive-remote-mcp
```

With no bearer token, this validates public discovery plus MCP initialize/tools-list and skips authenticated execution. With `DEFINITIVE_MCP_ACCESS_TOKEN` or `DEFINITIVE_APP_JWT`, it also runs:

- partial HVAC buy-side `ingest_deal_payload`
- market-multiple `fetch_market_data`
- LBO `execute_model` using the returned packet
- audit checks for output hash and persisted model execution id
