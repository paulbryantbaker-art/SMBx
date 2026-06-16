# Desktop Rebuild Brief

Last updated: 2026-06-16

> Read this **before** writing any desktop code. It exists because the desktop
> UI was rebuilt several times and failed the same way each time. The failure
> was never visual — it was architectural. This brief is the guardrail that
> breaks the loop.

## What just happened

On 2026-06-16 **all** desktop UI was deleted from the repo (commit `da2116f`,
75 files / ~38.6K lines): the `nd` agent-first shell, the `cd` Ramp shell,
`components/shell`, `components/desktop`, `v6/Canvas.tsx`, `v6/Chat.tsx`,
`v6/modes`, and `v6/views`. `V6App.tsx` is now a 44-line single-path shell that
renders `V6Mobile` on **every** viewport.

The working mobile app is the only deal experience that exists, and it renders
everywhere today. Desktop is now a clean slate.

## Why every previous desktop attempt failed

Each attempt stood up its **own** components and its **own** answer to "what
does this deal need / how does Yulia guide," computed separately from the
backend the mobile app already reads correctly. Two derivations → two truths →
drift. The symptoms were always the same: "0 things need you," dead buttons,
fabricated data (Northwind / 24.6% IRR / Dana Okafor), and a desktop that felt
disconnected from the mobile app that worked.

A design pass that starts from *"make a nice desktop"* will reach for new
components and new data plumbing **again**, and fail the same way.

## The hard rules

1. **One render path.** `V6App.tsx → V6Mobile` is the only mount. Do **not**
   add an `isMobile` branch and do **not** recreate `components/nd | cd |
   desktop`. Make the existing path **responsive**; never fork it. A second
   branch is how the two worlds drift apart.
2. **No new data. Layout only.** You may not add endpoints, data hooks, or any
   "what does this deal need" logic. Desktop is a *wider arrangement* of the
   mobile screens — each pane reads the same hook it already reads on mobile.
3. **Honesty + THE LINE still apply** (CLAUDE.md #9, #12): every value is real
   or honestly empty, never fabricated. Yulia shows analysis, options, and
   implications; she never recommends regulated transaction decisions.
4. **Reuse, don't reimplement.** If you find yourself writing a new component
   that fetches deal data, stop — there is already a mobile screen + hook for
   it. Wrap/arrange it instead.

## Reuse these — they already work on mobile

**Hooks (the data layer — never re-derive these):**
`useV6WorkspaceData`, `useNextActions`, `useTodayOperatingBrief`,
`useMobileDeals`, `usePortfolioSummary`, `usePipelineProgress`,
`useNotifications` (all under `client/src/hooks/`).

**Endpoints (proven by the mobile app):**

| Endpoint | Returns |
|----------|---------|
| `/api/agency/deals/:id/brief` | verdict, `marketRead.researchNeeded`, `nextMoves` `{title, why, prompt, actionId}`, taxLegal |
| `/api/deals/:id` | `{ deal, gates }` |
| `/api/user/next-actions` | deterministic per-deal next steps (what mobile's guidance uses) |
| `/api/agency/today-operating-brief` | Today brief / gate countdown |
| `/api/sourcing/*` | full sourcing engine |

**Screens (`client/src/components/v6/mobile/screens/`):**
`Today`, `Detail`, `Pipeline`, `Analyses`, `Analysis`, `Model`,
`DealsListScreen`, `LibrarySearch`, `DealTeam`, `Usage`, `Watching`,
`ProviderProfileScreen`.

## The actual open design question

The mobile app currently renders in a ~307px column with the right two-thirds
of a desktop screen empty. The design work is deciding **how the wide viewport
uses that space** — most likely **master-detail**: a persistent left nav + deal
list *beside* the `Detail` pane, where every pane renders one of the existing
screens above, off the same hooks.

That is a layout decision on top of working data. It is not a rebuild, and it
must not become one.

## Design-system anchors

Per CLAUDE.md: desktop uses the CD design language (`design_handoff_smbx_*`
bundles, `DESIGN_SOURCE.md`, `DESIGN_TOKENS.md`). The interactive canvas models
(`components/models/*`) consume `--cd-*` tokens from `client/src/styles/cdTokens.css`
(still imported in `main.tsx`). No gratuitous eyebrows/micro-text. Never use a
`position:fixed` full-viewport background div (Safari toolbar-tint bug) — use
`position:absolute` inside a relative parent.
