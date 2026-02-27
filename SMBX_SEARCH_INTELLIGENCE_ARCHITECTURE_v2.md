# SMBX.ai Search & Intelligence Architecture
## From Listing Aggregator to Acquisition Intelligence Engine

---

## The Fundamental Question: Database vs. Search Engine

Paul asked: "Will the DB eventually get filled up with every business on earth? Is that necessary or is that key?"

**Answer: Neither. SMBX should be a hybrid intelligence engine — not a static database of listings, and not a real-time search engine that finds everything on the fly. It should maintain a curated core of actionable deal inventory while deploying intelligent agents that search, score, and surface opportunities from external sources on demand.**

Here's the mental model:

```
┌─────────────────────────────────────────────────────────┐
│                    SMBX INTELLIGENCE ENGINE               │
│                                                           │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │  CORE DB     │   │  LIVE SEARCH │   │  ENRICHMENT  │  │
│  │  (Curated)   │◄──┤  (On-Demand) │──►│  (AI Layer)  │  │
│  │              │   │              │   │              │  │
│  │ ~100K-300K   │   │ External     │   │ Census/BLS   │  │
│  │ active deals │   │ APIs queried │   │ FRED/BEA     │  │
│  │ + enriched   │   │ per buyer    │   │ SEC EDGAR    │  │
│  │ profiles     │   │ thesis       │   │ Claude AI    │  │
│  └──────────────┘   └──────────────┘   └──────────────┘  │
│                                                           │
│  Yulia orchestrates across all three layers               │
└─────────────────────────────────────────────────────────┘
```

**Why not "every business on earth":**
- There are ~33M businesses in the US alone, ~6M with employees
- Grata spent 10 years and $50M+ building 19M company profiles (just acquired by Datasite)
- PitchBook has 3M+ companies and charges $30K+/year
- You can't outspend them. You can out-think them.

**Why not "pure search engine" either:**
- Cold searches are slow and expensive (each query = multiple API calls + AI processing)
- Users expect instant results when browsing
- Enrichment is the value — raw search results are commodity

**The winning architecture: Three-tier intelligence**

---

## Tier 1: The Core Database (What We OWN)

This is the curated, enriched inventory that makes the platform feel instant and valuable. It contains:

### 1A. Active Deal Inventory (~100K-300K records)

**What's in it:** Every business actively listed for sale across major marketplaces, plus broker-submitted and user-submitted deals.

**Sources (ranked by volume and quality):**

| Source | Est. Listings | Data Quality | Access Method |
|--------|-------------|-------------|---------------|
| BizBuySell | ~45K | High (price, revenue, SDE, location) | Apify scraper → normalize |
| BusinessBroker.net | ~28K | Medium (often sparse financials) | Scraper |
| BizQuest | ~17K | High (same parent as BizBuySell) | Scraper |
| DealStream | ~15K | Medium-High | Scraper |
| Flippa / Acquire.com | ~20K | High for digital businesses | Scraper / API |
| Broker direct submissions | 0 → growing | Highest (first-party) | SMBX portal |
| User-submitted (paste a URL) | 0 → growing | Variable | SMBX intake |

**What we enrich on ingest (via Claude Haiku Batch API, ~$0.001/listing):**
- NAICS code classification (6-digit)
- Implied SDE/EBITDA multiple
- Margin analysis (if revenue + SDE both present)
- SBA financing quick-check (eligible? estimated DSCR? down payment?)
- Risk flags (missing data, pricing anomalies, inconsistencies)
- Deal Quality Score (0-100)
- Ownership type inference (owner-operator, absentee, multi-location, franchise)
- Embedding vector (for semantic matching)

**What we enrich with government data (free, cached):**
- Competitive density (Census CBP: how many similar businesses in this market?)
- Wage benchmarks (BLS QCEW: are labor costs above/below national average?)
- Local economic health (BEA GDP, unemployment)
- Current SBA rates (FRED: what would the monthly payment actually be?)

**Lifecycle management:**
- New listings ingested daily via scheduled scraper jobs
- Stale listings (>90 days unchanged) flagged, >180 days archived
- Deduplication on ingest (fingerprint: normalize title + state + price band + revenue band)
- "Last verified" timestamp shown to users
- Archived listings become comp data (never deleted, just moved to `listings_archive`)

### 1B. Company Intelligence Profiles (~50K-500K, growing)

This is NOT "every business on earth." This is a growing database of companies that SMBX users have interacted with, searched for, or that match active buy theses.

**How profiles get created:**
1. **User interaction:** Buyer saves a listing → we create/link a company profile
2. **Thesis matching:** Buy box scan finds a company via external search → profile created
3. **Seller intake:** Seller starts Yulia conversation → profile created from their data
4. **Broker submission:** Broker lists a deal → profile created
5. **Research enrichment:** AI agent researches a company for a buyer → profile cached

**What a company profile contains:**

```
company_profiles
├── Basic: name, location, industry, NAICS, website, founding_year
├── Ownership: type (public | PE-held | family | founder-led | franchise | unknown)
│   ├── If public: ticker, exchange, market_cap, SEC CIK
│   ├── If PE-held: sponsor_name, fund, acquisition_date, platform_or_addon
│   ├── If franchise: franchisor, unit_count
│   └── Source: how we determined this (EDGAR, Crunchbase, AI inference, user-reported)
├── Financials: revenue_range, employee_range, growth_signals
│   └── Source varies: EDGAR (public), Crunchbase (funded), AI-inferred, user-reported
├── Deal Status: for_sale | not_for_sale | recently_sold | unknown
│   └── linked_listings[] (if for sale, which marketplace listings)
├── Intelligence: enrichment_data JSONB (cached analysis, market context)
├── Embedding: profile_embedding VECTOR(768) (for semantic matching)
└── Provenance: data_sources[], confidence_score, last_verified
```

**The ownership question — how to know if it's public or PE-held:**

| Ownership Type | How We Detect It | Data Source | Cost |
|---------------|-----------------|-------------|------|
| **Public** | SEC EDGAR lookup by company name/CIK | EDGAR API (free, 10 req/sec) | $0 |
| **PE-held** | Crunchbase funding data, news search, PE portfolio pages | Crunchbase Basic (free) + Claude web research | ~$0.01/company |
| **VC-backed** | Crunchbase funding rounds | Crunchbase API | $0 (free tier) |
| **Franchise** | FDD database, franchise disclosure documents | FRANdata (paid) or AI inference from listing | Variable |
| **Family/Founder** | Default assumption if no funding/PE/public signals found | Inference | $0 |
| **Unknown** | Not enough data to determine | — | — |

**Key insight:** You don't need to know ownership for every business upfront. Ownership detection happens on-demand when a buyer or Yulia needs it. The system checks: Is this company in SEC EDGAR? → public. Does Crunchbase show PE/VC funding? → PE-held/VC-backed. Neither? → likely private/family-owned. Cache the result.

### 1C. Market Intelligence Cache

Pre-computed market data that's shared across all users (the "50-80% cost reduction" layer from BUILD_PLAN_v6):

- **Census CBP data:** Cached per NAICS × county combination (~200K combos cover 95% of queries)
- **BLS QCEW data:** Cached per NAICS × state (quarterly refresh)
- **FRED indicators:** Cached daily (interest rates, SBA rates, unemployment, CPI)
- **BEA GDP data:** Cached per county (annual refresh)
- **Industry multiples:** Compiled from BizBuySell Insight Reports, IRS SOI, SEC EDGAR comps
- **Sector analysis:** AI-generated weekly per active NAICS sector (shared across users)

---

## Tier 2: Live Search (What We FIND On-Demand)

This is the "intelligent search" Paul described — the system doesn't just search a database, it goes out and FINDS businesses matching a thesis.

### The Thesis-Driven Search Architecture

When a buyer (or a broker with a buy mandate) defines what they're looking for, the system doesn't just filter the Core DB. It activates a multi-source search agent:

```
BUYER DEFINES THESIS
    │
    ▼
┌─────────────────────────────────────────┐
│         SEARCH ORCHESTRATOR              │
│                                          │
│  1. CORE DB SEARCH (instant, <100ms)     │
│     └── pgvector similarity + filters    │
│                                          │
│  2. MARKETPLACE SCAN (seconds)           │
│     ├── BizBuySell live search           │
│     ├── DealStream query                 │
│     └── Flippa/Acquire.com if digital    │
│                                          │
│  3. COMPANY DISCOVERY (async, minutes)   │
│     ├── OpenCorporates (200M+ companies) │
│     ├── Crunchbase (funded companies)    │
│     ├── SEC EDGAR (public companies)     │
│     ├── Google/Bing search (AI-parsed)   │
│     └── LinkedIn company search          │
│                                          │
│  4. MARKET OPPORTUNITY (async, minutes)  │
│     ├── Census CBP: where are clusters?  │
│     ├── BLS: which markets are growing?  │
│     └── AI synthesis: "underserved       │
│         markets with high density but    │
│         no active listings"              │
└─────────────────────────────────────────┘
    │
    ▼
RESULTS SCORED, DEDUPLICATED, ENRICHED
    │
    ▼
BUYER SEES: Ranked opportunities with intelligence
```

### How This Works for Different User Types

**First-time buyer looking at a $400K laundromat:**
- Core DB search finds 12 laundromat listings in their geography
- Each has SBA financing estimate, competitive density, deal quality score
- Yulia highlights: "3 of these are priced below market — here's why that matters"
- No external search needed — Core DB covers main street deals well

**Search fund operator with a thesis: "B2B SaaS, $1-3M ARR, <$10M valuation":**
- Core DB finds 8 matching listings from Flippa/Acquire.com
- Live marketplace scan finds 3 more on BizBuySell not yet ingested
- Company discovery agent searches Crunchbase for funded SaaS companies in range
- Agent also searches for bootstrapped SaaS via web crawl (company pages, G2 listings)
- Results enriched with growth signals, churn indicators, competitive landscape
- New discoveries cached as Company Intelligence Profiles for future queries

**PE firm executing a roll-up: "Home services in Sun Belt, $5-20M revenue":**
- Core DB has some listings in range
- Company discovery agent searches OpenCorporates for registered home services companies in target states
- Cross-references with SEC EDGAR for any public comps
- Checks Crunchbase for PE-backed platforms already rolling up in this space
- Census CBP data identifies markets with high fragmentation (many small operators = roll-up opportunity)
- Agent flags: "Vista Equity bought ServiceTitan — PE interest in home services tech is high"
- Ownership detection runs on each candidate: which are PE-held (avoid), which are family-owned (target)

**Broker with a buy mandate: "Client wants manufacturing, $20-40M, Midwest":**
- Same thesis-driven search as above, but with broker-specific output
- Results include teaser-level summaries broker can present to their client
- Platform tracks the mandate and proactively alerts when new matches appear
- Broker doesn't need to "populate" anything — the system works for them

### External Data Sources for Live Search

| Source | What It Provides | Access | Cost | Scale |
|--------|-----------------|--------|------|-------|
| **OpenCorporates** | Company registrations, officers, filings from 170+ jurisdictions | REST API | Free for public benefit; £2,250+/yr commercial | 200M+ companies |
| **Crunchbase Basic** | Funded company profiles, funding rounds, acquisitions | Web + Basic API | Free tier (limited) | ~2M companies |
| **SEC EDGAR** | Public company filings, financials, ownership | REST API, no key needed | Free (10 req/sec) | ~500K entities |
| **SBA Loan Data** | Historical 7(a) and 504 loans by business/industry/geography | Bulk download from data.sba.gov | Free | Millions of loans since FY1991 |
| **Google Custom Search** | Company websites, news, industry pages | API | $5/1000 queries | Unlimited |
| **State Business Registries** | LLC/Corp filings, registered agents, status | Varies by state (many free) | Mostly free | All registered US entities |

### The "Search Agent" Architecture

This is where the BUILD_PLAN's "wake-run-sleep" pattern applies:

```javascript
// Simplified thesis search agent flow
async function executeThesisSearch(thesis) {
  // INSTANT: Search core database
  const coreResults = await searchCoreDB(thesis);
  
  // Return core results immediately to user
  yield { type: 'core_results', data: coreResults };
  
  // ASYNC: Launch external searches in parallel
  const [marketplaceResults, companyResults, marketOpps] = 
    await Promise.allSettled([
      searchMarketplaces(thesis),        // BizBuySell, DealStream live search
      discoverCompanies(thesis),          // OpenCorporates, Crunchbase, web
      analyzeMarketOpportunities(thesis)  // Census data + AI synthesis
    ]);
  
  // Deduplicate against core DB
  const newResults = deduplicateAgainstCore(
    marketplaceResults, companyResults
  );
  
  // Enrich new discoveries
  for (const result of newResults) {
    const enriched = await enrichCompany(result); // Claude Haiku
    await cacheAsProfile(enriched);               // Save to company_profiles
  }
  
  // Return enriched external results
  yield { type: 'discovery_results', data: newResults };
  yield { type: 'market_opportunities', data: marketOpps };
}
```

---

## Tier 3: The Intelligence Layer (What Makes It ALL Valuable)

Raw data — whether from the Core DB or Live Search — is commodity. The intelligence layer is what makes SMBX worth paying for.

### Intelligence Products by Deal Size

The system must handle the full spectrum. Here's what intelligence looks like at each level:

| Deal Size | Buyer Type | Key Intelligence Needs | Sources |
|-----------|-----------|----------------------|---------|
| **$300K-$1M** | First-time buyer, small investor | SBA eligibility, DSCR calc, comparable asking prices, owner transition risk | Core DB + Census + FRED + BizBuySell comps |
| **$1M-$5M** | Search fund, experienced buyer | SDE/EBITDA analysis, add-back verification, industry multiple benchmarks, competitive density | Core DB + Census + BLS + IRS SOI |
| **$5M-$20M** | PE add-on, family office | Platform vs. add-on positioning, synergy potential, management depth, customer concentration | Core DB + Crunchbase + SEC EDGAR + AI research |
| **$20M-$100M** | PE platform, corp dev | QoE-level analysis, market sizing, competitive moat, regulatory risk, growth vectors | EDGAR + Crunchbase + BLS + BEA + deep AI research |
| **$100M-$1B+** | Institutional PE, strategic | Full market mapping, public comp analysis, sector thesis validation, deal structure optimization | EDGAR + full financial modeling + industry reports |

### The Seven Layers of Intelligence (from BUILD_PLAN)

Applied to search results, not just user-entered data:

1. **Industry Structure** — Porter's Five Forces for the specific NAICS code
2. **Market Geography** — Local economic health, competitive density, growth trajectory
3. **Financial Benchmarking** — How does this deal compare to industry norms?
4. **Financing Feasibility** — Can it be financed? At what terms? What structure?
5. **Risk Assessment** — What could go wrong? Concentration, cyclicality, regulatory?
6. **Ownership Intelligence** — Who owns this? PE-backed? Strategic? Family? Why it matters for the deal.
7. **Timing & Momentum** — Is this a good time to buy in this sector/geography? PE multiples trending up or down?

### Ownership Intelligence — The Differentiator

No platform at the SMB level tells buyers: "This company is PE-backed by XYZ Fund, acquired in 2021, likely being positioned for exit — expect premium pricing" or "This is a 30-year family business, owner is 67 — likely motivated seller, may accept seller financing."

**How ownership intelligence flows:**

```
Company identified → Ownership Detection Pipeline
  │
  ├── Check SEC EDGAR (CIK lookup by name)
  │   └── If found: PUBLIC → pull financials, market cap, insider ownership
  │
  ├── Check Crunchbase (search by name + location)  
  │   ├── If PE funding found: PE-HELD → identify sponsor, fund, acquisition date
  │   ├── If VC funding found: VC-BACKED → identify investors, last round, runway
  │   └── If no funding: continue checking
  │
  ├── Check listing data (broker description often mentions)
  │   └── AI extract: "owner retiring" → FAMILY/FOUNDER
  │   └── AI extract: "franchise" → FRANCHISE
  │   └── AI extract: "portfolio company" → PE-HELD
  │
  ├── Check SBA loan history (data.sba.gov)
  │   └── If recent acquisition loan: likely recent buyer, may flip
  │
  └── Default: PRIVATE/FAMILY-OWNED (most common for SMB)
  
Result cached in company_profiles.ownership with confidence score
```

---

## Data Management Strategy

### What to Store vs. What to Search On-Demand

| Data Category | Strategy | Rationale |
|--------------|----------|-----------|
| **Active listings** (for-sale businesses) | Store and enrich in Core DB | Core product — must be instant |
| **Company profiles** (interacted with) | Store and grow organically | Compounds over time, enrichment is expensive to redo |
| **Market intelligence** (Census, BLS, etc.) | Cache with TTL in PostgreSQL | Free to fetch, expensive to process — cache aggressively |
| **Ownership data** | Cache when detected, refresh on access | Changes infrequently, expensive to check everywhere |
| **Historical transactions** | Store permanently as comp data | Gets more valuable over time, never expires |
| **ALL businesses on earth** | **DO NOT STORE** | Impossible to maintain, unnecessary, search on-demand |

### Database Size Projections

| Component | Records | Storage | Growth Rate |
|-----------|---------|---------|-------------|
| Active listings (Core DB) | 100K-300K | ~2-5 GB | +5K-10K/month net |
| Company profiles | 50K → 500K over year 1 | ~1-3 GB | Grows with usage |
| Market intelligence cache | ~500K entries | ~2 GB | Stable (refresh, not grow) |
| Archived listings (comps) | 200K → 1M+ | ~3-8 GB | Grows permanently |
| Embedding vectors | 200K-800K × 768D | ~1-3 GB | Grows with profiles |
| **Total Year 1** | — | **~15-25 GB** | — |

This fits comfortably in a Railway PostgreSQL instance. No sharding, no distributed DB, no special infrastructure needed for years.

### Data Lifecycle Rules

```
LISTING LIFECYCLE:
  New → Active (enriched, searchable)
  Active > 90 days unchanged → Stale (flagged, lower ranking)
  Active > 180 days unchanged → Archived (removed from search, kept as comp)
  Confirmed sold → Archived with transaction data (most valuable comp)
  User flags "listing dead" → Verify → Archive or remove

COMPANY PROFILE LIFECYCLE:
  Created → Basic (name, location, industry)
  Accessed by user → Enriched (ownership, financials, market context)
  Involved in active deal → Deep enrichment (full AI analysis)
  No access for 180 days → Dormant (skip re-enrichment cycles)
  Never delete — profiles accumulate value

CACHE LIFECYCLE:
  See BUILD_PLAN tiered caching: NAICS defs 365d, Census 90d, BLS 30d, FRED 24h
  Stale-while-revalidate: serve cached, refresh in background
```

---

## Brokers: Dual Role Architecture

Paul's insight: brokers aren't just sellers of businesses — they also represent buyers with mandates. The platform should serve both roles without requiring brokers to populate anything.

### Sell-Side Broker: "I have a business to sell"

```
Broker → Yulia: "I have a $5M HVAC company in Denver to sell"
  │
  ├── Yulia creates Company Profile from conversation
  ├── Enriches with market data (competitive density in Denver HVAC)
  ├── Provides preliminary valuation range
  ├── If broker submits as listing → enters Core DB with broker attribution
  │   └── Matched against ALL active buy theses → alerts sent to matching buyers
  └── Broker gets: faster sale, qualified buyer matches, market intelligence
```

### Buy-Side Broker: "I have a client looking for X"

```
Broker → Yulia: "My client wants to acquire dental practices in Florida, $2-8M"
  │
  ├── Yulia creates Buy Thesis (same as any buyer)
  ├── INSTANT: Searches Core DB for matching listings
  ├── ASYNC: Runs thesis-driven discovery across all sources
  ├── Provides results with full intelligence package
  ├── Ongoing: Daily/weekly scans for new matches → alert broker
  └── Broker gets: deal flow without manual sourcing, intelligence on each target
```

### The Key Principle: The Database Fills Itself

The system doesn't rely on any single source to populate data:

```
ORGANIC GROWTH FLYWHEEL:
  Seller starts conversation     → Company Profile created
  Buyer defines thesis           → Discovery agent finds companies → Profiles created
  Broker submits listing         → Listing + Profile created
  Broker submits mandate         → Discovery runs → Profiles created
  User saves external listing    → Listing + Profile created
  User views company             → Enrichment runs → Profile deepened
  
Each interaction makes the platform smarter and the database richer.
The data compounds WITHOUT requiring anyone to "feed" it.
```

---

## Handling Billion-Dollar M&A

The platform must feel robust whether the deal is $400K or $400M. Here's how the intelligence scales:

### Data Sources by Deal Tier

| Tier | Deal Size | Primary Data Sources | Ownership Intelligence |
|------|-----------|---------------------|----------------------|
| **Main Street** | $300K-$2M | BizBuySell, Census, SBA, BLS | Mostly owner-operator, SBA loan history |
| **Lower Middle** | $2M-$20M | Core DB + Crunchbase + Census | Mix of family, PE add-on candidates |
| **Middle Market** | $20M-$100M | EDGAR + Crunchbase + OpenCorporates | PE-held, family offices, strategic |
| **Upper Middle** | $100M-$500M | EDGAR + financial APIs + AI research | Public comps, PE platforms, strategic acquirers |
| **Large Cap** | $500M-$1B+ | EDGAR + full financial modeling | Public companies, PE mega-funds, cross-border |

### What Yulia Says at Each Tier

**$300K deal:**
> "This laundromat is listed at 2.8× SDE, which is at the top of the range for unattended laundries (2.0-3.0×). Census data shows 47 laundromats in this county serving 180K households — that's healthy density. SBA 7(a) at current rates would mean $2,400/month on 90% financing. The DSCR is 1.4× — bankable."

**$50M deal:**
> "This IT services company is positioned as a platform play. Crunchbase shows two PE-backed competitors in this segment (Accenture Federal acquired a similar company at 12× EBITDA in Q3 2025). EDGAR comps suggest 8-10× EBITDA is defensible for a company with 85%+ recurring revenue. Three add-on candidates exist within 100 miles. The seller is PE-backed by [Fund] since 2019 — likely approaching exit timeline."

**$500M deal:**
> "Based on SEC filings, the target's EBITDA margin has compressed from 22% to 18% over 3 years — worth understanding why. Public comp analysis across 8 peers shows median EV/EBITDA of 14.2×. The sector is consolidating: 4 transactions above $100M in the last 18 months. Key risk: customer concentration — top 3 clients represent 38% of revenue per the latest 10-K."

**Same platform. Same Yulia. Different depth, different sources, different cost per analysis.**

---

## Competitive Positioning After This Research

| Competitor | What They Do | What They DON'T Do | SMBX Advantage |
|-----------|-------------|-------------------|----------------|
| **Kumo** ($89-149/mo) | Aggregates listings, email alerts | No enrichment, no financing analysis, no transaction tools | Intelligence + transactions |
| **Baton** ($500-2K/mo seller) | Verified financials, Zestimate-style valuations | No aggregation for buyers, no thesis-driven search | Both sides + aggregation |
| **Grata** ($15-50K/yr) | 19M company profiles, semantic search, PE-focused | No SMB coverage, no SBA analysis, no transaction facilitation | Full-spectrum coverage |
| **Axial** ($2-8K/mo) | Closed broker network, confidential matching | No public data, no self-service, no intelligence layer | Open + intelligent + affordable |
| **PitchBook** ($30K+/yr) | 3M+ companies, deal tracking, fund data | No advisory, no SMB focus, no financing intelligence | Advisory + intelligence at 1% cost |

---

## Implementation Roadmap

### Phase 1: Core DB + Basic Search (Weeks 1-4 of Phase G/I)
**Cost: ~$50-100 one-time + ~$40/month ongoing**

- Ingest listings from BizBuySell + DealStream via Apify (~$50 one-time)
- Run Claude Haiku Batch enrichment on all listings (~$50-80 one-time)
- PostgreSQL full-text search with `tsvector` + GIN indexes
- Faceted filtering: industry, location, price, revenue, SBA eligibility
- Claude query parsing: natural language → structured filters ($1/month)
- Basic company_profiles table (created from listings)
- pgvector embeddings for semantic matching (~$1 one-time for 200K listings)

### Phase 2: Thesis-Driven Discovery (Weeks 5-8)
**Cost: ~$20-50/month additional**

- Buy thesis / buy box definition UI (from BUILD_PLAN Phase G)
- Thesis → Core DB matching (instant results)
- Scheduled thesis scans against new listings (daily, via pg-boss)
- Basic ownership detection pipeline (EDGAR + listing description parsing)
- Email alerts for thesis matches (Resend free tier)
- Company profile enrichment on access (lazy enrichment)

### Phase 3: External Search Agents (Weeks 9-12)
**Cost: ~$30-80/month additional**

- OpenCorporates integration (company discovery by industry + geography)
- Crunchbase free tier integration (PE/VC ownership detection)
- SEC EDGAR integration (public company financials + ownership)
- SBA loan history integration (data.sba.gov bulk download)
- Multi-source search orchestrator (parallel external queries)
- Result deduplication + merge pipeline
- Discovery results → Company Profile creation + caching

### Phase 4: Full Intelligence Engine (Month 4+)
**Cost: ~$50-150/month additional (scales with usage)**

- Seven-layer intelligence analysis per company/deal
- Ownership intelligence with confidence scoring
- Market opportunity detection (Census gaps + demand signals)
- Broker portal: submit listings AND buy mandates
- Weekly AI-generated market digests per thesis
- Comp database from archived listings + public transactions
- Sector-level shared intelligence (50-80% cost reduction)

### Total Infrastructure at Full Capability

| Component | Monthly Cost |
|-----------|-------------|
| Railway PostgreSQL (8GB, pgvector) | $40-60 |
| Railway Express server | $10-20 |
| Claude API (Yulia + enrichment + query parsing) | $50-100 |
| OpenAI Embeddings | $2-5 |
| Apify scraping (ongoing) | $20-30 |
| Email (Resend) | $0 (free tier) |
| Government data APIs | $0 |
| **Total** | **$122-215/month** |

---

## The Strategic Insight

**SMBX doesn't need to be Grata or PitchBook.** Those platforms spent tens of millions indexing every company. SMBX needs to be the platform that is *smarter about the deals that matter right now.*

The difference:
- **Grata/PitchBook:** "Here are 19 million companies. You figure out which matter."
- **SMBX:** "Based on your thesis, here are the 7 opportunities you should look at today, why they're a fit, whether they can be financed, and what your first offer should be."

The database grows organically from usage. Every seller conversation, every buyer thesis, every broker submission, every saved listing — each one adds to the intelligence graph. After 12 months with 500 active users, the platform will have compound knowledge about tens of thousands of companies, hundreds of market segments, and real transaction data that no competitor has at this price point.

**That's the moat. Not the size of the database — the depth of intelligence per record.**
