# V6 Mobile Wiring Log — Overnight Session 2026-05-01 → 2026-05-02

Branch: `marketing/v6-files-workspace`. Not pushed. (Both desktop V6 and mobile V6 ride on this branch — same commit history.)

---

## TL;DR — what's shipped, what to test

**V6 Mobile is the Apple App Store + Liquid Glass v2 mobile companion to V6 desktop.** Lands automatically on viewports below 768px via the `useIsMobile` hook. Reuses the same auth (`useAuth`) and chat hooks (`useAnonymousChat`, `useAuthChat`) that V6 desktop wired this afternoon — so signing in on desktop and visiting the mobile URL keeps you authed.

**4 production screens shipped:**
- Today — welcome hero (anon) or daily-pick teaser (authed) + Three Ways to Explore + Pipeline + Brief teaser
- Pipeline — category chips + NEW TODAY featured + Yulia is watching
- Brief — editorial story card + 3 ranked picks
- Deal detail — App Store app-detail page (icon strip + stats + closer look + ratings)

**Plus: fullscreen Yulia chat sheet** (FAB tap → slides up). Three-layer iMessage architecture per memory — keyboard-aware, no flex-column workaround, works in installed PWA standalone mode.

**Visual language: Liquid Glass v2 throughout.** Multi-layer iOS 26 chrome (blur 32–40px + saturate 180% + brightness + 0.5px white inner edge + soft shadow). Pastel hero gradients (mint-sage / amber / coral) as the primary brand signal. Periwinkle accent `#8A9AE8` (different from desktop's slate `#2E5C8A` — mobile-specific token namespace `--mb-*` scoped to `.mobile-root`).

**Where copy disagreed with desktop, desktop won.** Welcome H1 uses desktop's longer "Agentic AI specifically built for buying and selling businesses of all shapes and sizes." (vs CD's mobile bundle's tighter version). Same for the tag, pipeline seed deals (Big Fake Deal · sample at #1 across mobile screens).

---

## Quick-test checklist for morning review

Open `localhost:5173/` in a mobile-width viewport (Safari mobile, Chrome DevTools device toolbar at iPhone 14, or just narrow your desktop browser to ~390px).

**Anon path (no sign-in yet):**
1. Today tab is the default. Welcome hero with mint-sage gradient + `WELCOME TO SMBX · WORKING SAMPLE` eyebrow. H1 = desktop's longer copy. "Start" pill in the inner cell + "FREE · 3 SAMPLE DEALS" meta below.
2. TryThisCard shows 3 numbered tap rows (Open a sample deal / Chat with Yulia / Read the brief).
3. Tap any deal in the pipeline list → detail screen opens, URL hash updates to `#deal=deal-bigfake`.
4. Tap back arrow → returns to Today.
5. Tap Pipeline tab in the floating glass tab bar → Pipeline screen with category chips + "Big Fake Deal · sample" featured card (cool blue gradient).
6. Tap Brief tab → editorial story card + 3 ranked picks.
7. Tap the chat FAB (slate-blue circle next to the tab bar) → fullscreen chat slides up. Empty state shows 4 suggestion chips.
8. Tap a suggestion or type "what can you do?" + Enter → Yulia streams a real reply.
9. Tap close (× at top right) → chat dismisses.
10. Tap top-right JM avatar → routes to `/login`.

**Authed path (after signing in on `/login`):**
11. Reload at mobile viewport. Welcome hero collapses to "Today's top pick" daily-brief teaser (no `WORKING SAMPLE`). TryThisCard hides.
12. Top-right avatar shows your real initials.
13. Pipeline / Brief lose the "VIEW SAMPLE" eyebrow prefix; sample callouts hide.
14. Chat sheet shows `online` meta instead of `SAMPLE · {MODE}`.
15. Tap avatar → `confirm("Sign out of smbx.ai?")` → confirm → back to anon state.

**iOS PWA hardening (test on real device when possible):**
16. Install as PWA via Safari → Add to Home Screen.
17. Open the installed PWA → tab bar should sit cleanly above the home indicator (no chin).
18. Tap chat FAB → fullscreen chat. Tap composer → keyboard rises → composer should track keyboard height (sit ABOVE keyboard, not behind it). Conversation scrolls behind freely.
19. Dismiss keyboard → composer returns to bottom safe-area.

If steps 7–9 fail, that's the M7 chat sheet bug to flag. If step 18 puts the composer behind the keyboard, the visualViewport tracker isn't firing — check `kbHeight` in React DevTools.

---

## Phase-by-phase summary

### M0 — Foundation (commit 5cd0403)

- **Mobile tokens scoped to `.mobile-root`** in `client/src/index.css`. Periwinkle `--mb-accent`, pastel hero gradients (`--mb-hero-pursue-1/2`, watch, pass), App Store ink scale (`--mb-ink` through `--mb-ink-5`), powder iOS blue for Get pills, verdict semantics, SF Pro typography stack with Inter Tight / Inter / JetBrains Mono fallbacks. Coexists with V6 desktop's `--m-*` tokens — no name collision.
- **Utility classes** prefixed `.mb-*`: as-card, get-pill (light/dark/solid variants), verdict-pill (warn/danger/on-light), section-eyebrow, section-title, tap, hide-scroll, mono, eyebrow.
- **Animations:** `mb-fade-up` (480ms cubic-bezier(0.2,0.7,0.2,1) + `mb-slide-up` (380ms slide-from-below for sheets). `prefers-reduced-motion` guard.
- **PWA viewport block** at `@media (max-width: 767px) and (display-mode: standalone)`: html/body locked to `--vvh` from JS visualViewport, `overflow: hidden`, `touch-action: none`. Per `architecture_ios_pwa_pill.md`.
- **Chat sheet CSS hooks** (`html.yulia-chat-open` → hide #root + lock body) — used by M7.
- **`useIsMobile` hook** (`client/src/hooks/useIsMobile.ts`) — matchMedia `(max-width: 767px)` with reactive updates.
- **V6App routing branch** — `isMobile` → `<V6Mobile/>`, else existing desktop path.
- **V6Mobile stub** — anon vs authed split using sibling components (avoids React's conditional-hook-call rule), URL hash sync (`#tab=...&deal=...`), `--vvh` tracking effect.

### M1 — Liquid Glass primitives (commit 8fb9752)

- **`icons.tsx`** — outline icon set, stroke-tuned for iOS density: chat / search / back / share / close / download / chevron / star / arrowUp + 3 tab icons (today / pipeline / brief, filled when active). All accept `size` and `c` (color).
- **`glass.tsx`** — `<GlassSurface>` primitive with 4 tints (light / chrome / dark / onColor). Each tint: bg rgba + backdrop-filter (blur + saturate + brightness) + 0.5px white inner edge + soft shadow. Exact CD recipes preserved.
- **`YIcon.tsx`** — square-rounded gradient avatar with white "Y", 5 verdict tints (default/pursue/watch/pass/cool). Inner-edge highlight + soft shadow. `radius` defaults to `size * 0.225` per Apple's icon-corner rule.
- **`VerdictPill.tsx`** — small mono pill with pulse-dot. 3 kinds (pursue/watch/pass) + `onLight` modifier.
- **`Sparkline.tsx`** — inline SVG polyline.

### M2 — Chrome (commit c0cf6d5)

- **`TopBar.tsx`** — `GlassTopBar` (translucent fixed bar, mask-image bottom-fade so content scrolls under) + `LargeTitle` (34px display H1 below the bar, App Store large-title pattern). Search button + JM avatar circle in the top right; both accept callbacks.
- **`TabBar.tsx`** — floating Liquid Glass capsule with 3 tabs (Today / Pipeline / Brief) + adjacent slate-blue chat FAB. **Portaled to `document.body`** to escape backdrop-filter containing-block hazards (per `feedback_fixed_position_containing_block.md`).
- V6Mobile shell now mounts the chrome around per-screen content. Tab switching reactive to URL hash. Detail view triggers `showBack` on the GlassTopBar.

### M3 — Today (commit 8994f7e)

- **Anon variant:** welcome hero with mint-sage gradient + `WELCOME TO SMBX · WORKING SAMPLE` eyebrow + **desktop's longer welcome H1 + tag** (per copy-resolution rule). Hero visual = sparkline + `$1.80M` big number ("+$760K NORMALIZED"). Inner cell with onColor liquid glass + Y avatar + Start CTA.
- **Authed variant:** hero collapses to a daily-brief teaser ("TODAY · YULIA'S TOP PICK") pointing at Big Fake Deal · sample.
- **TryThisCard** (anon only): 3 numbered tap rows pointing at sample deal / chat / brief.
- **Pipeline section:** 5 sample deals matching desktop seed. Big Fake Deal · sample at #1 (PURSUE), Pest Control · FL #2 (PURSUE), Electrical · TX #3 (WATCH), HVAC platform · CO #4 (WATCH), Distribution · OH #5 (PASS).
- **Brief teaser** at the bottom — "3 picks worth your 10 minutes" pointing at the Brief tab.

### M4 — Pipeline (commit 9a80acf, combined with M5)

- TopBar "Pipeline" + LargeTitle.
- Anon callout — "A live sample pipeline. Tap any deal to see how Yulia thinks…"
- **Category chips:** Sourced 142 / Screened 28 / In review 4 / Pursuing 2 / Watching 87. Horizontal scroll, "In review" active by default. Active chip = solid ink background + white count chip.
- **NEW TODAY featured** — full-bleed cool-blue gradient (`#A9C4E5 → #7FA8D9`) with eyebrow "FIT 92 · PURSUE" + display headline "Recurring revenue. / Honest capex story." + footer cell with Y avatar + "Big Fake Deal · sample" + "Dig in" CTA. (Sample-data renamed from CD's "Food Svc Distribution · MN" for desktop seed consistency.)
- **Yulia is watching** — 4 sample deals (Pest Control Roll-up · FL, Electrical Contractor · TX, Marina Holdings · FL, Boutique Logistics · GA) with action pills (`$1.4M SDE` / `Watch` / `Pursue` / `Pursue`).

### M5 — Brief (commit 9a80acf, combined with M4)

- TopBar "Brief" + LargeTitle.
- Date line + sample callout — "This is what Yulia sends every morning. Start free to get yours."
- **Editorial story card** — mint-sage gradient with eyebrow "YULIA · 3 PICKS · 10 MIN" + display H2 "Three worth your / 10 minutes today" + dek "Recurring revenue, honest add-backs, and one I'd pass on." + 80px sparkline visual at the bottom.
- **3 picks list:** matching desktop seed — Big Fake Deal · sample (PURSUE 92), Pest Control · FL (PURSUE 84), Electrical Contractor · TX (WATCH 78). Each pick = rank + Y avatar + name + sub + verdict-tinted FIT score.

### M6 — Deal detail (commit 8bbd1c1)

- **FloatingNav** — glass-blurred 32px back + share circles, position absolute over the hero. Per `feedback_fixed_position_containing_block.md`, careful: lives inside the screen container, so backdrop-filter at this level is safe.
- **Hero block:** 108px Y avatar (pursue gradient) + name + "East Texas · Deal #SMBX-0119" meta + slate Pursue button + "Yulia's verdict" caption.
- **4-col stats strip:** $1.80M NORM. SDE (+$760K accent), 7.0× MULTIPLE (SBA-clear), 92 FIT SCORE (4.6 stars), #3 THIS WEEK (of 142). Hairline dividers between cells.
- **Tag chips:** Industrial / Services / Recurring / SBA-clear / Sun Belt (horizontal scroll).
- **What's Yulia saying:** version line + tight narrative paragraph (recast clean, concentration-as-moat, NWC peg flag).
- **A closer look:** 4-card horizontal artifact rail with verdict-tinted gradients — Recast walk (mint-sage), Baseline range (cool blue), Buyer list (purple), IOI draft (slate). Each = title + big number + sub + Open pill.
- **Confidence & notes:** 4.6 / out of 5 + Yulia's confidence narrative; user note card with 5-star + "Worth the call. Lining up the SBA pre-qual today."

### M7 — Chat sheet (commit f9ae04e)

- **Three-layer iMessage architecture** per `feedback_pwa_chat_flex_layout.md`:
  - Conversation = `position: absolute; inset: 0; zIndex: 1` (back layer, scrolls)
  - Header = `position: absolute; top: 0; zIndex: 2` (front top, with safe-area-inset-top)
  - Composer = `position: absolute; bottom: kbHeight; zIndex: 2` (front bottom, tracks keyboard)
- **JS visualViewport tracking** for `kbHeight`. Clamped to `[0, innerHeight*0.75]` to filter the transient garbage values iOS fires mid-keyboard-animation.
- **html.yulia-chat-open class** toggled while sheet is mounted — hides #root and locks body. (Block defined in M0's index.css addition.)
- **Reuses chat bridge** from V6Mobile so anon vs authed routing matches what's open elsewhere.
- **Empty state** with 4 sample-tone suggestions ("What's worth my time today?", "Walk me through Big Fake Deal", "Read me the brief", "Compare my top 3 picks") that send on tap.
- **Streaming UI:** message bubble with cursor caret, agentic tool badge ("Updating deal info…") with pulse-dot.
- **Composer:** white frosted pill (backdrop-blur 20px) + autosizing textarea + slate-blue arrow-up FAB. Enter sends, ⇧↵ newline, autofocus on open.

### M8 — Auth wiring polish (commit 7c48283)

Most auth wiring already landed in M3-M7 — every screen takes `isAnon` and swaps copy/eyebrows. TopBar avatar shows real user initials when authed. This commit adds a `confirm("Sign out of smbx.ai?")` gate to the avatar tap so a mistap doesn't sign someone out.

---

## Skipped — flagged for your review

### Real data hydration (waiting for seed data — same as desktop)

Mode-roots and detail screen still render hardcoded fixtures (Big Fake Deal · sample, Pest Control · FL, etc.). Wire `/api/deals` etc. once you've seeded real data. Pattern is identical to desktop's deferred Phase 3.

### Stripe checkout from pricing CTAs

Mobile bundle has no pricing screen. The hero/Try-This/Pipeline CTAs all open chat or routes — no Stripe surface area. If you add a pricing screen on mobile later, it follows desktop's pricing CTA pattern (`onTalkToYulia(prompt)` placeholder until Stripe wires).

### Account sheet (proper bottom sheet for sign-out / settings / profile)

Right now avatar tap → confirm dialog (authed) or /login (anon). Desktop has a proper dropdown menu with Profile / Settings / Sign out. Mobile equivalent should be a bottom sheet (Vaul if installed, else a custom absolute-positioned sheet). Out of scope tonight.

### Dark mode

Mobile bundle is light-only per CD. Tokens are organized for paired dark variants when needed.

### Pull-to-refresh

CD bundle calls this out as expected on Today + Pipeline but didn't design the indicator. Use system pull-to-refresh once we wire data fetches.

### Push notifications (daily 8am brief)

Per CD "deliberate gap." iOS 16.4+ supports Web Push only inside installed PWAs. Wire via `subscriptionService` + a brief generation cron once the brief generator is real.

### Loading / error / empty deep states

Sample data renders unconditionally. Once API fetches replace fixtures, each screen needs skeleton + error + empty card.

---

## Files touched this session

**Created (mobile):**
- `client/src/components/v6/mobile/V6Mobile.tsx` (top-level, anon vs authed branch, URL hash sync, --vvh tracker, screen dispatcher)
- `client/src/components/v6/mobile/types.ts`
- `client/src/components/v6/mobile/icons.tsx`
- `client/src/components/v6/mobile/glass.tsx`
- `client/src/components/v6/mobile/YIcon.tsx`
- `client/src/components/v6/mobile/VerdictPill.tsx`
- `client/src/components/v6/mobile/Sparkline.tsx`
- `client/src/components/v6/mobile/TopBar.tsx`
- `client/src/components/v6/mobile/TabBar.tsx`
- `client/src/components/v6/mobile/ChatSheet.tsx`
- `client/src/components/v6/mobile/screens/Today.tsx`
- `client/src/components/v6/mobile/screens/Pipeline.tsx`
- `client/src/components/v6/mobile/screens/Brief.tsx`
- `client/src/components/v6/mobile/screens/Detail.tsx`

**Created (shared):**
- `client/src/hooks/useIsMobile.ts`

**Modified:**
- `client/src/components/v6/V6App.tsx` — branch isMobile to V6Mobile
- `client/src/index.css` — V6 mobile token block + utility classes + PWA viewport handling + chat sheet CSS hooks

---

## Commits

9 clean commits on `marketing/v6-files-workspace`, NOT pushed:

```
7c48283  feat(v6/mobile): M8 — auth wiring polish (avatar confirm-before-sign-out)
f9ae04e  feat(v6/mobile): M7 — fullscreen Yulia chat sheet (three-layer iMessage architecture)
8bbd1c1  feat(v6/mobile): M6 — Deal detail screen
9a80acf  feat(v6/mobile): M4 + M5 — Pipeline screen + Brief screen
8994f7e  feat(v6/mobile): M3 — Today screen with anon/authed hero variants
c0cf6d5  feat(v6/mobile): M2 — chrome (TabBar portaled, GlassTopBar, LargeTitle, FAB)
8fb9752  feat(v6/mobile): M1 — Liquid Glass primitives (icons, GlassSurface, YIcon, VerdictPill, Sparkline)
5cd0403  feat(v6/mobile): M0 — tokens, useIsMobile hook, routing branch
```

(Plus M9 — this log — landing as the next commit.)

---

## Known issues / decisions to revisit

1. **Pipeline `Yulia is watching` rows are deals, not sources.** CD's README mentioned this section as "watch sources" (BizBuySell / DealStream / Axial / Sunbelt) but the JSX shows 4 deals (Pest Control Roll-up · FL, Electrical Contractor · TX, Marina Holdings · FL, Boutique Logistics · GA). Code wins over docs here — went with deals. Easy to swap to source-rows if the README intent is what you want.

2. **NEW TODAY featured renamed.** CD's bundle uses "Food Svc Distribution · MN" but for sample-data consistency with the desktop seed I renamed it to "Big Fake Deal · sample" (East Texas, $5.4M REV). Same gradient, same layout — just consistent identity.

3. **Avatar tap on authed = confirm dialog.** Quick stopgap to prevent mistap-signout. Real account sheet is a future polish task.

4. **`viewport-fit=cover` is intentionally OMITTED in client/index.html** per `feedback_pwa_chin_viewport_fit.md`. Verified before building. Don't re-enable without reading that memory first.

5. **Floating nav on Detail uses backdrop-filter on the buttons themselves** — not on an ancestor, so no containing-block hazard. Safe.

6. **Tab bar is portaled to `document.body`** so the screen container's padding/margin/scrolling can't shift it. Inside an installed PWA the body is sized to `--vvh`, so `bottom: 18` anchors above the keyboard.

7. **Chat sheet does NOT use `position:fixed` anywhere.** All three layers are `position:absolute` inside the dialog (which is itself `position:absolute inset:0`). Per `feedback_pwa_chat_flex_layout.md` — `fixed` breaks because the layout viewport doesn't shrink in iOS Safari PWA. Don't refactor to flex column; that pattern was tried and ruled out in a prior session.

8. **No long-press anywhere.** Per `feedback_no_long_press.md`. All secondary actions use visible affordances (back button, close button, Open pills).

9. **Liquid Glass v2 only — standard chrome variant skipped.** Per your "apple liquid glass chrome" direction. CD's `mobile-primitives.jsx` standard variant (TabBar, TopBar) was not ported. If you want a fallback for low-end devices, the recipes are in CD's source.

---

## Branch state

```
* marketing/v6-files-workspace (HEAD)
  7c48283  feat(v6/mobile): M8 — auth wiring polish
  f9ae04e  feat(v6/mobile): M7 — fullscreen Yulia chat sheet
  8bbd1c1  feat(v6/mobile): M6 — Deal detail screen
  9a80acf  feat(v6/mobile): M4 + M5 — Pipeline + Brief screens
  8994f7e  feat(v6/mobile): M3 — Today screen
  c0cf6d5  feat(v6/mobile): M2 — chrome
  8fb9752  feat(v6/mobile): M1 — primitives
  5cd0403  feat(v6/mobile): M0 — foundation
  7220fa9  docs: V6 wiring log for overnight session review     ← desktop log
  b7719dd  chore(v3): retire — components/v3 + pages/V3App.tsx
  c43fcb7  feat(v6): land Files Workspace                       ← desktop V6
  ab84a42  feat(v3): LearnDoc v0.9 + interactive demo wiring    ← prior session
```

---

## Next session candidates

In priority order:

1. **Push to Railway** — both desktop and mobile go live for testing. Confirm Railway is configured to deploy `marketing/v6-files-workspace` (or merge to whatever branch deploys).
2. **Seed data** — once the test Railway env has real deals/docs/analyses, wire mode-root + mobile screen data hydration.
3. **Mobile account sheet** — proper bottom sheet for Profile / Settings / Sign out. Use Vaul if available.
4. **Stripe + paywall** — paired session with you watching.
5. **Pull-to-refresh + push notifications** — once data is seeded.
6. **Dark mode** — paired tokens for both desktop and mobile.
7. **InstallWall remount** — re-mount the orphaned PWA gate (flagged in V6_WIRING_LOG.md as still orphaned).

---

## Trust but verify

- `npx tsc --noEmit` reports **0 errors in v6/mobile**. The project's pre-existing 83 errors (canvas/FileTree, documents/DealMessagesPanel, hooks/useAnonymousChat HMR types, etc.) are unchanged from before tonight.
- Visual layer not screenshot-verified (Playwright Chromium not installed) — please verify in your browser at iPhone 14 viewport (390×844) and tablet (768×1024 just below the breakpoint) and a desktop width to confirm the responsive switch works cleanly.
- `display-mode: standalone` paths can only be tested in an installed PWA. Browser preview won't fire the @media gate. Add to home screen on real iOS to test.

Sleep well — this log + V6_WIRING_LOG.md cover both halves of V6.
