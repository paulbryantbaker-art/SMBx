-- 073: DEFINITIVE Authority Register foundation
-- Adds the richer L2 content spine for DEFINITIVE v1.0 while preserving
-- the existing V19 citation_registry compatibility path.

CREATE TABLE IF NOT EXISTS authority_register (
  id BIGSERIAL PRIMARY KEY,
  authority_id TEXT UNIQUE NOT NULL,
  cite_tag TEXT UNIQUE,
  category TEXT NOT NULL,
  authority_type TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'US',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  current_value TEXT,
  citation_text TEXT,
  source_name TEXT,
  source_url TEXT,
  publisher TEXT,
  effective_date DATE,
  as_of_date DATE,
  supersedes_authority_id TEXT,
  superseded_by_authority_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  validation_status TEXT NOT NULL DEFAULT 'founder_reviewed',
  confidence NUMERIC NOT NULL DEFAULT 0.85,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_check_due DATE,
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authority_register_cite_tag
  ON authority_register(cite_tag)
  WHERE cite_tag IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_authority_register_category_status
  ON authority_register(category, status);

CREATE INDEX IF NOT EXISTS idx_authority_register_jurisdiction
  ON authority_register(jurisdiction, authority_type);

CREATE INDEX IF NOT EXISTS idx_authority_register_next_check
  ON authority_register(next_check_due, status)
  WHERE next_check_due IS NOT NULL;

ALTER TABLE citation_registry
  ADD COLUMN IF NOT EXISTS authority_id TEXT;

INSERT INTO authority_register (
  authority_id, cite_tag, category, authority_type, jurisdiction, title, description,
  current_value, citation_text, source_name, source_url, publisher, effective_date,
  as_of_date, next_check_due, aliases, metadata
) VALUES
  ('AUTH.FTC.HSR.2026.SIZE_TRANSACTION', '[FTC 2026 HSR - Size of Transaction]', 'FTC', 'regulatory_threshold', 'US', '2026 HSR size-of-transaction threshold', '2026 HSR minimum size-of-transaction threshold used for reportability screening.', '$133.9M', 'FTC 2026 HSR size-of-transaction threshold', 'Federal Trade Commission', 'https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds', 'FTC', '2026-02-17', '2026-02-17', '2027-02-01', '["HSR size of transaction", "15 USC 18a threshold"]'::jsonb, '{"source_family":"hsr"}'::jsonb),
  ('AUTH.FTC.HSR.2026.SIZE_PERSON', '[FTC 2026 HSR - Size of Person]', 'FTC', 'regulatory_threshold', 'US', '2026 HSR size-of-person thresholds', '2026 HSR size-of-person thresholds used where the size-of-person test applies.', '$267.8M / $26.8M', 'FTC 2026 HSR size-of-person thresholds', 'Federal Trade Commission', 'https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds', 'FTC', '2026-02-17', '2026-02-17', '2027-02-01', '["HSR size of person"]'::jsonb, '{"source_family":"hsr"}'::jsonb),
  ('AUTH.FTC.HSR.2026.AUTO_REPORTABLE', '[FTC 2026 HSR - Auto-Reportable]', 'FTC', 'regulatory_threshold', 'US', '2026 HSR auto-reportable transaction value', '2026 HSR transaction value above which size-of-person test is not required.', '$535.5M', 'FTC 2026 HSR auto-reportable threshold', 'Federal Trade Commission', 'https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds', 'FTC', '2026-02-17', '2026-02-17', '2027-02-01', '["HSR auto reportable"]'::jsonb, '{"source_family":"hsr"}'::jsonb),
  ('AUTH.FTC.HSR.2026.FEE_TIER_1', '[FTC 2026 HSR - Filing Fee Tier 1]', 'FTC', 'regulatory_threshold', 'US', '2026 HSR filing fee tier 1', '2026 HSR lowest filing fee tier.', '$35,000 for transactions under $189.6M', 'FTC 2026 HSR filing fee tier 1', 'Federal Trade Commission', 'https://www.ftc.gov/enforcement/premerger-notification-program/filing-fee-information', 'FTC', '2026-02-17', '2026-02-17', '2027-02-01', '["HSR filing fee"]'::jsonb, '{"source_family":"hsr"}'::jsonb),
  ('AUTH.FTC.HSR.2026.FEE_TOP', '[FTC 2026 HSR - Filing Fee Top]', 'FTC', 'regulatory_threshold', 'US', '2026 HSR top filing fee tier', '2026 HSR top filing fee tier.', '$2.46M for transactions $5.869B or more', 'FTC 2026 HSR top filing fee tier', 'Federal Trade Commission', 'https://www.ftc.gov/enforcement/premerger-notification-program/filing-fee-information', 'FTC', '2026-02-17', '2026-02-17', '2027-02-01', '["HSR top fee"]'::jsonb, '{"source_family":"hsr"}'::jsonb),

  ('AUTH.OBBBA.70301', '[OBBBA Sec. 70301]', 'OBBBA', 'statute', 'US', 'OBBBA Section 70301', 'Section 168(k) bonus depreciation authority in the V19 tax stack.', '100% post Jan 19 2025', 'OBBBA Sec. 70301 / IRC Section 168(k)', 'Congress.gov Public Law', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', 'Congress.gov', '2025-07-04', '2025-07-04', '2026-12-31', '["IRC 168(k)", "bonus depreciation"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.OBBBA.70302', '[OBBBA Sec. 70302]', 'OBBBA', 'statute', 'US', 'OBBBA Section 70302', 'Section 163(j) ATI EBITDA-based rule authority in the V19 tax stack.', 'EBITDA-based post Dec 31 2024', 'OBBBA Sec. 70302 / IRC Section 163(j)', 'Congress.gov Public Law', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', 'Congress.gov', '2025-07-04', '2025-07-04', '2026-12-31', '["IRC 163(j)", "interest limitation"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.OBBBA.70307', '[OBBBA Sec. 70307]', 'OBBBA', 'statute', 'US', 'OBBBA Section 70307', 'Qualified Production Property authority in the V19 tax stack.', '100% post Jul 4 2025', 'OBBBA Sec. 70307', 'Congress.gov Public Law', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', 'Congress.gov', '2025-07-04', '2025-07-04', '2026-12-31', '["qualified production property"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.OBBBA.70322', '[OBBBA Sec. 70322]', 'OBBBA', 'statute', 'US', 'OBBBA Section 70322', 'NCTI, FDDEI, and BEAT rate authority in the V19 tax stack.', '12.6% NCTI; approx. 14% FDDEI; 10.5% BEAT', 'OBBBA Sec. 70322', 'Congress.gov Public Law', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', 'Congress.gov', '2025-07-04', '2025-07-04', '2026-12-31', '["NCTI", "FDDEI", "BEAT"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.OBBBA.70425', '[OBBBA Sec. 70425]', 'OBBBA', 'statute', 'US', 'OBBBA Section 70425', 'Section 1202 QSBS expanded cap and tiered holding-period authority in the V19 tax stack.', '$15M/10x cap; $75M assets; tiered 3/4/5 year exclusions', 'OBBBA Sec. 70425 / IRC Section 1202', 'Congress.gov Public Law', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', 'Congress.gov', '2025-07-04', '2025-07-04', '2026-12-31', '["IRC 1202", "QSBS"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.OBBBA.70505', '[OBBBA Sec. 70505]', 'OBBBA', 'statute', 'US', 'OBBBA Section 70505', 'SALT cap authority in the V19 tax stack.', '$40K 2025; phaseout above $500K; reverts 2030', 'OBBBA Sec. 70505', 'Congress.gov Public Law', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', 'Congress.gov', '2025-07-04', '2025-07-04', '2026-12-31', '["SALT cap"]'::jsonb, '{"source_family":"tax"}'::jsonb),

  ('AUTH.IRS.REVRUL.2026_09', '[Rev. Rul. 2026-9]', 'RevRul', 'irs_guidance', 'US', 'Revenue Ruling 2026-9', 'Section 382 long-term tax-exempt rate for May 2026.', '3.65%', 'Rev. Rul. 2026-9', 'Internal Revenue Service', 'https://www.irs.gov/irb/2026-19_IRB', 'IRS', '2026-05-01', '2026-05-01', '2026-06-15', '["Section 382 LTTER May 2026"]'::jsonb, '{"source_family":"tax_rate"}'::jsonb),
  ('AUTH.IRS.REVRUL.2026_03', '[Rev. Rul. 2026-03]', 'RevRul', 'irs_guidance', 'US', 'Revenue Ruling 2026-03', 'Section 382 long-term tax-exempt rate for February 2026.', '3.56%', 'Rev. Rul. 2026-03', 'Internal Revenue Service', 'https://www.irs.gov/irb/', 'IRS', '2026-02-01', '2026-02-01', '2026-06-15', '["Section 382 LTTER February 2026"]'::jsonb, '{"source_family":"tax_rate"}'::jsonb),
  ('AUTH.IRS.REVRUL.2026_02', '[Rev. Rul. 2026-02]', 'RevRul', 'irs_guidance', 'US', 'Revenue Ruling 2026-02', 'Section 382 long-term tax-exempt rate for January 2026.', '3.51%', 'Rev. Rul. 2026-02', 'Internal Revenue Service', 'https://www.irs.gov/irb/', 'IRS', '2026-01-01', '2026-01-01', '2026-06-15', '["Section 382 LTTER January 2026"]'::jsonb, '{"source_family":"tax_rate"}'::jsonb),
  ('AUTH.SBA.SOP_50_10_8', '[SBA SOP 50 10 8]', 'SBA', 'agency_guidance', 'US', 'SBA SOP 50 10 8', 'Current SBA SOP for 7(a) and 504 lending workflows.', 'Version 8 effective Jun 1 2025; technical update notice effective May 29 2025', 'SBA SOP 50 10 8', 'U.S. Small Business Administration', 'https://www.sba.gov/document/sop-50-10-lender-development-company-loan-programs', 'SBA', '2025-06-01', '2025-06-01', '2026-12-31', '["SBA 7(a)", "SBA SOP"]'::jsonb, '{"source_family":"financing"}'::jsonb),

  ('AUTH.DAMODARAN.2026', '[Damodaran 2026]', 'Damodaran', 'study', 'US', 'Damodaran 2026 market data', 'Damodaran ERP, beta, and multiples reference set used for valuation context.', 'ERP 4.23% Jan 2026', 'Damodaran data set 2026', 'Damodaran Online', 'https://pages.stern.nyu.edu/~adamodar/', 'NYU Stern', '2026-01-01', '2026-01-01', '2027-01-31', '["ERP", "valuation data"]'::jsonb, '{"source_family":"market_study"}'::jsonb),
  ('AUTH.KROLL.2024', '[Kroll 2024]', 'Kroll', 'study', 'US', 'Kroll U.S. Equity Risk Premium 2024', 'Kroll recommended U.S. equity risk premium reference.', '5.00% since Jun 5 2024', 'Kroll U.S. ERP recommendation', 'Kroll', 'https://www.kroll.com/', 'Kroll', '2024-06-05', '2024-06-05', '2026-12-31', '["equity risk premium"]'::jsonb, '{"source_family":"market_study"}'::jsonb),
  ('AUTH.ABA.2025.PRIVATE_TARGET', '[ABA 2025]', 'ABA', 'study', 'US', 'ABA Private Target Deal Points Study 2025', 'ABA Private Target Deal Points Study used for private-target market terms.', '139 deals 2024-Q1 2025; $25-900M', 'ABA Private Target Deal Points Study 2025', 'American Bar Association', NULL, 'ABA', '2025-12-16', '2025-12-16', '2026-12-31', '["ABA Deal Points"]'::jsonb, '{"source_family":"deal_terms"}'::jsonb),
  ('AUTH.SRS.2025.DEAL_TERMS', '[SRS 2025]', 'SRS', 'study', 'US', 'SRS Acquiom 2025 M&A Deal Terms Study', 'SRS Acquiom M&A Deal Terms Study used for market terms and earnout/escrow references.', '2200+ deals; $505B', 'SRS Acquiom 2025 M&A Deal Terms Study', 'SRS Acquiom', NULL, 'SRS Acquiom', '2025-12-01', '2025-12-01', '2026-12-31', '["SRS Deal Terms"]'::jsonb, '{"source_family":"deal_terms"}'::jsonb),
  ('AUTH.MARSH.TRI.2025', '[Marsh TRI 2025]', 'Marsh', 'study', 'US', 'Marsh Transactional Risk Insurance Report 2025', 'Marsh transactional risk insurance report used for RWI market context.', 'NA ROL +16% YoY; Q4 2025 avg 3.23%', 'Marsh Transactional Risk Insurance Report 2025', 'Marsh', NULL, 'Marsh', '2026-01-15', '2026-01-15', '2026-12-31', '["RWI", "transactional risk insurance"]'::jsonb, '{"source_family":"rwi"}'::jsonb),
  ('AUTH.PEPPERDINE.PCAP.2025', '[Pepperdine PCAP 2025]', 'Pepperdine', 'study', 'US', 'Pepperdine Private Capital Markets Project 2025', 'Pepperdine PCAP report used for lower-middle-market capital and valuation context.', 'Sep 12 2025', 'Pepperdine Private Capital Markets Project 2025', 'Pepperdine Digital Commons', 'https://digitalcommons.pepperdine.edu/gsbm_pcm_pcmr/18', 'Pepperdine Graziadio', '2025-09-12', '2025-09-12', '2026-12-31', '["private capital markets"]'::jsonb, '{"source_family":"market_study"}'::jsonb),

  ('AUTH.FRED.SOFR', '[FRED:SOFR]', 'FRED', 'dataset', 'US', 'Secured Overnight Financing Rate', 'FRED SOFR series used for financing and rate context.', 'live', 'FRED:SOFR', 'Federal Reserve Bank of St. Louis FRED', 'https://fred.stlouisfed.org/series/SOFR', 'FRED', NULL, NULL, '2026-06-30', '["SOFR"]'::jsonb, '{"series_id":"SOFR"}'::jsonb),
  ('AUTH.FRED.DGS10', '[FRED:DGS10]', 'FRED', 'dataset', 'US', '10-Year Treasury Constant Maturity', 'FRED DGS10 series used for rate context.', 'live', 'FRED:DGS10', 'Federal Reserve Bank of St. Louis FRED', 'https://fred.stlouisfed.org/series/DGS10', 'FRED', NULL, NULL, '2026-06-30', '["10Y Treasury"]'::jsonb, '{"series_id":"DGS10"}'::jsonb),
  ('AUTH.FRED.BAMLH0A0HYM2', '[FRED:BAMLH0A0HYM2]', 'FRED', 'dataset', 'US', 'ICE BofA US High Yield Option-Adjusted Spread', 'FRED high-yield OAS series used for credit spread context.', 'live', 'FRED:BAMLH0A0HYM2', 'Federal Reserve Bank of St. Louis FRED', 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2', 'FRED', NULL, NULL, '2026-06-30', '["HY OAS"]'::jsonb, '{"series_id":"BAMLH0A0HYM2"}'::jsonb),
  ('AUTH.FRED.BAMLC0A0CM', '[FRED:BAMLC0A0CM]', 'FRED', 'dataset', 'US', 'ICE BofA US Corporate Option-Adjusted Spread', 'FRED corporate OAS series used for credit spread context.', 'live', 'FRED:BAMLC0A0CM', 'Federal Reserve Bank of St. Louis FRED', 'https://fred.stlouisfed.org/series/BAMLC0A0CM', 'FRED', NULL, NULL, '2026-06-30', '["corporate OAS"]'::jsonb, '{"series_id":"BAMLC0A0CM"}'::jsonb),
  ('AUTH.FRED.VIXCLS', '[FRED:VIXCLS]', 'FRED', 'dataset', 'US', 'CBOE Volatility Index: VIX', 'FRED VIXCLS series used for market volatility context.', 'live', 'FRED:VIXCLS', 'Federal Reserve Bank of St. Louis FRED', 'https://fred.stlouisfed.org/series/VIXCLS', 'FRED', NULL, NULL, '2026-06-30', '["VIX"]'::jsonb, '{"series_id":"VIXCLS"}'::jsonb),
  ('AUTH.FRED.DPRIME', '[FRED:DPRIME]', 'FRED', 'dataset', 'US', 'Bank Prime Loan Rate', 'FRED DPRIME series used for lender-rate context.', 'live', 'FRED:DPRIME', 'Federal Reserve Bank of St. Louis FRED', 'https://fred.stlouisfed.org/series/DPRIME', 'FRED', NULL, NULL, '2026-06-30', '["prime rate"]'::jsonb, '{"series_id":"DPRIME"}'::jsonb),
  ('AUTH.FRED.EFFR', '[FRED:EFFR]', 'FRED', 'dataset', 'US', 'Effective Federal Funds Rate', 'FRED EFFR series used for rate context.', 'live', 'FRED:EFFR', 'Federal Reserve Bank of St. Louis FRED', 'https://fred.stlouisfed.org/series/EFFR', 'FRED', NULL, NULL, '2026-06-30', '["effective fed funds"]'::jsonb, '{"series_id":"EFFR"}'::jsonb),

  ('AUTH.DE.AKORN.2018', '[Akorn, 2018 Del. Ch.]', 'Case', 'case_law', 'US-DE', 'Akorn, Inc. v. Fresenius Kabi AG', 'Delaware MAE doctrine authority used for material adverse effect analysis.', NULL, 'Akorn, Inc. v. Fresenius Kabi AG, 2018 Del. Ch.', 'Delaware Court of Chancery', NULL, 'Delaware Courts', '2018-10-01', '2018-10-01', '2027-01-31', '["MAE", "material adverse effect"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.AB_STABLE.2020', '[AB Stable, 2020 Del. Ch.]', 'Case', 'case_law', 'US-DE', 'AB Stable VIII LLC v. MAPS Hotels and Resorts One LLC', 'Delaware ordinary-course and MAE-related authority used in deal covenant analysis.', NULL, 'AB Stable VIII LLC v. MAPS Hotels and Resorts One LLC, 2020 Del. Ch.', 'Delaware Court of Chancery', NULL, 'Delaware Courts', '2020-11-30', '2020-11-30', '2027-01-31', '["ordinary course", "MAE"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.SNOW_PHIPPS.2021', '[Snow Phipps, 2021 Del. Ch.]', 'Case', 'case_law', 'US-DE', 'Snow Phipps Group, LLC v. KCAKE Acquisition, Inc.', 'Delaware MAE and debt-financing covenant authority used in broken-deal analysis.', NULL, 'Snow Phipps Group, LLC v. KCAKE Acquisition, Inc., 2021 Del. Ch.', 'Delaware Court of Chancery', NULL, 'Delaware Courts', '2021-04-30', '2021-04-30', '2027-01-31', '["MAE", "debt financing"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.CHANNEL_MEDSYSTEMS.2019', '[Channel Medsystems, 2019 Del. Ch.]', 'Case', 'case_law', 'US-DE', 'Channel Medsystems, Inc. v. Boston Scientific Corp.', 'Delaware MAE authority used for durational significance and regulatory fact patterns.', NULL, 'Channel Medsystems, Inc. v. Boston Scientific Corp., 2019 Del. Ch.', 'Delaware Court of Chancery', NULL, 'Delaware Courts', '2019-12-18', '2019-12-18', '2027-01-31', '["MAE", "durational significance"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.WILLIAMS_ENERGY_TRANSFER.2017', '[Williams v Energy Transfer, 2017 Del.]', 'Case', 'case_law', 'US-DE', 'The Williams Companies, Inc. v. Energy Transfer Equity, L.P.', 'Delaware deal-efforts and tax-opinion authority; not a general MAE authority.', NULL, 'The Williams Companies, Inc. v. Energy Transfer Equity, L.P., 2017 Del.', 'Delaware Supreme Court', NULL, 'Delaware Courts', '2017-03-23', '2017-03-23', '2027-01-31', '["tax opinion", "deal efforts"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.MATCH_GROUP.2024', '[Match Group, 2024 Del.]', 'Case', 'case_law', 'US-DE', 'In re Match Group, Inc. Derivative Litigation', 'Delaware controller-transaction cleansing authority used for board-process analysis.', NULL, 'In re Match Group, Inc. Derivative Litigation, 2024 Del.', 'Delaware Supreme Court', NULL, 'Delaware Courts', '2024-04-04', '2024-04-04', '2027-01-31', '["controller transaction", "MFW"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.MFW.2014', '[MFW, 2014 Del.]', 'Case', 'case_law', 'US-DE', 'Kahn v. M&F Worldwide Corp.', 'Delaware controller-transaction framework authority.', NULL, 'Kahn v. M&F Worldwide Corp., 2014 Del.', 'Delaware Supreme Court', NULL, 'Delaware Courts', '2014-03-14', '2014-03-14', '2027-01-31', '["MFW", "controller transaction"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.CORWIN.2015', '[Corwin, 2015 Del.]', 'Case', 'case_law', 'US-DE', 'Corwin v. KKR Financial Holdings LLC', 'Delaware stockholder-approval cleansing authority used for board-process analysis.', NULL, 'Corwin v. KKR Financial Holdings LLC, 2015 Del.', 'Delaware Supreme Court', NULL, 'Delaware Courts', '2015-10-02', '2015-10-02', '2027-01-31', '["stockholder approval", "cleansing"]'::jsonb, '{"source_family":"delaware_case_law"}'::jsonb),
  ('AUTH.DE.DGCL_144_SB21_2025', '[DGCL §144, SB 21 2025]', 'DGCL', 'statute', 'US-DE', 'DGCL Section 144 as amended by SB 21', 'Delaware statutory safe-harbor authority used for controller and interested-director transaction process analysis.', NULL, 'DGCL Section 144 / Delaware SB 21', 'Delaware General Assembly', 'https://legis.delaware.gov/BillDetail?LegislationId=141480', 'State of Delaware', '2025-03-25', '2025-03-25', '2027-01-31', '["SB 21", "DGCL 144"]'::jsonb, '{"source_family":"delaware_statute"}'::jsonb),

  ('AUTH.IRC.1202', '[IRC §1202]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 1202', 'Qualified small business stock authority.', NULL, 'IRC Section 1202', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/1202', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["QSBS"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.IRC.338H10', '[IRC §338(h)(10)]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 338(h)(10)', 'Stock purchase election authority used for tax-structure modeling.', NULL, 'IRC Section 338(h)(10)', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/338', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["338(h)(10)"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.IRC.382', '[IRC §382]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 382', 'NOL limitation authority used for tax-attribute modeling.', NULL, 'IRC Section 382', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/382', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["NOL limitation"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.IRC.453', '[IRC §453]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 453', 'Installment method authority used for seller-note and deferred-payment modeling.', NULL, 'IRC Section 453', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/453', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["installment sale"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.IRC.197', '[IRC §197]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 197', 'Amortization of goodwill and intangibles authority used for asset-sale tax modeling.', NULL, 'IRC Section 197', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/197', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["goodwill amortization"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.IRC.1060', '[IRC §1060]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 1060', 'Applicable asset acquisition allocation authority used for purchase-price allocation modeling.', NULL, 'IRC Section 1060', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/1060', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["purchase price allocation"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.IRC.168K', '[IRC §168(k)]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 168(k)', 'Bonus depreciation authority used for tax modeling.', NULL, 'IRC Section 168(k)', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/168', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["bonus depreciation"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.IRC.163J', '[IRC §163(j)]', 'IRC', 'statute', 'US', 'Internal Revenue Code Section 163(j)', 'Business interest limitation authority used for tax modeling.', NULL, 'IRC Section 163(j)', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/26/163', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["business interest limitation"]'::jsonb, '{"source_family":"tax"}'::jsonb),
  ('AUTH.SEC.AI_WASHING.2024_36', '[SEC AI Washing 2024]', 'SEC', 'enforcement', 'US', 'SEC AI-washing enforcement release 2024-36', 'SEC enforcement authority used for AI-claim and marketing-risk guardrails.', '$400K combined civil penalties', 'SEC Release 2024-36', 'U.S. Securities and Exchange Commission', 'https://www.sec.gov/newsroom/press-releases/2024-36', 'SEC', '2024-03-18', '2024-03-18', '2027-01-31', '["AI washing", "Advisers Act"]'::jsonb, '{"source_family":"compliance"}'::jsonb),
  ('AUTH.HSR.ACT.15_USC_18A', '[HSR Act]', 'Antitrust', 'statute', 'US', 'Hart-Scott-Rodino Antitrust Improvements Act', 'HSR premerger notification authority.', NULL, '15 U.S.C. Section 18a', 'U.S. Code', 'https://www.law.cornell.edu/uscode/text/15/18a', 'Legal Information Institute', NULL, NULL, '2027-01-31', '["HSR", "premerger notification"]'::jsonb, '{"source_family":"antitrust"}'::jsonb),
  ('AUTH.CFIUS.31_CFR_800', '[CFIUS 31 CFR Part 800]', 'CFIUS', 'regulation', 'US', 'CFIUS regulations at 31 CFR Part 800', 'CFIUS covered-transaction authority used for foreign-investment issue spotting.', NULL, '31 CFR Part 800', 'eCFR', 'https://www.ecfr.gov/current/title-31/subtitle-B/chapter-VIII/part-800', 'eCFR', NULL, NULL, '2027-01-31', '["CFIUS", "foreign investment"]'::jsonb, '{"source_family":"national_security"}'::jsonb),
  ('AUTH.SMBX.METHODOLOGY.V19', '[METHODOLOGY V19]', 'Methodology', 'internal_standard', 'US', 'smbX Methodology V19', 'Current smbX methodology baseline that DEFINITIVE v1.0 rolls forward into agent-callable contracts.', 'V19 baseline', 'methodology/METHODOLOGY_V19.md', 'smbX', NULL, 'smbX', '2026-05-16', '2026-05-20', '2026-08-20', '["V19"]'::jsonb, '{"source_family":"internal_methodology"}'::jsonb),
  ('AUTH.SMBX.DEFINITIVE.V1', '[DEFINITIVE v1.0]', 'Methodology', 'internal_standard', 'US', 'DEFINITIVE v1.0', 'Current smbX agent-access substrate target: deterministic, citation-validated, methodology-pinned M&A diligence.', 'v1.0 target', 'methodology/DEFINITIVE_BUILD_PLAN.md', 'smbX', NULL, 'smbX', '2026-05-20', '2026-05-20', '2026-08-20', '["DEFINITIVE"]'::jsonb, '{"source_family":"internal_methodology"}'::jsonb)
ON CONFLICT (authority_id) DO UPDATE
  SET cite_tag = EXCLUDED.cite_tag,
      category = EXCLUDED.category,
      authority_type = EXCLUDED.authority_type,
      jurisdiction = EXCLUDED.jurisdiction,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      current_value = EXCLUDED.current_value,
      citation_text = EXCLUDED.citation_text,
      source_name = EXCLUDED.source_name,
      source_url = EXCLUDED.source_url,
      publisher = EXCLUDED.publisher,
      effective_date = EXCLUDED.effective_date,
      as_of_date = EXCLUDED.as_of_date,
      next_check_due = EXCLUDED.next_check_due,
      aliases = EXCLUDED.aliases,
      metadata = EXCLUDED.metadata,
      updated_at = NOW(),
      status = 'active',
      validation_status = 'founder_reviewed';

UPDATE citation_registry cr
SET authority_id = ar.authority_id
FROM authority_register ar
WHERE cr.cite_tag = ar.cite_tag
  AND cr.authority_id IS DISTINCT FROM ar.authority_id;
