/**
 * Letter of Intent (LOI) Generator
 *
 * Deterministic deal terms + AI narrative for the legal prose.
 * All financial values in CENTS.
 */
import { callClaude } from '../aiService.js';

export interface LOIInput {
  buyer_name: string;
  seller_name: string;
  business_name: string;
  purchase_price: number;        // cents
  deal_structure: 'asset' | 'stock' | 'hybrid';
  earnout_pct?: number;          // percentage of purchase price
  earnout_period_months?: number;
  earnout_conditions?: string;
  seller_note_pct?: number;      // percentage
  seller_note_terms?: string;
  equity_injection?: number;     // cents
  sba_loan?: boolean;
  transition_period_months?: number;
  non_compete_years?: number;
  non_compete_radius_miles?: number;
  due_diligence_days?: number;
  closing_deadline_days?: number;
  contingencies?: string[];
  exclusivity_days?: number;
  league?: string;
  industry?: string;
}

export interface LOIDocument {
  type: 'loi';
  buyer_name: string;
  seller_name: string;
  business_name: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  key_terms: {
    purchase_price: number;
    deal_structure: string;
    earnout: string | null;
    seller_note: string | null;
    transition: string;
    non_compete: string;
    dd_period: string;
    closing_deadline: string;
    exclusivity: string;
  };
  generated_at: string;
}

export async function generateLOI(input: LOIInput): Promise<LOIDocument> {
  const priceDollars = input.purchase_price / 100;
  const ddDays = input.due_diligence_days || 45;
  const closingDays = input.closing_deadline_days || 90;
  const exclusivity = input.exclusivity_days || 60;
  const transitionMonths = input.transition_period_months || 6;
  const nonCompeteYears = input.non_compete_years || 3;
  const nonCompeteRadius = input.non_compete_radius_miles || 50;

  // Build key terms
  const earnoutStr = input.earnout_pct
    ? `${input.earnout_pct}% over ${input.earnout_period_months || 24} months${input.earnout_conditions ? ` (${input.earnout_conditions})` : ''}`
    : null;

  const sellerNoteStr = input.seller_note_pct
    ? `${input.seller_note_pct}% of purchase price${input.seller_note_terms ? ` — ${input.seller_note_terms}` : ''}`
    : null;

  const keyTerms: LOIDocument['key_terms'] = {
    purchase_price: input.purchase_price,
    deal_structure: input.deal_structure === 'asset' ? 'Asset Purchase' : input.deal_structure === 'stock' ? 'Stock/Equity Purchase' : 'Hybrid Structure',
    earnout: earnoutStr,
    seller_note: sellerNoteStr,
    transition: `${transitionMonths} months`,
    non_compete: `${nonCompeteYears} years, ${nonCompeteRadius}-mile radius`,
    dd_period: `${ddDays} days`,
    closing_deadline: `${closingDays} days from execution`,
    exclusivity: `${exclusivity} days`,
  };

  // Generate LOI prose via Claude
  const context = `
BUYER: ${input.buyer_name}
SELLER: ${input.seller_name}
BUSINESS: ${input.business_name}
PURCHASE PRICE: $${priceDollars.toLocaleString()}
DEAL STRUCTURE: ${keyTerms.deal_structure}
${earnoutStr ? `EARNOUT: ${earnoutStr}` : ''}
${sellerNoteStr ? `SELLER NOTE: ${sellerNoteStr}` : ''}
EQUITY INJECTION: ${input.equity_injection ? `$${(input.equity_injection / 100).toLocaleString()}` : 'TBD'}
SBA LOAN: ${input.sba_loan ? 'Yes' : 'No'}
TRANSITION: ${transitionMonths} months
NON-COMPETE: ${nonCompeteYears} years, ${nonCompeteRadius}-mile radius
DUE DILIGENCE: ${ddDays} days
CLOSING DEADLINE: ${closingDays} days
EXCLUSIVITY: ${exclusivity} days
${input.contingencies?.length ? `CONTINGENCIES: ${input.contingencies.join('; ')}` : ''}
`.trim();

  const loiContent = await callClaude(
    `You are an M&A attorney drafting a Letter of Intent. Write in formal legal prose but keep it readable. This is non-binding except for exclusivity and confidentiality. Use the exact terms provided — never invent deal terms.`,
    [{
      role: 'user',
      content: `Draft a complete Letter of Intent with these terms:\n\n${context}\n\nInclude these sections:\n1. Preamble (parties and purpose)\n2. Transaction Structure\n3. Purchase Price and Payment Terms\n4. Due Diligence Period\n5. Representations and Warranties (standard)\n6. Transition and Employment\n7. Non-Competition and Non-Solicitation\n8. Exclusivity Period\n9. Confidentiality\n10. Conditions to Closing\n11. Binding vs Non-Binding Provisions\n12. Expiration\n\nFormat each section with a clear heading.`,
    }],
  );

  // Parse sections from the generated content
  const sections = parseSections(loiContent);

  return {
    type: 'loi',
    buyer_name: input.buyer_name,
    seller_name: input.seller_name,
    business_name: input.business_name,
    sections,
    key_terms: keyTerms,
    generated_at: new Date().toISOString(),
  };
}

function parseSections(content: string): Array<{ title: string; content: string }> {
  const lines = content.split('\n');
  const sections: Array<{ title: string; content: string }> = [];
  let currentTitle = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
      }
      currentTitle = headerMatch[1].replace(/^\d+\.\s*/, '').trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
  }

  if (sections.length === 0) {
    sections.push({ title: 'Letter of Intent', content });
  }

  return sections;
}
