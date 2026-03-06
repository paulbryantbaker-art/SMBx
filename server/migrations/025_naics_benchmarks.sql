-- Session 14-15: NAICS Benchmarks + Revenue Estimation data

CREATE TABLE IF NOT EXISTS naics_benchmarks (
  naics_code TEXT NOT NULL,
  state TEXT,               -- null for national average
  avg_annual_pay_cents BIGINT,
  revenue_per_employee_cents BIGINT,
  labor_cost_pct NUMERIC(4,2),
  median_firm_revenue_cents BIGINT,
  data_year INTEGER,
  source TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (naics_code, COALESCE(state, 'US'))
);

-- Seed with common SMB acquisition industry national averages
-- Source: BLS QCEW 2023 + Census SUSB 2022 + Damodaran RPE
INSERT INTO naics_benchmarks (naics_code, state, avg_annual_pay_cents, revenue_per_employee_cents, labor_cost_pct, median_firm_revenue_cents, data_year, source) VALUES
('2382', NULL, 5800000, 18500000, 0.30, 95000000, 2023, 'BLS QCEW + Damodaran'),
('5612', NULL, 3600000, 12000000, 0.28, 65000000, 2023, 'BLS QCEW + Damodaran'),
('5617', NULL, 3400000, 11000000, 0.32, 55000000, 2023, 'BLS QCEW + Damodaran'),
('8111', NULL, 4200000, 14000000, 0.30, 72000000, 2023, 'BLS QCEW + Damodaran'),
('6211', NULL, 7500000, 28000000, 0.35, 120000000, 2023, 'BLS QCEW + Damodaran'),
('7225', NULL, 2800000, 8500000, 0.30, 85000000, 2023, 'BLS QCEW + Damodaran'),
('5411', NULL, 9500000, 22000000, 0.45, 150000000, 2023, 'BLS QCEW + Damodaran'),
('5412', NULL, 8200000, 20000000, 0.42, 130000000, 2023, 'BLS QCEW + Damodaran'),
('6213', NULL, 5200000, 21000000, 0.38, 110000000, 2023, 'BLS QCEW + Damodaran'),
('5415', NULL, 11000000, 25000000, 0.40, 200000000, 2023, 'BLS QCEW + Damodaran'),
('5242', NULL, 6500000, 30000000, 0.25, 95000000, 2023, 'BLS QCEW + Damodaran'),
('5312', NULL, 5000000, 18000000, 0.28, 80000000, 2023, 'BLS QCEW + Damodaran'),
('8121', NULL, 2600000, 9000000, 0.35, 35000000, 2023, 'BLS QCEW + Damodaran'),
('2389', NULL, 5500000, 17000000, 0.30, 120000000, 2023, 'BLS QCEW + Damodaran'),
('4411', NULL, 5800000, 50000000, 0.12, 500000000, 2023, 'BLS QCEW + Damodaran'),
('5613', NULL, 4500000, 12000000, 0.38, 85000000, 2023, 'BLS QCEW + Damodaran'),
('4451', NULL, 3200000, 35000000, 0.10, 250000000, 2023, 'BLS QCEW + Damodaran'),
('5416', NULL, 10000000, 22000000, 0.45, 180000000, 2023, 'BLS QCEW + Damodaran')
ON CONFLICT DO NOTHING;
