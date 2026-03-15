/**
 * Closing Checklist Generator
 *
 * Generates a comprehensive deal closing checklist organized by:
 * - Pre-closing (30 days out)
 * - Week before closing
 * - Day of closing
 * - Post-closing (30/60/90 days)
 * - Responsible party assignments
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

interface ClosingChecklistInput {
  business_name?: string;
  industry?: string;
  journey_type: 'sell' | 'buy';
  league: string;
  deal_structure?: string; // 'asset_sale' | 'stock_sale' | 'merger'
  has_real_estate?: boolean;
  has_employees?: boolean;
  employee_count?: number;
  sba_loan?: boolean;
  has_franchise?: boolean;
  has_ip?: boolean;
  state?: string;
}

export async function generateClosingChecklist(input: ClosingChecklistInput): Promise<string> {
  const anthropic = getClient();
  const isSeller = input.journey_type === 'sell';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `You are an M&A transaction coordinator generating a comprehensive closing checklist for a ${isSeller ? 'seller' : 'buyer'}. Output clean markdown with checkboxes (- [ ]) for each item. Be thorough but practical.`,
    messages: [{
      role: 'user',
      content: `Generate a Closing Checklist for this deal:

Business: ${input.business_name || 'Target Company'}
Industry: ${input.industry || 'General'}
Role: ${isSeller ? 'SELLER' : 'BUYER'}
League: ${input.league}
Deal Structure: ${input.deal_structure || 'Asset Sale'}
Real Estate Included: ${input.has_real_estate ? 'Yes' : 'No'}
Employees: ${input.has_employees !== false ? `Yes (${input.employee_count || 'unknown'} employees)` : 'No'}
SBA Financing: ${input.sba_loan ? 'Yes' : 'No'}
Franchise: ${input.has_franchise ? 'Yes' : 'No'}
Intellectual Property: ${input.has_ip ? 'Yes' : 'No'}
State: ${input.state || 'Not specified'}

Create a checklist with these sections. Use - [ ] checkbox format. Include responsible party in parentheses.

## Closing Checklist — ${isSeller ? 'Seller' : 'Buyer'}

### Phase 1: Pre-Closing (T-30 to T-14 Days)
Legal, financial, and operational items that need 2+ weeks lead time.

### Phase 2: Final Preparations (T-14 to T-3 Days)
Documents to finalize, approvals to obtain, accounts to set up.

### Phase 3: Week of Closing (T-3 to T-1 Days)
Final verifications, pre-closing walk-through, wire instructions.

### Phase 4: Closing Day (T-0)
Signing ceremony items, wire confirmations, key handoffs.

### Phase 5: Post-Closing (T+1 to T+90 Days)
Transition items, filings, employee communications, customer notifications.

${input.sba_loan ? '\n### SBA-Specific Requirements\nSBA 7(a) closing requirements including guaranty fee, standby agreement for seller note, life insurance.' : ''}

${input.has_real_estate ? '\n### Real Estate Transfer Items\nLease assignment, environmental clearances, title transfer, property inspection.' : ''}

${input.has_franchise ? '\n### Franchise Transfer Requirements\nFranchisor approval, FDD review, transfer fee, training requirements.' : ''}

### Key Contacts Directory
Table with: Role | Name (TBD) | Phone | Email
Include: Attorney, CPA, Lender, Broker, Insurance Agent, Landlord`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
