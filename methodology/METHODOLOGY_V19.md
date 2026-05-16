# STRATA OPERATING SYSTEM: MASTER METHODOLOGY (V19)

**Scope:** AI Governance, Workflow Logic, Calculation Engine, Tool Orchestration, GTM Features, Interactive Canvas, Deal Model Catalog, Tax & Legal Architecture, Anti-Hallucination Layer, Live Market Data Integration.

**Core Mandate:** "Data is Commodity; Workflow is the Moat. Math is Deterministic. Citations are Required."

**Security Level:** CRITICAL (Financial Data Governance + Regulatory Boundary)

**Updated:** May 14, 2026 — Absorbs V17 (March 2026 base) + V18a (Tax post-OBBBA) + V18b (Legal post-DGCL SB 21) + V19 Research Compilation Dossier.

**The Line (Authoritative, Cross-Cuts Every Section):** Analysis → Options → Implications → User Decides. Yulia never recommends, negotiates on behalf, advises, represents, or guarantees. Yulia generates docs, drafts comms for the user to send, scores offers, drives timeline, coordinates DD. Reference: `SMBX_THE_LINE.md`.

---

## 0.0 DOCUMENT INDEX & VERSIONING

### 0.1 Document Stack (V19)

| Document | Status | Scope |
|---|---|---|
| **METHODOLOGY_V19.md** (this doc) | **CURRENT MASTER** | AI governance, calc engine, workflows, gates, deal model catalog, tax + legal architecture, anti-hallucination, live data |
| METHODOLOGY_V17.md | SUPERSEDED | Folded into V19 §§ 1–8, 11–15 |
| METHODOLOGY_V18a_TAX_AMENDMENT.md | SUPERSEDED | Folded into V19 § 9 + updated with research |
| METHODOLOGY_V18b_LEGAL_AMENDMENT.md | SUPERSEDED | Folded into V19 § 10 + updated with research |
| V19_RESEARCH_DOSSIER.md | INPUT (preserved) | Source citations for all V19 claims |

**Action for CC: archive V17, V18a, V18b. Update all `import / @link / @ref` references to V19.**

### 0.2 Companion Documents (Distinct, Live Alongside V19)

| Document | Purpose |
|---|---|
| `SMBX_DEAL_MODEL_CATALOG.md` (NEW) | Per-model schemas, formulas, I/O, gating — full catalog (V19 § 11 is the index; this is the catalog body) |
| `SMBX_LEGAL_TAX_ECONOMICS_CATALOG.md` (NEW) | Every legal/tax concept → dollar-impact calc |
| `SMBX_YULIA_MODEL_GATING_LOGIC.md` (NEW) | Deterministic decision tree: deal → required model stack |
| `YULIA_PROMPTS_V4.md` (TO BUILD) | Runtime prompts — to be updated to reference V19 sections |
| `SMBX_THE_LINE.md` | Regulatory boundary spec (unchanged) |
| `SMBX_PLATFORM_REFERENCE.md` | Build state (unchanged) |
| `SMBX_LAUNCH_PUNCH_LIST_V2.md` | Tier 0 items (unchanged) |

### 0.3 Role-Specific Workflow Documents (referenced from V19 § 4)

| Document | For | Gates/Phases |
|---|---|---|
| EXIT_METHODOLOGY.md | Sellers (100% sale) | S0–S5 |
| RAISE_METHODOLOGY.md | Sellers (partial sale / capital raise) | R0–R5 |
| BUYER_METHODOLOGY.md | Buyers | B0–B5 |
| BROKER_METHODOLOGY.md | Partners / brokers | P0–P5 |
| PMI_METHODOLOGY.md | Post-acquisition | PMI0–PMI3 |

### 0.4 Hard-Coded Cross-Reference Tags

All claims, formulas, models, and rules in V19 carry a citation tag. The tag schema:

| Tag | Meaning |
|---|---|
| `[V19§X.X]` | Internal V19 cross-reference |
| `[IRC §X]` | Internal Revenue Code section |
| `[Treas. Reg. §X]` | Treasury Regulation |
| `[Rev. Proc. YYYY-X]` / `[Rev. Rul. YYYY-X]` | IRS Revenue Procedure / Ruling |
| `[Notice YYYY-X]` | IRS Notice |
| `[ABA 2025 §X]` | ABA Private Target Deal Points Study 2025 |
| `[SRS 2025]` | SRS Acquiom 2025 M&A Deal Terms Study |
| `[ASC 805-X]` | FASB Accounting Standards Codification |
| `[IFRS 3]` | IFRS 3 Business Combinations |
| `[Akorn, 2018 Del. Ch.]` | Case citation |
| `[Damodaran 2026]` | Damodaran data library |
| `[Pepperdine PCAP 2025]` | Pepperdine Private Capital Markets Project |
| `[Marsh TRI 2025]` | Marsh Transactional Risk Insurance Report |
| `[GF Data Q1 2026]` | GF Data quarterly |
| `[Kroll 2024]` | Kroll Cost of Capital Navigator |
| `[FRED:SERIES]` | St. Louis Fed FRED series ID |
| `[NYFed:H.15]` | NY Fed daily statistical release |
| `[FTC 2026 HSR]` | FTC HSR threshold release |
| `[SBA SOP 50 10 8]` | SBA Standard Operating Procedure |
| `[OBBBA §X]` | One Big Beautiful Bill Act (P.L. 119-21) section |
| `[DGCL §X / SB 21]` | Delaware General Corporation Law |

**Anti-hallucination invariant: Any V19 number, citation, or legal/tax claim Yulia surfaces must trace to a tag. Untagged factual claims are inadmissible.** See § 14.

---

## 1.0 THE AI ORCHESTRATION MATRIX (The "Right Tool" Protocol)

### 1.1 The Six-Layer Orchestration Stack (Expanded from V17)

V17 had a 2-mode Author/Auditor protocol. V19 expands to six layers because finance and legal claims cannot share a single LLM call without drift.

| Layer | Engine | Role | Hard Constraint |
|---|---|---|---|
| **L1 — Deterministic Calc Engine** | TypeScript / pure functions; runs client + server | All numerics: SDE, EBITDA, DSCR, IRR, MOIC, waterfalls, tax leakage, dollar exposure | Zero LLM in the math path. Same inputs → same outputs. Auditable. Exportable. |
| **L2 — Content Database (Versioned)** | Postgres tables; date-stamped, source-cited | All authoritative parameters: HSR thresholds, LTTER, multiples libraries, sector heat, RWI ROL, debt market spreads, league rules | Every row carries `source`, `as_of_date`, `cite_tag`. Read-only at runtime; updated only via supervised refresh jobs. |
| **L3 — Forensic Auditor** | NotebookLM / RAG, GROUNDED_ONLY, temp 0.1 | Extracts facts from user-provided documents only. Returns "NOT FOUND" if claim isn't in source. | Page/section citation required for every claim. Never infers. |
| **L4 — Author** | Gemini 2.0 Pro / Claude Opus 4.7, temp 0.3 | Drafts CIMs, LOIs, memos, narratives. Composes Analysis → Options → Implications text. Asks gating questions. | All numerics in output MUST be supplied by L1; all parameter claims by L2; all document claims by L3. Author cannot mint numbers. |
| **L5 — Market Intelligence** | Gemini 2.0 Pro + Search Grounding, temp 0.2 | Live external context: sector heat, recent comparable transactions, current spreads when L2 cache stale | Search grounding mandatory; cite source URLs; pull date-stamped within 30 days for fast-moving facts. |
| **L6 — Citation Validator** | Deterministic service; runs post-L4 output | Pre-publish gate: parses every `[tag]` in Yulia's response, validates against L2 content DB or live source, blocks publication on miss | If a citation cannot be validated, the assertion is stripped and a `[citation needed]` warning is surfaced to user. |

**The Defer-to-Calc Rule (HARD):** No number appears in Yulia's prose unless it came from L1 or L2. If a calculation is requested that L1 doesn't support, Yulia says: "I don't have a registered model for that yet. Here's the structure of what we'd need to build it..." and stops.

**The Defer-to-Citation Rule (HARD):** No legal or tax claim appears unless it carries a tag validated by L6. The Author layer cannot generate factual legal claims; it can only narrate around facts supplied by L2.

### 1.2 Task → Layer Routing Table

| Task | Primary Layer | Supporting Layers | Notes |
|---|---|---|---|
| Calculate SDE from P&L | L3 (extract) → L1 (compute) | L4 narrates | NotebookLM extracts line items; calc engine computes |
| "What's market on indem cap right now?" | L2 lookup | L4 narrates | L2 returns ABA 2025 + SRS 2025 figures |
| "Is this MAE?" | L4 (declines per Mode 2) | L3 (cite doc) | Yulia frames Akorn standard, refuses to opine; routes to counsel |
| Live HY OAS for LBO debt-cost assumption | L2 cache (≤24hr) → L5 if stale | L1 plugs into LBO | FRED `BAMLH0A0HYM2` |
| Build CIM | L4 (compose) | L1 (financials), L2 (sector data), L3 (target docs) | Author composes only after L1/L2/L3 supply primitives |
| LBO IRR sensitivity | L1 only | L4 narrates Analysis → Options | Pure math |
| §382 NOL limitation calc | L2 (LTTER lookup) → L1 (compute) | L4 narrates | Monthly LTTER from Rev. Rul. |
| §1202 QSBS eligibility opinion | L4 declines (Mode 2: defer to counsel) | L2 supplies criteria | Yulia screens; lawyer opines |
| Sector heat / hot industry signal | L5 (search) → L2 (cache) | L4 narrates | Refresh weekly |
| Draft LOI | L4 (compose) | L1 (deal terms), L2 (market norms), L3 (template) | First draft scaffold only; counsel finalizes |

### 1.3 NotebookLM Hard Rails (Unchanged from V17, Reinforced)

* Returns "NOT FOUND in provided documents" when claim not in source
* Page/section citation required: `[Doc Name, p. X]` or `[Doc Name, §X.X]`
* Temperature: 0.1
* Never infers or assumes — only quotes what exists
* Used for: legal diligence, financial verification, add-back source-attestation, document forensics, contract review, tax return analysis

### 1.4 Author/Auditor Routing Mnemonic

```
Q: Is the answer expected to exist verbatim in a provided document?
   YES → NotebookLM (L3 Auditor)
   NO  → continue

Q: Does the answer require a number?
   YES → must come from L1 calc engine or L2 content DB; L4 narrates around it
   NO  → L4 Author may compose (but cannot make factual claims without L2 tag)

Q: Does the answer require legal or tax conclusion on specific facts?
   YES → Mode 2 (Defer to Counsel); L4 surfaces options, halts opinion
   NO  → proceed

Q: Does the rule change frequently (threshold, statute, case law)?
   YES → Mode 3 (Research Externally) — L5 search grounded
   NO  → proceed
```

---

## 2.0 THE MARKET INTELLIGENCE ENGINE

### 2.1 Market Heat Index (Carried from V17 § 2.1, extended)

* **Trigger:** User selects industry (NAICS 6-digit preferred; SIC fallback)
* **System Action:** L5 grounded search: `"Private Equity consolidation [industry] 2025 2026 multiples"` + L2 cache lookup
* **Returned Dimensions:**
  * **Trend Direction:** Consolidating / Stagnant / Distressed / Distressed-Hot
  * **Active Buyers:** Top 10 PE platforms by recent deal count in sector
  * **Multiple Direction:** ↑ / → / ↓ (3-month moving)
  * **Strategic Activity:** Number of public-co acquisitions in last 12 months
* **Application:**
  * If Hot → Defensible Valuation range widens by Premium Factor (0.5x–1.5x EBITDA)
  * Yulia alert pattern: "Market signal: [Industry] is consolidating fast. 8 platform deals in last 6 months. The implication is your asking range could justify a +0.5x to +1.0x multiple. Want me to model it both ways?"
* **L2 Cache:** Refresh weekly via supervised refresh job

### 2.2 Macro Overlay (Carried from V17 § 2.2, extended)

* **Trigger:** Interest rate movement (any of: Fed Funds, SOFR, 10Y Treasury, HY OAS, IG OAS)
* **System Source:** FRED API endpoints (see § 15.1)
* **Application:**
  * SOFR shift > 25 bps → recompute Max Debt Capacity for all active deals (L1 cascade)
  * HY OAS shift > 50 bps → reprice mezz/2L assumptions in active LBO models
  * 10Y Treasury shift > 30 bps → revise WACC default in DCF models
* **2026 baseline (May 14, 2026):**
  * SOFR: 3.60% [FRED:SOFR]
  * Fed Funds target: 3.50–3.75% [FRED:DFEDTARU]
  * 10Y Treasury: 4.46% [FRED:DGS10]
  * HY OAS: 2.79% [FRED:BAMLH0A0HYM2]
  * IG OAS: ~1.05% [FRED:BAMLC0A0CM]
  * VIX: 18.09 [FRED:VIXCLS]
  * SBA Prime: ~7.50% [FRED:DPRIME]

### 2.3 Market Pulse (Real-Time Intelligence) — Carried from V17 § 2.3

Daily snapshot the Yulia surfaces proactively at session start when relevant: SOFR, Fed Funds, HY OAS, S&P 500, VIX, current SBA all-in rate range, top 5 LBO multiples by sector vs 30-day average. Refreshed daily.

### 2.4 Knowledge Base Architecture — Carried from V17 § 2.4, schema in § 15

The L2 content database persists:
* Sector heat scores (refreshed weekly)
* Multiples libraries (Damodaran annual, GF Data quarterly, BizBuySell quarterly, Bessemer Cloud annual, Pepperdine PCAP annual)
* Debt market spreads (FRED daily, Lincoln LSDI quarterly)
* R&W insurance ROL bands (Marsh quarterly, Aon quarterly, Lockton quarterly)
* HSR thresholds (annual)
* §382 LTTER (monthly)
* SBA SOP versioning
* State-by-state non-compete enforceability matrix
* State QSBS conformity matrix
* PE platform registry by sector

### 2.5 Context Injection Protocol — Carried from V17 § 2.5

At conversation start, Yulia receives:
* Active league (L1–L10, see § 3)
* Active journey (Sell / Buy / Raise / Integrate / Broker)
* Active gate
* Deal record snapshot (industry, geography, financials, structure if known)
* Live market pulse (§ 2.3)
* Relevant sector heat
* User's prior interactions / preferences (from project memory)

Injection format: structured JSON block at top of system prompt, refreshed per turn.

---

## 3.0 LEAGUE GOVERNANCE (Hard Logic Gates) — V19 Extension

V17 defined L1–L6 (sub-$300K through $250M+). V19 extends to **L7–L10** for middle-cap through mega-cap to support the "beat Bain Capital" benchmark. League is determined by **trailing 12-month SDE/EBITDA** with revenue as secondary signal.

### 3.1 League Classification Matrix

| League | EBITDA / SDE Band | Revenue Proxy | Buyer Profile | Typical Multiple | Financing | Model Stack Complexity |
|---|---|---|---|---|---|---|
| **L1** | SDE < $300K | Rev < $1M | Individual operator | 2.0–3.0× SDE | SBA 7(a) Small Loan ≤$350K, seller note | LIGHT (SDE valuation, SBA financing, basic APA) |
| **L2** | SDE $300K–$1M | Rev $1M–$5M | Searcher, individual | 2.5–4.0× SDE | SBA 7(a) ≤$5M, seller note | LIGHT-MED (SDE, SBA, working capital, basic add-back) |
| **L3** | EBITDA $1M–$5M | Rev $5M–$25M | Independent sponsor, search fund | 4.0–6.0× EBITDA | SBA + mezzanine + sponsor equity | MEDIUM (QoE Lite, LBO, rollover, earnout, indem) |
| **L4** | EBITDA $5M–$25M | Rev $25M–$100M | Lower-middle-market PE | 6.0–8.0× EBITDA | Unitranche + sponsor equity + rollover | MEDIUM-HEAVY (full LBO, R&W, structured equity, full PPA) |
| **L5** | EBITDA $25M–$100M | Rev $100M–$500M | Middle-market PE | 7.5–10.0× EBITDA | TLB + 2L/mezz + sponsor + rollover | HEAVY (LBO + add-on roll-up, dividend recap, full tax structuring, F-reorg, §338(h)(10)) |
| **L6** | EBITDA $100M–$250M | Rev $500M–$2B | Upper-middle-market PE | 9.0–12.0× EBITDA | Syndicated TLB + 2L + sponsor + cov-lite | HEAVY (broadly syndicated debt, take-private at lower end, dual-track exit prep) |
| **L7** *(NEW)* | EBITDA $250M–$1B | Rev $2B–$10B | Mega-fund PE, strategic | 10.0–14.0× EBITDA | Syndicated TLB + HY bonds + mezz + sponsor | MEGA (club deal, TLB+HY combo, complex MIP, CVR option, dual-track standard) |
| **L8** *(NEW)* | EBITDA $1B–$5B | Rev $10B–$50B | Mega-cap PE consortium, strategic | 11.0–15.0× EBITDA | Mega TLB + HY + 2L + jumbo sponsor equity | MEGA+ (consortium, club, regulatory HSR/CFIUS standard, fairness opinion required) |
| **L9** *(NEW)* | EBITDA $5B–$25B | Rev $50B–$250B | Mega consortium, strategic mega-merger | 12.0–18.0× EBITDA | Multi-tranche HY+TLB+bridge, sometimes equity issuance | MEGA++ (multi-jurisdiction antitrust, multi-step structuring, sometimes spin/Morris Trust mechanics) |
| **L10** *(NEW)* | EBITDA > $25B | Rev > $250B | Mega strategic, hostile / public M&A | 12.0–20.0× EBITDA | Bridge + permanent debt + equity + spin financing | MEGA+++ (transformational deals, sector-altering, often spin/RMT, cross-jurisdiction, multi-quarter regulatory) |

### 3.2 League → Default Model Stack Mapping (See § 12 for full stacks)

| League | Primary Model | Required Supporting | Optional |
|---|---|---|---|
| L1 | SDE Valuation | SBA Financing, Working Capital | — |
| L2 | SDE Valuation | SBA Financing, Working Capital, Add-back Defense | Earnout (rare) |
| L3 | Adjusted EBITDA → LBO Lite | QoE Lite, Rollover, Earnout Valuation, Indem Economics | RWI Pricing |
| L4 | Full LBO + DCF Cross-Check | QoE, Trading Comps, Precedent Tx, RWI Pricing, NWC Peg | Dividend Recap (later), Tax Optimizer (§338(h)(10), F-reorg) |
| L5 | Full LBO + Add-On Roll-Up | DCF, Precedent Tx, Synergy Curve, Tax Optimizer, MIP | Dividend Recap, §382 NOL, §163(j), §168(k) |
| L6 | Full LBO + Dual-Track Comparison | DCF, Synergy, Tax Optimizer, MIP, BSL/Cov-Lite Debt Schedule | Take-Private Premium Analysis |
| L7 | Multi-Tranche LBO + Take-Private | Fairness Opinion Build, CVR Valuation, Premium Paid Analysis, Dual-Track | NCTI/FDDEI/BEAT, Multi-jurisdiction |
| L8 | Consortium LBO + Antitrust | Fairness Opinion, RFA/RFP Antitrust Sim, Multi-jurisdiction Tax | HSR Second Request Cost, CFIUS |
| L9 | Mega-Merger + Spin Mechanics | Morris Trust / RMT, Spin Tax (§355), Multi-Antitrust | Cross-Jurisdiction §367 |
| L10 | Transformational + Multi-Quarter | All of L9 + Permanent Capital Issuance, Hostile Defense if applicable | — |

### 3.3 The "Roll-Up Override" Rule (Carried from V17 § 3.1, extended)

If user describes an aggregated platform play (e.g., "I want to buy 8 HVAC companies"), Yulia overrides individual deal league using the projected aggregate league at the buy-in horizon (typically 24–36 months). For example: 8 × $400K SDE HVAC targets at L1/L2 individually → projected L4 platform at exit → apply L4 model stack from the outset.

### 3.4 The "Mega-Step-Down" Rule (NEW, for L7+)

For deals at L7+ where Yulia is being used as a co-pilot (not primary deal lead), the platform falls back to "fluency-level" support: market intelligence, comp pulls, model audit, document review. The platform does NOT attempt to be the primary deal team for L7+ unless explicitly engaged for that role — but Yulia can still execute every L7+ model in the catalog (§ 11). Differentiation here is **speed + audit-trail + breadth**, not "replace the MD."

---

## 4.0 THE FUNCTIONAL LIFECYCLE (Step-by-Step Governance)

Carried from V17 § 4 with V19 enhancements. Phase descriptions kept brief here; full gate-by-gate prompts live in `YULIA_PROMPTS_V4.md` (referenced).

### 4.1 Phase 1: Intelligent Onboarding (The "Trap Door")

Detect journey (Sell / Buy / Raise / Integrate / Broker) and league (L1–L10) from the first 1–3 user messages. The **4-Beat First Response Pattern** is mandatory: Classify → Estimate → Insight → Question. (Detailed in `YULIA_PROMPTS_V4.md`.)

### 4.2 Phase 2: Seller Workflow (The Forensic Audit)

Gates S0–S5. Documents collected → L3 forensic extraction → L1 SDE/EBITDA computation → add-back identification with source attestation → working capital peg → QoE Lite (L3+) or full QoE (L5+) → valuation triangulation (SDE multiple / EBITDA multiple / DCF / asset-based, weighted by league) → CIM build (Living CIM, § 21).

### 4.3 Phase 2B: Raise Workflow (Capital Raise / Partial Equity Sale)

Gates R0–R5. Six exit-type detection: (1) full sale, (2) partner buyout, (3) capital raise (debt or equity), (4) employee buyout (ESOP), (5) majority share sale, (6) partial stock/asset sale. Detection drives routing. Cap table builds, dilution modeling, investor list, term sheet analysis, DD coordination.

### 4.4 Phase 3: Buyer Workflow (The Hunt)

Gates B0–B5. Thesis definition → sourcing (5-stage pipeline § 19) → screening (90-second teaser screen) → QoE Lite pre-LOI → LBO + valuation → DD → structuring → close. Buyer value framing: **speed to conviction**.

### 4.5 Phase 4: The Deal Architect (Structuring & Cap Tables)

Asset vs. stock vs. merger; §338(h)(10); F-reorg; §351; §368(a)(1)(A/B/C/D/F); §355 spin; earnout vs. rollover vs. seller note; R&W insurance vs. escrow; indemnification cap/basket/survival; PPA optimization (§1060 + §168(k)/§168(n)). Full tax + legal architecture in §§ 9, 10.

### 4.6 Phase 5: Negotiation & Papering

Yulia generates: counter-draft scaffolds, negotiation memos, tradeoff matrices, walk-away flags. Yulia does NOT speak to counterparty; user sends, signs, negotiates. (§ 10.4)

### 4.7 Phase 6: Closing & Funds Flow

Closing checklist, funds flow worksheet (S&U reconciliation, debt funding, equity wires, escrow funding, fees), bring-down certificates, post-closing schedules.

### 4.8 Phase 7: PMI (Integration)

Gates PMI0–PMI3. Day 0 → Stabilization (Day 1–30) → Assessment (Day 31–60) → Optimization (Day 61–100). Synergy capture, working capital normalization, earnout tracking, indemnification monitoring.

### 4.9 The 22-Gate Master Index

Carried from V17. Same 22 gates with the following V19 prompt-injection enhancements (specified in `YULIA_PROMPTS_V4.md`):

| Gate | Journey | Key Output | V19 Model Stack Call |
|---|---|---|---|
| S0 | Sell | Profile + classification | Classifier (§ 13.1) |
| S1 | Sell | Recast P&L, SDE/EBITDA, add-back schedule | MODEL.VAL.SDE.v1 or MODEL.VAL.EBITDA.v1 |
| S2 | Sell | Valuation report | MODEL.VAL.TRIANGULATION.v1 |
| S3 | Sell | CIM | MODEL.DOC.CIM.v1 + Living CIM (§ 21) |
| S4 | Sell | Offer scoring & negotiation memos | MODEL.NEG.OFFER_SCORE.v1 |
| S5 | Sell | Closing checklist + funds flow | MODEL.CLOSE.FUNDS_FLOW.v1 |
| B0 | Buy | Thesis + initial deal scan | MODEL.SCAN.TEASER.v1 |
| B1 | Buy | Target screening | MODEL.SCAN.SCREEN.v1 |
| B2 | Buy | QoE Lite + LBO | MODEL.LBO.PE.v1 + MODEL.QOE.LITE.v1 |
| B3 | Buy | LOI + structure | MODEL.STRUCT.OPTIMIZE.v1 |
| B4 | Buy | DD + final structure | Full structuring stack |
| B5 | Buy | Close | MODEL.CLOSE.FUNDS_FLOW.v1 |
| R0 | Raise | Exit-type detection + readiness | MODEL.RAISE.READINESS.v1 |
| R1 | Raise | Financials + cap table | MODEL.CAPTABLE.v1 + MODEL.DILUTION.v1 |
| R2 | Raise | Pitch deck + exec summary | MODEL.DOC.PITCH.v1 |
| R3 | Raise | Investor list + outreach | MODEL.LIST.INVESTOR.v1 |
| R4 | Raise | Term sheet analysis | MODEL.TERMSHEET.SCORE.v1 |
| R5 | Raise | Close | MODEL.CLOSE.FUNDS_FLOW.v1 |
| PMI0 | Integrate | Day 0 checklist | MODEL.PMI.DAY0.v1 |
| PMI1 | Integrate | Stabilization | MODEL.PMI.STAB.v1 |
| PMI2 | Integrate | Assessment | MODEL.PMI.ASSESS.v1 |
| PMI3 | Integrate | 100-day plan | MODEL.PMI.100DAY.v1 |

(Broker gates P0–P5 mirror seller-side with banker framing, see BROKER_METHODOLOGY.md)

---

## 5.0 THE MATH ENGINE (Standardized Calculations)

This section is the canonical specification of the L1 deterministic calc engine. It is intentionally formulaic. All formulas are pure functions; same inputs → same outputs; no LLM in the math path. Full per-model schemas live in `SMBX_DEAL_MODEL_CATALOG.md`; this section is the indexed core.

### 5.1 SDE (Seller's Discretionary Earnings) — L1/L2

```
SDE = Net Income (per tax return, pre-distribution)
    + Owner's W-2 / 1099 / Guaranteed Payments
    + Owner's Benefits (health, retirement, auto)
    + Interest Expense
    + Depreciation & Amortization
    + One-Time / Non-Recurring Expenses (verified)
    + Discretionary Expenses (verified, with source documentation)
    – Required Owner Replacement Compensation (if non-operator buyer)
```

**Source attestation: Every add-back must trace to a source document (P&L line, tax return line, bank statement, vendor invoice). If unattested, mark `[unverified — Yulia removes from defended SDE]`.**

### 5.2 Adjusted EBITDA — L3–L10

```
Adjusted EBITDA = Net Income
                + Interest Expense
                + Income Taxes
                + Depreciation
                + Amortization
                + Stock-Based Compensation* [V19: contested — see § 5.2.1]
                + Non-Recurring Items (verified)
                + Restructuring Charges (verified)
                + Impairments (verified)
                + Management Fees / Related-Party (if normalizing for sale)
                – Run-Rate Adjustments (subtractive for sustainability)
```

#### 5.2.1 SBC Treatment

* L3/L4 (SMB / LMM): SBC typically immaterial; included as cash comp equivalent
* L5–L10 (MM and up): SBC is contested. Defensible add-back per Pignataro; Damodaran disputes. V19 default: **show both** — "Reported Adjusted EBITDA" (SBC added back) and "Cash Adjusted EBITDA" (SBC retained). Buyer-presented adjusted EBITDA defaults to "Reported."

### 5.3 DSCR (Debt Service Coverage Ratio)

```
DSCR = (EBITDA – CapEx – Income Taxes – Distributions) / (Annual Cash Interest + Mandatory Principal Amortization)
```

* SBA covenant floor: **1.15×** [SBA SOP 50 10 8]
* SBA lender standard: 1.25×
* SBA business acquisition standard: 1.50×
* PE LBO maintenance covenant typical: 1.10–1.25×
* PE LBO incurrence covenant typical: 1.25×

### 5.4 Arbitrage Spread (L5 Roll-Up Metric)

```
Multiple Arbitrage Per Add-On = (Exit Multiple_Platform – Entry Multiple_Addon) × EBITDA_Addon

Blended Entry Multiple = Σ(Multiple_i × EBITDA_i) / Σ(EBITDA_i)

Roll-Up Equity Value Created = (Exit Multiple × Σ EBITDA_i × (1 + Synergy%)) – Σ(Entry Cost_i)
```

### 5.5 WACC (Weighted Average Cost of Capital)

```
WACC = (E / (E+D)) × r_E + (D / (E+D)) × r_D × (1 – τ)
```

Where market weights and target structure are used (not book). For private companies, target structure approximates LBO blended cap structure.

#### 5.5.1 r_E (Cost of Equity) Methods

**CAPM (L5+ public benchmarking):**
```
r_E = r_f + β_L × ERP
```

* `r_f` default: 10Y Treasury [FRED:DGS10], May 14 2026 = 4.46%
* ERP default: Damodaran implied ERP, Jan 2026 = 4.23% [Damodaran 2026]
* ERP alternative: Kroll recommended, 5.0% since Jun 5 2024 [Kroll 2024]
* V19 default: Damodaran; user can toggle Kroll

**Modified CAPM (L4–L6):**
```
r_E = r_f + β_L × ERP + SP + IRP + α
```

* SP (size premium): from Damodaran Total Beta / Pepperdine PCAP / Kroll Navigator
* IRP (industry risk premium): from Kroll IRPs
* α (company-specific): qualitative, 0–500 bps

**Build-Up (L1–L3 SMB):**
```
r_E = r_f + ERP + SP + IRP + α
```

* Typical SMB cost of equity: **22–32%** [Pepperdine PCAP 2025]

**Hamada Re-Levering (peer beta → target structure):**
```
β_U = β_L / [1 + (1 – τ) × (D/E)]
β_L_target = β_U × [1 + (1 – τ) × (D/E)_target]
```

#### 5.5.2 r_D (Cost of Debt)

Method 1 — yield-to-maturity on traded debt (public co)
Method 2 — credit-rating spread + risk-free (synthetic for private)
* BB credit: r_f + ICE BofA BB OAS [FRED:BAMLH0A1HYBB]
* B credit: r_f + ICE BofA B OAS [FRED:BAMLH0A2HYB]
* CCC credit: r_f + ICE BofA CCC OAS [FRED:BAMLH0A3HYC]
Method 3 — Damodaran synthetic ratings (private SMB / LMM)

### 5.6 DCF — Two-Stage Default

```
EV_0 = Σ[t=1..N] UFCF_t / (1 + WACC)^t  +  TV_N / (1 + WACC)^N

UFCF_t = EBIT_t × (1 – τ)  +  D&A_t  –  CapEx_t  –  ΔNWC_t

TV_N = UFCF_(N+1) / (WACC – g)              [Gordon Growth]
   OR
TV_N = EBITDA_N × Exit Multiple              [Exit Multiple Method]
```

* Default explicit forecast: 5 years L1–L4; 10 years L5–L10
* Default terminal growth `g`: lesser of long-run nominal GDP (~2.5%) and 10Y Treasury yield
* Cross-check: implied `g` from exit multiple method must satisfy `g < WACC` and `g <= r_f`

### 5.7 Multiples Application

```
EV = Multiple × Operating Metric
Equity Value = EV – Net Debt + Cash – Preferred + Minority Interest
```

* L1/L2: EV/SDE — pull from BizBuySell Insight Report quarterly [BizBuySell Q1 2026]
* L3+: EV/EBITDA — pull from GF Data quarterly [GF Data Q1 2026] for LMM/MM; Damodaran Jan annual [Damodaran 2026] for sector context
* SaaS overlay: EV/ARR + Rule of 40 + Rule of X (§ 5.13)

### 5.8 Quality of Earnings (QoE) — Universal Framework

QoE Lite (L3) vs Full QoE (L5+). Key tests:

* **Proof of Cash:** Bank statements reconcile to P&L revenue and to deposits
* **Add-back defense:** Each add-back source-attested (per § 5.1)
* **NWC peg analysis:** LTM 12-mo average vs normalized vs seasonality-adjusted
* **Customer concentration:** Top 5 / 10 customers as % of revenue
* **Vendor concentration:** Top 5 vendors as % of COGS
* **Run-rate sustainability:** Last-3-month run-rate vs LTM (flag if growth-front-loaded)
* **CapEx normalization:** Maintenance vs growth split; LTM vs forward
* **Working capital quality:** AR aging, AP aging, inventory turns vs sector benchmark

### 5.9 CapEx Analysis & Balance Sheet Impact

Carried from V17 § 5.7, with V19 enhancement: CapEx PV impact computed via L1 model `MODEL.CAPEX.NPV.v1` — separates maintenance CapEx (deducted from FCF) from growth CapEx (capitalized into TV expectation). Bonus depreciation (§168(k)) PV computed in tax-leakage stack.

### 5.10 Free Cash Flow by League

```
FCF (Unlevered) = EBIT × (1 – τ) + D&A – CapEx – ΔNWC
FCF (Levered)   = Net Income + D&A – CapEx – ΔNWC – Mandatory Debt Amortization
FCF (Available for Distribution) = FCF Levered – Required Reinvestment
```

### 5.11 IRR & MOIC

```
IRR: solve Σ CF_t / (1 + IRR)^t = 0   (Newton-Raphson; bounded [-0.99, 5.0])
MOIC = Σ Cash Returned to Sponsor / Σ Cash Invested by Sponsor
DPI  = Cumulative Distributions / Paid-In Capital
RVPI = Residual NAV / Paid-In Capital
TVPI = DPI + RVPI
```

Rule of thumb: `IRR ≈ MOIC^(1/N) – 1` for clean cash flows.

### 5.12 Sensitivity Standards

For every primary financial output, the L1 engine emits a sensitivity tornado on:
* Revenue ±10%, ±20%
* EBITDA margin ±100 bps, ±300 bps
* Exit multiple ±0.5×, ±1.0×
* WACC ±50 bps, ±150 bps (DCF only)
* Hold period ±1yr, ±2yr (LBO only)
* SOFR shift ±100 bps, ±200 bps (LBO debt-cost only)

### 5.13 SaaS-Specific Metrics

**Rule of 40:**
```
R40 = Revenue Growth % + EBITDA Margin %
```
* R40 ≥ 40% → multiple premium ~2.3–2.5× [KeyBanc]

**Rule of X (Bessemer Feb 2024):**
```
RX = (M × Growth %) + FCF Margin %
```
* M ≈ 2 for private, 2–3 for public
* Higher R² (0.62) vs Rule of 40 (0.50) against FV/NTM revenue

**Net Revenue Retention (NRR):**
```
NRR = (Beginning ARR + Expansion – Churn – Downgrade) / Beginning ARR
```
* Healthy SaaS: ≥110%; elite: ≥130%

---

## 6.0 DATA SOVEREIGNTY & SECURITY

### 6.1 The Vault Architecture (Carried from V17 § 6.1)

User documents stored encrypted at rest (AES-256), encrypted in transit (TLS 1.3), and segmented per tenant. Tenant-scoped retrieval; no cross-tenant inference. Backup encryption keys held in HSM.

### 6.2 Context Flushing — The "Chinese Wall" (Carried from V17 § 6.2, extended)

Cross-tenant: complete isolation, never trained on, never surfaced to other tenants. Cross-deal within tenant: opt-in cross-deal awareness for the same user; default is per-deal context flush.

### 6.3 The "Safe Harbor" Geofence (Carried from V17 § 6.3, extended)

User location is recorded at session start. Yulia adjusts state-specific overlays:
* Non-compete enforceability (§ 10.4)
* QSBS state conformity (§ 9.3)
* RETT / CITT obligations (§ 9.5)
* PTE election availability (§ 9.5)
* Bulk sales statute requirements (§ 10.5)

### 6.4 Audit Trail Requirements (NEW — V19)

Every Yulia response carries a server-side audit-trail record:
* Session ID, deal ID, user ID
* Inputs used (L1 + L2 + L3 sources)
* Citations validated (L6)
* Model versions invoked (e.g., MODEL.LBO.PE.v1.3)
* Live data snapshots (e.g., SOFR fetched at timestamp X = 3.60%)
* Output hash for replay

Audit trail retention: 7 years (SEC-equivalent). User-downloadable as JSON for diligence defense.

---

## 7.0 IMPLEMENTATION CONSTANTS (Updated for 2026)

### 7.1 Multiple Guardrails by League (Updated)

| League | Default Multiple Range (Floor – Ceil) | Source |
|---|---|---|
| L1 | 1.8× – 3.5× SDE | BizBuySell Q1 2026 |
| L2 | 2.5× – 4.5× SDE | BizBuySell Q1 2026 |
| L3 | 4.0× – 6.5× EBITDA | GF Data Q1 2026 |
| L4 | 5.5× – 8.5× EBITDA | GF Data Q1 2026 |
| L5 | 7.0× – 10.5× EBITDA | PitchBook NA MM TTM |
| L6 | 8.5× – 12.5× EBITDA | PitchBook |
| L7 | 9.5× – 14.0× EBITDA | Bain / McKinsey |
| L8 | 10.5× – 15.5× EBITDA | Bain / McKinsey |
| L9 | 11.5× – 18.0× EBITDA | Bain / McKinsey |
| L10 | 12.0× – 20.0× EBITDA | Bain / McKinsey |

Multiples are sector-modulated using the Damodaran sector library (Jan 2026 update; refreshed annually).

### 7.2 Roll-Up Industries (Carried from V17 § 7.2, refreshed)

Current consolidation-active sectors (2026, per recent PE deal flow): HVAC, plumbing, electrical, residential services, veterinary, dental, MedSpa, dermatology, optometry, behavioral health, accounting, IT MSP, MSSP, ag services, pool services, pest control, auto repair multi-location, ECE/childcare, specialty pharmacy, home health, hospice, dialysis, fire/life safety.

### 7.3 Safe Harbor Jurisdictions (Carried from V17 § 7.3)

DE, NY, TX, CA, IL, FL — primary; full state matrix in V19 § 10 + state overlay tables.

### 7.4 2026 Regulatory Constants (NEW / UPDATED)

| Constant | 2026 Value | Source |
|---|---|---|
| HSR Size of Transaction | **$133.9M** | [FTC 2026 HSR], effective Feb 17, 2026 |
| HSR Size of Person | $267.8M / $26.8M | [FTC 2026 HSR] |
| HSR Auto-Reportable | **$535.5M** | [FTC 2026 HSR] |
| HSR Filing Fee (top tier) | **$2.46M** | [FTC 2026 HSR] |
| HSR Filing Fee (entry tier) | $30,000 | [FTC 2026 HSR] |
| Section 8 Interlocks | $54,402,000 / $5,440,200 | [FTC 2026] |
| SBA 7(a) Cap | $5,000,000 | [SBA SOP 50 10 8] |
| SBA 7(a) Small Loan Cap | **$350,000** (reduced from $500K) | [SBA SOP 50 10 8] |
| SBA 504 Debenture Max | $5,500,000 | [SBA SOP 50 10 8] |
| SBA Equity Injection | **10%** | [SBA SOP 50 10 8] |
| SBA Seller Note as Equity | Only if full standby for 10-yr term AND ≤50% of equity injection | [SBA SOP 50 10 8] |
| SBA Rollover Personal Guarantee | 2 years (rollover sellers) | [SBA SOP 50 10 8] |
| §382 LTTER (May 2026) | **3.65%** | [Rev. Rul. 2026-9] |
| §382 LTTER (Feb 2026) | 3.56% | [Rev. Rul. 2026-03] |
| §382 LTTER (Jan 2026) | 3.51% | [Rev. Rul. 2026-02] |
| §168(k) Bonus Depreciation | **100% PERMANENT** post Jan 19, 2025 | [OBBBA §70301, Notice 2026-11] |
| §163(j) ATI Computation | **EBITDA-based PERMANENT** post Dec 31, 2024 | [OBBBA §70302, FS-2025-9] |
| §1202 QSBS (post Jul 4, 2025) | $15M or 10× basis; $75M gross assets; tiered 50/75/100% at 3/4/5 yrs | [OBBBA §70425] |
| NCTI ETR (post 2025) | 12.6% pre-FTC; 90% FTC | [OBBBA §70322] |
| FDDEI ETR (post 2025) | ~14% | [OBBBA §70322] |
| BEAT (permanent) | 10.5% | [OBBBA §70322] |
| SALT Cap (2025) | **$40,000** with MAGI >$500K phaseout (reverts to $10K in 2030) | [OBBBA §70505] |
| CFIUS Filing Fee Cap | lesser of 1% of TV or $300K; $0 for Declarations | [31 CFR 800/802] |
| CFIUS Penalty Cap | $5M per violation or TV (2024 update) | [31 CFR 800/802] |
| CFIUS Notice Timeline | 105 days statutory max (45 + 45 + 15) | [31 CFR 800/802] |

### 7.5 Live Market Data Constants (Refreshed Cadence — see § 15)

| Constant | Source | Cadence | Default Value (May 14, 2026) |
|---|---|---|---|
| SOFR | [FRED:SOFR] | Daily | 3.60% |
| Fed Funds (target upper) | [FRED:DFEDTARU] | Daily | 3.75% |
| EFFR | [FRED:EFFR] | Daily | ~3.58% |
| 10Y Treasury | [FRED:DGS10] | Daily | 4.46% |
| 5Y Treasury | [FRED:DGS5] | Daily | ~4.10% |
| 30Y Treasury | [FRED:DGS30] | Daily | ~4.65% |
| ICE BofA HY OAS | [FRED:BAMLH0A0HYM2] | Daily | 2.79% |
| ICE BofA IG OAS | [FRED:BAMLC0A0CM] | Daily | ~1.05% |
| SBA Prime | [FRED:DPRIME] | Daily | ~7.50% |
| VIX | [FRED:VIXCLS] | Daily | 18.09 |
| Damodaran ERP | [Damodaran 2026] | Annual (Jan) | 4.23% |
| Kroll Recommended ERP | [Kroll 2024] | Periodic | 5.00% |
| Pepperdine Mezz Cash Yield | [Pepperdine PCAP 2025] | Annual | ~12–13% |
| BizBuySell Median SDE Multiple | [BizBuySell Q1 2026] | Quarterly | 2.7× SDE |
| GF Data PE LMM PPM | [GF Data Q1 2026] | Quarterly | 7.2× LTM EBITDA |
| Marsh R&W ROL (NA) | [Marsh TRI 2025] | Quarterly | 2.5–3.0% (Q4 2025: 3.23%) |
| Marsh R&W Retention | [Marsh TRI 2025] | Quarterly | 0.5–0.75% EV (firming) |
| Lincoln LSDI Yield | [Lincoln LSDI Q3 2025] | Quarterly | ~10.14% |

### 7.6 Database Tables (GTM + V19 Additions)

Existing (from V17): `users`, `deals`, `conversations`, `messages`, `documents`, `models`, `gates`, `subscriptions`, `wallet`, `invitations`, `notifications`.

V19 additions:
* `market_data_cache` — L2 content DB, keyed by source + as_of_date
* `citation_registry` — every cite_tag and its current verified value
* `model_registry` — every model version, hash, change log
* `audit_trail` — per-response audit record (§ 6.4)
* `deal_model_stack` — composed stack per deal (§ 12)
* `tax_position_registry` — per-deal tax structure decisions and rationale
* `legal_defer_log` — record of every Mode 2 defer-to-counsel trigger

---

## 8.0 MESSAGING PHILOSOPHY ("Outcome Certainty")

Carried from V17 § 8.0, reinforced by V19 anti-hallucination architecture.

### 8.1 Core Principle (Restated)

Yulia is not a search engine. Yulia is a deal team. Outputs are decisive, sourced, and defensible. Where uncertainty exists, Yulia surfaces it explicitly with range, probability, and what would tighten the answer.

### 8.2 The 4-Beat First Response Pattern (Carried from V17, Hardened)

Every first response in a journey follows:

1. **Classify** — what type of deal, what league, what journey
2. **Estimate** — a real number (range OK) using L1 or L2
3. **Insight** — one non-obvious observation
4. **Question** — one focused next-step question

**Hard rule: no generic openers. No "Tell me more about your business." Every first response includes at least one calibrated number.**

### 8.3 The Analysis → Options → Implications → User Decides Pattern

Every recommendation-shaped output follows this structure:

**Analysis:** What we observe. (Sourced, with calc trail.)
**Options:** Two to four discrete paths forward.
**Implications:** Per option: cost, time, risk, dollar exposure, regulatory friction.
**Decision:** Yulia asks the user to choose. Yulia does NOT recommend.

This is THE LINE in operational form. Every Yulia output is checked against it.

### 8.4 Yulia's Voice (Carried from V17 § 8.4, refined)

* Veteran M&A advisor who has closed deals globally — human, specific, authoritative
* Never markets, never sells, never hedges with disclaimers as deflection
* Direct, calibrated, willing to surface bad news
* Numerate — every claim quantifiable
* Cited — every claim traceable
* The same tone whether deal is $300K or $30B

### 8.5 Value Proposition Hierarchy (Carried from V17 § 8.3)

1. **Time saved** — faster than the alternative
2. **Quality elevated** — analyst/associate/VP-grade output
3. **Defensibility** — every output sourced and auditable
4. **Optionality preserved** — Yulia surfaces paths, doesn't lock-in


---

## 9.0 TAX IMPLICATIONS ENGINE (Post-OBBBA — Absorbs V18a + Research)

V18a built the post-OBBBA tax fluency architecture (Six-Lens framework, F-Reorg, §338(h)(10), §1060, §453, §382, §163(j), §168(k), §168(n), §1031, §754, §751, §280G, rollover, international NCTI/FDDEI/BEAT, SALT). V19 incorporates V18a wholesale with the following updates and additions from the research dossier.

### 9.1 The Six-Lens Tax Framework (from V18a, carried)

Every tax-relevant moment in a deal is analyzed through six lenses:

1. **Federal Income** — entity type, character (ord vs cap), §1060 PPA, §168(k), §382, §163(j)
2. **State Income** — conformity, apportionment, PTE election
3. **Transfer / Sales** — RETT, CITT, sales tax in asset deals, bulk sales
4. **Payroll / Employment** — §280G, §409A, §83(b), withholding, FICA on earnouts
5. **International** — NCTI/FDDEI/BEAT, §367, §482 TP
6. **Industry-Specific** — §280E cannabis, §168(n) QPP, §453A real estate, CHOW healthcare, REIT/BDC

### 9.2 Deal-Type Tax Treatment Matrix (Expanded from V17 §§ 9.1–9.5)

| Deal Type | Buyer Tax Position | Seller Tax Position | Key Levers |
|---|---|---|---|
| **Asset Purchase** | Step-up basis; §168(k) on personal property; §197 15-yr SL on intangibles incl. goodwill | Allocation-driven; goodwill = LTCG; depreciation recapture = ordinary; inventory = ordinary | §1060 allocation negotiation; §168(k) post-OBBBA 100% permanent |
| **Stock Purchase (no election)** | Carryover basis; §382 NOL limits | Single layer LTCG (S-corp/LLC); double tax (C-corp) | Pre-sale C→S conversion (5yr BIG period); F-reorg ahead of sale |
| **§338(h)(10)** | Asset treatment despite stock form; full step-up | Asset treatment; ordinary recapture; S-corp avoids double tax; C-corp does NOT (limits applicability) | Joint election; tax gross-up to seller (typically 1–3% EV); buyer recoups via §197/§168(k) |
| **§336(e)** | Asset treatment; unilateral seller election | Similar to (h)(10) but seller-only | Non-corp buyers eligible (PE LLC); broader applicability than (h)(10) |
| **F-Reorganization** | Asset treatment for federal tax via QSub-then-LLC convert | Tax-deferred for rollover sellers; full LTCG for cashing-out | Rev. Rul. 2008-18 sequence; Rev. Proc. 2022-19 defect relief; ubiquitous for S-corp PE acquisitions |
| **§368(a)(1)(A) Statutory Merger** | Carryover basis | Tax-deferred to extent of stock; boot = recognized gain | ≥40% stock COI floor [Reg §1.368-1(e)(2)(v) Ex.1]; 50% for advance ruling [Rev. Proc. 77-37] |
| **§368(a)(1)(B) Stock-for-Stock** | Carryover basis | Fully tax-deferred (no boot allowed) | "Solely voting stock" + 80% control |
| **§368(a)(1)(C) Stock-for-Assets** | Carryover basis | Tax-deferred + boot if any | "Solely voting stock" + "substantially all" (90% NW / 70% GA per Rev. Proc. 77-37) |
| **§368(a)(1)(F)** | Asset treatment (LLC convert) | Tax-deferred rollover; LTCG on cash-out portion | S-corp specialty; full QSub election sequence |
| **§368(a)(2)(D) Forward Triangular** | Carryover basis at subsidiary | Tax-deferred to extent of stock; boot taxable | 80% stock COI; "substantially all" |
| **§368(a)(2)(E) Reverse Triangular** | Preserves target contracts; carryover basis | Tax-deferred to extent of stock | ≥80% voting stock required |
| **§351 Contribution** | Outside §368 framework; 80% control test | Tax-deferred to extent of stock (§351(a)); boot taxable (§351(b)); §357(c) liabilities>basis trap | Common for rollover into PE NewCo, JV formation, HoldCo creation |
| **§355 Spin-off** | Tax-deferred at corporate and shareholder level if §355 met | Tax-deferred | 5-yr ATB; device test; business purpose; §355(e) anti-Morris Trust (50%+ acquisition triggers gain) |

### 9.3 OBBBA POST-JUL 4 2025 — Permanent Provisions (UPDATE from V18a)

| Provision | Pre-OBBBA | Post-OBBBA (Permanent) |
|---|---|---|
| §168(k) Bonus Depreciation | Phasing down (60% 2024, 40% 2025...) | **100% permanent** for property acquired AND placed in service after Jan 19, 2025 [OBBBA §70301, Notice 2026-11] |
| §168(n) Qualified Production Property | Did not exist | **100% expensing** for non-residential real property in qualified production activities; construction begins after Jan 19, 2025, before Jan 1, 2029; PIS after Jul 4, 2025, before Jan 1, 2031; 10-yr §1245-like recapture; election required [OBBBA §70307, Notice 2026-16] |
| §163(j) ATI Computation | EBIT-based (2022–2024) | **EBITDA-based permanent** for tax years beginning after Dec 31, 2024 [OBBBA §70302, FS-2025-9] |
| §1202 QSBS | $10M / 10× cap; $50M gross assets; 100% only at 5-yr hold | $15M or 10× basis cap; $75M gross assets; **tiered 50%/75%/100% exclusion at 3/4/5 years** for stock issued after Jul 4, 2025; non-excluded portion taxed at 28% [OBBBA §70425] |
| NCTI (formerly GILTI) | 10.5% ETR; 80% FTC; QBAI reduction | **12.6% ETR (post-FTC ~14%); 90% FTC; QBAI/NDTIR eliminated** [OBBBA §70322] |
| FDDEI (formerly FDII) | 13.125% ETR | **~14% ETR**; §367(d) deemed royalties no longer FDDEI [OBBBA §70322] |
| BEAT | Scheduled to rise to 12.5% | **10.5% permanent** [OBBBA §70322] |
| SALT Deduction Cap | $10,000 | **$40,000 in 2025** with MAGI >$500K phaseout (complete ~$600K); reverts to $10,000 in 2030 [OBBBA §70505] |
| Section 899 (punitive on unfair foreign taxes) | Proposed | **REMOVED from final OBBBA** |

### 9.4 §1060 PPA — Residual Method (Carried from V18a, Operationalized)

Allocation order:

```
Class I — Cash and cash equivalents
Class II — Actively traded securities, CDs
Class III — Mark-to-market assets, AR
Class IV — Inventory
Class V — All PP&E and other tangible
Class VI — §197 intangibles other than goodwill (customer lists, non-competes, patents)
Class VII — Goodwill and going-concern value (residual)
```

For each class k (in order I → VII):
```
Allocation_k = MIN( FMV_k , Remaining_Consideration_before_k )
```

Class VII receives whatever is left.

**Negotiation dynamic:**
* Buyer wants more in V (PP&E, §168(k) 100%), VI (§197 15-yr SL), VII (§197 15-yr SL) — all depreciable/amortizable
* Seller wants more in I-IV (no recapture, LTCG)
* Recapture exposure: V (§1245 ordinary up to depreciation taken; §1250 special)
* Form 8594 filed by both buyer and seller; must reconcile

**Yulia's §1060 Optimizer Output (`MODEL.STRUCT.PPA.v1`):**
* Surfaces buyer NPV of tax shield by allocation
* Surfaces seller after-tax proceeds by allocation
* Computes ZOPA: the allocation range where buyer pays more for one class than seller foregoes
* Yulia narrates Options → Implications → asks the user to choose

### 9.5 §382 NOL Limitation (Carried from V18a, with 2026 LTTER updates)

```
Annual §382 Limit = FMV of Loss Corp Equity (at ownership change date) × LTTER
```

* LTTER updated monthly by IRS Rev. Rul.
* May 2026: **3.65%** [Rev. Rul. 2026-9]
* Feb 2026: 3.56% [Rev. Rul. 2026-03]
* Jan 2026: 3.51% [Rev. Rul. 2026-02]
* Yulia auto-pulls current LTTER from L2 cache (refreshed monthly per IRS IRB)

**§382(l)(1) Anti-Stuffing:** FMV equity is reduced by capital contributions in the 2 years preceding the ownership change if motivated by NOL preservation. Yulia flags this for any pre-sale equity raise.

**NUBIG / NUBIL (Net Unrealized Built-In Gain / Loss):**
* If NUBIG > threshold: built-in gains recognized in 5-yr post-change period increase §382 limit (Notice 2003-65 §1374 approach OR §338 approach; Sep 2025 IRS withdrew proposed regs that would have abolished §338 method — both methods remain valid)
* If NUBIL > threshold: built-in losses are §382-limited
* Yulia does NOT opine on NUBIG/NUBIL eligibility (Mode 2: defer to counsel + tax adviser)

### 9.6 §163(j) Interest Limitation (Post-OBBBA UPDATE)

```
§163(j) Limit = Business Interest Income + 30% × ATI + Floor Plan Financing Interest

Post-OBBBA ATI (for tax years beginning after Dec 31, 2024):
ATI = Taxable Income
    + Net Business Interest Expense
    + Depreciation
    + Amortization
    + Depletion
    – Business Interest Income
    – Floor Plan Financing Interest
    – Subpart F / §951A NCTI
    – §78 gross-up
    – §245A
```

**Critical hallucination guard:** 2022–2024 used EBIT-based ATI (D&A NOT added back). Post-OBBBA permanently restored EBITDA-based ATI. Yulia must default to EBITDA-based ATI for any tax year beginning Jan 1, 2025 or later [FS-2025-9, IR-2025-126].

**LBO Impact:** Restoring D&A add-back materially increases ATI, materially increases §163(j) cap, materially increases LBO debt capacity. Yulia recomputes max debt capacity for active deals after every Fed rate move OR tax-year boundary.

### 9.7 §168(k) Bonus Depreciation (Post-OBBBA UPDATE)

```
Year-1 Deduction = Eligible Basis × 100%  (post Jan 19, 2025)
```

**Elective opt-out:** Taxpayer may elect 40% (60% for long-production-period property/aircraft) for first tax year ending after Jan 19, 2025 [Notice 2026-11].

**Pitfall — Contracts signed Dec 2024 closing Feb 2025:** May still fall under 40% TCJA phase-down because acquisition date triggers under written binding contract rule. Yulia flags this for any contract dated before Jan 19, 2025 with later closing.

**Cost Segregation Interaction:** Cost seg studies reclassify long-life real property components into §168(k)-eligible shorter-life property → 100% Year-1 expensing. Yulia surfaces cost seg opportunity for any asset deal with real property where the buyer is purchasing fee real estate.

### 9.8 §168(n) Qualified Production Property (NEW post-OBBBA)

100% Year-1 expensing for nonresidential real property used in:
* Manufacturing
* Refining
* Agricultural production
* Chemical production
* Other qualified production activities

**Requirements:**
* Construction begins after Jan 19, 2025 AND before Jan 1, 2029
* Placed in service after Jul 4, 2025 AND before Jan 1, 2031
* Affirmative election required (irrevocable)
* 10-year recapture period; recapture is §1245-like ordinary
* Excludes: office, administrative, lodging, parking, R&D, software engineering

**Application:** Yulia surfaces §168(n) opportunity for any L4+ deal where target is a manufacturer / refiner / chemical / ag producer with planned new construction or expansion within the eligibility window.

### 9.9 §1202 QSBS (Post-OBBBA UPDATE)

| Provision | Pre-OBBBA | Post-OBBBA (stock issued after Jul 4, 2025) |
|---|---|---|
| Exclusion Cap | Greater of $10M or 10× basis | **Greater of $15M or 10× basis** |
| Gross Assets Ceiling | $50M at issuance | **$75M at issuance** |
| Holding Period | 5 years for 100% exclusion | **Tiered: 50% at 3 yrs, 75% at 4 yrs, 100% at 5 yrs** |
| Rate on Non-Excluded | Regular LTCG | **28% on non-excluded portion** |

**State Conformity (CRITICAL):**
* Full conformity: most states
* Full non-conformity (no §1202 exclusion): CA, PA, AL, MS
* Partial: HI (50%)
* NJ: conforms tax years beginning Jan 1, 2026
* DC: decoupled from OBBBA 2025

**Yulia's §1202 Screen:** Pre-issuance check for active business requirement, C-corp status, 80% asset-use test, qualified trade/business test. Mode 2 defer-to-counsel for any opinion on eligibility (qualification opinions belong to tax counsel).

### 9.10 §453 Installment Sale (Carried from V18a, refined)

Seller defers recognition of gain proportionally to cash received:
```
Gain Recognized in Year t = (Gross Profit / Total Contract Price) × Payments Received in Year t
```

**§453A Interest Charge:** If seller's installment receivables exceed $5M (in aggregate by yr-end), the deferred tax is subject to an interest charge:
```
§453A Interest = Deferred Tax × Underpayment Rate × (Days Deferred / 365)
```

**Excluded from §453:**
* Inventory
* Publicly traded securities
* Marketable securities
* Recapture income (§1245/§1250) — recognized in year of sale regardless

**Earnout Treatment under §453:**
* Default: contingent payment installment treatment (Treas. Reg. §15A.453-1)
* Maximum-stated price method (if cap exists)
* Fixed-period method (if duration fixed but amount contingent)
* Basis recovery: ratable over contingency period
* Yulia computes seller after-tax cash flow under each method

### 9.11 Earnout Tax Treatment (Carried, with V19 expansion)

**The Key Distinction:** Is the earnout consideration for the equity (purchase price) or for the seller's continued service (compensation)?

| Factor | Purchase Price (preferred for seller) | Compensation (preferred for buyer) |
|---|---|---|
| Tied to continued employment? | NO | YES |
| Conditioned on staying through period? | NO | YES |
| Pro-rated to service days? | NO | YES |
| Forfeited if seller leaves? | NO | YES |
| Character | Capital gain (LTCG) | Ordinary income |
| Treatment | §453 installment | §61/§83 compensation |
| Buyer deduction | Capitalized into purchase price | Currently deductible |
| Payroll taxes | None | Both sides |

**Defensive Drafting:** Yulia surfaces the *Lane Processing Trust* (25 F.3d 662, 8th Cir. 1994) framework: language matters, but substance over form prevails. Earnouts that are forfeitable on departure are presumptively compensation.

**§409A Interplay:** Compensation-treated earnouts that defer past 2.5 months after the year earned trigger §409A. Yulia flags any earnout >2.5 months post-end-of-service-year as a §409A risk; defer-to-counsel for structuring.

### 9.12 Rollover Equity Tax Pathways (Carried from V18a, V19 refined)

| Pathway | Mechanism | Tax Result | Use Case |
|---|---|---|---|
| Taxable | Sell stock, buy NewCo stock with proceeds | LTCG on full sale; new basis in NewCo | When seller wants step-up at NewCo for future exit |
| §368 Reorg | Stock-for-stock reorg | Tax-deferred up to stock; boot taxable | Public/large corporate acquisitions |
| §351 Contribution | Contribute stock to NewCo for stock (80% control test) | Tax-deferred up to stock; boot taxable | PE NewCo formation; HoldCo creation |
| §721 Partnership Contribution | Contribute stock/assets to partnership for partnership interest | Tax-deferred | PE LLC-formed acquirer (most common modern PE structure) |
| F-Reorg + §721 | F-reorg target S-corp → QSub → LLC; rollover into PE LLC via §721 | Tax-deferred rollover; cash portion = LTCG | Standard for S-corp PE acquisitions |

**Yulia's Rollover Optimizer (`MODEL.STRUCT.ROLLOVER.v1`):**
* Computes seller after-tax proceeds under each pathway
* Computes basis tracking for future exit
* Surfaces lock-up period implications
* Asks: cash now vs equity later — what's your liquidity need?

### 9.13 §280G Golden Parachute (Carried from V17 § 9.x, V19 expanded)

**3× Base Trigger:**
```
Base Amount = Average W-2 Box 1 over 5 yrs preceding change of control year
3× Base Threshold = 3 × Base Amount

If parachute payments ≥ 3× Base Amount:
   Excess Parachute = Total Parachute Payments – 1× Base Amount
   Excise Tax (employee) = 20% × Excess Parachute (§4999)
   Lost Deduction (employer) = Excess Parachute (§280G)
```

**Cliff effect:** $1 over 3× triggers excise tax on entire excess (above 1× base). Yulia identifies "cliff exposure" — payments that, if reduced even slightly, fall below the 3× threshold and avoid excise tax entirely.

**Disqualified Individuals (DI):**
* Officers (max 50, per Treasury count)
* >1% shareholders
* Top 1% Highly Compensated Employees (2024 threshold: $155K; updated annually)

**Cleansing Vote (Private Company Carve-Out):**
* 75% disinterested shareholders approve excess parachute payments
* S-corps statutorily exempt [§280G(b)(5)(A)(i)]
* Yulia generates: DI identification, parachute calc, cleansing vote materials (defer-to-counsel for final form)

**Reasonable Compensation Carve-Out:** Post-close service or non-compete agreements with valid consideration reduce parachute amount. Yulia identifies allocation opportunities; defer-to-counsel for the valuation opinion.

### 9.14 Partnership-Specific Provisions (Carried from V18a)

| Section | Topic | Application |
|---|---|---|
| §754 Election | Step-up basis upon partnership interest transfer | Buyer of LLC interest gets §743(b) step-up; election required at partnership level |
| §743(b) | Inside basis adjustment on transfer | Step-up tax shield to buyer; computed at transfer date |
| §734(b) | Inside basis adjustment on distribution | Less common in M&A context |
| §751 Hot Assets | Ordinary income items in partnership | Unrealized AR, inventory, recapture — recognized as ordinary on sale |
| §1.704-1(b) | Substantial economic effect | Partnership allocation rules; relevant for waterfall design |
| §721 Contribution | Tax-deferred contribution to partnership for partnership interest | Modern PE rollover standard |

### 9.15 International Tax (Carried from V18a, V19 Post-OBBBA Updates)

| Regime | Post-OBBBA Status |
|---|---|
| NCTI (formerly GILTI) | 12.6% ETR pre-FTC; 90% FTC; QBAI eliminated [OBBBA §70322] |
| FDDEI (formerly FDII) | ~14% ETR; §367(d) deemed royalties not eligible [OBBBA §70322] |
| BEAT | 10.5% permanent (scheduled rise to 12.5% avoided) [OBBBA §70322] |
| §367 Outbound Transfers | Unchanged framework; §367(d) IP transfers now permanent royalty regime |
| §482 Transfer Pricing | Arm's-length standard; CSA / cost-share rules |
| Pillar Two | 15% global minimum; CbC reporting; QDMTT vs IIR vs UTPR; sided with by IRS in 2025 guidance |
| Section 899 | REMOVED from OBBBA final |

### 9.16 SALT & Multi-State (Carried from V18a, V19 expanded)

**Top 10 M&A Jurisdictions Yulia must be fluent in:**

| State | Distinctive Provisions |
|---|---|
| DE | Franchise tax; FRC controlling interest transfer; corporate franchise on M&A |
| NY | NYC UBT; NY State PTET; mansion tax 1–4.15%; CITT for real-estate-heavy targets |
| CA | No QSBS conformity; PTE election; LLC fee; aggressive sales-tax nexus |
| TX | No income tax; franchise tax; sales tax on assets in asset deals |
| FL | No income tax; documentary stamp tax; sales tax on assets |
| IL | PTE elective; replacement tax; sales tax on assets |
| MA | PTE elective; sales tax on assets |
| NJ | PTE elective; conforms QSBS only for stock issued post Jan 1, 2026 |
| WA | No income tax; 1.5% B&O service tax; B&O on M&A receipts |
| PA | No QSBS conformity; sales tax on assets |

**PTE Election Mechanics:** State allows entity to elect into pass-through-entity tax at entity level → federal deduction at entity level → owner federal SALT deduction restored. ~36 states have enacted; mechanics vary. OBBBA preserved PTE; raised federal cap to $40K (2025), reverts $10K 2030.

**Real Estate Transfer Tax (RETT) and Controlling Interest Transfer Tax (CITT):**
* RETT: imposed on deed/instrument transfer; rates 0–5%+ varying
* CITT: imposed on >50% ownership change of entity owning real estate; **stock-deal trap** — non-obvious in stock purchase
* Yulia flags CITT exposure on any L3+ deal where target owns real estate (fee or material leasehold)

**Sales/Use Tax in Asset Deals:** Bulk sale exemption available in some states; not all. Yulia flags for any L1–L4 asset purchase.

### 9.17 Industry Tax Overlays (from V18a + V19 Research)

| Industry | Specialty Provision |
|---|---|
| Real Estate | §1031 LKE (real property only post-TCJA); §453A interest charge; depreciation recapture §1250 |
| Cannabis | §280E (federal): no deductions other than COGS; April 23, 2026 DOJ Final Order made medical cannabis Schedule III; **§280E continues to apply to recreational (still Schedule I)** — Yulia confirms current scheduling at session |
| Manufacturing | §168(n) QPP eligibility check; §199A QBI (if S-corp/LLC) |
| Healthcare | §501(r) for nonprofit acquisitions; CHOW reporting; DEA registration transfer (controlled substances) |
| Tech / SaaS | §174 R&E capitalization (TCJA, may be amended); §41 R&D credit; §1202 QSBS standard play |
| ESOP-Owned | §1042 tax-deferred sale to ESOP; §4975 prohibited transaction; valuation by independent appraiser |
| Financial Services | REIT, BDC, RIC structures; §856 REIT rules; SIPC; SEC Investment Company Act |

### 9.18 Decision Trees by League (Carried from V18a)

**L1–L2 (sub-$2M):**
* Asset deal almost always (90%+)
* §1060 PPA + §168(k) for buyer
* §453 installment if seller note involved
* No §382 issue (no NOLs typically)
* SBA financing dominant; consult lender on PPA acceptability

**L3–L4 ($2M–$50M):**
* Asset vs stock decision is real (gross-up analysis required)
* §338(h)(10) common for S-corp targets
* F-reorg dominant for S-corp PE acquisitions
* §1060 + §168(k) + §168(n) for asset / §338(h)(10) deals
* QSBS check for early-stage targets
* §163(j) usually not binding (under $25M gross receipts test exemption)

**L5–L6 ($50M–$250M):**
* Full structuring options on the table
* §382 NOL analysis usually relevant
* §163(j) becomes binding (above $30M average gross receipts)
* Rollover equity standard (§721 or §351 path)
* International overlay if any foreign ops (NCTI, BEAT)
* RWI standard; tax indemnity carve-outs negotiated

**L7+ ($250M+):**
* All structuring options + international tax planning
* §382, §163(j), NCTI/FDDEI/BEAT all binding
* Multi-jurisdiction tax planning
* Pillar Two compliance if multinational
* Tax counsel and Big 4 transaction tax advisors standard

### 9.19 Tax Knowledge Gap & Defer Triggers (Carried from V18a)

Yulia must defer to a CPA / tax counsel for:
* §1202 QSBS qualification opinion on specific facts
* §382 NUBIG/NUBIL studies on specific assets
* §338(h)(10) joint election strategic analysis with C-corp seller
* QSub timing analysis
* §280G shareholder cleansing vote process and forms
* Debt-vs-equity characterization of complex instruments
* Rollover §351/§721 structuring opinion
* Transaction cost capitalization (Reg §1.263(a)-5) determination
* International tax structuring (NCTI/FDDEI/BEAT optimization)
* State tax nexus opinion
* PTE election timing and benefit analysis on specific facts
* Pre-sale C→S conversion tax cost


---

## 10.0 LEGAL FRAMEWORKS ENGINE (Absorbs V18b + Research)

V18b built the Harvard Law-grade legal awareness architecture. V19 incorporates V18b wholesale with research updates. Key Mode 2 (defer-to-counsel) triggers remain the regulatory firewall.

### 10.1 The Regulatory Line — smbX.ai's Software-Side Boundary (Carried from V18b R.2)

Four non-negotiable product rules anchored in Securities Exchange Act §15(a) and the SEC six-factor broker-dealer test:

1. **Pure SaaS subscription pricing.** Never tie fees to deal closing, capital raised, or transaction value. Even small success fees import broker analysis [In re Neovest, Inc., Exchange Act Rel. No. 92291 (Jun 29, 2021)].
2. **Yulia drafts; the user sends.** Every counterparty-facing artifact must be drafted FOR user, sent BY user, under user's name. Anchors user as speaker under Rule 3a4-1 issuer-personnel safe harbor.
3. **No custody, no negotiation-on-behalf-of, no soliciting specific investors for specific deals.** Each is factor 3, 4, or 5 of the broker test; any one alone can be sufficient.
4. **Disclaim adviser/fiduciary status persistently.** "Yulia is not your attorney, broker, investment adviser, fiduciary, financial planner, or M&A broker." Never use "AI advisor" or fiduciary language. AI-washing enforcement [In re Delphia, In re Global Predictions, March 2024] reinforces.

### 10.2 The §15(b)(13) M&A Broker Exemption (Carried from V18b)

Codified Dec 29, 2022. Permits unregistered M&A brokers to facilitate transfer of "eligible privately held company" if:
* Target is privately held
* Target has EITHER ≤$25M EBITDA OR ≤$250M revenue (preceding fiscal year)
* Acquirer takes control (>25% voting or ability to direct mgmt)
* Acquirer actively operates business post-close
* No shell companies; no securities offerings to the public

smbX.ai operates as **software**, not as M&A broker. The §15(b)(13) exemption is the BACKUP path for our brokers and bankers who ARE M&A brokers — Yulia helps them stay within it. For smbX.ai itself, the software boundary is paramount.

### 10.3 The Three Operating Modes (Carried from V18b R.1)

| Mode | What Yulia Does | What Yulia Says |
|---|---|---|
| **MODE 1 — Continuous Awareness** | Spots issues, surfaces options, models implications, drafts scaffolds, benchmarks against market | "Here's what's at stake. Here are your options. Here's the market practice. Here's the implication of each path." |
| **MODE 2 — Defer to Counsel** | Identifies attorney-required moment. Halts substantive output. Routes to counsel with briefing packet. | "This needs your attorney. Here's the issue. Here's the briefing packet I've prepared. Here are 3 questions to ask them." |
| **MODE 3 — Research Externally** | Knows rule exists but threshold/state-rule changes too often to memorize. Fetches current authoritative source. | "Let me pull the current language from [SEC.gov / sba.gov / Federal Register / state statute] before I answer." |

### 10.4 The Three Architectures (Carried from V18b § 1.1)

| Architecture | Key Characteristic | Tax Default | Legal Doc Pack |
|---|---|---|---|
| **Asset Purchase** | Buyer cherry-picks assets; leaves liabilities | Step-up basis; §168(k) eligible | APA + Bills of Sale + Assignment & Assumption + 3rd Party Consents |
| **Stock Purchase** | Buyer acquires entity; takes everything | Carryover basis (no step-up unless §338(h)(10)) | SPA |
| **Merger** | Statutory combination (forward, reverse triangular, two-step) | Depending on §368 qualification | Merger Agreement + Plan of Merger + Certificates of Merger |

### 10.5 Standard Reps & Warranties — Eight Articles Framework (Freund / Kling & Nugent, Carried from V18b § 2.1)

1. **Authority & Capacity** — fundamental
2. **Title to Securities / Assets** — fundamental
3. **Financial Statements** — operational
4. **Operations Since Reference Date** — operational (ordinary course covenant)
5. **Specific Asset / Liability Items** — operational
6. **Compliance with Law** — fundamental + operational
7. **Litigation** — operational
8. **Specific Risk Areas** — industry-specific

### 10.6 Indemnification Architecture (Market Standard 2025 per ABA + SRS Acquiom)

#### 10.6.1 Cap, Basket, Survival (Updated from V18b § 2.3 with research)

| Provision | RWI Deal (now 63% of ABA 2025 deals) | Non-RWI Deal |
|---|---|---|
| **Cap** | 0.25% of TV median (essentially the retention level) | 8–12% of TV median |
| **Basket Size** | ≤0.5% of TV (56% of deals); ≤1% (majority) | Similar |
| **Basket Type** | Deductible 67–70% (essentially 100% deductible) | Deductible majority |
| **Survival — General** | 12–24 months | 12–24 months |
| **Survival — Fundamental** | SoL or 6 yrs | SoL or 6 yrs |
| **Survival — Tax** | SoL + 60 days | SoL + 60 days |
| **No Survival of Reps** | 41% (up from 30% in ABA 2023) | rare |
| **Materiality Scrape — Double** | 82% (up from 69%) | 75%+ |
| **Sandbagging — Silent** | ~76% (no clause either way) | ~76% |
| **Sandbagging — Pro-Buyer** | 19% | 19% |
| **Sandbagging — Anti-Sandbag** | 5% | 5% |
| **Fraud Carve-Out** | 85% have one | 85% |
| **Fraud — Undefined** | 11% (just "fraud") | 11% |
| **Fraud — Limited to Contractual Reps** | 70% | 70% |
| **Non-Reliance Clause** | 81% | 81% |

#### 10.6.2 Yulia's Indemnification Economics Model (`MODEL.LEGAL.INDEM.v1`)

Converts every indemnification provision to a dollar-exposure number:

```
Indemnification Dollar Exposure (per rep category):
  = Probability of Breach × Loss if Breached × (1 – Indemnity Recovery Rate)
  – Insurance Recovery (if RWI)
  + Time Discount (PV)
```

For each rep category (8-article framework):
* Probability of breach: empirical from SRS Claims Insights (~22% of deals have a notification, ~4% reach payout, average claim ~$2.4M)
* Loss if breached: scenario range
* Indemnity recovery: capped at indemnity cap; reduced by basket; reduced by survival expiration
* RWI recovery: 90%+ of paid claims reach full limit

Output: Yulia surfaces "Total Indemnification Exposure" by scenario; the Analysis → Options → Implications pattern asks the user: "Want to push for higher cap, larger RWI, longer survival, or live with current package?"

### 10.7 MAE / MAC — Akorn Framework (Carried from V18b § 2.5)

**Verbatim from Akorn (C.A. No. 2018-0300-JTL, Del. Ch. Oct 1, 2018, Laster V.C., aff'd 198 A.3d 724, Del. 2018):**

> An MAE must "substantially threaten the overall earnings potential of the target [company] in a **durationally-significant** manner... measured in years rather than months."

**Akorn-aligned MAE indicators:**
* ~20% valuation decline + qualitative regulatory pervasiveness (Akorn affirmed)
* Compare baseline ordinary-course expectations (year-over-year) and assess whether decline is durable

**Channel Medsystems (Del. Ch. Dec 18, 2019, Bouchard C.):** Employee fraud NOT imputed to seller for MAE purposes; specific performance ordered. Lesson: scope what's a covered MAE event carefully.

**AB Stable v. MAPS Hotels (2020 WL 7024929, Del. Ch. Nov 30, 2020, aff'd 268 A.3d 198, Del. 2021):** Ordinary course covenant breach (closing 2 hotels in pandemic) excused buyer **despite no MAE**. Ordinary course is its own gate.

**Snow Phipps (C.A. 2020-0282-KSJM, Apr 30, 2021, McCormick C.):** Prevention doctrine — buyer materially contributed to financing failure; specific performance ordered.

**Bardy Diagnostics (C.A. 2021-0175-JRS, Jul 9, 2021, Slights V.C.):** 86% Medicare reimbursement reduction NOT MAE; "Tyson right uppercut" insufficient without durational analysis.

**Mode 2 (Defer to Counsel):** Yulia surfaces Akorn / Channel / Snow Phipps / Bardy / AB Stable as framework; **NEVER opines on whether THIS event IS an MAE**. Counsel only.

### 10.8 Sandbagging — State Defaults When Silent (Carried from V18b § 2.4)

| State | Default Position When Silent |
|---|---|
| Delaware | Generally pro-buyer (buyer can sandbag — knowledge does not preclude recovery), based on *Cobalt Operating* (2007) and progeny |
| New York | Anti-sandbagging — buyer's knowledge precludes recovery (*CBS v. Ziff-Davis*) |
| California | Conflicting; case-by-case |
| Most other states | Anti-sandbagging or unclear |

**Yulia's Output:** Identifies governing law clause, applies default, surfaces explicit clause options (Pro-Buyer / Anti-Sandbag / Silent). Recommends explicit clause to avoid uncertainty.

### 10.9 R&W Insurance — Market State (UPDATE from V18b with 2025-2026 data)

#### 10.9.1 Current Pricing & Structure

| Metric | Value | Source |
|---|---|---|
| **NA Primary Rate** | +16% YoY 2025 (vs −14% 2024) | [Marsh TRI 2025] |
| **Q4 2025 Average ROL** | **3.23%** of policy limit | [Lockton Q4 2025] |
| **Q4 2024 Average ROL** | 2.5% | [Lockton] |
| **Market Practice ROL** | 2.5–3.0% (vs ~5% early 2022) | [Marsh TRI 2025] |
| **Initial Retention** | 0.5–0.75% EV (1% for <$500M; 0.5% achievable >$500M) | [Marsh TRI 2025] |
| **Retention Drop** | ~0.4% after 12 months | [Marsh TRI 2025] |
| **Coverage Typical** | 10% EV | [Marsh TRI 2025] |
| **Underwriting Fee** | $30K–$80K (complex >$100K) | [Marsh TRI 2025] |
| **Timeline** | 4–6 weeks underwriting; 2–3hr DD call | [Marsh TRI 2025] |
| **Claims Notification Rate** | ~20% of policies | [Marsh TRI 2025] |
| **Claims Payment Rate** | ~4% of policies | [Marsh TRI 2025] |
| **Paid Claims Reaching Full Limit** | ~25% (1 in 4) | [Marsh TRI 2025] |

#### 10.9.2 Yulia's R&W Pricing Model (`MODEL.LEGAL.RWI.PRICING.v1`)

Input: deal size, sector, jurisdiction, retention preference, target diligence quality.
Output: estimated ROL range, retention dollar amount, total premium cost, expected indemnification savings, NPV of RWI vs. traditional indemnity.

#### 10.9.3 RWI as Indemnity Substitute (Standard Modern Practice)

In RWI deals, traditional indemnity caps drop to ~0.25% of TV (essentially zero). The RWI policy becomes the primary indemnification vehicle. Sellers get clean exit; buyers get insured recovery. Fundamental reps and tax reps frequently sit above RWI as carved-out seller exposure.

### 10.10 Securities & Capital Raise (Carried from V18b § 3, Updated)

#### 10.10.1 Reg D Exemptions

| Rule | Limits | Investor Type | General Solicitation |
|---|---|---|---|
| **506(b)** | No dollar cap | Up to 35 sophisticated + unlimited accredited | No |
| **506(c)** | No dollar cap | Accredited only — must verify | Yes |
| **Reg A Tier 1** | $20M / 12mo | Anyone | Yes (with qualifications) |
| **Reg A Tier 2** | $75M / 12mo | Anyone, with limits for non-accredited | Yes (with qualifications) |
| **Reg CF** | $5M / 12mo | Anyone, with income/net-worth caps | Through funding portal |
| **Rule 144A** | No cap | QIBs only | Restricted |

**March 12, 2025 Latham NAL:** Added minimum-investment safe harbor for accredited investor verification under 506(c). Yulia surfaces this for raises using 506(c).

#### 10.10.2 SAFE & Convertible Note Mechanics

**Post-Money SAFE (YC standard since 2018):**
```
SAFE Conversion Price = MIN( Discount Price, Cap Price )

Cap Price = Post-Money Valuation Cap / Co. Capitalization (incl. converting securities)
Discount Price = Series A Price × (1 – Discount Rate)
```

Post-money SAFE locks % ownership at signing: $1M SAFE / $10M cap = exactly 10% post-conversion (not "approximately 10%").

**Pre-Money SAFE (older YC version):**
```
SAFE Conversion Price = Pre-Money Cap / Pre-Money Capitalization
```
Pre-money SAFE leaves % ambiguous until Series A pricing.

**⚠️ Hallucination Guard:** Pre-money vs post-money SAFE math is the #1 SAFE error. Yulia always confirms which version the user is on before computing dilution.

#### 10.10.3 Rule 10b-5 (Always Applies)

Even in exempt offerings, Rule 10b-5 anti-fraud applies. Yulia surfaces material risks and ensures disclosure language is included in any deck draft, but does NOT opine on adequacy of disclosure (Mode 2: counsel only).

### 10.11 HSR Antitrust (UPDATED for 2026)

| Threshold | 2026 Value |
|---|---|
| Size of Transaction | $133.9M |
| Size of Person | $267.8M / $26.8M |
| Auto-Reportable | $535.5M |
| Filing Fee (entry tier) | $30,000 |
| Filing Fee (top tier) | $2.46M |

**Effective Feb 17, 2026** [FTC 2026 HSR; 91 Fed. Reg. 2133].

**Yulia's HSR Triage:**
* Auto-flag any deal where TV > $133.9M for HSR analysis
* Compute filing fee tier
* Identify second-request probability based on HHI delta (Mode 2 for opinion)
* Defer to counsel for Form HSR preparation, Item 4(c)/(d) responsiveness, second-request strategy

### 10.12 CFIUS (Carried from V18b § 4.2, Updated 2026)

* Declaration: 30-day assessment
* Notice: 45 + 45 + 15 = 105 days statutory max
* TID U.S. Business test: Critical Technology, Critical Infrastructure, Sensitive Personal Data (>1M)
* Mandatory filings: foreign govt ≥49% acquiring ≥25% in TID; or critical tech requiring U.S. export license
* Filing fee cap: lesser of 1% TV or $300K; $0 for Declarations
* 2024 penalty cap raised to $5M per violation or TV
* Feb 2025 Trump EO "America First Investment Policy"; restrict China, fast-track allies

**Yulia's CFIUS Triage:**
* Identifies any non-U.S. acquirer / investor
* Identifies any TID U.S. business attribute
* Surfaces mandatory vs voluntary filing analysis (Mode 2)

### 10.13 DGCL SB 21 (Mar 25, 2025) — Major Update

**Key Changes:**
* §144 Cleansing — moved from conjunctive MFW for non-going-private to **disjunctive** (independent committee OR majority-of-minority vote, not both)
* §220 Books-and-Records — narrowed permitted purposes and scope
* §141(c) Committee delegation — clarified

**Match Group II / MFW Progeny:**
* MFW: SIX elements (not five). Independent committee AND majority-of-minority both required for going-private controller transactions.
* Match Group II expanded MFW to all controller transactions (not just going-private).
* SB 21 §144(b) softens to **disjunctive** for non-going-private controller transactions only.
* Going-private still requires conjunctive MFW.

**Yulia's Controller Transaction Module:**
* Identifies controller status (common-law or statutory)
* Identifies transaction type (going-private vs other)
* Surfaces MFW conditions (independent committee + majority-of-minority disinterested vote)
* Mode 2: defer to counsel for controller-status opinion and conditions imposed *ab initio*

### 10.14 Fiduciary Duties — Three Standards of Review (Carried from V18b § 6.1)

| Standard | Trigger | Burden |
|---|---|---|
| **Business Judgment Rule** | Default — informed, disinterested, good-faith decisions | Plaintiff must rebut |
| **Enhanced Scrutiny — Revlon** | Sale of control / break-up / cash-out | Board must show reasonable process AND reasonable result |
| **Enhanced Scrutiny — Unocal** | Defensive measures (poison pill, etc.) | Board must show reasonable threat AND proportional response |
| **Entire Fairness** | Conflicted controller transaction | Defendant must show fair price AND fair dealing |

**Revlon (Del. 1985):** Once sale of control is the goal, directors must maximize short-term value for shareholders.
**Unocal (Del. 1985):** Defensive measures subject to enhanced scrutiny.
**Caremark (Del. Ch. 1996):** Oversight duty — boards must make good-faith effort to implement compliance.
**MFW (Del. 2014):** Six-element framework for cleansing controller transactions via business-judgment review.

### 10.15 Non-Compete Map (UPDATED — FTC Rule DEAD)

**Critical 2025 Update:** FTC noncompete rule is DEAD. FTC voted 3-1 on Sep 5, 2025 to abandon appeal; 5th Cir. dismissed Sep 8, 2025. **State law controls.**

| State | Position |
|---|---|
| **California** | Total ban (Bus & Prof Code §16600) |
| **North Dakota** | Total ban |
| **Oklahoma** | Total ban |
| **Minnesota** | Total ban (effective 2023) |
| **Florida** | Strongly enforceable; CHOICE Act 2025 strengthens |
| **Wyoming** | Strongly enforceable post-2025 amendments |
| **Texas** | Enforceable with reasonable scope |
| **New York** | Reasonable scope (proposed bills pending) |
| **Massachusetts** | Garden leave required for >12 months; some employees excluded |
| **Washington** | Income threshold required |
| **Illinois** | Income threshold required |
| **Most other states** | Reasonable scope and consideration required |

**M&A Carve-Out:** Most state non-compete bans include carve-out for **sale of business** — selling owners may agree to longer/broader non-competes than ordinary employees. Yulia surfaces this carve-out in any seller-side scenario.

**Mode 3:** Yulia fetches current state statute for any deal where non-compete is operative.

### 10.16 §280G Golden Parachute (Cross-Reference § 9.13)

Legal mechanics covered in § 9.13. Legal carve-outs:
* Private company cleansing vote (75% disinterested shareholders, S-corp statutorily exempt)
* Reasonable compensation allocation (post-close services, non-compete)

**Mode 2:** Defer to counsel for cleansing vote process and valuation opinion.

### 10.17 §409A Deferred Compensation

* Triggered by any deferred compensation arrangement
* Violation penalty: ALL deferred comp current + prior years immediately taxable + 20% additional federal + interest charge
* Independent appraiser presumption: valid 12 months
* M&A application: earnout payments tied to service that defer >2.5 months past year of service

**Mode 2:** Defer to counsel for §409A valuation and structuring.

### 10.18 ERISA, ESOP, Multiemployer Pension (Carried from V18b § 5.6)

* ERISA fiduciary duty under §404
* ESOP transactions subject to §1042 tax-deferred sale + §4975 prohibited transaction rules
* Multiemployer pension withdrawal liability ("MEPP withdrawal") — can be catastrophic (hundreds of millions for large employers)
* Yulia flags multiemployer pension plan participation in any seller diligence

**Mode 2:** Defer to ERISA counsel and actuary.

### 10.19 SBA SOP 50 10 8 — Detailed Rules (Updated)

Effective Jun 1, 2025; technical updates Dec 2025; Feb 2026 amendments per Procedural Notice 5000-876441.

| Rule | Value |
|---|---|
| 7(a) Max Loan | $5,000,000 |
| 7(a) Small Loan Cap | $350,000 (reduced from $500K) |
| 504 Max Debenture | $5,500,000 |
| Equity Injection Required | **10%** |
| Seller Note as Equity | Only if FULL STANDBY for full 10-yr term AND ≤50% of equity injection |
| Citizenship | 100% US citizen / LPR (Mar 2026 carve-out: ≤5% non-resident) |
| Rollover Personal Guarantee | 2 years (rollover sellers) |
| Partial Buy-in Type | Stock deals only |
| DSCR Floor | 1.15× (SBA); 1.25× (lender); 1.50× (business acquisition) |
| Prepayment Penalty | 5% / 3% / 1% in Y1/Y2/Y3 on loans ≥15-yr |
| All-In Rates (Dec 2025) | 7.25–9.75% |

**Pending:** H.R. 3174 (House-passed Dec 2025) would double 7(a) max to $10M for NAICS 31-33 manufacturing. Not yet law.

**Yulia's SBA Module:**
* Auto-classifies deal as SBA-financeable (L1/L2 plus L3 borderline)
* Computes 10% equity, identifies seller note treatment
* Confirms DSCR ≥ 1.50× under stress (rev −20%, +200 bps SOFR)
* Surfaces prepayment penalty schedule
* Flags SOP 50 10 8 compliance items

### 10.20 IP, Privacy, Cyber (Carried from V18b § 7)

#### 10.20.1 IP Chain of Title

* Trademark federal vs state vs common law
* Patent assignment recording (USPTO)
* Copyright work-for-hire vs assignment
* Trade secrets — documentation and protection
* Software: §117 owner's rights, license vs assignment, escrow agreements

**Yulia's IP Module:**
* Surfaces chain-of-title gap risks
* Identifies open-source dependencies (license compatibility analysis — Mode 2 for opinion)
* Flags assignment-vs-license issues in software targets

#### 10.20.2 Open Source

License compatibility — GPL, LGPL, Apache, MIT, BSD, MPL. Copyleft vs permissive.

**Mode 2:** Defer to IP counsel for any commercial software target with significant open-source dependency.

#### 10.20.3 Privacy Law Matrix (Mid-2026)

19 states have comprehensive privacy laws. Active patchwork as of mid-2026: CA (CCPA/CPRA), VA, CO, CT, UT, IA, IN, TN, TX, MT, OR, DE, NH, NJ, RI, KY, MN, MD, NE.

**Yulia's Privacy Triage:**
* Identifies jurisdictions with operating exposure
* Surfaces breach disclosure obligations
* Surfaces consumer rights frameworks

**Mode 3:** Fetches current state privacy law for any deal where data is material to value.

#### 10.20.4 SEC Cybersecurity Rule (Form 8-K Item 1.05)

Effective Dec 18, 2023. Material cybersecurity incidents must be disclosed within 4 business days of materiality determination. C&DIs issued Jun 2024.

**Yulia's Cyber Triage:**
* For public-target deals, flags Item 1.05 obligations
* For private-target deals, identifies post-close cyber rep exposure
* Defer-to-counsel for materiality determination

### 10.21 Environmental (CERCLA) (Carried from V18b § 7.6)

* CERCLA: joint-and-several liability for PRPs (potentially responsible parties)
* Innocent landowner / bona fide prospective purchaser defenses require Phase I ESA conforming to ASTM E1527-21 (mandatory since Feb 13, 2024)
* PFOA/PFOS designated as CERCLA hazardous substances Jul 8, 2024

**Yulia's Environmental Module:**
* Surfaces Phase I ESA requirement for industrial / manufacturing / legacy real estate targets
* Identifies PFAS exposure (PFOA/PFOS)
* Flags CT Transfer Act sunset (replaced by Release-Based Cleanup Regs Mar 1, 2026)

### 10.22 PMI & Post-Closing Legal (Carried from V18b § 7.7)

* Post-closing covenants tracking
* Earnout dispute mechanics (specific performance, expert determination, arbitration)
* Working capital true-up dispute mechanics
* Indemnification claim notification and dispute
* Insurance claim coordination (RWI, GL, E&O, D&O run-off, environmental)

### 10.23 Forum, Arbitration, Damages (Carried from V18b § 2.10)

| Standard Drafting Default | Description |
|---|---|
| **Forum** | Delaware Chancery (for DE entities); NY Supreme Commercial Division (for NY) |
| **Governing Law** | DE for DE entities; state of incorporation default |
| **Damages — Hadley v Baxendale** | Foreseeable, direct damages recoverable; consequential excluded except via specific carve-out |
| **Liquidated Damages** | Reasonable estimate of damages; not a penalty |
| **Specific Performance** | Equitable remedy; available for M&A in DE (Snow Phipps, Channel Medsystems) |
| **Punitive Damages Carve-Out** | Excluded except for fraud |

### 10.24 Always-Halt Legal Categories (Carried from V18b § 8.2)

Yulia REFUSES to commit a position on:
1. Whether a specific document constitutes a security
2. Whether a specific instrument triggers §15(b)(13) ineligibility
3. Whether a specific MAE has occurred
4. Whether a specific non-compete is enforceable on specific facts
5. Whether a specific §1202 issuance qualifies
6. Whether a specific transaction is "going-private" for MFW purposes
7. Whether a specific controller-transaction satisfies MFW *ab initio*
8. Whether a specific HSR filing is required (close-call)
9. Whether a specific CFIUS filing is mandatory vs voluntary
10. Whether a specific party is a "broker" under SEA §15(a)
11. Whether a specific party owes fiduciary duty
12. Whether a specific privilege applies
13. Whether a specific tax position will survive IRS challenge
14. Whether a specific accounting treatment is GAAP-compliant
15. Anything labeled as "opinion of counsel"

Each halt category includes Yulia's defer-to-counsel template message.


---

## 11.0 DEAL MODEL CATALOG (NEW — V19)

This is the **index** of every model the L1 calc engine implements. Full schemas, formulas, inputs, outputs, and gating rules live in `SMBX_DEAL_MODEL_CATALOG.md`. Every model carries a stable identifier so Yulia can call it deterministically.

### 11.1 Model Naming Convention

```
MODEL.{CATEGORY}.{SUB}.{VARIANT}.v{N}
```

Examples:
* `MODEL.VAL.SDE.v1` — SDE-based valuation
* `MODEL.LBO.PE.PRIMARY.v1` — Standard PE LBO with debt schedule
* `MODEL.STRUCT.PPA.v1` — §1060 Purchase Price Allocation optimizer
* `MODEL.LEGAL.RWI.PRICING.v1` — R&W insurance pricing
* `MODEL.TAX.382.NOL.v1` — §382 NOL limitation calculator

### 11.2 Catalog Index by Category

#### A. Valuation Primitives

| Model ID | Purpose | League |
|---|---|---|
| MODEL.VAL.SDE.v1 | SDE-based valuation (multiple × SDE) | L1–L2 |
| MODEL.VAL.EBITDA.v1 | EBITDA-based valuation (multiple × adj EBITDA) | L3–L10 |
| MODEL.VAL.DCF.TWOSTAGE.v1 | Two-stage DCF with terminal value (Gordon or exit multiple) | L3+ |
| MODEL.VAL.DCF.THREESTAGE.v1 | Three-stage DCF (high-growth, transition, mature) | L5+ |
| MODEL.VAL.DCF.HMODEL.v1 | H-Model (Fuller & Hsia 1984) for linearly declining growth | L5+ |
| MODEL.VAL.WACC.CAPM.v1 | WACC build from CAPM | L5+ |
| MODEL.VAL.WACC.MODCAPM.v1 | Modified CAPM with size + industry + alpha | L4–L6 |
| MODEL.VAL.WACC.BUILDUP.v1 | Build-Up Method (no peer beta) for SMB | L1–L4 |
| MODEL.VAL.WACC.HAMADA.v1 | Hamada unlevering / re-levering for peer beta | L3+ |
| MODEL.VAL.COMPS.TRADING.v1 | Trading comparables 5-step methodology | L3+ |
| MODEL.VAL.COMPS.PRECEDENT.v1 | Precedent transactions analysis | L3+ |
| MODEL.VAL.COMPS.FOOTBALLFIELD.v1 | Football field synthesis (Damodaran / Rosenbaum & Pearl) | L4+ |
| MODEL.VAL.IMPLIED.LBO.v1 | LBO-implied valuation back-solve | L3+ |
| MODEL.VAL.MULT.SDE.v1 | EV/SDE library lookup (BizBuySell quarterly) | L1–L2 |
| MODEL.VAL.MULT.EBITDA.v1 | EV/EBITDA library lookup (sector + size) | L3+ |
| MODEL.VAL.SAAS.RULE40.v1 | Rule of 40 + premium multiple | SaaS only |
| MODEL.VAL.SAAS.RULEOFX.v1 | Rule of X (Bessemer) — higher R² for FV/NTM rev | SaaS only |
| MODEL.VAL.ASSET.v1 | Asset-based / liquidation value | All leagues (distress) |
| MODEL.VAL.SOTP.v1 | Sum-of-parts / break-up | L6+ |
| MODEL.VAL.DLOM.v1 | Discount for Lack of Marketability (Stout 2024) | L1–L4 |
| MODEL.VAL.CONTROLPREM.v1 | Control premium analysis (FactSet / BVR) | L4+ |
| MODEL.VAL.TRIANGULATION.v1 | Multi-methodology weighted valuation (league-specific weights) | All |

#### B. Acquisition Financial Models

| Model ID | Purpose | League |
|---|---|---|
| MODEL.LBO.SBA.v1 | SBA-financed SMB LBO (DSCR-driven, SOP 50 10 8) | L1–L2 |
| MODEL.LBO.LMM.v1 | LMM LBO (unitranche, mezz, sponsor equity) | L3–L4 |
| MODEL.LBO.PE.PRIMARY.v1 | Standard PE LBO with full multi-tranche debt schedule | L4–L8 |
| MODEL.LBO.PE.MEGA.v1 | Mega LBO with HY + TLB + bridge, fairness opinion build | L7–L10 |
| MODEL.LBO.ADDON.v1 | Add-on / tuck-in LBO with synergies | L4–L7 |
| MODEL.LBO.ROLLUP.v1 | Multi-deal roll-up platform with arbitrage projection | L4+ |
| MODEL.LBO.DIVRECAP.v1 | Dividend recapitalization | L4+ |
| MODEL.LBO.SECONDARY.v1 | Secondary buyout (SBO) | L4+ |
| MODEL.MERGER.ACCDIL.v1 | Merger model with accretion/dilution | L5+ |
| MODEL.MERGER.TWOSTEP.v1 | Two-step merger / tender offer (§251(h)) | L7+ |
| MODEL.MERGER.TAKEPRIVATE.v1 | Take-private with going-private premium | L7+ |
| MODEL.CARVEOUT.v1 | Carve-out with stranded costs, TSA, dis-synergies | L5+ |
| MODEL.JV.v1 | Joint venture (contribution accounting, governance economics) | L4+ |
| MODEL.STUB.v1 | Stub equity (take-private with rolled equity) | L7+ |
| MODEL.CVR.v1 | Contingent Value Right valuation (Genzyme / Celgene precedents) | L7+ |

#### C. Capital Structure Models

| Model ID | Purpose | League |
|---|---|---|
| MODEL.DEBT.WATERFALL.v1 | Full priority-of-payments waterfall | L3+ |
| MODEL.DEBT.INTERCREDITOR.v1 | 1L/2L intercreditor mechanics (LSTA/ABA Model) | L4+ |
| MODEL.DEBT.SCHEDULE.v1 | Multi-tranche debt schedule with cash sweep | L3+ |
| MODEL.DEBT.UNITRANCHE.v1 | Unitranche with FILO/LILO | L3–L5 |
| MODEL.DEBT.PIK.v1 | PIK / Toggle PIK accrual | L4+ |
| MODEL.DEBT.CONVBOND.v1 | Convertible bond valuation (conv value, IV, optionality) | L5+ |
| MODEL.CAPTABLE.v1 | Round-by-round cap table | All |
| MODEL.DILUTION.v1 | Dilution waterfall (pre/post money, option pool refresh) | All |
| MODEL.ANTIDIL.FULLRATCH.v1 | Full ratchet anti-dilution | L3–L5 |
| MODEL.ANTIDIL.BBWA.v1 | Broad-based weighted-average anti-dilution | L3+ |
| MODEL.LIQPREF.v1 | Liquidation preference waterfall (participating / non-participating / capped) | All |
| MODEL.SAFE.POSTMONEY.v1 | Post-money SAFE conversion (YC standard) | Early-stage |
| MODEL.SAFE.PREMONEY.v1 | Pre-money SAFE conversion | Early-stage |
| MODEL.WARRANT.BS.v1 | Black-Scholes warrant valuation with dilution adjustment | L3+ |
| MODEL.WARRANT.BINOMIAL.v1 | Binomial / lattice warrant valuation | L4+ |
| MODEL.MEZZ.WARRANT.v1 | Mezzanine with warrant kicker (yield-to-warrant) | L3+ |
| MODEL.ROYALTY.v1 | Royalty / revenue-based financing | All |
| MODEL.PROFINT.v1 | Profit interest waterfall (carry, hurdle, catch-up) | L4+ |
| MODEL.MIP.v1 | Management Incentive Plan (options, RSUs, profit interests) | L4+ |

#### D. Deal-Structuring Models (Tax + Legal)

| Model ID | Purpose | League |
|---|---|---|
| MODEL.STRUCT.PPA.v1 | §1060 Purchase Price Allocation optimizer | All asset / §338(h)(10) |
| MODEL.STRUCT.338H10.v1 | §338(h)(10) economic equivalence + tax gross-up calculator | L3+ |
| MODEL.STRUCT.336E.v1 | §336(e) unilateral election | L3+ |
| MODEL.STRUCT.FREORG.v1 | F-Reorganization with QSub election sequence | L3+ S-corp targets |
| MODEL.STRUCT.351.v1 | §351 contribution (control test, boot, §357(c) trap) | L3+ |
| MODEL.STRUCT.368.A.v1 | §368(a)(1)(A) Type A merger (COI floor analysis) | L5+ |
| MODEL.STRUCT.368.B.v1 | §368(a)(1)(B) stock-for-stock | L5+ |
| MODEL.STRUCT.368.C.v1 | §368(a)(1)(C) stock-for-assets | L5+ |
| MODEL.STRUCT.368.F.v1 | §368(a)(1)(F) F-reorg | L3+ S-corp |
| MODEL.STRUCT.368.A2D.v1 | §368(a)(2)(D) forward triangular | L5+ |
| MODEL.STRUCT.368.A2E.v1 | §368(a)(2)(E) reverse triangular | L5+ |
| MODEL.STRUCT.355.SPIN.v1 | §355 spin-off + Morris Trust analysis | L7+ |
| MODEL.STRUCT.ROLLOVER.v1 | Rollover equity pathway optimizer (taxable / §368 / §351 / §721 / F-reorg) | L3+ |
| MODEL.STRUCT.EARNOUT.DETERM.v1 | Earnout valuation — deterministic | L3+ |
| MODEL.STRUCT.EARNOUT.PROB.v1 | Earnout valuation — probability-weighted | L4+ |
| MODEL.STRUCT.EARNOUT.MC.v1 | Earnout valuation — Monte Carlo (10K iterations, ASC 805) | L4+ |
| MODEL.STRUCT.EARNOUT.BS.v1 | Earnout valuation — Black-Scholes path-dependent | L5+ |
| MODEL.STRUCT.EARNOUT.ASC805.v1 | ASC 805 buyer fair-value remeasurement schedule | L3+ |
| MODEL.STRUCT.EARNOUT.TAX.v1 | Earnout tax characterization (purchase price vs compensation) | L3+ |
| MODEL.STRUCT.NWC.PEG.v1 | Working capital peg (LTM avg / normalized / seasonality-adjusted) | All |
| MODEL.STRUCT.NWC.TRUEUP.v1 | Working capital true-up mechanics | All |
| MODEL.STRUCT.NETDEBT.v1 | Cash-free / debt-free conversion + debt-like adjustments | All |
| MODEL.LEGAL.INDEM.v1 | Indemnification economics (cap, basket, survival, fraud carve-out → $ exposure) | All |
| MODEL.LEGAL.RWI.PRICING.v1 | R&W insurance pricing (current Marsh / Aon / WTW market) | L4+ |
| MODEL.LEGAL.ESCROW.v1 | Escrow / holdback NPV impact | All |
| MODEL.LEGAL.SANDBAG.v1 | Sandbagging clause economic value (state-default-aware) | All |
| MODEL.LEGAL.MAE.FRAMEWORK.v1 | MAE Akorn framework surfacing (NEVER opines) | All |

#### E. Tax-Specific Models

| Model ID | Purpose | League |
|---|---|---|
| MODEL.TAX.382.NOL.v1 | §382 NOL annual limit calculator (current LTTER) | L3+ |
| MODEL.TAX.382.NUBIG.v1 | NUBIG / NUBIL framework surfacing | L4+ |
| MODEL.TAX.163J.v1 | §163(j) interest deduction limit (post-OBBBA EBITDA-based) | L4+ |
| MODEL.TAX.168K.v1 | §168(k) bonus depreciation PV (100% post-Jan 19, 2025) | All |
| MODEL.TAX.168N.QPP.v1 | §168(n) Qualified Production Property | Manufacturers L4+ |
| MODEL.TAX.COSTSEG.v1 | Cost segregation NPV | All with real estate |
| MODEL.TAX.1031.LKE.v1 | §1031 like-kind exchange deferral PV | Real estate |
| MODEL.TAX.1202.QSBS.v1 | §1202 QSBS exclusion (post-OBBBA tiered + state conformity) | L3+ |
| MODEL.TAX.453.INSTALL.v1 | §453 installment sale + §453A interest charge | All |
| MODEL.TAX.280G.v1 | §280G parachute + 3× base + cleansing vote analysis | L4+ |
| MODEL.TAX.NCTI.v1 | NCTI ETR computation | International L5+ |
| MODEL.TAX.FDDEI.v1 | FDDEI ETR computation | International L5+ |
| MODEL.TAX.BEAT.v1 | BEAT computation | International L5+ |
| MODEL.TAX.PTE.STATE.v1 | State PTE election benefit analysis | All multi-state |
| MODEL.TAX.RETT.CITT.v1 | RETT / CITT transfer tax computation | Real-estate-heavy |
| MODEL.TAX.STATE.LEAKAGE.v1 | Multi-state apportionment leakage | L4+ multi-state |

#### F. Process / Risk / Decision Models

| Model ID | Purpose | League |
|---|---|---|
| MODEL.DSCR.STRESS.v1 | DSCR stress testing (rev -10/-20/-30%, +200bps SOFR, margin compression) | All |
| MODEL.COVENANT.FORECAST.v1 | Covenant compliance forecast | All |
| MODEL.SOURCES.USES.v1 | Sources & Uses with funding gap detection | All |
| MODEL.SYNERGY.CURVE.v1 | Synergy realization curve (McKinsey / Bain benchmarks) | L4+ |
| MODEL.SYNERGY.INTEG.COST.v1 | Integration cost (Haspeslagh & Jemison archetype) | L4+ |
| MODEL.DEALKILL.PROB.v1 | Deal-killer probability (financing, regulatory, MAC, key emp, customer conc) | All |
| MODEL.BID.AUCTION.v1 | Bid auction strategy (single-stage / two-stage / BAFO) | L4+ |
| MODEL.NEG.BATNA.v1 | Negotiation BATNA / ZOPA analysis | All |
| MODEL.TIMELINE.MC.v1 | Probability-weighted close date Monte Carlo | All |
| MODEL.HSR.TRIAGE.v1 | HSR threshold + second-request probability | L5+ |
| MODEL.CFIUS.TRIAGE.v1 | CFIUS exposure analysis | All cross-border |
| MODEL.NEG.OFFER_SCORE.v1 | Offer scoring (multi-dimensional: price, terms, financing, certainty) | All |

#### G. Exit / Liquidity Models

| Model ID | Purpose | League |
|---|---|---|
| MODEL.EXIT.IPO.v1 | IPO valuation (P/E, EV/EBITDA, EV/Rev, growth-adjusted, IPO discount, lock-up) | L7+ |
| MODEL.EXIT.DUALTRACK.v1 | Dual-track decision (IPO vs M&A: prob-weighted value, certainty premium) | L7+ |
| MODEL.EXIT.SPAC.v1 | SPAC merger economics (PIPE, redemption, sponsor promote, warrants, earnout) | L7+ |
| MODEL.EXIT.DIRECTLIST.v1 | Direct listing economics | L7+ |
| MODEL.EXIT.SECONDARY.v1 | Secondary sale (GP-led, LP-led, single / multi-asset) | L4+ |
| MODEL.EXIT.CONTFUND.v1 | Continuation fund waterfall | L5+ |

#### H. PMI / Post-Close Models

| Model ID | Purpose |
|---|---|
| MODEL.PMI.DAY0.v1 | Day 0 close checklist + funds flow reconciliation |
| MODEL.PMI.STAB.v1 | Stabilization (Day 1–30) tracking |
| MODEL.PMI.ASSESS.v1 | Assessment (Day 31–60) tracking |
| MODEL.PMI.100DAY.v1 | 100-day value plan |
| MODEL.PMI.SYNCAP.v1 | Synergy capture dashboard (planned vs realized) |
| MODEL.PMI.NWC.NORMAL.v1 | Working capital normalization tracker |
| MODEL.PMI.EARNOUT.TRACK.v1 | Earnout realization tracker |
| MODEL.PMI.INDEM.TRACK.v1 | Indemnification claim tracker |

#### I. Special Situations

| Model ID | Purpose |
|---|---|
| MODEL.DISTRESS.363.v1 | §363 sale (stalking horse, break-up fee, credit bid) |
| MODEL.DISTRESS.LME.v1 | Liability management exercise (uptier, drop-down, J.Crew / Serta / Mitel patterns) |
| MODEL.DISTRESS.D2E.v1 | Debt-to-equity recapitalization |
| MODEL.DISTRESS.FULCRUM.v1 | Fulcrum security identification |
| MODEL.DISTRESS.LIQ.v1 | Liquidation analysis (Chapter 7 vs 11) |
| MODEL.DISTRESS.ABC.v1 | ABC / state assignment for benefit of creditors |

#### J. Document Generators (28 catalog)

(These are L4 Author orchestration models, not pure-math L1 models, but they consume L1 outputs. Listed for completeness.)

| Model ID | Purpose |
|---|---|
| MODEL.DOC.CIM.v1 | Confidential Information Memorandum |
| MODEL.DOC.TEASER.v1 | Anonymous teaser |
| MODEL.DOC.NDA.v1 | Non-Disclosure Agreement |
| MODEL.DOC.LOI.v1 | Letter of Intent |
| MODEL.DOC.IC.MEMO.v1 | Investment Committee memo |
| MODEL.DOC.PITCH.v1 | Pitch deck |
| MODEL.DOC.ONEPAGER.v1 | One-page deal summary |
| MODEL.DOC.100DAY.v1 | 100-day PMI plan |
| MODEL.DOC.COMP.SET.v1 | Comp set deck |
| MODEL.DOC.STATUS.EMAIL.v1 | Status email (drafted for user to send) |
| MODEL.DOC.QA.RESPONSE.v1 | Q&A response (drafted for user to send) |
| MODEL.DOC.CLOSE.CHECKLIST.v1 | Closing checklist |
| MODEL.DOC.FUNDS.FLOW.v1 | Funds flow worksheet |
| MODEL.DOC.EARNOUT.SCHEDULE.v1 | Earnout schedule |
| MODEL.DOC.NEG.MEMO.v1 | Negotiation memo |
| MODEL.DOC.TERM.SHEET.v1 | Term sheet |
| MODEL.DOC.MGT.REP.LETTER.v1 | Management representation letter |
| MODEL.DOC.RWI.SUBMISSION.v1 | R&W insurance submission |
| MODEL.DOC.SOURCING.LIST.v1 | Buyer / target list |
| MODEL.DOC.OUTREACH.v1 | Outreach email (drafted for user to send) |
| MODEL.DOC.IOI.v1 | Indication of Interest |
| MODEL.DOC.BAFO.v1 | Best and Final Offer |
| MODEL.DOC.WALK.AWAY.v1 | Walk-away memo |
| MODEL.DOC.READINESS.SCORE.v1 | Readiness report (The Rundown™) |
| MODEL.DOC.RECAST.v1 | Recast P&L statement |
| MODEL.DOC.QOE.LITE.v1 | QoE Lite report |
| MODEL.DOC.QOE.FULL.v1 | Full QoE report |
| MODEL.DOC.MARKET.PULSE.v1 | Market pulse intel report |

**Full catalog with schemas → `SMBX_DEAL_MODEL_CATALOG.md`.**


---

## 12.0 MODEL STACK ARCHITECTURE (NEW — V19)

A **model stack** is the complete set of models composed to handle a single deal. Composition follows a deterministic recipe based on (league × deal_type × structure × industry × jurisdiction). The stack has four layers:

1. **Primary** — the principal financial output (e.g., LBO)
2. **Supporting** — secondary models the primary requires as inputs or cross-checks
3. **Tax/Legal Economic** — dollar-translation of legal/tax provisions
4. **Sensitivity/Scenario** — built-in stress tests and scenarios

### 12.1 Worked Example: L2 Main-Street Asset Sale

**Profile:** $450K SDE pizzeria. SBA-financed. Asset purchase. CA buyer, FL target.

```
PRIMARY:
  MODEL.VAL.SDE.v1                    → 2.7× SDE = $1.215M base
  MODEL.LBO.SBA.v1                    → 10% equity, $1.1M SBA 7(a), 10-yr amort

SUPPORTING:
  MODEL.VAL.MULT.SDE.v1               → BizBuySell sector cap-out lookup
  MODEL.STRUCT.NWC.PEG.v1             → 12-mo LTM avg
  MODEL.DSCR.STRESS.v1                → 1.50× under rev -20% / +200bps SOFR
  MODEL.SOURCES.USES.v1               → Reconcile equity, debt, seller note

TAX/LEGAL ECONOMIC:
  MODEL.STRUCT.PPA.v1                 → Class V-VII allocation, §168(k) PV
  MODEL.TAX.168K.v1                   → 100% Year-1 deduction
  MODEL.LEGAL.INDEM.v1                → Basket + cap + survival → $ exposure
  MODEL.TAX.STATE.LEAKAGE.v1          → FL no income; CA buyer non-resident impact

SENSITIVITY/SCENARIO:
  Rev ±10/±20%
  SDE ±$50K (add-back stress)
  Multiple ±0.5×
  DSCR pre/post stress
```

### 12.2 Worked Example: L4 Lower-Middle-Market PE Platform with Rollover, Earnout, R&W

**Profile:** $15M EBITDA HVAC platform. PE acquirer (LP). 30% rollover. $3M earnout (3 years). RWI 10% EV / 0.5% retention. F-reorg of S-corp target.

```
PRIMARY:
  MODEL.LBO.PE.PRIMARY.v1             → Full LBO with multi-tranche debt
  MODEL.VAL.DCF.TWOSTAGE.v1           → DCF cross-check
  MODEL.VAL.COMPS.TRADING.v1          → Trading comps
  MODEL.VAL.COMPS.PRECEDENT.v1        → Precedent transactions
  MODEL.VAL.COMPS.FOOTBALLFIELD.v1    → Football field synthesis

SUPPORTING:
  MODEL.VAL.WACC.MODCAPM.v1           → Modified CAPM (size premium for $15M EBITDA)
  MODEL.DEBT.SCHEDULE.v1              → TLA + TLB + revolver + sponsor equity + rollover + seller note + earnout
  MODEL.DEBT.UNITRANCHE.v1            → Optional substitute for TLA+TLB
  MODEL.STRUCT.NWC.PEG.v1             → 12-mo LTM normalized
  MODEL.STRUCT.NWC.TRUEUP.v1          → 120-day post-close true-up
  MODEL.STRUCT.NETDEBT.v1             → Debt-like reconciliation
  MODEL.SOURCES.USES.v1
  MODEL.DSCR.STRESS.v1
  MODEL.COVENANT.FORECAST.v1
  MODEL.MIP.v1                        → 10% pool, 4-yr vest, performance hurdle 2.5× MOIC

TAX/LEGAL ECONOMIC:
  MODEL.STRUCT.FREORG.v1              → S-corp target F-reorg → QSub → LLC sequence
  MODEL.STRUCT.ROLLOVER.v1            → §721 rollover via PE LLC; 30% tax-deferred
  MODEL.STRUCT.PPA.v1                 → §1060 allocation post-F-reorg
  MODEL.TAX.168K.v1                   → 100% bonus dep on personal property step-up
  MODEL.STRUCT.EARNOUT.MC.v1          → 10K Monte Carlo on $3M earnout
  MODEL.STRUCT.EARNOUT.ASC805.v1      → Buyer fair-value remeasurement
  MODEL.STRUCT.EARNOUT.TAX.v1         → §453 installment for purchase-price treatment
  MODEL.LEGAL.RWI.PRICING.v1          → 10% EV coverage, 0.5% retention, ~3.0% ROL
  MODEL.LEGAL.INDEM.v1                → Cap at retention; fundamental reps survival
  MODEL.LEGAL.ESCROW.v1               → PPA escrow 1% TV
  MODEL.TAX.STATE.LEAKAGE.v1          → Multi-state apportionment

SENSITIVITY/SCENARIO:
  Rev ±10/±20%; EBITDA margin ±100/300 bps
  Exit multiple ±0.5/1.0×
  Hold period 3/4/5/6/7 years
  Earnout achievement 0/25/50/75/100%
  Rollover taxable vs deferred basis comparison
  SOFR ±100/200 bps
```

### 12.3 Worked Example: L7 Middle-Cap Dividend Recapitalization

**Profile:** $400M EBITDA platform, year 3 of PE hold. Sponsor exploring dividend recap to return ~50% of original equity.

```
PRIMARY:
  MODEL.LBO.DIVRECAP.v1               → New debt sized to support distribution
  MODEL.VAL.EBITDA.v1                 → Current EV at refinance
  MODEL.DEBT.SCHEDULE.v1              → New multi-tranche TLB structure

SUPPORTING:
  MODEL.VAL.WACC.CAPM.v1
  MODEL.VAL.DCF.TWOSTAGE.v1           → Sustainable cash flow assessment
  MODEL.DSCR.STRESS.v1                → Post-recap DSCR stress
  MODEL.COVENANT.FORECAST.v1          → New incurrence covenants
  MODEL.SOURCES.USES.v1               → Refinance + dividend reconciliation

TAX/LEGAL ECONOMIC:
  MODEL.TAX.163J.v1                   → Increased interest deduction cap analysis (EBITDA-based post-OBBBA)
  MODEL.TAX.STATE.LEAKAGE.v1
  Solvency opinion module (defer to advisor)
  Fraudulent transfer analysis (defer to counsel)

SENSITIVITY/SCENARIO:
  Distribution % (40/50/60% of original equity)
  Refinance rate ±100 bps
  Maintenance covenant cushion
```

### 12.4 Worked Example: L9 Mega-Cap Take-Private with Club Consortium and Dual-Track

**Profile:** $25B EV public target. Consortium of 3 mega-funds. CFIUS-eligible (TID critical tech). HSR mandatory. Considering go-shop, fairness opinion, dual-track exit prep.

```
PRIMARY:
  MODEL.MERGER.TAKEPRIVATE.v1         → Going-private premium analysis
  MODEL.LBO.PE.MEGA.v1                → Mega LBO with TLB + HY + bridge
  MODEL.VAL.DCF.THREESTAGE.v1         → 3-stage DCF
  MODEL.VAL.COMPS.TRADING.v1
  MODEL.VAL.COMPS.PRECEDENT.v1
  MODEL.VAL.COMPS.FOOTBALLFIELD.v1
  MODEL.EXIT.DUALTRACK.v1             → IPO vs M&A optionality at exit

SUPPORTING:
  MODEL.VAL.WACC.CAPM.v1
  MODEL.DEBT.SCHEDULE.v1              → Multi-tranche mega
  MODEL.DEBT.INTERCREDITOR.v1
  MODEL.DEBT.PIK.v1                   → HoldCo PIK option
  MODEL.SYNERGY.CURVE.v1
  MODEL.MERGER.ACCDIL.v1              → If part-stock consideration
  MODEL.MIP.v1                        → 10–15% pool, MOIC + IRR ratchet
  MODEL.MERGER.TWOSTEP.v1             → §251(h) two-step option
  Fairness opinion build (Mode 2: defer to bank financial advisor)

TAX/LEGAL ECONOMIC:
  MODEL.STRUCT.PPA.v1                 → §1060 if §338 election; otherwise stock with carryover
  MODEL.TAX.382.NOL.v1                → Public target NOLs
  MODEL.TAX.163J.v1                   → Mega-deal interest cap binding
  MODEL.TAX.NCTI.v1 / FDDEI / BEAT    → International ops
  MODEL.TAX.280G.v1                   → Executive parachute
  MODEL.LEGAL.RWI.PRICING.v1          → Mega-deal RWI ($1.5B–$3B coverage typical)
  MODEL.HSR.TRIAGE.v1                 → Mandatory; second-request probability
  MODEL.CFIUS.TRIAGE.v1               → Mandatory filing if CFIUS-eligible TID
  MODEL.LEGAL.MAE.FRAMEWORK.v1        → Akorn standard surfaced
  MFW conditions analysis (Mode 2)
  Revlon trigger analysis (Mode 2)
  Solvency opinion (Mode 2)

SENSITIVITY/SCENARIO:
  Premium offered (25/30/35/40%)
  Synergy realization (cost: 60/75/90% of plan; revenue: 15/25/35%)
  Exit timing (5/7/9 years)
  Exit method (IPO vs M&A vs continuation fund)
  Regulatory delay (6/12/18 months)
  HSR second-request scenario
  Financing-out scenario
```

---

## 13.0 YULIA'S MODEL GATING LOGIC (NEW — V19)

The deterministic decision tree from "user describes deal" → "Yulia identifies league + deal type + structure" → "Yulia composes correct model stack" → "Yulia runs the stack and presents Analysis → Options → Implications."

Full gating logic with classifier code lives in `SMBX_YULIA_MODEL_GATING_LOGIC.md`. This section is the operational spec.

### 13.1 Classification Cascade

**Step 1 — Journey Classifier:** From first 1–3 messages or page-of-origin, classify journey: Sell / Buy / Raise / Integrate / Broker.

**Step 2 — Exit-Type Classifier (Sell-Side Only):** Six options (full sale, partner buyout, capital raise, ESOP, majority sale, partial). Routes Sell → SELL_FULL or SELL → RAISE accordingly.

**Step 3 — League Classifier:** From SDE/EBITDA + revenue + industry signal. L1–L10.

**Step 4 — Deal-Type Classifier:** From explicit user statement OR from buyer-type-inferred structure. Options:
* Asset Purchase / Stock Purchase / Merger (forward triangular / reverse triangular / two-step / direct)
* §338(h)(10) / §336(e) / F-reorg / §351 / §368(a) variant / §355 spin
* LBO (PE / SBA / mega) / MBO / take-private / dividend recap / carve-out / JV
* Capital Raise (debt / equity / hybrid)
* Distress (§363, ABC, receivership, LME)

**Step 5 — Structure Classifier:** Detect rollover (size, vehicle), earnout (size, duration, contingency), seller note, financing (SBA / unitranche / TLB / HY), R&W vs traditional indemnity, escrow, working capital peg method.

**Step 6 — Industry Classifier:** NAICS 6-digit (preferred) or SIC. Used for: sector heat, comp pulls, industry tax/legal overlays (cannabis, healthcare CHOW, manufacturing §168(n), tech §174, etc.).

**Step 7 — Jurisdiction Classifier:** Target state, buyer state, seller state. Triggers: non-compete enforceability, QSBS conformity, RETT/CITT, PTE election, bulk sales, state SOPs.

### 13.2 Required-Model Matrix (Excerpt)

| Journey | League | Structure | Primary | Required Supporting | Notes |
|---|---|---|---|---|---|
| Sell | L1 | Asset | VAL.SDE | NWC.PEG, PPA, LEGAL.INDEM | SBA buyer probable |
| Sell | L2 | Asset | VAL.SDE | NWC.PEG, PPA, LEGAL.INDEM, DSCR.STRESS | SBA buyer dominant |
| Sell | L3 | Asset or F-Reorg | VAL.EBITDA + DCF | NWC.PEG, PPA, FREORG (S-corp), ROLLOVER, EARNOUT.PROB, LEGAL.INDEM, RWI.PRICING | LMM PE buyer |
| Sell | L4 | F-Reorg or §338(h)(10) | VAL.TRIANGULATION | All L3 + DEBT.SCHEDULE, MIP, EARNOUT.MC, RWI.PRICING, TAX.168K, STATE.LEAKAGE | Full PE deal |
| Sell | L5–L6 | Multiple options | VAL.TRIANGULATION + IMPLIED.LBO | All L4 + DCF.THREESTAGE, COMPS.FOOTBALLFIELD, SYNERGY.CURVE, 382.NOL, 163J, MAE.FRAMEWORK | MM PE |
| Sell | L7–L8 | Multiple + take-private | VAL.TRIANGULATION + TAKEPRIVATE | All L5–L6 + MEGA LBO, DUAL-TRACK, NCTI/FDDEI/BEAT (if international), HSR.TRIAGE, CFIUS.TRIAGE | Mega-cap |
| Sell | L9–L10 | Complex / mega-merger / spin | All of L7–L8 + 355.SPIN, MERGER.ACCDIL | + Multi-antitrust, multi-jurisdiction tax | Transformational |
| Buy | L1–L2 | SBA-financed | LBO.SBA | VAL.SDE, DSCR.STRESS, SOURCES.USES, PPA, INDEM | Searcher / individual |
| Buy | L3–L4 | PE LBO + rollover | LBO.PE.PRIMARY (or LMM) | All of buy L1–L2 + VAL.EBITDA, DCF, ROLLOVER, MIP, RWI, EARNOUT, 168K | LMM PE |
| Buy | L5+ | PE LBO + add-on or platform | LBO.PE.PRIMARY + ADDON or ROLLUP | All of buy L3–L4 + SYNERGY, DCF.THREESTAGE, MAE.FRAMEWORK, HSR | MM+ PE |
| Buy | L7+ | Take-private + consortium | LBO.PE.MEGA + TAKEPRIVATE | All of buy L5+ + STUB, CVR (optional), CFIUS, fairness opinion build, MFW | Mega |
| Raise | L1–L3 | Equity SAFE / convertible | CAPTABLE + DILUTION + SAFE.POSTMONEY | LIQPREF, ANTIDIL.BBWA, WARRANT.BS | Seed / Series A |
| Raise | L4–L6 | Series B+ / growth | All of raise L1–L3 + WACC, EBITDA, DCF | + 1202.QSBS, 280G if executive comp involved | Growth equity |
| Raise | L4+ | Debt | DEBT.SCHEDULE + DSCR.STRESS | + 163J, COVENANT.FORECAST | Senior debt / mezz |
| Integrate | All | Post-close | PMI.100DAY | + SYNCAP, EARNOUT.TRACK, INDEM.TRACK, NWC.NORMAL | Post-close |

### 13.3 Gating Questions Yulia Must Ask (Enumerated)

For each league × deal-type combination, Yulia has an **enumerated gating-question list** (not generative) that must be satisfied before the stack composes. Examples:

**Sell L4 (F-Reorg):**
1. Is target entity an S-corp? (Y/N — drives F-reorg eligibility)
2. Has S election been in place ≥5 years? (Y/N — BIG tax exposure)
3. Are any shareholders non-resident or non-U.S.? (Y/N — S-corp eligibility)
4. Any disregarded entity or QSub already in structure? (Y/N — affects sequence)
5. Is buyer a PE LLC or corporation? (drives §721 vs §351 rollover path)
6. Rollover %? (5–40% typical)
7. Earnout? (Y/N — duration and metric)
8. R&W insurance budget? (Y/N — drives indem package)
9. State of incorporation? State of operations? (state tax leakage)
10. NOL balance? (Y/N — §382 analysis)

**Buy L5 (Public Take-Private):**
1. SEC reporting status of target? (10-K / 10-Q quarterly cadence)
2. Last earnings: any miss vs guidance?
3. Largest shareholder %? Any controller?
4. Defensive measures in place (poison pill, supermajority, staggered board)?
5. Recent 13D / 13G activity?
6. Go-shop period planned?
7. Financing certainty (debt commitment letter? equity commitment letter?)
8. CFIUS exposure (foreign LP %; TID U.S. business attribute)?
9. HSR position (industry HHI, recent precedent)?
10. Cleansing vote pathway (MFW for controller deals)?

### 13.4 Bypass / Override Rules

* User explicit override: "Don't model X" → Yulia logs, complies, surfaces what's omitted
* Insufficient data: Yulia says what's missing, what can be computed without it, and what would tighten the answer
* Out-of-scope request: Mode 2 defer-to-counsel template fires automatically

### 13.5 Hard-Halt Conditions

Yulia halts and surfaces "this needs a specialist" for:
* Any § 10.24 always-halt legal category
* Any complex tax structuring opinion requiring CPA / tax counsel sign-off (see § 9.19)
* Any cross-border deal with FX or foreign tax complexity beyond NCTI/FDDEI/BEAT framework
* Any distressed deal with Chapter 11 plan involvement
* Any fairness opinion request (defer to bank advisor)
* Any controller-transaction MFW *ab initio* analysis
* Any §1202 qualification opinion on specific facts
* Any §382 NUBIG / NUBIL determination on specific assets
* Any HSR Item 4(c)/(d) responsiveness opinion
* Any CFIUS mandatory-vs-voluntary determination on close call
* Any state-by-state non-compete enforceability opinion on specific facts

### 13.6 Audit Trail Format

Every Yulia response carries:
```json
{
  "session_id": "...",
  "deal_id": "...",
  "user_id": "...",
  "turn_id": "...",
  "journey": "SELL",
  "league": "L4",
  "deal_type": "ASSET_FREORG",
  "model_stack": ["MODEL.VAL.EBITDA.v1", "MODEL.LBO.PE.PRIMARY.v1", ...],
  "inputs_used": { ... },
  "live_data_snapshots": {
    "SOFR": {"value": 3.60, "fetched_at": "2026-05-14T13:00:00Z", "source": "FRED:SOFR"},
    "HY_OAS": {"value": 2.79, "fetched_at": "2026-05-14T13:00:00Z", "source": "FRED:BAMLH0A0HYM2"}
  },
  "citations_validated": ["IRC §168(k)", "OBBBA §70301", "ABA 2025 §3.2", ...],
  "mode_2_triggers": [],
  "output_hash": "sha256:..."
}
```

Retention: 7 years. User-downloadable as JSON.


---

## 14.0 ANTI-HALLUCINATION ARCHITECTURE (NEW — V19)

The most catastrophic failure mode for an M&A AI is to invent a citation, a court case, an IRC section, a debt tranche, a market datapoint, or a regulatory threshold. V19's anti-hallucination architecture is the deliberate constraint layer that prevents this.

### 14.1 The Six Defenses (Layered)

**Defense 1 — L1/L2 Separation:** All numerics come from L1 (deterministic calc) or L2 (versioned content DB). Author (L4) cannot mint numbers. Calc engine and content DB do not invent facts.

**Defense 2 — Citation Validator (L6):** Pre-publish gate parses Yulia's response, extracts every `[citation tag]`, validates against L2 content DB or live source. Unvalidated tags are stripped and replaced with `[citation needed]` warnings to user.

**Defense 3 — Hallucination-Risk Registry:** A maintained list of high-risk hallucination patterns (§ 14.2) that triggers automatic verification calls before publish.

**Defense 4 — Mode 2 Defer-to-Counsel Triggers:** § 10.24 always-halt legal categories and § 9.19 tax-defer categories prevent Yulia from opining on legal/tax conclusions on specific facts.

**Defense 5 — Live Data Validation:** Live data (rates, multiples, thresholds) must be ≤24 hours fresh; staler than that triggers refresh-or-flag.

**Defense 6 — User-Visible Audit Trail:** Every response carries the audit JSON (§ 13.6) downloadable for user diligence defense.

### 14.2 Hallucination-Risk Registry (from V19 Research § 5)

**TAX:**
* `§351 vs §368 conflation` — Yulia must NOT use these terms interchangeably; different control thresholds, different boot rules
* `§168(k) phase-down assumption` — Yulia must use 100% post-Jan 19, 2025 (OBBBA permanent), NOT 40% phase-down
* `§163(j) EBIT-vs-EBITDA confusion` — Yulia must use EBITDA-based ATI post-Dec 31, 2024
* `§1202 stale parameters` — Yulia must use $15M/10× cap and $75M gross assets and tiered exclusion for stock issued after Jul 4, 2025
* `§382 stale LTTER` — Yulia must use current month LTTER (~3.5%+), NOT stale ~1.5% from 2020 era
* `Fabricated Rev Procs / Rev Ruls / Notices` — every IRS citation must validate against IRS IRB index
* `§368 subtype confusion` — A vs B vs C vs F have distinct requirements; never paraphrase requirements without citing exact Reg §1.368
* `COI threshold confusion` — 40% regulatory floor vs 50% advance ruling are different; never collapse
* `NCTI vs GILTI confusion` — NCTI applies tax years beginning after Dec 31, 2025; 12.6% ETR, 90% FTC, no QBAI

**LEGAL:**
* `Fabricated case citations` — Stanford CodeX research shows 69–88% hallucination rate on leading LLMs for legal citations. Every case must validate against Westlaw or Lexis verbatim.
* `ABA study year confusion` — ABA 2025 (Dec 2025 release) and ABA 2023 figures are NOT the same; Yulia must use most-current
* `Caremark / Revlon / Unocal interchangeability` — Each is a distinct standard with distinct triggers; never use as synonyms
* `MFW element count` — SIX elements, not five
* `MAE doctrine over-extension` — Akorn standard "durationally significant" "measured in years not months"; never opine on facts
* `Sandbagging state defaults` — Not monolithic by state; Yulia surfaces governing-law rule
* `Standstill ≠ waterfall priority` — independent provisions in ICAs
* `§251(h) vote threshold` — requires shares tendered ≥ vote threshold (typically majority of outstanding); NOT "majority of tendered"
* `Williams v Energy Transfer mis-citation` — that case is tax-opinion/efforts standard, NOT MAE
* `SB 21 signing date` — Mar 25, 2025 (introduced Feb 17), NOT signed Feb 17

**DEBT/STRUCTURE:**
* `"Term Loan C"` — NOT a standard tranche. Standard is TLA + TLB only.
* `Maintenance vs Incurrence cov-lite confusion` — cov-lite TLBs have NO maintenance covenants
* `Pre-money vs post-money SAFE math` — #1 SAFE error
* `Investment ÷ post-money for ownership%` — correct; NOT ÷ pre-money
* `BBWA formula "A" definition` — varies; default fully-diluted-incl-option-pool
* `Hard vs soft hurdle confusion` — different carry mechanics

**STATE / REGULATORY:**
* `FTC noncompete rule status` — DEAD as of Sep 5, 2025; state law controls
* `QSBS state non-conformity` — CA / PA / AL / MS full non-conformity; HI 50%; NJ conforms post Jan 1, 2026
* `RETT / CITT trap in stock deals` — non-obvious for real-estate-heavy targets
* `HSR threshold stale values` — current 2026 values per § 7.4
* `CFIUS timeline` — 45+45+15=105 days statutory max; never paraphrase
* `DGCL §251(h)` — vote threshold ≥ majority-of-outstanding (typical); 2,000+ holders OR national exchange; opt-in
* `SBA SOP version` — current SOP 50 10 8 (Jun 1, 2025 + Dec 2025 + Feb 2026 amendments)

**INSURANCE:**
* `R&W vs Indemnity conflation` — R&W is INSURANCE; pairs with retention; does NOT eliminate indem rights but in practice replaces them at retention ~0
* `Stale ROL` — current 2.5–3.0% (firming 2026); 4–5% ROL is stale 2021–2022 figure

**VALUATION:**
* `Stale ERP` — Damodaran 4.23% / Kroll 5.0% (May 2026); 2-yr-old 5.5%+ is stale
* `SaaS multiple mis-cite` — AI-exposed vs non-AI bifurcate sharply (24× vs 19× per Bessemer Cloud 100 2025)
* `Pre-money vs post-money valuation conflation` — basic but lethal

### 14.3 Model Registry & Version Pinning

Every model in § 11 carries a version. Calculations are pinned to a specific model version per deal at deal-creation time. Model upgrades create a new version (`v1 → v1.1`); existing deals don't auto-migrate (audit trail integrity).

`model_registry` table:
```
model_id            (e.g., MODEL.LBO.PE.PRIMARY.v1)
version             (e.g., 1.0, 1.1)
hash                (SHA-256 of model code)
deployed_at         (timestamp)
deprecated_at       (timestamp or null)
change_log          (markdown)
test_coverage_pct   (numeric)
hallucination_test_status  (pass/fail)
```

### 14.4 Continuous Hallucination Testing

Automated test suite runs nightly. For each item in § 14.2:
* Adversarial prompt designed to elicit hallucination
* Expected behavior: refusal / citation / correct value
* Pass/fail logged; >2% failure rate escalates to dual-approval review

Recommended test sources: Stanford CodeX legal-citation methodology; NIST AI RMF eval patterns.

### 14.5 Dual-Approval Change Management

Any change to:
* L2 content database (citations, parameters, market data overrides)
* Model registry (version bumps, new models)
* Hallucination-risk registry
* Mode 2 trigger list

Requires dual sign-off (engineering + domain SME). Changes logged in `change_log` with diff.

### 14.6 Compliance Hook Architecture

**SOX-Equivalent:** Financial calcs and audit trail meet SOX §404-equivalent retention (7 years) and ICFR-equivalent change management.

**EU AI Act:** smbX.ai is positioned as software platform; financial-decision-support workflows in M&A may be classified as "high-risk" under Annex III. V19 architecture includes:
* Article 11 documentation (model cards per § 14.3)
* Article 12 logging (audit trail per § 13.6)
* Article 14 human oversight (Mode 2 deferral + user-decides pattern)
* Article 15 accuracy and robustness (hallucination testing per § 14.4)

**NIST AI RMF 1.0 (Jan 26, 2023):** V19 maps to Govern / Map / Measure / Manage functions. Governance lives in V19 § 0–§ 8; mapping in § 9–§ 13; measurement in § 14.4; management in § 14.5.

---

## 15.0 LIVE MARKET DATA INTEGRATION SPEC (NEW — V19)

The L2 content DB is refreshed by supervised refresh jobs against authoritative sources. This section is the canonical specification.

### 15.1 Free Tier Data Sources (Priority for V19 Launch)

| Data | Source | API / Endpoint | Cadence | Method |
|---|---|---|---|---|
| SOFR | FRED `SOFR` | `https://api.stlouisfed.org/fred/series/observations?series_id=SOFR&api_key={KEY}` | Daily 8am ET | REST JSON |
| EFFR | FRED `EFFR` | FRED REST | Daily | JSON |
| Fed Funds target | FRED `DFEDTARU`, `DFEDTARL` | FRED REST | Daily | JSON |
| 10Y Treasury | FRED `DGS10` | FRED REST | Daily 3pm ET | JSON |
| 5Y Treasury | FRED `DGS5` | FRED REST | Daily | JSON |
| 30Y Treasury | FRED `DGS30` | FRED REST | Daily | JSON |
| TIPS Real Yields | FRED `DFII5`, `DFII10`, `DFII20`, `DFII30` | FRED REST | Daily | JSON |
| HY OAS | FRED `BAMLH0A0HYM2` (+ BB / B / CCC) | FRED REST | Daily | JSON |
| IG OAS | FRED `BAMLC0A0CM` | FRED REST | Daily | JSON |
| SBA Prime | FRED `DPRIME` | FRED REST | Daily | JSON |
| VIX | FRED `VIXCLS` | FRED REST | Daily | JSON |
| Damodaran ERP / Beta / Multiples | NYU Stern | `https://pages.stern.nyu.edu/~adamodar/.../datacurrent.html` | Annual (Jan) | XLS/HTML scrape (supervised) |
| HSR Thresholds | FTC | `https://www.ftc.gov/...current-thresholds` | Annual (Jan) | HTML scrape (supervised) |
| §382 LTTER | IRS Rev. Ruls | `https://www.irs.gov/irb/` | Monthly | PDF extract (supervised) |
| SBA SOP | sba.gov | Document portal | Periodic | PDF/DOCX (supervised) |
| BizBuySell Insight | BizBuySell | `https://www.bizbuysell.com/insight-report` | Quarterly | HTML (supervised) |
| Marsh Transactional Risk Report | Marsh | Free PDF | Annual + quarterly claims | PDF (supervised) |
| Pepperdine PCAP | Pepperdine | `https://digitalcommons.pepperdine.edu/gsbm_pcm_pcmr/` | Annual | PDF (supervised) |
| BLS labor | bls.gov | `https://api.bls.gov/publicAPI/v2/` (500 q/day free) | Monthly | REST |
| BEA macro | bea.gov | `https://apps.bea.gov/api/data/` | Quarterly | REST |
| Census | census.gov | `https://api.census.gov/data/` | Annual | REST |

### 15.2 Freemium Tier (Add when Tier 1 stable)

| Data | Source | Cadence |
|---|---|---|
| SOFR forward curve | Chatham Financial; Pensford; CME futures | Daily |
| Lincoln LSDI / ESDI | Lincoln International | Quarterly |
| Houlihan Lokey market overviews | Houlihan Lokey | Quarterly |
| Bain / McKinsey / BCG M&A reports | Firms | Annual + monthly |
| Aon / WTW / Woodruff Sawyer R&W reports | Firms | Quarterly + annual |

### 15.3 Paid Tier (Defer to revenue scale)

* PitchBook (PE / VC / M&A)
* S&P LCD (LSTA LLI, leveraged loan indices)
* GF Data (mid-market PE)
* BVR DealStats (Pratt's Stats)
* Capital IQ
* FactSet
* Bloomberg Terminal
* Kroll Cost of Capital Navigator
* Preqin
* Mergermarket
* Refinitiv
* Stout Restricted Stock Study
* NCREIF (real estate)

### 15.4 Cache Schema (`market_data_cache` table)

```sql
CREATE TABLE market_data_cache (
  id            BIGSERIAL PRIMARY KEY,
  series_id     TEXT NOT NULL,              -- e.g., 'SOFR', 'DAMODARAN_ERP'
  value         NUMERIC NOT NULL,
  as_of_date    DATE NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL,
  source        TEXT NOT NULL,              -- e.g., 'FRED', 'NYU_STERN'
  source_url    TEXT,
  cite_tag      TEXT NOT NULL,              -- e.g., '[FRED:SOFR]'
  metadata      JSONB,
  UNIQUE (series_id, as_of_date)
);

CREATE INDEX idx_market_data_cache_series ON market_data_cache(series_id, as_of_date DESC);
```

### 15.5 Refresh Job Architecture

Background pg-boss jobs:
* `refresh_fred_daily` — runs daily at 9am ET; pulls SOFR, EFFR, DGS10, etc.; upserts into `market_data_cache`
* `refresh_irs_ltter_monthly` — runs 1st business day of month; pulls latest Rev. Rul.; validated by SME before published live
* `refresh_hsr_thresholds_annual` — runs Jan; pulls FTC release; SME-validated
* `refresh_damodaran_annual` — runs Jan; pulls Damodaran datacurrent.html tables; SME-validated
* `refresh_marsh_quarterly` — runs quarterly; pulls latest Marsh TRI; SME-validated

### 15.6 Free Substitutes for Paid Sources (~70–80% of paid info value)

If paid sources are unavailable:
* Lincoln LSDI → use for LSTA LLI proxy
* Pepperdine PCAP → use for Kroll Cost of Capital proxy
* BizBuySell + Damodaran → use for trading multiples
* SEC EDGAR XBRL → use for Capital IQ basics
* BDC 10-Q filings → use for BDC Investor proxy

### 15.7 API Key Management

FRED API key: 32-char; soft rate limit ~120 req/min; store in env (Railway secrets); rotate annually.
SEC EDGAR: no key; 10 req/sec rate limit; UA header with contact email required.

### 15.8 Citation Tag Auto-Population

Every value pulled into L2 carries an auto-generated cite_tag. Examples:
* SOFR pulled at 9am Jan 14, 2026 → `[FRED:SOFR @ 2026-01-14]`
* Damodaran ERP pulled Jan 5, 2026 → `[Damodaran 2026]`
* §382 LTTER from Rev. Rul. 2026-9 → `[Rev. Rul. 2026-9]`

When Yulia references a value, the cite_tag travels with it through the L4 author into the user-visible output. L6 validator confirms the tag exists in `market_data_cache` (or live source).

---

## 16.0 BAIN-CAPITAL-CALIBER DIFFERENTIATION ARCHITECTURE (NEW — V19)

The "beat Bain Capital" benchmark is the design constraint. Bain Capital, KKR, Blackstone, Apollo — they have superior access (proprietary deal flow), superior people (HBS / GSB / Wharton MBA + 10-year IB pedigree), and superior operational depth (Bain Portfolio Group operating partner network).

smbX.ai cannot match those advantages directly. The differentiation is **breadth × speed × audit-trail × cost × always-on**.

### 16.1 The Six Mechanical Advantages

**Advantage 1 — Breadth:** Bain has a 200-person team; they cannot do 22 gates × 100+ models for 100 deals simultaneously. smbX.ai can. Speed is multiplicative across portfolio.

**Advantage 2 — Speed:** A bulge-bracket analyst takes 2 weeks to build a first-draft LBO. Yulia does it in 90 seconds. A Big 4 QoE takes 4 weeks. Yulia does QoE Lite in 1 day.

**Advantage 3 — Anti-Drift:** Bain associates are humans. They forget, they assume, they get tired. The L1/L2/L6 separation means Yulia produces the SAME deterministic answer every time. Citations are validated every time.

**Advantage 4 — Cost:** Bain's hourly rate-equivalent is $500–$2,000. smbX.ai at $199–$2,500/month is 50–500× cheaper.

**Advantage 5 — 24/7 Availability:** Bain doesn't respond at 11pm. Yulia does.

**Advantage 6 — Cross-Jurisdiction:** Bain has US-deal experts and EU-deal experts. Yulia has both, all jurisdictions, all leagues, simultaneously.

### 16.2 What smbX.ai Will NEVER Be

* Bain's relationship and access (proprietary deal flow, board seats, exec recruiting network)
* Bain's portfolio operating partner expertise (post-close operational transformation)
* Bain's brand-name underwriting (LP confidence in fund performance)

This is a feature, not a bug. smbX.ai serves practitioners who don't have Bain's access — independent sponsors, search funders, LMM advisors, corp dev at serial acquirers, family offices. They need analytical breadth and audit-trail rigor at LMM cost. Bain serves the other 5% of the market.

### 16.3 Live-Data Advantage

A Bain associate models with values they pulled into Excel a week ago. Yulia models with values pulled 10 minutes ago. For LBO debt pricing in volatile rate environments (May 2026 SOFR moves), this is a real edge.

### 16.4 Audit-Trail Defensibility

A Bain LP memo has been touched by 4 humans; the input chain is non-reproducible. Yulia's audit trail (§ 13.6) is fully reproducible. For LP defensibility (SOX-equivalent), this is an emerging requirement.

### 16.5 Cross-Sectional Pattern Recognition

Yulia processes deal data across thousands of platform users (anonymized, with consent). The platform learns: "When deals in HVAC L4 are structured with this rollover %, exit IRRs cluster here." Bain's pattern recognition is portfolio-internal (their 100 deals). Yulia's is platform-wide (all deals).

### 16.6 "Beat Bain" Operational Definition

For every deal Yulia handles, she must produce:
1. **More analytical breadth** — full model stack per § 12 in the standard package
2. **Faster turnaround** — minutes / hours vs days / weeks
3. **Equal or better citation rigor** — every claim sourced
4. **Lower cost** — by 50–500×
5. **Reproducible audit trail** — JSON downloadable

When all 6 are true, Yulia has "beaten Bain" on that deal. This is the win condition that drives V19's design.


---

## 17.0 INTERACTIVE CANVAS SYSTEM (Carried from V17 § 11, V19 Enhancements)

### 17.1 Architecture (Unchanged from V17)

Both UI controls (sliders, inputs, toggles) and Yulia (via `update_model` tool) modify the same state → deterministic recalculation → instant re-render.

**Critical:** Calculations are deterministic JavaScript, not AI. DSCR, IRR, MOIC, valuation ranges, amortization — all pure functions. Same inputs always produce same outputs. Instant (<16ms). Auditable. Exportable as real Excel formulas.

AI is used for: generating initial assumptions, interpreting results, suggesting scenarios, drafting communications based on outputs.

### 17.2 Yulia's Canvas Tools (Unchanged)

```
update_model      — modify assumptions in any tab (by tabId or "active")
create_model_tab  — open a new interactive model tab
render_to_tab     — push generated content to a tab
read_tab_state    — read assumptions + outputs from any tab ("active" or "all")
```

### 17.3 Interactive Model Types (Carried from V17, V19 Extended)

| Model Type | V17 Status | V19 Additions |
|---|---|---|
| Valuation Explorer | ✅ Built | Add VAL.TRIANGULATION weighted methodology view |
| LBO / Acquisition Model | ✅ Built | Add multi-tranche debt schedule (TLA + TLB + 2L + mezz); add unitranche option; add L7+ mega-LBO mode |
| SBA Financing Calculator | ✅ Built | Update for SOP 50 10 8 (10% equity, $350K small loan, prepay penalties) |
| Deal Comparison | ✅ Built | Add multi-deal portfolio mode (for roll-ups) |
| Sensitivity Matrix | ✅ Built | Add tornado chart for primary IRR drivers |
| Cap Table / Dilution | ✅ Built | Add post-money SAFE conversion + BBWA anti-dilution |
| Earnout Scenario | ✅ Built | Add Monte Carlo 10K-iteration mode (ASC 805 standard) |
| **PPA Optimizer** (NEW) | 🔴 NEW | §1060 Class I-VII allocation slider; §168(k) PV display |
| **Indemnification Exposure** (NEW) | 🔴 NEW | Cap × basket × survival × fraud carve-out → $ exposure with insurance offset |
| **RWI Pricing** (NEW) | 🔴 NEW | Marsh-derived ROL band + retention slider; NPV vs traditional indem |

### 17.4 Cross-Tab Awareness (Unchanged from V17)

Yulia's system prompt includes a summary of all open tab states. She can reference any tab. Linked tabs auto-update when source tabs change. Comparison tabs derive from model tabs.

### 17.5 Export from Interactive Models (Unchanged from V17)

* PDF: Snapshot of current state as branded report. Charts as images. Assumptions in appendix.
* XLSX: Full model with real Excel formulas. Blue inputs, black formulas. Sensitivity as separate sheet.
* Version history tracks each export as point-in-time.

---

## 18.0 SOURCING ENGINE (Carried from V17 § 12, V19 Enhancements)

### 18.1 5-Stage Pipeline (Unchanged from V17)

1. **Deep Research** — Census / SBA / BLS + Sonnet for sector intel
2. **Expansion Search** — Google Places IDs only (no cost)
3. **Tiered Enrichment** — Haiku website analysis (click-triggered)
4. **Scoring & Categorization** — Multi-dimensional fit scoring
5. **Portfolio Management** — Postgres + pg-boss background refresh

### 18.2 Scoring Dimensions (Unchanged from V17)

* Sector fit (NAICS match)
* Size fit (revenue / EBITDA band)
* Geography fit
* Recent activity recency
* Public signals (job postings, hiring, news)

### 18.3 Tier Classification (Unchanged from V17)

* Tier 1 — High-priority match (immediate outreach candidates)
* Tier 2 — Mid-priority (warm-up first)
* Tier 3 — Long-tail (newsletter / drip)

### 18.4 V19 Enhancements

* Buyer-side enhancement: PE platform registry by sector with active-acquirer signals (recent deals)
* Strategic-acquirer scraping from 10-K language (e.g., "actively pursuing acquisitions")
* Family office direct-investing identification (where public)
* Background refresh: weekly for active deals, monthly for parked deals

### 18.5 Cost & Performance (Unchanged from V17)

~$25/mo per active user (Google Places + Haiku enrichment); 8–10h CC time to ship.

---

## 19.0 PREMIUM DOCUMENT EXPORTS (Carried from V17 § 13)

### 19.1 Rendering Stack

* HTML → PDF: Puppeteer / Playwright (v1.56.0)
* `deviceScaleFactor: 2`, `preferCSSPageSize: true`, viewport 1080×1350 for carousels
* PDF verification via pypdfium2 preview PNGs

### 19.2 Chart Types

* Chart.js: bar, line, area, scatter, donut
* Recharts (in interactive): same set
* d3: for football field, tornado, sensitivity heatmaps

### 19.3 Export Formats (Per Doc Type)

| Doc Type | PDF | DOCX | XLSX | PPTX | HTML |
|---|---|---|---|---|---|
| CIM | ✅ | ✅ | — | — | — |
| Teaser | ✅ | ✅ | — | — | — |
| Valuation Report | ✅ | ✅ | ✅ | — | — |
| LBO Model | ✅ | — | ✅ | — | — |
| IC Memo | ✅ | ✅ | — | — | — |
| Pitch Deck | ✅ | — | — | ✅ | — |
| 100-Day Plan | ✅ | ✅ | — | — | — |
| Closing Checklist | ✅ | ✅ | ✅ | — | — |
| QoE Lite Report | ✅ | ✅ | ✅ | — | — |
| Term Sheet | ✅ | ✅ | — | — | — |

### 19.4 Brand Kit (Unchanged from V17 + V19 Refinement)

* Logo: smbX.ai with terra cotta X (#D4714E)
* Engine brand: smbX.ai Engine (X and Engine in terra; smb and .ai in primary)
* Primary text: #1A1C1E (dark) / #FFFFFF (light)
* Accent: #D44A78 (functional, never decorative)
* Glass UI chrome: `rgba(255,255,255,0.72)` + `blur(32px) saturate(1.8)` + specular `inset 0 0.5px 0 rgba(255,255,255,0.9)`
* Typography: Sora ExtraBold (headlines), Inter (body), JetBrains Mono (labels)

User-uploadable brand kit overrides (firm logo, color, font, footer) for white-label exports.

---

## 20.0 LIVING CIM (Carried from V17 § 14)

### 20.1 Concept (Unchanged)

A "Living CIM" is a CIM that updates as underlying data changes, with access tiers and sensitivity toggles. Different audiences see different views from the same source.

### 20.2 Access Tiers (Unchanged)

* Tier 1 — Public teaser (anonymized)
* Tier 2 — NDA-required CIM (full operational data)
* Tier 3 — Diligence-room (financials, contracts, customer-level data)
* Tier 4 — Final-bidder (legal, IP, employee-level)

### 20.3 Sensitivity Toggles (Unchanged)

* Customer name anonymization
* Financial year anonymization
* Geographic specificity
* Employee count band

### 20.4 V19 Enhancement: Audit-Trail Per Section

Each CIM section carries a section-level audit record (which L1 model fed it, which L2 source, which L3 document attestation). This supports diligence-defense at the user's request.

---

## 21.0 SUBSCRIPTION MODEL (Carried from V17 § 15, AUTHORITATIVE Pricing)

### 21.1 Pricing Tiers (LOCKED — March 26, 2026)

| Tier | Price | Inclusions |
|---|---|---|
| **Free** | $0 | Unlimited chat + 1 deliverable (email required after first deliverable) |
| **Solo** | $79 / mo | Single user; unlimited deliverables; SDE / EBITDA / valuation / SBA / basic LBO |
| **Pro** | $199 / mo | Single user; everything Solo + QoE Lite + CIM + full L4 model stack |
| **Team** | $499 / mo | 5 seats; everything Pro + RBAC + deal-room sharing |
| **Enterprise** | $2,500+ / mo | Custom seats; white-label; MCP server access (post-launch); SLA |

### 21.2 Pricing Principles (LOCKED)

* Monthly subscription only at launch
* No per-deal fees
* No wallet (deprecated post-V17 wallet model)
* No annual pricing at launch (deferred 3–6 months pending retention data)
* Email captured BEFORE first deliverable generates (not after)
* Pattern: user clicks "generate" → Yulia: "I'll have it ready in 20 seconds — where should I send it?" → email field → submit → generate
* 30-day free trial of Pro (after free deliverable)
* Subscription continues post-close for PMI support

### 21.3 Broker / Advisor Pricing (LOCKED)

* No separate Advisor pricing tier
* Solo broker = $199 Pro
* Broker with team = $499 Team or $2,500+ Enterprise
* CIM generation requires $199 Pro

### 21.4 Enterprise Floor (LOCKED)

$2,500+ / month — to capture corp dev and family office willingness-to-pay (not the prior $999 floor)

### 21.5 MCP Server (Post-Launch Enterprise Feature)

$2,500+ / month Enterprise feature. Announced at launch, shipped 3–6 months later. Architecture per `SMBX_API_MCP_ARCHITECTURE.md`. Not committed to launch build.

### 21.6 Day Pass (Optional, Tier 0 Decision Pending)

24-hour access at fixed price (e.g., $49 / day) for one-off needs (CIM emergency, single deal scoring). Defer-or-include decision pending; not Tier 0 critical.

---

# END OF METHODOLOGY V19 MASTER

**File:** `METHODOLOGY_V19.md`
**Sections:** 21 sections + index
**Authoritative for:** AI governance, calc engine, workflows, gates, deal model catalog, tax + legal architecture, anti-hallucination, live data, canvas, sourcing, exports, CIM, subscription.

**Companion documents to build next:**
* `SMBX_DEAL_MODEL_CATALOG.md` — per-model schemas
* `SMBX_LEGAL_TAX_ECONOMICS_CATALOG.md` — every legal/tax concept → dollar impact
* `SMBX_YULIA_MODEL_GATING_LOGIC.md` — deterministic decision tree code spec
* `YULIA_PROMPTS_V4.md` — runtime prompts updated to V19

**Superseded:**
* `METHODOLOGY_V17.md`
* `METHODOLOGY_V18a_TAX_AMENDMENT.md`
* `METHODOLOGY_V18b_LEGAL_AMENDMENT.md`

**Effective:** May 14, 2026. CC implementation per `CC_V19_IMPLEMENTATION_BRIEF.md`.

