/**
 * Field Extractor — Uses Claude Haiku to extract structured deal fields
 * from conversation messages. Runs asynchronously after each response.
 */
import Anthropic from '@anthropic-ai/sdk';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ExtractedFields {
  journey_type?: 'sell' | 'buy' | 'raise' | 'pmi';
  industry?: string;
  location?: string;
  business_name?: string;
  revenue?: number;       // in cents
  owner_salary?: number;  // in cents
  sde?: number;           // in cents
  ebitda?: number;         // in cents
  employee_count?: number;
  naics_code?: string;
  asking_price?: number;  // in cents
  raise_amount?: number;  // in cents
  target_industry?: string;
  target_size_range?: string;
  financing_approach?: string;
  // Gate progression fields
  exit_motivation?: string;
  timeline_preference?: string;
  owner_compensation?: number;   // in cents
  net_income?: number;            // in cents
  add_backs_confirmed?: boolean;
  // Buyer profile fields
  buyer_type?: string;
  capital_available?: number;     // in cents
  target_geography?: string;
  buyer_credit_score_range?: string;
  buyer_liquid_assets_cents?: number;
  buyer_retirement_funds_cents?: number;
  buyer_home_equity_cents?: number;
  buyer_citizenship_status?: string;
  buyer_industry_experience_years?: number;
  buyer_existing_debt_annual_cents?: number;
  seller_financing_willingness?: string;
  seller_standby_willingness?: string;
}

const EXTRACTION_PROMPT = `You are a data extraction engine. Analyze the conversation below and extract any business/deal fields mentioned.

Return ONLY a JSON object with fields you found. Use null for fields not mentioned. Report dollar amounts in DOLLARS (the app will convert to cents). Only include fields you are confident about.

Fields to extract:
- journey_type: "sell", "buy", "raise", or "pmi" (detect from conversation intent)
- industry: business industry/sector (e.g. "HVAC", "Dental Practice", "IT Services")
- location: city/state/region mentioned
- business_name: name of the business if mentioned
- revenue: annual revenue in DOLLARS (e.g. $3M = 3000000)
- owner_salary: owner's annual take-home in DOLLARS
- sde: seller's discretionary earnings in DOLLARS if calculable
- ebitda: EBITDA in DOLLARS if mentioned
- employee_count: number of employees
- asking_price: desired sale/purchase price in DOLLARS
- raise_amount: capital amount seeking in DOLLARS
- target_industry: (for buyers) industry they're targeting
- target_size_range: (for buyers) deal size range they want (e.g. "$1-3M")
- financing_approach: how they plan to finance (SBA, conventional, cash, equity, ROBS)
- buyer_credit_score_range: credit score or range (e.g. "720", "690-720")
- buyer_liquid_assets: cash/savings in DOLLARS (e.g. 150000)
- buyer_retirement_funds: 401k/IRA funds in DOLLARS (e.g. 200000)
- buyer_home_equity: home equity in DOLLARS
- buyer_citizenship_status: "us_citizen", "permanent_resident", or "other"
- buyer_industry_experience_years: years of experience in the target industry
- buyer_existing_debt_annual: annual existing debt payments in DOLLARS
- seller_financing_willingness: "yes", "no", "negotiable", or "unknown"
- seller_standby_willingness: "full_standby", "partial", "no", or "unknown"
- exit_motivation: why the seller wants to exit (e.g. "retirement", "burnout", "new venture", "health")
- timeline_preference: desired exit timeline (e.g. "ASAP", "6 months", "12 months", "flexible")
- owner_compensation: owner's total annual compensation (salary + distributions + benefits) in DOLLARS
- net_income: business net income in DOLLARS
- add_backs_confirmed: true if the user has confirmed/documented add-backs
- buyer_type: type of buyer (e.g. "individual_operator", "search_fund", "pe_firm", "strategic")
- capital_available: total capital available for acquisition in DOLLARS
- target_geography: geographic focus for acquisition targets

Respond with ONLY valid JSON. No markdown, no explanation.`;

/**
 * Extract structured fields from a conversation.
 * Non-blocking — call with fire-and-forget pattern.
 */
export async function extractFields(
  messages: Array<{ role: string; content: string }>
): Promise<ExtractedFields | null> {
  if (messages.length < 2) return null; // Need at least one exchange

  try {
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Yulia'}: ${m.content}`)
      .join('\n\n');

    const response = await getClient().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 500,
      temperature: 0,
      system: EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: conversationText }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('');

    // Parse JSON, stripping any markdown fencing
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Fields that need dollar-to-cents conversion
    const DOLLAR_FIELDS = new Set([
      'revenue', 'owner_salary', 'sde', 'ebitda', 'asking_price', 'raise_amount',
      'buyer_liquid_assets', 'buyer_retirement_funds', 'buyer_home_equity',
      'buyer_existing_debt_annual', 'net_income', 'owner_compensation', 'capital_available',
    ]);

    // Map from extraction field names to DB column names
    const FIELD_RENAMES: Record<string, string> = {
      buyer_liquid_assets: 'buyer_liquid_assets_cents',
      buyer_retirement_funds: 'buyer_retirement_funds_cents',
      buyer_home_equity: 'buyer_home_equity_cents',
      buyer_existing_debt_annual: 'buyer_existing_debt_annual_cents',
    };

    // Filter out null values, convert dollars to cents
    const result: ExtractedFields = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== null && value !== undefined) {
        const dbKey = FIELD_RENAMES[key] || key;
        if (DOLLAR_FIELDS.has(key) && typeof value === 'number') {
          (result as any)[dbKey] = Math.round(value * 100);
        } else {
          (result as any)[dbKey] = value;
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (err: any) {
    console.error('Field extraction error:', err.message);
    return null;
  }
}
