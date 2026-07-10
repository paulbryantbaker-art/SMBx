# smbX.ai — Wireframe Handoff for Claude Code

Product: **smbX.ai** — Yulia, an AI deal team for lower-middle-market M&A ($300K–$10M+ deals).
Wireframes: `smbX Wireframes.dc.html`, **turn 5** (ids `5a`–`5m`) is the committed handoff set, in the turn-4 visual grammar (CashApp simplicity + Gemini/Claude workspace UX). Earlier turns are exploration history.

## The one idea
The website is the app's front door in disguise. Any page → user types one sentence into the ChatDock → page **morphs** (~300ms CSS crossfade, no navigation) into a live conversation with Yulia, who responds with real computed numbers. No signup before value.

## Surfaces
| Wireframe | Surface |
|---|---|
| 5a / 5b | Homepage `/` desktop / mobile — greeting + pill input + persona chips; fee anchor + 3 steps below fold |
| 5c | `/sell` — calm principal voice, sample Baseline™ card, anxiety-first FAQ |
| 5d | `/buy` — deal-check artifact (multiple vs market), paste-a-listing |
| 5e | `/brokers` — terse, throughput stats [need sourcing], capability chips |
| 5f | `/how-it-works` — "Not guessed. Computed." worked example + deterministic engine + timeline w/ honest email-ask marker |
| 5g | `/pricing` — broker-fee anchor + live deal-size slider; **tiers/prices are placeholders — model unresolved** |
| 5h / 5i | Morph sequence desktop / mobile (3 states + timing) |
| 5j | Conversation spine: 4-beat first response → Blind Equity™ reveal → email card → price card |
| 5k | Logged-in app desktop: sidebar + chat + canvas (doc tabs, versioned Baseline) |
| 5l | Logged-in app mobile: deal home (big number) · chat · slide-up doc drawer |
| 5m | Component inventory + state machine (canonical spec card) |

## AppPhase state machine (locked — do not turn into routes)
```
landing(page) --send--> chat
chat --back--> landing (exact page + scroll restored)
chat --artifact--> chat+canvas   (>=768px: right panel)
chat --artifact tap--> drawer    (<768px: slide-up, ~92%)
```
- CSS crossfade ~300ms: page out 0–200ms; chat in 100–300ms; nav links out ~200ms; "← Yulia" in 200ms @100ms delay. Logo never moves. ChatDock is the same DOM node through the morph (no remount). Mobile: keyboard never dismissed.
- Conversations persist; desktop sidebar slides in without reflowing chat/canvas.

## Context piping
Origin page seeds Yulia's context — she never asks "buying or selling?" if the page said it:
`/` unknown (persona chips can set) · `/sell` seller/valuation · `/buy` buyer/deal-check · `/brokers` practitioner/terse.

## Shared components
- **ChatDock** (ONE component everywhere): pill, auto-expand textarea 1–5 rows, ＋ tools/upload, attachment chips, circular terra send visible only with text. Placeholders: home "Tell Yulia about your deal…" · /sell "…about your business…" · /buy "…what you're looking for…" · /brokers "…about the deal you're working…" · in chat "Message Yulia…"
- **BigNumber** — CashApp-scale ranges, Inter 700/800, tight tracking, gray en-dash.
- **ResultCard** — Baseline™ / DealCheck / BlindEquity™ variants; receipt rows expandable to math + source; version chip.
- **QuickReplies** — pill row after Yulia's turns; primary pill terra-outlined.
- **EmailCard / PriceCard** — in-stream cards, never modals. Email asked only right before first deliverable ("where should I send it?"), skippable.
- **Canvas/Drawer** — same doc component; right panel ≥768px, drawer <768px.
- **PillNav** — app mobile floating nav: home · chat · docs.

## Message rendering
User: right-aligned bubble, bg `#FFF0EB`, border `rgba(212,113,78,.18)`, text `#1A1A18`. Never solid terra, never dark.
Yulia: **no bubble** — plain text on the page bg, numbers at display scale, name/avatar alongside. First response is always the 4-beat: classify → estimate (real range + math) → sourced insight → the one question that moves the number most. She ends every turn driving.

## Visual tokens (locked)
Page `#FAFAFA` · cream `#FAF8F4` · card `#FFFFFF` border `#eeeef0` · app `#f9f9fc` · text `#1A1A18` / `#44403C` / `#6E6A63` · **terra `#D4714E` functional only** (send, active states, section labels, hero numbers, logo X — never decorative fills) · terra-soft `#FFF0EB` user bubbles only · cards ~20px radius, pills 999px · **no italics** — `<em>` renders as terra color · Inter 400–800 everywhere. Logo: `assets/logo-terra-x.png` (only X terra); `uploads/logo.png` is the all-black source.

## iOS Safari (locked)
Chat containers sized by `--app-height` from `visualViewport`. Never `100dvh`. Never `overflow:hidden` on a fixed chat container.

## Conversion sequence (order is law)
1. Anonymous value (Baseline/add-back) → 2. email (in-stream card, after value) → 3. personalized anchored price (number TBD) → 4. NDA/financials (out of this phase).

## Open decisions for Paul (present options, don't pick)
1. Hero typeface: build both **Sora ExtraBold** and **Inter 800** hero variants.
2. Pricing model (subscription / per-deal / wallet) — keep all price UI placeholder-driven.
3. Broker-page throughput stats need real sourcing.
