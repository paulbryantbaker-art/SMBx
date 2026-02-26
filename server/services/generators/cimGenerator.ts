/**
 * CIM (Confidential Information Memorandum) Generator
 *
 * Flagship deliverable — league-adapted document.
 * L1/L2: 10-15 pages, L3/L4: 25-40 pages, L5/L6: 40-60 pages.
 * Uses Claude Opus for the highest quality output.
 */
import Anthropic from '@anthropic-ai/sdk';

const OPUS_MODEL = 'claude-opus-4-20250514';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface CIMInput {
  business_name: string;
  industry: string;
  location: string;
  league: string;
  revenue: number;           // cents
  sde?: number;              // cents
  ebitda?: number;           // cents
  owner_salary?: number;     // cents
  employee_count?: number;
  years_in_business?: number;
  growth_rate?: number;
  products_services?: string;
  customer_profile?: string;
  competitive_advantages?: string;
  growth_opportunities?: string;
  reason_for_selling?: string;
  facilities?: string;
  technology?: string;
  key_employees?: string;
  asking_price?: number;     // cents
  financials?: Record<string, any>;
  seven_factor_scores?: Record<string, number>;
}

export interface CIMSection {
  title: string;
  content: string;
  page_estimate: number;
}

export interface CIMDocument {
  type: 'cim';
  business_name: string;
  league: string;
  sections: CIMSection[];
  total_pages_estimate: number;
  generated_at: string;
}

export async function generateCIM(input: CIMInput): Promise<CIMDocument> {
  const sectionDefs = getCIMSections(input.league);
  const sections: CIMSection[] = [];

  // Build context for Claude
  const dealContext = buildDealContext(input);

  // Generate each section with Claude
  for (const sectionDef of sectionDefs) {
    const content = await generateSection(sectionDef, dealContext, input);
    sections.push({
      title: sectionDef.title,
      content,
      page_estimate: sectionDef.pages,
    });
  }

  const totalPages = sections.reduce((sum, s) => sum + s.page_estimate, 0);

  return {
    type: 'cim',
    business_name: input.business_name,
    league: input.league,
    sections,
    total_pages_estimate: totalPages,
    generated_at: new Date().toISOString(),
  };
}

interface SectionDef {
  title: string;
  pages: number;
  prompt: string;
  leagueMin: string; // minimum league for this section
}

function getCIMSections(league: string): SectionDef[] {
  const leagueRank: Record<string, number> = { L1: 1, L2: 2, L3: 3, L4: 4, L5: 5, L6: 6 };
  const rank = leagueRank[league] || 1;

  const allSections: SectionDef[] = [
    // Core sections (all leagues)
    {
      title: 'Executive Summary',
      pages: rank <= 2 ? 1 : 2,
      prompt: 'Write a compelling executive summary. Include: company overview, key financial highlights, investment thesis, and transaction overview. Make this the section that hooks a buyer.',
      leagueMin: 'L1',
    },
    {
      title: 'Business Overview',
      pages: rank <= 2 ? 2 : 3,
      prompt: 'Describe the business in detail: what it does, how it operates, its history, and what makes it special. Include company structure, business model, and value proposition.',
      leagueMin: 'L1',
    },
    {
      title: 'Products & Services',
      pages: rank <= 2 ? 1 : 2,
      prompt: 'Detail the products/services offered, revenue breakdown by line, pricing model, and competitive positioning of each offering.',
      leagueMin: 'L1',
    },
    {
      title: 'Financial Summary',
      pages: rank <= 2 ? 2 : 3,
      prompt: 'Present the financial story: revenue trends, profitability, SDE/EBITDA calculation with add-backs clearly shown, and key financial ratios. Use tables and show 3 years of data where available.',
      leagueMin: 'L1',
    },
    {
      title: 'Growth Opportunities',
      pages: 1,
      prompt: 'Identify specific, actionable growth opportunities a new owner could pursue. Be concrete — reference the business data, not generic advice. Include estimated financial impact where possible.',
      leagueMin: 'L1',
    },
    {
      title: 'Transaction Overview',
      pages: 1,
      prompt: 'Outline the transaction: what is being sold, asking price range, deal structure preferences, transition plan, and next steps for interested buyers.',
      leagueMin: 'L1',
    },

    // L3+ sections
    {
      title: 'Market Analysis',
      pages: rank <= 4 ? 3 : 5,
      prompt: 'Analyze the market: industry size, growth trends, competitive landscape, barriers to entry, regulatory environment. Reference industry-specific data and trends.',
      leagueMin: 'L3',
    },
    {
      title: 'Management & Organization',
      pages: 2,
      prompt: 'Describe the management team and organizational structure. Identify key employees, their roles, tenure, and replaceability. Address owner dependency directly.',
      leagueMin: 'L3',
    },
    {
      title: 'Customer Analysis',
      pages: 2,
      prompt: 'Analyze the customer base: concentration, retention rates, contract types, top customer relationships (anonymized), revenue diversification. Flag any concentration risks.',
      leagueMin: 'L3',
    },
    {
      title: 'Facilities & Equipment',
      pages: 1,
      prompt: 'Describe facilities, equipment, technology infrastructure. Include lease terms, equipment condition, and capex requirements.',
      leagueMin: 'L3',
    },
    {
      title: 'Technology & Systems',
      pages: 1,
      prompt: 'Detail technology stack, key software systems, IP assets, proprietary processes. Assess technology modernization needs.',
      leagueMin: 'L3',
    },
    {
      title: 'Historical Financial Detail',
      pages: rank <= 4 ? 5 : 7,
      prompt: 'Present detailed historical financials: multi-year P&L, balance sheet highlights, cash flow analysis, working capital trends, capex history. Include the EBITDA normalization bridge.',
      leagueMin: 'L3',
    },
    {
      title: 'Adjusted EBITDA Reconciliation',
      pages: 2,
      prompt: 'Build the complete EBITDA reconciliation: start from reported net income, add back each adjustment with justification. Show the bridge clearly.',
      leagueMin: 'L3',
    },

    // L5+ sections
    {
      title: 'Industry Landscape & Competitive Positioning',
      pages: 5,
      prompt: 'Deep industry analysis: Porter\'s Five Forces, competitive positioning matrix, market share analysis, M&A activity in the sector, PE interest and recent multiples.',
      leagueMin: 'L5',
    },
    {
      title: 'Three-Year Projections',
      pages: 3,
      prompt: 'Build 3-year financial projections with clear assumptions. Include revenue, EBITDA, capex, working capital, and free cash flow. Show conservative, base, and optimistic scenarios.',
      leagueMin: 'L5',
    },
    {
      title: 'Risk Factors & Mitigants',
      pages: 2,
      prompt: 'Identify and categorize risks (market, operational, financial, regulatory). For each risk, provide a specific mitigant or management strategy. Be honest — sophisticated buyers expect transparency.',
      leagueMin: 'L5',
    },
    {
      title: 'Transaction Process & Timeline',
      pages: 1,
      prompt: 'Outline the expected transaction process: indicative timeline, next steps, key milestones from LOI through closing.',
      leagueMin: 'L5',
    },
  ];

  return allSections.filter(s => leagueRank[s.leagueMin] <= rank);
}

function buildDealContext(input: CIMInput): string {
  const lines: string[] = [];
  lines.push(`Business: ${input.business_name}`);
  lines.push(`Industry: ${input.industry}`);
  lines.push(`Location: ${input.location}`);
  lines.push(`League: ${input.league}`);
  lines.push(`Revenue: $${(input.revenue / 100).toLocaleString()}`);
  if (input.sde) lines.push(`SDE: $${(input.sde / 100).toLocaleString()}`);
  if (input.ebitda) lines.push(`EBITDA: $${(input.ebitda / 100).toLocaleString()}`);
  if (input.owner_salary) lines.push(`Owner Salary: $${(input.owner_salary / 100).toLocaleString()}`);
  if (input.employee_count) lines.push(`Employees: ${input.employee_count}`);
  if (input.years_in_business) lines.push(`Years in Business: ${input.years_in_business}`);
  if (input.growth_rate) lines.push(`Growth Rate: ${input.growth_rate}%`);
  if (input.products_services) lines.push(`Products/Services: ${input.products_services}`);
  if (input.customer_profile) lines.push(`Customer Profile: ${input.customer_profile}`);
  if (input.competitive_advantages) lines.push(`Competitive Advantages: ${input.competitive_advantages}`);
  if (input.growth_opportunities) lines.push(`Growth Opportunities: ${input.growth_opportunities}`);
  if (input.reason_for_selling) lines.push(`Reason for Selling: ${input.reason_for_selling}`);
  if (input.facilities) lines.push(`Facilities: ${input.facilities}`);
  if (input.technology) lines.push(`Technology: ${input.technology}`);
  if (input.key_employees) lines.push(`Key Employees: ${input.key_employees}`);
  if (input.asking_price) lines.push(`Asking Price: $${(input.asking_price / 100).toLocaleString()}`);

  if (input.financials) {
    lines.push('\nExtended Financials:');
    for (const [key, value] of Object.entries(input.financials)) {
      if (value !== null && value !== undefined) {
        lines.push(`  ${key}: ${value}`);
      }
    }
  }

  return lines.join('\n');
}

async function generateSection(
  sectionDef: SectionDef,
  dealContext: string,
  input: CIMInput,
): Promise<string> {
  const systemPrompt = `You are writing a section of a Confidential Information Memorandum (CIM) for an M&A transaction.

RULES:
- Write in professional, third-person business language
- Use ONLY the data provided — never invent numbers or facts
- If data is insufficient for a section, note what additional information would strengthen it
- Keep the tone authoritative but not salesy — buyers see through hype
- Use specific numbers from the deal context wherever possible
- Format with markdown: headers, bullet points, tables where appropriate
- Length target: approximately ${sectionDef.pages} page(s) of content`;

  const response = await getClient().messages.create({
    model: OPUS_MODEL,
    max_tokens: 4096,
    temperature: 0.3,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `## DEAL CONTEXT\n${dealContext}\n\n## SECTION TO WRITE\n**${sectionDef.title}**\n\n${sectionDef.prompt}\n\nWrite this section now.`,
      },
    ],
  });

  return response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');
}
