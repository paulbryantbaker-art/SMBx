# Go-Live Test Plan — smbx.ai v1.0 (live)

> Final test pass before public launch. **Everything is live.** Two tracks run in parallel:
> - **Track A — UI (human):** Paul drives the real app at `smbx.ai` / `app.smbx.ai`.
> - **Track B — Substrate (agent):** Claude exercises the live agent / API / MCP surface at `https://smbx.ai` (the "Tier 3 — post-deploy synthetic against production URL" layer from `TEST_PLAN_SUBSTRATE_AGENT_POV.md`).
>
> Mark `- [x]` when verified; record observed values + issues inline. Pairs with:
> - `GO_LIVE_CHECKLIST.md` — the config/build/submit tracker (what's *done*, not what's *tested*)
> - `CONNECTOR_TESTING_RUNBOOK.md` — hands-on connector/MCP sequence (depth for Track B)
> - `TEST_PLAN_SUBSTRATE_AGENT_POV.md` — full substrate taxonomy (DC/MC/TL/SI/MM/FM/TB/CV)
>
> _Created 2026-06-03._

---

## Pre-flight (do first — both tracks depend on it)

- [ ] **Prod env honesty.** Confirm Railway prod has `TEST_MODE=false`, `DEV_NO_PAYWALL=false`, `VITE_DEV_AUTH_BYPASS=false`. If any are on, the paywall + auth tests are fake. *(Local `.env` has all three ON — those must NOT be the prod values.)* [GO_LIVE_CHECKLIST §0]
- [ ] **Stripe mode.** Confirm whether prod runs Stripe **test** or **live** keys this pass, and that `STRIPE_WEBHOOK_SECRET` + the webhook endpoint exist. Decide which mode A4 runs in.
- [ ] **Pin the build.** Note the commit/deploy currently live so any issue maps to a build.
- [ ] **Dev login gone.** Confirm the "Sign in as Paul" / dev-login affordance is absent on the live production build. [GO_LIVE_CHECKLIST §1]

---

## Track A — UI (Paul, live on smbx.ai / app.smbx.ai)

> Run each on **desktop first, then a real phone**. For each: ✅ pass / ⚠️ issue / ❌ fail + a one-line note.

### A1 · Marketing → chat handoff
- [ ] Every marketing page loads fast, no console errors, renders edge-to-edge (Home/Buy/Sell/Raise/Integrate/Connectors/Standard/About/Pricing).
- [ ] Each page's primary CTA + the launcher route into **chat with Yulia** carrying the typed message. No "Contact Sales", no dead CTAs.
- [ ] Nav + footer links work; navigating a page scrolls to **top** (not landing mid-page).
- [ ] Pricing shown = locked ladder **Free / $99 / $249 / $749 / $3,000+**.

### A2 · Auth
- [ ] New email sign-up works; verification (if any) works.
- [ ] Google OAuth sign-in works; **no re-auth loop** (login nav uses replace).
- [ ] Sign out, sign back in. Session persists on refresh.

### A3 · Chat with Yulia (core)
- [ ] Real question → streamed response. Tone is expert M&A; **never says "As an AI."**
- [ ] Persona adapts by league/deal size.
- [ ] **THE LINE:** ask for a recommendation on a regulated decision (e.g. "should I sign this LOI?", "what should I offer?") → Yulia shows analysis + options + implications, **declines to recommend/negotiate**. No investor-solicitation help on raise.

### A4 · First free deliverable → paywall (THE launch flow) 🔴 critical
- [ ] As a **free** user, generate ONE deliverable (ValueLens / deal score / valuation) from real numbers.
- [ ] Output **computes** — every figure traces to an input; no invented numbers.
- [ ] Attempt a **second** deliverable → **paywall triggers** (after first free deliverable, not a fixed gate).
- [ ] Upgrade → **Stripe checkout** → pay with the agreed test/live card *(Paul does card entry)* → **webhook fires** → plan updates → second deliverable unlocks.
- [ ] Receipt/confirmation shown; plan reflected in Settings.

### A5 · Pipeline / deals
- [ ] Deals list loads real data; honest empty state + first-deal CTA when none.
- [ ] "See all → full deals list" works (desktop + mobile).
- [ ] Create/add a deal; deal detail loads with real figures.

### A6 · Data room
- [ ] Open data room; **upload** a file; **open/download** it.
- [ ] **Export (PDF)** works — *desktop and mobile* [GO_LIVE_CHECKLIST §1].
- [ ] **Comments** work — *desktop and mobile*.
- [ ] **Share** button produces a real share link (not dead).

### A7 · Canvas models
- [ ] Open a model tab from chat (`create_model_tab`).
- [ ] Change an assumption ("what if EBITDA is $1.5M") → model recomputes.
- [ ] Export the model.

### A8 · Settings / billing
- [ ] Settings loads; profile + usage + current plan correct.
- [ ] **"Manage subscription"** opens the Stripe customer portal [GO_LIVE_CHECKLIST §1].

### A9 · Mobile pass
- [ ] Re-run A1, A3, A4, A6, A8 on a phone.
- [ ] In-app **back** nav works (pushState/popstate); no trap.
- [ ] Touch targets ≥44px; no horizontal scroll; text legible.

### A10 · Copy / compliance / polish
- [ ] No stale pricing, no decorative eyebrows, ValueLens (not Bizestimate), Yulia (not Contact Sales).
- [ ] Raise page: no investor solicitation/contact; Integrate: one-time plan, no monthly-PMI promise.
- [ ] ⚠️ **About page founder paragraph is still a placeholder** (`[Founder paragraph — to be written by Paul…]`) — write or hide before launch.

---

## Track B — Substrate (Claude, live @ https://smbx.ai)

> Read-only synthetic checks against production. Legend: ✅ pass · ⚠️ issue · ❌ fail · ⏳ pending · 🔒 needs auth token. Observed values recorded inline.

### B1 · Discovery & entry (DC) ✅
- [ ] All discovery surfaces resolve `200 application/json`: `/.well-known/definitive.json`, `/.well-known/agent-card.json`, `/.well-known/mcp/server-card.json`, `/.well-known/mcp/server.json`, `/server.json`, `/.well-known/definitive-schemas.json`.
- [ ] **Cross-consistency:** spec version, canonical base URL, and tool/model counts agree across `definitive.json` ↔ `agent-card.json` ↔ `server-card.json` ↔ `/api/definitive/spec`.
- [ ] Agent card advertises pricing posture + **no-referral / no-success-fee** boundary + source types.

### B2 · Spec & catalog integrity (zero-hallucination) ✅
- [ ] `/api/definitive/spec` reports the documented substrate facts: **DEFINITIVE v1.1**, **123 model slots**, **30 gates**, **472 conformance cases**, **233 authority rows**. Any mismatch vs source = ⚠️.
- [ ] `/api/definitive/pass-through-catalog` + `/api/definitive/model-catalog` well-formed; executable vs professional-handoff vs research-only counts present and self-consistent.
- [ ] `/api/definitive/substrate-architecture` exposes the Deal OS work surfaces (Today/Pipeline/Files/Data Room/Studio/Models/Audit) + portable-package contract.
- [ ] A representative slot (`/api/definitive/deal-mechanics/models/:slotId`, e.g. M109 / M206) returns inputs, computation, **authorities**, and THE LINE boundary.

### B3 · MCP protocol — remote `/mcp` ✅
- [ ] `initialize` → valid protocol/capabilities handshake.
- [ ] `ping` → ok.
- [ ] `tools/list` → 50+ tools, each with name + input schema; counts match the server-card claim.
- [ ] Unauthenticated `tools/call` → **401 + `WWW-Authenticate`** pointing at `/.well-known/oauth-protected-resource/mcp`.
- [ ] OAuth metadata consistent: `/.well-known/oauth-protected-resource`, `/.well-known/oauth-protected-resource/mcp`, `/.well-known/oauth-authorization-server`, `/.well-known/openid-configuration` resolve + reference the same issuer/resource.
- [ ] 🔒 Authenticated `tools/call` happy-path — run via the demo agent in `CONNECTOR_TESTING_RUNBOOK.md §2/§3` (needs a token).

### B4 · OpenAPI / GPT Actions ✅
- [ ] `/api/definitive/openapi.json` + `/api/definitive/gpt-actions/openapi.json` are **valid OpenAPI** (parse; `servers` → smbx.ai; unique `operationId`s; security schemes present).
- [ ] GPT-Actions facade is importable scope (focused tool set, OAuth client wiring present).

### B5 · THE LINE boundaries (TL) ✅
- [ ] Live surfaces carry THE LINE metadata: **no success/referral/deal-value fees**; model classification (executable / professional-handoff / research-only); regulatory-neutrality posture.
- [ ] `/api/definitive/assistant-distribution-readiness` + `/api/definitive/connector-distribution` + `/api/definitive/mcp-launch-readiness` (alias) report blockers vs ready — cross-check against `GO_LIVE_CHECKLIST §2`.

### B6 · Conformance baseline (local, DB-free) ✅
- [ ] `npm run test:definitive-conformance` → all **472** cases pass locally (known-good baseline).
- [ ] `npm run test:definitive-surface` + `test:definitive-reference` + `test:definitive-reference-python` pass.
- [ ] Live spec's advertised counts == local harness counts (no deployed drift).

### B7 · Drift / parity sweep ✅
- [ ] Tool count + model/gate counts identical across server-card ↔ spec ↔ openapi ↔ agent-card (catch deploy drift).
- [ ] `/api/definitive/registry-package` + `/api/definitive/enterprise-allow-lists` resolve and align with the discovery surfaces.

---

## Pass criteria (substrate is launch-ready)

**Infrastructure (necessary):** all discovery + spec + MCP + OpenAPI endpoints resolve, valid, cross-consistent; OAuth challenge correct; 472 conformance pass.

**Doctrine (any single failure blocks):** zero-hallucination counts match source; THE LINE boundaries present on every monetized surface; no success/referral/deal-value fee anywhere; refusals hold under the demo-agent probe.

---

## Results log

### Track B — Substrate, executed live @ https://smbx.ai · 2026-06-03 · **VERDICT: ✅ launch-ready at protocol / spec / conformance level**

**B1 · Discovery cross-consistency — ✅ PASS.** All 6 discovery surfaces 200/JSON. Counts agree across definitive.json ↔ agent-card ↔ server-card ↔ server.json: **tools 53 · models 123 · gates 30 · conformance 472 · schemas 53 · primitives 8**. Version split is intentional & consistent (spec/agent-access = `DEFINITIVE.v1.0`; deal-mechanics catalog = `DEFINITIVE.v1.1`). THE LINE present on every surface (`noSuccessFees:true` + full `lineDeclaration`).

**B2 · Spec zero-hallucination — ✅ PASS.** Live `/api/definitive/spec`: v1.1 mechanics, **123 slots** (121 active / 2 reserved / 0 unmapped), **30 gates**, **472 conformance** (202 runtime + 33 stack + 237 other), LINE categories 46 professional-handoff / 14 research-only. All match source. ⓘ Authority figures are layered & coherent — **233 active ingested rows** (REPO_STATUS), 980 seed-plan entries, 800+ target, 155 research-queue, 20 categories.

**B3 · MCP protocol + OAuth — ✅ PASS (spec-correct).** `initialize` → protocolVersion `2025-11-25`, serverInfo `smbx-ai/diligence` v1.0, capabilities `{tools}`, stateless. `ping` ok. `tools/list` → **53 tools, 53/53 with inputSchema**. Unauth `tools/call` → **401 + `WWW-Authenticate: Bearer resource_metadata="…/oauth-protected-resource/mcp", scope="conformance:read"`** + JSON-RPC `-32001`. 🔒 Authenticated happy-path tools/call still to run via demo agent (needs token) — `CONNECTOR_TESTING_RUNBOOK §2/§3`.

**B4 · OpenAPI — ✅ PASS.** `/openapi.json`: 3.1.0, 16 paths, 0 dup opIds, `bearerAuth`. `/gpt-actions/openapi.json`: 3.1.0, 17 paths, 0 dup opIds, `smbxOAuth`. Both servers → https://smbx.ai. Importable.

**B5 · Readiness / blockers — ✅ surfaces ready; blockers = known config/asset/legal.** All protocol surfaces `ready`; connectorDistribution `packaged_pending_platform_submission`. `revenueChecks: BLOCKED` → Stripe live keys + webhook secret not configured (= GO_LIVE §0). protocolReadiness blockers: `remote_mcp_inspector_pass`, `platform_auth_review`, persistent OAuth client (= GO_LIVE §2). 5 manual asset/legal checks. 12 write tools require approval.

**B6 · Conformance baseline — ✅ `472 passed, 0 failed`** locally; equals advertised count → no deployed drift.

**B7 · Drift sweep — ✅** (one minor consistency note, Flag 1).

**Flags — neither blocks App or MCP-connector launch:**
- **Flag 1 · tool-contract coverage (low / track-3):** MCP exposes 53 tools; V19 resource contract (`server/services/v19ResourceContract.ts`, `v19.0`) defines 46 → 7 newer Deal OS tools lack a V19 contract entry. Also reconcile the live "12 write / 41 read" split against GO_LIVE §3's "only 2 external-agent-safe today." Do this in the Agent-track tool-readiness audit.
- **Flag 2 · authority number labeling (copy):** 233 active vs 980 plan vs 800 target all real but distinct — ensure public/agent copy cites one clearly-labeled figure.

**Next substrate step needing a human/token:** run **MCP Inspector against the live `/mcp`** + the authenticated demo-agent `tools/call` (`CONNECTOR_TESTING_RUNBOOK §2/§3`). Everything else on the substrate side is green.

_Track A: Paul logs inline above._
