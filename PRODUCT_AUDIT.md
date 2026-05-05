# Product Audit — Surface × Audience × Capability

**Last updated:** 2026-05-05 · **Status:** initial pass for review.

Grounded in: [CLAUDE.md](CLAUDE.md), [METHODOLOGY V17](METHODOLOGY_V17.md),
[SMBX_FEATURE_AUDIENCE_VALUE_MATRIX](SMBX_FEATURE_AUDIENCE_VALUE_MATRIX.md),
[SMBX_PLATFORM_IDENTITY_AND_POSITIONING](SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md),
[SMBX_PLATFORM_REFERENCE](SMBX_PLATFORM_REFERENCE.md).

---

## 0. The headline finding

The shipped app is built around **journey gates** (sell / buy / raise / pmi).
The strategic doc set says the unit of value is **capability** (add-back
analysis, regulatory modeling, screening) consumed by **audience**
(independent sponsor, search funder, broker, principal seller, principal
buyer, etc.). Today's signed-out experience is a buyer-shaped tour through
the journey gates, which is wrong on both axes:

- **Wrong unit.** "5 deals Yulia is working" is a journey artifact, not a
  capability. The matrix says practitioners pay for the *harness around
  capabilities* (add-back, SOP 50 10 8 modeling, screening) — those should
  anchor the home surface, not a generic deal list.
- **Wrong default audience.** "5 deals Yulia is working" assumes the user
  is hunting deals. A principal seller has one deal. An LMM advisor has 20
  client deals. A search funder has zero until they close one.

Below: the rest of the audit in detail.

---

## 1. Audiences (the "who")

From [SMBX_FEATURE_AUDIENCE_VALUE_MATRIX §Framework](SMBX_FEATURE_AUDIENCE_VALUE_MATRIX.md)
and [SMBX_PLATFORM_IDENTITY §POSITIONING_BY_AUDIENCE](SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md):

| # | Audience | Tier | What they're hunting | Pricing target |
|---|----------|------|----------------------|----------------|
| 1 | **Independent sponsors** | T1 | Deals to syndicate, capital partners | $149–499/mo |
| 2 | **Search funders / ETA** | T1 | One business to acquire, then operate | $149–499/mo |
| 3 | **LMM advisors / boutique brokers** | T1 | Client deals — 5–20/yr | $299 / $499/mo |
| 4 | **Corp dev (serial acquirers)** | T2 | Pipeline volume — many tuck-ins/yr | $499 / Enterprise |
| 5 | **Family offices direct-investing** | T2 | A few good deals/yr | Enterprise |
| 6 | **Principal sellers** | Organic | A way to sell their one business | Free → $999 deal fee |
| 7 | **Principal buyers (first-time)** | Organic | A first acquisition without losing their savings | $49 / $149/mo |
| 8 | CPAs / attorneys | Channel | Referrals — never log in themselves | Don't pay |
| 9 | Lenders | Channel | Lead flow | Don't pay (later: enterprise dashboard) |

**Critical** (matrix Decision 5): the product isn't selling AI. It's selling
the **harness** — persistent state, calc engine, document workflows — across
all the capabilities below. ChatGPT can do any one capability. smbX does
all of them, with deal context, on a price you don't have to defend.

---

## 2. Capabilities (the "what") — the actual units of value

From [SMBX_FEATURE_AUDIENCE_VALUE_MATRIX Part 1](SMBX_FEATURE_AUDIENCE_VALUE_MATRIX.md#part-1--the-matrix).
Composite scores out of 25 (P+W+B+C+S = pain + WTP + build-difficulty +
competitor-crowding + smbX-fit). `🔥` = lead-with-this hero for that audience.

### The three capabilities that should be the **homepage heroes**

| Capability | Hero for | Anchor copy |
|---|---|---|
| **Add-back / QoE Lite analysis** | All 7 audiences | *"$25K of decision insurance for $149"* |
| **SOP 50 10 8 / regulatory & structure modeling** | 6/7 audiences | *"Your rollover structure just died. Yulia rebuilds it before your LOI expires."* |
| **Deal screening & triage** | 6/7 practitioner audiences | *"Screen a deal in 90 seconds. The ones worth your time get a memo."* |

### Two underweight capabilities that deserve a secondary hero slot

| Capability | Hero for | Anchor copy |
|---|---|---|
| **Investor memos / LP updates** | IS, search funders, corp dev (21 each) | *"Your quarterly LP update, in 20 minutes"* |
| **LOI / IOI / term sheet drafting** | Principal buyers (20), LMM (19) | *"Your first LOI, drafted, for $149"* |

### Five capabilities to ship as platform depth, not market with

Buyer list building (Grata owns it), Pipeline & CRM (commodity), Valuation
modeling & comps (PitchBook moat), Market research (AlphaSense/Tegus moat),
CIM drafting (LMM hero only — not for buyers). Mention on /features, never
the homepage hero.

### Two capabilities to **not build** for specific audiences

- Pipeline UI for principal sellers — not their pain (they have one deal)
- PMI tooling for LMM advisors — engagement ends at close

---

## 3. Mobile surface audit

The mobile app has 5 user surfaces (+ chat sheet, learn sheet). All five
today are written for a buyer hunting deals.

### 3.1 Today ([Today.tsx](client/src/components/v6/mobile/screens/Today.tsx))

**Anon content:** Welcome hero · Try-it-free CTA · Explore SMBX (4 rows) ·
5 sample pipeline deals · Review-3-picks teaser.

**Authed content:** Daily hero (top pick deal) · 5 pipeline deals · 3 picks
· ABOUT SMBX (How it works · Pricing · Compare plans).

| Audience | Useful? | What's wrong |
|---|---|---|
| Independent sponsors | Partially | "5 deals working" maps to portfolio. But the daily hero shows ONE deal, not portfolio health. No add-back / SOP signal. |
| Search funders | Mostly | Closest match — they hunt deals. But top pick + 3 picks is too thin; they want screening throughput. |
| LMM advisors | No | They have 5–20 client deals each at different stages. "5 deals Yulia is working" implies *Yulia's* picks. They need *their client deals*. |
| Corp dev | No | They run 20+ deals. "5 working" undersells. No screening volume hint. |
| Family offices | No | They're not browsing; they're triaging. |
| Principal sellers | No | They have ONE deal (their business). "5 deals Yulia is working" is irrelevant + confusing. |
| Principal buyers | Yes | Closest match. Watching/screening is exactly their workflow. |

**What's good universally**
- Welcome hero copy is broad enough to flex per audience.
- Card pattern (texture + bezel + lifted shadow) is visually solid.
- Brief teaser ("Review 3 picks in 5 minutes") is the right *form* — small,
  tappable, ranked — but the content is buyer-only.

**What's broken / wrong**
- Authed user lands in a sales funnel (ABOUT SMBX = How it works · Pricing
  · Compare plans). Should be persona-tip chips: *How Yulia recasts your
  P&L*, *When to walk from a deal*, etc.
- "5 deals Yulia is working" assumes buyer.
- "Today's top pick" — the hero is a single deal card. For an advisor or a
  seller, the hero should be different (most-engaged buyer / weakest gate /
  client deal needing attention).
- No surface for the **hero capabilities** (Add-back analysis, SOP 50 10 8,
  Screening). These should be one-tap entry points from Today, since
  per the matrix they're the reasons people pay.

**Audience bias today:** ~85% buyer / search funder.

### 3.2 Pipeline ([Pipeline.tsx](client/src/components/v6/mobile/screens/Pipeline.tsx))

Filter chips · NEW TODAY hero · stage-filtered list. Just shipped chip
filtering and Watch toggle.

| Audience | Useful? | What's wrong |
|---|---|---|
| Independent sponsors | Yes | Chips map to their funnel. |
| Search funders | Yes | Same. |
| LMM advisors | Partially | Chips are buy-side stages (Sourced/Screened/etc.). They want sell-side stages: NDA/IOI received/LOI in talks/DD/Closing. |
| Corp dev | Yes | Chips align. Want bigger volume + filters. |
| Family offices | Yes | OK. |
| Principal sellers | **No** | Per matrix Decision 5: "Don't build seller-facing pipeline UI." A seller has one deal; pipeline is the wrong primitive. They want **buyer interest dashboard** instead. |
| Principal buyers | Yes | Aligned. |

**What's good**
- Chips actually filter (just shipped).
- Watch toggle on `watch` verdicts works.
- "Yulia is watching" chevron opens the full list page.

**What's broken / wrong**
- Pipeline is **buy-side phrased**. LMM advisors and (if they had a tab)
  raisers need different stage labels.
- For sellers: do not build. Instead, when a seller lands on the Pipeline
  tab, show "Your buyers" — a list of buyer entities + NDA / IOI / LOI
  state per buyer. Different primitive (entities, not deals).

**Audience bias today:** ~85% buy-side practitioners.

### 3.3 Brief ([Brief.tsx](client/src/components/v6/mobile/screens/Brief.tsx))

Editorial hero ("Three worth your 10 minutes") + ranked picks.

| Audience | Useful? | What's wrong |
|---|---|---|
| Independent sponsors | Yes — picks = top deal flow | Ranking criteria opaque |
| Search funders | Yes | Same |
| LMM advisors | Partially | They want "where are my deals stuck" not picks |
| Corp dev | Yes | Aligned |
| Family offices | Yes | Aligned |
| Principal sellers | **No** | Picks = candidate deals. They want *buyer engagement signals* + *next actions on their sale*. |
| Principal buyers | Yes | Aligned |

**What's good**
- The editorial card pattern is a great daily-intel container.
- Ranked picks render cleanly.

**What's broken**
- "Three picks" framing is buy-side. Should be reusable framework: *three
  pieces of intel that matter today*, content varies per audience.

**Audience bias today:** ~80% buy-side.

### 3.4 Detail ([Detail.tsx](client/src/components/v6/mobile/screens/Detail.tsx))

Floating back/share · hero (icon + title + Pursue badge + Watch toggle) ·
stats strip · tag chips · "What's Yulia saying" · 4 artifact previews.

| Audience | Useful? | What's wrong |
|---|---|---|
| Independent sponsors | Yes | Detail-as-deal works |
| Search funders | Yes | Same |
| LMM advisors | Yes for client deal | Subject is "their client's deal" — same shape |
| Corp dev | Yes | Same |
| Family offices | Yes | Same |
| Principal sellers | Mismatch | Subject is *their own business*, not a candidate deal. Stats (Norm SDE, Multiple, Fit, Rank) need to become asking-side: Asking · Days listed · Buyer count · Highest IOI. Verdict (Pursue) doesn't apply. |
| Principal buyers | Yes | Aligned |

**What's good**
- Page architecture (hero + stats strip + narrative + artifact rail) is
  reusable across subjects.
- Watch toggle and Share work.

**What's broken**
- "FIT SCORE" + "Pursue" are buy-side. For a seller looking at their own
  business, fit doesn't apply.
- Artifact set is buy-side (Recast · Baseline · Buyers · IOI). Sellers
  want Recast · CIM · Buyer list · LOI. Raisers want Recast · Pitch
  deck · Investor list · Term sheet.

**Audience bias today:** ~85% buy-side.

### 3.5 Watching (just shipped, [Watching.tsx](client/src/components/v6/mobile/screens/Watching.tsx))

Hero header · gold marble editorial card · ranked deal list · Watch toggle.

| Audience | Useful? | What's wrong |
|---|---|---|
| Most | Yes | Pattern works |
| Principal sellers | Mismatch | They'd watch *buyers*, not deals |
| Raisers | Mismatch | They'd watch *investors* |
| PMI | Mismatch | They'd watch *risks/dependencies* |

The screen architecture is universal; the items are typed wrong.

### 3.6 Chat (ChatSheet) and Learn (LearnSheet)

Chat is broadly persona-neutral (Yulia adapts conversationally). Suggestion
chips on mount lean buyer. Learn (`/how-it-works`, `/pricing`) is marketing
content — universal, fine.

---

## 4. Desktop surface audit

### 4.1 V6 SearchRoot (signed-out home)

Welcome card + 5 ranked deals · "PIPELINE · 5 IN REVIEW" 6 cards · "YULIA
IS WATCHING · 87 SOURCES" 2-col rows · Recently closed.

**Same buyer skew as mobile Today.** Plus: the deal-source rows (BizBuySell,
LoopNet, Axial) are pure buyer territory — they're aggregator sites buyers
crawl. Sellers don't read BizBuySell looking for buyers. Raisers don't
read LoopNet for investors.

### 4.2 Sidebar ([Sidebar.tsx](client/src/components/v6/Sidebar.tsx))

Search ideas (mode-aware) · ABOUT SMBX learn chips. **Same authed-user-in-
sales-funnel problem as Today.** Replace ABOUT SMBX with persona tips.

### 4.3 Tabbed canvas (modes)

Canvas is universal. Mode content (Search / Docs / Analysis / Intel /
Library) is buyer-biased today.

---

## 5. Intended state — per surface × per audience

### Today

| Surface element | Independent Sponsor | Search Funder | LMM Advisor | Corp Dev | Family Office | Principal Seller | Principal Buyer |
|---|---|---|---|---|---|---|---|
| Hero | Portfolio dashboard — 3 numbers (deals open, IRR YTD, dry powder) | This week's hunting plan + 1 lead deal | "Your client deals — 3 stuck, 2 closing this month" | Pipeline volume + this week's screening throughput | "Today's two memos to read + one IC prep" | "Where your sale stands" — current gate, days, next milestone | "Today's top pick" |
| Daily intel | "3 deals worth your 10 min" — top fits | Same | "3 client deals needing attention" | "Top of funnel — 14 new screens overnight" | "3 memos requiring partner review" | "3 buyer signals" — who looked, who NDA'd, who's silent | "3 picks worth your 10 min" |
| Hero capability tile | **Add-back / QoE Lite** | **Add-back / QoE Lite** | **CIM drafting** | **Add-back / Screening throughput** | **Memos / IC drafting** | **ValueLens / VRR** (their entry point) | **Deal screening — paste a listing URL** |
| Secondary capability tile | **SOP 50 10 8 modeler** | **SOP 50 10 8 modeler** | **DD coordination** | **Memos / LP updates** | (less universal — mostly DD) | **CIM-grade business summary** | **SOP 50 10 8 modeler** (SBA buyers) |
| About / Learn chips | "How Yulia thinks about screening" / "Reading the Fit Score" / "When to walk" | Same + "Your IC memo workflow" | "Reducing CIM time to hours" / "Reading buyer interest" / "Closing faster" | "Memos in 20 min" / "Pipeline volume tactics" | "What our memos look like" / "DD coordination" | "What buyers actually look at" / "Negotiating the first IOI" / "When you need a broker" | "How Yulia scores a deal" / "Capital stack 101" / "Your first LOI" |

### Pipeline

| Element | T1 buy-side practitioners (IS, Search, Corp Dev, FO) | LMM Advisors | Principal Sellers | Principal Buyers |
|---|---|---|---|---|
| Stage chips | Sourced · Screened · In review · Pursuing · Watching | NDA · IOI received · LOI in talks · DD · Closing (sell-side) | **Don't build** — show "Your buyers" instead | Sourced · Screened · In review · Watching |
| Items | Deals | Client deals (with client tag) | Buyer entities + their state | Deals |
| Hero | NEW TODAY featured pick | Most engaged client/deal this week | Most engaged buyer this week | NEW TODAY featured pick |

### Brief

| Element | Practitioner audiences (1–5) | Principal Sellers | Principal Buyers |
|---|---|---|---|
| Editorial hero | "Three worth your 10 minutes today" | "What's moving on your sale" | Same as practitioners |
| Ranked list | Picks (deals) | Buyers ranked by engagement | Picks (deals) |

### Detail

Subject of detail varies. The architecture is reusable; the *type* of
subject changes:

| Audience | Detail subject | Stats | Verdict | Artifact rail |
|---|---|---|---|---|
| Buy-side practitioners | A target deal | Norm. SDE · Multiple · Fit · Rank | Pursue / Watch / Pass | Recast · Baseline · Buyers · IOI |
| LMM advisors | A client deal | Asking · Buyer count · Days listed · Highest IOI | (advisor's recommendation) | Recast · CIM · Buyer list · LOI |
| Principal sellers | Their business | Asking · Days listed · Buyer count · Highest IOI | (n/a — it's their company) | Recast · CIM · Buyer list · LOI |
| Principal buyers | A target deal | Norm. SDE · Multiple · Fit · LBO Result | Pursue / Watch / Pass | Recast · Baseline · Capital stack · LOI |
| Raisers | Their company | Round size · Soft-circled · Days remaining · Term variance | (n/a) | Recast · Pitch deck · Investor list · Term sheet |
| PMI | An integration workstream | Days in · % complete · Risk flags · Owner | On track / At risk / Blocked | 100-day plan · Scorecard · Sync notes · Owner comms |

### Watching

Watchlist becomes typed: watch a deal, a buyer, an investor, or a risk.

### Authed Learn / "Get to know the app"

Replace all four "ABOUT SMBX" chips post-login. Per persona-tip chips above.

### Capability shortcuts (new surface)

Today and SearchRoot need a band of **hero capability shortcuts** — direct
entry points to the matrix's hero capabilities:

- 🔥 **Run an add-back analysis** (paste P&L → output: Adjusted EBITDA + flags)
- 🔥 **Model an SBA structure** (deal $ + buyer equity → output: structure scenarios)
- 🔥 **Screen a deal** (paste teaser/URL → output: classification + range + 3 questions)

These are the matrix's hero capabilities. Today they're buried inside chat.
They should be one-tap from the home surface.

---

## 6. Gaps (what we don't have today)

1. **No audience signal in the data model.** `User` doesn't carry a primary
   audience tag. No code reads "is this user a search funder or a broker?"
2. **No audience routing.** All authed users land on the same Today.
3. **No audience-specific sample data.** [`sampleDeals.ts`](client/src/lib/sampleDeals.ts)
   is buy-side only.
4. **No audience-aware copy layer.** Section titles, eyebrows, CTAs
   hardcoded to buyer language across [`Today`, `Pipeline`, `Brief`].
5. **No audience capture in onboarding.** Yulia detects role conversationally
   (Phase 1 "trap door" per METHODOLOGY V17), but the answer doesn't write
   to a place the UI can read.
6. **No surfaces for the matrix's hero capabilities.** Add-back analysis,
   SOP 50 10 8 modeling, and screening are buried inside chat. The matrix
   says these are the homepage heroes. Today they have no direct entry.
7. **Detail page assumes a deal subject.** A seller's "detail" is *their*
   business; PMI's is a *workstream*. Schema doesn't distinguish.
8. **Watch list assumes deals.** Just shipped; correct for buy-side only.
9. **Authed users see sales chips post-login.** ABOUT SMBX → How it works /
   Pricing / Compare plans. Wrong post-login. Should be persona tips.
10. **Pipeline tab is wrong primitive for principal sellers.** Per matrix,
    don't build; replace with "Your buyers."
11. **Yulia's voice across the app's static copy doesn't match the
    [positioning doc](SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md#yulia-voice).**
    Direct, specific, not deferential. Some app copy still hedges.

---

## 7. Roadmap (prioritized, cheapest first)

Each item small enough to ship in one focused session.

### P0 — Foundation (invisible but unlocks everything)

1. Add `audience` field to user model + DB migration. Type:
   `"independent_sponsor" | "search_funder" | "lmm_advisor" | "corp_dev" |
   "family_office" | "principal_seller" | "principal_buyer"`.
2. `useAudience()` hook reading user (authed) or localStorage (anon).
   Default `"principal_buyer"` (lowest-risk default for the test drive
   per matrix audience #7).
3. Anon **audience switcher** — top-right pill on Today letting a signed-out
   visitor flip between audiences. Powers a real test drive without an
   account.

**Effort:** ~1 day. **Risk:** low. **Visible win:** none yet.

### P1 — Persona-aware copy + capability shortcuts (the visible win)

1. `lib/copy.ts` resolver — every section title, eyebrow, hero subtitle,
   CTA mapped per audience.
2. Today renders audience-conditioned hero, daily intel, learn chips.
3. Replace authed "ABOUT SMBX" with persona-tip chips per §5.
4. Add **hero capability shortcut band** to Today (Add-back · SOP 50 10 8 ·
   Screen a deal). One tap → opens chat with the right starter prompt.

**Effort:** ~2–3 days. **Risk:** low — additive; current buyer flow stays.

### P2 — Audience-typed Pipeline

1. Stage chips driven by audience (buy-side / sell-side / raiser).
2. LMM advisor variant: client deals with client tag.
3. Principal seller variant: **don't build pipeline**; render "Your buyers"
   instead — list of buyer entities + NDA/IOI/LOI state per buyer.
4. PMI: workstream board (or hide tab if PMI on mobile is descoped).

**Effort:** ~2 days. **Risk:** medium — seller "Your buyers" is a new
data shape. PMI needs design decisions.

### P3 — Per-audience anon sample data

1. Split [`sampleDeals.ts`](client/src/lib/sampleDeals.ts) into
   `samples/{buy,sell,raise,advisor,sponsor,searcher,corp_dev}.ts`.
2. Each surface reads via `useAudience()`. The anon switcher in P0 then
   actually changes the content.

**Effort:** ~2 days. **Risk:** low. Pure data.

### P4 — Detail and Watching variants

1. Detail reads subject kind (deal / business / round / workstream) and
   renders the right stats / verdict / artifact rail.
2. Watch list becomes typed (deal / buyer / investor / risk).

**Effort:** ~3 days. **Risk:** medium — schema migration territory.

### P5 — Onboarding audience capture

1. First-chat ("trap door" per METHODOLOGY V17 Phase 1) writes detected
   audience to user record.
2. Sign-up flow has an explicit audience step before landing on Today.

**Effort:** ~2 days. **Risk:** low. Yulia already detects this; just need
to capture.

### P6 — League layering (later)

Sophistication tiers L1–L6 from CLAUDE.md / METHODOLOGY. Layer copy + math
depth on top of audience routing.

### P7 — The capability heroes as first-class surfaces

The matrix's hero capabilities deserve dedicated routes:

- `/add-back` — paste P&L → adjusted EBITDA + flags. This is the
  "$25K-of-decision-insurance-for-$149" demo.
- `/sba-structure` — deal terms → restructured scenarios under SOP 50 10 8.
  Highest-scoring single capability in the matrix. Not built yet.
- `/screen` — paste a listing URL → classification + range + 3 questions.
  Activation hero per matrix.
- `/lp-update` — context → quarterly LP update template. Underweight per
  matrix.
- `/loi-draft` — terms → first-draft LOI. "Your first LOI for $149" angle.

**Effort:** highly variable per capability. Add-back has most plumbing
already; SBA structure modeler is a green-field build that the matrix says
is the highest-value single thing we could build.

---

## 8. Open questions (need product input)

1. **Audience overlap.** Can a search funder ALSO be a PMI user post-close?
   Yes per positioning. So we need either an audience SWITCHER for
   authed users or a journey-state derived from current activity.
2. **Default anon audience.** Currently buyer. Matrix Decision 4 says we
   should test multiple. The audience switcher (P0.3) lets us A/B this.
3. **PMI on mobile.** Per matrix, PMI scores 17–19 only for search funders
   and corp dev — and only post-close. Is mobile right for PMI at all,
   or is it a desktop-only flow? Decision pending.
4. **Cut Pipeline tab for sellers entirely?** Per matrix Decision 2:
   "Don't build seller-facing pipeline UI." Implies the whole Pipeline tab
   should hide for principal sellers and be replaced with a "Your buyers"
   tab. Confirm.
5. **Audience capture trigger.** First-chat detection vs sign-up form. The
   former feels more on-brand (Yulia asks); the latter is more reliable
   data. Probably both: signup gives a hint, Yulia confirms in chat.
6. **Capability shortcut band on home — where exactly?** Above the daily
   hero? Below? Replacing "Explore SMBX"? Design decision.
7. **Yulia voice audit.** The static app copy across screens needs a pass
   against the [positioning doc's Yulia voice](SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md#the-yulia-personality-for-copy-consistency)
   rules. Is that a separate sweep?

---

## 9. Recommendation: build P0 + P1 + P7-add-back next

The minimum viable persona experience:

1. **P0** ships the audience signal + anon switcher (~1 day).
2. **P1** ships audience-aware copy + the capability shortcut band on
   Today (~2–3 days). Sellers stop seeing "5 deals Yulia is working."
   Buyers don't lose anything.
3. **P7-add-back** ships the matrix's #1 hero capability as a first-class
   route (~2 days). This is the "$25K of decision insurance for $149"
   demo the matrix says we're undermarketing.

Together, ~5–6 days of focused work for a step-change in how the app feels
to a non-buyer. After this lands, validate with real users, then iterate
into P2 / P3 / P4 driven by what feedback says.

The two big strategic decisions ahead:

- **Audience modeling vs persona modeling.** The matrix prefers audience
  (independent sponsor, search funder, LMM advisor); CLAUDE.md / METHODOLOGY
  use journey (sell, buy, raise, pmi). Audience is the higher-resolution
  cut and what the matrix scores against. I'd recommend audience as the
  primary axis and journey as a secondary attribute (most audiences map to
  one or two journeys — a search funder is "buy then PMI"; an LMM advisor
  is "sell" only). The data model should carry both.
- **Capability surfaces vs journey surfaces.** Today's app is built around
  journey gates (Pipeline tab = funnel stages). The matrix says capabilities
  are the unit of value. Both should coexist — Pipeline gives the journey
  view; the new capability shortcut band on Today gives the "do real work"
  entry. The latter is the matrix's prescription and is currently missing.

---

*Companion doc to this audit: as we make screen-level changes, log them in
[V6_MOBILE_WIRING_LOG.md](V6_MOBILE_WIRING_LOG.md) so future sessions can
trace what's been wired against this audit.*
