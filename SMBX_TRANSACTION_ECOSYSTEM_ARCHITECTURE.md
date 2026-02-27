# SMBX.ai Transaction Ecosystem & Referral Revenue Architecture
## From Advisory Platform to Deal Completion Engine

---

## The Strategic Vision

SMBX starts as an AI advisory tool. But the real business is becoming the **operating system for SMB transactions** — the platform where every participant in a deal (buyer, seller, attorney, CPA, lender, appraiser, broker, insurer) connects, transacts, and pays.

Every deal needs the same 5-8 service providers. Today, finding them is chaos: Google searches, asking friends, cold-calling firms that may or may not do M&A work. SMBX can be the place where Yulia says: "You need an M&A attorney in Denver who's closed SBA-financed acquisitions. Here are three who've done it this quarter — want me to introduce you?"

That's not just helpful. That's a referral fee on every connection.

**Four revenue-generating ecosystems:**

```
┌─────────────────────────────────────────────────────────────┐
│              SMBX TRANSACTION ECOSYSTEM                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  DEAL        │  │  FRANCHISE   │  │  BUYER/INVESTOR  │  │
│  │  SERVICES    │  │  MATCHING    │  │  SOURCING        │  │
│  │  MARKETPLACE │  │  ENGINE      │  │  (for Sellers)   │  │
│  │              │  │              │  │                   │  │
│  │ Attorneys    │  │ FDD database │  │ Buy thesis match  │  │
│  │ CPAs         │  │ Brand match  │  │ PE/VC detection   │  │
│  │ Lenders      │  │ Unit econ    │  │ SBA buyer pool    │  │
│  │ Appraisers   │  │ Territory    │  │ Proactive alerts  │  │
│  │ RE agents    │  │ Financing    │  │ Search fund DB    │  │
│  │ Insurance    │  │              │  │                   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           CAPITAL ACCESS (Already Planned)            │   │
│  │  Lendio • Guidant • SBA lenders • Seller financing   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Yulia orchestrates referrals contextually in conversation  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Deal Services Marketplace

### The Problem

Every M&A transaction — even a $500K laundromat purchase — needs professional help:

| Service | When Needed | Typical Cost | How People Find Them Now |
|---------|-------------|-------------|------------------------|
| M&A Attorney | LOI through close | $5K-$25K | Google, ask broker, referral |
| CPA/Accountant | Due diligence, QoE, tax planning | $3K-$15K | Google, ask attorney |
| Business Appraiser | Valuation (SBA required) | $3K-$10K | SBA lender suggests one |
| Commercial RE Agent | If deal includes real estate | 3-6% of RE value | Google, ask broker |
| Insurance Broker | Reps & warranties, transition | $2K-$20K+ | Google, cold call |
| Environmental Consultant | Manufacturing, fuel, food | $5K-$50K | Attorney refers |
| IT Due Diligence | Tech/SaaS businesses | $5K-$25K | Ask around |
| Wealth Advisor | Post-sale for sellers | % of assets | Bank, CPA referral |

**Total addressable spend per deal: $20K-$150K+ in professional services.**

No platform owns this referral layer for SMB M&A. The big M&A platforms (Axial, DealStream) don't connect service providers. The legal marketplaces (Avvo, LegalMatch) don't understand deal context. SMBX sits at the exact intersection.

### Data Sources — Where the Directory Comes From

**Attorneys (M&A / Business Law):**

| Source | Coverage | Data Fields | Access | Cost |
|--------|----------|------------|--------|------|
| State Bar Associations (44 states online) | All licensed attorneys per state | Name, status, practice area, discipline history | Public web, scrapable | Free |
| ABA Bar Directory aggregator | Links to all 50 state bars | Referral to state-level search | Public web | Free |
| Martindale-Hubbell | 1M+ attorneys with peer ratings | Name, firm, practice areas, peer rating, location | martindal.com, limited API | Free (basic) |
| Avvo | Millions of profiles with client reviews | Name, rating, practice area, reviews, fee info | avvo.com | Free |
| State bar CLE records | Attorneys who took M&A/business CLE | Practice focus signal | Varies by state | Mostly free |

**Key signal for M&A relevance:** An attorney who lists "mergers and acquisitions," "business transactions," or "SBA lending" as a practice area AND is in good standing AND has peer reviews or ratings. AI can parse Avvo reviews for M&A-specific mentions.

**CPAs / Accountants:**

| Source | Coverage | Data Fields | Access | Cost |
|--------|----------|------------|--------|------|
| AICPA Directory | 431K+ CPAs, 597K+ members globally | Name, location, specialty credentials | aicpa-cima.com | Free |
| State CPA Society directories | State-licensed CPAs | Name, firm, services, industries | 50 state society websites | Free |
| State Board of Accountancy | All licensed CPAs per state | License status, disciplinary record | State websites | Free |
| CPAdirectory.com | Large verified directory | Reviews, professional details, licensure verified | Public web | Free |

**Key signal for M&A relevance:** CPAs with ABV (Accredited in Business Valuation), CFF (Certified in Financial Forensics), or CGMA designations. Firms listing "due diligence," "quality of earnings," or "business valuation" as services.

**Business Appraisers:**

| Source | Coverage | Data Fields | Access | Cost |
|--------|----------|------------|--------|------|
| ASA (American Society of Appraisers) | Credentialed appraisers | ASA/AM designation, discipline, specialty | asa.memberclicks.net | Free search |
| NACVA (National Assoc. of CVAs) | 6,500+ CVA holders | CVA credential, location, services | nacva.com | Free search |
| AICPA ABV holders | CPAs with business valuation credential | ABV designation + CPA | Via AICPA directory | Free |
| SBA Lender referral lists | Appraisers that specific lenders accept | Lender-approved status | Ask lender partners | Free (relationship) |

**This is a critical referral point:** SBA loans almost always require a third-party business appraisal. SMBX referring the appraiser on an SBA deal = guaranteed conversion.

**Commercial Real Estate Agents:**

| Source | Coverage | Data Fields | Access | Cost |
|--------|----------|------------|--------|------|
| NAR (National Association of Realtors) | 1.5M+ members | License, specialization, location | realtor.com | Free search |
| CCIM Institute | 13K+ commercial RE specialists | CCIM designation, deal history | ccim.com | Free search |
| LoopNet / CoStar | Commercial brokers with active listings | Broker profiles, deal activity | loopnet.com | Free (basic) |
| State RE license databases | All licensed agents per state | License status, brokerage, discipline | State websites | Free |

**Key signal:** CCIM designation or agents who specialize in business sales with real estate components.

### How the Marketplace Works

**Phase 1 — Curated Directory (Build Cost: ~$0):**

No marketplace is needed on day one. Yulia just needs to know who to recommend.

```
User: "I need a lawyer to review my LOI"
    │
    ├── Yulia knows: deal is $2M HVAC company in Denver, SBA-financed
    │
    ├── Query provider DB:
    │   WHERE state = 'CO'
    │   AND practice_area INCLUDES 'M&A' OR 'business transactions'
    │   AND (has_sba_experience = true OR reviews_mention_sba = true)
    │   ORDER BY relevance_score DESC, reviews DESC
    │
    └── Yulia responds:
        "For an SBA-financed HVAC acquisition in Denver, you'll want
         an attorney who's closed SBA deals specifically — the lender
         requirements add complexity that general business lawyers miss.
         
         Here are three M&A attorneys in the Denver metro who've handled
         SBA acquisition closings:
         
         1. [Name] — [Firm], 15+ years M&A, ABV credential
         2. [Name] — [Firm], specializes in trades/services acquisitions
         3. [Name] — [Firm], former SBA lender counsel
         
         Want me to send an introduction to any of them?"
```

**Phase 2 — Verified Network (Month 3+):**

Providers can claim their profiles, add details, and opt into the referral network. The value proposition to them: "SMBX sends you qualified buyers and sellers who are actively in a deal. Not tire-kickers — people with LOIs, financing pre-approval, and deal timelines."

Provider profiles include:
- Standard: license, location, practice areas (from public data)
- Claimed: years of M&A experience, deal size range, industry focus, avg engagement cost, response time SLA
- Earned: SMBX-verified closed deals, client ratings, Yulia trust score

**Phase 3 — Transactional Marketplace (Month 6+):**

Providers bid on or accept referrals through the platform. SMBX takes a referral fee (10-20% of provider's fee, or flat fee per introduction). Providers can offer SMBX-exclusive pricing to win deal flow.

### Revenue Model

| Model | How It Works | Revenue Per Deal | When |
|-------|-------------|-----------------|------|
| Free referrals (brand building) | Yulia recommends, no fee | $0 (builds trust) | Phase 1 |
| Provider listing fees | Monthly/annual subscription to be in network | $50-$200/month per provider | Phase 2 |
| Per-introduction fee | Provider pays per qualified introduction | $50-$500 per intro | Phase 2 |
| Referral commission | % of provider's fee on closed engagement | 10-20% of fee ($500-$5,000) | Phase 3 |
| Preferred provider sponsorship | Featured placement in Yulia's recommendations | $500-$2,000/month | Phase 3 |

**Conservative estimate at scale (500 active deals/month):**
- 3 referrals per deal average × 500 deals = 1,500 introductions/month
- At $100/introduction average = **$150K/month referral revenue**
- Plus listing fees from 200 providers at $100/month = **$20K/month**

### Provider Database Schema

```
service_providers
├── id, type (attorney | cpa | appraiser | re_agent | insurance | consultant)
├── name, firm_name, email, phone, website
├── location: state, city, zip, service_radius_miles
├── licenses: [{state, license_number, status, verified_date}]
├── credentials: [ASA, ABV, CFF, CCIM, CVA, etc.]
├── practice_areas: [M&A, SBA, business_law, due_diligence, etc.]
├── deal_specialization:
│   ├── size_range: {min, max}
│   ├── industries: [NAICS codes]
│   ├── deal_types: [acquisition, sale, recapitalization, franchise]
│   └── financing_experience: [SBA_7a, SBA_504, conventional, seller_financing]
├── performance:
│   ├── smbx_referrals_sent, smbx_deals_closed
│   ├── avg_response_time_hours
│   ├── client_rating (from SMBX users)
│   └── yulia_trust_score (AI-computed)
├── pricing:
│   ├── typical_engagement_range: {min, max}
│   ├── smbx_rate (if offering platform discount)
│   └── fee_structure: (hourly | flat | contingent | hybrid)
├── claimed: boolean (has provider verified their profile?)
├── enrichment_data: JSONB (scraped reviews, CLE records, etc.)
└── provenance: data_sources[], last_verified
```

### Enrichment Pipeline

Initial population (free, automated):
1. Scrape state bar directories → attorneys with M&A/business practice areas
2. Scrape AICPA + state CPA societies → CPAs with valuation/forensic credentials
3. Scrape ASA + NACVA directories → credentialed business appraisers
4. Cross-reference with Avvo/Martindale for ratings and reviews
5. AI (Claude Haiku Batch) parses reviews and CLE history for M&A relevance signals
6. Score and rank providers per geography × practice area × deal size

Ongoing enrichment:
- Monitor state bar status changes (quarterly)
- Track new reviews on Avvo/Google (monthly)
- Incorporate SMBX user feedback after referrals
- Update Yulia trust scores based on outcome data

---

## 2. Franchise Matching Engine

### The Opportunity

Not every buyer should buy an existing business. Some are better served by a franchise. Today, if a buyer comes to SMBX and their profile better fits a franchise model, Yulia has nothing to offer them. That's a missed revenue opportunity and a missed chance to genuinely help.

**The franchise market is massive:**
- ~4,000 active franchise systems in the US
- Average industry CPL (cost per lead) in 2025: **$271**
- Average cost per sale via brokers: **~$50,000**
- Average cost per sale via digital advertising: **~$13,757**
- Franchise portals (Franchise.com, FranchiseGator) grew 11% usage YoY
- 71.4% of franchise seekers in April 2025 said "now is a good time" to proceed

**Franchise brands will pay $5K-$25K+ for a qualified, financially-vetted lead with a timeline.** SMBX users who've been through Yulia's financial intake are already more qualified than any portal lead.

### Data Sources — The FDD Intelligence Layer

Franchise Disclosure Documents (FDDs) are the gold mine. They're legally mandated, standardized, and contain exact financial data that's normally locked behind franchise sales processes.

**Free FDD sources (four states make them public records):**

| State | Access | Quality | Notes |
|-------|--------|---------|-------|
| Wisconsin | apps.dfi.wi.gov/apps/FranchiseSearch | Best — easy search, most franchisors register here | Can also view all franchisors selling in state |
| California | DFPI Self Service Portal | Large database — CA's massive economy attracts most brands | Requires exact legal name to search |
| Indiana | securities.sos.in.gov/public-portfolio-search | Good — started 2019, clean interface | Only 2019+ registrations |
| Minnesota | cards.web.commerce.state.mn.us/franchise-registrations | Good — add year to narrow results | Both initial and renewal filings |
| NASAA Depository | Via NASAA electronic filing system | Growing — centralized multi-state filing | Not all states participate yet |

**Paid FDD sources:**

| Source | Coverage | Cost | Quality |
|--------|----------|------|---------|
| FranChimp | 18,000+ FDDs from 4,000+ franchisors | $5/FDD or $167/month Pro | Largest commercial database |
| FRANData | 8,325+ FDDs | Premium pricing | Most thorough — includes unit counts, growth data |
| FDD Exchange | 7,876 FDDs | $39/month (100 FDDs) or 1 free/day | Sister site to TheFDDStore |
| Franchise Genius | Large catalog with current-year docs | Per-document pricing | Good for newer FDDs |

### What We Extract From FDDs

FDDs are standardized into 23 Items. The gold is in:

| FDD Item | What It Contains | Intelligence Value |
|----------|-----------------|-------------------|
| Item 5 | Initial fees (franchise fee, royalty, ad fund) | Total cost to enter |
| Item 6 | Other fees (technology, transfer, renewal) | Hidden costs |
| Item 7 | Estimated initial investment range | True startup cost |
| Item 19 | Financial performance representations | Unit economics (only ~60% of brands include this) |
| Item 20 | Outlets — openings, closings, transfers | Growth trajectory, churn rate |
| Item 21 | Financial statements (audited) | Franchisor financial health |

**AI enrichment per franchise brand (Claude Haiku Batch):**
- Extract Item 7 investment range (min/max)
- Extract Item 19 revenue/profit data if available
- Compute: implied ROI, payback period, break-even timeline
- Extract Item 20 metrics: net unit growth, closure rate, transfer rate
- Classify: industry NAICS, territory model, owner-operator vs. semi-absentee
- Score: Franchise Health Score (0-100) based on growth, closures, financial health
- Flag: high closure rates, declining unit counts, litigation history (Items 3-4)

### How Franchise Matching Works

```
BUYER PROFILE (built from Yulia conversation)
├── Budget: $150K liquid capital
├── Total investment capacity: $400K (including SBA/ROBS)
├── Experience: 10 years marketing, no business ownership
├── Lifestyle: wants semi-absentee model
├── Geography: Dallas-Fort Worth metro
├── Interests: health/fitness, food, services
├── Risk tolerance: moderate (prefers proven model)
    │
    ▼
FRANCHISE MATCHING ENGINE
├── Filter: Item 7 investment range ≤ $400K
├── Filter: semi-absentee model = yes
├── Filter: territory available in DFW
├── Rank by: Franchise Health Score + Item 19 unit economics
├── Cross-reference: Guidant ROBS eligibility (if using retirement funds)
    │
    ▼
YULIA RECOMMENDS:
"Based on your budget, experience, and interest in semi-absentee
 models, here are three franchise systems worth exploring:

 1. [Brand A] — Health/fitness, $250K-$350K total investment
    Item 19 shows avg unit revenue of $680K, 22% owner cash flow
    87 units opened last year, 3 closed — strong growth trajectory
    ROBS-eligible through Guidant

 2. [Brand B] — Home services, $180K-$280K total investment  
    No Item 19 (request it during discovery day)
    142 net new units in 2024 — fastest growing in category
    SBA 7(a) eligible for partial financing

 3. [Brand C] — QSR food, $300K-$400K total investment
    Item 19 shows avg unit revenue of $920K, 18% owner cash flow
    Multi-unit friendly — path to portfolio ownership

 Want me to connect you with any of these brands or schedule
 a call with a franchise consultant?"
```

### Revenue Model

| Channel | Revenue Per Lead | Volume Potential | Notes |
|---------|-----------------|-----------------|-------|
| Franchise brand referral | $5K-$25K per qualified lead that purchases | Low volume, high value | Direct relationship with franchisor dev teams |
| Franchise portal/broker referral | $500-$2,000 per qualified lead | Medium volume | Partner with Franchise.com, FranchiseGator, etc. |
| Guidant Financial referral | ~$2K-$5K per funded ROBS/SBA | Synergistic with existing partnership | Already a planned partner |
| Franchise consultant referral | 25-50% of consultant fee ($2K-$5K) | Medium volume | Consultants love pre-qualified leads |

**Why franchise brands will pay SMBX premium rates:**

SMBX leads are qualitatively different from portal leads:
- **Financially profiled** — Yulia already knows their budget, liquid capital, financing eligibility
- **Psychographically profiled** — Yulia knows their risk tolerance, lifestyle goals, timeline
- **Intent-verified** — They came to SMBX to make a business decision, not browse casually
- **Timing-qualified** — Yulia knows if they're ready now or 6 months out

This is essentially a franchise consultant's job (qualify → match → present), automated by AI. Franchise consultants charge $10K-$25K per placement — SMBX can capture a meaningful slice.

### Franchise Database Schema

```
franchise_brands
├── id, legal_name, trade_name, parent_company
├── industry: NAICS, category, subcategory
├── investment: {
│   ├── franchise_fee, royalty_rate, ad_fund_rate
│   ├── total_min, total_max (from Item 7)
│   ├── liquid_capital_required
│   └── net_worth_required
│   }
├── model: {
│   ├── type: owner_operator | semi_absentee | absentee | executive
│   ├── multi_unit_allowed, area_development_available
│   ├── territory_type: exclusive | protected | open
│   └── home_based: boolean
│   }
├── performance: {
│   ├── item_19_available: boolean
│   ├── avg_unit_revenue, median_unit_revenue
│   ├── avg_owner_cash_flow (if disclosed)
│   ├── units_open, units_opened_last_year, units_closed_last_year
│   ├── net_unit_growth_rate
│   └── franchise_health_score (0-100, AI-computed)
│   }
├── territories: {
│   ├── states_registered: []
│   ├── territories_available: [] (if trackable)
│   └── international: boolean
│   }
├── fdd_data: JSONB (full extracted FDD fields)
├── fdd_source: url, state, year
├── embedding: VECTOR(768)
└── last_updated, confidence_score
```

---

## 3. Buyer/Investor Sourcing for Sellers

### The Problem

The #1 question every seller asks: "How do I find a buyer?"

Traditional answers are expensive and slow:
- List with a broker (10-12% commission, 8-12 month timeline)
- List on BizBuySell ($60-$300/month, passive)
- Tell your network (privacy risk)
- Hope someone finds you

SMBX flips this: **the platform already knows who's looking.** Every buyer thesis, every saved search, every conversation with Yulia creates a demand signal. The seller's job isn't to "find" buyers — it's to let Yulia match them.

### How It Works — The Demand-Side Matching Engine

**Layer 1: Internal Platform Matching (Instant)**

Every active buy thesis on the platform is a potential match:

```
SELLER TELLS YULIA: "I want to sell my $3M revenue dental practice in Tampa"
    │
    ▼
INSTANT MATCHING AGAINST PLATFORM DEMAND
├── Active buy theses with dental/healthcare focus: 23
├── Buy theses matching Tampa/Florida geography: 47  
├── Buy theses matching $3M revenue range: 156
├── INTERSECTION (dental + Florida + $3M range): 8 strong matches
├── NEAR-MATCHES (healthcare + Southeast + $2-5M): 31 additional
    │
    ▼
YULIA RESPONDS:
"Good news — I see 8 active buyers on our platform whose acquisition
 criteria closely match your practice. 31 more are looking for
 healthcare businesses in the Southeast in your revenue range.

 Before I make introductions, let's build your confidential profile
 so we can present your practice at its strongest. What's your
 current annual SDE?"
```

**Layer 2: Buyer Type Intelligence (Minutes)**

Not all buyers are equal. Yulia should tell the seller what kinds of buyers their business attracts and why:

| Buyer Type | How They Find Deals | What They Pay | How SMBX Identifies Them |
|-----------|-------------------|---------------|-------------------------|
| First-time buyer (individual) | Marketplace listings, brokers | 2.5-3.5× SDE | Platform users with no deal history |
| Search fund operator | Thesis-driven, broker networks, proprietary | 3-5× SDE | LinkedIn, Stanford/HBS search fund databases, Searchfunder.com |
| PE add-on acquirer | Proprietary outreach, broker relationships | 4-6× EBITDA | Crunchbase portfolio companies, EDGAR filings |
| Strategic acquirer | Direct outreach, investment bankers | 5-10× EBITDA | SEC EDGAR, Crunchbase, industry mapping |
| Franchise operator (multi-unit) | Franchisor matchmaking | Asset value | FDD Item 20 transfer data |
| Family office | Broker networks, direct | 3-5× EBITDA | Crunchbase, ADV filings (SEC) |
| ETA (entrepreneurship through acquisition) | Self-sourced, searchers | 3-4× SDE | MBA program networks, ETA communities |

**Layer 3: External Buyer Discovery (Async — For Larger Deals)**

For deals above $5M where institutional buyers are relevant:

```
EXTERNAL BUYER SOURCING PIPELINE
    │
    ├── Crunchbase: PE firms with portfolio companies in same industry
    │   └── "Which PE firms have bought dental practices in the last 3 years?"
    │
    ├── SEC EDGAR: Investment advisors with healthcare/dental focus
    │   └── ADV filings list investment focus areas
    │
    ├── SBA Lender Activity: Banks actively lending in this NAICS + geography
    │   └── "Which lenders funded dental practice acquisitions in Florida?"
    │   └── Reverse signal: where there are active lenders, there are active buyers
    │
    ├── Platform Data: Buyers who searched for "dental" or "healthcare" 
    │   in the last 90 days (behavioral intent signals)
    │
    └── OpenCorporates: Recently formed LLCs with dental-related names
        └── New entity formation = potential acquirer gearing up
```

### What Yulia Tells Sellers

**For a $500K business (Main Street):**

> "Your laundromat at $500K asking price is well-positioned for SBA buyers — there are 14 active SBA lenders in your county who funded laundromat acquisitions last year. We have 6 buyers on our platform looking for laundromats in your metro area. The typical buyer for this type of business is a first-time owner-operator using SBA 7(a) financing with 10% down. At your asking price, the estimated monthly payment is $3,200 — which your SDE of $180K easily supports.
>
> I can create a confidential listing and match you with interested buyers. Want to proceed?"

**For a $5M business (Lower Middle Market):**

> "Your IT services company at $5M has multiple buyer pools interested:
>
> **Individual/Search Fund buyers** — 4 on our platform with IT services criteria, likely offering 3-4× SDE with SBA financing
>
> **PE add-on buyers** — I've identified 3 PE-backed IT services platforms operating in the Southeast that are actively doing add-on acquisitions in your revenue range
>
> **Strategic buyers** — 2 larger MSPs in your metro that might pay a premium for your client base
>
> Each buyer type means different deal structures, timelines, and valuations. Want me to walk you through the pros and cons of each?"

**For a $50M business (Middle Market):**

> "At this deal size, your buyer universe shifts to institutional capital. Based on SEC filings and Crunchbase data, I've identified:
>
> **12 PE firms** that have completed IT services acquisitions in the $20-100M range in the last 24 months
>
> **4 public strategic acquirers** with stated acquisition strategies in your sector
>
> **3 PE-backed platforms** that would view your company as a platform investment rather than an add-on — this typically commands 8-10× EBITDA versus 5-6× for add-ons
>
> I recommend engaging an investment banker for a deal this size. I can introduce you to three who specialize in IT services M&A. Want me to set that up?"

### Revenue Model for Seller-Side

| Service | Revenue | When |
|---------|---------|------|
| Confidential listing creation | Free (draws sellers to platform) | Phase 1 |
| Buyer matching (internal platform) | Included in seller wallet spend | Phase 1 |
| Buyer matching alerts (notify matching buyers) | $50-$200 per alert campaign | Phase 2 |
| Introduction to PE/strategic buyers | $500-$2,000 per qualified introduction | Phase 3 |
| Investment banker referral | 10-20% of banker retainer ($5K-$20K) | Phase 3 |
| Data room + deal management tools | $200-$500/month during active sale | Phase 2 |
| Seller's advisory package (Yulia-powered) | $500-$2,000 (wallet spend) | Phase 1 |

**The flywheel:** Every seller who lists creates supply that attracts more buyers. Every buyer who registers creates demand that attracts more sellers. Platform just needs to reach critical mass in a few geographies/industries to become self-sustaining.

---

## 4. Capital Access Expansion (Extending Existing Partnerships)

This is already in the BUILD_PLAN but connects directly to the referral ecosystem:

### Current Partners

| Partner | What They Provide | Referral Revenue | Integration Point |
|---------|------------------|-----------------|-------------------|
| **Guidant Financial** | ROBS (401k business financing), SBA loan facilitation | ~$2K-$5K per funded deal | Yulia recommends when buyer has retirement funds |
| **Lendio** | SBA loan marketplace (250+ lenders) | Per-funded-deal fee | Yulia recommends for SBA pre-qualification |

### Expansion Targets

| Provider Type | Examples | Revenue Model | Why They'd Partner |
|--------------|---------|---------------|-------------------|
| Equipment lenders | Crest Capital, Balboa Capital | Per-funded-deal | Access to pre-qualified borrowers with deal context |
| Seller financing platforms | Mainstreet.com, EarlyBirdCapital | Listing fee or referral | Structured seller carry notes with escrow |
| Reps & Warranties insurance | Accelerant, Euclid Transactional | Per-policy referral (5-15%) | $3-5K per policy, growing market |
| Working capital lenders | BlueVine, Fundbox, OnDeck | Per-funded referral | Post-acquisition working capital is always needed |
| Business credit card partners | Brex, Ramp | Referral bonus ($200-$500) | New business owners need business credit immediately |
| Payroll/HR | Gusto, ADP | Partner referral ($100-$300) | New owners need Day 1 payroll setup |

### How Capital Access Connects to Everything

```
BUYER ACQUISITION JOURNEY
├── Browsing: "I want to buy a laundromat"
│   └── Yulia: "With $50K liquid, SBA 7(a) gets you to $500K purchase power.
│              Want to pre-qualify with our lending partners?"
│   └── Revenue: Lendio/Guidant referral fee
│
├── Under LOI: "I signed an LOI, now what?"
│   └── Yulia: "You'll need a business appraisal for SBA (here are 3),
│              an M&A attorney to review the APA (here are 3),
│              and your CPA should review the financials (here are 3)"
│   └── Revenue: Service provider referral fees × 3
│
├── Due Diligence: "The financials look good"
│   └── Yulia: "Let's get your SBA loan finalized. Your lender will need
│              these documents. Also, you should lock in R&W insurance
│              given the customer concentration risk we identified"
│   └── Revenue: Insurance referral, lender completion fee
│
├── Closing: "We're closing next week"
│   └── Yulia: "Congratulations! You'll need business insurance updated Day 1,
│              payroll setup for the transition, and a working capital line
│              for the first 90 days"
│   └── Revenue: Insurance, payroll, working capital referral fees
│
└── Post-Close: "I own a business now"
    └── Yulia: "Time to optimize. Your CPA should start tax planning,
               and I can monitor your market for acquisition opportunities
               if you want to grow"
    └── Revenue: CPA referral, ongoing platform subscription

TOTAL REFERRAL TOUCHPOINTS PER DEAL: 6-10
ESTIMATED REFERRAL REVENUE PER DEAL: $2,000-$15,000
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation — Embedded Recommendations (Weeks 1-4)
**Cost: ~$0 additional (uses existing infrastructure)**

What to build:
- Service provider database table in PostgreSQL
- Initial population: scrape top 50 MSAs for M&A attorneys, CPAs with ABV/CFF, ASA/NACVA appraisers
- Estimated records: ~5,000-10,000 providers covering major metros
- Yulia prompt engineering: contextual provider recommendations based on deal type, geography, deal size
- Franchise brands table: manually curate top 200 franchise systems with extracted FDD data
- Buyer matching: when seller describes business, Yulia checks active buy theses for matches

Revenue: $0 (building trust and usage patterns)

### Phase 2: Verified Network & Franchise Engine (Month 2-3)
**Cost: ~$20-50/month additional**

What to build:
- Provider claim flow: providers verify their profile, add details, opt into referral network
- Franchise FDD extraction pipeline: scrape Wisconsin/California/Indiana state databases for all registered FDDs
- Claude Haiku Batch enrichment on FDDs (~$0.005/FDD × 4,000 brands = ~$20 one-time)
- Franchise matching algorithm: buyer profile → franchise brand scoring
- Guidant Financial deep integration: ROBS pre-qualification embedded in buyer flow
- Buyer/seller matching alerts: automated email when new supply matches demand
- Track referral conversions: which introductions lead to engagements

Revenue: First referral fees from service providers and Guidant; first franchise brand conversations

### Phase 3: Marketplace & Active Sourcing (Month 4-6)
**Cost: ~$50-100/month additional**

What to build:
- Provider bidding/acceptance on referrals through platform
- Franchise brand partnerships: direct referral agreements with 20-50 brands
- External buyer sourcing for sellers: Crunchbase PE firm identification, SEC EDGAR ADV filing search, SBA Lender Activity Report integration
- Search fund database: aggregate from Searchfunder.com, MBA program listings
- Provider performance tracking: response times, close rates, client satisfaction
- Insurance partner integration: R&W insurance for larger deals
- Post-acquisition service bundle: payroll, insurance, working capital referrals

Revenue: Meaningful referral revenue from providers, franchise brands, and capital partners

### Phase 4: Full Transaction Ecosystem (Month 6+)
**Cost: Scales with revenue**

What to build:
- Dynamic provider matching with AI-optimized recommendations
- Franchise territory availability tracking (which territories are open where)
- PE firm relationship management: track which firms are buying what
- Seller's advisory automation: Yulia manages the entire sale process with provider orchestration
- White-label services for brokers: let brokers use SMBX tools to serve their clients
- Transaction data feedback loop: closed deal data improves all matching and pricing algorithms

Revenue: Multiple thousands per deal across 4-8 referral touchpoints

---

## 6. Revenue Projections

### Per-Deal Revenue Stack (Mature Platform)

| Referral Type | Revenue Per Event | Events Per Deal | Revenue Per Deal |
|--------------|------------------|----------------|-----------------|
| Attorney referral | $500-$2,000 | 1 | $500-$2,000 |
| CPA referral | $300-$1,000 | 1 | $300-$1,000 |
| Appraiser referral | $300-$1,000 | 0.5 (SBA deals) | $150-$500 |
| Lender/financing referral | $1,000-$5,000 | 1 | $1,000-$5,000 |
| Insurance referral | $200-$1,000 | 0.5 | $100-$500 |
| Franchise referral | $5,000-$15,000 | 0.1 (10% of buyers) | $500-$1,500 |
| Post-close services | $200-$500 | 1 | $200-$500 |
| **Platform fees (Yulia advisory)** | **$500-$2,000** | **1** | **$500-$2,000** |
| **TOTAL PER DEAL** | | | **$3,250-$13,000** |

### Scale Scenarios

| Scenario | Active Deals/Month | Avg Rev/Deal | Monthly Revenue | Annual Revenue |
|----------|-------------------|-------------|----------------|---------------|
| Early (Month 3) | 10 | $1,000 | $10K | $120K |
| Growing (Month 6) | 50 | $3,000 | $150K | $1.8M |
| Established (Month 12) | 200 | $5,000 | $1M | $12M |
| Scale (Month 24) | 500 | $7,000 | $3.5M | $42M |

These numbers are conservative. They assume SMBX captures only a fraction of the referral opportunities per deal. A fully orchestrated deal could generate $15K-$25K in platform revenue through referrals alone — before any advisory or intelligence fees.

---

## 7. Competitive Positioning

**Nobody owns this layer for SMB M&A.**

| Existing Platform | What They Do | What They Don't Do |
|------------------|-------------|-------------------|
| BizBuySell | Lists businesses for sale | No service provider matching, no buyer intelligence |
| Axial | Matches brokers with PE buyers | No SMB coverage, no service providers, no franchises |
| LegalMatch / Avvo | Attorney directories | No M&A context, no deal intelligence, no other providers |
| Franchise.com / FranchiseGator | Franchise portals | No financial pre-qualification, no alternative matching |
| Guidant Financial | ROBS/SBA financing | Single service, no ecosystem orchestration |
| Baton | Seller valuations | No buyer sourcing, no service network |

**SMBX's unique position:** Yulia sits at the center of the deal, understands the full context (deal type, size, geography, financing structure, timeline), and can make intelligent recommendations across the entire professional services stack. No other platform has this orchestration layer.

**The moat compounds:** Every completed referral generates feedback data. Which attorneys close SBA deals fastest? Which CPAs catch the most add-backs in due diligence? Which franchise brands have the best unit economics? After 12 months, Yulia's recommendations will be based on real transaction outcomes — not just directory data.

---

## 8. The Unified Vision

```
VISITOR → SMBX.ai
    │
    ├── "I want to sell my business"
    │   ├── Yulia values it, identifies buyer types
    │   ├── Matches against platform demand (instant)
    │   ├── Sources external buyers (async)
    │   ├── Recommends: attorney, CPA, appraiser
    │   ├── Connects with lenders who fund these deals
    │   └── Revenue: advisory + 5-8 referral fees
    │
    ├── "I want to buy a business"
    │   ├── Yulia profiles buyer, defines thesis
    │   ├── Searches listings + discovers opportunities
    │   ├── Pre-qualifies for SBA/ROBS financing
    │   ├── Recommends: attorney, CPA, insurance
    │   ├── If no match: "Consider these franchise opportunities"
    │   └── Revenue: advisory + financing + 4-6 referral fees
    │
    ├── "I want to raise capital"
    │   ├── Yulia assesses financing options
    │   ├── Connects with appropriate lenders
    │   ├── Recommends: attorney, CPA for structure
    │   └── Revenue: advisory + lender referral + 2-3 service fees
    │
    └── "I want help integrating my acquisition"
        ├── Yulia manages 90-day transition plan
        ├── Recommends: CPA, payroll, insurance, working capital
        └── Revenue: advisory + 3-5 referral fees

EVERY PATH THROUGH SMBX GENERATES MULTIPLE REVENUE STREAMS.
THE PLATFORM EARNS MORE AS IT HELPS MORE.
```

**That's the transaction ecosystem. Not just an advisory tool — the operating system for SMB deals.**
