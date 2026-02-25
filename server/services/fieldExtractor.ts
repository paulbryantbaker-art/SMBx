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
}

const EXTRACTION_PROMPT = `You are a data extraction engine. Analyze the conversation below and extract any business/deal fields mentioned.

Return ONLY a JSON object with fields you found. Use null for fields not mentioned. Convert dollar amounts to cents (multiply by 100). Only include fields you are confident about.

Fields to extract:
- journey_type: "sell", "buy", "raise", or "pmi" (detect from conversation intent)
- industry: business industry/sector (e.g. "HVAC", "Dental Practice", "IT Services")
- location: city/state/region mentioned
- business_name: name of the business if mentioned
- revenue: annual revenue in CENTS (e.g. $3M = 300000000)
- owner_salary: owner's annual take-home in CENTS
- sde: seller's discretionary earnings in CENTS if calculable
- ebitda: EBITDA in CENTS if mentioned
- employee_count: number of employees
- asking_price: desired sale price in CENTS
- raise_amount: capital amount seeking in CENTS
- target_industry: (for buyers) industry they're targeting
- target_size_range: (for buyers) deal size range they want
- financing_approach: how they plan to finance (SBA, conventional, cash, equity)

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

    // Filter out null values
    const result: ExtractedFields = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== null && value !== undefined) {
        (result as any)[key] = value;
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (err: any) {
    console.error('Field extraction error:', err.message);
    return null;
  }
}
