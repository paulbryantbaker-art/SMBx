# Assistant Distribution Revenue Launch Plan

Last updated: 2026-05-25

This is the launch plan for what we have been calling "MCP": Claude Connector, ChatGPT GPTs/Actions, ChatGPT Apps/connector, MCP directories, the official MCP Registry, and enterprise allow-list catalogs.

## Priority

1. ChatGPT GPT Actions private pilot
2. Subscription checkout and upgrade gate QA
3. Remote MCP Streamable HTTP endpoint at `/mcp`
4. Claude custom connector beta
5. ChatGPT Apps SDK internal app
6. MCP directory profile submissions
7. Official MCP Registry `server.json`
8. Claude/ChatGPT directory submissions and partner outreach

The fastest money path is GPT Actions because it can use `/api/definitive/openapi.json` while connector review proceeds. The most strategic platform path is Claude Connector plus ChatGPT Apps SDK, now backed by `/mcp`; broad marketplace claims still need production auth review, review assets, and scanner/inspector QA.

## Current Launch Assets

| Asset | URL | Status |
| --- | --- | --- |
| Agent card | `/.well-known/agent-card.json` | Ready |
| DEFINITIVE manifest | `/.well-known/definitive.json` | Ready |
| MCP discovery manifest | `/.well-known/mcp` | Ready for discovery/profile use |
| MCP server card | `/.well-known/mcp/server-card.json` | Ready for static metadata/review |
| MCP server.json | `/server.json` | Ready for registry/remote review |
| Remote MCP endpoint | `/mcp` | Streamable HTTP ready with JWT/scoped bearer execution |
| OAuth protected-resource metadata | `/.well-known/oauth-protected-resource/mcp` | Ready; `/mcp` auth failures challenge clients to this URL |
| OAuth authorization-server metadata | `/.well-known/oauth-authorization-server` | Ready for PKCE auth-code bridge discovery |
| OAuth dynamic client registration | `/oauth/register` | Ready for public PKCE clients |
| OAuth authorize/token endpoints | `/oauth/authorize`, `/oauth/token` | Ready; exchanges user consent + PKCE or confidential GPT Actions code for audience-bound `/mcp` agent token |
| Schema registry | `/api/definitive/schemas` | Ready |
| GPT Actions OpenAPI | `/api/definitive/openapi.json` | Ready for private GPT pilot |
| Focused GPT Actions facade | `/api/definitive/gpt-actions/openapi.json`, `/api/definitive/gpt-actions/{toolName}` | Ready for private GPT OAuth testing |
| Connector package | `/api/definitive/connector-distribution` | Ready for review prep |
| Registry package | `/api/definitive/registry-package` | Ready for review prep |
| Launch readiness | `/api/definitive/assistant-distribution-readiness` | Ready |

## Platform Plan

| Platform | Submit/Build | Status | Blocker |
| --- | --- | --- | --- |
| ChatGPT GPT Actions | Import `/api/definitive/gpt-actions/openapi.json` into a private GPT action | First revenue lane | Configure `SMBX_GPT_ACTIONS_CLIENT_ID`/`SMBX_GPT_ACTIONS_CLIENT_SECRET`, private GPT QA, Stripe live price IDs before paid traffic |
| Claude custom connector | Add public remote MCP URL in Claude connector settings | Protocol/auth bridge ready | Platform auth review, assets, production QA |
| ChatGPT Apps SDK | Package an app experience backed by MCP tools | Protocol/auth bridge ready/package-pending | Apps SDK package, review assets |
| MCP directories | Submit server-card/schema/listing profile where static metadata is accepted | Protocol-ready/profile-prep | Inspector/scanner QA, manual assets |
| Official MCP Registry | Publish `server.json` under verified namespace | Server.json ready | Public deployment, namespace verification, inspector/scanner pass |
| Enterprise catalogs | Use allow-list templates and OpenAPI/server-card evidence | Prep-ready | Enterprise security review and OAuth |

## Revenue Gate

Before paid traffic:

- `APP_URL=https://smbx.ai`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_SOLO`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_TEAM`
- `TEST_MODE=false`

Enterprise can remain assisted/manual at launch, but set `STRIPE_PRICE_ENTERPRISE` if self-serve Enterprise checkout is enabled.

## Next Build Work

1. Run remote MCP inspector/scanner against the deployed `/mcp` endpoint.
2. Configure the private ChatGPT GPT Actions OAuth client and import `/api/definitive/gpt-actions/openapi.json`.
3. Run `npm run test:definitive-remote-mcp` against the deployed URL with a minted token.
4. Verify `server.json` and OAuth discovery under the smbx.ai namespace and publish once scanner results are clean.
5. Create marketplace assets: icon, screenshots, short demo video, privacy/security copy, and counsel-approved THE LINE language.
6. QA one paid path end to end: GPT Action or MCP call -> Yulia/substrate work -> subscription/paywall -> successful Stripe webhook -> artifact/export.
7. If a target platform rejects dynamic registration, add preregistered client records or point `MCP_AUTHORIZATION_SERVER_URL` at the approved external authorization server.

## THE LINE

All listings must say smbX is software and deterministic deal infrastructure. It computes, cites, packages, and routes. It does not provide legal, tax, investment, brokerage, accounting, appraisal, escrow, negotiation, payment, or closing authority, and it never takes success fees, referral fees, wallet fees, or deal-value fees.
