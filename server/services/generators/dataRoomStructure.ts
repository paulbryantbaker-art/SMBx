/**
 * Data Room Structure Generator
 *
 * Deterministic data room checklist organized by category.
 * Adapts to journey type (sell/buy/raise) and league.
 * Returns structured markdown checklist.
 */

export interface DataRoomStructureInput {
  business_name?: string;
  industry?: string;
  journey_type: 'sell' | 'buy' | 'raise';
  league: string;
  has_real_estate?: boolean;
  has_employees?: boolean;
  employee_count?: number;
  has_ip?: boolean;
  is_franchise?: boolean;
  has_inventory?: boolean;
  entity_type?: string;
  financials?: Record<string, any>;
}

export function generateDataRoomStructure(input: DataRoomStructureInput): Record<string, any> {
  const isMiddleMarket = ['L3', 'L4', 'L5', 'L6'].includes(input.league);
  const sections: Array<{ title: string; items: string[] }> = [];

  if (input.journey_type === 'raise') {
    sections.push(...buildRaiseDataRoom(input, isMiddleMarket));
  } else {
    sections.push(...buildMandADataRoom(input, isMiddleMarket));
  }

  // Build markdown
  const lines: string[] = [];
  lines.push(`# Data Room Structure — ${input.business_name || 'Deal'}`);
  lines.push('');
  lines.push(`*${input.journey_type === 'raise' ? 'Investor' : 'Buyer'} data room checklist organized by category. Items marked with ★ are critical for ${isMiddleMarket ? 'institutional' : 'SBA/individual'} buyers.*`);
  lines.push('');

  let totalItems = 0;
  for (const section of sections) {
    lines.push(`## ${section.title}`);
    for (const item of section.items) {
      lines.push(`- [ ] ${item}`);
      totalItems++;
    }
    lines.push('');
  }

  lines.push('---');
  lines.push(`**Total documents: ${totalItems}** | Priority items marked with ★`);
  lines.push('');
  lines.push('*Upload documents in order of priority. Your advisor can help identify which items are most important for your specific situation.*');

  return {
    type: 'data_room_structure',
    markdown: lines.join('\n'),
    sections: sections.map(s => ({ title: s.title, item_count: s.items.length })),
    total_items: totalItems,
    generated_at: new Date().toISOString(),
  };
}

function buildMandADataRoom(input: DataRoomStructureInput, isMiddleMarket: boolean): Array<{ title: string; items: string[] }> {
  const sections: Array<{ title: string; items: string[] }> = [];

  // 1. Corporate & Legal
  const legal: string[] = [
    '★ Articles of Incorporation / Organization',
    '★ Operating Agreement / Bylaws',
    '★ Good Standing Certificate (current year)',
    'Business licenses and permits',
    'List of all entities (subsidiaries, affiliates)',
  ];
  if (input.entity_type === 'partnership' || input.entity_type === 'llc') {
    legal.push('Partnership/Operating Agreement amendments');
  }
  if (isMiddleMarket) {
    legal.push('Board meeting minutes (last 3 years)', 'Shareholder agreements', 'Cap table / ownership schedule');
  }
  sections.push({ title: '1. Corporate & Legal', items: legal });

  // 2. Financial
  const financial: string[] = [
    '★ Tax returns (last 3 years)',
    '★ Profit & Loss statements (last 3 years)',
    '★ Balance sheets (last 3 years)',
    '★ Year-to-date financial statements',
    'Bank statements (last 12 months)',
    'Accounts receivable aging report',
    'Accounts payable aging report',
  ];
  if (isMiddleMarket) {
    financial.push(
      '★ Audited or reviewed financial statements',
      'Revenue by customer (top 20)',
      'Revenue by product/service line',
      'Monthly P&L (last 24 months)',
      'Cash flow statements (last 3 years)',
      'Capital expenditure schedule',
      'Debt schedule (all outstanding obligations)',
      'Budget vs actual (current year)',
    );
  } else {
    financial.push('Quickbooks / accounting software backup', 'List of add-backs with documentation');
  }
  sections.push({ title: '2. Financial Statements', items: financial });

  // 3. Tax
  const tax: string[] = [
    '★ Federal tax returns (last 3 years) with all schedules',
    'State tax returns (last 3 years)',
    'Sales tax returns (last 12 months)',
    'Property tax bills (if applicable)',
  ];
  if (isMiddleMarket) {
    tax.push('Transfer pricing documentation', 'Tax audit history', 'R&D tax credit documentation');
  }
  sections.push({ title: '3. Tax Documents', items: tax });

  // 4. Contracts
  const contracts: string[] = [
    '★ Customer contracts (top 10 by revenue)',
    '★ Vendor/supplier agreements',
    '★ Lease agreements (all locations)',
    'Equipment leases',
    'Loan agreements and credit facilities',
    'Non-compete / non-solicitation agreements',
  ];
  if (isMiddleMarket) {
    contracts.push('Government contracts', 'Joint venture agreements', 'Distribution agreements', 'Licensing agreements');
  }
  sections.push({ title: '4. Contracts & Agreements', items: contracts });

  // 5. Operations
  const ops: string[] = [
    'Organization chart',
    'Description of key business processes',
    'List of key customers with tenure',
    'List of key vendors/suppliers',
    'Technology systems inventory',
  ];
  if (input.has_inventory) {
    ops.push('★ Current inventory valuation', 'Inventory turnover report', 'Obsolete inventory assessment');
  }
  sections.push({ title: '5. Operations', items: ops });

  // 6. Employees & HR
  if (input.has_employees !== false) {
    const hr: string[] = [
      `★ Employee roster (${input.employee_count || 'all'} employees)`,
      '★ Compensation schedule (salary, bonus, benefits)',
      'Employee handbook',
      'Benefits summary (health, dental, 401k, etc.)',
      'Employment agreements for key staff',
      'Independent contractor agreements',
    ];
    if (isMiddleMarket) {
      hr.push('Payroll register (last 12 months)', 'Workers comp claims history', 'EEOC/discrimination claims history',
        'Non-compete agreements (employees)', 'Retention bonus agreements');
    }
    sections.push({ title: '6. Employees & HR', items: hr });
  }

  // 7. Real Estate
  if (input.has_real_estate) {
    sections.push({
      title: '7. Real Estate',
      items: [
        '★ Property deed / title report',
        '★ Current lease agreement',
        'Environmental Phase I report',
        'Property appraisal (within 12 months)',
        'Survey / plat map',
        'Zoning confirmation',
        'Property condition report',
        'Insurance certificates for property',
      ],
    });
  }

  // 8. IP
  if (input.has_ip) {
    sections.push({
      title: `${input.has_real_estate ? '8' : '7'}. Intellectual Property`,
      items: [
        '★ Trademark registrations',
        '★ Patent filings and grants',
        'Copyright registrations',
        'Trade secret inventory',
        'Domain name registrations',
        'Software licenses (owned and third-party)',
        'IP assignment agreements',
      ],
    });
  }

  // 9. Insurance
  sections.push({
    title: `${sections.length + 1}. Insurance`,
    items: [
      '★ General liability policy',
      'Property insurance policy',
      'Workers compensation policy',
      'Professional liability / E&O',
      'Key person life insurance',
      'Vehicle / fleet insurance',
      'Claims history (last 5 years)',
    ],
  });

  // 10. Franchise
  if (input.is_franchise) {
    sections.push({
      title: `${sections.length + 1}. Franchise`,
      items: [
        '★ Franchise Disclosure Document (FDD)',
        '★ Franchise Agreement',
        'Franchisor transfer approval requirements',
        'Territory map / exclusivity documentation',
        'Franchisee performance reports',
        'Required vendor list',
      ],
    });
  }

  // 11. Regulatory / Compliance
  const regulatory: string[] = [
    'Business licenses and permits (all locations)',
    'Industry-specific certifications',
    'Pending or threatened litigation',
    'Regulatory correspondence (last 3 years)',
  ];
  if (isMiddleMarket) {
    regulatory.push('Compliance audit reports', 'Data privacy policies (CCPA/GDPR)', 'Environmental compliance records');
  }
  sections.push({ title: `${sections.length + 1}. Regulatory & Compliance`, items: regulatory });

  return sections;
}

function buildRaiseDataRoom(input: DataRoomStructureInput, isMiddleMarket: boolean): Array<{ title: string; items: string[] }> {
  return [
    {
      title: '1. Corporate Documents',
      items: [
        '★ Certificate of Incorporation (and amendments)',
        '★ Bylaws / Operating Agreement',
        '★ Cap table (fully diluted)',
        'Board consents / resolutions',
        'Stockholder agreements',
        'Stock option plan and grants',
        'Previous financing documents (SAFEs, convertible notes, equity rounds)',
      ],
    },
    {
      title: '2. Financial Information',
      items: [
        '★ Financial statements (last 3 years or since inception)',
        '★ Monthly P&L and balance sheet (last 24 months)',
        '★ Financial projections (3-5 year model)',
        '★ Current month financials',
        'Revenue by customer / cohort',
        'Unit economics breakdown',
        'Burn rate and runway analysis',
        'Bank statements (last 6 months)',
      ],
    },
    {
      title: '3. Business Overview',
      items: [
        '★ Investor presentation / pitch deck',
        '★ Executive summary',
        'Product roadmap',
        'Competitive landscape analysis',
        'TAM/SAM/SOM analysis',
        'Customer case studies / testimonials',
      ],
    },
    {
      title: '4. Team',
      items: [
        '★ Founder/executive bios',
        'Organization chart',
        'Key employee agreements',
        'Advisory board members',
        'Hiring plan',
      ],
    },
    {
      title: '5. Legal & IP',
      items: [
        'Patent and trademark filings',
        'Material contracts summary',
        'Pending or threatened litigation',
        'IP assignment agreements (founders and employees)',
        'Terms of Service / Privacy Policy',
      ],
    },
    {
      title: '6. Metrics & KPIs',
      items: [
        '★ KPI dashboard (MRR, churn, CAC, LTV, etc.)',
        'Cohort analysis',
        'Customer acquisition funnel metrics',
        'NPS or customer satisfaction data',
        'Usage / engagement metrics',
      ],
    },
  ];
}
