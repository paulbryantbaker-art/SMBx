# smbX.ai — Design Handoff for Claude Code

Product: **smbX.ai** — Yulia, an AI deal team for lower-middle-market M&A ($300K–$10M+ deals).

**Canonical design source: `smbX Hi-Fi.dc.html`, turn 4 (ids `4a`–`4g`)** — full hi-fi marketing surface with final locked copy. `smbX Wireframes.dc.html` turn 5 (`5a`–`5m`) holds the UX/structure spec: morph sequence, conversation spine, logged-in app, component inventory, state machine. Earlier turns in both files are exploration history — ignore.

## The one idea
The website is the app's front door in disguise. Any page → user types one sentence into the ChatDock → page **morphs** (~300ms CSS crossfade, no navigation) into a live conversation with Yulia, who responds with real computed numbers. No signup before value.

## Visual system — "CashApp × Gemini × Liquid Glass"
Light, airy, glass materials; ink moments carry the numbers; neon green is the money color.

### Tokens
- Canvas: gradient `#FBFBF9 → #F4F6F2 → #EFF4EE` (subtle warm-to-green), with soft ambient radial blobs (`rgba(0,214,50,.10–.13)` green, `rgba(120,200,255,.12–.14)` blue) for glass to refract
- **Light glass panels**: `rgba(255,255,255,.55–.65)` + `backdrop-filter: blur(20–30px)` + `1px solid rgba(255,255,255,.75–.88)` border + `inset 0 1px 0 rgba(255,255,255,.9)` top highlight + large soft shadow `0 16-30px 44-80px rgba(26,26,24,.06–.10)`
- **Dark glass (ink) surfaces**: `linear-gradient(180deg, rgba(44,44,42,.94), rgba(15,15,14,.97) 60%)` + `backdrop-filter: blur(24px)` + `1px solid rgba(255,255,255,.14)` hairline. Used for: ChatDock, proof/number cards, primary CTAs, subscription card, Yulia avatar
- **Neon `#00D632`**: ONLY on dark glass (numbers, labels, accents) or as send-button fill with specular gradient `linear-gradient(180deg,#3BE264,#00D632 55%,#00C22E)` + `1px rgba(255,255,255,.4)` border + green glow shadow
- **Green on white: `#009E25`** (darkened for contrast) — section eyebrows, inline emphasis, "Start here →" links
- Text: `#1A1A18` primary · `#44403C` secondary · `#6E6A63` muted; on ink: `#fff` / `#c9c9c4` / `#9c9c97` / `#8a8a86`
- Type: **Sora ExtraBold** headlines (tight letter-spacing −2px range), **Inter** 400–800 everything else. No italics — `<em>` = green color change
- Radii: pills/docks/nav `999px` · cards `22–30px` · phone frames `34px`
- Logo: `assets/logo-green-x.png` (X in `#009E25`, rest black) — keep as-is. Source: `uploads/logo.png`

### Signature components
- **Glass nav pill**: floating, 1140px, logo left / links + ink "Ask Yulia" button right
- **Ink ChatDock**: dark glass pill, ＋ left, placeholder text, circular neon send (specular gradient). ONE component everywhere; placeholder varies by page (see below)
- **Ink proof card**: dark glass, neon eyebrow label, receipt rows with hairline `rgba(255,255,255,.08)` dividers, giant neon number
- **BigNumber**: Inter 800, tight tracking, gray en-dash between range ends
- Persona chips / quick replies: light glass pills

## Pages (all in turn 4)
| id | Page | Hero |
|---|---|---|
| 4a | `/` | "What is a business **really** worth?" + Blind Equity™ $339K reveal card + 3 seat doors |
| 4b | `/sell` | "Know your number. Then choose how you exit." — regret stats, $2M/$750K gap card, Blind Equity™, selling-twice, project + Monday-morning |
| 4c | `/buy` | "Is this the one? Find out before you're in too deep." — 6.58× Deal Check card, 3 value props, roll-up |
| 4d | `/advise` | "You close the deal. Yulia does everything before it." — 3 free client deals, 40+ hrs card, human-matters-more |
| 4e | `/how-it-works` | "High tech. Human touch." — 4 things ChatGPT can't do, $28M worked deal, where-the-line-is |
| 4f | `/pricing` | "Pay for the analysis. Not the AI." — à la carte ($99–$1,499) + subscriptions ($79/$199/$499/Ent from $2,500) + FAQ |
| 4g | mobile | Home · Sell · Pricing at 390px, docks pinned bottom |

Copy is FINAL (locked deck) — lift verbatim from the mocks. Nav: Sell · Buy · Advise · How it works · Pricing + Ask Yulia button.

## AppPhase state machine (locked — not routes)
```
landing(page) --send--> chat
chat --back--> landing (exact page + scroll restored)
chat --artifact--> chat+canvas   (>=768px: right panel)
chat --artifact tap--> drawer    (<768px: slide-up, ~92%)
```
- CSS crossfade ~300ms: page out 0–200ms; chat in 100–300ms; nav links out ~200ms; "← Yulia" in 200ms @100ms delay. Logo never moves. ChatDock is the same DOM node through the morph (no remount). Mobile: keyboard never dismissed.
- Conversations persist; sidebar slides in without reflowing chat/canvas.
- iOS Safari: size chat by `--app-height` from `visualViewport`; never `100dvh`; never `overflow:hidden` on the fixed chat container.

## Context piping
Origin page seeds Yulia's context — she never asks "buying or selling?" if the page said it:
`/` unknown (persona chips set it) · `/sell` seller/valuation · `/buy` buyer/deal-check · `/advise` practitioner/terse.

ChatDock placeholders: `/` "Tell Yulia about your deal…" · `/sell` "…about your business…" · `/buy` "…what you're looking for…" · `/advise` "…about the deal you're working…" · in chat "Message Yulia…"

## Chat rendering (see Wireframes 5j, Hi-Fi turn 3 for materials)
- User: right-aligned light-glass bubble, radius 20/20/5/20
- Yulia: **no bubble** — plain text on canvas, avatar = small dark-glass circle with neon "Y"; numbers render at display scale; ink result cards in-stream
- First response = 4-beat: classify → estimate (real range + math) → sourced insight → the one question that moves the number most. She ends every turn driving (quick-reply pills, primary = ink pill)
- Conversion order (law): anonymous value → email (in-stream card, "where should I send it?", skippable) → personalized anchored price → NDA last (out of phase)

## Pricing model (LOCKED)
Hybrid: à la carte per-deliverable (Baseline free · $99–$1,499) + subscriptions Solo $79 / Pro $199 / Team $499 / Enterprise from $2,500. Free tier: unlimited conversation + one full deliverable, email only. Advisors: first three client deals free, white-labeled. Never a percentage of the deal. À la carte column is removable without breaking the pricing layout if the model shifts.

## Assets
- `assets/logo-green-x.png` — nav/footer logo (final)
- `uploads/logo.png` — all-black source
