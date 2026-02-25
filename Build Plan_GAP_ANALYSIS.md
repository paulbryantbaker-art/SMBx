# Promise vs. Capability Gap Analysis
# What the v12 prototype tells users vs. what the build plan can deliver

## SELL Journey Promises

| What the page says | Data needed | Phase that delivers | Gap? |
|---|---|---|---|
| Classifies by NAICS, maps competitive landscape | Census CBP | A (Claude knowledge) → G (real data) | ⚠️ Phase A uses training knowledge, not live Census |
| Benchmarks against local peers (BLS wages, BEA economics, IRS benchmarks) | BLS + BEA + IRS | G (BLS/BEA) → I (IRS) | 🔴 IRS SOI not until Month 4 but promised in Phase 1 sell content |
| "Systematically identifies every add-back by checking against IRS Statistics of Income benchmarks" | IRS SOI | Phase I (Month 4) | 🔴 Core sell promise, data arrives Month 4 |
| Multi-methodology valuation with sources shown | Industry comps + public data | D (deliverable) → G (real data) | ⚠️ Launch valuations use Claude knowledge, not sourced data |
| "Seven factors that move your multiple" scored | Scoring system | ??? | 🔴 NOT BUILT IN ANY PHASE — no explicit seven-factor scoring model |
| Industry consolidation timing (138 HVAC deals, PE roll-ups) | GDELT + news + deal tracking | H (event detection, Month 3) | ⚠️ Claude knows this from training, real-time tracking is Month 3 |
| Geographic valuation intelligence (BEA RPP, Census density) | BEA + Census | G (Month 2) | ⚠️ Fine — this is a premium feature, not a launch promise |
| CIM generation | Opus model + templates | D | ✅ |
| Buyer identification & scoring | Multi-thesis matching | G | ⚠️ Not at launch |
| LOI evaluation against market benchmarks | Comp data | D + I | ⚠️ Claude knowledge at launch |

## BUY Journey Promises

| What the page says | Data needed | Phase that delivers | Gap? |
|---|---|---|---|
| SBA bankability analysis (SOP 50 10 8, DSCR at current SOFR) | FRED rates (real-time) | G (FRED API) | 🔴 SBA is dock tool #4 AND major buy feature — needs current rates at launch |
| "June 2025's SOP 50 10 8 changed the rules" — specific rule knowledge | Claude training | A | ✅ Claude knows this |
| Target screening against seven factors | Seven-factor model | ??? | 🔴 Same gap — no explicit scoring system |
| Red flag detection (concentration, owner dependency) | Scoring logic | B + D | ⚠️ Works via Claude reasoning, no structured scoring |
| "Valuation with local intelligence" — Census + BLS + BEA | Gov data APIs | G + I | ⚠️ Not at launch |
| QoE deep dive | Opus model + templates | D | ✅ |
| "Market context during diligence" — live intelligence feed | Event detection | H (Month 3) | ⚠️ Post-launch feature |
| Post-merger integration (100-day plan) | Templates | D | ✅ |

## AGENCY Journey Promises

| What the page says | Data needed | Phase that delivers | Gap? |
|---|---|---|---|
| CIM from uploaded P&L | Document processing + Opus | D | ✅ But needs document upload/parsing |
| SBA financing model (current SOFR + SBA margin) | FRED rates | G | 🔴 Same SBA gap |
| Deal screening memo (seven factors scored) | Scoring model | ??? | 🔴 Same seven-factor gap |
| Adaptive deal workspace (remembers context) | LangGraph state | G (LangGraph.js) | 🔴 Agent state persistence is Phase G |

## INTELLIGENCE Journey Promises

| What the page says | Data needed | Phase that delivers | Gap? |
|---|---|---|---|
| Census CBP | API integration | G | ✅ Correctly phased |
| BLS QCEW | API integration | G | ✅ |
| BEA Regional Economic Accounts | API integration | G | ✅ |
| FRED + Treasury + SBA | API integration | G | ✅ |
| IRS Statistics of Income | API integration | I | ✅ Correctly phased |
| SEC EDGAR + transaction comps | API integration | I | ✅ |
| One-Click Market Intelligence Report | All data + Claude synthesis | G | ✅ |
| Market Fragmentation Heat Map | Census + scoring | G/I | ✅ |

## DOCK TOOLS Promises

| Tool | What it does | Gap? |
|---|---|---|
| Upload financials | "Share a P&L, tax return, or balance sheet" | 🔴 Document upload/parsing not in any Phase A-D explicitly |
| Business valuation | "Estimate worth based on revenue, earnings, and comps" | ⚠️ Works via Claude, real comps are Phase G+ |
| Search for a business | "Find businesses by industry, location, size, or price" | 🔴 No listing data source in any phase |
| SBA loan check | "See if a deal qualifies for SBA 7(a)" | 🔴 Needs current SOFR rate from FRED |

---

## CRITICAL GAPS SUMMARY

### 🔴 GAP 1: Seven-Factor Scoring Model — NOT BUILT ANYWHERE
Referenced 6+ times across sell and buy journeys. Central to the value proposition.
No structured scoring system in any phase. Currently relies on Claude ad-hoc reasoning.

### 🔴 GAP 2: SBA Analysis Needs Current Rates at Launch
SBA check is dock tool #4, featured prominently in buy journey.
Current SOFR + SBA rates needed for DSCR calculation.
FRED API integration is Phase G (Month 2). SBA analysis is expected at launch.

### 🔴 GAP 3: IRS SOI Promised in Sell Phase 1 Content, Delivered in Phase I (Month 4)
"Checking expenses against IRS Statistics of Income benchmarks" is a specific sell-side claim.
IRS data integration doesn't arrive until Month 4.

### 🔴 GAP 4: Document Upload/Parsing Not Explicitly in Pre-Launch Phases
Dock tool #1 is "Upload financials." Agency page promises CIM from uploaded P&L.
Phase B mentions "document upload + extraction" but no parsing pipeline specified.

### 🔴 GAP 5: "Search for a Business" Has No Data Source
Dock tool #3 promises business search by industry/location/size/price.
No listing aggregation or business directory integration in any phase.

### 🔴 GAP 6: Worker Service Deploys Too Late
Report recommends worker service for background jobs.
Build plan puts worker in Phase G. But Phase D (deliverable generation) already needs background processing.

### 🔴 GAP 7: Agent State Persistence Only Arrives at Phase G
LangGraph.js checkpointer is Phase G. But the "adaptive deal workspace" and conversation continuity
that Yulia needs to be truly agentic requires persistent state from Phase B onward.

### ⚠️ GAP 8: Launch Valuations Use Claude Training Knowledge, Not Sourced Data
Not a blocker — Claude's M&A knowledge is substantial and accurate.
But the sell page implies data-sourced valuations ("each methodology shown with sources").
Build plan should explicitly note: Phase A-E = Claude intelligence, Phase G+ = data-enriched intelligence.
