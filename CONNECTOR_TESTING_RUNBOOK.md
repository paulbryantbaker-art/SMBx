# smbX Connector Testing Runbook

Last updated: 2026-05-27

This is the short path to start testing smbX as a remote MCP server, Claude Connector target, OpenAI remote MCP tool server, and private ChatGPT GPT Action.

For the full-stack E2E gate ladder from substrate through auth, platform clients, app/mobile retrieval, billing, security, and production smoke, use `MCP_FULL_STACK_E2E_TEST_PLAN.md`.

For the full launch QA matrix, scenarios, acceptance gates, and defect template, use `ASSISTANT_CONNECTOR_TEST_PLAN.md`.

## 1. Public URL Checks

Set the target:

```bash
export DEFINITIVE_TEST_BASE_URL=https://app.smbx.ai
```

These URLs must load without auth:

```text
/.well-known/mcp
/.well-known/mcp/server-card.json
/server.json
/.well-known/oauth-protected-resource/mcp
/.well-known/oauth-authorization-server
/api/definitive/openapi.json
/api/definitive/gpt-actions/openapi.json
/api/definitive/assistant-distribution-readiness
```

Run:

```bash
npm run test:definitive-remote-mcp
```

Without a token, this validates public discovery and MCP initialize/tools-list only.

## 2. Demo Agent Smoke

Use either an audience-bound MCP token:

```bash
export DEFINITIVE_MCP_ACCESS_TOKEN='...'
npm run test:definitive-remote-mcp
```

Or mint one from a signed-in smbX app JWT:

```bash
export DEFINITIVE_APP_JWT='...'
npm run test:definitive-remote-mcp
```

Optional write test:

```bash
DEFINITIVE_DEMO_WRITE=1 npm run test:definitive-remote-mcp
```

That adds a small sample `ingest_deal_payload` call. Leave it off for read-only connector checks.

## 3. Claude / Remote MCP

Use:

```text
MCP endpoint: https://app.smbx.ai/mcp
Protected resource metadata: https://app.smbx.ai/.well-known/oauth-protected-resource/mcp
Authorization server metadata: https://app.smbx.ai/.well-known/oauth-authorization-server
Server card: https://app.smbx.ai/.well-known/mcp/server-card.json
```

Claude and generic MCP clients should be tested with the OAuth authorization-code/PKCE path or a manually minted bearer token during debugging.

## 4. ChatGPT GPT Actions

Use the focused spec:

```text
https://app.smbx.ai/api/definitive/gpt-actions/openapi.json
```

Server env required for OAuth:

```bash
SMBX_GPT_ACTIONS_CLIENT_ID=smbx_gpt_actions_private
SMBX_GPT_ACTIONS_CLIENT_SECRET=<long-random-secret>
```

In the GPT Action OAuth settings:

```text
Authorization URL: https://app.smbx.ai/oauth/authorize
Token URL: https://app.smbx.ai/oauth/token
Client ID: value of SMBX_GPT_ACTIONS_CLIENT_ID
Client Secret: value of SMBX_GPT_ACTIONS_CLIENT_SECRET
Scope: capability:read methodology:read deal-state:read model-stack:compose deal-plan:read completeness:read
```

The focused GPT Actions facade exposes named operations under:

```text
/api/definitive/gpt-actions/{toolName}
```

Initial testing tools:

```text
introspect_capabilities
describe_methodology
lookup_model_slot
compose_model_stack
ingest_deal_payload
check_completeness
compose_deal_plan
resume_deal
```

## 5. Local Full Route Check

Start the API with a private GPT Actions client:

```bash
PORT=3000 \
APP_URL=http://127.0.0.1:3000 \
SMBX_GPT_ACTIONS_CLIENT_ID=smbx_gpt_actions_private \
SMBX_GPT_ACTIONS_CLIENT_SECRET=local-test-secret \
npx tsx server/index.ts
```

Then run:

```bash
DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3000 \
SMBX_GPT_ACTIONS_CLIENT_ID=smbx_gpt_actions_private \
SMBX_GPT_ACTIONS_CLIENT_SECRET=local-test-secret \
npm run test:definitive-auth-route
```

Run the full authenticated MCP fixture gate:

```bash
DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3000 \
DEFINITIVE_APP_BASE_URL=http://localhost:5173 \
npm run test:definitive-mcp-e2e
```

This seeds synthetic BUY, SELLREP, RAISE, and PMI deals when `DATABASE_URL` is available, executes them over `/mcp`, verifies persisted DealState/packet/model/audit rows, reads the work back through protected app APIs, and opens Today/Pipeline/Files on desktop and mobile. Use `DEFINITIVE_MCP_E2E_SKIP_BROWSER=1` for API-only runs.

## 6. Pass/Fail Meaning

Ready for demo-agent debugging:

```text
test:definitive-remote-mcp passes with a token
```

Ready for private ChatGPT GPT testing:

```text
/api/definitive/gpt-actions/openapi.json imports
OAuth authorization returns to the GPT callback
GPT can call introspect_capabilities and compose_model_stack
```

Ready for Claude/custom MCP testing:

```text
MCP Inspector or platform client can discover metadata
OAuth/PKCE returns an audience-bound token
/mcp tools/call succeeds with that token
```

Not ready for public listings until:

```text
production HTTPS smoke passes
platform scanner/inspector passes
privacy/THE LINE copy is approved
marketplace assets are prepared
Stripe live config is verified
```
