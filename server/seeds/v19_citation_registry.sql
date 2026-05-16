-- V19 citation registry seed.
-- The production migration 067_v19_foundation.sql runs this same seed inline
-- because server startup auto-runs migrations, not files in server/seeds.

INSERT INTO citation_registry (cite_tag, category, description, current_value, source_url, as_of_date) VALUES
  ('[FTC 2026 HSR - Size of Transaction]', 'FTC', '2026 HSR minimum size-of-transaction threshold', '$133.9M', 'https://www.ftc.gov/enforcement/competition-matters/2026/01/new-hsr-thresholds-filing-fees-2026', '2026-02-17'),
  ('[FTC 2026 HSR - Size of Person]', 'FTC', '2026 HSR size-of-person thresholds', '$267.8M / $26.8M', 'https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds', '2026-02-17'),
  ('[FTC 2026 HSR - Auto-Reportable]', 'FTC', '2026 HSR transaction value above which size-of-person test is not required', '$535.5M', 'https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds', '2026-02-17'),
  ('[FTC 2026 HSR - Filing Fee Tier 1]', 'FTC', '2026 HSR lowest filing fee tier', '$35,000 for transactions under $189.6M', 'https://www.ftc.gov/enforcement/premerger-notification-program/filing-fee-information', '2026-02-17'),
  ('[FTC 2026 HSR - Filing Fee Top]', 'FTC', '2026 HSR top filing fee tier', '$2.46M for transactions $5.869B or more', 'https://www.ftc.gov/enforcement/premerger-notification-program/filing-fee-information', '2026-02-17'),
  ('[OBBBA Sec. 70301]', 'OBBBA', 'Section 168(k) 100% bonus depreciation permanent', '100% post Jan 19 2025', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70302]', 'OBBBA', 'Section 163(j) ATI EBITDA-based permanent', 'EBITDA-based post Dec 31 2024', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70307]', 'OBBBA', 'Section 168(n) Qualified Production Property', '100% post Jul 4 2025', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70322]', 'OBBBA', 'NCTI/FDDEI/BEAT permanent rates', '12.6% NCTI; approx. 14% FDDEI; 10.5% BEAT', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70425]', 'OBBBA', 'Section 1202 QSBS expanded', '$15M/10x cap; $75M assets; tiered 3/4/5 year exclusions', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70505]', 'OBBBA', 'SALT cap raised', '$40K 2025; phaseout above $500K; reverts 2030', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[Rev. Rul. 2026-9]', 'RevRul', 'Section 382 long-term tax-exempt rate for May 2026', '3.65%', 'https://www.irs.gov/irb/2026-19_IRB', '2026-05-01'),
  ('[Rev. Rul. 2026-03]', 'RevRul', 'Section 382 long-term tax-exempt rate for February 2026', '3.56%', 'https://www.irs.gov/irb/', '2026-02-01'),
  ('[Rev. Rul. 2026-02]', 'RevRul', 'Section 382 long-term tax-exempt rate for January 2026', '3.51%', 'https://www.irs.gov/irb/', '2026-01-01'),
  ('[SBA SOP 50 10 8]', 'SBA', 'Current SBA SOP for 7(a) and 504 loans', 'Version 8 effective Jun 1 2025; technical update notice effective May 29 2025', 'https://www.sba.gov/document/sop-50-10-lender-development-company-loan-programs', '2025-06-01'),
  ('[Damodaran 2026]', 'Damodaran', 'Damodaran ERP / beta / multiples reference set', 'ERP 4.23% Jan 2026', 'https://pages.stern.nyu.edu/~adamodar/', '2026-01-01'),
  ('[Kroll 2024]', 'Kroll', 'Kroll recommended U.S. equity risk premium', '5.00% since Jun 5 2024', 'https://www.kroll.com/', '2024-06-05'),
  ('[ABA 2025]', 'ABA', 'ABA Private Target Deal Points Study 2025', '139 deals 2024-Q1 2025; $25-900M', NULL, '2025-12-16'),
  ('[SRS 2025]', 'SRS', 'SRS Acquiom 2025 M&A Deal Terms Study', '2200+ deals; $505B', NULL, '2025-12-01'),
  ('[Marsh TRI 2025]', 'Marsh', 'Marsh Transactional Risk Insurance Report 2025', 'NA ROL +16% YoY; Q4 2025 avg 3.23%', NULL, '2026-01-15'),
  ('[Pepperdine PCAP 2025]', 'Pepperdine', 'Pepperdine Private Capital Markets Project 2025', 'Sep 12 2025', 'https://digitalcommons.pepperdine.edu/gsbm_pcm_pcmr/18', '2025-09-12'),
  ('[FRED:SOFR]', 'FRED', 'Secured Overnight Financing Rate', 'live', 'https://fred.stlouisfed.org/series/SOFR', NULL),
  ('[FRED:DGS10]', 'FRED', '10-Year Treasury Constant Maturity', 'live', 'https://fred.stlouisfed.org/series/DGS10', NULL),
  ('[FRED:BAMLH0A0HYM2]', 'FRED', 'ICE BofA US High Yield Option-Adjusted Spread', 'live', 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2', NULL),
  ('[FRED:BAMLC0A0CM]', 'FRED', 'ICE BofA US Corporate Option-Adjusted Spread', 'live', 'https://fred.stlouisfed.org/series/BAMLC0A0CM', NULL),
  ('[FRED:VIXCLS]', 'FRED', 'CBOE Volatility Index: VIX', 'live', 'https://fred.stlouisfed.org/series/VIXCLS', NULL),
  ('[FRED:DPRIME]', 'FRED', 'Bank Prime Loan Rate', 'live', 'https://fred.stlouisfed.org/series/DPRIME', NULL),
  ('[FRED:EFFR]', 'FRED', 'Effective Federal Funds Rate', 'live', 'https://fred.stlouisfed.org/series/EFFR', NULL)
ON CONFLICT (cite_tag) DO UPDATE
  SET category = EXCLUDED.category,
      description = EXCLUDED.description,
      current_value = EXCLUDED.current_value,
      source_url = EXCLUDED.source_url,
      as_of_date = EXCLUDED.as_of_date,
      validated_at = NOW(),
      status = 'active';
