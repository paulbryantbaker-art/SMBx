# STRATA OPERATING SYSTEM: MASTER METHODOLOGY (v17.0)

**Scope:** AI Governance, Workflow Logic, Calculation Engine, Tool Orchestration, GTM Features.
**Core Mandate:** "Data is Commodity; Workflow is the Moat."
**Security Level:** CRITICAL (Financial Data Governance)
**Updated:** January 2026 - GTM Feature Release

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
