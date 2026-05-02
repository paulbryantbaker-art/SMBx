# V6 Wiring Log — Overnight Session 2026-05-01 → 2026-05-02

Branch: `marketing/v6-files-workspace`. Not pushed.

---

## TL;DR — what's working, what to test

**V6 is now a working prototype, not just a visual mock.** Land at `/`, you can:

- Sign up / sign in / sign out from the sidebar account chip
- Send a message to Yulia and get a real streaming reply (anon + authed)
- See agentic tool badges as Yulia works ("Updating deal info…")
- Open / close / switch tabs — state survives page reload via URL hash
- Anon visitors see a "Working Sample" banner; authed users don't
- Clicking pricing CTAs sends contextual messages into chat (no Stripe yet)

**What you can't do yet** (deferred, see "Skipped" below):

- See your real deals/docs/analyses — mode-roots still show hardcoded sample fixtures
- Generate a deliverable that hits the paywall — paywall not wired
- Pay for a plan via Stripe — checkout not wired

---

## Quick-test checklist for morning review

Open `localhost:5173/` in a fresh browser window.

**Anon path:**
1. Working Sample banner is visible (terracotta strip up top). Click `×` to dismiss → reload → still dismissed.
2. Click "Start your workspace" in the banner → opens Learn → Pricing tab.
3. Account chip shows "Guest" + "Sign in to use yours".
4. Click the avatar → menu shows "Sign in" / "Create account" / Free-tier blurb.
5. In the chat, type "what can you do?" + Enter → real Yulia streams a reply (not the old 600ms stub).
6. Click any deal card on Search root → tab opens, URL hash updates to `#mode=search&tab=deal-...`. Reload → tab restored.
7. ⌘K from anywhere → sidebar search opens.
8. Click a Search Idea chip → message goes into chat, Yulia replies.
9. Click About-SMBX pill ("Pricing") → Learn tab opens to pricing section. Click any plan CTA → message in chat.

**Authed path:**
10. Click avatar → "Create account" → fill /signup → land back at `/`.
11. Working Sample banner is GONE. Account chip shows your real name + email.
12. Chat-head label is `BUSINESS SEARCH` (no "SAMPLE · " prefix).
13. Send a message → real Yulia, real conversation persistence in DB.
14. Click avatar again → menu shows "Profile / Settings / Sign out".
15. Click "Sign out" → back to anon, banner returns (unless previously dismissed).

**Tab routing edge cases:**
16. Open 3+ tabs → switch between them → URL hash updates.
17. Hit browser Back → previous tab activates.
18. Paste a deep-link URL like `localhost:5173/#mode=docs&tab=docs-root` into a new tab → lands on Docs.

If any of those fail, that's the bug to flag.

---

## Phase-by-phase summary

### Phase 0 — Verification audit (read-only)

Verified:
- `useAuth` ✓ exposes `{ user, loading, login, register, loginWithGoogle, migrateSession, logout }`. User shape: `{ id, email, display_name, league, role, ... }`.
- `useAnonymousChat` ✓ — robust SSE via `POST /api/chat/message` with `x-session-id` header. Returns `{ messages, sending, streamingText, error, sendMessage, ... }`. Handles deliverable polling.
- `useAuthChat(user)` ✓ — authed via `POST /api/chat/conversations/:id/messages`. Handles agentic tools (`tool_start`, `tool_done`), canvas actions (`smbx:canvas_action` custom event), paywall events, gate advance. Has retry-on-stale-connection logic.
- `ChatContext` exists but irrelevant to V6 — that's the OLD AppShell morph.
- Backend route mounts in `server/index.ts` confirmed: auth, chat (anon + authed), sourcing, discovery, buyer-pipeline, intelligence, deliverables, deepData, search, providers, franchises, sellerDashboard, nextActions, canvasTabs, docViews, export, admin, passkey. **Nothing orphaned.**
- `pages/V3App.tsx` + `components/v3/*` — fully unreferenced. Safe to delete.

### Phase 1a — Auth wiring ✅

`V6App` now reads `useAuth()`. Branches into two sibling components based on `user`:

- `V6AppAnon` — calls `useAnonymousChat()`, mounts shell with `user={null}`.
- `V6AppAuthed` — calls `useAuthChat(user)`, mounts shell with the real user.

Why two components, not conditional hooks: React's rule against conditional hook calls. Splitting at the component boundary is the canonical workaround.

A `ChatBridge` interface unifies the two hooks' state for the shell. Anon and authed conversations now both flow through the same UI without duplication.

`Sidebar.tsx` props now include `user`, `onSignIn`, `onSignUp`, `onSignOut`. Account chip:

- **Anon:** avatar `·`, name "Guest", sub "Sign in to use yours". Dropdown: Sign in / Create account / free-tier blurb.
- **Authed:** initials from display_name or email. Dropdown: Profile / Settings / Sign out (Sign out in `--m-pass` red).

`Chat.tsx` chat-head label: `SAMPLE · {MODE}` only when `isAnon`. Authed users see `{MODE}` only.

`SampleBanner` only renders when `isAnon && !bannerDismissed`.

### Phase 1b — Tab routing ✅

URL hash format: `#mode=search&tab=deal-bigfake-1234`. On mount, `readHashState()` parses params; falls back to `mode=search, tab=null` if missing/invalid. `writeHashState()` updates via `history.replaceState` (no scroll, no history pollution beyond the initial entry).

A `hashchange` listener handles browser back/forward — the user's history actually works.

Decision: chose URL hash over query params or wouter `useSearch` because (a) doesn't conflict with wouter's path routing, (b) deep links survive page reloads, (c) no server round-trip needed to interpret state.

### Phase 2a — Real chat ✅

V6Chat now consumes the `ChatBridge`:

- `thread` derived from `chat.messages` (mapped from `{role, content}` to `{who, text}`).
- `sending` and `streamingText` drive an inline streaming bubble.
- `activeTool` (authed only) renders an inline tool badge: `"Updating deal info…"` with a pulse-dot.
- `error` (anon) renders an inline red error bubble.

A `smbx:canvas_action` window listener in `V6AppShell` reacts to tool results that emit canvas actions:
- `open_tab` → calls `openTab(detail.tab)`.
- `switch_mode` → calls `pickMode(detail.mode)` if valid.

Composer auto-refocuses 50ms after send. The send button stays disabled when textarea is empty.

### Phase 2b/c — Sign-in / sign-out flow ✅

Account chip is now an interactive button. Click → dropdown menu (anchored under the chip when expanded). Click outside → menu closes.

Sign-in / Create-account routes navigate via `wouter`'s `useLocation` to `/login` and `/signup`. The existing Login.tsx and Signup.tsx pages handle the actual auth flow and redirect back to `/` on success.

After sign-in, V6App's auth.user updates → V6AppShell re-mounts as V6AppAuthed → real user info populates the chip.

Sign-out calls `auth.logout()`, which clears the JWT from localStorage and sets user to null. V6 re-mounts as V6AppAnon. Banner returns (unless previously dismissed).

### Phase 5a — InstallWall PWA gate ⚠️ already orphaned

`InstallWall.tsx` exists at `client/src/components/mobile/InstallWall.tsx` but is **not mounted anywhere in the repo**. Zero `import InstallWall` matches. It was orphaned in a prior refactor (likely the AppShell strip-down).

This is **not a V6 regression** — V6 doesn't break a gate that was already broken. But the PWA-only architecture (per `architecture_pwa_only.md` in memory) is currently not enforced. Re-mounting InstallWall is a separate scope; flagging here for visibility.

If you want it back: mount it in `App.tsx` at the top of the catch-all route, gated on `isMobile && user && isSafari && !isStandalone`. Logic for those checks lives in the InstallWall component itself.

### Phase 5c — Retire V3 ✅

Deleted:
- `client/src/pages/V3App.tsx`
- `client/src/components/v3/Canvas.tsx`
- `client/src/components/v3/LearnDoc.tsx`
- `client/src/components/v3/Shell.tsx`
- `client/src/components/v3/Workspace.tsx`

Verified `tsc --noEmit` clean — no dangling V3 imports anywhere.

**V3 tokens (`--bg`, `--ink`, `--cta`, `--go`, etc.) intentionally LEFT in `index.css`** because non-V6 surfaces still use them: `App.tsx` VerifyEmail, `components/app/*` (AppShellInner, TermInfo, sheets, mobile/ChatFullscreen, mobile/InlineArtifact), `components/artifacts/SDERecastCard`. Removing the V3 token block now would break those surfaces. V3 token cleanup is its own future scope when those surfaces migrate.

---

## Skipped — flagged for your review

### Phase 3 — Real data hydration (waiting for seed data)

Mode-roots still render hardcoded fixtures (Big Fake Deal, Pest Control · FL, etc.). Per your direction, we wait until you seed real sample data before wiring `/api/deals`, `/api/docs`, `/api/analyses` queries.

When ready: each mode-root needs a `useQuery` (or `fetch + useEffect`) at the top, with loading skeleton, error state, and empty-state copy. Pattern is straightforward and additive — won't break the existing visual layer.

### Phase 4 — Stripe checkout + paywall (needs human review)

Pricing CTAs currently call `onTalkToYulia(prompt)` and send a contextual chat message ("I'm interested in Professional at $149..."). This is a placeholder.

Real flow:
- Free → Sign up flow (`/signup`)
- Starter / Professional / Enterprise → `POST /api/stripe/create-checkout-session` → redirect to Stripe Checkout
- Webhook updates user's `subscription_tier` column → V6 reads via `useAuth`

Skipped because: Stripe SDK errors are silent, mistakes can charge real cards, and webhook-side changes need careful testing. **Don't wire this without you watching.**

Free deliverable paywall: when a user generates their second deliverable on Free tier, a paywall sheet should intercept. `useAuthChat` already surfaces `paywallData` from the SSE stream — just need a paywall component and a render path. Same Stripe caveat — needs your review.

### Phase 5b — Density verification (needs seed data)

Can't verify card-multiplication-on-resize meaningfully with 6 hardcoded deals. Re-test once you've seeded 30+ deals across the 5 mode-roots. Drag the window between 1280 and 2560 — cards should multiply, not stretch. Expected at those widths: 3 → 4 → 5 → 7+ for `In review` (280px minmax).

---

## Files touched this session

**Created (V6):**
- `client/src/components/v6/V6App.tsx` (top-level, branches anon vs authed)
- `client/src/components/v6/Sidebar.tsx`
- `client/src/components/v6/Chat.tsx`
- `client/src/components/v6/Canvas.tsx`
- `client/src/components/v6/Learn.tsx`
- `client/src/components/v6/SampleBanner.tsx`
- `client/src/components/v6/icons.tsx`
- `client/src/components/v6/types.ts`
- `client/src/components/v6/modes/SearchRoot.tsx`
- `client/src/components/v6/modes/DocsRoot.tsx`
- `client/src/components/v6/modes/AnalysisRoot.tsx`
- `client/src/components/v6/modes/IntelRoot.tsx`
- `client/src/components/v6/modes/LibraryRoot.tsx`
- `client/src/components/v6/modes/cards.tsx` (V6DealCard, V6Stat, V6WatchRow, V6DocStatus)
- `client/src/components/v6/views/DealView.tsx`
- `client/src/components/v6/views/DocView.tsx`
- `client/src/components/v6/views/AnalysisView.tsx`

**Modified:**
- `client/src/App.tsx` — catch-all route mounts `V6App` instead of `V3App`
- `client/src/index.css` — V6 M3 tokens added alongside V3 tokens, primitive classes (.m-card / .m-btn / .m-fab / .m-state / .tab / .mode-item / m-input / m-slider), m-fadeUp keyframe, prefers-reduced-motion guard

**Deleted:**
- `client/src/pages/V3App.tsx`
- `client/src/components/v3/{Canvas,LearnDoc,Shell,Workspace}.tsx`

**Memory entries written this session:**
- `architecture_v6_files_workspace.md` — V6 contract
- `feedback_density_on_resize.md` — App Store grid pattern rule
- `feedback_two_searches.md` — sidebar ⌘K vs Business Search mode

---

## Commits

Two clean commits on `marketing/v6-files-workspace`:

1. `feat(v6): land Files Workspace — chrome, modes, deep views, auth + chat wiring`
2. `chore(v3): retire — components/v3 + pages/V3App.tsx`

NOT pushed. Push when you're satisfied with the state.

---

## Known issues / decisions to revisit

1. **Pricing CTAs are chat-message placeholders.** When you wire Stripe (Phase 4), replace `handleCta` in `Learn.tsx` with checkout session creation.

2. **Templates and tools use mono abbreviations + V6Icon glyphs**, not CD's emojis (🔒📝✉📄🔍📋📊⚖💰🎯🏦). Aligns with your saved no-emoji-as-icon rule. Easy to revert if you prefer CD's exact look.

3. **Star icon "★ / ☆" in Library** is Unicode, not SVG. Renders consistently on Mac/Win. Swap to inline SVG if iOS Safari renders it as emoji.

4. **InstallWall is unmounted** repo-wide. Decide separately whether to revive.

5. **V3 tokens stay in `index.css`** for now. Several non-V6 surfaces depend on them.

6. **`canvas_action` listener** in V6App handles `open_tab` and `switch_mode` from tool results. If your agentic tools emit other action types, extend the listener in `V6AppShell` (search for `smbx:canvas_action`).

7. **Tab persistence is URL-hash only**, not localStorage. Trade-off: deep links work, but if you have 10 tabs open and clear your URL bar, you lose them. Add localStorage backup if needed.

8. **chatWidth (drag-handle) is NOT persisted** across reloads. Lives in `useState`. Per CD's "out of scope" note. Easy to add via localStorage if you want.

---

## Branch state

```
* marketing/v6-files-workspace (HEAD)
  b7719dd  chore(v3): retire — components/v3 + pages/V3App.tsx
  c43fcb7  feat(v6): land Files Workspace — chrome, modes, deep views, auth + chat wiring
  ab84a42  feat(v3): LearnDoc v0.9 + interactive demo wiring + Big Fake Deal naming   ← prior session
  ...
```

Run `git log --oneline -10` to see prior context.

---

## Next session candidates

In priority order:
1. **Seed data** — once you've added real deals/docs/analyses, wire mode-root data hydration (Phase 3).
2. **Stripe + paywall** — Phase 4, paired session with you watching.
3. **InstallWall** — re-mount + verify mobile-auth-Safari gate.
4. **V3 token cleanup** — migrate non-V6 surfaces (`AppShellInner`, mobile chat, artifacts) off V3 tokens, then strip the V3 token block from `index.css`.
5. **Deliverable rendering** — `useAuthChat.paywallData` already surfaces; need a sheet component to render it inline in chat.
