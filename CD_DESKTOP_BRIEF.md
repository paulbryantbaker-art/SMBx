# smbx.ai Desktop — Claude Design brief (Claude-Desktop direction)

> For Claude Design. This locks the aesthetic direction you've been exploring (the
> "Mandate" monochrome, agent-first mockups) **and** grounds it in the real smbx.ai
> product so your next mockups translate 1:1 to code. Read §1 before designing — the
> last round broke because mockups designed for data the app doesn't have.

## 0. One line
The smbx.ai desktop app should look and feel like the **Claude Code / Claude Desktop app**: a calm, **monochrome, agent-first** workspace where **Yulia** (the AI deal agent) is the operating surface. **Chat is home**; deals open into a clean numbered workspace and a split analysis canvas. Color is rationed to status/risk only. Your recent mockups are the right direction — this brief makes them real.

## 1. What you're designing for (design only what binds to this)
- **smbx.ai** — AI M&A deal-intelligence for acquisitions/sales/raises from $300K to mega-cap. Users talk to **Yulia**, who runs the deal work: source, value, diligence, draft, close, integrate.
- **Naming:** the app is **smbx.ai**; the agent is **Yulia**. Your mockups' "Mandate" / "Agent" / "Ask the agent" are placeholders → use **smbx.ai** and **"Ask Yulia"**. (Keep the clean "M"-style mark if you like it as smbx's mark.)
- **THE LINE (product law):** Yulia shows **analysis, options, and implications; the user decides.** She never recommends a regulated transaction decision, never negotiates / contacts counterparties / takes custody / signs / files, gives no legal/tax/appraisal opinions, and charges no success/referral/deal-value fees. Your mockup line **"the agent asks before anything irreversible"** is exactly this — make it a **first-class pattern** (see §6, staged-confirm).
- **Honesty law:** every number, chart, list is **REAL or honestly empty**. No fabricated charts/IRRs/tickers/activity. Where a live feed doesn't exist yet, show an honest **"no live feed yet"** state, not a fake line. (Your greyed football-field / valuation-range placeholders are *perfect* as honest empty states — label them as such.)
- **Money** is always real, formatted from integer cents.
- **Pricing:** flat monthly subscription — Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise. **No per-deal or success fees, ever.**
- **Desktop only** for this brief. Mobile is a separate surface — don't design it here.

## 2. Home model (decided)
- **Home = Ask Yulia** (the copilot/chat). Opening the app lands here.
- **Overview** is a second surface, **one click away** — a compact, scannable portfolio (deals table + what-needs-you + KPIs). **Not** a wall of big per-deal cards (that was the prior failure). Agent-first, with a glanceable portfolio when wanted.

## 3. Journeys & stages (the spine of the nav)
Top-level journeys: **SELL, BUY, RAISE, PMI**. Each deal lives in one journey and moves through stages. Your pipeline rail (Sourcing → Analysis → Closing → Post-merger) is the **BUY** lifecycle — use it as the hero example, but design the rail to be **journey-aware** (it reads the active deal's journey):
- **BUY:** Thesis · Sourcing · Valuation · Diligence · Structuring · Closing (· PMI)
- **SELL:** Intake · Financials · Valuation · Packaging · Market matching · Closing
- **RAISE:** Intake · Financial package · Investor materials · Outreach · Terms · Closing
- **PMI:** Day 0 · Stabilization · Assessment · Optimization

The left-rail "PIPELINE" stages show **live counts** of items in each stage for the active mandate/portfolio.

## 4. Aesthetic (lock this)
- **Monochrome base:** near-black ink, white / off-white surfaces, a 3–4 step cool-grey scale for hairlines + secondary text. Calm, Claude-Desktop / Linear / Notion energy.
- **One accent:** a single restrained **violet/indigo** for Yulia/agent moments (the sparkle, active nav item, primary affordance) — used sparingly. The **primary button is near-black** (your "New analysis" button), not the accent.
- **Color is rationed to meaning** — status / verdict / risk only: green (qualified · pursue · positive), amber (watch · medium · caution), red (flagged · high · risk · negative). Never decorative.
- **Type:** a clean grotesk sans for body/UI; **IBM Plex Mono (or similar) for labels, numbers, and the uppercase micro-eyebrows** ("ENTERPRISE VALUE", "THESIS RISKS · 3", "OWNER SIGNAL", "RANKED BY FIT"). Numbers tabular.
- **Density & craft:** generous whitespace, **hairline 1px dividers**, lightly **bordered** cards (no heavy shadows), ~8px radii, quiet hover states. **Tables over cards** for any list.
- **Eyebrows are GOOD here:** unlike the previous direction, the uppercase-mono section labels ARE the design language — keep them; they're informational, not filler.

## 5. App shell & navigation
- **Left sidebar** (~240px, collapsible): smbx mark + name · **New deal** · **Search ⌘K**. Then **PIPELINE**: **Ask Yulia** (home), then journey stages with live counts (Sourcing 34 · Analysis 12 · Closing 5 · Post-merger 3). Then **DEALS**: active deals (mark + project name + target co). User footer (avatar · name · firm · presence dot).
- **Top bar** (per surface): deal identity (mark + "Project Atlas · Northwind Logistics · buy-side") · stage breadcrumb (Sourcing · **Analysis** · Closing · Post) · collaborator avatars (real deal team) · Share · overflow.

## 6. Surfaces to design (each: real data + loading/empty/error states)

**A · Ask Yulia — HOME (copilot).** Chat is home; Yulia **plans → acts → reports**. Keep the whole pattern from your mockups:
- User asks → Yulia replies with a **work checklist**: each step a row (checkbox done ✓ / running ●) + title + sub-line of what it did + count chip ("Parsed mandate into 6 criteria · 6/6", "Screened 4,210 companies · 23 matches", "Scoring fit · running").
- Inline **result previews** (Top matches ranked by fit, mini fit bars).
- Closing summary + **action chips** ("Draft outreach to top 8", "Add sensitivity table", "Export memo to PDF"). Mutating/outward actions are **confirm-first** (§7).
- Composer: "Ask Yulia to source, analyze, draft, or close…" + Data room attach, @mention, journey/stage selector, send.
- Footer law line: **"Yulia can act across Sourcing, Analysis, Closing & Post-merger. She asks before anything irreversible."**
- Binds to: the conversation thread + the real agentic tool-trace (the checklist = real tool steps) + deal context.

**B · Overview (the light dashboard, 1 click from home).** Compact and scannable:
- **Active deals table** — Deal (mark + name + target·sector) · Stage (pill) · EV · a real secondary metric (open items / next gate) · status. Sortable/filterable; rows open the deal workspace.
- **What needs you** — the real gate-countdown next-actions (deal · stage · action · urgency), capped to what's actionable, "view all".
- KPI strip (real: active mandates, aggregate EV, tasks due). Honest "—" where no backend (e.g. portfolio IRR).
- Optional tiles: sector donut (real), "market pulse" = real **sector heat** (not fake stock tickers), recent activity = real events (gate advances, deliverables, comments) or honest empty.

**C · Sourcing.** Your screening table (it's great):
- Agent banner: "I screened 4,210 companies and ranked 23 matches. 8 are ready for outreach — want me to draft personalized notes?" + Dismiss / **Draft outreach** (confirm-first).
- Filter chips (Cold-chain · $20–80M rev · Founder-owned · EBITDA+ · + Add filter) · sort · list/grid toggle.
- Table: Company (avatar + name) · Location · Revenue · EBITDA · Owner signal · **Fit** (score + bar) · **Status** (Outreach sent · Qualified · Flagged · New · Screening). Real candidate data from the sourcing engine; "—" where unknown.

**D · Deal workspace.** Your "02 · Deal workspace" — numbered, agent-maintained:
- Top: deal identity + journey + stage breadcrumb · "**Maintained by Yulia · updated 4m ago**" · tabs **Deal brief · Financials · Diligence · Data room**.
- Sections: **01 Investment thesis** (prose + per-section "Re-run" + a Yulia callout: "I modeled three integration scenarios… **Open model**") · **02 Valuation** (KPI cards: Enterprise value · EV/EBITDA · Synergy NPV · Implied IRR — real or "—"; football-field / valuation-range chart as real data or honest empty) · **03 Key risks** (risk rows: name + severity pill High/Medium + the evidence line; "**Re-scan data room**").
- Binds to: the real deal record + deliverables + gates + Yulia's brief. Risks come from real diligence, never invented.

**E · Analysis canvas (split).** Your "Ask the agent / Analysis" split — the working surface:
- **LEFT:** Yulia chat scoped to the deal (same checklist/artifact pattern — "Done. I built three artifacts: Base-case LBO model · IC memo · Data-room review", each with **Open →**, plus a running step).
- **RIGHT:** a **canvas with tabs** — Analysis · Model · Documents · Data room. *Analysis* = KPI cards + football-field chart + thesis-risks. *Model* = the interactive model. *Documents/Data room* = real files.
- Yulia's artifacts open in the canvas; the chat is where she's directed.

**F · Closing / Post-merger.** Same shell, stage-appropriate content (closing checklist / funds-flow sign-off; PMI day-0 / stabilization). Lower priority — just make the shell so they slot in.

## 7. States & patterns (design these explicitly)
- **Loading:** calm monochrome skeletons ("Yulia is reading…").
- **Empty:** honest + inviting ("No live feed yet", "Nothing in this stage — Yulia will surface candidates"). Never a fake chart.
- **Error:** quiet, with retry.
- **Staged action / approval (THE LINE) — the most important pattern.** Before Yulia does anything mutating or outward-facing (send outreach, file to data room, export, advance a gate), she shows a **confirm card**: what she'll do · the inputs · **Confirm / Cancel**. This is both the legal line and the Claude-Desktop "asks before anything irreversible" feel. Make it a reusable component used everywhere actions appear.
- **Tabbed canvas:** opening a deal/model/doc accumulates as canvas tabs; switching preserves state.

## 8. Avoid (lessons from last round)
- No fabricated data anywhere — real or honest-empty. (Your placeholder charts are correct *as* honest empty states; just label them.)
- No wall of big per-deal cards for portfolio views — **compact tables/rows**; detail is one click away.
- Don't use the prior warm/green or indigo-fintech palettes — **monochrome + one rationed accent**.
- Keep the persona **Yulia** and THE LINE language ("analysis & implications, not advice"; "asks before anything irreversible").

## 9. Deliverables from you
Desktop mockups (~1440px) for: **App shell**, **Ask Yulia (home)**, **Overview**, **Sourcing**, **Deal workspace** (Deal brief / Financials / Diligence / Data room), **Analysis canvas** (split) — plus the shared **states** (loading/empty/error) and the **staged-confirm** component. And a **tokens sheet** (the monochrome scale · the one accent · the status palette · the type ramp · radii · spacing) so it ports to code cleanly.
