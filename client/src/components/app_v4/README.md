# app_v4 — Claude Design rebuild (in progress)

This folder is the React/TypeScript rebuild of the Claude Design handoff bundle
at `client/src/components/claude_design/app/project/`. It replaces the current
Glass Grok internal app (`client/src/components/app/`) once complete.

**Scope for this pass**: visual show-and-tell only. Mock data, no API wiring,
no state sync to real deal/conversation backends. A separate session wires
everything to production data after the design lands.

## Access

Dev route: **`/v4`**

Mode flip via query string:
- `/v4?mode=desktop` (default)
- `/v4?mode=mobile`

Or press `d`/`m` while focused on the page to toggle.

## Structure

```
app_v4/
├── index.tsx           — entry (route target)
├── V4App.tsx           — root component, mode switcher
├── tokens.css          — v4 design tokens, scoped to .app-v4
├── data.ts             — typed mock data (portfolios, deals, pinned, …)
├── session.ts          — localStorage-backed session state
├── chrome/             — desktop shell pieces (V4Shell, V4Tool, V4Chat, V4Canvas, V4Rail)
├── canvas/             — canvas body dispatcher + content views (Rundown, DD, LOI, etc.)
├── mobile/             — MobileApp + 4 tabs (Today, Deals, Chat, Inbox)
└── shared/             — ScoreDonut, Pill, DimRow, etc.
```

## Known fixes to apply when wiring the mobile Chat tab

See memory:
- `feedback_pwa_chat_flex_layout.md` — three-layer iMessage architecture
- `feedback_pwa_chin_viewport_fit.md` — no `viewport-fit=cover` in `index.html` (already applied globally)

Do NOT rediscover those from scratch. They cost us an afternoon.
