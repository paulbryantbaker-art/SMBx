# CC MEGA-SESSION V3 ADDENDUM: Deal Management + Living Documents
## These are LAUNCH REQUIREMENTS, not post-launch features.
## Append to SMBX_CC_MEGA_PROMPT_V3.md after Phase 3.

---

# PHASE 4: DEAL MANAGEMENT UX

The deal is the primary organizational unit. Users don't manage chats — Yulia organizes conversations into logical deal contexts. Each gate transition creates a new conversation within the deal folder. The sidebar reflects this structure.

## 4.1 Gate-triggered conversation creation

In `server/services/tools.ts`, modify the `advanceGate` function. When a gate advances:

1. **Summarize the current conversation** — call Claude Haiku with: "Summarize this conversation in 2-3 sentences. Focus on what was decided, what data was collected, and what was produced." Save the summary as `conversation.summary` field.

2. **Title the completed conversation** with the gate label:
```typescript
const GATE_TITLES: Record<string, string> = {
  S0: 'Getting Started',
  S1: 'Financial Deep-Dive',
  S2: 'Valuation & Positioning',
  S3: 'Deal Materials & CIM',
  S4: 'Buyer Matching & Outreach',
  S5: 'Closing & Transition',
  B0: 'Thesis & Readiness',
  B1: 'Deal Screening',
  B2: 'Valuation & Modeling',
  B3: 'Due Diligence',
  B4: 'Deal Structure & Terms',
  B5: 'Closing & Integration',
  R0: 'Readiness Assessment',
  R1: 'Financial Package',
  R2: 'Investor Materials',
  R3: 'Investor Outreach',
  R4: 'Term Negotiation',
  R5: 'Closing the Raise',
  PMI0: 'Day Zero',
  PMI1: 'Stabilization (Days 1-30)',
  PMI2: 'Assessment (Days 31-60)',
  PMI3: 'Optimization (Days 61-180)',
};
```

3. **Mark the current conversation as gate-complete:**
```typescript
await sql`
  UPDATE conversations
  SET title = ${GATE_TITLES[fromGate] + ' ✓'},
      summary = ${summary},
      gate_status = 'completed'
  WHERE id = ${conversationId}
`;
```

4. **Create a new conversation for the next gate:**
```typescript
const [newConv] = await sql`
  INSERT INTO conversations (user_id, deal_id, title, gate_status, journey, current_gate)
  VALUES (${userId}, ${dealId}, ${GATE_TITLES[toGate]}, 'active', ${deal.journey_type}, ${toGate})
  RETURNING id
`;
```

5. **Return the new conversation ID** so the frontend can switch to it:
```typescript
return JSON.stringify({
  success: true,
  newGate: toGate,
  newConversationId: newConv.id,
  message: `Moving to: ${GATE_TITLES[toGate]}`
});
```

Add migration for new conversation columns:
```sql
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS gate_status VARCHAR(20) DEFAULT 'active'; -- 'active', 'completed', 'pending'
```

## 4.2 Yulia's gate transition messages

When Yulia opens a new gate conversation, her first message should set context:

```
[System prompt addition for new gate conversations]

You are starting a new conversation phase for this deal. The previous phase
({previous_gate_title}) is complete. Here's the summary: {previous_summary}

Your opening message should:
1. Briefly acknowledge what was accomplished in the previous phase
2. Set expectations for what this new phase will cover
3. Ask the first question or propose the first action

Example: "Your financial deep-dive is complete — we identified $85,000 in add-backs
and calculated an SDE of $420,000. Now let's build your valuation. I'm going to
analyze comparable transactions in the {industry} market in {location} and build
a multi-methodology valuation. First question: have you had any offers or informal
conversations about price?"
```

## 4.3 Sidebar deal grouping

In `client/src/components/shell/Sidebar.tsx` and `client/src/components/chat/Sidebar.tsx`:

**Group conversations under deal cards.** Each deal shows:
- Business name (or "New Deal" if unnamed)
- Journey type icon (sell/buy/raise/integrate)
- Current gate as a progress indicator
- Execution fee status (free / paid)

Under each deal, show conversations ordered by gate sequence (not by date):
- Completed gates: ◉ with checkmark, muted text
- Active gate: ● with bold text, highlighted
- Future gates: ○ with light text (don't show as conversations until they exist)

General conversations (no deal attached) go in a separate "General" section at the bottom.

**Collapsed state:** Show only the deal card. Click to expand and see gate conversations.
**Default:** The deal with the most recent activity is expanded. Others are collapsed.

```tsx
// Deal card in sidebar
<div className="px-3 py-2 rounded-lg hover:bg-[#b0004a]/5 cursor-pointer">
  <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[16px] text-[#b0004a]">
      {journey === 'sell' ? 'storefront' : journey === 'buy' ? 'shopping_bag' : 'trending_up'}
    </span>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold truncate">{deal.business_name || 'New Deal'}</div>
      <div className="text-[10px] text-[#636467]">{deal.current_gate} · {deal.industry}</div>
    </div>
    {deal.execution_paid && <span className="text-[10px] text-[#b0004a] font-bold">PAID</span>}
  </div>
</div>
```

## 4.4 "New chat within deal" flow

Add a "+" button next to each deal in the sidebar. Clicking it creates a new conversation linked to that deal, at the current gate. Yulia opens with: "What would you like to work on for {business_name}?"

This is for ad-hoc questions within a deal context — not gate transitions. The conversation title defaults to the first user message (like ChatGPT does), and it appears under the deal grouping.

## 4.5 Pipeline dashboard frontend

Create `client/src/pages/Pipeline.tsx` — a dedicated view (not a chat) showing all deals:

- Card or table layout
- Each deal shows: business name, journey type, current gate, SDE/EBITDA, execution fee status, last activity, deliverable count
- Click a deal → navigate to its most recent conversation
- Sort by: last activity, gate progress, deal value
- Filter by: journey type, paid/free

The backend route `GET /api/deals` already returns all this data. This is purely a frontend build.

## PHASE 4 VERIFICATION

- [ ] Advancing a gate creates a new conversation with the correct title
- [ ] Previous conversation gets a summary and "✓" in its title
- [ ] Sidebar groups conversations under deal cards
- [ ] Deal cards show name, journey, gate, paid status
- [ ] "+" button creates a new conversation within the deal
- [ ] Pipeline view shows all deals with key metrics
- [ ] Clicking a deal in pipeline opens its most recent conversation
- [ ] General (no-deal) conversations appear in a separate section

Commit:
```bash
git add -A && git commit -m "feat: phase 4 — deal management UX, gate-triggered conversations, pipeline dashboard"
```

---

# PHASE 5: LIVING DOCUMENTS

Documents that go stale without notice is not acceptable. Every deliverable must know whether it's current, and Yulia must proactively offer to regenerate when the underlying data changes.

## 5.1 Add stale tracking to deliverables

Migration `server/migrations/035_deliverable_freshness.sql`:

```sql
-- Track whether a deliverable is current or needs regeneration
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS stale BOOLEAN DEFAULT false;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS stale_reason TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS generated_from_snapshot JSONB;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS last_regenerated_at TIMESTAMPTZ;

-- Track financial snapshots on deals for change detection
ALTER TABLE deals ADD COLUMN IF NOT EXISTS financial_snapshot JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS financial_snapshot_at TIMESTAMPTZ;
```

## 5.2 Financial snapshot capture

Every time deal financials update (via `update_deal_field` tool or file upload), capture a snapshot and compare to previous:

Create `server/services/dealFreshnessService.ts`:

```typescript
/**
 * Deal Freshness Service — detects when deal data changes enough
 * to invalidate existing deliverables.
 */

interface FinancialSnapshot {
  sde: number | null;
  ebitda: number | null;
  revenue: number | null;
  league: string | null;
  snapshot_at: string;
}

/**
 * Called whenever deal financials update.
 * Compares new values to the snapshot that existing deliverables were built from.
 * If change exceeds threshold, marks affected deliverables as stale.
 */
export async function checkDealFreshness(dealId: number): Promise<{
  staleCount: number;
  changes: string[];
}> {
  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
  if (!deal) return { staleCount: 0, changes: [] };

  const currentSnapshot: FinancialSnapshot = {
    sde: deal.sde,
    ebitda: deal.ebitda,
    revenue: deal.revenue,
    league: deal.league,
    snapshot_at: new Date().toISOString(),
  };

  const previousSnapshot: FinancialSnapshot | null = deal.financial_snapshot
    ? (typeof deal.financial_snapshot === 'string'
        ? JSON.parse(deal.financial_snapshot)
        : deal.financial_snapshot)
    : null;

  if (!previousSnapshot) {
    // First snapshot — save and return (nothing to compare)
    await saveSnapshot(dealId, currentSnapshot);
    return { staleCount: 0, changes: [] };
  }

  // Detect meaningful changes
  const changes: string[] = [];

  if (previousSnapshot.sde && currentSnapshot.sde) {
    const sdeDelta = Math.abs(currentSnapshot.sde - previousSnapshot.sde) / previousSnapshot.sde;
    if (sdeDelta > 0.05) {
      changes.push(`SDE changed ${(sdeDelta * 100).toFixed(1)}%`);
    }
  }

  if (previousSnapshot.ebitda && currentSnapshot.ebitda) {
    const ebitdaDelta = Math.abs(currentSnapshot.ebitda - previousSnapshot.ebitda) / previousSnapshot.ebitda;
    if (ebitdaDelta > 0.05) {
      changes.push(`EBITDA changed ${(ebitdaDelta * 100).toFixed(1)}%`);
    }
  }

  if (previousSnapshot.revenue && currentSnapshot.revenue) {
    const revDelta = Math.abs(currentSnapshot.revenue - previousSnapshot.revenue) / previousSnapshot.revenue;
    if (revDelta > 0.10) { // Higher threshold for revenue
      changes.push(`Revenue changed ${(revDelta * 100).toFixed(1)}%`);
    }
  }

  if (previousSnapshot.league !== currentSnapshot.league) {
    changes.push(`League reclassified: ${previousSnapshot.league} → ${currentSnapshot.league}`);
  }

  if (changes.length === 0) {
    return { staleCount: 0, changes: [] };
  }

  // Mark all completed deliverables for this deal as stale
  const staleReason = changes.join('; ');
  const result = await sql`
    UPDATE deliverables
    SET stale = true, stale_reason = ${staleReason}
    WHERE deal_id = ${dealId}
      AND status = 'complete'
      AND stale = false
    RETURNING id
  `;

  // Save new snapshot
  await saveSnapshot(dealId, currentSnapshot);

  return { staleCount: result.length, changes };
}

async function saveSnapshot(dealId: number, snapshot: FinancialSnapshot): Promise<void> {
  await sql`
    UPDATE deals
    SET financial_snapshot = ${JSON.stringify(snapshot)}::jsonb,
        financial_snapshot_at = NOW()
    WHERE id = ${dealId}
  `;
}

/**
 * Check if a deal has stale deliverables. Called when entering a conversation.
 * Returns info for Yulia's system prompt injection.
 */
export async function getStaleDeliverables(dealId: number): Promise<Array<{
  id: number;
  name: string;
  staleReason: string;
}>> {
  const stale = await sql`
    SELECT d.id, mi.name, d.stale_reason
    FROM deliverables d
    JOIN menu_items mi ON d.menu_item_id = mi.id
    WHERE d.deal_id = ${dealId} AND d.stale = true AND d.status = 'complete'
  `;
  return stale as any[];
}
```

## 5.3 Wire freshness checks into deal updates

In `tools.ts`, modify `updateDealField`:

After any financial field update (sde, ebitda, revenue, or financials object with these keys), call:

```typescript
import { checkDealFreshness } from './dealFreshnessService.js';

// At the end of updateDealField, after the SQL update:
if (['sde', 'ebitda', 'revenue', 'financials'].includes(field)) {
  const freshness = await checkDealFreshness(dealId);
  if (freshness.staleCount > 0) {
    return JSON.stringify({
      success: true, field, value,
      staleWarning: `${freshness.staleCount} deliverables are now outdated: ${freshness.changes.join('; ')}. Offer to regenerate.`
    });
  }
}
```

Also call `checkDealFreshness` after `classifyLeague` if the league changes.

## 5.4 Yulia checks for stale deliverables

In the chat route (`server/routes/chat.ts`), when loading deal context for a conversation, also load stale deliverables:

```typescript
import { getStaleDeliverables } from '../services/dealFreshnessService.js';

// When building system prompt with deal context:
if (deal) {
  const staleItems = await getStaleDeliverables(deal.id);
  if (staleItems.length > 0) {
    const staleList = staleItems.map(s => `- ${s.name}: ${s.staleReason}`).join('\n');
    systemPromptAddition += `
## STALE DELIVERABLES
The following deliverables were generated from older financial data and are now outdated:
${staleList}

You MUST mention this to the user early in the conversation. Say something like:
"I notice your financials have updated since I generated some of your deal documents.
Your [document names] are based on older numbers. Want me to regenerate them with
your current data? The updated versions will reflect your new [SDE/EBITDA/revenue]."

If they agree, use the generate tool for each stale deliverable. After regeneration,
the stale flag will clear automatically.
`;
  }
}
```

## 5.5 Regeneration flow

When a deliverable is regenerated:

1. **Save current version to history:**
```typescript
await sql`
  INSERT INTO deliverable_versions (deliverable_id, version, content, change_summary)
  SELECT id,
         COALESCE((SELECT MAX(version) FROM deliverable_versions WHERE deliverable_id = d.id), 0) + 1,
         content,
         ${staleReason}
  FROM deliverables d WHERE d.id = ${deliverableId}
`;
```

2. **Regenerate with current deal data** — same generator, fresh data from deal record.

3. **Clear the stale flag:**
```typescript
await sql`
  UPDATE deliverables
  SET stale = false,
      stale_reason = NULL,
      last_regenerated_at = NOW(),
      generated_from_snapshot = ${JSON.stringify(currentSnapshot)}::jsonb
  WHERE id = ${deliverableId}
`;
```

4. **Update living_cims record** if it exists:
```typescript
await sql`
  UPDATE living_cims
  SET current_version = current_version + 1,
      last_refresh_at = NOW(),
      last_trigger = 'financial_update',
      refresh_count = refresh_count + 1
  WHERE deal_id = ${dealId} AND deliverable_id = ${deliverableId}
`;
```

## 5.6 Wire the pg-boss scheduled jobs

In `server/worker.ts`:

1. **Wire the quarterly valuation refresh** (currently has a TODO comment):
```typescript
import { refreshAllValuations } from './services/valuationRefreshService.js';

// Replace the TODO block:
await (boss as any).work('valuelens_quarterly_refresh', async () => {
  console.log('[worker] Running quarterly ValueLens refresh...');
  const result = await refreshAllValuations();
  console.log(`[worker] Refresh complete: ${result.updated} updated, ${result.notifications} notifications`);
});
```

2. **Rename `bizestimate_quarterly_refresh` → `valuelens_quarterly_refresh`** in the schedule call.

3. **Add a weekly deal freshness scan** — checks all active deals against current market data:
```typescript
await (boss as any).schedule('deal-freshness-weekly', '0 2 * * 1', {}, {}); // Monday 2 AM UTC
await (boss as any).work('deal-freshness-weekly', async () => {
  console.log('[worker] Running weekly deal freshness scan...');
  const activeDeals = await sql`
    SELECT id FROM deals WHERE status = 'active' AND current_gate NOT IN ('S0', 'B0', 'R0', 'PMI0')
  `;
  let staleCount = 0;
  for (const deal of activeDeals) {
    const result = await checkDealFreshness(deal.id);
    if (result.staleCount > 0) staleCount += result.staleCount;
  }
  console.log(`[worker] Freshness scan: ${activeDeals.length} deals checked, ${staleCount} deliverables marked stale`);
});
```

4. **Add market data cache refresh** — monthly refresh of Census/BLS data that propagates to active deals:
```typescript
await (boss as any).schedule('market-data-monthly', '0 3 1 * *', {}, {}); // 1st of month, 3 AM UTC
await (boss as any).work('market-data-monthly', async () => {
  console.log('[worker] Refreshing market data cache...');
  // Refresh cached Census/BLS/FRED data
  // For each active deal, compare new market data against deal's market_context
  // If comparable multiples shifted >10%, mark valuation deliverables as stale
});
```

## 5.7 Financial document upload triggers recalculation

When a user uploads a financial document (P&L, tax return, QuickBooks export) via the data room:

1. The upload handler should detect financial document types (by filename pattern or user indication)
2. Yulia's next response should acknowledge the upload and offer to update the deal financials
3. If the user confirms, Yulia extracts the new numbers, updates the deal record via `update_deal_field`
4. The freshness check fires automatically (from 5.3), marking stale deliverables
5. Yulia reports what changed and offers regeneration

This doesn't require special infrastructure — it's Yulia's conversational behavior when she detects a financial upload in the data room.

## 5.8 Version history in the UI

In the deliverable viewer / canvas, add a version indicator:

- Current version number: "v3 · Updated June 15, 2025"
- If stale: amber badge "Based on older financials — regenerate?"
- Version history dropdown: click to see previous versions with change summaries
- Each version shows: version number, date, what triggered the change

## PHASE 5 VERIFICATION

- [ ] Upload new financials → SDE changes >5% → deliverables marked stale
- [ ] Open conversation for deal with stale deliverables → Yulia mentions them
- [ ] Approve regeneration → new version created, old version saved in history, stale flag cleared
- [ ] pg-boss quarterly refresh runs and updates valuations
- [ ] pg-boss weekly freshness scan detects stale deals
- [ ] Deliverable viewer shows version number and stale indicator
- [ ] Version history accessible from deliverable viewer
- [ ] `bizestimate` renamed to `valuelens` in worker.ts schedule

Commit:
```bash
git add -A && git commit -m "feat: phase 5 — living documents, stale detection, auto-regeneration, scheduled freshness scans"
```

---

# UPDATED LAUNCH STATE

After all 5 phases:
- **New pricing model:** 0.1% execution fee, $999 minimum, one payment per deal
- **Deal-centric UX:** Sidebar groups conversations under deals, gate transitions create new conversations, pipeline dashboard
- **Living documents:** Financial changes detected, deliverables flagged stale, Yulia offers regeneration, version history preserved
- **Scheduled intelligence:** Weekly freshness scans, quarterly valuation refresh, daily thesis matching
- **91 menu items → 0 generic fallbacks**
- **Professional document exports:** PDF, DOCX, XLSX, PPTX
- **4 complete journeys:** Sell, Buy, Raise, PMI with 22 gates
- **28 generators** with model routing
- **ValueLens** top-of-funnel (replaces Bizestimate everywhere including worker.ts)
