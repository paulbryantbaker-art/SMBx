# smbX MCP Full-Stack E2E Test Plan

Last updated: 2026-05-27

This is the canonical end-to-end plan for what we call "MCP": remote MCP, Claude Connector, ChatGPT GPT Actions/GPTs, future ChatGPT Apps/connector work, MCP directories/registry, and the smbX app/mobile surfaces that receive agent-created work.

The goal is to stop proving isolated pieces and start proving repeatable vertical paths:

```text
external agent -> discovery -> auth -> scoped tool call -> DealState/methodology -> model/source/doc artifact -> persistence/audit -> app/mobile retrieval -> entitlement/billing gate -> production readiness
```

## 1. Readiness Definition

We are ready to list or distribute the MCP/connector only when all required gates below pass in staging, and the production smoke subset passes on the public HTTPS domain.

| Gate | Name | Required For | Status Meaning |
| --- | --- | --- | --- |
| G0 | Static/build/conformance | every run | Code compiles, contracts are stable, route/conformance suite passes. |
| G1 | Substrate methodology | every run | Agent payloads across journeys return correct methodology artifacts. |
| G2 | Remote MCP protocol | private pilot | Discovery, initialize, tools/list, errors, and unauthenticated challenges work over HTTP. |
| G3 | Auth/scopes | private pilot | OAuth/JWT/agent tokens are audience-bound and scope-enforced. |
| G4 | Authenticated agent journeys | private pilot | Real MCP calls execute full buy/sell/raise/PMI workflows with structured output. |
| G5 | Persistence/audit | private pilot | DealState, model outputs, deliverables, files, and audit packets survive reload/redeploy. |
| G6 | App/mobile retrieval | private pilot | Connector-created work is visible and usable in V6 desktop and mobile. |
| G7 | Platform clients | public listing | ChatGPT GPT Actions and Claude/MCP clients can import/connect and run smoke paths. |
| G8 | Entitlement/billing | paid traffic | Free/paid gates, Stripe checkout/webhooks, and agent-key limits are correct. |
| G9 | Security/privacy/THE LINE | public listing | No auth bypass, data leak, hallucinated financials, or professional-boundary crossing. |
| G10 | Production smoke | public listing | Public HTTPS, live env config, logs, monitoring, rollback, and readiness endpoint pass. |

## 2. Environments

| Environment | Base URL | Purpose | Required Before Promotion |
| --- | --- | --- | --- |
| Local substrate | process-local scripts | Fast deterministic method/model tests. | G0-G1 pass. |
| Local full route | `http://127.0.0.1:3001` API + `http://localhost:5173` app | Auth routes, MCP HTTP, app retrieval, Playwright. | G0-G6 pass with test tokens. |
| Staging/preview | HTTPS staging hostname | OAuth redirects, GPT import, Claude/MCP clients, Stripe test mode, object storage. | G0-G9 pass. |
| Production | public HTTPS domain | Final smoke before listing and after deploy. | G2, G3, G7, G8, G9, G10 smoke subset pass. |

## 3. Test Personas And Tokens

Use synthetic data only.

| Persona | Purpose | Must Validate |
| --- | --- | --- |
| Anonymous agent | Discovery/protocol checks. | Can read public metadata; cannot execute protected tools. |
| Free user, no deliverable used | Free artifact flow. | One allowed deliverable; correct paywall after free allowance. |
| Free user, free deliverable used | Paywall boundary. | Paid work is blocked with recoverable error. |
| Solo user | Core paid path. | Agent key/tool access within Solo limits. |
| Pro user | Full deal-work path. | CIM/data room/DD/LOI tools available. |
| Team user | Shared workspace path. | Team/seat access and shared artifacts. |
| Admin | Readiness/log review. | Can inspect readiness and admin-only state without exposing data. |
| Expired/revoked token | Security negative test. | 401/403, no tool execution, no DB writes. |

## 4. Canonical Fixtures

These fixtures should be reused across local, remote MCP, ChatGPT, Claude, app, and mobile tests so failures are comparable.

| Fixture ID | Journey | Scenario | Required Artifacts |
| --- | --- | --- | --- |
| FIX-EMPTY-001 | unknown | Empty or one-line agent entry. | `DealState`, `MissingInputContract`, `next_suggested_calls`. |
| FIX-BUY-LBO-001 | buy | $5M EBITDA LBO, market multiple required. | `DealState`, `MarketMultiplePacket`, `ModelOutput`, `LOIPacket`, audit hashes. |
| FIX-SELLREP-001 | sell | Owner/owner-rep prepares for LOI and DD anywhere in process. | `representationContext.side: "sell_side"`, `DataRoomIndex`, `seller_loi_readiness`, `seller_diligence_readiness`, `CloseReadiness`. |
| FIX-RAISE-001 | raise | Growth company capital raise with use of funds and terms. | `DealState`, model stack, investor-material scaffold, terms readiness. |
| FIX-PMI-001 | pmi | Post-close Day 0 through Day 100 operating handoff. | `PMIPlan`, model refresh needs, source gaps, no operating authority. |
| FIX-LINE-001 | legal/tax/securities edge | Agent asks for legal/tax opinion, negotiation, closing, or wire instructions. | Refusal/defer boundary, no unauthorized action, next safe call. |
| FIX-FILE-001 | upload/extraction | Synthetic P&L, tax/legal PDF, malformed file. | Exact extraction, no invented numbers, source refs and file errors. |

## 5. E2E Gates

### G0: Static, Build, And Contract Gate

Run before every E2E session:

```bash
npx tsc --noEmit --pretty false
git diff --check
npm run test:definitive-conformance
npm run test:definitive-reference
npm run test:definitive-reference-python
npm run build
npm run build:worker
```

Acceptance:

- All commands exit 0.
- No schema or output-shape drift unless the plan/results docs are updated.
- Build includes server migrations and worker bundle.

### G1: Substrate Methodology Gate

Run:

```bash
npm run test:definitive-agent-methodology
npm run test:definitive-surface
```

Acceptance:

- Partial input is never rejected.
- All journeys classify correctly.
- Sell-side owner/owner-rep posture is preserved through all seller stages.
- Market multiples are sourced, agent-supplied with provenance, or blocked.
- LOI, diligence, negotiation, funds-flow, and close-readiness artifacts stay inside THE LINE.

### G2: Remote MCP Protocol Gate

Run without a token:

```bash
export DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3001
npm run test:definitive-remote-mcp
```

Then repeat against staging HTTPS.

Acceptance:

- Public metadata returns 200:
  - `/.well-known/mcp`
  - `/.well-known/mcp/server-card.json`
  - `/server.json`
  - `/.well-known/oauth-protected-resource/mcp`
  - `/.well-known/oauth-authorization-server`
  - `/api/definitive/openapi.json`
  - `/api/definitive/gpt-actions/openapi.json`
  - `/api/definitive/assistant-distribution-readiness`
- MCP `initialize`, `ping`, and `tools/list` work.
- Unknown method/tool and unsupported protocol version return governed JSON-RPC errors.
- Protected `tools/call` without auth returns 401 and `WWW-Authenticate`, not HTML or stack traces.

### G3: Auth, OAuth, And Scope Gate

Local route run:

```bash
PORT=3001 \
APP_URL=http://127.0.0.1:3001 \
SMBX_GPT_ACTIONS_CLIENT_ID=smbx_gpt_actions_private \
SMBX_GPT_ACTIONS_CLIENT_SECRET=local-test-secret \
npx tsx server/index.ts
```

Then:

```bash
DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3001 \
SMBX_GPT_ACTIONS_CLIENT_ID=smbx_gpt_actions_private \
SMBX_GPT_ACTIONS_CLIENT_SECRET=local-test-secret \
npm run test:definitive-auth-route
```

Acceptance:

- App JWT can mint scoped MCP token.
- Tokens are audience-bound to `/mcp`.
- Scope-limited token can read only allowed tools.
- Write-scope token can write only allowed artifacts.
- Expired, malformed, revoked, wrong-audience, and wrong-scope tokens fail before tool execution.
- Auth failures do not create DealState, deliverable, model, file, or audit rows.

### G4: Authenticated Agent Journey Gate

Run:

```bash
export DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3001
export DEFINITIVE_MCP_ACCESS_TOKEN='<scoped-test-token>'
npm run test:definitive-remote-mcp
```

Run write path:

```bash
DEFINITIVE_DEMO_WRITE=1 npm run test:definitive-remote-mcp
```

Run the full authenticated fixture path:

```bash
DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3000 \
DEFINITIVE_APP_BASE_URL=http://localhost:5173 \
npm run test:definitive-mcp-e2e
```

The runner seeds synthetic BUY/SELLREP/RAISE/PMI deals when `DATABASE_URL` is available, mints a scoped MCP token from a local app JWT when needed, executes the fixture paths over `/mcp`, verifies persistence metadata on each DealState write, reads the created work back through protected app APIs, and optionally opens desktop/mobile app surfaces with Playwright.

Required E2E scenarios:

| Case ID | Path | Required MCP Calls |
| --- | --- | --- |
| E2E-EMPTY-001 | Agent enters with no useful deal facts. | `ingest_deal_payload`, `check_completeness`, `resume_deal`. |
| E2E-BUY-001 | Buy-side LBO with $5M EBITDA and no exit multiple. | `ingest_deal_payload`, `fetch_market_data`, `execute_model`, `prepare_loi_packet`, `compose_deal_package`. |
| E2E-SELLREP-001 | Owner-rep prepares for LOI/DD and later brings incoming buyer LOI. | `ingest_deal_payload`, `compose_data_room_index`, `prepare_diligence_request`, `prepare_loi_packet`, `prepare_negotiation_brief`, `compose_close_readiness`. |
| E2E-RAISE-001 | Raise-side company builds investor-material readiness. | `ingest_deal_payload`, `compose_model_stack`, `compose_document_draft`, `compose_deal_package`. |
| E2E-PMI-001 | Post-close company needs Day 0/100 plan. | `ingest_deal_payload`, `compose_pmi_plan`, `compose_deal_package`. |
| E2E-LINE-001 | Agent asks to send LOI, negotiate, give tax/legal opinion, or move funds. | appropriate tool returns boundary/refusal; no external-send or irreversible action. |

Acceptance:

- Each path has one correlation/run ID.
- Every response includes stable structured content, methodology/spec version pins, THE LINE invariant, and next calls.
- Write calls persist their expected object.
- Re-running with same idempotency key is safe.
- Returned artifacts are portable enough for the calling agent to resume later.

### G5: Persistence, Audit, And Artifact Gate

For every write path above, verify DB/storage state:

| Artifact | Must Verify |
| --- | --- |
| DealState | CID, state hash, revision, parent lineage, payload, classification, representation context. |
| Model output | model ID, input hash, output hash, version, citations, stale/fresh status. |
| Market packet | source refs/citations, as-of date, provenance, no fabricated multiple. |
| Document/deliverable | persisted ID, disclosure block, source policy, export boundary. |
| Data room/source index | source refs, hashes, category gaps, selective disclosure proof. |
| Audit packet | user/agent identity, tool, scope, input hash, output hash, timestamp, THE LINE boundary. |

Acceptance:

- Browser refresh does not lose connector-created work.
- Server restart does not lose persisted work when production-like storage is configured.
- Audit packets can be retrieved by authorized user/admin only.
- Deleted/revoked user or token cannot read artifacts after access is removed.

Automation:

- `npm run test:definitive-mcp-e2e` directly verifies DealState snapshots, packet rows, model execution rows, and agency usage/audit rows when `DATABASE_URL` is available.
- The same runner also supports remote/staging runs by supplying `DEFINITIVE_MCP_ACCESS_TOKEN`, `DEFINITIVE_APP_JWT`, and existing `DEFINITIVE_MCP_E2E_*_DEAL_ID` values.

### G6: App And Mobile Retrieval Gate

Run with local app and API:

```bash
npm run dev
npm run dev:api
```

Use Playwright or the in-app browser to verify:

| Surface | Required Checks |
| --- | --- |
| Today | Agent-created DealState and next actions appear without broken empty states. |
| Pipeline | Deal stage and suggested calls are visible and route correctly. |
| Files/Data Room | Source refs, gaps, and disclosure subsets render correctly. |
| Studio/Docs | Connector-created drafts/deliverables open and show disclosure/source policy. |
| Models | Saved model outputs show current/stale state and hashes. |
| Mobile | Same artifacts are reachable in V6 mobile layout without overlap or hidden controls. |

Acceptance:

- Desktop and mobile can open connector-created artifacts.
- No blank canvas, broken route, console error, or inaccessible control.
- Text does not overflow cards/buttons on mobile.
- THE LINE/disclosure copy is visible where external export/reliance is possible.

Automation:

- `npm run test:definitive-mcp-e2e` opens Today, Pipeline, and Files on desktop and mobile viewports when `DEFINITIVE_APP_BASE_URL` is set.
- Use `DEFINITIVE_MCP_E2E_SKIP_BROWSER=1` only for substrate/API-only runs.

### G7: Platform Client Gate

#### ChatGPT GPT Actions / GPTs

Use:

```text
https://<host>/api/definitive/gpt-actions/openapi.json
```

Required manual checks:

- OpenAPI imports without schema errors.
- OAuth settings save.
- Consent screen shows correct app/scopes.
- GPT can call:
  - `introspect_capabilities`
  - `describe_methodology`
  - `lookup_model_slot`
  - `compose_model_stack`
  - `ingest_deal_payload`
  - `check_completeness`
  - `compose_deal_plan`
  - `resume_deal`
- GPT can complete E2E-EMPTY-001, E2E-BUY-001 read/write subset, and E2E-SELLREP-001 read/write subset.

#### Claude Connector / Generic MCP Client

Use:

```text
MCP endpoint: https://<host>/mcp
Protected resource metadata: https://<host>/.well-known/oauth-protected-resource/mcp
Authorization server metadata: https://<host>/.well-known/oauth-authorization-server
Server card: https://<host>/.well-known/mcp/server-card.json
```

Required manual checks:

- Client discovers server metadata.
- OAuth/PKCE or bearer-token path succeeds.
- `tools/list` renders useful tool names and schemas.
- Client can complete E2E-EMPTY-001 and at least one authenticated write path.
- Error states are readable and include next safe action.

Acceptance:

- Same fixture produces materially equivalent structured output across direct MCP, GPT Actions, and Claude/generic MCP.
- Platform-specific wrappers do not remove source policy, audit IDs, or THE LINE metadata.

Automation gap:

- Record manual platform test results in `ASSISTANT_AGENT_TEST_RESULTS.md` until platform APIs are automatable.

### G8: Entitlement, Billing, And Agent-Key Gate

Run:

```bash
npm run test:definitive-entitlements
```

Staging Stripe test mode:

- Free user creates first allowed deliverable.
- Same free user attempts second deliverable and receives paywall.
- Solo/Pro/Team users can run included connector actions.
- Plan-specific agent-key counts are enforced.
- Stripe Checkout completes in test mode.
- Webhook updates subscription state.
- Billing portal opens for paid user.
- Cancellation/downgrade changes access on next check.

Production:

- Production refuses test Stripe keys.
- `TEST_MODE=false`.
- Live price IDs match pricing copy.
- One live checkout is tested only when Paul is ready to take real paid traffic.

Acceptance:

- Free users cannot leak paid work.
- Paid users are not blocked from included work.
- Agent tokens cannot bypass plan entitlements.
- Billing and entitlement errors are recoverable by both humans and agents.

### G9: Security, Privacy, And THE LINE Gate

Required negative tests:

- No bearer token.
- Wrong audience token.
- Expired token.
- Revoked token.
- Token with read scope attempts write.
- Free user attempts paid artifact generation.
- User A attempts to read User B artifact.
- Prompt asks for legal opinion, tax opinion, investment advice, negotiation, binding acceptance, closing authorization, wire instructions, escrow action, external data-room share, or securities solicitation.
- Upload/extraction tries to infer missing financial values.
- Malformed JSON-RPC and oversized input.

Acceptance:

- Unauthorized requests fail before DB writes.
- Protected errors do not leak stack traces, secrets, SQL, or other user data.
- Financial extraction never invents numbers.
- Tools organize/calculate/route but do not advise, represent, negotiate, send, close, move money, or opine.
- All irreversible/external actions require staged approval.

### G10: Production Smoke And Listing Gate

Run against the public hostname:

```bash
export DEFINITIVE_TEST_BASE_URL=https://<public-host>
npm run test:definitive-remote-mcp
```

With production-scoped test user/token:

```bash
export DEFINITIVE_MCP_ACCESS_TOKEN='<production-scoped-token>'
npm run test:definitive-remote-mcp
```

Manual checks:

- Public HTTPS cert and canonical URLs are correct.
- Readiness endpoint reports no public-listing blockers.
- OAuth redirect URLs match registered platform settings.
- Persistent object storage is configured.
- Email provider is configured.
- Stripe live/test mode is correct for launch state.
- Logs capture correlation IDs without secrets.
- Rollback path is known.
- Marketplace listing copy, privacy copy, and THE LINE copy are approved.

Acceptance:

- Production smoke passes after deploy and before public listing.
- Any blocker is recorded with owner, severity, and next action.

## 6. Release Criteria

### Ready For Local Demo-Agent Debugging

- G0, G1, and G2 pass locally.
- Authenticated remote MCP path can run with a minted token.

### Ready For Private GPT/Claude Pilot

- G0-G6 pass locally or staging.
- GPT Actions import and OAuth pass.
- Claude/generic MCP client discovery and at least one authenticated call pass.
- One connector-created artifact opens in desktop and mobile.
- Known blockers are non-security/non-data-loss.

### Ready For Public MCP/Connector Listing

- G0-G10 pass in staging.
- Production smoke subset passes.
- Stripe live configuration is verified if paid traffic is enabled.
- Privacy, marketplace, and THE LINE copy approved.
- Persistent storage, logs, monitoring, and rollback verified.

## 7. Test Result Logging

Every E2E run should produce or update:

- `ASSISTANT_AGENT_TEST_RESULTS.md`
- raw run command and environment
- fixture ID and case ID
- pass/fail status
- artifact IDs/CIDs/hashes
- screenshots for app/mobile/platform clients where relevant
- blocker IDs with P0/P1/P2 severity

Minimum result entry:

```text
Date:
Environment:
Gate:
Case ID:
Fixture:
User/persona:
Command or platform client:
Result:
Artifact IDs/hashes:
Blockers:
Follow-up:
```

## 8. Automation Backlog

| Priority | Automation | Why |
| --- | --- | --- |
| P0 | `test:definitive-persistence-e2e` | Proves MCP writes are durable and auditable, not just returned in-memory. |
| P0 | Authenticated E2E fixture runner for BUY/SELLREP/RAISE/PMI | Replaces one-off demo scripts with a repeatable journey matrix over `/mcp`. |
| P1 | Playwright desktop/mobile artifact retrieval tests | Proves connector-created work lands in V6 surfaces. |
| P1 | Stripe test-mode E2E with webhook verification | Proves paid traffic and agent-key limits. |
| P1 | Platform manual-result templates | Makes GPT/Claude testing comparable until their clients are automatable. |
| P2 | Production smoke monitor | Keeps discovery/auth/readiness from silently breaking after deploy. |
