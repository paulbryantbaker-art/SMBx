# STRATA OPERATING SYSTEM: MASTER METHODOLOGY (v17.1)

**Scope:** AI Governance, Workflow Logic, Calculation Engine, Tool Orchestration, GTM Features, Interactive Canvas.
**Core Mandate:** "Data is Commodity; Workflow is the Moat."
**Security Level:** CRITICAL (Financial Data Governance)
**Updated:** March 2026 — Interactive Canvas, Sourcing Engine, Premium Exports

---

## 0.0 METHODOLOGY DOCUMENT INDEX

This master document provides AI governance and calculation rules. For detailed gate-by-gate workflows, refer to these role-specific methodology documents:

| Document | For | Gates/Phases | Description |
|----------|-----|--------------|-------------|
| **EXIT_METHODOLOGY.md** | Sellers (100% sale) | G1-G5 | Complete exit workflow: Intake → Financials → Packaging → Matching → Closing |
| **RAISE_METHODOLOGY.md** | Sellers (partial sale) | R1-R6 | Capital raise workflow: Readiness → Financials → Pitch Deck → Investors → Term Sheet → DD |
| **BUYER_METHODOLOGY.md** | Buyers | B1-B6 | Acquisition workflow: Thesis → Sourcing → Valuation → DD → Structuring → Closing |
| **BROKER_METHODOLOGY.md** | Partners/Brokers | P1-P6 | Deal management: Mandate → Prep → Marketing → Offers → Execution → Close |
| **PMI_METHODOLOGY.md** | Post-Acquisition | 100-Day | Integration: Day 0 → Stabilization → Assessment → Optimization |

**Routing Logic:**
- User says "sell my business" + wants 100% exit → EXIT_METHODOLOGY.md
- User says "raise capital" or "partial sale" → RAISE_METHODOLOGY.md
- User says "buy a business" or "acquire" → BUYER_METHODOLOGY.md
- User is broker/partner → BROKER_METHODOLOGY.md
- User just closed acquisition → PMI_METHODOLOGY.md

---

## 1.0 THE AI ORCHESTRATION MATRIX (The "Right Tool" Protocol)

To achieve "Intelligence without Hallucination," the system never calls a generic model. It routes every task to a specialized engine with strict constraints.

| Task Category | The Engine | Configuration / Constraint | Behavior Goal |
|---|---|---|---|
| Financial Extraction | Gemini 1.5/2.0 Flash | Mode: JSON_OUTPUT_ONLY. Temp: 0.0. Prompt: "Extract exact values from PDF. Do not round. Do not calculate." | Zero Hallucination. Pure OCR/Data entry. |
| Market Intelligence | Gemini 2.0 Pro + Search | Mode: SEARCH_GROUNDING_ENABLED. Prompt: "Ignore training data. Use Google Search for 2025/2026 sector multiples." | High Intelligence. Aware of "hot" markets. |
| Legal/Diligence | NotebookLM (RAG) | Mode: GROUNDED_ONLY. Prompt: "Answer strictly from the provided Index. If not found, state 'Unknown'." | Walled Garden. Safe legal review. |
| Deal Modeling | Gemini for Sheets | Mode: FORMULA_INJECTION. Prompt: "Populate cell C5 with DSCR formula based on inputs." | Mathematical Rigor. Dynamic modeling. |
| Cap Table Logic | Gemini 2.0 Pro | Mode: REASONING. Prompt: "Calculate the waterfall based on Senior Debt > Mezz > Equity preference stack." | Structural Smarts. Handling complex equity. |
| Drafting (LOI) | Gemini for Docs | Mode: TEMPLATE_INJECTION. Prompt: "Map deal terms to the 'L5 Asset Purchase Agreement' template." | Standardization. Consistent legal output. |

### 1.1 The "Author vs Auditor" Protocol

Yulia has two distinct modes when working with documents:

| Role | Engine | Behavior | Use Cases |
|------|--------|----------|-----------|
| **Author** (Creative) | Gemini Pro/Flash | Generates new content, summarizes, interprets, synthesizes | CIM drafting, valuation narratives, pitch decks, market summaries |
| **Auditor** (Forensic) | NotebookLM RAG | Only cites from provided sources, never hallucinates | Add-back verification, legal clause extraction, tax return analysis, document verification |

**Routing Rules:**

1. **Use NotebookLM (Auditor)** when:
   - User asks "what does the contract say about..."
   - Extracting specific numbers from financial documents
   - Verifying claims with exact citations
   - Legal clause review requiring page/section references
   - Add-back analysis with source documentation
   - Any task where the answer MUST exist in the documents

2. **Use Gemini (Author)** when:
   - Creating new content (CIM, pitch deck, LOI)
   - Synthesizing information from multiple sources
   - Market analysis with search grounding
   - Interpreting data and providing recommendations
   - Any creative or generative task

**NotebookLM Hard Rails:**
- MUST return "NOT FOUND in provided documents" if information is missing
- MUST provide citation: [Document Name, Page X] for every claim
- Temperature: 0.1 (near-zero for accuracy)
- Never infer or assume - only quote what exists

**Task Category Mapping:**

```
NotebookLM Tasks (shouldUseNotebookLM = true):
├── legal_diligence
├── financial_verification
├── add_back_analysis
├── document_forensics
├── contract_review
└── tax_return_analysis

Gemini Tasks (shouldUseNotebookLM = false):
├── chat (conversation)
├── market_intelligence
├── valuation
├── cap_table_logic
├── drafting_loi
├── generate_doc/sheet/slides
└── calculation
```

---

## 2.0 THE MARKET INTELLIGENCE ENGINE ("Smart" Capabilities)

The AI must understand the context of the deal environment. This engine runs in the background to context-switch the AI's advice.

### 2.1 The "Market Heat" Index

* **Trigger:** User selects an Industry (e.g., "Veterinary Clinics").
* **System Action:** Gemini Pro executes a live search for "Private Equity consolidation trends Veterinary 2025 2026".
* **Data Extraction:**
  * Trend Direction: (Consolidating / Stagnant / Distressed).
  * Active Buyers: (List of PE firms currently deploying capital).
  * Multiple Expansion: (Are multiples rising or falling?).
* **Application:**
  * If Trend == "Hot", the AI increases the "Defensible Valuation" range by a Premium Factor (0.5x - 1.5x).
  * Yulia Alert: "Market Alert: Veterinary is currently a 'Super-Hot' sector. We should position this as a 'Platform' play, not a standard sale."

### 2.2 The "Macro" Overlay

* **Trigger:** Interest Rate Changes (Fed Data).
* **System Action:** Yulia monitors the Prime Rate.
* **Application:**
  * If Prime Rate increases, the DSCR Engine automatically lowers the "Max Debt Capacity" for L1/L2 buyers.
  * Yulia Alert: "Interest Rate Warning: The Fed hike yesterday reduced your buying power by $150k. I have updated your affordability model."

### 2.3 Market Pulse (Real-Time Intelligence)

Personalized market insights delivered through the Intelligence Hub.

**Data Sources:**
- Google Search Grounding (live sector news)
- SEC EDGAR filings (M&A announcements)
- Industry publications (trade journals, analyst reports)
- Platform data (deal velocity, pricing trends)

**Insight Categories:**
| Category | Frequency | Example |
|----------|-----------|---------|
| Sector Alerts | Real-time | "PE firm announces $500M veterinary roll-up fund" |
| Multiple Trends | Weekly | "HVAC multiples up 0.5x in Q4 2025" |
| Deal Flow | Daily | "12 new dental practices listed in Texas this week" |
| Rate Impact | On change | "SBA rates up 25bps - max loan amount reduced" |

### 2.4 Knowledge Base Architecture

Yulia's continuously updated knowledge comprises three tiers:

**Tier 1: Sector Intelligence (40+ industry verticals)**
- Historical multiple ranges
- Common add-backs by industry
- Key performance indicators
- Typical deal structures

**Tier 2: Market Snapshots (Regional + National)**
- Geographic pricing variations
- Regional buyer pool density
- Local economic indicators
- State-specific regulations

**Tier 3: M&A Knowledge Base (Best Practices)**
- Deal structuring playbooks
- Negotiation tactics by league
- Common pitfalls and red flags
- Post-close integration guides

### 2.5 Context Injection Protocol

Every AI prompt receives layered context:

```
[LAYER 1: CONSTITUTION]
└── Core methodology rules, hard rails, forbidden actions

[LAYER 2: USER CONTEXT]
├── League classification (L1-L6)
├── Role (buyer/seller/broker/advisor)
├── Deal history and preferences
└── Risk tolerance profile

[LAYER 3: DEAL CONTEXT]
├── Current deal stage (gate)
├── Financial data ingested
├── Documents uploaded
└── Parties involved

[LAYER 4: MARKET CONTEXT]
├── Industry heat index
├── Regional pricing data
├── Macro overlays (rates, economy)
└── Recent comparable transactions
```

---

## 3.0 LEAGUE GOVERNANCE (Hard Logic Gates)

The AI is forbidden from guessing the user's category. It enforces the following classification matrix based on financial inputs.

| League | Deal Size Criteria | Valuation Metric | Multiple Range | Yulia's Persona | Primary Risk Focus |
|---|---|---|---|---|---|
| L1 | < $500k SDE | SDE | 2.0x - 3.5x | Coach (Directive) | Owner Dependency |
| L2 | $500k - $2M SDE | SDE | 3.0x - 5.0x | Guide (Process) | Financial Hygiene |
| L3 | $2M - $5M EBITDA | EBITDA | 4.0x - 6.0x | Analyst (Cynical) | Management Gaps |
| L4 | $5M - $10M EBITDA | EBITDA | 6.0x - 8.0x | Associate (GAAP) | Bank Covenants |
| L5 | $10M - $50M EBITDA | EBITDA | 8.0x - 12.0x | Partner (Strategic) | Synergy Failure |
| L6 | $50M+ EBITDA | EBITDA + DCF | 10.0x+ | Macro (Inst.) | Antitrust / Global |

### The "Roll-Up" Override Rule:

* **Logic:** IF Industry == [Vet, Dental, HVAC, MSP, Pest Control] AND Revenue > $1.5M.
* **Action:** Force EBITDA Metric (instead of SDE) regardless of League.
* **Rationale:** These sectors trade on institutional metrics even at small scale.

---

## 4.0 THE FUNCTIONAL LIFECYCLE (Step-by-Step Governance)

### Phase 1: Intelligent Onboarding (The "Trap Door")

* **Goal:** Classification & Intent.
* **Logic:**
  * Ingest Query: "Buying HVAC in Texas."
  * Determine Role: Ask Capital Strategy (SBA vs. Fund).
  * Set League: Assign L5_BUYER tag.
* **Output:** The user session is now governed by the L5 Rulebook (No SDE, EBITDA only, Arbitrage focus).

### Phase 2: Seller Workflow (The Forensic Audit)

* **Step A: Ingestion (Zero Hallucination)**
  * Tool: Gemini Flash (JSON Mode).
  * Input: PDF Tax Returns / P&L.
  * Constraint: Extract line items exactly as written.
  * Visual Proof: System displays the extracted number next to a crop of the PDF source. User must click "Verify."

* **Step B: The Add-Back Logic**
  * Tool: Gemini Pro (Reasoning).
  * Logic: Scan G/L codes for keywords: Auto, Travel, Meals, Consulting, Amex, Patent.
  * Governance: AI suggests add-backs but cannot confirm them. User Action required.
  * Calculation: Adjusted EBITDA = Net Income + D + A + I + Verified_Addbacks.

* **Step C: The Valuation Defense**
  * Tool: Gemini Pro + Search.
  * Logic: Base_Multiple (from Search) + Growth_Premium + Margin_Premium = Strata_Valuation.
  * Output: A "Defensible Thesis" PDF citing real market comps.

### Phase 2B: Raise Workflow (Capital Raise / Partial Equity Sale)

**See: RAISE_METHODOLOGY.md for complete documentation**

This is an ALTERNATE PATHWAY for sellers who want to raise capital by selling a minority stake (10-49%) while retaining operational control.

* **Detection Triggers:**
  * User says: "raise capital", "investors", "minority stake", "partial sale", "growth equity"
  * User says: "keep running the business", "bring on a partner", "not ready to fully exit"
  * Revenue > $5M AND ambiguity about sale type → Ask clarifying question

* **Mode Switch:**
  * Yulia asks: "It sounds like you want to raise capital by selling a partial stake, rather than selling 100%. Is that right?"
  * If YES → Switch to RAISE_METHODOLOGY.md (Gates R1-R6)
  * If NO → Continue with standard Seller Workflow (Gates G1-G6)

* **Key Differences from Complete Exit:**
  | Aspect | Complete Exit | Raise |
  |--------|---------------|-------|
  | Document | CIM | Investor Pitch Deck |
  | Buyer type | Acquirers | Growth equity, family offices |
  | Timeline | 6-12 months | 3-6 months |
  | Post-close role | None | Continued CEO |

* **Raise Gate Summary:**
  * R1: Capital Raise Readiness Assessment
  * R2: Financial Package Preparation
  * R3: Investor Materials Creation (Pitch Deck)
  * R4: Investor Outreach & Qualification
  * R5: Term Sheet Negotiation
  * R6: Full Due Diligence → Closing

### Phase 3: Buyer Workflow (The Hunt)

* **Step A: Thesis Generation**
  * Tool: Gemini Pro.
  * Logic: Match Capital_Deployment to Market_Opportunity.
  * Output: "Investment Memo" (L1: Cash Flow Safety | L5: Arbitrage Spread).

* **Step B: The Fit Score**
  * Calculation: Weighted Average Score (0-100).
    * Financial_Fit (40%): Does Adjusted EBITDA meet ROI target?
    * Operational_Fit (30%): Does Buyer Skill match Seller Gap?
    * Thesis_Fit (30%): Does Geography/Industry match?

### Phase 4: The Deal Architect (Structuring & Cap Tables)

This is where the AI must be "Smart" about money.

* **Step A: The Cap Table Engine (L5/L6)**
  * Context: For larger deals with multiple investors (Syndicates/PE).
  * Tool: Gemini Pro (Reasoning).
  * Logic: The AI models the Waterfall Distribution:
    * Senior Debt: Paid first.
    * Mezzanine/Preferred Equity: Paid second (often with a "Hurdle Rate").
    * Common Equity: Paid last (Residual).
  * User Action: User inputs "Investment Amount" and "Class."
  * Output: Yulia generates a visual chart: "At a $20M exit, Class A gets 2.5x MOIC, Class B gets 1.2x MOIC."

* **Step B: The Structuring Mixer (Sources & Uses)**
  * Tool: Gemini for Sheets.
  * Calculation (L1 - SBA):
    * Max_Loan_Amount = (EBITDA / 1.25) × 10 years.
    * Constraint: If Price > Max_Loan_Amount, Yulia alerts: "Price Gap. You need more Seller Financing to bridge this."
  * Calculation (L5 - LBO):
    * IRR_Model = Entry_Valuation vs. Exit_Valuation (5 years).
    * Sensitivity: Yulia runs 3 scenarios (Base, Bull, Bear) automatically.

### Phase 5: Negotiation & Papering

* **Step A: The Bridge Visualizer**
  * Logic: Enterprise Value → Net Debt → Working Capital → Equity Value.
  * Interaction: Buyer adjusts "Working Capital Peg." Yulia instantly recalculates "Final Wire Amount."

* **Step B: Drafting (LOI)**
  * Tool: Gemini for Docs.
  * Governance: Yulia pulls the agreed terms from the Deal Architect and injects them into the League-Specific Template.
  * L1 Template: Simple, plain English, "Handshake" style.
  * L5 Template: Complex, includes "Rep & Warranty Insurance," "Exclusivity," "Break-up Fees."

### Phase 6: Closing & Funds Flow

* Tool: Gemini for Sheets (Locked).
* Logic: Prorates Rent, Utilities, Inventory based on Closing_Date.
* Security: This Sheet is Read-Only for Principals. Only ROLE_PROVIDER_LEGAL can edit the "Adjustment Cells."
* Output: The Final Funds Flow Statement (down to the penny).

### Phase 7: PMI (Integration)

**See: PMI_METHODOLOGY.md for complete 100-day integration plan**

* **L1 Protocol (Handover):**
  * Tool: NotebookLM.
  * Task: "Tribal Knowledge Transfer." AI interviews Seller, creates Audio SOPs.

* **L5 Protocol (Synergy):**
  * Tool: Gemini Pro (Analytics).
  * Task: "Value Creation Plan (VCP)." Tracks Actual_Margin vs Target_Margin. Triggers alerts if Synergies lag.

---

## 4.5 GTM FEATURE SUITE (January 2026 Release)

These features complete the "Workflow is the Moat" vision by embedding SellBuySMB deeply into multi-party M&A workflows.

### 4.5.1 Living CIM Builder (`/app/living-cim`)

Dynamic, auto-updating Confidential Information Memorandums with real-time financial data integration.

**Core Capabilities:**
- Real-time binding to accounting data (QuickBooks, Xero via Codat/Rutter)
- Sensitivity toggles for valuation scenarios
- Scenario modeling with saved configurations
- Version tracking with publish states

**Sharing & Access Control:**
| Access Level | What User Sees | Requirements |
|--------------|----------------|--------------|
| **Blind Profile** | Anonymized title, state only, industry, asking price | None (public) |
| **Teaser** | Executive summary, financial highlights, no detailed financials | Account creation |
| **Full Access** | Complete CIM with all financials | NDA acceptance |

**Blind Profile Rules:**
- Never reveal: Business name, city, specific address, owner names
- Safe to reveal: State, industry, revenue range, employee count range
- Reveal strategy: `signup` (create account), `nda` (sign NDA), `both` (staged)

**Security:**
- Atomic view counter (prevents race conditions)
- Max view limits with automatic link expiration
- Explicit field selection (no data leaks via spread operator)
- NDA acceptance logged with timestamp, IP, user agent

### 4.5.2 Ghost Profile Notifications

Marketing engagement system that alerts unclaimed businesses when investors are tracking them.

**Workflow:**
1. Buyer saves/watches a business from external source (BizBuySell, LoopNet, etc.)
2. System creates/updates `ghost_notification` record
3. Tracker count increments
4. When threshold reached (e.g., 3 trackers), system triggers outreach:
   - "An investor is tracking your business on SellBuySMB"
   - Encourages owner to claim profile and engage

**Use Cases:**
- Convert scraped listings into active sellers
- Demonstrate market demand to hesitant sellers
- Build seller-side marketplace flywheel

### 4.5.3 Broker Listing Generator (`/app/broker-listing`)

AI-powered tool for brokers to generate 22x-compliant CIMs from raw financials.

**Input:**
- Business Information (name, industry, location, employees, year established)
- Financial Data (revenue, EBITDA, SDE, gross margin, YoY growth)
- Add-backs (owner salary, one-time expenses, discretionary)
- Seller notes (reason for sale, growth opportunities, competitive advantages)

**Output (Structured JSON via Gemini 2.5 Flash):**
```
{
  executiveSummary: string,
  businessDescription: string,
  financialHighlights: { revenue, sde, ebitda, grossMargin, yoyGrowth, addBacks },
  keyInvestmentHighlights: string[5],
  growthOpportunities: string[5],
  riskFactors: string[5],
  valuationSummary: { methodology, multipleLow, multipleHigh, rationale }
}
```

**Compliance:** 22x format includes executive summary, investment highlights, financial overview, growth story, risk disclosure, and valuation methodology.

### 4.5.4 Lender Risk Dashboard (`/app/lender-dashboard`)

Automated risk assessment tool for SBA and conventional lenders.

**DSCR Calculation (Mortgage Amortization Formula):**
```
Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
Annual Debt Service = Monthly Payment × 12
DSCR = EBITDA / Annual Debt Service
```

**Risk Scoring Matrix:**
| DSCR | LTV | Risk Score | Recommendation |
|------|-----|------------|----------------|
| ≥1.50 | ≤70% | LOW | Approve |
| 1.25-1.50 | 70-80% | MEDIUM | Approve with conditions |
| 1.15-1.25 | 80-90% | HIGH | Enhanced review required |
| <1.15 | >90% | CRITICAL | Decline |

**Covenant Analysis:**
- DSCR Covenant: Minimum 1.25 for SBA, 1.50 for conventional
- LTV Covenant: Maximum based on asset class
- Debt/EBITDA: Maximum leverage ratio

**SBA Eligibility Check:**
- Business size standards by NAICS code
- Loan amount limits ($5M for 7(a), $5.5M for 504)
- Collateral requirements
- Owner guarantee requirements

### 4.5.5 Day Pass / Fractional Seats

48-hour deal-specific access tokens for external advisors (attorneys, CPAs, lenders, consultants).

**Access Levels:**
| Level | Permissions |
|-------|-------------|
| `read` | View documents, no comments |
| `comment` | Read + add comments |
| `full` | Read + comment + edit (restricted areas) |

**Lifecycle:**
1. Deal owner creates day pass (generates secure token)
2. Invitee receives link via email
3. First access activates timer (sets `startsAt`)
4. `expiresAt` = `startsAt` + `durationHours` (default 48)
5. Access automatically revoked at expiration

**Authorization:**
- Day pass routes require deal ownership to create
- Token-based access for invitees (no account required to view)
- Revocation available to creator or deal owner

### 4.5.6 Transaction Token Pricing

Success fee model that captures value when deals close.

**Fee Structure:**
```
Transaction Fee = MAX(deal_value × 0.5%, $2,000)
```

**Examples:**
| Deal Value | Calculated Fee | Applied Fee |
|------------|----------------|-------------|
| $100,000 | $500 | $2,000 (minimum) |
| $500,000 | $2,500 | $2,500 |
| $1,000,000 | $5,000 | $5,000 |
| $5,000,000 | $25,000 | $25,000 |

**Payment Flow:**
1. Deal reaches closing stage → Transaction token created
2. Final deal value entered → Fee calculated
3. Stripe PaymentIntent created → Buyer/seller directed to checkout
4. Payment confirmed → Token marked `paid`

**Authorization:**
- Token creation: Admin or deal party
- Fee update: Admin only (prevents manipulation)
- Payment: Deal party with valid token

### 4.5.7 Deal Velocity Tracking

Analytics system tracking deal progression speed through the pipeline.

**Event Types (10 stages):**
1. `discovery` - Deal first identified
2. `first_view` - User first views deal details
3. `saved` - Added to watchlist
4. `nda_signed` - NDA executed
5. `cim_requested` - Full CIM requested
6. `meeting_scheduled` - First meeting set
7. `loi_submitted` - LOI submitted
8. `loi_accepted` - LOI accepted by seller
9. `due_diligence_started` - DD period begins
10. `closing` - Deal closed

**Metrics Calculated:**
- `daysToNda`: Discovery → NDA signed
- `daysToLoi`: Discovery → LOI submitted
- `daysToClose`: Discovery → Closing
- `daysInCurrentStage`: Time in current stage
- `stageTransitionTimes`: Per-stage duration breakdown

**Platform Analytics (Admin):**
- Average velocity by stage
- Bottleneck identification
- Comparison across deal sizes/industries

### 4.5.8 SBSMB Pay / Escrow Integration

Embedded escrow transactions and earnout milestone management.

**Transaction Types:**
| Type | Description | Flow |
|------|-------------|------|
| `deposit` | Initial escrow deposit | Buyer → Escrow |
| `earnout` | Performance-based payment | Escrow → Seller (on milestone) |
| `holdback` | Reserved for claims/adjustments | Held in escrow |
| `release` | Final disbursement | Escrow → Seller |

**Earnout Schedule Management:**
- Define milestones (revenue targets, EBITDA goals, customer retention)
- Set payout amounts per milestone
- Track verification status
- Automatic status updates: `pending` → `achieved` → `paid`

**Stripe Integration:**
- PaymentIntent creation for deposits
- Webhook handling for payment confirmation
- Audit trail for all transactions

### 4.5.9 Magma Feedback Loop (Ground Truth)

System for capturing verified financials post-close to improve AI estimation accuracy.

**Data Captured:**
| Field | Source | Purpose |
|-------|--------|---------|
| Estimated Revenue | Discovery phase | Baseline prediction |
| Actual Revenue | Closing documents | Ground truth |
| Revenue Delta % | Calculated | Training signal |
| Estimated EBITDA | Valuation model | Baseline |
| Actual EBITDA | Verified financials | Ground truth |
| EBITDA Delta % | Calculated | Training signal |

**Verification Sources:**
- Closing documents (highest confidence)
- Tax returns (high confidence)
- Bank statements (medium confidence)
- Accounting system export (medium confidence)

**Industry Calibration:**
- Aggregate deltas by industry + revenue range
- Identify systematic over/under estimation
- Feed adjustments back into valuation models
- Track accuracy improvement over time

### 4.5.10 Network Density Metrics

Track deal room participants to measure platform stickiness and engagement.

**Participant Roles (7 types):**
1. `buyer` - Acquiring party
2. `seller` - Selling party
3. `attorney` - Legal counsel
4. `cpa` - Accountant/tax advisor
5. `lender` - Financing source
6. `broker` - M&A intermediary
7. `consultant` - Other advisor

**Metrics:**
- **Deal Network Density**: Total participants per deal
- **Role Distribution**: Breakdown by role type
- **Engagement Rate**: Active participants / Total participants
- **Activity Score**: Weighted activity count

**Platform Analytics:**
- Average participants per deal
- Most common external roles
- Correlation: network density → deal success rate
- Identify high-engagement user segments

### 4.5.11 Collaboration Tools

Multi-party deal room collaboration features.

**Document Sharing:**
- Role-based access (read/comment/edit)
- Version history with author tracking
- Watermarking for sensitive documents
- Download restrictions by role

**Communication:**
- Deal-scoped messaging
- @mentions for participants
- Activity notifications
- Read receipts

**Task Management:**
- Due diligence checklists
- Task assignment by role
- Status tracking (pending/in-progress/complete)
- Deadline reminders

---

## 5.0 THE MATH ENGINE (Standardized Calculations)

The AI is forbidden from inventing formulas. It must apply these standards.

### 5.1 SDE (Seller Discretionary Earnings) - L1/L2

```
SDE = Net_Income + Owner_Salary + Depreciation + Amortization + Interest + One_Time_Expenses + Verified_Addbacks
```

### 5.2 Adjusted EBITDA - L3-L6

```
Adjusted_EBITDA = Net_Income + Depreciation + Amortization + Interest + Taxes + Verified_Addbacks - Non_Recurring_Income
```

### 5.3 DSCR (Debt Service Coverage Ratio)

```
DSCR = EBITDA / Annual_Debt_Service
```

* **SBA Threshold:** DSCR must be ≥ 1.25
* **Conventional Threshold:** DSCR must be ≥ 1.50

### 5.4 Arbitrage Spread (L5 Metric)

```
Arbitrage_Spread = (Exit_Multiple - Entry_Multiple) × EBITDA
```

* **Target:** Minimum 2.0x MOIC over 5-year hold.

### 5.5 Financial Analysis Framework by League

#### Required in Journey (Guided Steps)
| League | Required Analysis in Journey |
|--------|------------------------------|
| L1-L2 | SDE calculation, basic DSCR check |
| L3-L4 | Adjusted EBITDA, Working Capital basics |
| L5-L6 | Three-statement analysis, FCF, IRR modeling |

#### Optional/On-Demand Tools (Available but not in Journey after L3)
After L3, users can optionally access advanced tools without them being required journey steps:
- Three-statement analysis (Income, Balance Sheet, Cash Flow)
- DCF modeling
- Cap table / LBO modeling
- Advanced covenant analysis
- Free Cash Flow projections

**Rule:** Yulia should inform users these tools are available when relevant, but not force them into the journey workflow.

### 5.6 Quality of Earnings (QoE) - Universal Framework

QoE is available at ALL leagues, adapted by sophistication level:

| League | QoE Focus | Depth |
|--------|-----------|-------|
| **L1** | Add-back verification, owner salary normalization, one-time expense identification | Light |
| **L2** | Revenue quality check, customer concentration analysis, basic margin review | Light+ |
| **L3** | Full add-back schedule, working capital normalization, trend analysis, seasonality | Standard |
| **L4** | GAAP adjustments, management fee normalization, covenant compliance prep | Standard+ |
| **L5** | Third-party QoE integration, forensic verification, synergy assumptions | Deep |
| **L6** | Institutional QoE standards, regulatory compliance, antitrust sensitivity | Full |

**Yulia Orchestration Rules:**
1. Always offer QoE analysis regardless of league
2. Adapt depth and terminology to user's league level
3. For L1-L2: Use plain language ("Let's verify these add-backs make sense")
4. For L3-L4: Use business terminology ("Working capital normalization")
5. For L5-L6: Use institutional language ("Quality of Earnings diligence")

### 5.7 CapEx Analysis & Balance Sheet Impact

#### When CapEx Becomes Critical

| League | CapEx Relevance | Analysis Depth |
|--------|-----------------|----------------|
| **L1-L2** | Basic - Asset-light businesses typical | Simple: Is equipment old? Major purchases coming? |
| **L3** | Standard - Required for EBITDA deals | Maintenance vs Growth CapEx, impact on FCF |
| **L4** | Standard+ - Affects covenant compliance | CapEx-to-Depreciation ratio, deferred maintenance |
| **L5-L6** | Comprehensive - Core to valuation | Full CapEx schedule, FCF modeling, asset quality |

#### CapEx Impact on Deal Quality

```
DEAL QUALITY RATING:
- PREMIUM: Low Maintenance CapEx + High FCF Conversion (≥80%)
- STANDARD: Normal CapEx aligned with depreciation
- DISCOUNTED: High CapEx or deferred maintenance backlog
- DISTRESSED: Critical deferred CapEx creating hidden liabilities
```

#### Balance Sheet Quality Indicators

1. **CapEx-to-Depreciation Ratio**
   - `>1.0` = Investing for growth (positive)
   - `~1.0` = Maintaining assets (neutral)
   - `<1.0` = Potential underinvestment (red flag)

2. **PP&E Turnover** = Revenue / Fixed Assets
   - Higher = More efficient asset utilization

3. **Asset Age** = Accumulated Depreciation / Annual Depreciation
   - Higher = Older assets, potential replacement needed

4. **Deferred Maintenance Risk Indicators**
   - Equipment past useful life but still on books
   - Declining CapEx trend while revenue grows
   - Increasing repair/maintenance expenses

### 5.8 Free Cash Flow (FCF) by League

| League | FCF Calculation | Required in Journey? |
|--------|-----------------|---------------------|
| **L1-L2** | `SDE - Owner Draw - Basic CapEx` | No - Available on request |
| **L3-L4** | `EBITDA - Taxes - CapEx - ΔWorking Capital` | No - Available on request |
| **L5-L6** | `EBIT(1-t) + D&A - CapEx - ΔNWC` (Unlevered FCF) | **Yes - Required** |

#### FCF Quality Metrics

- **FCF Conversion Rate** = FCF / EBITDA (Target: ≥70% for premium valuation)
- **FCF Margin** = FCF / Revenue (Industry-dependent)
- **FCF Yield** = FCF / Enterprise Value (Comparable to industry peers)

---

## 6.0 DATA SOVEREIGNTY & SECURITY

### 6.1 The "Vault" Architecture

* **Type A: EVIDENCE (Immutable)**
  * Examples: Tax Returns, Bank Statements, Leases.
  * Rule: Read-Only / Watermarked. AI uses "Extraction Mode" only. Stored in encrypted Blob Storage.

* **Type B: AGREEMENTS (Collaborative)**
  * Examples: LOI, APA, CIM, Models.
  * Rule: Collaborative. Stored in Google Workspace (Docs/Sheets) with Version History.

### 6.2 Context Flushing (The "Chinese Wall")

* **Rule:** Buyer Data and Seller Data are strictly isolated.
* **Mechanism:** The AI Context Window is flushed (reset) after every user session. No data from "Deal A" can be used to inform "Deal B."

### 6.3 The "Safe Harbor" Geofence

* **Constraint:** The Engine is strictly geofenced.
* **Allowed:** US, UK, CA, AU, NZ, IE.
* **Action:** If Asset_Location or IP_Address is outside this zone, the AI terminates the workflow.

---

## 7.0 IMPLEMENTATION CONSTANTS

### 7.1 Multiple Guardrails by League

```typescript
const LEAGUE_MULTIPLE_RANGES = {
  L1: { metric: 'SDE', min: 2.0, max: 3.5 },
  L2: { metric: 'SDE', min: 3.0, max: 5.0 },
  L3: { metric: 'EBITDA', min: 4.0, max: 6.0 },
  L4: { metric: 'EBITDA', min: 6.0, max: 8.0 },
  L5: { metric: 'EBITDA', min: 8.0, max: 12.0 },
  L6: { metric: 'EBITDA', min: 10.0, max: null }, // DCF-based
};
```

### 7.2 Roll-Up Industries

```typescript
const ROLLUP_INDUSTRIES = ['veterinary', 'dental', 'hvac', 'msp', 'pest_control'];
const ROLLUP_REVENUE_THRESHOLD = 1_500_000; // $1.5M
```

### 7.3 Safe Harbor Jurisdictions

```typescript
const SAFE_HARBOR_COUNTRIES = ['US', 'UK', 'CA', 'AU', 'NZ', 'IE'];
```

### 7.4 GTM Feature Constants

```typescript
// Transaction Token Pricing
const TRANSACTION_TOKEN_FEE_PERCENT = 0.005; // 0.5%
const TRANSACTION_TOKEN_FEE_MINIMUM = 200000; // $2,000 in cents

// Day Pass Configuration
const DAY_PASS_DEFAULT_HOURS = 48;
const DAY_PASS_ACCESS_LEVELS = ['read', 'comment', 'full'] as const;

// Deal Velocity Event Types
const DEAL_VELOCITY_EVENTS = [
  'discovery',
  'first_view', 
  'saved',
  'nda_signed',
  'cim_requested',
  'meeting_scheduled',
  'loi_submitted',
  'loi_accepted',
  'due_diligence_started',
  'closing'
] as const;

// Network Participant Roles
const NETWORK_ROLES = [
  'buyer',
  'seller',
  'attorney',
  'cpa',
  'lender',
  'broker',
  'consultant',
  'other'
] as const;

// CIM Share Link Access Levels
const CIM_ACCESS_LEVELS = ['blind', 'teaser', 'full'] as const;

// Blind Profile Reveal Strategies
const REVEAL_STRATEGIES = ['signup', 'nda', 'both'] as const;

// Lender Risk Score Thresholds
const RISK_SCORE_THRESHOLDS = {
  LOW: { minDscr: 1.50, maxLtv: 70 },
  MEDIUM: { minDscr: 1.25, maxLtv: 80 },
  HIGH: { minDscr: 1.15, maxLtv: 90 },
  CRITICAL: { minDscr: 0, maxLtv: 100 }
};

// Ghost Notification Thresholds
const GHOST_NOTIFICATION_TRACKER_THRESHOLD = 3; // Send alert after 3 trackers
```

### 7.5 Database Tables (GTM Features)

```typescript
const GTM_TABLES = [
  'living_cims',           // Dynamic CIM documents
  'cim_scenarios',         // Sensitivity analysis scenarios
  'cim_share_links',       // Public/private share links
  'cim_access_logs',       // Access audit trail
  'ghost_notifications',   // Unclaimed business tracking
  'day_passes',            // Temporary advisor access
  'transaction_tokens',    // Success fee tracking
  'deal_velocity_events',  // Pipeline progression
  'escrow_transactions',   // Fund movements
  'earnout_schedules',     // Milestone payments
  'ground_truth_data',     // Verified financials
  'deal_network_participants' // Multi-party tracking
];
```

---

## 8.0 MESSAGING PHILOSOPHY ("Outcome Certainty")

### 8.1 Core Principle

**"Data is Commodity; Workflow is the Moat."**

The platform differentiates not by AI capabilities (commoditized) but by embedding deeply into multi-party M&A workflows.

### 8.2 Messaging Guidelines

| Instead of... | Say... |
|---------------|--------|
| "AI-powered valuation" | "Instant valuation" |
| "Our AI analyzes" | "We analyze" or "Get your answer" |
| "Machine learning" | "Data-driven" or remove |
| "AI-generated CIM" | "Professional CIM, instantly generated" |
| "AI matching" | "Smart matching" |
| "AI advisor" | "Expert advisor" or "Yulia" |

### 8.3 Value Proposition Hierarchy

1. **Speed**: "Get your deal valued in minutes, not weeks"
2. **Certainty**: "Know your number before you negotiate"
3. **Protection**: "Never leave money on the table"
4. **Simplicity**: "One platform, from discovery to closing"

### 8.4 Yulia's Voice

Yulia is presented as an expert advisor, not an AI chatbot:
- Uses confident, direct language
- Provides specific, actionable recommendations
- Adapts tone to user's league (Coach for L1, Partner for L5)
- Never says "As an AI..." or "I'm just a language model..."

---

## 9.0 TAX IMPLICATIONS ENGINE

**Purpose:** Yulia models the tax consequences of deal structure decisions for both buyer and seller. She presents the landscape and the math. She ALWAYS defers final tax advice to a CPA/tax attorney. The EULA states this explicitly. But the analytical groundwork — modeling scenarios, showing math, flagging risks — is Yulia's job.

**Framing rule:** Every tax analysis ends with: "Your CPA should confirm these numbers for your specific situation."

### 9.1 Deal Structure Tax Modeling (Asset Sale vs. Stock Sale)

This is the single highest-impact tax decision in any SMB deal. It's adversarial: what benefits the seller typically costs the buyer, and vice versa.

#### 9.1.1 Seller — Asset Sale Tax Treatment

In an asset sale, the purchase price is allocated across asset classes per IRC §1060. Each class has different tax treatment:

| Asset Class | Examples | Seller Tax Treatment | Rate (Federal) |
|-------------|----------|---------------------|----------------|
| Class I | Cash, bank deposits | No gain (1:1 value) | 0% |
| Class II | CDs, government securities | Ordinary income on gain | Up to 37% |
| Class III | Accounts receivable | Ordinary income | Up to 37% |
| Class IV | Inventory | Ordinary income | Up to 37% |
| Class V — Tangible | Equipment, vehicles, furniture | §1245 depreciation recapture (ordinary) + §1231 gain (capital) | Recapture: up to 37%; §1231: 20% |
| Class V — Intangible | Non-compete, customer lists | Ordinary income (non-compete); capital gains (customer lists, depending) | Varies |
| Class VI | §197 intangibles (not goodwill) | Capital gains (if held >1 year) | 20% |
| Class VII | Goodwill, going concern | Capital gains (long-term) | 20% |

**Depreciation recapture (§1245):** When equipment that has been depreciated is sold for more than its depreciated basis, the gain up to the original cost is "recaptured" as ordinary income. Only gain ABOVE original cost gets capital gains treatment.

**Net proceeds formula for sellers (asset sale):**
```
For each asset class:
  Allocated Amount - Tax Basis = Gain
  Gain × Applicable Tax Rate = Tax on that class
  
Total Tax = Sum of taxes across all classes + State tax
Net Proceeds = Purchase Price - Total Federal Tax - State Tax - Transaction Costs
```

**Worked example — Seller asset sale ($2M total price):**
```
Allocation:
  Inventory:        $100K → Ordinary income tax: $100K × 37% = $37,000
  Equipment:        $200K → Basis $50K, Recapture $150K × 37% = $55,500
  Customer list:    $150K → Capital gains: $150K × 20% = $30,000
  Non-compete:      $100K → Ordinary income: $100K × 37% = $37,000
  Goodwill:         $1.45M → Capital gains: $1.45M × 20% = $290,000
  
  Federal tax: $449,500
  Net Investment Income Tax (3.8% on >$200K): ~$68,400
  State tax (example CA 13.3%): ~$266,000
  Total tax: ~$783,900
  Net proceeds: $2,000,000 - $783,900 - $50,000 (transaction costs) = $1,166,100
```

#### 9.1.2 Seller — Stock Sale Tax Treatment

In a stock sale, the entire gain is treated as capital gain (assuming long-term hold of >1 year):

```
Sale Price - Seller's Basis in Stock = Capital Gain
Capital Gain × 20% (federal) + 3.8% (NIIT) + State Rate = Total Tax
```

**Same $2M example as stock sale (seller basis: $100K):**
```
Capital gain: $2,000,000 - $100,000 = $1,900,000
Federal tax: $1,900,000 × 23.8% (20% + 3.8% NIIT) = $452,200
State tax (CA): $1,900,000 × 13.3% = $252,700
Total tax: $704,900
Net proceeds: $2,000,000 - $704,900 - $50,000 = $1,245,100
```

**Difference: Seller keeps $79,000 more in a stock sale.** This gap widens significantly when more purchase price is allocated to ordinary income items (inventory, non-compete, receivables).

#### 9.1.3 Buyer — Asset Sale Benefits

- **Stepped-up basis** on all acquired assets
- **Goodwill amortization:** 15-year straight-line under §197. On $1.45M goodwill = $96,667/year tax deduction
- **Equipment depreciation restart:** Can take bonus depreciation (if available) or standard MACRS
- **Tax shield calculation:** Present value of future deductions at buyer's marginal rate

**Buyer NPV of asset sale tax shield ($2M deal, same allocation):**
```
Goodwill ($1.45M ÷ 15 years × 25% rate): $24,167/year for 15 years → NPV ≈ $245K
Equipment ($200K, 5-year MACRS, 25% rate): NPV ≈ $42K
Non-compete ($100K ÷ 15 years × 25%): $1,667/year → NPV ≈ $17K
Total buyer tax shield NPV: ~$304K
```

#### 9.1.4 Buyer — Stock Sale Disadvantages

- **No step-up.** Buyer inherits seller's existing basis in assets
- **No fresh depreciation or amortization** (except what was already being taken)
- **Inherited liabilities** — including unknown/contingent tax liabilities from prior periods
- **Loss of tax shield:** The ~$304K NPV from above is forfeited

#### 9.1.5 The Negotiation Dynamic

The tax gap creates a negotiation point. Asset sales typically benefit buyers by more than they cost sellers (due to NPV of multi-year deductions vs. one-time tax hit). Common resolutions:

1. **Price adjustment:** Buyer pays slightly more to compensate seller for higher tax burden
2. **Allocation negotiation:** Both parties agree on allocation that minimizes combined tax (maximize goodwill, minimize ordinary income items)
3. **§338(h)(10) election:** Treats a stock sale as an asset sale for tax purposes (see §9.2)
4. **Installment sale:** Seller defers tax via seller financing (see §9.3)

**Yulia's role:** Model both scenarios side-by-side. Show each party's net position. Quantify the gap. Let the parties negotiate from informed positions.

### 9.2 Entity-Type Tax Treatment Matrix

#### 9.2.1 C-Corporation — Double Taxation Trap

**This is the most critical entity-type flag. Yulia must identify C-Corp status during S0 intake and immediately alert the user.**

Asset sale of a C-Corp triggers TWO levels of tax:
1. **Corporate level:** Corporation pays tax on gain from asset sale (21% federal corporate rate)
2. **Shareholder level:** When remaining proceeds are distributed to shareholders, they pay capital gains tax on the distribution

```
$2M asset sale, C-Corp:
  Corporate tax: ~$399K (21% on $1.9M gain)
  Remaining: $1,601,000
  Shareholder distribution tax: $1,601,000 × 23.8% = ~$381K
  Total tax: ~$780K (effective rate: ~41%)
  
Compare to S-Corp asset sale (same deal):
  Pass-through tax: ~$452K (23.8% on $1.9M)
  Difference: C-Corp owner keeps ~$328K LESS
```

**Resolution options:**
- Stock sale (avoids corporate-level tax — only shareholder capital gains)
- §338(h)(10) election (technically stock sale, treated as asset sale for tax)
- Convert to S-Corp (requires 5-year waiting period for built-in gains tax to expire)
- QSBS exclusion if eligible (see §9.4)

#### 9.2.2 S-Corporation

- Pass-through: no entity-level tax (profits taxed once on K-1)
- **Built-in gains tax:** If converted from C-Corp, gains on assets held at conversion date are subject to corporate-level tax for 5 years post-conversion
- Shareholder basis = original investment + cumulative income - cumulative distributions
- §338(h)(10) available: both parties can agree to treat stock sale as asset sale for tax
- Officer compensation in year of sale: must be "reasonable" — IRS scrutinizes if owner takes low salary and high distributions

#### 9.2.3 LLC / Partnership

- **Single-member LLC:** Disregarded entity — taxed as sole proprietorship (Schedule C)
- **Multi-member LLC:** Default partnership taxation
- **§751 hot assets:** Partnership interests include "hot assets" (unrealized receivables, inventory) taxed as ordinary income even in what looks like a capital transaction
- **§754 election:** Buyer can request the partnership make a §754 election, which allows inside basis step-up on assets — effectively achieving asset-sale tax treatment within a stock/interest sale
- This is a powerful tool and Yulia should flag it when an LLC/partnership deal is identified

#### 9.2.4 Sole Proprietorship

- Only asset sales possible (no entity to sell "stock" of)
- All gain flows through Schedule C and personal return
- Self-employment tax (15.3%) applies to certain asset classes (non-compete income is subject to SE tax debate — flag for CPA)

#### 9.2.5 Entity-Type Decision Tree (for Yulia during intake)

```
Identify entity type →
  If C-Corp → IMMEDIATELY flag double taxation risk
    → Recommend exploring stock sale or §338(h)(10)
    → Check QSBS eligibility (§9.4)
    → If conversion to S-Corp is an option and timeline allows, flag it
    
  If S-Corp → Check if converted from C-Corp in last 5 years
    → If yes → flag built-in gains tax exposure
    → Model asset sale vs stock sale vs §338(h)(10)
    
  If LLC/Partnership → Flag §751 hot assets
    → Suggest §754 election discussion for interest sales
    → Multi-member: flag guaranteed payment vs distribution optimization
    
  If Sole Prop → Asset sale only, straightforward
    → Focus on allocation optimization
```

### 9.3 Installment Sale Modeling (IRC §453)

Seller financing (seller notes) triggers installment sale treatment, spreading gain recognition across the payment period.

#### 9.3.1 How It Works

When a seller receives payments over time (rather than all cash at close), each payment is split into three components:
1. **Return of basis:** Tax-free (seller getting their original investment back)
2. **Capital gain portion:** Taxed at capital gains rate
3. **Interest income:** Taxed as ordinary income

**Gross profit ratio:** `(Selling Price - Adjusted Basis) / Selling Price`

Each principal payment is taxed: `Payment × Gross Profit Ratio × Capital Gains Rate`

#### 9.3.2 Worked Example

```
Sale price: $2,000,000
Down payment: $500,000 (25%)
Seller note: $1,500,000 at 6% over 5 years
Seller's basis: $200,000

Gross profit ratio: ($2M - $200K) / $2M = 90%

Year 1 — Down payment:
  Taxable gain: $500,000 × 90% = $450,000
  Tax (23.8%): $107,100
  
Years 1-5 — Annual note payments (~$290K principal + interest):
  Principal portion taxable: $290K × 90% = $261,000/year
  Tax: $62,118/year
  Interest income (~$90K→declining): taxed as ordinary income
  
COMPARE to lump sum:
  All $1.8M gain recognized in Year 1
  Tax: $428,400 due April 15 of Year 2
  
Installment benefit: Spreads ~$428K tax bill over 5 years
  → Lower marginal rates each year (may stay below higher brackets)
  → Time value of money: deferred tax = interest-free loan from IRS
```

#### 9.3.3 Important Rules

- **Depreciation recapture is NOT eligible for installment treatment** — all §1245 recapture is recognized in Year 1 regardless of payment timing
- **Electing out:** Seller can elect to recognize all gain in Year 1 (useful if they expect higher rates in future years or have offsetting losses)
- **Related party sales:** Special rules restrict installment treatment if buyer is a related party who resells within 2 years
- **Imputed interest:** If the stated interest rate on the seller note is below the Applicable Federal Rate (AFR), the IRS imputes interest — reducing the principal portion and increasing ordinary income portion
- **Default risk:** If buyer defaults on the note, seller may have already paid tax on gain not yet received (can claim bad debt deduction)

#### 9.3.4 Yulia's Installment Sale Analysis

When a deal includes seller financing, Yulia should automatically:
1. Calculate the gross profit ratio
2. Model year-by-year tax obligations under installment vs. lump sum
3. Flag depreciation recapture (recognized in Year 1 regardless)
4. Note the AFR comparison for imputed interest risk
5. Present the NPV comparison: installment deferral benefit vs. risk of default
6. Recommend: "Discuss with your CPA whether installment treatment or electing out is better for your tax situation."

### 9.4 QSBS Eligibility Screening (IRC §1202)

Qualified Small Business Stock exclusion can eliminate up to $10M in federal capital gains tax. This is the single largest potential tax benefit for qualifying sellers.

#### 9.4.1 Qualification Requirements

ALL of the following must be true:
1. **C-Corporation** — must be a domestic C-Corp (not S-Corp, LLC, or partnership)
2. **Original issuance** — stock must have been acquired at original issuance (not purchased on secondary market)
3. **Active business** — corporation must use at least 80% of assets in an active qualified trade or business
4. **Gross assets test** — aggregate gross assets never exceeded $50M at the time of stock issuance and immediately after
5. **Holding period** — stock held for more than 5 years
6. **Excluded industries:** Professional services (health, law, engineering, accounting, consulting, financial services, brokerage, actuarial), banking/insurance/financing/leasing, farming, mining/oil/gas extraction, hospitality (hotels/motels/restaurants)

#### 9.4.2 Exclusion Amount

- **100% exclusion** for stock acquired after September 27, 2010 (verify current law — this has been extended multiple times)
- Maximum exclusion: Greater of $10M or 10× adjusted basis in the stock
- **Per-taxpayer, per-corporation:** Each shareholder gets their own $10M exclusion
- Married filing jointly: each spouse can claim $10M if they each hold qualifying stock

#### 9.4.3 State Conformity (CRITICAL — varies widely)

| State | Conforms to §1202? | Notes |
|-------|-------------------|-------|
| California | Partial (60% exclusion) | Does NOT provide full exclusion — significant state tax still applies |
| New York | No | Full state tax on QSBS gain |
| Texas | N/A | No state income tax |
| Florida | N/A | No state income tax |
| Pennsylvania | Yes | Full exclusion |
| Massachusetts | No | Full state tax |
| Illinois | No | Full state tax |

**Yulia must flag state conformity** when QSBS eligibility is identified. A seller in CA with $10M QSBS gain still owes ~$1.33M in state tax despite the federal exclusion.

#### 9.4.4 Yulia's QSBS Screening

During S0 intake, when entity type = C-Corp:
1. Ask: "How long have you held the stock?" (need >5 years)
2. Ask: "What was the total gross assets of the corporation when you received your stock?" (need <$50M)
3. Check industry against excluded list
4. If potentially eligible: "You may qualify for the QSBS exclusion under IRC §1202, which could exclude up to $10M in capital gains from federal tax. This is a significant potential benefit — I strongly recommend discussing this with your CPA before structuring the sale. The structure of the deal (stock sale required, not asset sale) matters for QSBS."

### 9.5 Purchase Price Allocation Framework (IRC §1060)

Both buyer and seller must file Form 8594 (Asset Acquisition Statement) with matching allocation. The allocation is negotiable and has direct tax consequences for both parties.

#### 9.5.1 Residual Method

Assets are allocated in order of class priority. Each class is filled up to fair market value before excess flows to the next class:

```
Class I:   Cash → typically at face value, no gain/loss
Class II:  Actively traded securities → at FMV
Class III: Accounts receivable → at face value (check for collectibility discount)
Class IV:  Inventory → at FMV (usually close to cost)
Class V:   All other tangible + intangible assets → at appraised FMV
Class VI:  §197 intangibles (except goodwill) → at appraised FMV
Class VII: Goodwill and going concern → RESIDUAL (whatever is left)
```

#### 9.5.2 Negotiation Dynamics

| Asset Category | Seller Preference | Buyer Preference | Why |
|---------------|-------------------|------------------|-----|
| Goodwill (VII) | MAXIMIZE | Moderate (15yr amort) | Seller: capital gains. Buyer: 15-year write-off is slow |
| Equipment (V) | Minimize | MAXIMIZE | Seller: depreciation recapture. Buyer: fast depreciation |
| Non-compete (VI) | MINIMIZE | MAXIMIZE | Seller: ordinary income. Buyer: 15-year amortizable |
| Inventory (IV) | Minimize | Prefer (cost basis) | Seller: ordinary income. Buyer: immediate COGS |
| Receivables (III) | Minimize | Minimize | Both: ordinary income treatment |

#### 9.5.3 Yulia's Allocation Tool

Given purchase price and identified assets, Yulia generates:
1. Default allocation using residual method and estimated FMVs
2. Side-by-side tax impact for seller and buyer under different scenarios
3. "Negotiation room" analysis: where allocation shifts benefit one party without proportionally hurting the other
4. Flag: "Both parties must agree on allocation and file consistent Form 8594s. Your attorneys should negotiate this as part of the APA."

### 9.6 State Tax Overlay

#### 9.6.1 Key State Rates

| State | Income Tax Rate | Capital Gains Treatment | Notes |
|-------|----------------|------------------------|-------|
| Texas | 0% | N/A | No income tax. Franchise tax exists but doesn't apply to sale proceeds. |
| Florida | 0% | N/A | No individual income tax. C-Corp has 5.5% corporate rate. |
| California | Up to 13.3% | Taxed as ordinary income | No preferential rate. Highest state tax. |
| New York | Up to 10.9% | Taxed as ordinary income | Plus NYC tax if applicable (up to 3.876%) |
| Illinois | 4.95% flat | Taxed as ordinary income | Flat rate regardless of amount |
| Pennsylvania | 3.07% flat | Taxed as ordinary income | Low flat rate |
| Washington | 0% (income) | 7% capital gains tax | New as of 2022 — applies to gains >$250K |
| Nevada | 0% | N/A | No income tax |
| Georgia | Up to 5.49% | Taxed as ordinary income | Rate declining under recent legislation |
| North Carolina | 4.5% flat | Taxed as ordinary income | Declining schedule toward 0% |

#### 9.6.2 Multi-State Apportionment

If the business operates in multiple states, sale proceeds may be apportioned across states based on the business's activity in each. Factors typically include: sales/revenue, payroll, and property in each state.

**Yulia flags multi-state issues when:** Business reports revenue or employees in more than one state during intake.

### 9.7 Pre-Sale Tax Optimization

Strategies sellers should implement BEFORE the sale. Yulia proactively surfaces these during S0-S1 when timeline allows (6+ months to sale).

| Strategy | When | Impact | Complexity |
|----------|------|--------|------------|
| Entity conversion (C→S-Corp) | 5+ years before sale | Eliminates double taxation | High — requires 5-year BIG waiting period |
| Maximize goodwill allocation (pre-negotiation) | During deal structuring | Shifts income from ordinary to capital | Medium — requires appraisal support |
| Installment sale structuring | During deal terms | Defers gain across payment period | Low — just structure the seller note correctly |
| Opportunity Zone reinvestment | Within 180 days post-close | Defers + reduces capital gains | High — must invest in qualified OZ fund |
| Charitable giving (CRT, DAF) | Before closing | Reduces taxable gain + generates deduction | High — requires estate planning attorney |
| Harvest losses | Year of sale | Offsets gains dollar-for-dollar | Low — sell losing investments in same tax year |
| Prepay deductible expenses | Year of sale | Increases basis, reduces gain | Low — accelerate planned expenses |
| QSBS planning (for C-Corps) | 5+ years before sale | Up to $10M exclusion | Medium — must maintain eligibility |

### 9.8 Earnout Tax Treatment

#### 9.8.1 Key Distinction: Purchase Price vs. Compensation

If earnout payments are tied to the seller's continued employment → IRS may recharacterize as compensation (ordinary income + payroll taxes). If tied purely to business performance metrics → treated as additional purchase price (capital gains eligible).

**Red flags for compensation recharacterization:**
- Earnout requires seller to remain employed
- Earnout is disproportionate to the purchase price
- Earnout metrics are primarily tied to seller's individual performance (not business performance)
- Seller is the only employee whose continued service triggers payment

**Safe harbor approach:** Separate the earnout from any employment/consulting agreement. Make earnout metrics based on business revenue/EBITDA, not individual performance.

#### 9.8.2 Installment Treatment for Earnouts

Contingent earnout payments can qualify for installment sale treatment, but the mechanics are complex:
- **Stated maximum:** If earnout has a cap, use cap as selling price for gross profit ratio
- **No stated maximum:** Must use alternative methods (may need to recognize gain as payments received)
- Each payment split into basis recovery + gain + imputed interest

#### 9.8.3 Escrow/Holdback Tax Treatment

Escrow funds held for indemnification are generally not taxed until released to seller. If escrow is used to satisfy indemnification claims, seller may be able to reduce their recognized gain.

### 9.9 SBA Financing Tax Implications

#### 9.9.1 Buyer's After-Tax Cost

Interest on SBA 7(a) acquisition loans is deductible (subject to §163(j) business interest limitation for larger businesses). This reduces the effective cost of acquisition.

```
Example: $1.5M SBA loan at 11% (Prime + 2.75%)
  Annual interest (Year 1): ~$165,000
  Tax deduction at 25% marginal rate: $41,250 annual tax savings
  Effective interest rate after tax: ~8.25%
```

#### 9.9.2 Goodwill Amortization Benefit

Buyer can amortize acquired goodwill over 15 years (§197). Combined with SBA interest deduction:

```
$1.45M goodwill / 15 years = $96,667/year deduction
Tax savings: $96,667 × 25% = $24,167/year for 15 years
NPV of goodwill tax shield: ~$245,000
```

**Yulia models the total after-tax cost of acquisition:** Purchase price - NPV of all tax shields (depreciation + amortization + interest deduction) = True economic cost to buyer.

---

## 10.0 LEGAL FRAMEWORKS ENGINE

**Purpose:** Yulia understands the legal framework of M&A transactions well enough to prepare users for what's coming, generate comprehensive term sheets, flag risks, and ensure productive conversations with attorneys. She NEVER drafts actual legal documents or provides specific legal advice.

**Framing rule:** Every legal analysis ends with: "Your M&A attorney will draft the actual documents. This prepares you for what to expect and what to negotiate."

### 10.1 Asset Purchase Agreement (APA) Framework

The APA is the central legal document in most SMB acquisitions (asset sales). Yulia must understand every component to: prepare users, generate term sheets, flag unusual terms, and explain sections in plain English.

#### 10.1.1 APA Sections Overview

| Section | What It Covers | Why It Matters |
|---------|---------------|----------------|
| **Purchased Assets** | Exactly what buyer is acquiring | Prevents post-closing disputes about what was "included" |
| **Excluded Assets** | What seller keeps | Protects seller's personal property and non-business assets |
| **Assumed Liabilities** | What debts/obligations buyer takes on | Defines buyer's risk exposure from pre-closing obligations |
| **Excluded Liabilities** | What seller retains responsibility for | Protects buyer from unknown pre-closing claims |
| **Purchase Price** | Total consideration + structure + allocation | The economics of the deal — tied directly to tax treatment (§9.5) |
| **Reps & Warranties** | Seller's statements about the business | Primary risk allocation mechanism — see §10.2 |
| **Pre-Closing Covenants** | How seller must operate until close | Prevents seller from degrading the business between signing and closing |
| **Closing Conditions** | What must happen before close occurs | Gives buyer (and seller) exit ramps if conditions aren't met |
| **Post-Closing Covenants** | Non-compete, transition, consulting | Protects buyer's investment after ownership transfers |
| **Indemnification** | How losses from breached reps are recovered | The enforcement mechanism for reps & warranties — see §10.3 |

#### 10.1.2 League-Specific Complexity

| Component | L1 ($300K-$1M) | L2-L3 ($1M-$10M) | L4-L5 ($10M+) |
|-----------|----------------|-------------------|----------------|
| Total pages | 15-30 | 30-60 | 60-150+ |
| Reps & warranties | 8-12 standard | 15-25 detailed | 25-40+ with schedules |
| Indemnification | Simple basket + cap | Basket, cap, escrow | Complex with R&W insurance |
| Working capital | Fixed or none | Peg with true-up | Locked box or completion accounts |
| Schedules/exhibits | 3-5 | 8-15 | 15-30+ |
| Closing conditions | 3-5 standard | 8-12 | 12-20+ with regulatory |

#### 10.1.3 Yulia's Term Sheet Generator

When a deal reaches LOI stage, Yulia generates a comprehensive term sheet covering every APA section with recommended terms based on league, industry, and deal structure. This term sheet is what the user brings to their attorney, who converts it into the actual APA.

### 10.2 Representations and Warranties

Reps and warranties are the seller's factual statements about the business. They're the primary mechanism for risk allocation. If a rep turns out false, the buyer has indemnification rights.

#### 10.2.1 Standard Rep Categories

| Category | What Seller Represents | Why Buyer Cares | Typical Negotiation |
|----------|----------------------|-----------------|---------------------|
| **Organization & Authority** | Seller has legal authority to sell | If seller can't legally sell, deal is void | Rarely contested — fundamental rep |
| **Financial Statements** | Provided financials are accurate and complete | Buyer relied on these for valuation | Seller wants "materially accurate"; buyer wants "accurate in all respects" |
| **No Undisclosed Liabilities** | No hidden debts or obligations | Protects against surprises post-close | Most contested rep — seller uses disclosure schedules |
| **Absence of Changes** | No material adverse changes since financials | Business hasn't degraded between signing/close | Definition of "material" is heavily negotiated |
| **Tax Matters** | All taxes filed and paid, no pending audits | Buyer doesn't want inherited tax problems | Long survival period (statute of limitations) |
| **Tangible Property** | Equipment/assets in good working condition | Buyer needs assets that work | "Ordinary wear and tear" qualifier standard |
| **IP Ownership** | Seller owns all IP used in business | Avoids infringement claims against buyer | Critical for tech/brand-dependent businesses |
| **Contracts** | All material contracts disclosed, assignable | Buyer needs these to continue operations | Key contracts often have assignment restrictions |
| **Employees** | Employee info accurate, no pending claims | Protects against employment lawsuits | Immigration/classification issues flagged here |
| **Environmental** | Compliance with environmental laws | Contamination liability is unlimited | Critical for manufacturing, auto, fuel, food |
| **Litigation** | No pending or threatened lawsuits | Litigation = risk | Seller uses "to seller's knowledge" qualifier |
| **Permits & Licenses** | All required permits current and transferable | Business can't operate without them | Industry-dependent — see §10.6 |
| **Customer & Supplier Relationships** | No known loss of key relationships | Revenue concentration risk | Buyer wants disclosure of top 10 customers |

#### 10.2.2 Knowledge Qualifiers

Sellers negotiate to limit reps using knowledge qualifiers:
- **"To Seller's knowledge"** — only what seller actually knows (narrow)
- **"To Seller's knowledge after reasonable inquiry"** — what seller knows + should have known with reasonable effort (broader)
- **Constructive knowledge** — what a reasonable person in seller's position would know (broadest)

**Yulia flags:** When reviewing LOI/APA terms, Yulia identifies which reps have knowledge qualifiers and explains the practical difference to the user.

#### 10.2.3 Industry-Specific Reps

| Industry | Additional Reps Needed | Why |
|----------|----------------------|-----|
| Healthcare | HIPAA compliance, medical licenses, payer contracts, Stark/Anti-Kickback | Regulatory exposure is massive |
| Food service | Health permits, liquor license, food safety certifications | Can't operate without them |
| Construction | Contractor licensing, bonding, warranty obligations, safety record | Licensing is often personal (not transferable) |
| Tech/SaaS | IP ownership, data privacy, open source compliance, customer data | IP is the primary asset |
| Childcare | State licensing, background checks, staff/child ratios | Heavily regulated, license tied to operator |
| Auto repair | Environmental (oil, solvents), warranty obligations, manufacturer relations | Contamination liability |
| Manufacturing | Environmental, product liability, supply chain contracts, OSHA | Multiple regulatory dimensions |

### 10.3 Indemnification and Escrow Structures

#### 10.3.1 Indemnification Components

| Component | What It Is | Typical L1-L3 Range | Typical L4-L5 Range |
|-----------|-----------|---------------------|---------------------|
| **Basket (deductible)** | Losses must exceed this before claims | 0.5%-1.5% of purchase price | 0.5%-1.0% |
| **Cap** | Maximum total indemnification | 10%-25% of purchase price (general) | 10%-20% (general); 100% (fundamental) |
| **Escrow holdback** | Cash held in escrow for claims | 5%-15% of purchase price | 10%-15% |
| **Escrow duration** | How long escrow is held | 12-18 months | 12-24 months |
| **Survival periods** | How long reps survive post-close | 12-24 months (general) | 18-24 months (general); 3-6 years (tax) |

**Basket types:**
- **Tipping basket:** Once exceeded, buyer recovers from $0 (seller-unfavorable)
- **True deductible:** Buyer absorbs basket amount, recovers only excess (seller-favorable)

**Cap exceptions** (typically uncapped or capped at 100%):
- Fraud: always uncapped
- Fundamental reps (authority, ownership, taxes): higher or no cap
- Environmental: often separate, higher cap

#### 10.3.2 Rep & Warranty Insurance (RWI)

Available for deals typically $3M+ (increasingly down-market). Buyer purchases insurance policy that covers rep & warranty breaches.

- **Cost:** 2-4% of policy limits (single premium at closing)
- **Effect:** Seller accepts lower escrow; buyer gets more protection; deal closes smoother
- **Retention (deductible):** Typically 1% of enterprise value
- **Exclusions:** Known issues, environmental, forward-looking projections

**Yulia flags RWI as an option when:** Deal size >$3M AND negotiation is stuck on indemnification terms.

#### 10.3.3 Yulia's Escrow Impact Model

For any deal with escrow, Yulia calculates:
```
Purchase Price: $X
Less: Escrow Holdback (Y%): -$Z
= Cash at Close: $X - $Z

If no claims during escrow period:
  Escrow released: +$Z (12-18 months later)
  Total received: $X (but time value lost)

If claims filed:
  Escrow reduced by claim amount
  Potential total received: $X - claims
```

This flows directly into the Funds Flow Statement (closing deliverable).

### 10.4 Non-Compete and Non-Solicitation by State

#### 10.4.1 Enforceability Matrix (Top M&A States)

| State | Non-Compete Enforceable? | Key Rules | Non-Solicitation? |
|-------|-------------------------|-----------|-------------------|
| **California** | Generally NO | Narrow exceptions only (sale of business is one — but still scrutinized) | Yes (limited) |
| **Texas** | Yes with limits | Must be ancillary to enforceable agreement, reasonable scope/time/geography | Yes |
| **Florida** | Yes (strong) | Presumes valid if reasonable; 6-month to 2-year typical | Yes |
| **New York** | Yes with limits | Must protect legitimate business interest; courts blue-pencil | Yes |
| **Illinois** | Conditional | Requires adequate consideration; 2-year employment minimum (for employees) | Yes |
| **Georgia** | Yes | Revised statute (2011) strengthened enforcement | Yes |
| **Pennsylvania** | Yes | Must be reasonable in scope; courts may modify | Yes |
| **Ohio** | Yes | Reasonableness test; courts can blue-pencil | Yes |
| **Washington** | Restricted | $100K+ compensation threshold; cannot exceed 18 months | Yes |
| **Colorado** | Restricted | Generally void unless for sale of business or protecting trade secrets | Yes |

**Critical note on sale-of-business exception:** Even in states that generally restrict non-competes (CA, CO, WA), there is typically an exception for the sale of a business or its goodwill. The seller of a business can agree to a non-compete as part of the sale. However, the scope must still be reasonable.

#### 10.4.2 Standard Terms by League

| Term | L1 | L2-L3 | L4-L5 |
|------|-----|-------|-------|
| Duration | 2-3 years | 3-5 years | 5+ years (negotiated) |
| Geographic scope | 25-50 mile radius or county | State or region | National or industry-wide |
| Activity scope | Same industry, same services | Broader competitive definition | Carefully defined competitive activities |
| Non-solicitation | Employees + customers, 2-3 years | 3-5 years | 5+ years |

#### 10.4.3 Tax Interaction

Payments allocated to non-compete agreements are ordinary income to seller and §197 amortizable (15 years) by buyer. See §9.5 for allocation negotiation dynamics.

### 10.5 Lease Assignment and Real Property

#### 10.5.1 The Hidden Deal-Killer

If the business depends on a specific location, failure to secure lease assignment can kill the deal. Yulia flags this during intake whenever a physical location is identified.

**Key lease DD items:**
- Is the lease assignable? (Most require landlord consent)
- How much term remains? (Buyer wants 5+ years or renewal options)
- What's the current rent vs. market rate?
- Are there personal guarantees? (Do they transfer?)
- CAM charges and escalation clauses?
- Exclusivity clauses (retail)?
- Demolition/relocation provisions?
- Environmental responsibility clauses?

#### 10.5.2 Common Landlord Demands

When notified of assignment, landlords typically want:
1. Increased rent (to market rate)
2. Personal guarantee from buyer
3. Increased security deposit
4. Lease extension
5. Approval of buyer's financials

**Timing:** Approach landlord AFTER LOI signing, BEFORE APA execution. This gives both parties a realistic picture before committing to the deal.

#### 10.5.3 Sale-Leaseback Structures

When seller owns both the business AND the real estate:
- Option 1: Sell both together (higher total price, more complex)
- Option 2: Sell business, retain RE, lease to buyer (seller becomes landlord — ongoing income)
- Option 3: Sell business + RE to different buyers

Sale-leaseback benefits seller (ongoing income stream, RE appreciation) and simplifies buyer's financing (doesn't need to finance RE). Fair market rent must be established.

### 10.6 Regulatory and Licensing Transfers

#### 10.6.1 High-Regulatory Industries

| Industry | Key Licenses | Transferable? | Typical Timeline |
|----------|-------------|---------------|-----------------|
| Healthcare (medical/dental) | State medical licenses, DEA, Medicare/Medicaid enrollment | New application required | 3-6 months |
| Childcare | State operating license, fire marshal, health dept | New application (often) | 2-4 months |
| Construction | Contractor license (often personal) | New application by buyer | 1-3 months |
| Food service | Health permit, liquor license | Health: reapply. Liquor: varies by state | Health: 2-4 weeks. Liquor: 1-6 months |
| Insurance agency | Carrier appointments | Re-appointment required | 1-3 months per carrier |
| Pest control | Pesticide applicator license | New license for buyer's operator | 1-3 months |
| Transportation | DOT authority, MC number | Transfer possible with FMCSA | 2-4 weeks |
| Franchise | Franchisor approval | Consent required | 2-6 months |

#### 10.6.2 Franchise Transfer Specifics

Franchise agreements almost always include:
- **Transfer fee:** $5K-$50K (check FDD for exact amount)
- **Franchisor right of first refusal** (can buy the business themselves)
- **Buyer qualification:** must meet training, net worth, experience requirements
- **Franchise term:** may not transfer full remaining term
- **Franchisor can block the sale** if buyer doesn't meet criteria

**Yulia flags franchise status during S0 intake.** If franchise: "This is a franchise transfer, which means the franchisor must approve the buyer. This adds 2-6 months and the franchisor can impose conditions. Let's factor this into the timeline."

#### 10.6.3 Interim Operating Arrangements

When licenses can't transfer immediately, common solutions:
- Seller operates under their license during transition (management agreement)
- Buyer applies for new license while deal is pending
- Closing contingent on license issuance
- Partial closing (business assets transfer, operations continue under seller's license)

### 10.7 Employment Law in M&A

#### 10.7.1 Asset Sale vs. Stock Sale — Employee Impact

| Factor | Asset Sale | Stock Sale |
|--------|-----------|------------|
| Employee status | Terminated by seller, rehired by buyer | Automatically transferred |
| Selectivity | Buyer can choose which employees to hire | All employees come with entity |
| Prior liabilities | Stay with seller | Transfer to buyer |
| Benefits continuity | COBRA from seller; new benefits from buyer | Benefits continue uninterrupted |
| PTO/vacation | Typically seller's liability | Transfers with entity |
| Employment agreements | Must be renegotiated | Continue as-is |
| Non-competes (employee) | May not survive (check state law) | Continue as-is |
| Workers' comp modifier | Fresh start for buyer | History transfers |

#### 10.7.2 WARN Act

If the business has 100+ employees and the asset sale results in "mass layoffs" (even temporary termination-and-rehire), the Worker Adjustment and Retraining Notification Act may require 60 days' notice. Yulia flags this when employee count exceeds 100.

#### 10.7.3 Key Employee Retention

Critical for deal value preservation. Strategies:
- **Stay bonus:** Cash payment contingent on remaining through transition (typically 3-12 months post-close)
- **New employment agreement:** Salary increase, title promotion, equity participation
- **Earnout participation:** Key employees share in earnout payments tied to performance
- **Timing of disclosure:** Telling key employees too early creates flight risk; too late creates trust issues. Typical: after LOI but before DD.

### 10.8 Intellectual Property Assessment

#### 10.8.1 IP Categories in SMB Deals

| IP Type | Common in | Transfer Mechanism | Risk Level |
|---------|-----------|-------------------|------------|
| Trade name / DBA | All businesses | Assignment (file with state) | Low |
| Trademarks | Brand-dependent | USPTO assignment | Medium |
| Domain names | All businesses | Registrar transfer | Low |
| Customer lists | Service businesses | Included in asset purchase | Medium |
| Proprietary processes | Manufacturing, tech | Trade secret protection | High |
| Software (custom) | Tech, SaaS | Assignment (check contractor agreements) | High |
| Social media accounts | Consumer businesses | Platform ToS may restrict | Medium |
| Phone numbers | Service businesses (contractors, medical) | Carrier transfer | Low (but valuable) |

#### 10.8.2 Common IP Pitfalls

- **Contractor-developed software without IP assignment:** If the business hired contractors to build software/websites without a proper work-for-hire or IP assignment agreement, the contractor may own the IP
- **Open source components:** Software may include open source under GPL or similar licenses that impose obligations on the buyer
- **Customer data:** Privacy laws (CCPA, state privacy laws) may restrict what customer data can be "sold" — vs. transferred as part of a going concern
- **Trade secrets without protection:** If proprietary processes aren't documented with NDA/trade-secret protections, they may not be protectable

### 10.9 Working Capital Mechanisms

#### 10.9.1 Three Common Approaches

**1. Fixed price (no adjustment):** Most common in L1 deals. Simple but risky — seller could strip cash/inventory between signing and closing. Mitigated by pre-closing covenants requiring ordinary-course operations.

**2. Working capital peg with true-up:** Standard for L2-L4. Steps:
```
1. Calculate "target" working capital (usually trailing 12-month average)
2. At closing: estimate current working capital
3. Close based on estimate
4. Within 60-90 days post-close: measure actual working capital
5. If actual > target → buyer pays difference to seller
6. If actual < target → seller pays difference to buyer (or deducted from escrow)
```

**3. Locked box:** Increasingly common in L4-L5. Working capital "locked" at a specific date. Purchase price set based on that date's balance sheet. Seller gives "no leakage" covenant — no unusual distributions or payments between lock date and closing.

#### 10.9.2 Yulia's Working Capital Analysis

During S1/B1 financial review, Yulia:
1. Calculates trailing 12-month average working capital
2. Identifies seasonal patterns that affect the peg
3. Flags unusual items (receivables from related parties, aged inventory)
4. Recommends mechanism based on league
5. Models the range of true-up outcomes

### 10.10 LOI-to-APA Negotiation Guide

#### 10.10.1 Timeline

```
LOI Signed (Day 0)
  ↓ Attorney engagement (Days 1-7)
  ↓ Due diligence (Days 7-60, varies by league)
  ↓ First APA draft from buyer's attorney (Days 30-45)
  ↓ Seller attorney review + comments (Days 45-55)
  ↓ Negotiation rounds, 2-5 rounds typical (Days 55-75)
  ↓ Final APA execution (Days 75-90)
  ↓ Pre-closing conditions satisfied (Days 90-100)
  ↓ Closing (Day 100+)
```

L1 deals: Compress to 30-60 days total
L4-L5 deals: Expand to 90-180 days total

#### 10.10.2 Top 10 Negotiation Points (by frequency)

1. **Rep & warranty scope and language** — most time spent here
2. **Indemnification basket, cap, and escrow** — most dollar impact
3. **Non-compete terms** — emotional for sellers
4. **Working capital mechanism and target** — technical and often contentious
5. **Earnout definitions and measurement** — if applicable
6. **Transition obligations** — how long seller stays, at what cost
7. **Closing conditions** — what can kill the deal
8. **Employee matters** — who gets hired, at what terms
9. **Lease assignment** — landlord consent as closing condition
10. **Purchase price allocation** — tax impact for both sides (§9.5)

#### 10.10.3 Yulia's Negotiation Coaching

**For sellers:**
- Don't negotiate against yourself — let buyer draft first
- Focus energy on the 3-4 items that actually affect your net proceeds
- Reps & warranty survival periods directly impact your risk exposure — fight for shorter
- Escrow amount directly reduces your cash at closing — negotiate down

**For buyers:**
- Control the pen (your attorney should draft the APA)
- Broader reps with longer survival = more protection
- Higher escrow = more leverage for post-closing claims
- Working capital peg is where hidden value lives — scrutinize methodology

### 10.11 Bulk Sales Compliance

Most states have repealed Article 6 of the UCC (bulk sales laws). However, some states retain requirements.

**States with bulk sales laws still in effect (verify current status):**
- California (limited applicability)
- Maryland
- New Jersey (for certain transactions)
- A few others — Yulia should flag "Check with your attorney whether bulk sales notice is required in [state]" for any state where status is uncertain

**When applicable:**
- Notice must be sent to seller's creditors before closing
- Waiting period (typically 10-45 days)
- Failure to comply: creditors can potentially void the sale

**Yulia's approach:** When state is identified, flag bulk sales as a checklist item: "Your attorney should confirm whether bulk sales notice is required in [state]. If so, it needs to be sent [X] days before closing."

---

## 11.0 INTERACTIVE CANVAS SYSTEM (Added v17.1)

### 11.1 Tabbed Canvas Architecture

The canvas follows the Dia Browser model — as many tabs as needed. Each tab is an independent rendering surface. Yulia can read from and write to any tab from the conversation.

**Tab types:**
- **Model tabs** — live interactive (Valuation Explorer, LBO, DCF, SBA Financing, Sensitivity, Cap Table, Earnout)
- **Document tabs** — view/annotate (CIM, valuation report, DD checklist)
- **Comparison tabs** — derived from two or more model tabs
- **Data tabs** — sourcing results, market intelligence, pipeline view

**Two input channels, one state:** Every model tab has a state object. Both UI controls (sliders, inputs) and Yulia's tools modify the same state. Calculations are deterministic (pure JavaScript math, not AI-generated). This makes updates instant (<16ms) and auditable.

### 11.2 Interactive Model Types

| Model | When Used | Key Inputs | Key Outputs |
|-------|-----------|------------|-------------|
| Valuation Explorer | S2, B2 | Revenue, add-backs, multiples, methodology weights | Valuation range, SDE waterfall, multiple context |
| LBO / Acquisition | B2-B4, L4+ | Purchase price, EBITDA, growth, exit multiple, debt structure | IRR, MOIC, DSCR, pro forma P&L, sensitivity |
| SBA Financing | L1-L3 buyer | Purchase price, down payment, rate, term, SDE | Go/No-Go (DSCR), monthly payment, amortization |
| Deal Comparison | Buyer with 2+ targets | Reads from other model tabs | Side-by-side metrics, radar chart, ranking |
| Sensitivity Matrix | Any model | Two variables to vary | Output metric at each intersection, color-coded |
| Cap Table / Dilution | Raise journey | Pre-money, raise amount, option pool, preferences | Ownership pie, dilution waterfall, payout scenarios |
| Earnout Scenario | Deal structuring | Targets, amounts, probabilities, discount rate | Expected value, scenario fan, effective price |
| Tax Impact | Closing | Entity type, sale type, allocation | Net proceeds, federal/state tax, comparison |
| Working Capital | DD | 12-month data, seasonal patterns | Peg, true-up scenarios, trend chart |
| Covenant Compliance | L3+ financing | DSCR req, Debt/EBITDA limit, projections | Headroom dashboard, warning flags |

### 11.3 Yulia's Canvas Tools

- `update_model` — modify assumptions in any tab (Yulia or user, same state)
- `create_model_tab` — open a new interactive model
- `render_to_tab` — push generated content to a tab
- `read_tab_state` — read current assumptions and outputs from any tab

### 11.4 Cross-Tab Interactions

Linked tabs auto-update when source data changes. Comparison tabs read from multiple model tabs. Yulia's system prompt includes a summary of all active tab states, enabling natural references: "Looking at your Tab 2 model, if you apply the same growth assumptions from Tab 1..."

---

## 12.0 SOURCING ENGINE (Added v17.1)

### 12.1 Five-Stage Pipeline

| Stage | What Happens | Cost | Time |
|-------|-------------|------|------|
| 1. Deep Research | Sonnet analyzes Census CBP + BDS + SBA + FRED data → Acquisition Intelligence Brief | $0.15-0.30 | 30-60s |
| 2. Expansion Search | Google Places Text Search (IDs Only = free) → 500-2K candidates | $0 | 5-15s |
| 3. Tiered Enrichment | Essentials → Pro → Haiku website → Sonnet deep analysis (progressive) | $0.50-2.00 | 2-5 min |
| 4. Scoring | 6-dimension scoring (size, geography, industry, acquisition signals, quality, risk) + AI batch summaries | $0.20-0.80 | 1-3 min |
| 5. Portfolio Management | Persistent PostgreSQL, hierarchical canvas display, background refresh | $0 | Ongoing |

### 12.2 Scoring Dimensions (100 points total)

- Size Match (0-20): review count proxy, team size, estimated revenue vs thesis
- Geography Match (0-15): exact state, adjacent, same region
- Industry Match (0-15): place types → NAICS, services keyword match
- Acquisition Signals (0-20): SBA history, firm age, succession signals
- Quality Indicators (0-15): rating, reviews, website, recurring revenue, certifications
- Risk Factors (0-15, inverted): low rating, no website, owner dependency

### 12.3 Tier Classification

- A (75+): Strong match — present first
- B (55-74): Good match — worth reviewing
- C (35-54): Possible match — lower priority
- D (<35): Weak match — archive

### 12.4 Background Refresh

- Weekly: re-fetch Google Pro data for A/B candidates, re-score, flag closed businesses
- Monthly: re-run expansion search, process new candidates through enrichment + scoring

---

## 13.0 PREMIUM DOCUMENT EXPORTS (Added v17.1)

### 13.1 HTML→PDF Pipeline

Premium PDFs use Puppeteer (headless Chromium) to render HTML templates with:
- Google Fonts (Sora headings, Inter body)
- Chart.js charts rendered server-side as PNGs, embedded as base64
- Full CSS control (gradients, rounded corners, multi-column, print @page rules)
- Brand system: terra #BA3C60, cream #FAF8F4, text #1A1A18

### 13.2 Chart Types Available

1. Valuation Range Bar (horizontal, terra accent on mid)
2. Multiple Comparison (bullet chart, position in league range)
3. Deal Score Radar (7-factor spider chart)
4. Earnings Breakdown (revenue → SDE/EBITDA waterfall)
5. DSCR Gauge (with threshold markers)
6. FCF Waterfall (EBITDA → taxes → CapEx → ΔNWC → FCF)
7. Tax Comparison (asset vs stock sale side-by-side)
8. Sensitivity Heatmap (2-variable color-coded matrix)
9. Cap Table Waterfall (distribution by class at exit)
10. Covenant Headroom Dashboard
11. Working Capital Trend (12-month with peg line)
12. Deal Velocity Pipeline (stage duration bars)

### 13.3 Export Formats

- **PDF**: Premium HTML→PDF for supported types, legacy pdfkit for others
- **DOCX**: Branded with headers/footers, financial tables (docx library)
- **XLSX**: Formulas for calculations, tabular-nums formatting (exceljs)
- **Interactive model exports**: PDF captures snapshot of current state; XLSX exports with real formulas

---

## 14.0 LIVING CIM (Added v17.1)

### 14.1 What It Is

A CIM that stays connected to the deal's financial data. When financials change, Yulia detects staleness and offers to regenerate affected sections. Version tracking with publish states.

### 14.2 Access Tiers

- **Blind Profile**: Anonymized (state, industry, revenue range only)
- **Teaser**: Executive summary, financial highlights (requires account)
- **Full Access**: Complete CIM with all financials (requires NDA)

### 14.3 Sensitivity Toggles

Within the living CIM, users can toggle assumptions (growth rate, add-backs, methodology) and see how the CIM's valuation section updates in real-time. This uses the same deterministic calculation engine as the interactive canvas models.

---

## 15.0 SUBSCRIPTION MODEL (Added v17.1)

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | Unlimited Yulia chat + ONE deliverable (email required) |
| Starter | $49/mo | ValueLens, deal scoring, VRR, SDE/EBITDA analysis, exports |
| Professional | $149/mo | CIM, deal room, matching, sourcing, DD/LOI, living docs |
| Enterprise | $999/mo | Unlimited users, white-label, API, portfolio dashboard |

- No per-deal fees. No success fees. No wallet. Cancel anytime.
- 30-day free trial of Professional.
- Brokers use the same tiers (no separate advisor pricing).
- TEST_MODE=true → enterprise access for all users.
