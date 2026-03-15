/**
 * 100-Day Integration Plan Generator — PMI Journey (PMI1)
 *
 * Creates a structured post-acquisition integration plan:
 * - Day 0-30: Stabilization (no changes, learn the business)
 * - Day 31-60: Assessment (identify quick wins, plan changes)
 * - Day 61-100: Optimization (implement improvements)
 * - Key milestones, owner transitions, employee communication
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

interface IntegrationPlanInput {
  business_name?: string;
  industry?: string;
  employee_count?: number;
  revenue?: number; // cents
  deal_structure?: string; // 'asset_sale' | 'stock_sale'
  seller_transition_months?: number;
  league: string;
  has_key_employees?: boolean;
  has_real_estate?: boolean;
  customer_concentration?: number; // percent of revenue from top customer
  is_franchise?: boolean;
  buyer_type?: string; // 'first_time' | 'experienced' | 'pe_group' | 'strategic'
  financials?: Record<string, any>;
}

export async function generateIntegrationPlan(input: IntegrationPlanInput): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 5000,
    system: `You are a post-acquisition integration specialist. Generate a practical, actionable 100-Day Integration Plan. Output clean markdown. Focus on what a new owner actually needs to do — not theory. Be specific to their industry.`,
    messages: [{
      role: 'user',
      content: `Create a 100-Day Integration Plan for:

Business: ${input.business_name || 'Acquired Business'}
Industry: ${input.industry || 'General'}
Revenue: $${((input.revenue || 0) / 100).toLocaleString()}
Employees: ${input.employee_count || 'Not specified'}
Deal Structure: ${input.deal_structure || 'Asset Sale'}
Seller Transition: ${input.seller_transition_months ? `${input.seller_transition_months} months` : '3 months'}
Buyer Type: ${input.buyer_type || 'First-time buyer'}
Customer Concentration: ${input.customer_concentration ? `${input.customer_concentration}% from top customer` : 'Not specified'}
Franchise: ${input.is_franchise ? 'Yes' : 'No'}
League: ${input.league}

## 100-Day Integration Plan

### Pre-Day 0: Before You Take the Keys
- Critical items to complete before closing day
- Insurance, banking, vendor account transfers
- Employee communication plan
- Customer communication plan (what to say and what NOT to say)

### Phase 1: Stabilization (Days 1-30) — "Change Nothing"
**Goal: Learn the business. Build trust. Don't break anything.**

Week 1 priorities:
Week 2-3 priorities:
Week 4 priorities:

Key meetings to schedule (table):
| Meeting | With Whom | Purpose | By When |

Employee 1-on-1 template (what to ask, what to promise)
Customer outreach script

### Phase 2: Assessment (Days 31-60) — "Plan the Changes"
**Goal: Identify quick wins. Build your improvement roadmap.**

Financial deep-dive items
Operational assessment items
Customer/revenue analysis
Vendor renegotiation opportunities
Technology assessment

### Phase 3: Optimization (Days 61-100) — "Execute Quick Wins"
**Goal: Implement 2-3 high-impact improvements. Show momentum.**

Revenue quick wins
Cost reduction opportunities
Process improvements
Team development

### Milestone Tracker
Table: Day | Milestone | Owner | Status

### Risk Register
Top 5 integration risks with mitigation strategies

### Seller Transition Plan
- Knowledge transfer schedule
- Customer introduction timeline
- Vendor relationship handoff
- Key institutional knowledge to capture

### Communication Templates
1. Day 1 employee announcement
2. Customer letter
3. Vendor notification
4. Landlord introduction

### 90-Day Financial Targets
- Revenue maintenance threshold
- Expense baseline
- Working capital targets
- First improvement initiative ROI target`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
