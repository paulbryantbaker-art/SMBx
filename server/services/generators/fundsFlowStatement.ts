/**
 * Funds Flow Statement Generator
 *
 * Creates a detailed funds flow statement for deal closing:
 * - Sources of funds (buyer equity, SBA loan, seller note, earnout)
 * - Uses of funds (purchase price, working capital, transaction fees, escrow)
 * - Net to seller calculation
 * - Day-of-closing wire schedule
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

interface FundsFlowInput {
  business_name?: string;
  industry?: string;
  purchase_price?: number; // cents
  sde?: number; // cents
  ebitda?: number; // cents
  league: string;
  financing_structure?: string;
  seller_note_percent?: number;
  sba_loan?: boolean;
  earnout_percent?: number;
  working_capital_target?: number; // cents
  transaction_fee_percent?: number;
  escrow_percent?: number;
  broker_commission_percent?: number;
}

export async function generateFundsFlowStatement(input: FundsFlowInput): Promise<string> {
  const anthropic = getClient();
  const purchasePrice = input.purchase_price || 0;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `You are an M&A transaction advisor generating a Funds Flow Statement. Output clean markdown. All dollar amounts should be formatted with commas and two decimal places. Include all standard closing costs and adjustments.`,
    messages: [{
      role: 'user',
      content: `Generate a Funds Flow Statement for this deal:

Business: ${input.business_name || 'Target Company'}
Industry: ${input.industry || 'Not specified'}
Purchase Price: $${(purchasePrice / 100).toLocaleString()}
Earnings (${['L3', 'L4', 'L5', 'L6'].includes(input.league) ? 'EBITDA' : 'SDE'}): $${((input.ebitda || input.sde || 0) / 100).toLocaleString()}
League: ${input.league}
Financing: ${input.financing_structure || (input.sba_loan ? 'SBA 7(a) + Equity' : 'Conventional')}
Seller Note: ${input.seller_note_percent ? `${input.seller_note_percent}%` : '10%'}
Earnout: ${input.earnout_percent ? `${input.earnout_percent}%` : 'None'}
Working Capital Target: ${input.working_capital_target ? `$${(input.working_capital_target / 100).toLocaleString()}` : 'TBD at closing'}
Escrow: ${input.escrow_percent ? `${input.escrow_percent}%` : '5%'}
Broker Commission: ${input.broker_commission_percent ? `${input.broker_commission_percent}%` : 'N/A'}

Create a complete Funds Flow Statement with these sections:

## Funds Flow Statement

### Sources of Funds
(Table: Source | Amount | % of Purchase Price)
- Buyer equity injection
- Senior debt (SBA or conventional)
- Seller note
- Earnout (if applicable)
- TOTAL SOURCES

### Uses of Funds
(Table: Use | Amount | Notes)
- Purchase price
- Working capital adjustment
- Transaction costs itemized (legal, accounting, due diligence)
- Broker commission
- SBA guarantee fee (if applicable)
- Escrow holdback
- Prorations (rent, utilities, insurance)
- TOTAL USES

### Net Proceeds to Seller
(Table: Item | Amount)
- Gross purchase price
- Less: Seller note
- Less: Earnout holdback
- Less: Broker commission
- Less: Seller legal fees (estimated)
- Less: Escrow holdback
- Less: Working capital adjustment
- NET CASH AT CLOSING

### Wire Schedule (Day of Closing)
Numbered list of wires with recipient, amount, and bank details placeholder

### Important Notes
- Tax implications note
- Escrow release conditions
- Seller note terms summary
- Working capital true-up mechanism`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
