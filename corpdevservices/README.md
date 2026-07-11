# Handoff: smbX.ai — Buy-Side Corp-Dev Website

## Overview
Marketing website for **smbX**, a one-person, AI-powered, buy-side-only corporate development practice. Goal: high conversion into two actions — (1) chatting with **Yulia**, the AI intake agent that captures the visitor's acquisition thesis and books an advisor call, and (2) directly booking a call. The pitch is the **firm** (engine + practitioner), not just the founder.

Positioning sentence: *"smbX is the AI-powered, buy-side-only corporate development practice: one senior operator, backed by proprietary AI that does the work of a full deal team, running your acquisition from thesis to close — aligned to you, and only you."*

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. The task is to **recreate these designs in your target codebase's environment** (Next.js/React recommended if greenfield) using its established patterns and libraries. `smbX Landing.dc.html` is the approved design; `support.js` and `image-slot.js` are prototype-runtime helpers only — do not port them.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interactions are final design intent (copy will be iterated in Claude Code — treat current copy as strong draft). Recreate pixel-perfectly using your stack. The three photo areas are intentional placeholders (drag-and-drop slots in the prototype) — implement as normal `<img>`/background images; real photography TBD by the founder.

## Site Map
1. **Landing page** — designed (this bundle).
2. **Five segment pages** — not yet designed; structure guidance in "Segment Pages" below. Same design system.

---

## Landing Page — Sections (top to bottom)

### 1. Nav (sticky)
- `position: sticky; top: 0`, `background: rgba(255,255,255,.92)` + `backdrop-filter: blur(12px)`, bottom hairline `1px #EBEBEB`. Inner: max-width 1440px, padding `20px 64px` (side padding scales down via clamp — see Tokens).
- Left: logo image (`logo-coral-x.png`), height 44px.
- Center links (500, 15px, #6A6A6A): How it works → `#how`, Who it's for → `#who`, Why smbX → `#why`.
- Right: **Book a call** — outlined pill (1.5px #DDDDDD, hover border #222222, 11px 24px, radius 99px, 600/14.5px, `white-space: nowrap`). **Talk to Yulia** — gradient pill (see Tokens → CTA gradient), white text 700/14.5px, 12px 26px, hover `filter: brightness(1.08)`, scrolls to `#yulia`.

### 2. Hero (centered)
- Padding: `clamp(90px,10vw,150px)` top / `clamp(80px,9vw,130px)` bottom; `overflow: hidden`.
- Background "radar": 3 concentric circle outlines centered at 50%/54% (1300/960/640px, 1px borders rgba(34,34,34,.06/.08/.10), `pointer-events:none`) + 4 coral dots (7–9px, opacity .4–.8) scattered (see prototype for positions). Toggleable — render behind content.
- Badge pill: mono 12.5px, letter-spacing .1em, #6A6A6A, 1px #DDDDDD border, radius 99px, coral 7px dot — text `BUY-SIDE ONLY · NEVER TWO-SIDED`.
- H1 (margin-top 52px): **"Buy the company.\nSkip the department."** — 800, `clamp(56px,9vw,112px)`, line-height .97, letter-spacing -0.04em, `text-wrap: balance`, centered.
- Sub (44px below, max-width 680px): 21px/1.6 #6A6A6A — "One senior operator, an AI engine that does the work of a full deal team, and a promise nobody else makes: one buyer per target, never the sell side."
- **Yulia chat card** (72px below, max-width 640px, id `yulia`, `scroll-margin-top: 120px`): white, 1px #EBEBEB, radius 20px, shadow `0 30px 80px -30px rgba(34,34,34,.25)`.
  - Header row (18px 24px, hairline below #F0F0F0): 32px circle avatar with gradient `linear-gradient(135deg,#E61E4D,#D70466)` and white "Y"; name "Yulia" 700/15px; mono microlabel `smbX INTAKE` 11px #9A9A9A; right-aligned "online" 12.5px #008A05 with pulsing 7px dot (2.4s opacity pulse).
  - Message list (padding 10px 24px, max-height 340px, scroll): bubbles 15.5px/1.5, padding 13px 18px, radius 16px, max-width 78%. Yulia: #F7F7F7 bg, #222 text, bottom-left radius 4px, left-aligned. User: #222 bg, white text, bottom-right radius 4px, right-aligned.
  - Input row (hairline above): text input (1px #DDDDDD, radius 12px, 14px 16px, focus border #222) + **Send** gradient button (radius 12px).
- Below card: "Prefer a human first? **Book a call now →**" (14.5px #9A9A9A; link coral 600 underlined → `#book`).

### 3. Tagline ticker
- Full-width band, hairlines top+bottom #EBEBEB, padding 34px 0.
- Infinite marquee (duplicate content ×2, `translateX(0 → -50%)`, 46s linear infinite): 25px 700 -0.02em #222, items separated by small coral dots, 30px side padding per phrase.
- Phrases: "One buyer per target. Always." / "AI does the reading. You get the judgment." / "Senior attention. Zero overhead." / "From thesis to close."

### 4. Photo band
- Container max-width 1440, side padding ~40px; rounded 28px, height 560px, full-bleed photo (subject: advisor + owner walking a shop floor, warm light).
- Bottom overlay row: headline "A person on your side. An engine at your back." — 46px 800 white, text-shadow `0 2px 24px rgba(0,0,0,.35)`; right: white pill "Why smbX →" → `#why`. Overlay is `pointer-events:none` except the button.

### 5. Problem ledger — "01 — THE PROBLEM"
- H2: "You have three ways to buy a company today. All flawed." (H2 style, max-width 820px); mono section label right-aligned.
- Table: top border 1.5px #222; rows `grid-template-columns: clamp(140px,16.5vw,240px) minmax(0,1fr) clamp(150px,23.5vw,340px)`, gap clamp(20px,3.3vw,48px), padding 44px 0, hairline separators.
  - **Build a team** — "A lean two-person corp-dev function runs $600K–$1M+ a year, fully loaded — a fixed cost attached to an occasional activity. It sits idle between deals." — tag `FIXED COST · IDLE CAPACITY`
  - **Hire a bank** — "Retainers, success fees with long tails, and your day-to-day work handed to junior analysts — at a firm chasing similar deals for other clients at the same time." — tag `JUNIOR HANDS · SPLIT LOYALTY`
  - **Go it alone** — "No fees — and no bandwidth, no process, and an information disadvantage against a seller's broker who does this every week." — tag `OUTGUNNED · OUT OF TIME`
  - **smbX** (highlight row, bottom border 1.5px #222, bg `linear-gradient(90deg,rgba(255,56,92,.05),transparent)`, name + tag in coral): "One senior operator with an AI engine doing the work of a full deal team — engaged per deal, aligned to you, and gone when you're done." — tag `ENGINE + PRACTITIONER`
- Row name: 700/21px. Description: 17px/1.6 #6A6A6A. Tags: IBM Plex Mono 13px #9A9A9A.

### 6. Process — id `how`, "02 — THE SMARTER WAY BEGINS HERE"
- H2: "A simple process for a serious acquisition."
- 3 cards (grid, gap ~36px): #F7F7F7, radius 24px, padding ~52px 44px. Each: 56px coral circle with white number (23px 800); title 26px 700 (32px below); body 16.5px/1.65 #6A6A6A; coral link 700/15.5px.
  1. **Conversation** — "Tell Yulia what you want to buy. She works your thesis overnight and books you with your advisor — a real senior practitioner, not a call center." → "Talk to Yulia →" (`#yulia`)
  2. **Curated targets** — "The engine maps your market — off-market first — and your advisor hand-picks the targets worth your time, with models and memos ready in days." → "See the engine →" (`#why`)
  3. **Close with confidence** — "Diligence triaged, price disciplined, negotiation run by someone on your side of the table — and only yours. Then we scale to zero." → "Book a call →" (`#book`)

### 7. The firm — id `why`, "03 — THE FIRM"
- Two columns (gap clamp(44px,7vw,100px)).
- Left: H2 "A practice, not a person." + intro 18px/1.7 #6A6A6A ("smbX is built as a system: a proprietary AI engine that sources, reads, and models like a full deal team — and a senior practitioner who directs it, negotiates, and owns the outcome. The engine compounds with every deal. Your advisor brings the judgment no engine has.") + 3-row definition list (label coral 700/17px, cols `clamp(120px,14vw,200px) 1fr`, hairline separators):
  - **The engine** — "Market maps, off-market sourcing, CIM triage, financial models, diligence checklists — in days, not quarters."
  - **The practitioner** — "Every judgment call, seller conversation, and negotiation handled by a senior operator. No analyst hand-offs, ever."
  - **The pledge** — "One buyer per target. Never the sell side. Never two-sided. It's in the engagement letter."
- Right: founder photo (rounded 24px, 480px tall; documentary style, at work — not a headshot) + card (#F7F7F7, radius 20px, padding 36px 40px): "Your advisor" 700/19px + bio placeholder. **Founder bio + deal sheet still to come from the founder.**

### 8. Who it's for — id `who`, "04 — WHO IT'S FOR"
- H2: "Built for buyers without a standing deal team."
- 2×2 card grid + 1 full-width card (outlined 1px #EBEBEB, radius 24px, padding 44px, hover border #222): title 24px 700, body 16.5px/1.6 #6A6A6A, coral link 700/15.5px. These link to the five segment pages.
  - **Family offices** — "Direct-deal control without building a deal team. Institutional-grade diligence and a disciplined price — on demand."
  - **Independent sponsors** — "Control the deal before you raise a dollar — with diligence and models that make capital partners say yes."
  - **Lower-middle-market PE** — "Proprietary add-on flow and senior execution capacity that flexes with your pipeline — without a million-dollar BD build."
  - **Searchers & solo acquirers** — "A senior deal team in your corner for your first — and biggest — acquisition. Level the field against the seller's broker."
  - **Operators buying competitors** (full-width, with photo right, rounded 16px, 240px) — "Discreet third-party approaches that protect your position, objective pricing, and a repeatable playbook — run for you, deal by deal."

### 9. Pledge band — "05 — THE PLEDGE, IN EVERY ENGAGEMENT LETTER"
- Dark card: #222222, radius 28px, padding ~120px 96px, centered white text.
- Eyebrow mono #FF7A8F. Statement `clamp(44px,5.8vw,72px)` 800 -0.035em: "One buyer per target. Never the sell side. **Never two-sided.**" (last phrase coral).
- Sub 18px/1.65 rgba(255,255,255,.6), max-width 620px: "Everyone else in this market sells the same deal twice — or hands your mandate to an analyst. We're structurally incapable of either."

### 10. Final CTA — id `book`
- Two columns. Left: H2 (clamp(40px,4.8vw,60px)) "Ready to start looking?" + sub "Two minutes with Yulia and your market map is underway. No retainer to find out if we're a fit." + gradient pill "Start with Yulia →" (shadow `0 8px 24px -10px rgba(230,30,77,.5)`) + outlined pill "Book a call".
- Right: form card #F7F7F7 radius 24px padding 44px, "Or leave your details." + inputs: "I'm a… (family office, sponsor…)", "What are you buying?", "Email" + gradient pill "Get started". Inputs: white bg, 1px #DDDDDD, radius 12px, 15px 16px, focus border #222, `min-width:0; width:100%; box-sizing:border-box` (required — prevents grid overflow).
- **Book a call** should open the founder's scheduling link (Calendly or similar) — wire the real URL.

### 11. Footer
- Top hairline. Left: logo (40px) + "Buy-side-only corporate development. One senior operator, one AI engine, one buyer per target." (14px #9A9A9A, max-width 340px).
- Right: two link columns (`flex-direction:column; gap:12px`, 14.5px #6A6A6A; mono column headers 11.5px #9A9A9A): FIRM (How it works / Why smbX / Book a call), BUYERS (five segments).
- Bottom line: "© 2026 smbX. Buy-side only, by design." 13px #BBBBBB.

---

## Interactions & Behavior

### Yulia chat (the core conversion mechanism)
Prototype implements a scripted 3-step intake; production should back it with a real LLM agent + scheduling integration, keeping this shape:
- State: `messages[] {from: 'yulia'|'user', text}`, `step (0–3)`, `draft`.
- Opening message: "Hi — I'm Yulia. Tell me what you're looking to acquire and I'll start mapping the market tonight. What's the thesis?"
- On send (Enter or button; ignore empty): append user message, clear input, then Yulia reply after ~550ms:
  - step 0 → "Got it. What size are you targeting — revenue or EBITDA range — and any geography?"
  - step 1 → "Perfect. Last one: best email for your first market map?"
  - step 2 → "Done — I'm starting on your thesis now. You'll have a first pass within 24 hours. Want to lock in time with your advisor?" → then render inline gradient pill **"Book your advisor call →"**.
- Input placeholder rotates per step: `e.g. "HVAC roll-up in the Southeast"` → `e.g. "$2–5M EBITDA, within 4 hours of Atlanta"` → `you@firm.com` → `Yulia is on it — book your call above` (disable input at step 3).
- Production: persist the captured thesis/size/email as a lead (CRM/webhook) even if the visitor never books. Add typing indicator while "Yulia" responds.

### Other
- All nav/CTA anchors smooth-scroll to `#how` / `#who` / `#why` / `#yulia` / `#book` (each target has `scroll-margin-top` ≈ 90–120px for the sticky nav).
- Ticker: pause on hover is a nice-to-have.
- Hovers: gradient pills `brightness(1.08)`; outlined pills border → #222; segment cards border → #222; links → #E61E4D.
- Responsive: designed at 1440; grids use `minmax(0,1fr)` and clamp() type/spacing down to ~900px. Below ~760px (not designed): stack all 2/3-col grids, ledger rows stack vertically, nav collapses to logo + Yulia pill.

## Design Tokens
**Colors**
- Ink `#222222`; body secondary `#6A6A6A`; tertiary `#9A9A9A`; faint `#BBBBBB`
- Background `#FFFFFF`; card gray `#F7F7F7`; borders `#DDDDDD`; hairlines `#EBEBEB` (chat inner `#F0F0F0`)
- Accent coral `#FF385C`; hover/link coral `#E61E4D`; on-dark coral tint `#FF7A8F`; online green `#008A05`
- CTA gradient `linear-gradient(90deg, #E61E4D, #E31C5F 50%, #D70466)`; avatar gradient `linear-gradient(135deg, #E61E4D, #D70466)`

**Typography** (Google Fonts)
- Display/body: **Schibsted Grotesk** 400/500/600/700/800
- Micro/eyebrows/tags: **IBM Plex Mono** 400/500, letter-spacing .08–.14em, 11–13px, usually uppercase
- H1 `clamp(56px,9vw,112px)` /.97 /-0.04em /800 · H2 `clamp(36px,4.6vw,56px)` /1.05 /-0.03em /800 · Pledge `clamp(44px,5.8vw,72px)` · CTA-H2 `clamp(40px,4.8vw,60px)` · card titles 24–26px/700 · body 16–21px /1.55–1.7 · buttons 14.5–16.5px /600–700

**Spacing & shape**
- Content max-width 1440px; side padding `clamp(28px,4.5vw,64px)`; section spacing `clamp(100–110px, 12–12.5vw, 170–180px)` — the page is deliberately airy
- Radii: pills 99px · section bands 28px · cards 24px · chat card 20px · inner cards/photos 16–20px · inputs/bubbles 12–16px
- Shadows: chat `0 30px 80px -30px rgba(34,34,34,.25)`; coral CTA `0 8px 24px -10px rgba(230,30,77,.5)`

## Segment Pages (to build — same system)
One page per buyer type, same nav/footer/tokens. Suggested structure: hero (H1 hook + sub + Yulia CTA) → their specific pain (ledger-style rows) → how smbX answers it → pledge strip → final CTA. Messaging hooks per segment:
- **Family offices**: "Direct-deal control without building a deal team." / "Institutional-grade diligence and a disciplined price — on demand." / "Your thesis, our engine, no blind pools, no club-deal compromises." Pain: bandwidth + diligence gaps, overpaying, losing to faster institutional buyers.
- **Independent sponsors**: "Control the deal before you raise a dollar." / "Investor-grade diligence and models that make capital partners say yes." Pain: chicken-and-egg credibility, uncompensated time on failed deals.
- **LMM PE**: "Proprietary add-on flow without a million-dollar BD build." / "Senior execution capacity that flexes with your pipeline." Pain: ~18% deal-flow coverage, partners spending 30–40% of time sourcing, add-on capacity.
- **Searchers / solo acquirers**: "Level the playing field against the seller's broker." / "Know when to walk — before it costs you." / "We run the diligence and the model so your SBA lender and your gut both say go." Pain: first-timer anxiety, info asymmetry, SBA timelines/PG.
- **Operators buying competitors**: "Inorganic growth without the standing overhead." / "Discreet, third-party approaches that protect your position." / "Don't pay the seller for synergies you create." Pain: methodology, confidentiality, objectivity, integration distraction.

## Assets
- `assets/logo-coral-x.png` — primary logo (smbX.ai wordmark, coral X `#FF385C`), transparent PNG 1584×396. Used in nav (44px tall) and footer (40px).
- `assets/logo.png` — original all-black wordmark (source; recolor X for other accent uses).
- Photography: three slots (hero band 560px wide-format; founder portrait 480px; operators card 240px). Direction: warm, documentary, real SMB settings (shop floors, warehouses, main-street storefronts). Sources: founder photo shoot (preferred), Unsplash/Pexels licensed.

## Files
- `smbX Landing.dc.html` — the approved landing page design (single-file prototype; the `<x-dc>` template markup + `Component` class at the bottom hold all layout and the Yulia chat logic)
- `smbX Explorations.dc.html` — earlier explorations (context only; direction "3a" was approved)
- `support.js`, `image-slot.js` — prototype runtime only; do not port
