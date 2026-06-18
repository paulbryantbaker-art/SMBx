# Atlas M&A Workspace — Wireframe Gap Analysis

Last updated: 2026-06-17

> Companion to the **Atlas M&A Workspace — Wireframe Spec** (the new desktop
> direction: a clean Gemini/Google-Docs-grounded app with 5 views — Canvas,
> Deals, Data Room, Documents, Agent). This doc lists what the wireframes still
> need **for this specific product**, grounded in capabilities the backend
> already has. The point is frame completeness — not design language (DL comes
> after the frames are set).
>
> The 5-view spine is the right call: familiar, simple, and the opposite of the
> bespoke chrome that sank the previous desktop attempts. Keep it. These are
> additions, corrections, and missing states — not a redesign.
>
> The standing build guardrails still apply when Atlas gets built:
> `DESKTOP_REBUILD_BRIEF.md` (one render path; reuse the mobile data/hooks;
> never a parallel data world) and `DESKTOP_BACKEND_MAP.md` (most of this is
> already real backend).

## 1. Whole frames that are missing

- **Single-deal cockpit.** Deals shows a kanban, but there's no frame for
  *opening one deal*: profile, journey/stage progress, Yulia's verdict + fit,
  financials (revenue/SDE/EBITDA/league/multiple), key risks. The most-used
  screen in the real product — a card click must land somewhere.
  Backend: `/api/deals/:id`, `/api/agency/deals/:id/brief`.
- **Onboarding / first-run / intake.** Brand-new user, zero deals: how Yulia
  takes them from nothing → first deal (Yulia is the front door). Distinct from
  the per-view empty states.
- **Sourcing (off-market discovery).** A real 5-stage engine: define a
  thesis/buy-box → discover candidates (Google Places) → score/tier → route /
  draft outreach. NOT the "Sourcing" kanban column — a surface of its own
  (BUY-side). Backend: `/api/sourcing/*`, `buyer_theses`, `sourcing_candidates`.
- **Models / analyses workspace.** Agent shows a read-only Model/Comps/DCF
  artifact, but the product has **11 interactive models** (Valuation, LBO, DCF,
  SBA, Sensitivity, Cap Table, Earnout, Tax, Working Capital, Covenant,
  Comparison) with assumption sliders, scenarios, and version history, plus an
  analysis catalog (QoE, Recast, Comps, Red flags, Buyer fit). Where do you open
  and *drive* a model? Backend: `v19ModelRuntime`, `model_executions`, the
  analysis runtime.
- **Integration / PMI (post-close).** The pipeline ends at Closing, but PMI is a
  first-class journey: a 100-day value-creation plan (workstreams, levers,
  milestones). Backend: native PMI (`/api/deals/:id/integration-plan`).
- **Account / billing / plan / usage** — and, for top tiers, supervised
  MCP/agent keys.
- **Pricing / upgrade / paywall** — the free→paid moment. Free = one free
  deliverable, then a paywall gate; needs a frame.
- **Notifications / activity** — the bell: @mentions, "gate advanced,"
  "deliverable ready," review requests.
- **Search results** — ⌘K has an input but no results frame (deals / docs / Yulia).
- **Collaboration / deal team** — participants with roles (attorney, CPA,
  broker, lender, counterparty) + invites + a provider directory (re-agent,
  appraiser, escrow, title, insurance). "Share + avatars" implies this; no frame.

## 2. Missing states inside the 5 views you have

- **Data Room** is read + Q&A only. Add: **upload / file a deliverable / version
  / status lifecycle** (draft → review → approved → locked → executed),
  **ACL & membership**, **external (seller-side) sharing with NDA gating +
  share-links**, and "maintained by Yulia vs uploaded by seller" provenance.
  Backend exists for all of this (data-room routes, `documentShareService`,
  `deal_participants`).
- **Canvas / Documents:** the **staged-confirm** ("confirm before I act")
  moment; **citations on any financial claim Yulia inserts** (not just in Data
  Room — zero-hallucination is product law); **doc version history**; a
  **deliverable-template picker** (which of ~28 deliverable types is being
  drafted). Also: Canvas's right pane and the Documents view overlap heavily —
  decide whether they're one surface or two.
- **Agent:** an explicit **approval gate** within a run for anything irreversible
  (outreach send, IOI, advance-gate, share) and a **"defer to counsel/CPA"
  professional-handoff** state. "Pause/steer" is close, but the gate is the
  safety law, not a convenience. Backend: `agency_staged_actions` + the
  confirm/cancel routes already exist.

## 3. Where the wireframe mismodels the domain (fix in the frames)

- **Pipeline stages.** Atlas uses Sourcing → Diligence → Negotiation → Closing.
  The real model is **four journey types** (BUY / SELL / RAISE / PMI), each with
  its own **6 gates** (BUY: Thesis → Sourcing → Valuation → Diligence →
  Structuring → Closing; PMI is 4 post-close). The kanban and the deal card need
  `journey_type` + `current_gate`, not a generic 4-column flow — and the board
  likely filters by journey. Source of truth: `shared/gateRegistry.ts`.
- **Deal entity is richer than {id, name, value, sector, stage}.** Real deal
  carries `journey_type`, `current_gate`, verdict (Pursue/Watch/Pass), fit
  (0–100), revenue/SDE/EBITDA (integer cents), league, asking. The card and
  cockpit should reflect that.

## 4. Cross-cutting product law the frames must honor

- **THE LINE, everywhere.** Yulia shows analysis / options / implications; the
  *user* decides regulated moves, and any outward/irreversible action is
  confirm-gated. This is a consistent pattern (confirm card + handoff state),
  not a one-off in Agent. See `THE_LINE_POLICY.md`.
- **Honesty law, everywhere.** Every value is real or an honest "—"; never
  fabricated. Each frame needs explicit **empty / loading / error** variants
  (e.g. "no market read yet", "no plan yet", "—" for an unmodeled IRR), not just
  the happy path.
- **Market intelligence / read.** Yulia's bylined editorial on the portfolio +
  real sector data (PE activity, sector heat) — present in the product, absent
  from the frames. Could live on a home/Today surface or in Deals.

## 5. One scoping decision to make before the frames are "set"

**Is Atlas desktop-only, or does the working mobile app remain the mobile
experience?** Desktop has now been removed twice; mobile is the only thing that
ships today. If Atlas is desktop-only, these frames don't need responsive
variants and mobile stays as-is. If Atlas must also be the phone experience,
several frames (Canvas split, Data Room three-pane, Agent console) need a
narrow-viewport story. Decide this up front — it changes the frame count.
