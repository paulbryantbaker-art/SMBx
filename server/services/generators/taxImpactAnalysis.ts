/**
 * Tax Impact Analysis Generator
 *
 * Analyzes tax implications of a deal for both buyer and seller:
 * - Asset vs stock sale comparison
 * - Entity type implications (C-Corp, S-Corp, LLC, Sole Prop)
 * - QSBS eligibility check
 * - Capital gains vs ordinary income breakdown
 * - Installment sale benefits (seller note)
 * - State tax considerations
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

interface TaxImpactInput {
  business_name?: string;
  industry?: string;
  journey_type: 'sell' | 'buy';
  league: string;
  purchase_price?: number; // cents
  original_basis?: number; // cents (seller's cost basis)
  entity_type?: string; // 'c_corp' | 's_corp' | 'llc' | 'sole_prop' | 'partnership'
  deal_structure?: string; // 'asset_sale' | 'stock_sale'
  seller_note_percent?: number;
  years_held?: number;
  state?: string;
  has_real_estate?: boolean;
  goodwill_estimate?: number; // cents
  tangible_assets?: number; // cents
  depreciation_recapture?: number; // cents
}

export async function generateTaxImpactAnalysis(input: TaxImpactInput): Promise<string> {
  const anthropic = getClient();
  const isSeller = input.journey_type === 'sell';
  const purchasePrice = (input.purchase_price || 0) / 100;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `You are an M&A tax advisor (NOT a CPA — always recommend consulting their CPA/tax advisor). Generate a preliminary tax impact analysis. Use current 2024-2025 federal tax rates. Output clean markdown. Include disclaimers about consulting a tax professional. All figures are estimates for planning purposes only.`,
    messages: [{
      role: 'user',
      content: `Generate a Tax Impact Analysis for this deal:

Business: ${input.business_name || 'Target Company'}
Industry: ${input.industry || 'General'}
Role: ${isSeller ? 'SELLER' : 'BUYER'}
League: ${input.league}
Purchase Price: $${purchasePrice.toLocaleString()}
Entity Type: ${input.entity_type || 'LLC (single-member)'}
Proposed Structure: ${input.deal_structure || 'Asset Sale'}
Seller Note: ${input.seller_note_percent ? `${input.seller_note_percent}% ($${(purchasePrice * (input.seller_note_percent / 100)).toLocaleString()})` : 'None'}
Years Held: ${input.years_held || 'Not specified'}
State: ${input.state || 'Not specified'}
Real Estate Included: ${input.has_real_estate ? 'Yes' : 'No'}
${input.goodwill_estimate ? `Estimated Goodwill: $${(input.goodwill_estimate / 100).toLocaleString()}` : ''}
${input.tangible_assets ? `Tangible Assets: $${(input.tangible_assets / 100).toLocaleString()}` : ''}

Generate these sections:

## Tax Impact Analysis — Preliminary Estimates

### Deal Structure Comparison
Compare asset sale vs stock sale for this specific deal. Table format:
| Factor | Asset Sale | Stock Sale |
Show: Tax treatment, buyer benefit, seller preference, practical considerations.

### ${isSeller ? 'Seller' : 'Buyer'} Tax Estimate

#### Purchase Price Allocation (Section 338 / Asset Classes)
Table showing allocation across IRS asset classes:
- Class I: Cash
- Class III: Accounts receivable, inventory
- Class V: Equipment, furniture, vehicles
- Class VI: Covenant not to compete
- Class VII: Goodwill

#### Tax Rate Summary
- Capital gains rate (federal + state estimate)
- Ordinary income rate (for depreciation recapture, CNC)
- Net Investment Income Tax (3.8% if applicable)
- State tax rate

#### Estimated Tax Liability
Table: Income Type | Amount | Tax Rate | Tax Amount
- Long-term capital gain
- Depreciation recapture (Section 1245/1250)
- Ordinary income (CNC, inventory)
- State taxes
- TOTAL ESTIMATED TAX
- NET AFTER-TAX PROCEEDS

${input.seller_note_percent ? `### Installment Sale Analysis (Section 453)
- Benefits of spreading gain over seller note term
- Estimated tax savings from deferral
- Interest income tax treatment
- Risks and considerations` : ''}

### QSBS Eligibility (Section 1202)
${input.entity_type === 'c_corp' ? 'C-Corp detected — analyze potential QSBS exclusion' : 'QSBS requires C-Corp status. Current entity type may not qualify.'}

### Key Tax Planning Opportunities
3-5 specific strategies for this deal (e.g., opportunity zone reinvestment, charitable remainder trust, installment sale structuring).

### Important Disclaimers
- This is a preliminary analysis for planning purposes only
- Consult with a qualified CPA or tax advisor before closing
- Tax laws are subject to change
- State-specific rules may apply`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
