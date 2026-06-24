# Atlas Mobile Redesign — the design law

Source of truth for the Cash App–inspired mobile cutover (2026-06). Build to this.
Scope: the Atlas-mobile shell (`client/src/components/v6/atlasmobile/`). Desktop
(`v6/desktop/`) is unaffected.

## The law

1. **Surface — separation by tone, not borders or shadows.** Soft warm grey page
   (`#f3f2ef`), white elements (`#fff`). NO card borders, NO shadows, NO gradient.
   White reads as raised purely because the page is grey.
2. **Color — one accent, a little everywhere, never full-bleed.** A single violet
   accent (`#5b53d6`) carries the primary action, the active nav, and the send
   button on every screen. Add small confident colored marks/icons (the ~40px
   circles) and one live data touch per data screen (a sparkline / a green
   delta). Warm screens (Yulia, Studio) use SOFT tints, never saturated surfaces.
   Color lives in CONTENT (marks, icons, data) — the chrome stays mono.
3. **Type — heavy display, big bold headers.** One heavy display hero per screen
   (`~46px`). Section headers are big and bold, sentence case (`~19px`) — NOT
   tiny uppercase eyebrows. Body/rows `17px`. A monospace voice
   (`ui-monospace`) for technical/collectible labels (deliverable types, IDs,
   DRAFT/LIVE).
4. **Layout — one hero, action on the row, breathe.** One dominant thing per
   screen. List rows = leading icon/mark · bold title · one line · an action pill
   ("Open"/"Start") on the right — no chevron-as-affordance, separated by
   whitespace (not dividers). NO big in-content buttons. Generous whitespace is
   the design.
5. **Yulia — a context-preserving slide-up sheet, never a full screen.** The FAB
   / floating menu on every screen slides Yulia UP over the current screen (which
   stays dimmed behind, so she "sees" it). The sheet houses the chat AND a
   jump-to nav list — peek it for chat, drag it up for navigation. Reuses the
   existing `MobileChatBridge`.
6. **Homes — two places for everything.** Per-deal work lives INSIDE the deal (the
   cockpit's section rows: Financials · Valuation · Diligence · Data room · …).
   Everything else lives in the AVATAR MENU HUB (profile · setup prompts ·
   Workspace modules · Account & settings). Bottom tabs are just **Today ·
   Deals**.

## Surface map (how every screen is reached)

| Access | Surfaces |
|---|---|
| Floating tabs | Today · Deals |
| Yulia sheet (FAB/menu, any screen) | chat + jump-to nav (Deals, Sourcing, Studio, Files, modules) |
| In-card deal workflow (tap a deal) | Financials · Valuation · Diligence · Data room · Build · Structuring · Team · Canvas |
| Avatar → menu hub | Profile/edit · setup prompts · Workspace (Sourcing · Studio · Agent · Integration) · Account & settings (Personal info · Members · Security · Notifications · Billing · Privacy · Integrations) · Help · Sign out |
| Sheets & moments | Add deal · ⋯ actions · confirms · onboarding · deal-won |

## Cutover (3 milestones, each shippable + device-reviewed)

- **M1 — Spine:** foundation tokens + primitives; Today · Deals · Cockpit rebuilt;
  Today/Deals tabs + Yulia FAB; the Yulia slide-up sheet.
- **M2 — Hub + secondary:** avatar menu hub; migrate Sourcing/Studio/Agent/
  Integration/Files/Settings; drop the 4th tab.
- **M3 — Expressive + polish:** onboarding, Yulia front-door, deal-won, Studio
  collectible feel, tactile module icons, copy pass, retire dead code.

## Intentionally retired
The purple all-over gradient, the glass nav, card borders + shadows, the
full-screen chat, and the big "Ask Yulia" buttons. (The "go clean" decision —
reversible in git, gated screen-by-screen so there's no ugly interim.)
