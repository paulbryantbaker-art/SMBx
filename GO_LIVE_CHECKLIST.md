# Go Live Checklist — smbx.ai v1.0

> Shared launch tracker. **Edit this file freely** — it's the single source of truth.
> Mark items `- [x]` as they're done.
>
> **Three products, three timelines:**
> - **App (human)** — ~90% there. Mostly config + confirm 2 flows.
> - **MCP connector** — code is done. Just config + submit + a legal review.
> - **Agent (licensable)** — furthest out. Needs product decisions, then a real build.
>
> **Tag legend** (rough owner in parens):
> `[config]` env/secrets (you) · `[legal]` counsel (you) · `[decide]` product call (you) ·
> `[submit]` external submission (you) · `[qa]` testing (either) · `[build]` code (me)
>
> _Last updated: 2026-06-02_

---

## 0 · Shared go-live infra — unblocks all three products

- [ ] `[config]` Live Stripe keys in prod (`sk_live_…`, `pk_live_…`) + price IDs (Solo / Pro / Team / Enterprise)
- [ ] `[config]` `STRIPE_WEBHOOK_SECRET` set + webhook endpoint created in the Stripe dashboard
- [ ] `[config]` Public HTTPS `APP_URL` (not localhost) and `TEST_MODE=false` in production
- [ ] `[config]` Persistent file storage wired (S3 / R2 / Railway volume)
- [ ] `[config]` Dev creds OUT of the deployed environment — use Railway secrets, never the committed `.env`
- [ ] `[config]` Rotate the seed superadmin password — `pbaker@smbx.ai` is still `test123`

---

## 1 · App (human) — the Yulia web + mobile app

**Status: closest to ship.** Chat, subscriptions (checkout + webhooks + 30-day trial + server-side paywall), pipeline, deal detail, and data room are all on real data and verified. Dev login is correctly gated off in production builds.

### Must-do for 1.0
- [ ] `[config]` Do §0 security hygiene (creds, secrets, webhook) — these block the App too
- [ ] `[build]` Confirm the "Manage subscription" (Stripe portal) link is shown in Settings; wire it if missing
- [ ] `[build]` Confirm mobile data-room **export (PDF)** + **comments** work end-to-end (task G2-4); finish if stubbed
- [ ] `[decide]` Intelligence reports + sourcing discovery have a `TODO: subscription check` (free right now) — make them free or paid, then enforce/remove
- [ ] `[qa]` Launch run-through: free deliverable → paywall → Stripe test payment → webhook fires → plan updates
- [ ] `[qa]` Verify the dev-login button is gone in a production build (`npm run build`)

### Scope decision
- [ ] `[decide]` Ship sourcing **web-first** for 1.0; defer the mobile sourcing engine (add-a-deal, thesis manager, discovery — tasks G3-1…G3-6) to 1.1

### Polish — 1.1, not blocking
- [ ] Trial-ended / downgrade messaging
- [ ] Onboarding tour (today users land in chat and ask Yulia — works, just unpolished)
- [ ] Response caching (fine under ~100 users)

---

## 2 · MCP connector — smbX tools inside Claude / ChatGPT

**Status: code-complete.** The `/mcp` server, OAuth 2.1 + PKCE, discovery metadata, `server.json`, the GPT-Actions OpenAPI, and 50+ tools are all built. **No building left** — this is config, validation, submission, and a legal review.

- [ ] `[config]` §0 shared infra (public HTTPS + live billing are hard gates for marketplace listing)
- [ ] `[config]` GPT-Actions OAuth client (`SMBX_GPT_ACTIONS_CLIENT_ID` / `_SECRET`)
- [ ] `[qa]` Run the **MCP Inspector** against the live `/mcp` endpoint; fix any gaps (required before listing)
- [ ] `[legal]` Counsel sign-off on public listing copy + tool descriptions (THE LINE language)
- [ ] `[submit]` Marketplace assets: icon, 3–4 screenshots, 30–60s demo video, listing copy
- [ ] `[submit]` Submit to the Claude connector directory (Anthropic auth review runs in parallel)
- [ ] `[submit]` Import the GPT-Actions OpenAPI into a private GPT → pilot → public GPT Store
- [ ] `[decide]` Whether to expose `invite_to_deal` (and future tools) on the MCP surface

---

## 3 · Agent (licensable) — our agent others can run on their own deals

**Status: furthest out.** The governance backbone is built (mandate chain, A0–A6 permission tiers, action gates, audit packets, conformance). What's missing is the runtime + the product itself. Root cause: the platform was built **human-session-first**, so "an agent acting without a human in a browser" is the architectural seam that's unfinished.

### Decide first — these gate the build
- [ ] `[decide]` The SKU: a **managed** agent smbX hosts (e.g. Acquisition Analyst / Diligence Manager / Document Builder), an **API** agent the customer runs, or both
- [ ] `[decide]` Billing unit: per agent-key / per API call / per mandate budget
- [ ] `[decide]` Scope contract: which tools + model slots an agent may use; read-only vs. write; may it draft an LOI?

### Then build
- [ ] `[build]` **Headless entrypoint** — decouple the agent loop from the web request so an external agent can invoke it (the single biggest gap)
- [ ] `[build]` **Multi-tenancy** — bind deals to a customer + enforce mandate scope at tool-call time (isolation)
- [ ] `[build]` **Mandate CRUD** — create / scope / revoke agent mandates (UI or API)
- [ ] `[build]` **Metering + spend-cap enforcement** — credit ledger; agent calls are currently un-metered
- [ ] `[build]` **Tool-readiness audit** — mark which of ~53 tools are external-agent-safe + define each one's required scope (only 2 today)
- [ ] `[build]` Agent onboarding guide + example client

---

## Suggested sequence
1. **§0 shared infra** → unblocks everything
2. **Ship the App (1.0a)** → closest; web-first
3. **List the MCP connector (1.0b)** → parallel to the App; ops + assets + legal, no building
4. **Define → build the Agent (1.0c / 1.1)** → its own milestone; don't start coding until the SKU is decided
