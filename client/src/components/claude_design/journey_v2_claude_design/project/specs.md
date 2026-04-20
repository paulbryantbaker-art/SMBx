# smbX public journey — handoff specs

One file per page. Each section below is the spec for a single route. The visual pattern is already codified in `deal-room.css` + `deal-room.js`; these specs describe **content, data shape, and behavior** for each route.

## Shared chrome (all pages)

- **Top nav** (`.dr-top`): logo (left) · page nav · Sign in + primary CTA (right). Sticky, 56px.
- **Section nav** (`.dr-nav`): inline anchors under top nav, sticky. `data-jump="<id>"` smooth-scrolls.
- **Left rail** (`.dr-rail`): 380px, sticky. Avatar + "Yulia" + status + LIVE DEMO badge. Chat scroller. Input + quick-chip row.
- **Stage** (`.dr-stage`): flex:1, scrollable. N × `<section class="dr-step" id="sN" data-step="N">` followed by one `#close` section with `.dr-bottom`.
- **Chat rail behavior** (`deal-room.js`): observes `.dr-step[data-step]` intersection and types `window.SCRIPT[N]` entries into the rail when step N becomes active. Opening message = `window.OPENING`. Generic reply = `window.REPLY`. Chips + forms post a user bubble then echo the reply.

---

## / (Home) + /sell

**Goal:** First-time seller goes from "I might sell one day" → submits company facts into the bottom chat.

**Arc** (4 steps):
1. **Add-backs** — Defensible add-back schedule table. Rows: owner comp above market, personal vehicles, spouse on payroll. Totals into "Blind Equity™ +$47K". Feels like an audit output.
2. **Readiness score** — Large circular score (75/100) + 6-dimension list with colored dots. Revenue quality, margins, concentration, owner dependency, management depth, financial integrity.
3. **CIM preview** — 2-page CIM thumbnails in a neutral gray frame. Exec summary + growth levers. Establishes craft.
4. **IOI comparison** — 3-card comparison (family office / strategic / PE roll-up). Middle one highlighted as Yulia's pick. Bottom row: her take on after-tax outcomes.

**Bottom close:** "Paste revenue, industry, reported EBITDA." Input promises a value range + add-back list + readiness score in ~20 min.

**Data shape** (what backend must supply for real pages):
```ts
type SellPageData = {
  addbacks: { title: string; sub: string; amount: number }[];
  addbacksTotal: number;
  readiness: { score: number; dims: { label: string; value: number; tone: 'green'|'amber'|'red' }[] };
  cimPages: { n: string; title: string; kpis?: { label: string; value: string }[] }[];
  iois: { buyerType: string; price: string; terms: string; highlighted?: boolean }[];
  yuliaTake: string;
};
```

**Chat script:** 4 entries keyed 1–4. Use `{who:'y',text}` for Yulia, `{who:'me',text}` for simulated user. HTML in `text` allowed for `<strong>`.

---

## /buy

**Goal:** Searcher / independent sponsor submits a thesis in the bottom chat to get a ranked target list.

**Arc:**
1. **Sourcing** — Row-list of 3 named off-market targets (e.g., "Atlas Air · Fort Worth · $6.2M rev · Fit 94") + "44 more matching thesis" footer row.
2. **Rundown score** — Same circular score + dimensions pattern as sell-side readiness, but with buy-side dimensions (financial quality, margin stability, customer concentration, recurring revenue, owner dependency, integration fit).
3. **DD workstreams** — 2-col grid of 8 workstream tiles. Each: name + status chip (DONE/LIVE/QUEUED). Closing flag callout underneath.
4. **LOI structures** — 3-card structure comparison: Aggressive / Recommended (dark, featured) / Conservative. Each card: price, terms, one-line rationale. Yulia's-take callout.

**Bottom close:** "Industry, geography, check size."

**Data shape:**
```ts
type BuyPageData = {
  sourcing: { name: string; location: string; meta: string; fit: number }[];
  sourcingMoreCount: number;
  rundown: { score: number; verdict: 'Pursue'|'Evaluate'|'Pass'; dims: Dim[] };
  workstreams: { name: string; status: 'DONE'|'LIVE'|'QUEUED'; due?: string }[];
  flag: string;
  lois: { label: string; price: string; terms: string; featured?: boolean }[];
  yuliaTake: string;
};
```

---

## /raise

**Goal:** Owner deciding between full sale vs. minority recap. Submits EBITDA + cash need + ownership preference.

**Arc:**
1. **Structure comparison** — 5-row table: structure / cash today / retained equity / 5yr upside (P50) / control. Minority recap row highlighted (inverted dark). Yulia's take underneath.
2. **Cap stack** — Horizontal bar stack: sponsor equity / preferred / unitranche / ABL. Each row shows dollar amount + % + terms. Stress-test callout underneath.
3. **Deck preview** — 3-slide thumbnail grid (thesis / unit economics / use of proceeds) in a gray frame. Draw fake bar charts with inline divs.
4. **Investor map** — Row-list of 3 named firms + "20 more qualified" footer. Each: name, check size, track record, warm intro note, fit score.

**Bottom close:** "EBITDA, cash need, ownership preference."

**Data shape:**
```ts
type RaisePageData = {
  structures: { name: string; cash: string; retained: string; upside: string; control: string; featured?: boolean }[];
  capStack: { layer: string; amount: string; pct: string; terms: string; tone: 'black'|'dark'|'mid'|'light' }[];
  stressNote: string;
  deckSlides: { n: string; title: string; body: string }[];
  investors: { name: string; meta: string; fit: number }[];
};
```

---

## /integrate

**Goal:** Recent acquirer gets a Day-0 checklist + 180-day plan by sharing LOI + QoE + one-line thesis.

**Arc:**
1. **Day 0** — 8-tile grid of pre-close / week-one tasks with DONE / AT RISK / QUEUED status chips. At-risk flag callout underneath.
2. **180-day plan** — 6-row progress-bar gantt: pricing reset, MSA renewals, service mgr hire, route optimization, tuck-in #1, billing cutover. Each with % progress + target day.
3. **Key-person retention** — Row-list of 3 critical / elevated employees + retention package draft row. Replacement cost + flight-risk call-outs.
4. **Thesis scorecard** — 4-tile KPI grid: EBITDA, recurring mix, top-3 concentration, FCCV. Each: tone (on plan / ahead / drift) + current value + thesis target. Drift flag callout.

**Bottom close:** "Deal size, industry, thesis in one line."

**Data shape:**
```ts
type IntegratePageData = {
  day0: { task: string; status: 'DONE'|'AT_RISK'|'QUEUED'|'SCHEDULED'; due?: string }[];
  day0Flag: string;
  plan180: { workstream: string; progress: number; due: string }[];
  keyPeople: { name: string; role: string; tenure: string; meta: string; risk: 'CRITICAL'|'ELEVATED' }[];
  retentionDraft: { person: string; package: string };
  kpis: { label: string; value: string; target: string; tone: 'ON_PLAN'|'AHEAD'|'DRIFT' }[];
  driftFlag: string;
};
```

---

## /how-it-works

**Goal:** Explain the product. No journey arc — it's an explainer. Drop the per-section SCRIPT; rail becomes "ask anything" with open prompt chips.

**Sections:**
1. **What Yulia does** — 6 operator cards (Yulia / Marcus / Priya / Wei / Arjun / Lena). Each: name, role, one-sentence description. Positions the product as a team of named specialists.
2. **The IB stack** — 6-row comparison table: workstream / what a banker does / what Yulia does / benchmark. Hard-numbers column establishes credibility.
3. **The math** — 3 formula blocks (valuation / readiness / FCCV stress). Rendered in `<pre>` with JetBrains Mono on black. Shows our work.
4. **Sample conversation** — ~8-message transcript in chat-bubble style. Verbatim real conversation, not a demo.

**Bottom close:** "Ask Yulia anything — or paste your situation."

---

## /pricing

**Goal:** Router. Send first-timers to Explore (free), active deals to Deal, firms to Firm. Don't let anyone overbuy.

**Sections:**
1. **Which tier?** — Single lede paragraph. Rail's chips drive the router.
2. **Plans** — 3-card grid: Explore (free) / Deal ($2,400/mo, featured dark) / Firm ($9,800/mo). Each: tier name, price, descriptor, 5–7 feature bullets, CTA button.
3. **Compare** — 12-row feature-matrix table. ✓ / — / specific values per tier. No asterisks, no "contact us".
4. **FAQ** — 4 cards: success fees, when to upgrade, legal counsel, what if deal doesn't close.

**Bottom close:** "Buying, selling, raising, or still deciding?"

---

## /enterprise

**Goal:** Book a call with firms (PE, search funds, family offices, boutique banks). Show real use cases + ROI math.

**Sections:**
1. **Who uses smbX at scale** — 10-logo grid (placeholder firm names in Sora, 5 per row).
2. **Use cases** — 4 case cards, each: big stat (left, 180px), firm-shape title, customer quote, attribution. Stats: 3.2× deals/yr, −$1.4M diligence, 11 days close-to-monday-1, 6→14 concurrent mandates.
3. **Team workspace** — Pipeline mock: 4 named projects + "10 more in sourcing". Each: project, type, status chip.
4. **ROI** — 6-tile grid of numbers vs. status quo. Last tile inverted dark (annual platform cost). Ends on "$118K vs $1.4M freed capacity".

**Bottom close:** "Firm type, team size, deals per year."

---

## Build notes

- **Content-first rendering.** Every page is static HTML generated server-side from the data shapes above. No hydration needed for the demo chat — `deal-room.js` wires everything with IntersectionObserver + native DOM.
- **Real chat.** When replacing the scripted demo, the rail input posts to your Yulia endpoint. Preserve the scroll behavior (smooth, bottom) and the 3-dot typing indicator (`.dr-rail__typing` already styled).
- **Benches are flexible.** Every `.dr-bench` is just: `.dr-bench__head` (title + meta) + `.dr-bench__body` (whatever content). Reuse freely; no page is locked to a bench shape.
- **Explainer pages** drop per-section SCRIPT entries; rail becomes "ask anything" with open prompt chips. `deal-room.js` handles empty SCRIPT gracefully.
- **Bottom close form** on every page posts to the same onboarding endpoint. Keep the "Start free →" copy consistent with the top-nav CTA.
- **Mobile.** Not addressed here — these are desktop journey pages. Mobile remains the existing single-column stack in the React codebase.
