-- Seed naics_benchmarks with complete market data for all 35 industries
-- Sources: Pepperdine Private Capital Markets 2024, BizBuySell Insight 2024,
--          Damodaran 2024, IBBA Market Pulse 2024, BLS QCEW 2023
--
-- Run: psql $DATABASE_URL -f scripts/seed-naics-benchmarks.sql

-- First ensure the extended columns exist
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS naics_label TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sde_multiple_low NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sde_multiple_mid NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sde_multiple_high NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS ebitda_multiple_low NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS ebitda_multiple_mid NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS ebitda_multiple_high NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS revenue_multiple_low NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS revenue_multiple_high NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS typical_sde_margin_low NUMERIC(5,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS typical_sde_margin_high NUMERIC(5,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS consolidation_level TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sba_approval_rate TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS buyer_competition TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS boomer_ownership_pct INTEGER;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS data_sources TEXT[];
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS notes TEXT;

-- Delete existing national rows so we can insert fresh complete data
DELETE FROM naics_benchmarks WHERE state IS NULL;

-- Insert all 35 industries with complete benchmark data
INSERT INTO naics_benchmarks (
  naics_code, naics_label, state,
  median_firm_revenue_cents, revenue_per_employee_cents, labor_cost_pct, avg_annual_pay_cents,
  sde_multiple_low, sde_multiple_mid, sde_multiple_high,
  ebitda_multiple_low, ebitda_multiple_mid, ebitda_multiple_high,
  revenue_multiple_low, revenue_multiple_high,
  typical_sde_margin_low, typical_sde_margin_high,
  consolidation_level, sba_approval_rate, buyer_competition, boomer_ownership_pct,
  data_year, source, data_sources, notes
) VALUES

-- 1. HVAC
('238220', 'HVAC', NULL,
 250000000, 17500000, 0.37, 5800000,
 2.50, 3.50, 4.50,  4.00, 5.50, 7.00,  0.50, 1.20,
 15.00, 25.00,
 'very_active', 'strong', 'dense', 50,
 2024, 'Pepperdine/BizBuySell/IBBA',
 ARRAY['Pepperdine PCM 2024', 'BizBuySell Insight 2024', 'IBBA Market Pulse 2024'],
 'Recurring maintenance contracts drive premium. PE roll-up most mature in home services.'),

-- 2. Pest Control
('561210', 'Pest Control', NULL,
 150000000, 13000000, 0.40, 3600000,
 3.00, 4.00, 5.00,  5.00, 6.50, 8.00,  0.80, 1.50,
 18.00, 30.00,
 'very_active', 'strong', 'very_dense', 45,
 2024, 'Pepperdine/BizBuySell/IBBA',
 ARRAY['Pepperdine PCM 2024', 'BizBuySell Insight 2024'],
 'Highest recurring revenue in home services. Rentokil and Anticimex driving consolidation.'),

-- 3. Landscaping
('561730', 'Landscaping', NULL,
 120000000, 8000000, 0.47, 3400000,
 2.00, 2.75, 3.50,  3.50, 4.50, 5.50,  0.30, 0.80,
 12.00, 22.00,
 'active', 'moderate', 'moderate', 45,
 2024, 'Pepperdine/BizBuySell',
 ARRAY['Pepperdine PCM 2024', 'BizBuySell Insight 2024', 'BLS QCEW 2023'],
 'Seasonal in northern climates. H-2B visa dependency is key risk.'),

-- 4. Plumbing
('238110', 'Plumbing', NULL,
 200000000, 16000000, 0.40, 5500000,
 2.50, 3.25, 4.00,  4.00, 5.25, 6.50,  0.40, 1.00,
 15.00, 25.00,
 'active', 'strong', 'growing', 65,
 2024, 'Pepperdine/BizBuySell/IBBA',
 ARRAY['Pepperdine PCM 2024', 'BizBuySell Insight 2024'],
 'Following HVAC consolidation playbook, 2-3 years behind. License transfer critical.'),

-- 5. Electrical Contracting
('238210', 'Electrical Contracting', NULL,
 220000000, 16500000, 0.42, 6000000,
 2.50, 3.25, 4.00,  4.00, 5.00, 6.00,  0.40, 0.90,
 12.00, 22.00,
 'active', 'strong', 'growing', 62,
 2024, 'Pepperdine/BizBuySell',
 ARRAY['Pepperdine PCM 2024', 'BLS QCEW 2023'],
 'Electrification tailwind (EV, solar, data centers) accelerating PE interest.'),

-- 6. Commercial Cleaning
('561720', 'Commercial Cleaning', NULL,
 100000000, 4500000, 0.62, 2800000,
 2.00, 2.75, 3.50,  3.00, 4.25, 5.50,  0.30, 0.70,
 10.00, 18.00,
 'emerging', 'strong', 'moderate', 50,
 2024, 'BizBuySell/BLS',
 ARRAY['BizBuySell Insight 2024', 'BLS QCEW 2023'],
 'Contract-based recurring revenue. I-9 compliance critical in DD.'),

-- 7. Residential Cleaning
('561722', 'Residential Cleaning', NULL,
 50000000, 5000000, 0.52, 2600000,
 1.50, 2.25, 3.00,  2.50, 3.50, 4.50,  0.30, 0.60,
 15.00, 28.00,
 'none', 'moderate', 'thin', 42,
 2024, 'BizBuySell',
 ARRAY['BizBuySell Insight 2024'],
 'Entry-level acquisition. Owner must NOT be cleaning to have transferable value.'),

-- 8. Roofing
('238160', 'Roofing', NULL,
 180000000, 13000000, 0.42, 4800000,
 2.00, 2.75, 3.50,  3.00, 4.00, 5.00,  0.30, 0.70,
 12.00, 22.00,
 'emerging', 'moderate', 'moderate', 48,
 2024, 'BizBuySell/Pepperdine',
 ARRAY['Pepperdine PCM 2024', 'BizBuySell Insight 2024'],
 'Storm-driven revenue must be normalized. Safety record critical.'),

-- 9. Pool Service
('561790', 'Pool Service', NULL,
 80000000, 10000000, 0.37, 3600000,
 2.50, 3.25, 4.00,  3.50, 4.50, 5.50,  0.50, 1.00,
 20.00, 35.00,
 'emerging', 'strong', 'moderate', 35,
 2024, 'BizBuySell',
 ARRAY['BizBuySell Insight 2024'],
 'Route-based recurring revenue. Sun Belt only for year-round economics.'),

-- 10. Auto Repair
('811111', 'Auto Repair', NULL,
 150000000, 15000000, 0.37, 4200000,
 2.00, 2.75, 3.50,  3.00, 4.00, 5.00,  0.30, 0.70,
 15.00, 25.00,
 'emerging', 'strong', 'moderate', 67,
 2024, 'BizBuySell/Pepperdine',
 ARRAY['Pepperdine PCM 2024', 'BizBuySell Insight 2024'],
 'Environmental Phase I required. EV transition both risk and opportunity.'),

-- 11. Car Wash
('811192', 'Car Wash', NULL,
 200000000, 25000000, 0.22, 3200000,
 3.00, 4.00, 5.00,  5.00, 6.50, 8.00,  1.00, 2.50,
 25.00, 40.00,
 'very_active', 'challenging', 'very_dense', 32,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'Express tunnel membership model. Capital-intensive. PE cooling from 2023 peak.'),

-- 12. Self-Storage
('531130', 'Self-Storage', NULL,
 60000000, 35000000, 0.15, 4500000,
 4.00, 5.50, 7.00,  8.00, 11.00, 14.00,  2.00, 4.00,
 35.00, 55.00,
 'very_active', 'challenging', 'dense', 45,
 2024, 'Pepperdine/Damodaran',
 ARRAY['Pepperdine PCM 2024', 'Damodaran 2024'],
 'Cap-rate driven, essentially real estate. 6-8% cap rates for stabilized facilities.'),

-- 13. Laundromat
('812310', 'Laundromat', NULL,
 40000000, 15000000, 0.10, 2800000,
 2.00, 2.75, 3.50,  3.00, 4.00, 5.00,  0.50, 1.50,
 25.00, 40.00,
 'none', 'strong', 'thin', 55,
 2024, 'BizBuySell',
 ARRAY['BizBuySell Insight 2024'],
 'Semi-absentee classic. Equipment age and lease terms dominate valuation.'),

-- 14. Dental Practice
('621210', 'Dental Practice', NULL,
 150000000, 25000000, 0.30, 7500000,
 1.50, 2.75, 4.00,  5.00, 7.00, 9.00,  0.60, 1.20,
 25.00, 40.00,
 'very_active', 'strong', 'dense', 57,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'DSO model well-established. Solo GP vs multi-provider drives multiple dramatically.'),

-- 15. Optometry
('621320', 'Optometry', NULL,
 100000000, 22000000, 0.28, 5200000,
 2.00, 2.75, 3.50,  4.00, 5.50, 7.00,  0.50, 1.00,
 25.00, 38.00,
 'active', 'strong', 'growing', 48,
 2024, 'Pepperdine',
 ARRAY['Pepperdine PCM 2024'],
 'Following dental consolidation model. MyEyeDr, EyeCare Partners active.'),

-- 16. Veterinary Practice
('541940', 'Veterinary Practice', NULL,
 180000000, 19000000, 0.47, 7000000,
 3.00, 4.00, 5.00,  6.00, 9.00, 12.00,  1.00, 2.00,
 18.00, 30.00,
 'very_active', 'strong', 'very_dense', 50,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'Strongest healthcare PE vertical. Mars, NVA, Pathway, SVP all competing.'),

-- 17. Physical Therapy
('621340', 'Physical Therapy', NULL,
 120000000, 14000000, 0.47, 6500000,
 2.00, 2.75, 3.50,  4.00, 5.50, 7.00,  0.50, 1.00,
 18.00, 30.00,
 'active', 'strong', 'moderate', 45,
 2024, 'Pepperdine',
 ARRAY['Pepperdine PCM 2024'],
 'Referral dependency risk. Multi-site operations command premium.'),

-- 18. Home Healthcare
('621610', 'Home Healthcare', NULL,
 300000000, 6500000, 0.67, 3500000,
 2.50, 3.25, 4.00,  5.00, 7.00, 9.00,  0.40, 0.80,
 10.00, 20.00,
 'very_active', 'moderate', 'dense', 42,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'Medicare certification is the key asset. Entity sale required to preserve.'),

-- 19. Pharmacy
('446110', 'Pharmacy', NULL,
 350000000, 50000000, 0.15, 6000000,
 2.00, 2.75, 3.50,  3.50, 4.75, 6.00,  0.15, 0.30,
 8.00, 15.00,
 'low', 'moderate', 'thin', 58,
 2024, 'BizBuySell/Damodaran',
 ARRAY['BizBuySell Insight 2024', 'Damodaran 2024'],
 'PBM compression is real headwind. Specialty and compounding segments outperforming.'),

-- 20. Hair Salon / Barbershop
('812111', 'Hair Salon', NULL,
 40000000, 7000000, 0.48, 2600000,
 1.50, 2.00, 2.50,  2.50, 3.25, 4.00,  0.30, 0.60,
 15.00, 30.00,
 'none', 'moderate', 'thin', 52,
 2024, 'BizBuySell',
 ARRAY['BizBuySell Insight 2024'],
 'Revenue walks on two legs. Commission model more valuable than booth rental.'),

-- 21. Fitness / Gym
('713940', 'Fitness / Gym', NULL,
 80000000, 10000000, 0.35, 3500000,
 2.00, 2.75, 3.50,  3.00, 4.50, 6.00,  0.50, 1.20,
 15.00, 30.00,
 'emerging', 'moderate', 'moderate', 30,
 2024, 'BizBuySell',
 ARRAY['BizBuySell Insight 2024'],
 'Post-COVID recovery uneven. Membership retention is the critical metric.'),

-- 22. CPA / Accounting Firm
('541211', 'CPA / Accounting', NULL,
 100000000, 16000000, 0.42, 8200000,
 1.50, 2.75, 4.00,  4.00, 5.50, 7.00,  1.00, 1.50,
 30.00, 45.00,
 'active', 'strong', 'growing', 62,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'Revenue multiple is industry standard metric. 90%+ client retention.'),

-- 23. Staffing Agency
('561311', 'Staffing Agency', NULL,
 300000000, 15000000, 0.72, 4500000,
 2.50, 3.25, 4.00,  4.00, 5.50, 7.00,  0.15, 0.40,
 8.00, 15.00,
 'active', 'challenging', 'moderate', 52,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'Working capital intensity is the key constraint. Specialty staffing commands premium.'),

-- 24. IT Services / MSP
('541512', 'IT Services / MSP', NULL,
 150000000, 20000000, 0.42, 11000000,
 3.00, 4.00, 5.00,  5.00, 6.50, 8.00,  0.80, 1.50,
 15.00, 28.00,
 'very_active', 'strong', 'very_dense', 30,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'MRR-based model commands premium. Cybersecurity driving demand.'),

-- 25. Marketing Agency
('541810', 'Marketing Agency', NULL,
 80000000, 13000000, 0.52, 6500000,
 2.00, 2.75, 3.50,  3.50, 4.75, 6.00,  0.40, 0.80,
 15.00, 30.00,
 'emerging', 'moderate', 'moderate', 28,
 2024, 'BizBuySell',
 ARRAY['BizBuySell Insight 2024'],
 'Retainer revenue vs project revenue drives valuation. Niche > generalist.'),

-- 26. Insurance Agency
('524210', 'Insurance Agency', NULL,
 100000000, 22000000, 0.37, 6500000,
 2.50, 3.25, 4.00,  6.00, 9.00, 12.00,  1.50, 3.00,
 25.00, 40.00,
 'extremely_active', 'strong', 'extremely_dense', 58,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'Most in-demand PE vertical. 100+ active platforms. Revenue multiple standard.'),

-- 27. Contract Manufacturing
('332710', 'Contract Manufacturing', NULL,
 300000000, 14000000, 0.38, 5000000,
 2.50, 3.25, 4.00,  4.00, 5.25, 6.50,  0.30, 0.80,
 12.00, 22.00,
 'active', 'moderate', 'moderate', 63,
 2024, 'Pepperdine/Damodaran',
 ARRAY['Pepperdine PCM 2024', 'Damodaran 2024'],
 'Reshoring tailwind. AS9100/ITAR certifications add significant premium.'),

-- 28. Food Manufacturing
('311000', 'Food Manufacturing', NULL,
 400000000, 16000000, 0.27, 3800000,
 2.50, 3.50, 4.50,  5.00, 6.50, 8.00,  0.50, 1.20,
 10.00, 20.00,
 'active', 'moderate', 'moderate', 55,
 2024, 'Pepperdine/Damodaran',
 ARRAY['Pepperdine PCM 2024', 'Damodaran 2024'],
 'Branded > private label. GFSI certification (SQF, BRC) required.'),

-- 29. Trucking
('484110', 'Trucking', NULL,
 350000000, 20000000, 0.42, 5200000,
 2.00, 2.75, 3.50,  3.50, 4.75, 6.00,  0.20, 0.50,
 8.00, 18.00,
 'active', 'challenging', 'moderate', 63,
 2024, 'Pepperdine/Damodaran',
 ARRAY['Pepperdine PCM 2024', 'Damodaran 2024'],
 'Cyclical. Specialized freight (reefer, flatbed, hazmat) commands premium.'),

-- 30. Logistics / 3PL
('488510', 'Logistics / 3PL', NULL,
 500000000, 12000000, 0.42, 4500000,
 3.00, 4.00, 5.00,  5.00, 7.00, 9.00,  0.40, 1.00,
 10.00, 20.00,
 'very_active', 'moderate', 'dense', 40,
 2024, 'Pepperdine/Damodaran',
 ARRAY['Pepperdine PCM 2024', 'Damodaran 2024'],
 'eCommerce fulfillment driving demand. Technology (WMS) differentiates.'),

-- 31. SaaS / Software
('511210', 'SaaS / Software', NULL,
 300000000, 30000000, 0.58, 12000000,
 4.00, 6.00, 8.00,  8.00, 14.00, 20.00,  3.00, 10.00,
 15.00, 35.00,
 'extremely_active', 'n/a', 'very_dense', 15,
 2024, 'Pepperdine/Damodaran',
 ARRAY['Pepperdine PCM 2024', 'Damodaran 2024'],
 'Revenue multiple is primary metric. Rule of 40 drives premium pricing.'),

-- 32. eCommerce
('454110', 'eCommerce', NULL,
 200000000, 50000000, 0.10, 6000000,
 2.50, 3.25, 4.00,  3.50, 4.75, 6.00,  0.30, 0.80,
 12.00, 25.00,
 'moderate', 'moderate', 'moderate', 12,
 2024, 'BizBuySell/Damodaran',
 ARRAY['BizBuySell Insight 2024', 'Damodaran 2024'],
 'Aggregator thesis cooled. Branded DTC with repeat purchase rates command premium.'),

-- 33. Funeral Home
('812210', 'Funeral Home', NULL,
 150000000, 13000000, 0.32, 4500000,
 3.00, 4.00, 5.00,  5.00, 7.00, 9.00,  1.00, 2.00,
 20.00, 35.00,
 'active', 'strong', 'moderate', 72,
 2024, 'Pepperdine/IBBA',
 ARRAY['Pepperdine PCM 2024', 'IBBA Market Pulse 2024'],
 'Demographic certainty. Pre-need contract book is key asset. Real estate usually included.'),

-- 34. Childcare / Daycare
('624410', 'Childcare / Daycare', NULL,
 80000000, 4500000, 0.62, 2800000,
 2.00, 2.75, 3.50,  3.50, 4.75, 6.00,  0.40, 0.80,
 12.00, 22.00,
 'emerging', 'strong', 'moderate', 42,
 2024, 'BizBuySell',
 ARRAY['BizBuySell Insight 2024'],
 'Essential infrastructure. Waitlist demand common in quality centers.'),

-- 35. Franchise (General)
('000000', 'Franchise (General)', NULL,
 150000000, 12000000, 0.40, 4000000,
 1.50, 2.75, 4.00,  3.00, 5.00, 7.00,  0.30, 1.00,
 12.00, 25.00,
 'active', 'strong', 'moderate', 40,
 2024, 'BizBuySell/Pepperdine',
 ARRAY['BizBuySell Insight 2024', 'Pepperdine PCM 2024'],
 'Varies dramatically by brand. FDD Item 19 is the benchmark. SBA Franchise Directory pre-approved.');

-- Verify insert
SELECT naics_code, naics_label, sde_multiple_low, sde_multiple_high, ebitda_multiple_low, ebitda_multiple_high
FROM naics_benchmarks
WHERE state IS NULL
ORDER BY naics_code;
