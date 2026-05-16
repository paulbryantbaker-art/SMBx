# CC IMPLEMENTATION BRIEF — V19 METHODOLOGY UPDATE

**Generated:** May 14, 2026
**Companion to:** `METHODOLOGY_V19.md`
**Repo:** `github.com/paulbryantbaker-art/SMBx`
**Stack:** React 19 + Vite 7 + Tailwind v3 + Express + PostgreSQL on Railway

**Purpose:** This brief specifies EVERY file change CC must make to bring the smbX.ai app in line with METHODOLOGY V19. No interpretation required. File paths, function signatures, constants, SQL, and prompt snippets are all explicit.

**Sequence:** Execute Section 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 in order. Each section is independent enough to commit + deploy + verify before moving to the next.

---

## TABLE OF CONTENTS

1. [DOCUMENT MIGRATION (replace V17/V18a/V18b references)](#section-1-document-migration)
2. [DATABASE MIGRATIONS (new tables + columns)](#section-2-database-migrations)
3. [CONSTANTS UPDATE (HSR 2026, OBBBA tax, SBA SOP, live data defaults)](#section-3-constants-update)
4. [CALC ENGINE EXTENSIONS (new models from V19 § 11)](#section-4-calc-engine-extensions)
5. [YULIA PROMPTS V4 (master prompt + journey prompts updated to V19)](#section-5-yulia-prompts-v4)
6. [TOOLS / AGENTIC EXTENSIONS (new Yulia tools for V19 models)](#section-6-tools-extensions)
7. [SERVICES: MARKET DATA + CITATION VALIDATOR + MODEL REGISTRY](#section-7-new-services)
8. [GATE REGISTRY: V19 MODEL STACK INJECTION](#section-8-gate-registry-updates)
9. [CLAUDE.md UPDATE (doc map for repo)](#section-9-claude-md-update)

---

## SECTION 1: DOCUMENT MIGRATION

### 1.1 Archive Superseded Docs

Move the following from `/methodology/` (or repo root, wherever they live) into `/methodology/_archive/`:
* `METHODOLOGY_V17.md` → `_archive/METHODOLOGY_V17.md`
* `METHODOLOGY_V18a_TAX_AMENDMENT.md` → `_archive/METHODOLOGY_V18a_TAX_AMENDMENT.md`
* `METHODOLOGY_V18b_LEGAL_AMENDMENT.md` → `_archive/METHODOLOGY_V18b_LEGAL_AMENDMENT.md`
* (also archive any duplicate variant: `U_S__M_and_A_Law__Legal_Awareness_Architecture_for_Yulia_AI_Deal_Team.md` → `_archive/`)

### 1.2 Add New Master

Place `METHODOLOGY_V19.md` (provided) at `/methodology/METHODOLOGY_V19.md`.

### 1.3 Find-and-Replace References

```bash
# In repo root, run:
grep -rl "METHODOLOGY_V17" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" .
grep -rl "METHODOLOGY_V18a" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" .
grep -rl "METHODOLOGY_V18b" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" .
```

For each match, replace the reference with `METHODOLOGY_V19`. Specifically:

**File: `CLAUDE.md`** — replace doc-map block to:
```
methodology:
  current: methodology/METHODOLOGY_V19.md
  archive:
    - methodology/_archive/METHODOLOGY_V17.md
    - methodology/_archive/METHODOLOGY_V18a_TAX_AMENDMENT.md
    - methodology/_archive/METHODOLOGY_V18b_LEGAL_AMENDMENT.md
  companions:
    - methodology/SMBX_DEAL_MODEL_CATALOG.md         # to be built
    - methodology/SMBX_LEGAL_TAX_ECONOMICS_CATALOG.md # to be built
    - methodology/SMBX_YULIA_MODEL_GATING_LOGIC.md    # to be built
prompts:
  current: server/prompts/YULIA_PROMPTS_V4.md
  archive:
    - server/prompts/_archive/YULIA_PROMPTS_V3.md
```

**File: `server/prompts/masterPrompt.ts`** — header comment that references methodology version. Replace `V17` with `V19`.

**File: `server/prompts/buildSystemPrompt.ts`** — any in-line text that references methodology version. Replace `V17` with `V19`.

---

## SECTION 2: DATABASE MIGRATIONS

Create new migration file `server/migrations/2026-05-14-v19-schema.sql`. Apply via the existing migration runner.

### 2.1 New Tables

```sql
-- =============================================================
-- V19 schema additions
-- =============================================================

-- L2 content database — versioned market data cache
CREATE TABLE IF NOT EXISTS market_data_cache (
  id            BIGSERIAL PRIMARY KEY,
  series_id     TEXT NOT NULL,
  value         NUMERIC NOT NULL,
  as_of_date    DATE NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source        TEXT NOT NULL,
  source_url    TEXT,
  cite_tag      TEXT NOT NULL,
  metadata      JSONB,
  UNIQUE (series_id, as_of_date)
);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_series
  ON market_data_cache(series_id, as_of_date DESC);

-- Citation registry — every cite_tag and its current verified value
CREATE TABLE IF NOT EXISTS citation_registry (
  id              BIGSERIAL PRIMARY KEY,
  cite_tag        TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL,        -- 'IRC' | 'TreasReg' | 'RevProc' | 'Notice' | 'ABA' | 'SRS' | 'ASC' | 'Case' | 'FRED' | 'FTC' | 'SBA' | 'OBBBA' | 'DGCL' | 'Damodaran' | 'Kroll' | 'Marsh' | 'Pepperdine' | 'GFData' | 'BizBuySell' | 'NYFed'
  description     TEXT NOT NULL,
  current_value   TEXT,                 -- for parametric citations (HSR, LTTER, etc.)
  source_url      TEXT,
  as_of_date      DATE,
  validated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'active'  -- 'active' | 'deprecated'
);

-- Model registry — every model version, hash, deployment state
CREATE TABLE IF NOT EXISTS model_registry (
  id              BIGSERIAL PRIMARY KEY,
  model_id        TEXT NOT NULL,        -- e.g., 'MODEL.LBO.PE.PRIMARY'
  version         TEXT NOT NULL,        -- e.g., '1.0', '1.1'
  hash            TEXT NOT NULL,
  deployed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deprecated_at   TIMESTAMPTZ,
  change_log      TEXT,
  test_status     TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'pass' | 'fail'
  hallucination_test_status TEXT,
  UNIQUE (model_id, version)
);

-- Audit trail — per Yulia response
CREATE TABLE IF NOT EXISTS audit_trail (
  id                  BIGSERIAL PRIMARY KEY,
  session_id          TEXT NOT NULL,
  deal_id             BIGINT,
  user_id             BIGINT,
  conversation_id     BIGINT,
  turn_id             TEXT NOT NULL,
  journey             TEXT,
  league              TEXT,
  deal_type           TEXT,
  model_stack         JSONB,            -- array of MODEL.X.Y.Z.vN
  inputs_used         JSONB,
  live_data_snapshots JSONB,
  citations_validated JSONB,            -- array of cite_tag strings
  mode_2_triggers     JSONB,            -- array of trigger codes (defer-to-counsel)
  output_hash         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_trail_deal ON audit_trail(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_session ON audit_trail(session_id, created_at DESC);

-- Composed model stack per deal
CREATE TABLE IF NOT EXISTS deal_model_stack (
  id              BIGSERIAL PRIMARY KEY,
  deal_id         BIGINT NOT NULL,
  journey         TEXT NOT NULL,
  league          TEXT NOT NULL,
  deal_type       TEXT NOT NULL,
  primary_models  JSONB NOT NULL,
  supporting      JSONB NOT NULL,
  tax_legal       JSONB NOT NULL,
  sensitivity     JSONB NOT NULL,
  composed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1
);

-- Tax position registry per deal
CREATE TABLE IF NOT EXISTS tax_position_registry (
  id              BIGSERIAL PRIMARY KEY,
  deal_id         BIGINT NOT NULL,
  deal_type       TEXT NOT NULL,        -- 'ASSET' | 'STOCK' | '338H10' | '336E' | 'FREORG' | '351' | '368A' | '368B' | '368C' | '368F' | '355'
  structure_notes TEXT,
  rollover_pct    NUMERIC,
  rollover_path   TEXT,                 -- 'TAXABLE' | '368' | '351' | '721' | 'FREORG_721'
  earnout_method  TEXT,                 -- 'DETERMINISTIC' | 'PROBABILITY' | 'MONTE_CARLO' | 'BLACK_SCHOLES'
  qsbs_eligible   BOOLEAN,
  qsbs_state_conformity TEXT,           -- 'FULL' | 'NONE' | 'PARTIAL_50' | 'NJ_POST_2026' | 'DC_DECOUPLED'
  s382_relevant   BOOLEAN,
  s163j_relevant  BOOLEAN,
  s168k_pct       NUMERIC DEFAULT 100,  -- 100 post-Jan 19 2025 unless elected lower
  international   BOOLEAN DEFAULT FALSE,
  notes_jsonb     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legal defer log
CREATE TABLE IF NOT EXISTS legal_defer_log (
  id              BIGSERIAL PRIMARY KEY,
  deal_id         BIGINT,
  session_id      TEXT,
  trigger_code    TEXT NOT NULL,        -- references § 10.24 always-halt codes (e.g., 'HALT_MAE_OPINION', 'HALT_QSBS_QUAL', 'HALT_HSR_FORM_RESPONSIVENESS')
  context_text    TEXT,
  briefing_packet JSONB,                -- structured packet routed to counsel
  user_id         BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2 New Columns on Existing Tables

```sql
-- Deals: add V19 fields
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS league          TEXT,             -- 'L1' through 'L10'
  ADD COLUMN IF NOT EXISTS deal_type       TEXT,
  ADD COLUMN IF NOT EXISTS jurisdiction    TEXT,             -- target state
  ADD COLUMN IF NOT EXISTS buyer_state     TEXT,
  ADD COLUMN IF NOT EXISTS naics_6digit    TEXT,
  ADD COLUMN IF NOT EXISTS sic_code        TEXT,
  ADD COLUMN IF NOT EXISTS entity_type     TEXT,             -- 'CCORP' | 'SCORP' | 'LLC_PARTNERSHIP' | 'LLC_DISREGARDED' | 'SOLE_PROP'
  ADD COLUMN IF NOT EXISTS s_election_years INT,             -- for S-corps, years since S election
  ADD COLUMN IF NOT EXISTS rollover_pct    NUMERIC,
  ADD COLUMN IF NOT EXISTS earnout_present BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rwi_eligible    BOOLEAN;

-- Conversations: add gate + journey state
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS current_gate    TEXT,
  ADD COLUMN IF NOT EXISTS journey         TEXT,
  ADD COLUMN IF NOT EXISTS league          TEXT;
```

### 2.3 Seed Citation Registry

After tables created, run seed insert from `server/seeds/v19_citation_registry.sql`. Content:

```sql
INSERT INTO citation_registry (cite_tag, category, description, current_value, source_url, as_of_date) VALUES
  -- HSR 2026
  ('[FTC 2026 HSR — Size of Transaction]', 'FTC', '2026 HSR Size of Transaction threshold', '$133.9M', 'https://www.ftc.gov/...', '2026-02-17'),
  ('[FTC 2026 HSR — Size of Person]', 'FTC', '2026 HSR Size of Person threshold', '$267.8M / $26.8M', 'https://www.ftc.gov/...', '2026-02-17'),
  ('[FTC 2026 HSR — Auto-Reportable]', 'FTC', '2026 HSR auto-reportable', '$535.5M', 'https://www.ftc.gov/...', '2026-02-17'),
  ('[FTC 2026 HSR — Filing Fee Top]', 'FTC', '2026 HSR top tier filing fee', '$2.46M', 'https://www.ftc.gov/...', '2026-02-17'),
  -- OBBBA
  ('[OBBBA §70301]', 'OBBBA', '§168(k) 100% bonus depreciation permanent', '100% post Jan 19 2025', 'https://www.congress.gov/...', '2025-07-04'),
  ('[OBBBA §70302]', 'OBBBA', '§163(j) ATI EBITDA-based permanent', 'EBITDA-based post Dec 31 2024', 'https://www.congress.gov/...', '2025-07-04'),
  ('[OBBBA §70307]', 'OBBBA', '§168(n) Qualified Production Property', '100% post Jul 4 2025', 'https://www.congress.gov/...', '2025-07-04'),
  ('[OBBBA §70322]', 'OBBBA', 'NCTI/FDDEI/BEAT permanent rates', '12.6% NCTI; ~14% FDDEI; 10.5% BEAT', 'https://www.congress.gov/...', '2025-07-04'),
  ('[OBBBA §70425]', 'OBBBA', '§1202 QSBS expanded', '$15M/10x cap; $75M assets; tiered 3/4/5 yr', 'https://www.congress.gov/...', '2025-07-04'),
  ('[OBBBA §70505]', 'OBBBA', 'SALT cap raised', '$40K 2025; phaseout >$500K; reverts 2030', 'https://www.congress.gov/...', '2025-07-04'),
  -- §382 LTTER (current)
  ('[Rev. Rul. 2026-9]', 'RevRul', '§382 LTTER May 2026', '3.65%', 'https://www.irs.gov/irb/', '2026-05-01'),
  ('[Rev. Rul. 2026-03]', 'RevRul', '§382 LTTER Feb 2026', '3.56%', 'https://www.irs.gov/irb/', '2026-02-01'),
  ('[Rev. Rul. 2026-02]', 'RevRul', '§382 LTTER Jan 2026', '3.51%', 'https://www.irs.gov/irb/', '2026-01-01'),
  -- SBA
  ('[SBA SOP 50 10 8]', 'SBA', 'Current SBA SOP', 'Effective Jun 1 2025 + Dec 2025 + Feb 2026 updates', 'https://www.sba.gov/...', '2025-06-01'),
  -- Damodaran
  ('[Damodaran 2026]', 'Damodaran', 'Damodaran ERP / Beta / Multiples', 'ERP 4.23% Jan 2026', 'https://pages.stern.nyu.edu/~adamodar/', '2026-01-01'),
  ('[Kroll 2024]', 'Kroll', 'Kroll Recommended ERP', '5.00% since Jun 5 2024', NULL, '2024-06-05'),
  -- ABA + SRS
  ('[ABA 2025]', 'ABA', 'ABA Private Target Deal Points Study 2025', '139 deals 2024-Q1 2025; $25-900M', NULL, '2025-12-16'),
  ('[SRS 2025]', 'SRS', 'SRS Acquiom 2025 M&A Deal Terms Study', '2200+ deals; $505B', NULL, '2025-12-01'),
  ('[Marsh TRI 2025]', 'Marsh', 'Marsh Transactional Risk Insurance Report 2025', 'NA ROL +16% YoY; Q4 2025 avg 3.23%', NULL, '2026-01-15'),
  ('[Pepperdine PCAP 2025]', 'Pepperdine', 'Pepperdine Private Capital Markets Project 2025', 'Sep 12 2025', 'https://digitalcommons.pepperdine.edu/gsbm_pcm_pcmr/18', '2025-09-12'),
  -- FRED live data — placeholder rows; values update via refresh job
  ('[FRED:SOFR]', 'FRED', 'Secured Overnight Financing Rate', 'live', 'https://fred.stlouisfed.org/series/SOFR', NULL),
  ('[FRED:DGS10]', 'FRED', '10-Year Treasury Constant Maturity', 'live', 'https://fred.stlouisfed.org/series/DGS10', NULL),
  ('[FRED:BAMLH0A0HYM2]', 'FRED', 'ICE BofA US HY OAS', 'live', 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2', NULL),
  ('[FRED:BAMLC0A0CM]', 'FRED', 'ICE BofA US IG OAS', 'live', 'https://fred.stlouisfed.org/series/BAMLC0A0CM', NULL),
  ('[FRED:VIXCLS]', 'FRED', 'VIX', 'live', 'https://fred.stlouisfed.org/series/VIXCLS', NULL),
  ('[FRED:DPRIME]', 'FRED', 'Bank Prime Rate', 'live', 'https://fred.stlouisfed.org/series/DPRIME', NULL),
  ('[FRED:EFFR]', 'FRED', 'Effective Federal Funds Rate', 'live', 'https://fred.stlouisfed.org/series/EFFR', NULL)
ON CONFLICT (cite_tag) DO UPDATE
  SET current_value = EXCLUDED.current_value,
      as_of_date = EXCLUDED.as_of_date,
      validated_at = NOW();
```

---

## SECTION 3: CONSTANTS UPDATE

### 3.1 New File: `server/constants/v19Regulatory.ts`

Create this file. Contents:

```typescript
// V19 Regulatory Constants — refreshed for 2026
// Source: METHODOLOGY_V19.md § 7.4

export const HSR_2026 = {
  EFFECTIVE_DATE: '2026-02-17',
  SIZE_OF_TRANSACTION: 133_900_000,
  SIZE_OF_PERSON_LARGE: 267_800_000,
  SIZE_OF_PERSON_SMALL: 26_800_000,
  AUTO_REPORTABLE: 535_500_000,
  FILING_FEE_TIER_1: 30_000,        // $133.9M–<$200M
  FILING_FEE_TIER_TOP: 2_460_000,   // top tier
  CLAYTON_8_LARGE: 54_402_000,
  CLAYTON_8_SMALL: 5_440_200,
  CIVIL_PENALTY_PER_DAY: 53_088
} as const;

export const SBA_SOP_50_10_8 = {
  EFFECTIVE_DATE: '2025-06-01',
  LATEST_UPDATE: '2026-02-01',   // Procedural Notice 5000-876441
  LOAN_7A_MAX: 5_000_000,
  LOAN_7A_SMALL_LOAN_CAP: 350_000,    // reduced from 500K
  LOAN_504_DEBENTURE_MAX: 5_500_000,
  EQUITY_INJECTION_PCT: 0.10,
  SELLER_NOTE_MAX_PCT_OF_EQUITY: 0.50,
  SELLER_NOTE_STANDBY_YEARS: 10,
  CITIZENSHIP_PCT: 1.00,
  CITIZENSHIP_CARVE_OUT_PCT: 0.05,
  ROLLOVER_PERSONAL_GUARANTEE_YEARS: 2,
  DSCR_SBA_FLOOR: 1.15,
  DSCR_LENDER_STD: 1.25,
  DSCR_BUSINESS_ACQ_STD: 1.50,
  PREPAY_PENALTY_Y1: 0.05,
  PREPAY_PENALTY_Y2: 0.03,
  PREPAY_PENALTY_Y3: 0.01,
  ALL_IN_RATE_LOW: 0.0725,
  ALL_IN_RATE_HIGH: 0.0975
} as const;

export const OBBBA = {
  ENACTED: '2025-07-04',
  S168K_PERMANENT_PCT: 1.00,
  S168K_EFFECTIVE_DATE: '2025-01-19',
  S168K_OPT_OUT_PCT: 0.40,
  S168K_OPT_OUT_LPP_PCT: 0.60,
  S168N_QPP_PERMANENT_PCT: 1.00,
  S168N_CONSTRUCTION_START_AFTER: '2025-01-19',
  S168N_CONSTRUCTION_START_BEFORE: '2029-01-01',
  S168N_PIS_AFTER: '2025-07-04',
  S168N_PIS_BEFORE: '2031-01-01',
  S163J_ATI_BASIS: 'EBITDA',
  S163J_ATI_EFFECTIVE_AFTER: '2024-12-31',
  QSBS_CAP_EXCLUSION: 15_000_000,
  QSBS_CAP_MULTIPLE: 10,
  QSBS_GROSS_ASSETS_CEILING: 75_000_000,
  QSBS_TIER_3YR_PCT: 0.50,
  QSBS_TIER_4YR_PCT: 0.75,
  QSBS_TIER_5YR_PCT: 1.00,
  QSBS_NON_EXCLUDED_RATE: 0.28,
  QSBS_NEW_REGIME_AFTER: '2025-07-04',
  NCTI_ETR: 0.126,
  NCTI_FTC_PCT: 0.90,
  FDDEI_ETR_APPROX: 0.14,
  BEAT_PERMANENT_RATE: 0.105,
  SALT_CAP_2025: 40_000,
  SALT_MAGI_PHASEOUT_START: 500_000,
  SALT_REVERT_YEAR: 2030,
  SALT_REVERT_VALUE: 10_000
} as const;

export const S382_LTTER_CURRENT = {
  '2026-01': 0.0351,  // Rev. Rul. 2026-02
  '2026-02': 0.0356,  // Rev. Rul. 2026-03
  '2026-05': 0.0365,  // Rev. Rul. 2026-9
  // Refreshed monthly via refresh_irs_ltter_monthly job
};

export const CFIUS = {
  DECLARATION_DAYS: 30,
  NOTICE_INITIAL_DAYS: 45,
  NOTICE_REVIEW_DAYS: 45,
  NOTICE_PRESIDENT_DAYS: 15,
  NOTICE_TOTAL_MAX_DAYS: 105,
  FILING_FEE_CAP_PCT: 0.01,
  FILING_FEE_CAP_ABS: 300_000,
  PENALTY_CAP_PER_VIOLATION: 5_000_000
} as const;

export const RWI_MARKET_2026 = {
  ROL_AVG_MIN: 0.025,
  ROL_AVG_MAX: 0.030,
  ROL_Q4_2025_AVG: 0.0323,        // Lockton
  RETENTION_PCT_EV_LOW: 0.005,
  RETENTION_PCT_EV_HIGH: 0.0075,
  RETENTION_PCT_EV_SUB_500M: 0.01,
  RETENTION_DROP_AFTER_12MO: 0.004,
  COVERAGE_PCT_EV_TYPICAL: 0.10,
  UNDERWRITING_FEE_MIN: 30_000,
  UNDERWRITING_FEE_MAX: 80_000,
  UNDERWRITING_WEEKS: 5,
  DD_CALL_HOURS: 3,
  NOTIFICATION_RATE: 0.20,
  PAYMENT_RATE: 0.04,
  FULL_LIMIT_REACHED_RATE: 0.25
} as const;
```

### 3.2 New File: `server/constants/v19Leagues.ts`

```typescript
// V19 League Classification — Extended L1–L10
// Source: METHODOLOGY_V19.md § 3.1

export type League = 'L1'|'L2'|'L3'|'L4'|'L5'|'L6'|'L7'|'L8'|'L9'|'L10';

export interface LeagueSpec {
  code: League;
  ebitdaMin: number;   // -1 means N/A (SDE used)
  ebitdaMax: number;   // -1 means unbounded
  sdeMin: number;      // -1 means N/A (EBITDA used)
  sdeMax: number;
  revMin: number;
  revMax: number;
  multipleFloor: number;
  multipleCeil: number;
  primaryMetric: 'SDE' | 'EBITDA';
  buyerProfile: string;
  financing: string;
  modelStackComplexity: 'LIGHT' | 'LIGHT_MED' | 'MEDIUM' | 'MEDIUM_HEAVY' | 'HEAVY' | 'MEGA' | 'MEGA_PLUS' | 'MEGA_PLUS_PLUS' | 'MEGA_PLUS_PLUS_PLUS';
}

export const LEAGUES: Record<League, LeagueSpec> = {
  L1: { code: 'L1',  ebitdaMin: -1, ebitdaMax: -1, sdeMin: 0, sdeMax: 300_000, revMin: 0, revMax: 1_000_000, multipleFloor: 1.8, multipleCeil: 3.5, primaryMetric: 'SDE', buyerProfile: 'Individual operator', financing: 'SBA 7(a) Small Loan + seller note', modelStackComplexity: 'LIGHT' },
  L2: { code: 'L2',  ebitdaMin: -1, ebitdaMax: -1, sdeMin: 300_000, sdeMax: 1_000_000, revMin: 1_000_000, revMax: 5_000_000, multipleFloor: 2.5, multipleCeil: 4.5, primaryMetric: 'SDE', buyerProfile: 'Searcher, individual', financing: 'SBA 7(a) up to $5M + seller note', modelStackComplexity: 'LIGHT_MED' },
  L3: { code: 'L3',  ebitdaMin: 1_000_000, ebitdaMax: 5_000_000, sdeMin: -1, sdeMax: -1, revMin: 5_000_000, revMax: 25_000_000, multipleFloor: 4.0, multipleCeil: 6.5, primaryMetric: 'EBITDA', buyerProfile: 'Independent sponsor, search fund', financing: 'SBA + mezz + sponsor equity', modelStackComplexity: 'MEDIUM' },
  L4: { code: 'L4',  ebitdaMin: 5_000_000, ebitdaMax: 25_000_000, sdeMin: -1, sdeMax: -1, revMin: 25_000_000, revMax: 100_000_000, multipleFloor: 5.5, multipleCeil: 8.5, primaryMetric: 'EBITDA', buyerProfile: 'Lower-middle-market PE', financing: 'Unitranche + sponsor + rollover', modelStackComplexity: 'MEDIUM_HEAVY' },
  L5: { code: 'L5',  ebitdaMin: 25_000_000, ebitdaMax: 100_000_000, sdeMin: -1, sdeMax: -1, revMin: 100_000_000, revMax: 500_000_000, multipleFloor: 7.0, multipleCeil: 10.5, primaryMetric: 'EBITDA', buyerProfile: 'Middle-market PE', financing: 'TLB + 2L/mezz + sponsor + rollover', modelStackComplexity: 'HEAVY' },
  L6: { code: 'L6',  ebitdaMin: 100_000_000, ebitdaMax: 250_000_000, sdeMin: -1, sdeMax: -1, revMin: 500_000_000, revMax: 2_000_000_000, multipleFloor: 8.5, multipleCeil: 12.5, primaryMetric: 'EBITDA', buyerProfile: 'Upper-middle-market PE', financing: 'Syndicated TLB + 2L + sponsor + cov-lite', modelStackComplexity: 'HEAVY' },
  L7: { code: 'L7',  ebitdaMin: 250_000_000, ebitdaMax: 1_000_000_000, sdeMin: -1, sdeMax: -1, revMin: 2_000_000_000, revMax: 10_000_000_000, multipleFloor: 9.5, multipleCeil: 14.0, primaryMetric: 'EBITDA', buyerProfile: 'Mega-fund PE, strategic', financing: 'Syndicated TLB + HY + mezz + sponsor', modelStackComplexity: 'MEGA' },
  L8: { code: 'L8',  ebitdaMin: 1_000_000_000, ebitdaMax: 5_000_000_000, sdeMin: -1, sdeMax: -1, revMin: 10_000_000_000, revMax: 50_000_000_000, multipleFloor: 10.5, multipleCeil: 15.5, primaryMetric: 'EBITDA', buyerProfile: 'Mega-cap PE consortium, strategic', financing: 'Mega TLB + HY + 2L + jumbo sponsor equity', modelStackComplexity: 'MEGA_PLUS' },
  L9: { code: 'L9',  ebitdaMin: 5_000_000_000, ebitdaMax: 25_000_000_000, sdeMin: -1, sdeMax: -1, revMin: 50_000_000_000, revMax: 250_000_000_000, multipleFloor: 11.5, multipleCeil: 18.0, primaryMetric: 'EBITDA', buyerProfile: 'Mega consortium, strategic mega-merger', financing: 'Multi-tranche HY+TLB+bridge', modelStackComplexity: 'MEGA_PLUS_PLUS' },
  L10:{ code: 'L10', ebitdaMin: 25_000_000_000, ebitdaMax: Number.POSITIVE_INFINITY, sdeMin: -1, sdeMax: -1, revMin: 250_000_000_000, revMax: Number.POSITIVE_INFINITY, multipleFloor: 12.0, multipleCeil: 20.0, primaryMetric: 'EBITDA', buyerProfile: 'Mega strategic, hostile / public M&A', financing: 'Bridge + permanent debt + equity + spin', modelStackComplexity: 'MEGA_PLUS_PLUS_PLUS' }
};

export function classifyLeague(
  ebitda: number | null,
  sde: number | null,
  revenue: number | null
): League {
  // Primary: EBITDA for L3+
  if (ebitda !== null && ebitda >= 1_000_000) {
    for (const lg of ['L3','L4','L5','L6','L7','L8','L9','L10'] as League[]) {
      const spec = LEAGUES[lg];
      if (ebitda >= spec.ebitdaMin && ebitda < spec.ebitdaMax) return lg;
    }
    return 'L10';
  }
  // Fallback to SDE for L1/L2
  if (sde !== null) {
    if (sde < 300_000) return 'L1';
    if (sde < 1_000_000) return 'L2';
  }
  // Last-resort revenue heuristic
  if (revenue !== null) {
    if (revenue < 1_000_000) return 'L1';
    if (revenue < 5_000_000) return 'L2';
    if (revenue < 25_000_000) return 'L3';
    if (revenue < 100_000_000) return 'L4';
    if (revenue < 500_000_000) return 'L5';
    if (revenue < 2_000_000_000) return 'L6';
    if (revenue < 10_000_000_000) return 'L7';
    if (revenue < 50_000_000_000) return 'L8';
    if (revenue < 250_000_000_000) return 'L9';
    return 'L10';
  }
  return 'L2';  // safe default
}
```

### 3.3 Update Existing League Constants

If a league enum exists currently (e.g., `server/constants/leagues.ts`), DEPRECATE it. Imports should switch to `server/constants/v19Leagues.ts`. Run:
```bash
grep -rl "from '.*leagues'" server/ | xargs sed -i "s|from '.*leagues'|from './v19Leagues'|g"
# Note: adjust import path resolution per actual repo layout
```

---

## SECTION 4: CALC ENGINE EXTENSIONS

### 4.1 Existing Engine Location

Per project knowledge: `server/services/calcEngine.ts` (or client-shared module) contains the existing 22-formula calc engine with functions:
* `calculateSDE`
* `calculateValuationRange`
* `calculateIRR`
* `calculateMOIC`
* `calculateDSCR`
* `buildProForma`
* `calculateSBAEligibility`
* `calculateAmortization`
* `calculateDilution`
* `calculateWaterfall`
* `buildSensitivityMatrix`
* (plus 10 others)

### 4.2 Refactor: Model Registry Pattern

The current engine is a flat collection of functions. V19 requires every model to register with a stable ID + version.

Create `server/services/modelRegistry.ts`:

```typescript
// V19 Model Registry — stable IDs + version pinning per METHODOLOGY_V19 § 11

export interface ModelDescriptor {
  id: string;                  // e.g., 'MODEL.LBO.PE.PRIMARY'
  version: string;             // e.g., '1.0'
  category: 'VAL' | 'LBO' | 'MERGER' | 'CAPTABLE' | 'DEBT' | 'STRUCT' | 'TAX' | 'LEGAL' | 'PROCESS' | 'EXIT' | 'PMI' | 'DISTRESS' | 'DOC';
  description: string;
  inputs: string[];            // schema doc reference
  outputs: string[];
  citeTags: string[];          // required citations for output
  execute: (input: any) => any;
}

const REGISTRY = new Map<string, ModelDescriptor>();

export function registerModel(descriptor: ModelDescriptor): void {
  const key = `${descriptor.id}.v${descriptor.version}`;
  if (REGISTRY.has(key)) throw new Error(`Model ${key} already registered`);
  REGISTRY.set(key, descriptor);
}

export function getModel(idWithVersion: string): ModelDescriptor | undefined {
  return REGISTRY.get(idWithVersion);
}

export function listModels(category?: ModelDescriptor['category']): ModelDescriptor[] {
  const all = Array.from(REGISTRY.values());
  return category ? all.filter(m => m.category === category) : all;
}

export function executeModel(idWithVersion: string, input: any): any {
  const model = getModel(idWithVersion);
  if (!model) throw new Error(`Model not registered: ${idWithVersion}`);
  return model.execute(input);
}
```

### 4.3 Refactor Existing Functions into Registered Models

For each existing function, wrap into a `ModelDescriptor` registration. Example — for `calculateSDE`:

`server/services/models/val/MODEL.VAL.SDE.v1.ts`:
```typescript
import { registerModel } from '../../modelRegistry';
import { calculateSDE as legacy_calculateSDE } from '../../calcEngine';

registerModel({
  id: 'MODEL.VAL.SDE',
  version: '1.0',
  category: 'VAL',
  description: 'SDE-based valuation (multiple × SDE) for L1–L2',
  inputs: ['netIncome', 'ownerComp', 'ownerBenefits', 'interestExpense', 'depreciation', 'amortization', 'nonRecurring', 'discretionary', 'replacementCompIfNonOperator', 'multiple'],
  outputs: ['sde', 'sdeMultiple', 'evRange'],
  citeTags: ['[BizBuySell Q1 2026]'],
  execute: (input) => legacy_calculateSDE(input)
});
```

Repeat for all existing 22 formulas, mapping to V19 model IDs per § 11. Suggested mapping (build out registration files in `server/services/models/`):

| Existing Function | V19 Model ID |
|---|---|
| `calculateSDE` | MODEL.VAL.SDE.v1 |
| `calculateValuationRange` | MODEL.VAL.TRIANGULATION.v1 |
| `calculateIRR` | (used by multiple — keep as helper, not standalone model) |
| `calculateMOIC` | (helper) |
| `calculateDSCR` | (used by DSCR.STRESS and LBO.SBA) |
| `buildProForma` | (helper) |
| `calculateSBAEligibility` | MODEL.LBO.SBA.v1 |
| `calculateAmortization` | (helper) |
| `calculateDilution` | MODEL.DILUTION.v1 |
| `calculateWaterfall` | MODEL.LIQPREF.v1 |
| `buildSensitivityMatrix` | (used by all models for sensitivity output) |
| (Remaining 11) | Map per Catalog § 11 — file 1 per model |

### 4.4 New Models to Implement (Priority List for Tier 0)

Implement these new models for V19 launch (in `server/services/models/`):

**Phase 1 (Tier 0 launch — must ship):**
* `MODEL.VAL.EBITDA.v1` — adj EBITDA × multiple
* `MODEL.LBO.LMM.v1` — unitranche + sponsor + rollover
* `MODEL.LBO.PE.PRIMARY.v1` — TLA+TLB+revolver+sponsor multi-tranche
* `MODEL.STRUCT.PPA.v1` — §1060 Class I–VII allocation optimizer
* `MODEL.TAX.168K.v1` — 100% bonus dep PV (post-OBBBA)
* `MODEL.TAX.382.NOL.v1` — current LTTER pull + limit calc
* `MODEL.TAX.163J.v1` — EBITDA-based ATI cap
* `MODEL.TAX.1202.QSBS.v1` — tiered exclusion + state conformity
* `MODEL.STRUCT.ROLLOVER.v1` — pathway optimizer (taxable/§368/§351/§721/F-reorg)
* `MODEL.STRUCT.EARNOUT.MC.v1` — 10K Monte Carlo (ASC 805 default)
* `MODEL.STRUCT.NWC.PEG.v1` — LTM avg / normalized / seasonality-adj
* `MODEL.LEGAL.INDEM.v1` — cap × basket × survival → $ exposure
* `MODEL.LEGAL.RWI.PRICING.v1` — current Marsh ROL band + retention
* `MODEL.LEGAL.MAE.FRAMEWORK.v1` — Akorn standard surfacing (refuses to opine)
* `MODEL.HSR.TRIAGE.v1` — 2026 threshold + filing tier
* `MODEL.DSCR.STRESS.v1` — rev −10/−20/−30%, +200bps SOFR
* `MODEL.SOURCES.USES.v1` — funding gap detection
* `MODEL.VAL.TRIANGULATION.v1` — multi-method weighted valuation
* `MODEL.STRUCT.FREORG.v1` — F-Reorg QSub sequence (S-corp targets)
* `MODEL.STRUCT.338H10.v1` — §338(h)(10) economic equivalence + gross-up

**Phase 2 (Post-launch additions):**
* `MODEL.VAL.DCF.TWOSTAGE.v1` — 5/10-yr explicit + terminal value
* `MODEL.VAL.WACC.MODCAPM.v1` — Modified CAPM with size + industry + alpha
* `MODEL.VAL.WACC.BUILDUP.v1` — Build-Up Method
* `MODEL.MIP.v1` — 10% pool, vesting, performance hurdles
* `MODEL.SYNERGY.CURVE.v1` — McKinsey / Bain curves
* `MODEL.LBO.ADDON.v1` — add-on with synergies
* `MODEL.LBO.DIVRECAP.v1` — dividend recap
* `MODEL.CAPTABLE.v1` — full cap table with anti-dilution
* `MODEL.SAFE.POSTMONEY.v1` — post-money SAFE (YC 2018 standard)
* `MODEL.WARRANT.BS.v1` — Black-Scholes warrant valuation
* `MODEL.STRUCT.EARNOUT.DETERM.v1` / `EARNOUT.PROB.v1` / `EARNOUT.BS.v1`
* `MODEL.TAX.280G.v1` — parachute calc + cleansing vote
* `MODEL.TAX.168N.QPP.v1` — QPP 100% expensing
* `MODEL.TAX.COSTSEG.v1` — cost seg NPV
* `MODEL.STRUCT.NETDEBT.v1` — cash-free debt-free conversion
* `MODEL.STRUCT.NWC.TRUEUP.v1` — true-up mechanics

**Phase 3 (Mega-cap):**
* All MEGA models (MODEL.LBO.PE.MEGA, MODEL.MERGER.TAKEPRIVATE, MODEL.EXIT.DUALTRACK, etc.)

### 4.5 Calc Engine Skeleton for New Model

Template (use for each new model file):

```typescript
// server/services/models/{category}/MODEL.{ID}.v1.ts
import { registerModel } from '../../modelRegistry';

export interface ModelXInput {
  // explicit schema fields with types
}

export interface ModelXOutput {
  // explicit schema fields with types
  audit: {
    citeTags: string[];
    inputsHash: string;
    timestamp: string;
  };
}

function executeModelX(input: ModelXInput): ModelXOutput {
  // Pure function — no LLM, no random, deterministic
  // ...
}

registerModel({
  id: 'MODEL.{ID}',
  version: '1.0',
  category: '{CATEGORY}',
  description: '...',
  inputs: [/* ... */],
  outputs: [/* ... */],
  citeTags: [/* required citations */],
  execute: executeModelX
});
```

### 4.6 Worked Skeleton — `MODEL.TAX.382.NOL.v1`

`server/services/models/tax/MODEL.TAX.382.NOL.v1.ts`:
```typescript
import { registerModel } from '../../modelRegistry';
import { S382_LTTER_CURRENT } from '../../../constants/v19Regulatory';
import { fetchCurrentLTTER } from '../../marketDataService';

export interface Tax382Input {
  fmvEquityAtChangeDate: number;
  monthOfChange: string;           // 'YYYY-MM'
  preChangeContributionsLast2Yrs?: number; // §382(l)(1) anti-stuffing
}

export interface Tax382Output {
  ltter: number;
  ltterSource: string;             // e.g., 'Rev. Rul. 2026-9'
  fmvEquityAdjusted: number;       // FMV equity after §382(l)(1) reduction
  annualLimit: number;
  audit: {
    citeTags: string[];
    inputsHash: string;
    timestamp: string;
  };
}

async function executeTax382(input: Tax382Input): Promise<Tax382Output> {
  const ltterData = await fetchCurrentLTTER(input.monthOfChange);
  const adjustment = input.preChangeContributionsLast2Yrs ?? 0;
  const fmvAdjusted = Math.max(0, input.fmvEquityAtChangeDate - adjustment);
  const annualLimit = fmvAdjusted * ltterData.value;

  return {
    ltter: ltterData.value,
    ltterSource: ltterData.citeTag,
    fmvEquityAdjusted: fmvAdjusted,
    annualLimit,
    audit: {
      citeTags: ['[IRC §382]', ltterData.citeTag],
      inputsHash: '',  // compute SHA-256 of inputs
      timestamp: new Date().toISOString()
    }
  };
}

registerModel({
  id: 'MODEL.TAX.382.NOL',
  version: '1.0',
  category: 'TAX',
  description: '§382 NOL annual limitation calculator with current LTTER',
  inputs: ['fmvEquityAtChangeDate', 'monthOfChange', 'preChangeContributionsLast2Yrs?'],
  outputs: ['ltter', 'fmvEquityAdjusted', 'annualLimit'],
  citeTags: ['[IRC §382]', '[Rev. Rul. — current LTTER]'],
  execute: executeTax382
});
```

(Replicate this pattern for the remaining Tier 0 models per § 4.4.)

---

## SECTION 5: YULIA PROMPTS V4

### 5.1 New File: `server/prompts/YULIA_PROMPTS_V4.md`

Archive existing `YULIA_PROMPTS_V3.md` to `server/prompts/_archive/`. Create new V4 file. V4 inherits V3 structure and updates these sections:

#### 5.1.1 Master System Prompt — Add V19 Block

Update master prompt to include this block (insert after IDENTITY RULES section):

```
=================================================================
V19 ARCHITECTURE CONSTRAINTS (THE LINE — NEVER VIOLATE)
=================================================================

You operate under the V19 Six-Layer Orchestration Stack:
  L1 — Deterministic Calc Engine (all numerics)
  L2 — Versioned Content DB (parameters, citations)
  L3 — Forensic Auditor (NotebookLM — GROUNDED_ONLY)
  L4 — You (Author)
  L5 — Market Intelligence (search-grounded)
  L6 — Citation Validator (pre-publish gate)

HARD RULES (violation = catastrophic failure):

1. DEFER-TO-CALC: You NEVER mint a number. Every numeric value in your output
   must come from a registered L1 model or L2 content DB lookup. If a calc
   isn't available, say: "I don't have a registered model for that. Here's the
   structure we'd need to build it..."

2. DEFER-TO-CITATION: You NEVER make a legal or tax factual claim without a
   citation tag. Untagged factual claims will be stripped by L6 before publish.

3. ANALYSIS → OPTIONS → IMPLICATIONS → USER DECIDES: Every recommendation-shaped
   output follows this structure. You do NOT recommend. You surface options and
   ask the user to choose.

4. MODE 2 DEFER-TO-COUNSEL: For any of the 15 always-halt categories
   (METHODOLOGY_V19 § 10.24), you HALT substantive output, surface the
   framework, identify the issue, and generate a defer-to-counsel briefing
   packet. Categories include: MAE opinion on specific facts, §1202 qualification
   opinion, §382 NUBIG/NUBIL on specific assets, HSR Item 4(c)/(d)
   responsiveness, CFIUS mandatory determination, controller MFW ab initio,
   securities exemption opinion, anything labeled "opinion of counsel."

5. MODE 3 RESEARCH-EXTERNALLY: For any of these high-churn categories,
   fetch current source before answering: HSR thresholds, SBA SOP version,
   Reg D/A/CF current limits, state non-compete statutes, state premerger
   notification statutes, state privacy laws, cannabis scheduling, CFIUS
   outbound investment, §382 LTTER (monthly), §168(k) status, Delaware
   case law, EU AI Act guidance.

6. NO HALLUCINATION ON: §351 vs §368 conflation, §168(k) phase-down assumption
   (it is 100% PERMANENT post Jan 19 2025), §163(j) EBIT vs EBITDA (EBITDA
   permanent post Dec 31 2024), §1202 stale parameters (post Jul 4 2025: $15M
   or 10x cap, $75M assets, tiered 50/75/100% at 3/4/5 yrs), §382 stale LTTER
   (~3.5%+ current), fabricated Rev Procs / case citations, "Term Loan C"
   (NOT standard), Pre vs post-money SAFE math, FTC noncompete rule (DEAD
   since Sep 5 2025 — state law controls).

7. CITATION TAGS: When you reference a legal/tax/market fact, include the
   citation tag in your output. L6 validator will check tags pre-publish.
   Format: [V19§X], [IRC §X], [Rev. Rul. YYYY-X], [ABA 2025], [FRED:SOFR], etc.

8. AUDIT TRAIL: Every response generates an audit record (model_stack,
   inputs, citations, live data snapshots). User can download as JSON.
```

#### 5.1.2 League Persona Block — Extend to L7–L10

Update league personas section. Add L7–L10:

```
L7 (Middle-Cap, $250M–$1B EBITDA): You are a mega-fund PE deal lead. Your
buyer is a Blackstone/KKR/Apollo associate or partner. They want speed
+ rigor + audit-trail. They have their own bankers and lawyers — you
augment, you don't replace. Default to MODEL.LBO.PE.MEGA.v1 for primary
LBO modeling. Surface dual-track exit prep early. Reference current
ABA 2025 + SRS 2025 deal-points for everything indemnification-related.

L8 (Mega-Cap, $1B–$5B EBITDA): Same as L7 but consortium / club deal
context is standard. Always surface HSR Second Request probability,
CFIUS exposure if any non-US LP or TID U.S. business. Fairness opinion
build is required (Mode 2 defer to user's bank financial advisor).

L9 (Mega, $5B–$25B EBITDA): Multi-jurisdiction antitrust, multi-step
structuring, sometimes spin / Morris Trust mechanics. NCTI/FDDEI/BEAT
binding if international. Pillar Two compliance if multinational. Always
recommend tax counsel + Big 4 transaction tax + bank financial advisor.

L10 (Super-Cap, $25B+ EBITDA): Transformational. Sector-altering.
Often spin/RMT. Cross-jurisdiction. Multi-quarter regulatory. You're
co-pilot, not primary deal lead — provide breadth/speed/audit-trail.
```

#### 5.1.3 Tax Block — Replace V18a Tax Section with V19 § 9 Reference

In Yulia's runtime knowledge, replace the V18a tax block with this V19-aware reference:

```
TAX FLUENCY (V19 § 9):

Six-Lens Framework: Federal Income / State Income / Transfer-Sales /
Payroll-Employment / International / Industry-Specific.

KEY POST-OBBBA UPDATES YOU MUST KNOW:
- §168(k): 100% bonus depreciation PERMANENT post Jan 19, 2025
  (NOT 40% phase-down)
- §168(n): NEW QPP 100% expensing for manufacturers
- §163(j): EBITDA-based ATI PERMANENT post Dec 31, 2024
- §1202 QSBS: $15M or 10x cap; $75M gross assets; tiered exclusion
  50/75/100% at 3/4/5 years for stock issued after Jul 4, 2025
- NCTI (replaces GILTI): 12.6% ETR; 90% FTC; QBAI eliminated
- FDDEI (replaces FDII): ~14% ETR
- BEAT permanent 10.5%
- SALT cap: $40K in 2025 with phaseout; reverts $10K in 2030
- Section 899 REMOVED from final OBBBA

ALWAYS PULL CURRENT MONTH §382 LTTER FROM L2.

DEFER TO COUNSEL FOR: §1202 qualification opinion, §382 NUBIG/NUBIL on
specific assets, §338(h)(10) joint election strategic analysis, QSub
timing, §280G cleansing vote process, debt-vs-equity characterization,
rollover §351/§721 structuring opinion, transaction cost capitalization
(Reg §1.263(a)-5), international structuring (NCTI/FDDEI/BEAT), state
tax nexus opinion, PTE election timing benefit analysis, pre-sale C→S
conversion tax cost.

For full tax architecture: METHODOLOGY_V19 § 9.
```

#### 5.1.4 Legal Block — Replace V18b Legal Section with V19 § 10 Reference

```
LEGAL FLUENCY (V19 § 10):

THE LINE: smbX.ai is software, not broker / adviser / fiduciary. Never
tie fees to deal closing, capital raised, or transaction value. Yulia
drafts; user sends. No custody, no negotiation-on-behalf-of, no soliciting
specific investors for specific deals.

THREE OPERATING MODES:
- Mode 1 — Continuous Awareness (surface, draft, benchmark)
- Mode 2 — Defer to Counsel (HALT for the 15 always-halt categories)
- Mode 3 — Research Externally (fetch current source)

CURRENT REGULATORY STATE (2026):
- HSR threshold: $133.9M; auto-reportable $535.5M; top filing fee $2.46M
  (effective Feb 17, 2026)
- SBA SOP 50 10 8 (Jun 1, 2025 + Dec 2025 + Feb 2026 updates):
  10% equity, $5M cap, $350K small loan, 1.15x DSCR floor (lender 1.25x,
  business acquisition 1.50x), 2-yr rollover personal guarantee
- DGCL SB 21 (signed Mar 25, 2025): §144 disjunctive cleansing for
  non-going-private controller transactions; §220 narrowed
- FTC noncompete rule DEAD (Sep 5, 2025); state law controls
- 19 states comprehensive privacy laws mid-2026

ABA 2025 + SRS 2025 INDEMNIFICATION MARKET:
- 63% deals use RWI (up from 55%)
- 41% no-survival of reps (up from 30%)
- Median cap on RWI deals: 0.25% of TV (essentially retention)
- Median cap on non-RWI deals: 8-12% TV
- 82% double materiality scrape (up from 69%)
- 67-70% deductible basket (essentially 100% deductible when RWI)
- 76% silent on sandbagging; 19% pro-buyer; 5% anti-sandbag
- 85% fraud carve-outs; 70% limit to contractual reps; 11% undefined

R&W MARKET (Q4 2025):
- ROL: 3.23% avg (firming from 2.5% Q4 2024)
- Retention: 0.5-0.75% EV (1% for <$500M; 0.5% achievable >$500M)
- Coverage: 10% EV typical
- Underwriting: 4-6 weeks; 2-3hr DD call

MAE STANDARD (AKORN):
"Substantially threaten the overall earnings potential of the target
[company] in a durationally-significant manner... measured in years
rather than months." NEVER opine on whether a specific event IS an
MAE — Mode 2 defer to counsel.

For full legal architecture: METHODOLOGY_V19 § 10.
```

#### 5.1.5 4-Beat First Response Pattern (Carried from V3, Reinforced)

Keep V3's 4-Beat First Response Pattern (Classify → Estimate → Insight → Question) unchanged but reference V19 § 8.2 in master prompt.

### 5.2 Gate-Specific Prompts

For each of the 22 gates, update the gate prompt to reference the V19 model stack call (see V19 § 4.9 table). Example for gate S1 (Sell — Financials & Add-Backs):

**Before (V3):**
```
S1_PROMPT = """
You are in S1. The user is providing financials. Extract SDE, identify
add-backs, build a recast P&L. Use 22-formula engine.
"""
```

**After (V4):**
```
S1_PROMPT = """
You are in S1. The user is providing financials. Workflow:

1. L3 NotebookLM extraction: pull P&L line items, owner comp, owner
   benefits, D&A, interest, one-time items. Cite source line/page.
2. L1 calc: invoke MODEL.VAL.SDE.v1 (if league L1/L2) or
   MODEL.VAL.EBITDA.v1 (if league L3+). Pass extracted inputs.
3. Output: recast P&L with add-back schedule. Every add-back is
   source-attested (cite extracted document). Unattested add-backs
   are flagged [unverified — removed from defended SDE/EBITDA].

When ready, advance to S2 (valuation).
"""
```

Repeat for all 22 gates. The pattern: replace generic "use engine" with explicit MODEL.X.Y.Z.vN call.

### 5.3 Update Gate Registry

In `server/services/gateRegistry.ts` (assumed to exist per project knowledge), update each gate's `requiredModels` field:

```typescript
export const GATES = {
  S1: {
    code: 'S1',
    journey: 'SELL',
    requiredModels: [
      // Choose based on league at runtime
      { ifLeague: ['L1','L2'], modelId: 'MODEL.VAL.SDE.v1' },
      { ifLeague: ['L3','L4','L5','L6','L7','L8','L9','L10'], modelId: 'MODEL.VAL.EBITDA.v1' }
    ],
    promptFile: 'YULIA_PROMPTS_V4.md#S1',
    // ... existing fields
  },
  S2: {
    code: 'S2',
    journey: 'SELL',
    requiredModels: [
      { modelId: 'MODEL.VAL.TRIANGULATION.v1' },
      // optional supporting based on league
      { ifLeague: ['L4','L5','L6','L7','L8','L9','L10'], modelId: 'MODEL.VAL.DCF.TWOSTAGE.v1' },
      { ifLeague: ['L3','L4','L5','L6','L7','L8','L9','L10'], modelId: 'MODEL.VAL.COMPS.TRADING.v1' },
      { ifLeague: ['L5','L6','L7','L8','L9','L10'], modelId: 'MODEL.VAL.COMPS.PRECEDENT.v1' }
    ],
    promptFile: 'YULIA_PROMPTS_V4.md#S2'
  },
  // ... S3 through PMI3 — see V19 § 4.9 table
};
```

---

## SECTION 6: TOOLS EXTENSIONS

### 6.1 Existing Yulia Tool Set

Per project knowledge, Yulia has these canvas tools:
* `update_model` — modify assumptions in any tab
* `create_model_tab` — open new model tab
* `render_to_tab` — push content to tab
* `read_tab_state` — read tab state

### 6.2 New V19 Tools

Add to `server/tools.ts`:

```typescript
// V19 NEW TOOLS

// 1. Compose model stack for current deal
{
  name: 'compose_model_stack',
  description: 'Compose the V19 model stack for the current deal based on league × journey × deal_type × structure × industry × jurisdiction. Returns the composed stack with primary, supporting, tax/legal, and sensitivity models. Stack is persisted to deal_model_stack table.',
  input_schema: {
    type: 'object',
    properties: {
      dealId: { type: 'integer' },
      // optional override
      forceStructure: { type: 'string', enum: ['ASSET','STOCK','338H10','336E','FREORG','351','368A','368B','368C','368F','355'] }
    },
    required: ['dealId']
  }
}

// 2. Execute a specific model
{
  name: 'execute_model',
  description: 'Execute a V19 registered model by ID + version. Returns model output with audit trail.',
  input_schema: {
    type: 'object',
    properties: {
      modelId: { type: 'string', description: 'e.g., MODEL.LBO.PE.PRIMARY.v1' },
      input: { type: 'object', description: 'Model-specific input schema' }
    },
    required: ['modelId', 'input']
  }
}

// 3. Lookup citation
{
  name: 'lookup_citation',
  description: 'Lookup a citation tag in the L2 citation registry. Returns current verified value + source URL + as_of date. Use this before referencing any IRC section, Rev Rul, ABA study, FRED series, etc.',
  input_schema: {
    type: 'object',
    properties: {
      citeTag: { type: 'string', description: 'e.g., [IRC §382] or [Rev. Rul. 2026-9]' }
    },
    required: ['citeTag']
  }
}

// 4. Fetch live market data
{
  name: 'fetch_market_data',
  description: 'Fetch the current value of a market data series from L2 cache (or trigger refresh if stale). Returns value + as_of_date + source.',
  input_schema: {
    type: 'object',
    properties: {
      seriesId: { type: 'string', description: 'e.g., SOFR, DGS10, BAMLH0A0HYM2, VIXCLS' },
      forceRefresh: { type: 'boolean', default: false }
    },
    required: ['seriesId']
  }
}

// 5. Defer to counsel — log + generate briefing packet
{
  name: 'defer_to_counsel',
  description: 'When a Mode 2 always-halt trigger fires, call this tool to log the defer + generate a briefing packet for the user to send to counsel. The packet includes: issue summary, applicable framework, 3 questions to ask, references.',
  input_schema: {
    type: 'object',
    properties: {
      triggerCode: { type: 'string', description: 'e.g., HALT_MAE_OPINION, HALT_QSBS_QUAL, HALT_HSR_FORM_RESPONSIVENESS' },
      contextText: { type: 'string', description: 'What the user asked' },
      dealId: { type: 'integer' }
    },
    required: ['triggerCode', 'contextText']
  }
}

// 6. Tax position update
{
  name: 'update_tax_position',
  description: 'Update the tax_position_registry for a deal — entity type, S election status, rollover %, earnout method, QSBS state, etc. Required before composing tax-sensitive model stack.',
  input_schema: {
    type: 'object',
    properties: {
      dealId: { type: 'integer' },
      entityType: { type: 'string', enum: ['CCORP','SCORP','LLC_PARTNERSHIP','LLC_DISREGARDED','SOLE_PROP'] },
      sElectionYears: { type: 'integer' },
      rolloverPct: { type: 'number' },
      rolloverPath: { type: 'string', enum: ['TAXABLE','368','351','721','FREORG_721'] },
      earnoutMethod: { type: 'string', enum: ['DETERMINISTIC','PROBABILITY','MONTE_CARLO','BLACK_SCHOLES'] },
      qsbsEligible: { type: 'boolean' },
      qsbsStateConformity: { type: 'string', enum: ['FULL','NONE','PARTIAL_50','NJ_POST_2026','DC_DECOUPLED'] }
    },
    required: ['dealId']
  }
}

// 7. Audit trail write
{
  name: 'write_audit_trail',
  description: 'Internal — write the audit trail record for the current turn. Called automatically by the L6 citation validator post-publish; rarely needs explicit invocation.',
  input_schema: {
    type: 'object',
    properties: {
      sessionId: { type: 'string' },
      turnId: { type: 'string' },
      modelStack: { type: 'array', items: { type: 'string' } },
      citations: { type: 'array', items: { type: 'string' } },
      liveDataSnapshots: { type: 'object' },
      mode2Triggers: { type: 'array', items: { type: 'string' } }
    },
    required: ['sessionId', 'turnId']
  }
}
```

### 6.3 Tool Handlers

In `server/tools.ts` (or wherever tool handlers live), add handler functions:

```typescript
// compose_model_stack handler
async function handleComposeModelStack(args: { dealId: number, forceStructure?: string }) {
  const deal = await getDeal(args.dealId);
  const stack = await composeStack({
    journey: deal.journey,
    league: deal.league,
    dealType: args.forceStructure ?? deal.dealType,
    industry: deal.naics6digit,
    jurisdiction: deal.jurisdiction,
    structure: {
      entityType: deal.entityType,
      rolloverPct: deal.rolloverPct,
      earnoutPresent: deal.earnoutPresent,
      rwiEligible: deal.rwiEligible
    }
  });
  await persistDealModelStack(args.dealId, stack);
  return stack;
}

// execute_model handler
async function handleExecuteModel(args: { modelId: string, input: any }) {
  const result = await executeModel(args.modelId, args.input);
  return result;
}

// lookup_citation handler
async function handleLookupCitation(args: { citeTag: string }) {
  const row = await sql`
    SELECT cite_tag, current_value, source_url, as_of_date, description
    FROM citation_registry WHERE cite_tag = ${args.citeTag} AND status = 'active'
  `;
  if (row.length === 0) return { found: false, citeTag: args.citeTag };
  return { found: true, ...row[0] };
}

// fetch_market_data handler
async function handleFetchMarketData(args: { seriesId: string, forceRefresh?: boolean }) {
  if (args.forceRefresh) {
    await refreshSeries(args.seriesId);
  }
  const row = await sql`
    SELECT value, as_of_date, source, cite_tag
    FROM market_data_cache
    WHERE series_id = ${args.seriesId}
    ORDER BY as_of_date DESC LIMIT 1
  `;
  if (row.length === 0) return { found: false, seriesId: args.seriesId };
  return { found: true, ...row[0] };
}

// defer_to_counsel handler
async function handleDeferToCounsel(args: { triggerCode: string, contextText: string, dealId?: number }) {
  const packet = generateBriefingPacket(args.triggerCode, args.contextText);
  await sql`
    INSERT INTO legal_defer_log (deal_id, trigger_code, context_text, briefing_packet)
    VALUES (${args.dealId}, ${args.triggerCode}, ${args.contextText}, ${JSON.stringify(packet)})
  `;
  return packet;
}

// update_tax_position handler
async function handleUpdateTaxPosition(args: any) {
  // upsert into tax_position_registry
  await sql`
    INSERT INTO tax_position_registry (deal_id, entity_type, s_election_years, rollover_pct, rollover_path, earnout_method, qsbs_eligible, qsbs_state_conformity)
    VALUES (${args.dealId}, ${args.entityType}, ${args.sElectionYears}, ${args.rolloverPct}, ${args.rolloverPath}, ${args.earnoutMethod}, ${args.qsbsEligible}, ${args.qsbsStateConformity})
    ON CONFLICT (deal_id) DO UPDATE SET
      entity_type = EXCLUDED.entity_type,
      s_election_years = EXCLUDED.s_election_years,
      rollover_pct = EXCLUDED.rollover_pct,
      rollover_path = EXCLUDED.rollover_path,
      earnout_method = EXCLUDED.earnout_method,
      qsbs_eligible = EXCLUDED.qsbs_eligible,
      qsbs_state_conformity = EXCLUDED.qsbs_state_conformity,
      updated_at = NOW()
  `;
  return { ok: true };
}

// write_audit_trail handler
async function handleWriteAuditTrail(args: any) {
  await sql`
    INSERT INTO audit_trail (session_id, deal_id, user_id, conversation_id, turn_id, journey, league, deal_type, model_stack, inputs_used, live_data_snapshots, citations_validated, mode_2_triggers, output_hash)
    VALUES (${args.sessionId}, ${args.dealId}, ${args.userId}, ${args.conversationId}, ${args.turnId}, ${args.journey}, ${args.league}, ${args.dealType}, ${JSON.stringify(args.modelStack)}, ${JSON.stringify(args.inputsUsed)}, ${JSON.stringify(args.liveDataSnapshots)}, ${JSON.stringify(args.citations)}, ${JSON.stringify(args.mode2Triggers)}, ${args.outputHash})
  `;
  return { ok: true };
}
```

---

## SECTION 7: NEW SERVICES

### 7.1 New File: `server/services/marketDataService.ts`

Handles L2 cache lookups and refresh job orchestration.

```typescript
import { sql } from '../db';

export interface MarketDataPoint {
  value: number;
  asOfDate: string;
  fetchedAt: string;
  source: string;
  citeTag: string;
}

export async function getMarketData(seriesId: string): Promise<MarketDataPoint | null> {
  const rows = await sql`
    SELECT value, as_of_date, fetched_at, source, cite_tag
    FROM market_data_cache WHERE series_id = ${seriesId}
    ORDER BY as_of_date DESC LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0] as MarketDataPoint;
}

export async function fetchCurrentLTTER(monthOfChange: string): Promise<{ value: number, citeTag: string }> {
  // monthOfChange format: 'YYYY-MM'
  const month = monthOfChange + '-01';
  const rows = await sql`
    SELECT current_value, cite_tag FROM citation_registry
    WHERE category = 'RevRul' AND cite_tag LIKE '%LTTER%'
      AND as_of_date <= ${month}
    ORDER BY as_of_date DESC LIMIT 1
  `;
  if (rows.length === 0) throw new Error(`No LTTER available for ${monthOfChange}`);
  const value = parseFloat(rows[0].current_value.replace('%','')) / 100;
  return { value, citeTag: rows[0].cite_tag };
}

export async function refreshSeries(seriesId: string): Promise<void> {
  // Dispatch to source-specific refresh
  if (['SOFR','DGS10','DGS5','DGS30','BAMLH0A0HYM2','BAMLC0A0CM','VIXCLS','DPRIME','EFFR','DFEDTARU','DFEDTARL'].includes(seriesId)) {
    await refreshFromFRED(seriesId);
  } else {
    throw new Error(`No refresher for series ${seriesId}`);
  }
}

async function refreshFromFRED(seriesId: string): Promise<void> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) throw new Error('FRED_API_KEY not set');
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=5`;
  const resp = await fetch(url);
  const data = await resp.json();
  const obs = data.observations?.find((o: any) => o.value !== '.');
  if (!obs) throw new Error(`No valid FRED observation for ${seriesId}`);
  const value = parseFloat(obs.value);
  await sql`
    INSERT INTO market_data_cache (series_id, value, as_of_date, source, source_url, cite_tag)
    VALUES (${seriesId}, ${value}, ${obs.date}, 'FRED', ${`https://fred.stlouisfed.org/series/${seriesId}`}, ${`[FRED:${seriesId}]`})
    ON CONFLICT (series_id, as_of_date) DO UPDATE SET
      value = EXCLUDED.value, fetched_at = NOW()
  `;
}
```

### 7.2 New File: `server/services/citationValidator.ts`

Pre-publish gate (L6). Parses Yulia output, validates every `[cite_tag]`, strips invalid claims.

```typescript
import { sql } from '../db';

const CITE_TAG_REGEX = /\[([^\[\]]+)\]/g;

export interface ValidationResult {
  validatedText: string;
  citationsValidated: string[];
  citationsStripped: string[];
  warnings: string[];
}

export async function validateCitations(text: string): Promise<ValidationResult> {
  const tags = new Set<string>();
  let m: RegExpExecArray | null;
  CITE_TAG_REGEX.lastIndex = 0;
  while ((m = CITE_TAG_REGEX.exec(text)) !== null) {
    tags.add('[' + m[1] + ']');
  }

  const validated: string[] = [];
  const stripped: string[] = [];
  const warnings: string[] = [];

  for (const tag of tags) {
    const rows = await sql`
      SELECT cite_tag FROM citation_registry WHERE cite_tag = ${tag} AND status = 'active'
    `;
    if (rows.length > 0) {
      validated.push(tag);
    } else {
      stripped.push(tag);
      warnings.push(`Citation ${tag} not found in registry`);
    }
  }

  // For now, return validated text unchanged with warnings; could add stripping logic
  let validatedText = text;
  for (const s of stripped) {
    validatedText = validatedText.replaceAll(s, '[citation needed]');
  }

  return { validatedText, citationsValidated: validated, citationsStripped: stripped, warnings };
}
```

Integration: in `server/routes/chat.ts`, after Yulia generates output and before sending to client, run validation:

```typescript
// In chat route, after Anthropic response complete
const result = await validateCitations(assistantMessageText);
// Use result.validatedText for client; record result.citationsValidated to audit_trail
```

### 7.3 New File: `server/services/modelStackComposer.ts`

```typescript
import { League } from '../constants/v19Leagues';

export interface ComposeInput {
  journey: 'SELL' | 'BUY' | 'RAISE' | 'INTEGRATE' | 'BROKER';
  league: League;
  dealType: string;
  industry?: string;
  jurisdiction?: string;
  structure?: {
    entityType?: string;
    rolloverPct?: number;
    earnoutPresent?: boolean;
    rwiEligible?: boolean;
  };
}

export interface ComposedStack {
  primary: string[];
  supporting: string[];
  taxLegal: string[];
  sensitivity: string[];
}

// Composition rules per V19 § 13.2 required-model matrix
export async function composeStack(input: ComposeInput): Promise<ComposedStack> {
  const { journey, league, dealType, structure } = input;
  const stack: ComposedStack = { primary: [], supporting: [], taxLegal: [], sensitivity: [] };

  // SELL journey
  if (journey === 'SELL') {
    if (league === 'L1' || league === 'L2') {
      stack.primary.push('MODEL.VAL.SDE.v1');
      stack.supporting.push('MODEL.STRUCT.NWC.PEG.v1');
      stack.taxLegal.push('MODEL.STRUCT.PPA.v1', 'MODEL.LEGAL.INDEM.v1');
      stack.sensitivity.push('MODEL.DSCR.STRESS.v1');
    } else if (league === 'L3') {
      stack.primary.push('MODEL.VAL.EBITDA.v1', 'MODEL.VAL.DCF.TWOSTAGE.v1');
      stack.supporting.push('MODEL.STRUCT.NWC.PEG.v1', 'MODEL.STRUCT.ROLLOVER.v1', 'MODEL.STRUCT.EARNOUT.MC.v1');
      stack.taxLegal.push('MODEL.STRUCT.PPA.v1', 'MODEL.LEGAL.INDEM.v1', 'MODEL.LEGAL.RWI.PRICING.v1', 'MODEL.TAX.168K.v1');
      if (structure?.entityType === 'SCORP') stack.taxLegal.push('MODEL.STRUCT.FREORG.v1');
      stack.sensitivity.push('MODEL.DSCR.STRESS.v1');
    } else if (league === 'L4') {
      stack.primary.push('MODEL.VAL.TRIANGULATION.v1', 'MODEL.VAL.DCF.TWOSTAGE.v1', 'MODEL.VAL.COMPS.TRADING.v1', 'MODEL.VAL.COMPS.PRECEDENT.v1');
      stack.supporting.push('MODEL.STRUCT.NWC.PEG.v1', 'MODEL.STRUCT.NWC.TRUEUP.v1', 'MODEL.STRUCT.ROLLOVER.v1', 'MODEL.STRUCT.EARNOUT.MC.v1', 'MODEL.MIP.v1');
      stack.taxLegal.push('MODEL.STRUCT.PPA.v1', 'MODEL.TAX.168K.v1', 'MODEL.LEGAL.INDEM.v1', 'MODEL.LEGAL.RWI.PRICING.v1', 'MODEL.TAX.STATE.LEAKAGE.v1');
      if (structure?.entityType === 'SCORP') stack.taxLegal.push('MODEL.STRUCT.FREORG.v1');
      stack.sensitivity.push('MODEL.DSCR.STRESS.v1');
    } else if (league === 'L5' || league === 'L6') {
      stack.primary.push('MODEL.VAL.TRIANGULATION.v1', 'MODEL.VAL.IMPLIED.LBO.v1', 'MODEL.VAL.DCF.THREESTAGE.v1', 'MODEL.VAL.COMPS.FOOTBALLFIELD.v1');
      stack.supporting.push('MODEL.SYNERGY.CURVE.v1', 'MODEL.STRUCT.ROLLOVER.v1', 'MODEL.STRUCT.EARNOUT.MC.v1', 'MODEL.MIP.v1');
      stack.taxLegal.push('MODEL.TAX.382.NOL.v1', 'MODEL.TAX.163J.v1', 'MODEL.TAX.168K.v1', 'MODEL.STRUCT.PPA.v1', 'MODEL.LEGAL.RWI.PRICING.v1', 'MODEL.LEGAL.MAE.FRAMEWORK.v1');
      stack.sensitivity.push('MODEL.DSCR.STRESS.v1');
    } else if (league === 'L7' || league === 'L8') {
      stack.primary.push('MODEL.VAL.TRIANGULATION.v1', 'MODEL.MERGER.TAKEPRIVATE.v1', 'MODEL.LBO.PE.MEGA.v1', 'MODEL.EXIT.DUALTRACK.v1');
      stack.supporting.push('MODEL.SYNERGY.CURVE.v1', 'MODEL.MIP.v1');
      stack.taxLegal.push('MODEL.TAX.382.NOL.v1', 'MODEL.TAX.163J.v1', 'MODEL.TAX.NCTI.v1', 'MODEL.HSR.TRIAGE.v1', 'MODEL.CFIUS.TRIAGE.v1', 'MODEL.LEGAL.RWI.PRICING.v1');
    } else if (league === 'L9' || league === 'L10') {
      stack.primary.push('MODEL.VAL.TRIANGULATION.v1', 'MODEL.MERGER.TAKEPRIVATE.v1', 'MODEL.LBO.PE.MEGA.v1', 'MODEL.STRUCT.355.SPIN.v1', 'MODEL.MERGER.ACCDIL.v1');
      stack.taxLegal.push('MODEL.HSR.TRIAGE.v1', 'MODEL.CFIUS.TRIAGE.v1', 'MODEL.TAX.NCTI.v1', 'MODEL.TAX.FDDEI.v1', 'MODEL.TAX.BEAT.v1');
    }
  }

  // BUY journey
  if (journey === 'BUY') {
    if (league === 'L1' || league === 'L2') {
      stack.primary.push('MODEL.LBO.SBA.v1');
      stack.supporting.push('MODEL.VAL.SDE.v1', 'MODEL.SOURCES.USES.v1');
      stack.taxLegal.push('MODEL.STRUCT.PPA.v1', 'MODEL.LEGAL.INDEM.v1');
      stack.sensitivity.push('MODEL.DSCR.STRESS.v1');
    } else if (league === 'L3' || league === 'L4') {
      stack.primary.push(league === 'L3' ? 'MODEL.LBO.LMM.v1' : 'MODEL.LBO.PE.PRIMARY.v1');
      stack.supporting.push('MODEL.VAL.EBITDA.v1', 'MODEL.VAL.DCF.TWOSTAGE.v1', 'MODEL.STRUCT.ROLLOVER.v1', 'MODEL.MIP.v1');
      stack.taxLegal.push('MODEL.STRUCT.PPA.v1', 'MODEL.TAX.168K.v1', 'MODEL.LEGAL.RWI.PRICING.v1', 'MODEL.LEGAL.INDEM.v1', 'MODEL.STRUCT.EARNOUT.MC.v1');
      if (structure?.entityType === 'SCORP') stack.taxLegal.push('MODEL.STRUCT.FREORG.v1');
      stack.sensitivity.push('MODEL.DSCR.STRESS.v1');
    } else if (league === 'L5' || league === 'L6') {
      stack.primary.push('MODEL.LBO.PE.PRIMARY.v1');
      if (dealType === 'ADDON' || dealType === 'ROLLUP') stack.primary.push('MODEL.LBO.ADDON.v1');
      stack.supporting.push('MODEL.SYNERGY.CURVE.v1', 'MODEL.VAL.DCF.THREESTAGE.v1', 'MODEL.LEGAL.MAE.FRAMEWORK.v1', 'MODEL.HSR.TRIAGE.v1');
      stack.taxLegal.push('MODEL.TAX.382.NOL.v1', 'MODEL.TAX.163J.v1', 'MODEL.TAX.168K.v1', 'MODEL.LEGAL.RWI.PRICING.v1');
    } else if (['L7','L8','L9','L10'].includes(league)) {
      stack.primary.push('MODEL.LBO.PE.MEGA.v1', 'MODEL.MERGER.TAKEPRIVATE.v1');
      stack.taxLegal.push('MODEL.HSR.TRIAGE.v1', 'MODEL.CFIUS.TRIAGE.v1', 'MODEL.LEGAL.RWI.PRICING.v1');
    }
  }

  // RAISE journey (capital raise)
  if (journey === 'RAISE') {
    stack.primary.push('MODEL.CAPTABLE.v1', 'MODEL.DILUTION.v1');
    stack.supporting.push('MODEL.LIQPREF.v1', 'MODEL.ANTIDIL.BBWA.v1', 'MODEL.SAFE.POSTMONEY.v1');
    if (['L4','L5','L6'].includes(league)) {
      stack.supporting.push('MODEL.VAL.WACC.MODCAPM.v1', 'MODEL.VAL.EBITDA.v1', 'MODEL.VAL.DCF.TWOSTAGE.v1', 'MODEL.TAX.1202.QSBS.v1');
    }
  }

  // INTEGRATE (PMI) journey
  if (journey === 'INTEGRATE') {
    stack.primary.push('MODEL.PMI.100DAY.v1');
    stack.supporting.push('MODEL.PMI.SYNCAP.v1', 'MODEL.PMI.EARNOUT.TRACK.v1', 'MODEL.PMI.INDEM.TRACK.v1', 'MODEL.PMI.NWC.NORMAL.v1');
  }

  return stack;
}

export async function persistDealModelStack(dealId: number, stack: ComposedStack): Promise<void> {
  // sql implementation
}
```

### 7.4 Background Job: FRED Daily Refresh

`server/jobs/refreshFREDDaily.ts`:
```typescript
import { refreshSeries } from '../services/marketDataService';

const SERIES = ['SOFR','EFFR','DGS5','DGS10','DGS30','BAMLH0A0HYM2','BAMLC0A0CM','VIXCLS','DPRIME','DFEDTARU','DFEDTARL'];

export async function runRefreshFREDDaily(): Promise<void> {
  for (const s of SERIES) {
    try {
      await refreshSeries(s);
      console.log(`Refreshed ${s}`);
    } catch (err) {
      console.error(`Failed to refresh ${s}:`, err);
    }
  }
}
```

Register with pg-boss (existing background runner). Schedule: daily at 09:00 ET.

### 7.5 Persistent File Storage (P0 Tier 0 Blocker — Carry from Punch List)

Per user memory: `/tmp/uploads/` is ephemeral. Mount Railway volume at `/data/uploads/`. Update file upload service to write to volume path; update file retrieval to read from volume. This is the persistent file storage Tier 0 blocker.

---

## SECTION 8: GATE REGISTRY UPDATES

### 8.1 Gate-Specific Model Stack Injection

For each gate in `server/services/gateRegistry.ts`, set `requiredModels` per V19 § 4.9 table. The gate prompt (loaded from YULIA_PROMPTS_V4.md by `buildSystemPrompt.ts`) must include:

```
GATE CONTEXT (V19):
Gate: {currentGate}
Required Models: {requiredModels list}
Required Citations: {auto-derived from model citeTags}
Deal Stack: {full composed stack from deal_model_stack table}
```

### 8.2 Gate Advancement Logic

Existing advancement logic (per project knowledge: extract fields → check completion criteria → advance or paywall) is preserved. V19 addition: on each gate advance, call `compose_model_stack` if not already composed OR if league/deal_type has changed.

### 8.3 Gate-Specific Defer Triggers

Each gate carries a list of always-halt categories that automatically defer if the user's question matches. Example:

```typescript
GATES.S4.alwaysHaltTriggers = [
  'HALT_MAE_OPINION',          // if user asks "is this an MAE"
  'HALT_HSR_RESPONSIVENESS',   // if user asks about HSR Item 4(c)/(d) for specific facts
];

GATES.B3.alwaysHaltTriggers = [
  'HALT_QSBS_QUAL',            // if user asks about §1202 qualification on specific facts
  'HALT_382_NUBIG',            // if user asks for NUBIG/NUBIL determination
];
```

Pre-publish in chat route: scan user message + Yulia draft for trigger keywords; if matched, fire `defer_to_counsel` tool before publish.

---

## SECTION 9: CLAUDE.md UPDATE

### 9.1 Update Repo Doc Map

Edit `/CLAUDE.md` (root) to include V19 doc map. Replace existing doc-map section with:

```markdown
## REPO DOC MAP (V19)

### Methodology (Authoritative)
- `methodology/METHODOLOGY_V19.md` — Current master (May 14, 2026)
- `methodology/_archive/METHODOLOGY_V17.md` — Superseded by V19 §§ 1–8, 11–15
- `methodology/_archive/METHODOLOGY_V18a_TAX_AMENDMENT.md` — Superseded by V19 § 9
- `methodology/_archive/METHODOLOGY_V18b_LEGAL_AMENDMENT.md` — Superseded by V19 § 10

### Companion Documents
- `methodology/SMBX_DEAL_MODEL_CATALOG.md` — Full per-model schemas (TO BUILD)
- `methodology/SMBX_LEGAL_TAX_ECONOMICS_CATALOG.md` — Every legal/tax concept → $ impact (TO BUILD)
- `methodology/SMBX_YULIA_MODEL_GATING_LOGIC.md` — Deterministic decision tree (TO BUILD)

### Operating References
- `methodology/SMBX_THE_LINE.md` — Regulatory boundary
- `methodology/SMBX_PLATFORM_REFERENCE.md` — Build state
- `methodology/SMBX_LAUNCH_PUNCH_LIST_V2.md` — Tier 0 items
- `methodology/SMBX_DESIGN_SYSTEM.md` — Glass aesthetic + tokens

### Prompts
- `server/prompts/YULIA_PROMPTS_V4.md` — V19-aligned runtime prompts (TO BUILD per § 5)
- `server/prompts/_archive/YULIA_PROMPTS_V3.md` — Superseded

### Implementation
- `server/migrations/2026-05-14-v19-schema.sql` — V19 DB schema
- `server/constants/v19Regulatory.ts` — 2026 regulatory constants
- `server/constants/v19Leagues.ts` — L1–L10 classification
- `server/services/modelRegistry.ts` — Model versioning
- `server/services/models/` — Per-model implementations
- `server/services/marketDataService.ts` — L2 market data cache + FRED refresh
- `server/services/citationValidator.ts` — L6 citation validation
- `server/services/modelStackComposer.ts` — Deal → model stack composition

### Tier 0 Blockers (per Punch List V2)
- Persistent file storage via Railway volume at `/data/uploads/`
- Early access email capture (BEFORE first deliverable)
- Stripe live keys
- Prompt quality improvements (Tier 0)
```

### 9.2 Build Order Note

Add to top of `CLAUDE.md`:

```markdown
## V19 BUILD ORDER

1. Apply DB migration (`server/migrations/2026-05-14-v19-schema.sql`)
2. Seed citation registry (`server/seeds/v19_citation_registry.sql`)
3. Deploy `server/constants/v19Regulatory.ts` + `v19Leagues.ts`
4. Deploy `modelRegistry.ts` + Phase 1 models (20 Tier-0 models)
5. Deploy `marketDataService.ts` + FRED refresh job
6. Deploy `citationValidator.ts`; wire into chat route post-Anthropic-response
7. Deploy `modelStackComposer.ts`
8. Update `YULIA_PROMPTS_V4.md` (replacing V3)
9. Update `gateRegistry.ts` per V19 § 4.9 model-stack table
10. Add 7 new agentic tools (`compose_model_stack`, `execute_model`, `lookup_citation`, `fetch_market_data`, `defer_to_counsel`, `update_tax_position`, `write_audit_trail`)
11. Update `CLAUDE.md` doc map
12. Run hallucination test suite (Phase 1: top 20 risks)
13. Smoke test: L4 LMM PE sell-side scenario end-to-end with audit trail

After Phase 1 stable → Phase 2 models → Phase 3 mega-cap models.
```

---

## VERIFICATION CHECKLIST

Before declaring V19 complete:

- [ ] All V17/V18a/V18b references replaced with V19 in code + docs
- [ ] DB migration applied; all 7 new tables exist; columns added to `deals` and `conversations`
- [ ] Citation registry seeded with ~30 baseline rows (HSR, OBBBA, LTTER, SBA, Damodaran, etc.)
- [ ] V19 constants files imported by relevant services
- [ ] `modelRegistry` + Phase 1 models register on app boot (verify with admin endpoint)
- [ ] FRED daily refresh job running; SOFR / DGS10 / HY OAS values current
- [ ] `citationValidator` integrated into chat route; warnings surface on uncited claims
- [ ] `modelStackComposer` returns valid stacks for L1–L6 (full coverage of launch leagues)
- [ ] `YULIA_PROMPTS_V4.md` deployed; master prompt references V19 architecture
- [ ] All 22 gates have `requiredModels` set per V19 § 4.9 table
- [ ] 7 new agentic tools registered and callable by Yulia
- [ ] Smoke test: ask Yulia "I have a $10M EBITDA HVAC business in TX, S-corp, 15 yrs, considering a sale to a PE buyer" → Yulia produces 4-Beat First Response with L4 classification, valuation estimate, model stack auto-composed, F-reorg flagged for S-corp, RWI surfaced, all numbers cite-tagged
- [ ] Audit trail JSON downloadable from a sample conversation
- [ ] Hallucination test suite: 0 fails on Phase 1 (top 20 risks per V19 § 14.2)

---

**End of CC Implementation Brief**

This brief is grounded in the actual repo state per project knowledge searches conducted May 14, 2026. Any deviation from this brief should be documented in a follow-up `CC_V19_DEVIATIONS_LOG.md` so the methodology stays in sync with the build.
