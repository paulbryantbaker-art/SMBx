# CLAUDE_DESIGN_BRIEF — New V6 Surfaces (post-2026-05-06 autonomous run)

**Status:** Engineering / agentic-tool work landed. Visual design needs CD's hand — Claude (engineering) shipped placeholder surfaces using V6 tokens but did not apply the V6 design language faithfully. The architectural intent and data plumbing are correct; the visual execution is generic and templated.

**What CD owns:** the design of the surfaces listed below in the V6 mobile + desktop bundles' visual language. Output format: HTML mockups in the existing handoff bundles + token additions (if needed) + component recipes.

**What CD does NOT own:** the agentic tools, server endpoints, gate logic, chat-first architecture — those are locked.

---

## 1. Source of truth (all already in repo)

| Resource | What it is |
|---|---|
| `design_handoff_smbx_app store/` | V6 mobile bundle — App Store + Liquid Glass v2. Periwinkle accent, watercolor textures. **The reference to match for every mobile surface in this brief.** |
| `design_handoff_smbx_desktop_material/` | V6 desktop bundle — App Store + Material 3. Slate-blue accent, lavender chrome. **The reference for every desktop surface.** |
| `DESIGN_TOKENS.md` | Token reference (auto-gen from `client/src/index.css`) |
| `DESIGN_SOURCE.md` | File-by-file map: handoff bundle → production code |
| `client/src/components/v6/mobile/screens/Today.tsx` | **Canonical mobile screen pattern.** |
| `client/src/components/v6/mobile/screens/Pipeline.tsx` | **Canonical mobile pattern.** |
| `client/src/components/v6/mobile/screens/Detail.tsx` | **Canonical mobile pattern.** |
| `client/src/components/v6/mobile/ChatSheet.tsx` | **Canonical mobile pattern (sheet/composer).** |
| `client/src/components/v6/views/DealView.tsx` | **Canonical desktop pattern.** |
| `client/src/components/v6/modes/SearchRoot.tsx` | **Canonical desktop pattern (home).** |
| `client/src/components/v6/Chat.tsx` | **Canonical desktop pattern (chat panel).** |

## 2. Anti-references — what NOT to do

The following files contain surfaces Claude (engineering) shipped that do **not** follow the V6 design language. CD should read them to see what to avoid: generic "eyebrow + headline + body" cards, repeated 2x3 lavender chip grids, undifferentiated empty-state placeholders, gate-strip pills with no visual hierarchy, etc.

| File | What was built | Why it's wrong |
|---|---|---|
| `client/src/components/v6/mobile/screens/Library.tsx` | Three near-identical "EMPTY" cards stacked vertically with color-coded dots | No actual library structure visible. User can't see folders, docs, statuses. Should show library content (real or sample) using the same hero + cards + list patterns as Today/Pipeline/Detail. **Highest priority redesign.** |
| `client/src/components/v6/mobile/screens/Search.tsx` | 6 lavender chip cards in a 2x3 grid above a composer pill | Generic AI-aesthetic chip grid. Doesn't match the App Store editorial pattern of the canonical screens. Composer doesn't share visual DNA with ChatSheet. |
| `client/src/components/v6/mobile/screens/TodayActionQueue.tsx` | List of items with priority dot + chevron rows in a single card | Replaces a richer hero/explore card with a generic checklist. No editorial weight, no hierarchy among items. |
| `client/src/components/v6/PortfolioOverviewCard.tsx` | Card with EV display + horizontal segmented gate bar + 3-cell close window grid | Functional but generic dashboard-card aesthetic. Not anchored in the V6 desktop language. |
| `client/src/components/v6/GateStrip.tsx` | Small horizontal pill row in chat header (B0–B5 segments) | Pills are too neutral / chrome-y. No connection to the slate-blue V6 brand voice or to the desktop's V6 visual rhythm. |
| `client/src/components/v6/Chat.tsx` (V6GateAdvanceCard within) | Inline chat-thread card: green checkmark + slate-blue chip with title + body + "Open in canvas" pill | OK pattern but execution is the same templated card-with-eyebrow that repeats elsewhere. |
| `client/src/components/v6/PortfolioOverviewMobile.tsx` | Mobile portfolio header card | Repeats the desktop card design at small size. Doesn't earn its place in the App Store rhythm of the Pipeline screen. |
| `client/src/components/v6/modes/ModeRootEmpty.tsx` | Generic centered card "Nothing here yet" | Same templated card pattern as everywhere else. No surface-specific personality. |
| `client/src/components/v6/modes/SearchRoot.tsx` (V6EmptyHome within) | "WELCOME" eyebrow + headline + 4 starter chips in a card | Templated AI starter-screen pattern. The 4 chips are nearly identical to the 6 chips on mobile Search — same problem, same symptom. |
| `client/src/components/v6/views/DealView.tsx` (recommended-next pills within) | Mono-eyebrow + display-label pills in a wrap row | Generic pill row. Doesn't carry any signal of "Yulia suggests" beyond color — needs an editorial framing that names this as a Yulia-driven surface. |
| `client/src/components/v6/Canvas.tsx` (PendingSurface within) | Card with "OPENED BY YULIA" eyebrow + chip + body for tabs awaiting renderers | OK as a stopgap; CD can choose whether this needs designed treatment or stays as a thin placeholder. |

**Common failure modes across all of the above:**
1. **Templated card pattern** (eyebrow → display headline → body → maybe a CTA pill) is reused on 8+ surfaces. No differentiation.
2. **Lavender pills** (`--m-primary-container` / `--mb-accent-soft`) used as the universal "accent" treatment. No earned motion, no editorial framing.
3. **Empty states are not designed** — they're functional ("here's what would be here"), not delightful or instructive.
4. **Library shows no library** — the screen is three tier descriptions with no actual document visibility.
5. **No App Store editorial weight** on the mobile screens — no hero gradient, no large-number headlines, no playful watercolor textures even though the system supports them.

## 3. Surfaces to design (the actual work)

### MOBILE (highest priority — user explicitly called this out)

#### M1 · Library tab — full screen
**Architectural role:** 4th tab in the mobile IA. Surfaces the user's documents at every stage of the legal/document lifecycle (TipTap-edited drafts → secured data room → approved/locked finals). Replaces the previous "Brief" tab in the mobile IA.

**Three lifecycle tiers (backend already supports these):**
- **Editing** — drafts the user is shaping with Yulia (TipTap-editable, status='draft')
- **Data Room** — secured financials and other shareable docs (NDA-gated when shared cross-fence)
- **Security / Approved & Locked** — countersigned, executed, terminal lifecycle

**User flow:** User taps Library tab → sees their actual documents grouped by tier → tap a document opens it in the canvas (Yulia's still in scope via chat).

**What to design:**
- Hero/large-title pattern matching Today/Pipeline (`LargeTitle` component)
- For each tier: section header + list of documents with status, last-edited, owner, etc.
- Sample data the user can see right now in production: deliverables (`/api/deals/:id/deliverables`), data room documents (`/api/data-room`), conversations
- Folders/grouping by deal so the user can navigate by-deal as well as by-tier
- Search/filter affordance? (the Search tab handles cross-doc search, but in-tab filter chips might still help)
- Empty per-tier states (when a tier has zero docs) — but do NOT replace the entire screen with empty placeholders the way Claude did

**Canonical patterns to reuse:**
- Card → list rows pattern from Pipeline.tsx
- LargeTitle hero from Today.tsx / Pipeline.tsx
- App Store-style sectioned card (`mb-as-card`) used in Today.tsx
- VerdictPill / StatusPill conventions for document status

#### M2 · Search tab — full screen
**Architectural role:** Multi-purpose lookup tab. Replaces "Brief" alongside the Library addition. Two surfaces in one tab:
1. **Discovery hub** (top): starter cards for common asks — find opportunities, find buyers, find service providers, find financing, understand structures, find deal-team specialists
2. **Side-chat composer** (bottom): a typing surface that sends prompts to Yulia (in B1.9 it routes through the main chat; future Phase 4 will give it its own context-typed chat thread so deal chat stays uncluttered)

**User flow:** User taps Search tab → sees discovery cards → either taps a card (pre-fills the composer with a starter prompt) or types directly → Yulia responds in chat.

**What to design:**
- Hero + LargeTitle pattern matching Today/Pipeline
- Discovery cards — but NOT a generic 2x3 chip grid. Use the same editorial card patterns as Today's "Three ways to explore" or Brief's editorial story card.
- Composer that visually relates to ChatSheet's input but adapted for inline-on-page use
- A way for the user to see recent searches / saved lookups
- Internal team comms slot (future) — design how this might integrate

**Canonical patterns to reuse:**
- ExploreCard pattern from Today.tsx (the "Pick a way in" card with tip chips)
- ChatSheet input/composer pattern
- Editorial card pattern from Brief.tsx

#### M3 · Today action queue (authed users, replaces ExploreCard)
**Architectural role:** When the user is signed in and has at least one deal, replace the anon-leaning ExploreCard with a personalized "things you need to look at right now" surface.

**Items derived from real deal state** (gates, staleness, pending actions, expiring NDAs, sourcing candidates that just landed, etc.):
- Priority 1: closing gates (B5/S5/R5)
- Priority 2: gate-0 incomplete setups
- Priority 3: stale mid-journey deals (14+ days)
- Priority 4: in-flow mid-journey deals

**What to design:**
- A hero/featured surface for the highest-priority item (App Store "FEATURED TODAY" pattern)
- A list of remaining items with editorial differentiation by priority (not just colored dots)
- Tap → opens deal OR pre-fills chat with the action prompt
- Empty state ("Nothing urgent.") when authed-with-deals-but-no-actions

**Canonical patterns to reuse:**
- DailyHero + featured story pattern from Today.tsx
- PickRow / PipelineRow patterns
- The "FEATURED" / "NEW TODAY" framing already in Pipeline.tsx

#### M4 · Recommended Next on Detail screen
**Architectural role:** 2-4 contextual shortcuts driven by the deal's current gate × journey. Tap → Yulia executes the action. See `feedback_recommended_next_pattern.md` in memory.

**Already wired** (B2.0): `client/src/lib/recommendedNext.ts` returns `RecommendedItem[]` per gate × journey. DetailScreen renders them via the existing `<Section title="Recommended next">` + `<NextAction>` row pattern, so M4 may need only a refinement of the `NextAction` row visual, NOT a wholesale redesign. CD's call.

#### M5 · Mobile portfolio header (Pipeline tab top)
**Architectural role:** Above the deal list on the Pipeline tab. Aggregates the user's whole portfolio: weighted EV, deals by gate, expected close window. Hides for anon and zero-deal users. See `architecture_portfolio_overview_card.md` in memory.

**What to design:**
- Header card matching App Store's section-header rhythm
- Aggregations only — NOT individual deal listings
- The gate distribution bar should feel native to the mobile language

---

### DESKTOP

#### D1 · Empty home for authed-no-data (SearchRoot)
**Architectural role:** When an authed user has zero deals, the home page should NOT show fake "Big Fake Deal · sample" content. Currently shows a templated "WELCOME" card with 4 starter chips.

**What to design:**
- A first-run / onboarding surface that fits below where Today's Brief would be
- Should hint at the journey shape (BUY/SELL/RAISE/MERGER/PMI) without being a button-pile
- Should encourage chat as the primary path (not the chips themselves)

**Canonical pattern:** SearchRoot's existing Today's Brief hero card pattern, adapted for "you don't have data yet" framing.

#### D2 · Gate progress strip (chat header)
**Architectural role:** Renders below the chat header when a deal is in scope. Six (or four) segments showing the journey's gate progression: completed gates checked, current gate filled, pending gates outlined.

**What to design:**
- Visual treatment that fits within the chat panel's narrow column (320–640px wide)
- Earns its space — currently feels like undifferentiated chrome
- Connection to the Yulia voice / brand color
- Tap on a completed gate → opens that gate's completion deliverable (CD's call on whether to surface this affordance)

#### D3 · Gate-advance receipt card (chat thread)
**Architectural role:** Inline system message in the chat thread when Yulia advances a gate. Surfaces the new gate + the auto-generated completion deliverable + an "Open in canvas" CTA.

**What to design:**
- A chat-thread card variant (alongside user / Yulia message bubbles) that reads as a "system event"
- Should feel like a celebration moment without being noisy
- The Open CTA should fire `smbx:canvas_action` (already wired) — design the affordance

#### D4 · Recommended Next pills (DealView)
**Architectural role:** Same as M4 but for desktop. Currently rendered as a wrap row of mono-eyebrow pills above the verdict banner.

**What to design:**
- Better integration with the DealView header — currently competes visually with Export/Share/Draft IOI buttons
- Visual signal that this is "Yulia suggests" not "you can do this"
- Can the existing Export/Share/Draft IOI buttons be downgraded or moved to free this surface?

#### D5 · Portfolio overview card (SearchRoot)
**Architectural role:** Lives below Yulia's brief card on the SearchRoot home. Aggregations only — weighted EV, deals by gate, expected close window. Hides for zero-deal users.

**What to design:**
- A card that fits the editorial rhythm of SearchRoot (big hero brief → portfolio overview → Picks → In Review → Closed)
- Gate distribution should feel rich, not utilitarian
- Could integrate sparkline or trend signals from `seven_factor_composite`

#### D6 · Mode root empty states (Docs / Analysis / Intel / Library mode roots)
**Architectural role:** When an authed user has zero deals, the mode roots currently show fake sample arrays. Claude added a generic "Nothing here yet" card. CD should design proper per-mode empty states.

#### D7 · Mode root populated states (Docs / Analysis / Intel / Library)
**Architectural role:** Even when an authed user HAS data, these mode roots STILL render hardcoded sample arrays (Claude only fixed the empty-state in B1.7). CD should treat these as net-new surfaces that need real-data wiring + design.
- Docs: should pull from `/api/deliverables` (recents, by-deal folders, templates)
- Analysis: should pull from saved analyses / models
- Intel: should pull from sourcing intel briefs + market signals
- Library: cross-mode starred view

#### D8 · Model tab placeholder (PendingSurface in Canvas)
**Architectural role:** When Yulia opens a model tab and the model viewer chunk is still loading, OR when a model type doesn't have a viewer yet, this placeholder renders.

**What to design:**
- Could be a thin loading skeleton, or a richer placeholder that names what's coming
- CD's call on how much treatment this deserves

#### D9 · Deliverable tab — generating / failed / complete states
**Architectural role:** Tab opened by `canvas_action: 'open_deliverable'`. Polls `/api/deliverables/:id` every 2s. Three visual states.

**Currently:** all three states use the same PendingSurface card pattern with different body text. CD should differentiate them:
- generating → progress feedback, time estimate
- failed → error framing with recovery path
- complete → renders markdown content (the actual deliverable). Currently Claude renders it as a `<pre>` whitespace-preserved block — needs proper typography, structured rendering for editable types (CIM, LOI), chart-aware rendering for analytical types (DD, valuation report)

#### D10 · SourcingPanel restyle
**Architectural role:** The 5-stage sourcing pipeline UI. Currently mounted as-is from `client/src/components/chat/SourcingPanel.tsx` (814 lines), but it carries the **retired Cowork DL palette** (warm cream + clay) — visually orphaned from V6.

**What to design:**
- Full V6 desktop language pass on the existing SourcingPanel
- Or a fresh design from scratch that reuses the data hooks SourcingPanel already provides

---

## 4. Architectural rules (non-negotiable, drive every decision)

| Rule | Memory file | Implication for design |
|---|---|---|
| Chat-first | `feedback_chat_first_yulia_conduit.md` | Yulia is the conduit. Buttons are shortcuts, not primary affordances. Don't design dashboards full of buttons. |
| Recommended Next | `feedback_recommended_next_pattern.md` | Context-aware shortcuts (2-4 max) on Detail/Today. Pills, not buttons. Tap = Yulia executes. |
| Mobile ≠ Desktop | `feedback_mobile_desktop_separate.md` | Mobile and desktop are separate front-ends. Don't design one and squish it for the other. |
| Two searches | `feedback_two_searches.md` | Sidebar ⌘K (in-app workspace search) vs "Business Search" mode (sourcing engine) are different products. The new mobile Search tab is a third surface again — lookup + comms. |
| Density on resize | `feedback_density_on_resize.md` | Wider viewport = more content, not bigger content. App Store grid pattern. |
| iOS PWA chat sheet | `feedback_pwa_chat_flex_layout.md` | Pure flex column, no position:fixed gymnastics in the chat. |
| Safari toolbar tinting | `feedback_safari_toolbar_tinting.md` | Never `position:fixed` full-viewport divs with bg-color. |

## 5. Deliverables expected from CD

For each surface in §3:
- **HTML mockup** in the matching handoff bundle (`design_handoff_smbx_app store/screen-{name}.jsx` for mobile, `design_handoff_smbx_desktop_material/v6-{name}.jsx` for desktop)
- **Token additions** if needed — slot into existing `:root` (desktop) or `.mobile-root` (mobile) blocks. Keep `--m-*` / `--mb-*` prefix discipline.
- **Component recipes** — diagrams or annotations showing which existing primitives to reuse (`mb-as-card`, `LargeTitle`, `PickRow`, `V6Section`, etc.)
- **Component reuse map** — when a new surface should reuse an existing primitive verbatim, name it. When it needs a new variant, propose the variant in the same component family.

Per-surface **state coverage** (CD should provide all states, not just the happy path):
- Empty state
- Loading state
- Populated state (with realistic sample data)
- Error state where applicable

## 6. Sequencing recommendation

1. **M1 (Library)** — user explicitly called this out as the worst offender
2. **M2 (Search)** — user explicitly called this out
3. **M3 (Today action queue)** — replaces a generic surface in the most-visited mobile tab
4. **D1 (Empty home)** — first thing every cold-start user sees
5. **D7 (Mode root populated states)** — fake-data problem still alive in 4 desktop surfaces
6. **D2, D3 (Gate strip + receipt card)** — visible on every chat session with a deal in scope
7. **D5, M5 (Portfolio overviews)** — only visible to multi-deal users
8. **D10 (SourcingPanel restyle)** — visually orphaned
9. **D4 (Recommended Next pills)** — refinement
10. **D8, D9 (Model + deliverable tab states)** — chrome
11. **D6 (Mode root empty states)** — chrome

## 7. Out of scope for CD

- Agentic tools, server endpoints, gate logic — locked
- Real data wiring (engineering follow-up after CD's design lands)
- Animation timing — honor Emil's curves already in production
- Phase 5 (Merger Pro) and Phase 6 (Merger Governance) — not yet architected

## 8. Files to attach when handing off to CD

- This file (`CLAUDE_DESIGN_BRIEF_NEW_SURFACES.md`)
- All files listed in §1 (handoff bundles, canonical patterns, design tokens map)
- All files listed in §2 (anti-references — what NOT to do)
- Memory files referenced in §4
- `WORKFLOW_AUDIT_USER.md` and `_TRAVEL_LOG.md` for the broader engineering context

## 9. What CD does not need

- The full repo — only the design surfaces and architectural memory
- Database migrations or backend code
- Discussion of API keys, auth, or deployment
