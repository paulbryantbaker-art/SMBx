# UI Retool Readiness — the operating doc for the next design language

**Decision (2026-07-10):** the site UI/UX — logged-out marketing front end AND the
logged-in app — will be redone in a new design direction. The direction arrives as a
**design handoff bundle** (same workflow as previous eras). Scope split:

- **Marketing:** ground-up rebuild in the new language.
- **App:** token-level re-skin first; deeper UX restructure later.
- **Unchanged, non-negotiable:** THE LINE (`THE_LINE_POLICY.md`) and the DEFINITIVE
  substrate (catalog, runtime, MCP/API surfaces, staged approvals). The retool is
  human-surface only; backend contracts hold constant.

This file is the prep: what the bundle lands on, where it plugs in, and what must
survive it intact. Prep work already done on this branch is listed at the end.

---

## 1. What the bundle lands on (current state, corrected)

The design-era timeline has outrun `CLAUDE.md`:

| Era | Where it shipped | Status |
|---|---|---|
| V6 slate/lavender + periwinkle (May 2026) | old app shells | **retired** (shells deleted) |
| "Ramp" — warm neutral + neon green `#2BFF77`, Schibsted Grotesk/Fraunces/JetBrains Mono (locked 2026-05-29) | **marketing site only** (`client/src/marketing/`, `.mkt` scope) | live on marketing until the rebuild |
| "Atlas" (2026-06-24 cutover) | **the app**: desktop `v6/desktop/` (DM-Sans-adjacent system font, Google-blue `#0b57d0`) + mobile `v6/atlasmobile/` (Cash-App-flavored, violet `#5b53d6`) | live; ~50 iteration commits since |

So today three visual languages coexist (marketing Ramp, desktop Atlas, mobile
Atlas-violet). The retool replaces all three human surfaces with ONE language.

### Surface inventory (post-demolition)

| Surface | Lives in | Renderer decision |
|---|---|---|
| Marketing (9 pages: `/`, `/buy`, `/sell`, `/raise`, `/integrate`, `/pricing`, `/connectors`, `/standard`, `/standard/[model]`) | `client/src/marketing/` (`MarketingShell` → `.mkt` scope, `marketing.css` ~1.9k lines) | `App.tsx marketingOrApp()`: logged-out → marketing, authed → app. `?marketing` / `?app` escape hatches. |
| App shell | `client/src/components/v6/V6App.tsx` (53-line viewport fork) → `desktop/AtlasApp.tsx` (≥1024px) / `atlasmobile/AtlasMobileApp.tsx` | internal state nav (`AtlasView`), not wouter; desktop tabs wired to browser history |
| App screens (×2 trees) | `v6/desktop/screens/` + `v6/atlasmobile/screens/`: Today · Deals · Sourcing · Studio · Integration · Files · Agent · Cockpit · Canvas · Settings | near-1:1 duplicated; any screen change is done twice |
| Chat | desktop `v6/desktop/chat/AtlasChatRail.tsx` (340px rail); mobile `YuliaSheet` slide-up + FAB; `shared/ChatDock.tsx` is THE composer everywhere (uses `mobile/StarterSheet`) | |
| Interactive models canvas | `components/models/` (11 models + Charts + ModelRenderer), tokenized via `styles/cdTokens.css` | rendered inside Canvas screen on both shells |
| Auth / legal / token-gated | `pages/public/` (Login, Signup, Terms, Privacy, SharedDocument, DayPass, ValueLens, AcceptInvite…) over the `components/public/` kit (+ `chat/ChatMorph` in PublicLayout) | oldest skin; several still carry pre-V6 hexes |
| Admin | `pages/admin/` (super-admin gated) | lowest priority to reskin |
| Server-rendered | PDF templates `server/templates/pdf/` + `server/templates/smbxBrand.ts` (still **terra `#D44A78` + cream** era!), email shell in `emailService.ts` (terra rule, `G3L.png` logo), MCP OAuth consent page (`definitiveMcpOAuth.ts`) | separate decision — see §4 open questions |

---

## 2. The seams (where the new language plugs in)

### App skin knob — deliberately small
- `client/src/components/v6/desktop/atlasTokens.ts` — the `T` object: palette, radii,
  shadows, font. Every desktop screen inline-styles from it.
- `client/src/components/v6/atlasmobile/mobileTokens.ts` — `M` (glass materials,
  frame bg), reuses `T`.
- `client/src/components/v6/desktop/atlas.css` (`.atlas-root` CSS-var mirror +
  scrollbar + keyframes) and `atlasmobile/atlas-mobile.css`.
- **Debt to plan around:** screens hardcode hex beyond the tokens (~370 hex literals
  across 33 v6 files). Phase-1 retheme moves the bulk; a per-screen sweep finishes it.

### Marketing seam — replace wholesale
- `client/src/marketing/marketing.css` (token block at top, `.mkt`-scoped components)
  and the page/section components. Ground-up rebuild replaces these.
- **Keep the funnel contract, not the skin** (§3.5).

### Fonts
- Loaded once in `client/index.html` (Schibsted Grotesk, Fraunces, Inter, Inter
  Tight, JetBrains Mono + legacy Figtree, Newsreader, IBM Plex Mono; Tailwind also
  names Sora et al.). The Atlas app itself renders in the system font by design.
- When the bundle lands: swap the `index.html` font list to the new set, and diet the
  leftovers (`models/` reads `--cd-*` fonts from `cdTokens.css`; retarget or keep).

### Token-system consolidation target
Today: five parallel token systems (`index.css` ×2 root blocks, `tailwind.config.js`
"Cowork" palette, `T`/`M` + atlas css vars, `cdTokens.css`, `marketing.css`). Target
after the retool: **one app token source (`T`/`M` + mirror vars) + one marketing token
source + `cdTokens.css` for models** — and delete the dead `index.css`/tailwind color
worlds rather than re-theming them.

---

## 3. Preservation contract — what must survive the retool intact

Restyle everything; do not drop or weaken any of these.

### 3.1 THE LINE touchpoints (copy + flows)
| Touchpoint | File |
|---|---|
| Deliverable disclosure block (every artifact, in-app + export) | `server/services/deliverableProcessor.ts` → `buildDisclosureBlock()` |
| PDF disclaimer + confidential notice | `server/templates/pdf/components.ts disclaimerHtml()`, `smbxBrand.ts renderCoverPage` |
| Terms "not financial advice" + Payments language | `client/src/pages/public/Terms.tsx` |
| Chat composer micro-disclaimer ("Yulia sees this screen · check important info") | `AtlasChatRail.tsx`, `atlasmobile/YuliaSheet.tsx` |
| Marketing software-positioning / not-a-broker copy | `marketing/pages/*`, `MarketingChrome.tsx` |
| MCP OAuth consent page LINE line | `server/services/definitiveMcpOAuth.ts` |
| Yulia's refusal / defer-to-professional voice (server prompts — do not touch) | `server/prompts/masterPrompt.ts`, `legalEngine.ts`, `taxEngine.ts`, `agencyDoctrine.ts`, `gatePrompts.ts` |

### 3.2 Staged approvals (LINE enforcement in UI)
Approve-before-execute must survive any re-skin: pending-approval queue on the Agent
screens (`v6/*/screens/Agent.tsx`, `ApprovalCard`), inline `StagedActionCard` in chat,
`chat.confirmStagedAction`/`cancelStagedAction` in `hooks/useAuthChat.ts`, backed by
`GET /api/agency/actions` + `POST /api/agency/actions/:id/confirm|cancel`. The Agent
screen's honest-by-design posture (no fabricated agent runs) also stays.

### 3.3 Agent↔UI contracts (DEFINITIVE surface vocabulary)
- `client/src/lib/v6SurfaceActions.ts` — the canonical `SurfaceActionKind` /
  `SurfaceResult` vocabulary (open_*, ~22 run_* canvases, generate_*, and the three
  `staged_confirmation` actions). Companion `v6ActionContracts.ts`.
- The single chat→canvas bridge: SSE `canvas_action` → window event
  `smbx:canvas_action` (subscribed once per shell). Do not invent a second channel.
- SSE event shapes: `text_delta` / `staged_action` / `canvas_action` /
  `message_stop`.
- Canvas tab persistence: `/api/conversations/:id/canvas-tabs*` + `modelStore`.

### 3.4 Locked pricing (firewall)
Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise — `SMBX_PRICING_LOCKED.md`.
As of this branch all five client surfaces derive digits from
`client/src/lib/pricing.ts` (`PRICING_TIERS`, `tierPriceDollars()`). **New UI imports
from there; never hardcode a price.** No fee may vary with deal value or outcome.

### 3.5 Marketing→app funnel contract
Rebuild the pages, keep the machinery:
- `useEnterApp.ts enterApp(message?)` → dispatches `smbx:yulia-open` CustomEvent;
  the Yulia FAB/launcher listens and carries the first message. Every CTA routes to
  chat ("Talk to Yulia" — no Contact Sales, no dead ends).
- Anonymous chat: `/api/chat/anonymous/*`, session key `smbx_anon_session`; on auth
  success `App.tsx` migrates the anonymous transcript (`migrateSession` +
  `migrateSessionConversations`). Signup happens inside the chat, after value.
- Two-surface rule: logged-out always sees marketing; the 9 marketing paths render
  the app when authed.
- Copy source: `CLAUDE_DESIGN_COPY.md` remains valid independent of palette.

### 3.6 Standing product laws (apply to the new language too)
- **Two-greens law:** brand accent stays visually distinct from verdict/"pursue"
  semantic green; verdict pills never adopt the brand accent.
- **Safari toolbar rule:** never `position:fixed` full-viewport divs with a
  background color; use `position:absolute` in a relative parent.
- **No gratuitous eyebrows/micro-text** (LOCKED 2026-06-01) — structural labels ok.
- **Money is integer cents** end to end; format via shared helpers (`fmtCents`).
- **Honesty:** every screen renders loading/empty/error from real hooks; no demo
  literals, no synthetic fit numbers (`fitIsReal` gates), honest "—".
- **Mobile first**, and Yulia is the front door for every action.

### 3.7 Backend/API contracts (UI-consumed, hold constant)
Chat SSE (`POST /api/chat/message`, `/api/chat/conversations/:id/messages`,
anonymous twin), agency actions, canvas-tabs, sourcing/theses/portfolios (+ SSE
progress), auth (`/api/auth/*`, `/api/config`, passkeys), Stripe
(`/api/stripe/subscription`, portal, unlock-gate), share/token views
(`/api/shared/:token` etc.), deliverables/dataRoom/collaboration/pipeline/
notifications/nextActions/studio/export route families. Redesign is UI-only.

---

## 4. Bundle-landing playbook (phased, each phase shippable)

**Phase 0 — site clearing (DONE on this branch).** See §5.

**Phase 1 — token + type foundation (app re-skins largely for free).**
Translate the bundle's tokens into `atlasTokens.ts` `T` + `mobileTokens.ts` `M` +
`.atlas-root`/`.atlas-mobile` var mirrors; swap the `index.html` font list; keep the
two-greens law by mapping verdict semantics explicitly. Reversible, token-level.

**Phase 2 — marketing ground-up rebuild.**
New `marketing.css` token block + rebuilt pages/sections per the bundle; keep
`MarketingShell`'s responsibilities (scope class, nav/footer, Yulia FAB) and every
§3.5 funnel contract; pricing digits via `lib/pricing`; LINE copy per §3.1.
Copy from `CLAUDE_DESIGN_COPY.md` unless the bundle ships new copy.

**Phase 3 — app screen sweep (×2 trees).**
Per-screen pass over `desktop/screens/` + `atlasmobile/screens/` to move hardcoded
hex onto the new tokens and match the bundle's component patterns (cards, pills,
steppers via `primitives.tsx`/`iosKit.tsx` first — extend the kit, don't fork it).
Chrome details: `AtlasHeader`, chat rail, `YuliaSheet`, `BottomNav`.

**Phase 4 — auth/legal/token-gated + admin.**
`pages/public/*` over a refreshed `components/public/` kit (these still carry
pre-V6 hexes: `Login.tsx`, `Signup.tsx`); admin last.

**Phase 5 — decide-and-do (open questions for the bundle owner):**
1. **Export/email branding:** PDFs and emails still speak terra `#D44A78` + cream
   (pre-V6!). Rebrand `smbxBrand.ts` + `pdf/base.ts` + `brandedEmail` to the new
   language, or keep exports deliberately conservative?
2. **Chat posture:** desktop rail vs FAB-overlay — Ramp locked FAB, Atlas shipped a
   rail. Which does the new direction use?
3. **Dark mode:** currently vestigial (`.dark` class machinery exists; Atlas is
   light-only). In or out for the new language?
4. **Tailwind:** the live app doesn't use Tailwind classes for its skin (inline `T`
   styles); marketing/legacy do. Keep Tailwind for the rebuilt marketing or go
   full CSS-vars and drop the Cowork palette from `tailwind.config.js`?

**Verification gate for every phase:** `npx tsc --noEmit` + `npm run build` clean;
e2e smoke (`e2e/`); a real-device pass for mobile (populated states, not just anon);
pricing renders the five locked numbers; disclosure blocks/disclaimers present in a
generated deliverable + PDF export.

---

## 5. Phase 0 — what this branch already did

- **Demolition (verified zero-importers, tsc + build clean):** removed the orphaned
  pre-Atlas UI — `components/chat/` (minus live `ChatMorph`), `components/mobile/`
  (minus live `StarterSheet`), `components/content/`, `components/canvas/`,
  `components/artifacts/`, `v6/Learn.tsx`, `shared/ChapterStrip|DotField|Reveal`,
  dead texture chain `lib/randomTextures.ts` + `v6/shared/verdictMaterial.ts`,
  `lib/wkTheme.ts`, `v6/workspace.css`, `App-handoff (1).zip` (~24k LOC), and pruned
  `public/textures` from ~80MB to the live set (`texture-hero-1/2` + masters).
  `claude_design/` kept as documented archive.
- **Fixed a live bug the demolition surfaced:** `WorkSeal` + `.wk-tick` styles lived
  only in never-imported `workspace.css` → extracted to
  `v6/shared/workseal.css` (self-contained fallbacks), imported by `WorkSeal.tsx`
  and `models/Charts.tsx`.
- **Pricing single-sourced** (§3.4).
- **Docs refreshed:** `FRONTEND_DIRECTION.md` marked superseded → points here;
  `CLAUDE.md` design section + key-file map corrected; `REPO_STATUS.md` design
  section updated.

**When the bundle lands:** start at Phase 1, in a fresh session, with the bundle
committed to the repo (or a path Claude can read) + this file as the brief.
