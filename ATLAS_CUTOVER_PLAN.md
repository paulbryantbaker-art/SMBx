# Atlas M&A — Cutover Plan

Last updated: 2026-06-18
Source: `Atlas M&A - Hi-Fi.dc.html` (Claude Design hi-fi, 13 screens). Read in full
for this plan. Companion to `ATLAS_WIREFRAME_GAPS.md` (the gap review CD built
against) and the standing guardrails `DESKTOP_REBUILD_BRIEF.md` /
`DESKTOP_BACKEND_MAP.md`.

> **Verdict on the design:** this is the right direction and it's largely
> complete — a clean Gemini/Google-Docs language that folds in nearly every gap
> from the wireframe review (journey gates, citations, deal team, the approval
> gate, billing, members). It is a *desktop* app. The plan below is how to cut
> over to it without repeating the failure that sank every prior attempt.
>
> **The one rule that has failed every time, restated:** Atlas is a NEW SHELL +
> NEW SCREENS, but it reads the **SAME backend and the SAME hooks the mobile app
> already proves work** — never a parallel data layer. The screens are net-new
> *presentation*; the data is the proven mobile data. If a screen needs a fetch,
> it uses the existing hook/endpoint, or it's an honest-empty state, or it's a
> named backend gap below — never invented.

## 0. The decision that gates everything — DECIDED (2026-06-18)

**Build Atlas for desktop now; keep the mobile app exactly as it ships today.**
Claude Design will design the Atlas-mobile variant later, as a separate pass.

Mechanically this is **Option A**: `V6App` renders the Atlas shell at/above a
desktop breakpoint and the existing `V6Mobile` below it. **Two shells, one data
layer** — both read the same hooks/endpoints. Mobile is not touched; nothing
about it changes. Atlas is purely the wide-screen presentation on top of the
proven mobile data. When CD delivers the Atlas-mobile DL, the breakpoint logic
can later collapse to a single Atlas shell — but that is a future pass, not now.

This is the safest path to shipping Atlas without re-risking the only experience
that works today, and it's exactly what the guardrails were written for (one
*data* path, not one shell).

> Earlier options B (Atlas-only, responsive now) and C (desktop-first, mobile's
> fate undecided) are superseded by the decision above.

## 1. Design system (from the source)

- **Type:** DM Sans (400–700). Display sizes 50px (home greeting), 22–24px
  (screen titles), 13.5–14px body, 11–12px meta/eyebrows.
- **Color:** ink `#1f1f1f`; muted `#5e6b7b` / `#80868b` / `#9aa3ad` / `#444746`;
  primary blue `#0b57d0` (actions, active), light blue `#e8f0fe`; page `#e9edf2`,
  surfaces `#fff` / `#fafbfd`; borders `#eef1f5` / `#e3e8ef` / `#dbe3ec`; success
  `#1f8a5b` / `#e6f4ec`; warn `#9a6b00` / `#fdf0d5`; risk `#c2410c`.
- **The Yulia mark** is the Google-style gradient `linear-gradient(135deg,
  #4285F4,#9B72CB 50%,#D96570)` clipped to the `✦` glyph (the `.sp` class).
- **Shape:** cards 13–16px, composer 34px, pills 999px, app window 16px. Soft
  shadows `0 1px 2px rgba(60,64,67,.06)`.
- This is a **new token set** — not the mobile `--mb-*` / `--cd-*` palettes.
  Stand it up as its own scope (e.g. `atlas` tokens) so it can't collide with
  mobile styling.

## 2. Shell (Phase 0)

- **Global header (58px):** `✦ Atlas` + module tabs (Today, Pipeline, Sourcing,
  Deals, Studio, Integration, Files, Agent) + search/help/notifications + Upgrade
  pill + avatar→Settings.
- **Two body modes:**
  - **Today** = full-bleed Gemini home (no chat rail): glow + greeting + central
    composer (with a "Yulia Pro" model selector) + quick-action chips + two-column
    "Needs your attention" / "Yulia & your agents".
  - **isApp** = **persistent 340px Yulia chat rail** + detail (flex), detail may
    have an optional 198px master sub-list. The chat rail is the spine of the
    whole app and carries: message thread, an inline **checklist** (✓/▷),
    **"What I used"** citation block, suggestion chips, an agentic **plan** with
    status rings, and a **"⏸ Needs your approval"** card. A "Yulia sees this
    screen" disclaimer sits under the composer.
- **Settings** = its own 236px nav + content pane (outside the deal workflow).

The chat rail is the single most reusable thing: it's the mobile `ChatSheet`
content + `useAuthChat`/`useAnonymousChat` bridge, re-laid-out as a left rail.
Build it once; every isApp screen shares it. THE LINE (`agency_staged_actions` +
confirm/cancel) already powers the approval card — reuse it; don't rebuild.

## 3. Screen-by-screen cutover map

Legend: ✅ reuse mobile data/hooks · 🟡 exists, thin wire · 🔴 genuine backend gap

| Atlas screen | Reads | Status |
|---|---|---|
| **Today** | `useV6WorkspaceData`/`useMobileDeals` + `useNextActions` (needs-attention) + `/api/deliverables/all` (agent activity) + the chat bridge (central composer) | ✅ |
| **Pipeline** (deal flow) | `useMobileDeals`, `shared/gateRegistry.ts` | ✅ |
| **Sourcing** | `/api/sourcing/*` (theses → candidates → tiers), `usePipelineProgress` (now that the SSE token bug is fixed) | ✅ / 🟡 |
| **Deals** (portfolio table) | `useMobileDeals.all` | ✅ |
| **Cockpit** | `/api/deals/:id` + `/api/agency/deals/:id/brief` (verdict, fit, read, **citations**, risks, nextMoves) + gates + KPIs; **Deal-team chat** = `deal_participants` + the deal-team messages backend (DT-1/DT-2) | ✅ |
| **Studio** (deck/doc) | analysis catalog + `model_executions` + the deliverable generators (CIM/IOI/memo…) + Puppeteer PDF export | ✅ / 🟡 |
| **Integration** (PMI) | native PMI `/api/deals/:id/integration-plan` (milestones, workstreams, levers) — captured-$ honest-dash | ✅ |
| **Files** (data room) | data-room routes + `documentShareService`; **cited-clause highlight** comes from the grounded-Q&A citation (doc id + page anchor) | ✅ / 🔴 page-anchor |
| **Agent** (build-your-own) | `agency_staged_actions` / the agentic loop for runs; **a persistent "agent" object (goal + schedule + run history)** does not exist as a first-class entity yet | 🔴 |
| **Settings · Profile** | `users` row | ✅ |
| **Settings · Billing** | `subscriptionService` + Stripe portal. ⚠️ the mock shows "Professional $1,200/mo" — **stale**; use the locked plans (Free/$99/$249/$749/$3,000+) per `SMBX_PRICING_LOCKED.md` | ✅ (fix copy) |
| **Settings · Notifications** | preference store (may be 🔴 — a notif-preferences table) | 🟡/🔴 |
| **Settings · Members & roles** | `deal_participants` + invites (DT-1) | ✅ |
| **Settings · Connections** | MCP/agent keys + integrations — partially exists (DEFINITIVE connector work) | 🟡 |
| **Settings · Security** | 2FA/sessions/SSO — mostly 🔴 (enterprise) | 🔴 |

## 4. Genuine backend gaps Atlas introduces (decide scope per phase)

- **Agent as a first-class object.** Atlas's Agent screen is a *saved, schedulable
  agent* (goal + sources + schedule + on/off + run history), not just an in-chat
  agentic loop. The loop and staged actions exist; **persisted agent definitions +
  run history + scheduling** do not. This is the biggest net-new backend.
- **Citations with page anchors everywhere.** The brief already returns sources;
  the Data Room "CITED · clause 7.3, p.12" highlight needs a **document
  page/section anchor** to jump to. Grounded-Q&A citations exist; the
  jump-to-anchor in the PDF viewer is new.
- **Notification preferences** (the Settings toggles) — likely a new table.
- **Security/SSO** — enterprise-tier, defer.
- **Stale pricing** — the Billing mock's `$1,200/mo Professional` must become the
  locked plans; the free-tier paywall (now wired) and Upgrade pill point here.

## 5. Build phasing

- **Phase 0 — Shell + chat rail + Today.** Header/tabs, the persistent Yulia chat
  rail (reusing the bridge + staged-confirm + citation/plan/approval blocks), and
  the Today home. Zero backend. This proves the spine.
- **Phase 1 — The data-rich reuse screens.** Cockpit, Pipeline, Deals, Files,
  Integration — all read existing endpoints; honest-empty everywhere. This is the
  bulk of the product and needs no backend build.
- **Phase 2 — Studio + Sourcing.** Studio over the analysis/deliverable runtime;
  Sourcing over `/api/sourcing/*` (SSE token bug already fixed). Mostly existing
  backend + thin wires.
- **Phase 3 — Agent + Settings.** Agent needs the new persisted-agent backend
  (scope it first). Settings: Profile/Billing/Members reuse; Notifications/
  Connections/Security are thin-or-net-new.

Each phase ships behind the `V6App` desktop branch (option A), so mobile is never
touched and each screen is verifiable live against real data.

## 6. Cross-cutting law (unchanged)

- **One data layer.** Atlas screens call the same hooks/endpoints mobile uses.
  No new fetch path unless it's a named gap above.
- **THE LINE.** The approval card is the staged-confirm UI; wire it to the
  existing `agency_staged_actions` confirm/cancel — every irreversible action
  (outreach send, IOI, share, advance-gate) routes through it. Yulia shows
  analysis/options/implications; the user decides.
- **Honesty.** Citations only on real grounded facts; captured-$ stays a dash;
  every value real or an honest "—"; every screen needs empty/loading/error
  variants. No fabricated numbers from the mock fixtures.
- **Pricing is locked.** Free / $99 / $249 / $749 / $3,000+ — the mock's $1,200
  is design filler, not the price.
