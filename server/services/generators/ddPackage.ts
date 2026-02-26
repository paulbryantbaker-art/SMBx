/**
 * Due Diligence Package Generator
 *
 * Generates a DD checklist + request list customized by league and deal type.
 * Deterministic — no AI calls.
 * All financial values in CENTS.
 */

export interface DDInput {
  business_name?: string;
  industry?: string;
  league: string;
  deal_structure: 'asset' | 'stock' | 'hybrid';
  has_real_estate?: boolean;
  has_ip?: boolean;
  has_employees?: boolean;
  has_inventory?: boolean;
  is_franchise?: boolean;
  is_regulated?: boolean;
  deal_size?: number;            // cents
  buyer_type?: 'individual' | 'pe' | 'strategic' | 'search_fund';
}

export interface DDCategory {
  category: string;
  priority: 'critical' | 'important' | 'nice_to_have';
  items: Array<{
    item: string;
    description: string;
    typical_source: string;
    deadline_days: number;
  }>;
}

export interface DDPackageReport {
  type: 'dd_package';
  business_name: string;
  league: string;
  total_items: number;
  categories: DDCategory[];
  timeline: {
    phase_1_days: number;  // critical items
    phase_2_days: number;  // important items
    phase_3_days: number;  // nice to have
    total_days: number;
  };
  red_flag_checklist: string[];
  generated_at: string;
}

export function generateDDPackage(input: DDInput): DDPackageReport {
  const leagueRank: Record<string, number> = { L1: 1, L2: 2, L3: 3, L4: 4, L5: 5, L6: 6 };
  const rank = leagueRank[input.league] || 1;

  const categories: DDCategory[] = [];

  // ─── Financial DD ──────────────────────────────────────────
  const financialItems: DDCategory['items'] = [
    { item: 'Tax Returns (3 years)', description: 'Federal and state tax returns with all schedules', typical_source: 'CPA / Owner', deadline_days: 7 },
    { item: 'P&L Statements (3 years)', description: 'Monthly or annual profit & loss statements', typical_source: 'Accounting software', deadline_days: 7 },
    { item: 'Balance Sheet (current)', description: 'Most recent balance sheet', typical_source: 'Accounting software', deadline_days: 7 },
    { item: 'Bank Statements (12 months)', description: 'All business bank accounts', typical_source: 'Bank', deadline_days: 10 },
    { item: 'Accounts Receivable Aging', description: 'Current AR aging report', typical_source: 'Accounting software', deadline_days: 7 },
    { item: 'Accounts Payable Aging', description: 'Current AP aging report', typical_source: 'Accounting software', deadline_days: 7 },
    { item: 'Add-Back Documentation', description: 'Documentation for all SDE/EBITDA add-backs', typical_source: 'Owner / CPA', deadline_days: 14 },
  ];

  if (rank >= 3) {
    financialItems.push(
      { item: 'Audited/Reviewed Financials', description: 'CPA-reviewed or audited statements', typical_source: 'CPA', deadline_days: 14 },
      { item: 'Cash Flow Projections', description: '3-year forward projections with assumptions', typical_source: 'Management', deadline_days: 14 },
      { item: 'Working Capital Analysis', description: 'Trailing 12-month working capital calculation', typical_source: 'CPA', deadline_days: 14 },
    );
  }

  if (rank >= 5) {
    financialItems.push(
      { item: 'Quality of Earnings Report', description: 'Third-party QofE analysis', typical_source: 'Accounting firm', deadline_days: 30 },
      { item: 'Revenue Recognition Analysis', description: 'How revenue is recognized and deferred', typical_source: 'Controller', deadline_days: 14 },
    );
  }

  categories.push({ category: 'Financial', priority: 'critical', items: financialItems });

  // ─── Legal DD ──────────────────────────────────────────────
  const legalItems: DDCategory['items'] = [
    { item: 'Entity Formation Documents', description: 'Articles of incorporation/organization, operating agreement', typical_source: 'Attorney', deadline_days: 7 },
    { item: 'Contracts & Agreements', description: 'All material contracts (customer, vendor, partner)', typical_source: 'Owner', deadline_days: 14 },
    { item: 'Litigation History', description: 'Any pending or past litigation', typical_source: 'Attorney', deadline_days: 7 },
    { item: 'Insurance Policies', description: 'All business insurance policies and claims history', typical_source: 'Insurance agent', deadline_days: 10 },
  ];

  if (rank >= 3) {
    legalItems.push(
      { item: 'Permits & Licenses', description: 'All business permits, licenses, certifications', typical_source: 'Owner', deadline_days: 14 },
      { item: 'Lease Agreements', description: 'All real estate and equipment leases', typical_source: 'Owner', deadline_days: 7 },
    );
  }

  if (input.has_ip) {
    legalItems.push(
      { item: 'IP Portfolio', description: 'Patents, trademarks, copyrights, trade secrets', typical_source: 'IP attorney', deadline_days: 14 },
    );
  }

  if (input.is_franchise) {
    legalItems.push(
      { item: 'Franchise Agreement', description: 'Franchise disclosure document and agreement', typical_source: 'Franchisor', deadline_days: 14 },
      { item: 'Franchise Transfer Approval', description: 'Process and requirements for transfer', typical_source: 'Franchisor', deadline_days: 21 },
    );
  }

  categories.push({ category: 'Legal', priority: 'critical', items: legalItems });

  // ─── Operational DD ────────────────────────────────────────
  const opItems: DDCategory['items'] = [
    { item: 'Customer List (anonymized)', description: 'Top 10-20 customers with revenue concentration', typical_source: 'Owner', deadline_days: 7 },
    { item: 'Vendor/Supplier List', description: 'Key vendors with terms and alternatives', typical_source: 'Owner', deadline_days: 10 },
    { item: 'Organizational Chart', description: 'Current org structure and reporting lines', typical_source: 'Owner / HR', deadline_days: 7 },
  ];

  if (input.has_employees) {
    opItems.push(
      { item: 'Employee Census', description: 'Names, roles, tenure, compensation', typical_source: 'HR / Payroll', deadline_days: 10 },
      { item: 'Employee Benefits Summary', description: 'Health, retirement, PTO policies', typical_source: 'HR', deadline_days: 10 },
    );
  }

  if (input.has_inventory) {
    opItems.push(
      { item: 'Inventory Report', description: 'Current inventory valuation and aging', typical_source: 'Warehouse / ERP', deadline_days: 10 },
    );
  }

  if (rank >= 3) {
    opItems.push(
      { item: 'Technology Systems Inventory', description: 'Software, hardware, SaaS subscriptions', typical_source: 'IT / Owner', deadline_days: 14 },
      { item: 'Standard Operating Procedures', description: 'Key SOPs and process documentation', typical_source: 'Management', deadline_days: 21 },
    );
  }

  categories.push({ category: 'Operational', priority: 'important', items: opItems });

  // ─── Real Estate DD ────────────────────────────────────────
  if (input.has_real_estate) {
    categories.push({
      category: 'Real Estate',
      priority: 'important',
      items: [
        { item: 'Property Appraisal', description: 'Current market value appraisal', typical_source: 'Appraiser', deadline_days: 21 },
        { item: 'Environmental Assessment (Phase I)', description: 'Environmental site assessment', typical_source: 'Environmental firm', deadline_days: 30 },
        { item: 'Property Survey', description: 'Current property survey', typical_source: 'Surveyor', deadline_days: 21 },
        { item: 'Zoning Verification', description: 'Confirm current zoning allows business use', typical_source: 'Municipality', deadline_days: 14 },
      ],
    });
  }

  // ─── Regulatory DD ─────────────────────────────────────────
  if (input.is_regulated || rank >= 4) {
    categories.push({
      category: 'Regulatory & Compliance',
      priority: rank >= 4 ? 'critical' : 'important',
      items: [
        { item: 'Regulatory Compliance History', description: 'Any regulatory actions, fines, or violations', typical_source: 'Owner / Attorney', deadline_days: 14 },
        { item: 'License Transferability', description: 'Confirm all licenses transfer with sale', typical_source: 'Regulatory body', deadline_days: 21 },
        { item: 'Environmental Compliance', description: 'Environmental permits and compliance records', typical_source: 'Owner', deadline_days: 14 },
      ],
    });
  }

  // ─── Tax DD (L3+) ─────────────────────────────────────────
  if (rank >= 3) {
    categories.push({
      category: 'Tax',
      priority: 'important',
      items: [
        { item: 'Sales Tax Compliance', description: 'Sales tax filings and nexus analysis', typical_source: 'CPA', deadline_days: 14 },
        { item: 'Payroll Tax Compliance', description: 'Payroll tax filings and status', typical_source: 'Payroll provider', deadline_days: 10 },
        { item: 'Tax Structure Analysis', description: 'Entity structure tax implications for buyer', typical_source: 'Tax attorney', deadline_days: 21 },
      ],
    });
  }

  // ─── Timeline ──────────────────────────────────────────────
  const phase1 = rank <= 2 ? 14 : rank <= 4 ? 21 : 30;
  const phase2 = rank <= 2 ? 21 : rank <= 4 ? 30 : 45;
  const phase3 = rank <= 2 ? 30 : rank <= 4 ? 45 : 60;

  // ─── Red flags ─────────────────────────────────────────────
  const redFlags = [
    'Revenue declining >10% without clear explanation',
    'Customer concentration >30% in single customer',
    'Pending or threatened litigation',
    'Missing or incomplete tax returns',
    'Significant off-book transactions (cash economy)',
    'Key employee flight risk',
    'Lease expiring within 12 months without renewal option',
    'Environmental contamination risk',
    'Owner performing >60% of revenue-generating work',
    'Deferred maintenance or capital expenditure backlog',
  ];

  if (rank >= 3) {
    redFlags.push(
      'Material discrepancies between tax returns and internal financials',
      'Unusual related-party transactions',
      'Working capital below industry norms',
    );
  }

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return {
    type: 'dd_package',
    business_name: input.business_name || 'Business',
    league: input.league,
    total_items: totalItems,
    categories,
    timeline: {
      phase_1_days: phase1,
      phase_2_days: phase2,
      phase_3_days: phase3,
      total_days: phase3,
    },
    red_flag_checklist: redFlags,
    generated_at: new Date().toISOString(),
  };
}
