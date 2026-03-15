import { Router } from 'express';
import postgres from 'postgres';
import Anthropic from '@anthropic-ai/sdk';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { buildSystemPrompt, buildDynamicAnonymousPrompt } from '../services/promptBuilder.js';
import type { ConversationState } from '../services/promptBuilder.js';
import { streamAgenticResponse } from '../services/aiService.js';
import { checkAndAutoAdvance, getDeal, updateDealFields, updateDealFinancials, advanceGate } from '../services/dealService.js';
import { extractFields } from '../services/fieldExtractor.js';
import type { ExtractedFields } from '../services/fieldExtractor.js';
import { checkGateReadiness } from '../services/gateReadinessService.js';
import { generatePaywallPrompt } from '../services/paywallService.js';
import { getBalance, debitWallet } from '../services/walletService.js';
import { classifyLeague, getLeagueMultiplier } from '../services/leagueClassifier.js';
import { getGateMenuItems } from '../services/menuCatalogService.js';
import { enqueueDeliverableGeneration } from '../services/jobQueue.js';
import { processDeliverable } from '../services/deliverableProcessor.js';
import { createNotification } from './notifications.js';
import { MASTER_SYSTEM_PROMPT } from '../prompts/masterPrompt.js';
import { buildAnonymousPrompt } from '../services/promptBuilder.js';
import { getFirstGate } from '../../shared/gateRegistry.js';
import { upsertCompanyProfile, upsertBuyerThesis, getBuyerDemandSignals } from '../services/knowledgeGraphService.js';
import { checkAnonymousGateAdvancement, advanceAnonymousGate } from '../services/gateService.js';
import { generateValueReadinessReport } from '../services/generators/valueReadinessReport.js';
import { generateThesisDocument } from '../services/generators/thesisDocument.js';
import { generateSdeAnalysis } from '../services/generators/sdeAnalysis.js';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

const STREAMING_MODEL = 'claude-sonnet-4-6';

let anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

// ─── Auto-migration: ensure conversations has all needed columns ──
let _columnsEnsured = false;
async function ensureConversationColumns() {
  if (_columnsEnsured) return;
  try {
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS journey TEXT`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS current_gate TEXT`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS league TEXT`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS extracted_data JSONB DEFAULT '{}'`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS company_profile_id INTEGER`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS thesis_id INTEGER`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS exit_type TEXT`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pmi_phase TEXT`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deal_id INTEGER`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS journey_context TEXT`;
    _columnsEnsured = true;
    console.log('✓ Conversation columns verified');
  } catch (err: any) {
    console.error('Column migration warning:', err.message);
    _columnsEnsured = true; // Don't retry on every request
  }
}

export const chatRouter = Router();

// Auth is now optional — endpoints work with or without JWT
chatRouter.use(optionalAuth);

// ─── Advisor detection ───────────────────────────────────────
const ADVISOR_PATTERNS = [
  /\bmy\s+client/i, /\bour\s+client/i, /\bclient('s|s)?\b/i,
  /\bi('m| am)\s+(a\s+)?(business\s+)?broker/i, /\bi('m| am)\s+(a\s+)?advisor/i,
  /\bi('m| am)\s+(a\s+)?intermediary/i, /\bi('m| am)\s+(a\s+)?m&a\s+(advisor|professional)/i,
  /\bon\s+behalf\s+of/i, /\brepresent(ing)?\s+(a|my|the)\s+(seller|buyer|owner|client)/i,
  /\bI\s+have\s+a\s+(seller|buyer|deal)\b/i,
];
function detectAdvisor(message: string): boolean {
  return ADVISOR_PATTERNS.some(p => p.test(message));
}

// ─── POST /message — Main SSE streaming endpoint ────────────

chatRouter.post('/message', async (req, res) => {
  const userId = (req as any).userId || null;
  const sessionId = req.headers['x-session-id'] as string | undefined;
  const { message, conversationId, journeyContext } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let convId = conversationId ? parseInt(String(conversationId), 10) : null;

    // Create conversation if none provided
    if (!convId) {
      // Anonymous users: max 3 new conversations per day
      if (!userId && sessionId) {
        const [{ count }] = await sql`
          SELECT count(*) FROM conversations
          WHERE session_id = ${sessionId}
          AND created_at > now() - interval '24 hours'
        `;
        if (parseInt(count) >= 3) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Daily conversation limit reached. Create a free account for unlimited conversations.' }));
          return;
        }
      }

      const shortTitle = message.trim().substring(0, 60) + (message.trim().length > 60 ? '...' : '');
      const [conv] = await sql`
        INSERT INTO conversations (user_id, title, session_id)
        VALUES (${userId}, ${shortTitle}, ${userId ? null : sessionId || null})
        RETURNING id
      `;
      convId = conv.id;
    } else {
      // Update title on first message if still default
      const [conv] = await sql`
        SELECT title FROM conversations WHERE id = ${convId} LIMIT 1
      `;
      if (conv && conv.title === 'New conversation') {
        const shortTitle = message.trim().substring(0, 60) + (message.trim().length > 60 ? '...' : '');
        await sql`UPDATE conversations SET title = ${shortTitle}, updated_at = NOW() WHERE id = ${convId}`;
      }
    }

    // Save user message
    await sql`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${convId}, 'user', ${message.trim()})
    `;

    // Ensure critical columns exist (runs once per server start)
    await ensureConversationColumns();

    // Load conversation state
    const [convRow] = await sql`
      SELECT journey, current_gate, league, extracted_data, company_profile_id, thesis_id, exit_type, pmi_phase
      FROM conversations WHERE id = ${convId}
    `;
    const convState: any = {
      journey: convRow?.journey || null,
      current_gate: convRow?.current_gate || null,
      league: convRow?.league || null,
      extracted_data: convRow?.extracted_data || null,
      company_profile_id: convRow?.company_profile_id || null,
      thesis_id: convRow?.thesis_id || null,
      exit_type: convRow?.exit_type || null,
      pmi_phase: convRow?.pmi_phase || null,
    };

    // Load conversation history (last 50 messages)
    const history = await sql`
      SELECT role, content FROM messages
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
      LIMIT 50
    `;

    const apiMessages: MessageParam[] = history.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Fetch buyer demand signals if this is a sell journey with industry data
    let demandSignalText: string | undefined;
    if (convState.journey === 'sell' && convState.extracted_data?.industry) {
      try {
        const signals = await getBuyerDemandSignals({
          industry: convState.extracted_data.industry,
          location_state: convState.extracted_data.location_state || null,
          revenue_reported: convState.extracted_data.revenue || null,
        });
        if (signals) {
          demandSignalText = signals.demandText;
        }
      } catch (_e) { /* non-critical */ }
    }

    // Check if session is flagged as advisor
    let isAdvisor = false;
    if (sessionId) {
      try {
        const [sess] = await sql`SELECT is_advisor FROM anonymous_sessions WHERE session_id = ${sessionId} LIMIT 1`;
        isAdvisor = sess?.is_advisor === true;
      } catch (_e) { /* non-critical */ }
    }
    // Also detect advisor from current message (for first-time detection before post-hook runs)
    if (!isAdvisor && detectAdvisor(message)) {
      isAdvisor = true;
    }

    // Build dynamic system prompt with intelligence layers
    const userMsgCount = apiMessages.filter(m => m.role === 'user').length;
    const systemPrompt = await buildDynamicAnonymousPrompt(convState, {
      sourcePage: journeyContext || 'home',
      isFirstMessage: userMsgCount <= 1,
      messageCount: userMsgCount,
      demandSignalText,
      isAdvisor,
    });

    // Anonymous users: 20 messages per conversation
    if (!userId && convId) {
      const [{ count }] = await sql`
        SELECT count(*) FROM messages WHERE conversation_id = ${convId}
      `;
      if (parseInt(count) >= 40) { // 40 = 20 user + 20 assistant
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Conversation-Id', String(convId));
        res.write(`data: ${JSON.stringify({
          type: 'text_delta',
          text: "You've been getting great value from our conversation. Create a free account to continue unlimited access and save your deal progress."
        })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'message_stop', conversationId: convId })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', String(convId));

    // Stream from Anthropic
    const anthropic = getAnthropicClient();
    let fullText = '';

    try {
      const stream = await anthropic.messages.create({
        model: STREAMING_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: apiMessages,
        stream: true,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          fullText += event.delta.text;
          res.write(`data: ${JSON.stringify({ type: 'text_delta', text: event.delta.text })}\n\n`);
        }
      }
    } catch (streamErr: any) {
      console.error('Anthropic streaming error:', streamErr.message, streamErr.status);
      const userMessage = streamErr.status === 429
        ? 'I\'m experiencing high demand right now. Please try again in a moment.'
        : 'I ran into a temporary issue. Please try again.';
      res.write(`data: ${JSON.stringify({ type: 'text_delta', text: userMessage })}\n\n`);
      fullText = userMessage;
    }

    // Save assistant response
    if (fullText) {
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${convId}, 'assistant', ${fullText})
      `;
      await sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${convId}`;
    }

    // Signal completion
    res.write(`data: ${JSON.stringify({ type: 'message_stop', conversationId: convId })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

    // ─── Post-streaming hook (fire-and-forget) ───────────────
    const effectiveSessionId = sessionId || `anon-${convId}`;
    setImmediate(async () => {
      try {
        // 1. Extract fields from full conversation
        const allMsgs = [...apiMessages.map(m => ({ role: m.role as string, content: m.content as string }))];
        if (fullText) allMsgs.push({ role: 'assistant', content: fullText });

        const fields = await extractFields(allMsgs);
        if (!fields) return;

        // 2. Determine journey from extraction or existing state
        const journey = fields.journey_type || convState.journey || null;

        // 3. Set gate if not already set
        const currentGate = convState.current_gate || (journey ? getFirstGate(journey) : null);

        // 4. Classify league (deterministic)
        let league = convState.league;
        if (journey && (fields.revenue || fields.sde || fields.ebitda || fields.capital_available)) {
          const leagueInfo = classifyLeague({
            journey: journey as 'sell' | 'buy' | 'raise' | 'pmi',
            revenue: fields.revenue || (convState.extracted_data?.revenue as number | undefined) || null,
            sde: fields.sde || (convState.extracted_data?.sde as number | undefined) || null,
            ebitda: fields.ebitda || (convState.extracted_data?.ebitda as number | undefined) || null,
            industry: fields.industry || (convState.extracted_data?.industry as string | undefined) || null,
            capitalAvailable: fields.capital_available || (convState.extracted_data?.capital_available as number | undefined) || null,
          });
          if (leagueInfo) league = leagueInfo.league;
        }

        // 5. Merge extracted_data onto existing JSONB
        const mergedData = { ...(convState.extracted_data || {}), ...fields };
        // Remove journey_type and exit_type from extracted_data — stored in own columns
        delete (mergedData as any).journey_type;
        const exitType = fields.exit_type || convState.exit_type || null;
        delete (mergedData as any).exit_type;

        // 5b. PMI phase tracking
        const pmiPhase = journey === 'pmi' ? (convState.pmi_phase || 'stabilize') : convState.pmi_phase || null;

        // 6. UPDATE conversations with detected state
        await sql`
          UPDATE conversations SET
            journey = ${journey},
            current_gate = ${currentGate},
            league = ${league},
            exit_type = ${exitType},
            pmi_phase = ${pmiPhase},
            extracted_data = ${JSON.stringify(mergedData)}::jsonb,
            updated_at = NOW()
          WHERE id = ${convId}
        `;

        // 6b. Advisor detection — flag session if advisor phrases found
        if (sessionId && detectAdvisor(message)) {
          try {
            await sql`
              INSERT INTO anonymous_sessions (session_id, is_advisor)
              VALUES (${sessionId}, true)
              ON CONFLICT (session_id) DO UPDATE SET is_advisor = true
            `;
          } catch (_e) { /* non-critical */ }
        }

        // 7. Upsert company profile for sell-journey
        if (journey === 'sell') {
          await upsertCompanyProfile(convId!, effectiveSessionId, {
            business_name: mergedData.business_name as string | undefined,
            industry: mergedData.industry as string | undefined,
            location: mergedData.location as string | undefined,
            naics_code: mergedData.naics_code as string | undefined,
            revenue: mergedData.revenue as number | undefined,
            sde: mergedData.sde as number | undefined,
            ebitda: mergedData.ebitda as number | undefined,
            employee_count: mergedData.employee_count as number | undefined,
            exit_type: exitType || undefined,
          });
        }

        // 8. Upsert buyer thesis for buy-journey
        if (journey === 'buy') {
          await upsertBuyerThesis(convId!, effectiveSessionId, {
            buyer_type: mergedData.buyer_type as string | undefined,
            target_industry: mergedData.target_industry as string | undefined,
            target_geography: mergedData.target_geography as string | undefined,
            capital_available: mergedData.capital_available as number | undefined,
            financing_approach: mergedData.financing_approach as string | undefined,
            target_size_range: mergedData.target_size_range as string | undefined,
          });
        }

        // 9. Check gate advancement and generate free deliverables
        const advancement = checkAnonymousGateAdvancement(currentGate, mergedData, journey, league);
        if (advancement.shouldAdvance && advancement.nextGate) {
          console.log(`[gate] Advancing conv ${convId}: ${currentGate} → ${advancement.nextGate} (deliverable: ${advancement.completionDeliverable})`);

          let deliverableContent: string | null = null;

          // Generate completion deliverable
          if (advancement.completionDeliverable === 'value_readiness_report') {
            try {
              deliverableContent = await generateValueReadinessReport({
                business_name: mergedData.business_name as string | undefined,
                industry: mergedData.industry as string | undefined,
                location: mergedData.location as string | undefined,
                revenue: mergedData.revenue as number | undefined,
                owner_compensation: mergedData.owner_compensation as number | undefined,
                owner_salary: mergedData.owner_salary as number | undefined,
                sde: mergedData.sde as number | undefined,
                ebitda: mergedData.ebitda as number | undefined,
                employee_count: mergedData.employee_count as number | undefined,
                years_in_business: mergedData.years_in_business as number | undefined,
                exit_motivation: mergedData.exit_motivation as string | undefined,
                timeline_preference: mergedData.timeline_preference as string | undefined,
                league: league || 'L1',
                naics_code: mergedData.naics_code as string | undefined,
                location_state: mergedData.location_state as string | undefined,
                exit_type: exitType || undefined,
              });
            } catch (e: any) {
              console.error('Value Readiness Report generation error:', e.message);
            }
          } else if (advancement.completionDeliverable === 'thesis_document') {
            try {
              deliverableContent = await generateThesisDocument({
                buyer_type: mergedData.buyer_type as string | undefined,
                target_industry: mergedData.target_industry as string | undefined,
                target_geography: mergedData.target_geography as string | undefined,
                capital_available: mergedData.capital_available as number | undefined,
                financing_approach: mergedData.financing_approach as string | undefined,
                target_size_range: mergedData.target_size_range as string | undefined,
                league: league || 'L1',
                prefers_sba: !!(mergedData.financing_approach as string)?.toLowerCase()?.includes('sba'),
                session_id: effectiveSessionId,
              });
            } catch (e: any) {
              console.error('Thesis Document generation error:', e.message);
            }
          } else if (advancement.completionDeliverable === 'sde_analysis') {
            try {
              deliverableContent = generateSdeAnalysis({
                business_name: mergedData.business_name as string | undefined,
                industry: mergedData.industry as string | undefined,
                location: mergedData.location as string | undefined,
                revenue: mergedData.revenue as number | undefined,
                owner_compensation: mergedData.owner_compensation as number | undefined,
                owner_salary: mergedData.owner_salary as number | undefined,
                sde: mergedData.sde as number | undefined,
                ebitda: mergedData.ebitda as number | undefined,
                net_income: mergedData.net_income as number | undefined,
                league: league || 'L1',
              });
            } catch (e: any) {
              console.error('SDE Analysis generation error:', e.message);
            }
          }

          // Save deliverable as assistant message
          if (deliverableContent) {
            await sql`
              INSERT INTO messages (conversation_id, role, content, metadata)
              VALUES (
                ${convId},
                'assistant',
                ${deliverableContent},
                ${JSON.stringify({ type: 'deliverable', deliverableType: advancement.completionDeliverable, gate_from: currentGate, gate_to: advancement.nextGate })}::jsonb
              )
            `;
          }

          // Advance the gate
          await advanceAnonymousGate(convId!, advancement.nextGate);
        }
      } catch (err: any) {
        console.error('Post-stream intelligence hook error:', err.message);
      }
    });
  } catch (err: any) {
    console.error('Chat message error:', err.message, err.status, JSON.stringify(err.error || err.body || {}).substring(0, 500), err.stack);

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong. Please try again.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
});

// ─── Create conversation ────────────────────────────────────

chatRouter.post('/conversations', async (req, res) => {
  try {
    const userId = (req as any).userId || null;
    const title = req.body.title || 'New conversation';

    const [conv] = await sql`
      INSERT INTO conversations (user_id, title)
      VALUES (${userId}, ${title})
      RETURNING id, user_id, title, is_archived, created_at, updated_at
    `;

    return res.status(201).json(conv);
  } catch (err: any) {
    console.error('Create conversation error:', err.message);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// ─── Migrate anonymous session conversations to authenticated user ──

chatRouter.post('/conversations/migrate-session', requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  try {
    const result = await sql`
      UPDATE conversations
      SET user_id = ${userId}, session_id = NULL
      WHERE session_id = ${sessionId} AND user_id IS NULL
    `;
    return res.json({ success: true, migrated: result.count });
  } catch (err: any) {
    console.error('Session migration error:', err.message);
    return res.status(500).json({ error: 'Migration failed' });
  }
});

// ─── List conversations ─────────────────────────────────────

chatRouter.get('/conversations', async (req, res) => {
  try {
    const userId = (req as any).userId || null;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    let convos;
    if (userId) {
      convos = await sql`
        SELECT c.id, c.title, c.deal_id, c.is_archived, c.created_at, c.updated_at,
               d.journey_type as journey, d.current_gate, d.business_name, d.industry
        FROM conversations c
        LEFT JOIN deals d ON c.deal_id = d.id
        WHERE c.user_id = ${userId} AND c.is_archived = false
        ORDER BY c.updated_at DESC
      `;
    } else if (sessionId) {
      convos = await sql`
        SELECT c.id, c.title, c.deal_id, c.is_archived, c.created_at, c.updated_at,
               d.journey_type as journey, d.current_gate, d.business_name, d.industry
        FROM conversations c
        LEFT JOIN deals d ON c.deal_id = d.id
        WHERE c.session_id = ${sessionId} AND c.is_archived = false
        ORDER BY c.updated_at DESC
        LIMIT 50
      `;
    } else {
      convos = [];
    }

    return res.json(convos);
  } catch (err: any) {
    console.error('List conversations error:', err.message);
    return res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// ─── Get messages ───────────────────────────────────────────

chatRouter.get('/conversations/:id/messages', async (req, res) => {
  try {
    const userId = (req as any).userId || null;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const convId = parseInt(req.params.id, 10);

    // Allow access if user owns it or if session_id matches
    let conv;
    if (userId) {
      [conv] = await sql`SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${userId} LIMIT 1`;
    } else if (sessionId) {
      [conv] = await sql`SELECT id FROM conversations WHERE id = ${convId} AND session_id = ${sessionId} LIMIT 1`;
    }
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const msgs = await sql`
      SELECT id, role, content, metadata, created_at
      FROM messages
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
    `;

    return res.json(msgs);
  } catch (err: any) {
    console.error('Get messages error:', err.message);
    return res.status(500).json({ error: 'Failed to get messages' });
  }
});

// ─── Delete conversation ─────────────────────────────────────

chatRouter.delete('/conversations/:id', async (req, res) => {
  try {
    const userId = (req as any).userId || null;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const convId = parseInt(req.params.id, 10);

    // Verify ownership
    let conv;
    if (userId) {
      [conv] = await sql`SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${userId} LIMIT 1`;
    } else if (sessionId) {
      [conv] = await sql`SELECT id FROM conversations WHERE id = ${convId} AND session_id = ${sessionId} LIMIT 1`;
    }
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Delete messages first, then conversation
    await sql`DELETE FROM messages WHERE conversation_id = ${convId}`;
    await sql`DELETE FROM conversations WHERE id = ${convId}`;

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete conversation error:', err.message);
    return res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// ─── Get gate progress for a deal ────────────────────────────

chatRouter.get('/deals/:dealId/gates', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    // Verify ownership
    const [deal] = await sql`
      SELECT id, journey_type, current_gate FROM deals
      WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1
    `;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const gates = await sql`
      SELECT gate, status, completed_at
      FROM gate_progress
      WHERE deal_id = ${dealId}
      ORDER BY gate
    `;

    return res.json({
      dealId: deal.id,
      journeyType: deal.journey_type,
      currentGate: deal.current_gate,
      gates,
    });
  } catch (err: any) {
    console.error('Get gate progress error:', err.message);
    return res.status(500).json({ error: 'Failed to get gate progress' });
  }
});

// ─── Unlock a paywall gate (purchase) ───────────────────────

chatRouter.post('/deals/:dealId/unlock-gate', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const { gate } = req.body;

    if (!gate) return res.status(400).json({ error: 'Gate ID required' });

    // Verify ownership
    const deal = await getDeal(dealId);
    if (!deal || deal.user_id !== userId) return res.status(404).json({ error: 'Deal not found' });

    // Verify this is a valid paywall transition
    const readiness = checkGateReadiness(deal.current_gate, deal);
    if (!readiness.ready) {
      return res.status(400).json({ error: 'Current gate not ready for advancement', missing: readiness.missing });
    }
    if (!readiness.paywallRequired || readiness.nextGate !== gate) {
      return res.status(400).json({ error: 'Invalid gate unlock request' });
    }

    // Calculate price
    const league = deal.league || 'L1';
    const paywall = generatePaywallPrompt({
      gate,
      league,
      journeyType: deal.journey_type,
      dealData: {
        industry: deal.industry || undefined,
        revenue: deal.revenue || undefined,
        sde: deal.sde || undefined,
        ebitda: deal.ebitda || undefined,
        business_name: deal.business_name || undefined,
        asking_price: deal.asking_price || undefined,
      },
    });

    // Check balance
    const balance = await getBalance(userId);
    if (balance < paywall.priceCents) {
      return res.status(402).json({
        error: 'Insufficient wallet balance',
        required: paywall.priceCents,
        requiredDisplay: paywall.priceDisplay,
        balance,
        balanceDisplay: `$${(balance / 100).toFixed(2)}`,
        shortfall: paywall.priceCents - balance,
        shortfallDisplay: `$${((paywall.priceCents - balance) / 100).toFixed(2)}`,
      });
    }

    // Debit wallet
    await debitWallet(userId, paywall.priceCents, `Gate unlock: ${gate} (${deal.journey_type})`);

    // Advance gate
    const newGate = await advanceGate(dealId, deal.current_gate);

    // Auto-trigger primary deliverable for the unlocked gate
    let deliverableId: number | null = null;
    try {
      const gateItems = await getGateMenuItems(gate);
      if (gateItems.length > 0) {
        const primaryItem = gateItems[0]; // First item is the primary deliverable
        const [deliverable] = await sql`
          INSERT INTO deliverables (deal_id, user_id, menu_item_id, status, price_charged_cents)
          VALUES (${dealId}, ${userId}, ${primaryItem.id}, 'queued', 0)
          RETURNING id
        `;
        deliverableId = deliverable.id;
        const jobData = {
          deliverableId: deliverable.id,
          dealId,
          userId,
          menuItemSlug: primaryItem.slug,
          deliverableType: primaryItem.slug.replace(/-/g, '_'),
        };
        await enqueueDeliverableGeneration(jobData);

        // Inline fallback — idempotency guard prevents double-processing
        setImmediate(() => {
          processDeliverable(jobData).catch(err =>
            console.error('Inline gate deliverable generation error:', err.message),
          );
        });
      }
    } catch (e: any) {
      console.error('Auto-trigger deliverable error:', e.message);
    }

    return res.json({
      success: true,
      fromGate: deal.current_gate,
      toGate: newGate,
      priceCharged: paywall.priceCents,
      priceDisplay: paywall.priceDisplay,
      newBalance: balance - paywall.priceCents,
      newBalanceDisplay: `$${((balance - paywall.priceCents) / 100).toFixed(2)}`,
      deliverableId,
    });
  } catch (err: any) {
    console.error('Gate unlock error:', err.message);
    return res.status(500).json({ error: 'Failed to unlock gate' });
  }
});

// ─── Send message + get AI response via SSE ─────────────────

chatRouter.post('/conversations/:id/messages', requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const convId = parseInt(req.params.id, 10);
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Verify ownership
    const [conv] = await sql`
      SELECT id, title, deal_id FROM conversations
      WHERE id = ${convId} AND user_id = ${userId} LIMIT 1
    `;
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Save user message
    const [userMsg] = await sql`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${convId}, 'user', ${content.trim()})
      RETURNING id, role, content, metadata, created_at
    `;

    // Auto-title on first message
    if (conv.title === 'New conversation') {
      const shortTitle = content.trim().substring(0, 60) + (content.trim().length > 60 ? '...' : '');
      await sql`UPDATE conversations SET title = ${shortTitle}, updated_at = NOW() WHERE id = ${convId}`;
    }

    // Load context
    const [user] = await sql`SELECT id, email, display_name, league FROM users WHERE id = ${userId} LIMIT 1`;

    // Load deal if linked
    let deal = null;
    if (conv.deal_id) {
      const [d] = await sql`SELECT * FROM deals WHERE id = ${conv.deal_id} AND user_id = ${userId} LIMIT 1`;
      deal = d || null;
    }

    // Also check for any active deal for this user (if conversation isn't linked yet)
    if (!deal) {
      const [activeDeal] = await sql`
        SELECT * FROM deals WHERE user_id = ${userId} AND status = 'active'
        ORDER BY updated_at DESC LIMIT 1
      `;
      if (activeDeal) {
        deal = activeDeal;
        // Link conversation to deal
        await sql`UPDATE conversations SET deal_id = ${activeDeal.id} WHERE id = ${convId}`;
      }
    }

    // Build system prompt
    const systemPrompt = await buildSystemPrompt(user as any, deal as any, convId);

    // Load conversation history (last 50 messages max)
    const history = await sql`
      SELECT role, content FROM messages
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
      LIMIT 50
    `;

    const messages: MessageParam[] = history.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-User-Message-Id', String(userMsg.id));

    // Send user message confirmation
    res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMsg })}\n\n`);

    // Run agentic loop and stream response
    const assistantText = await streamAgenticResponse(
      { userId, conversationId: convId, systemPrompt, messages },
      res,
    );

    // Save assistant message to DB
    if (assistantText) {
      const [assistantMsg] = await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${convId}, 'assistant', ${assistantText})
        RETURNING id, role, content, metadata, created_at
      `;

      // Update conversation timestamp
      await sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${convId}`;

      // Re-load deal — the create_deal tool may have linked one during the agentic loop
      if (!deal) {
        const [freshConv] = await sql`SELECT deal_id FROM conversations WHERE id = ${convId} LIMIT 1`;
        if (freshConv?.deal_id) {
          const [d] = await sql`SELECT * FROM deals WHERE id = ${freshConv.deal_id} AND user_id = ${userId} LIMIT 1`;
          deal = d || null;
        }
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMsg, dealId: deal?.id || null, conversationId: convId })}\n\n`);

      // Extract fields from conversation and update deal, then check gate advancement
      if (deal) {
        try {
          const allMsgs = [...messages, { role: 'assistant' as const, content: assistantText }];
          const fields = await extractFields(allMsgs);
          if (fields) {
            // Load current deal values to guard against overwriting tool-saved data
            const currentDeal = await getDeal(deal.id);
            const dealColumns: Record<string, any> = {};
            const financialsFields: Record<string, any> = {};
            const DEAL_COLUMNS = new Set(['industry', 'location', 'business_name', 'revenue', 'sde', 'ebitda', 'asking_price', 'employee_count', 'naics_code', 'league']);

            for (const [key, value] of Object.entries(fields)) {
              if (key === 'journey_type') continue;
              if (DEAL_COLUMNS.has(key)) {
                // Only apply if current DB value is null/empty (don't overwrite tool-saved values)
                const currentVal = currentDeal ? (currentDeal as any)[key] : null;
                if (currentVal === null || currentVal === undefined || currentVal === '') {
                  dealColumns[key] = value;
                }
              } else {
                // For financials, only apply if not already set
                const currentFin = currentDeal?.financials || {};
                if (currentFin[key] === null || currentFin[key] === undefined) {
                  financialsFields[key] = value;
                }
              }
            }

            if (Object.keys(dealColumns).length > 0) {
              await updateDealFields(deal.id, dealColumns);
            }
            if (Object.keys(financialsFields).length > 0) {
              await updateDealFinancials(deal.id, financialsFields);
            }
          }
        } catch (e: any) {
          console.error('Field extraction/update error:', e.message);
        }

        // Now check gate advancement with updated fields
        try {
          const gateResult = await checkAndAutoAdvance(deal.id);
          if (gateResult) {
            res.write(`data: ${JSON.stringify({ type: 'gate_advance', ...gateResult })}\n\n`);
            createNotification({ userId, dealId: deal.id, type: 'gate_advance', title: `Gate complete: ${gateResult.gateName || gateResult.toGate}`, body: `Your deal has advanced to ${gateResult.toGate}`, actionUrl: '/chat' }).catch(() => {});
          } else {
            // Check if we're at a paywall — gate is ready but next gate requires payment
            const freshDeal = await getDeal(deal.id);
            if (freshDeal) {
              const readiness = checkGateReadiness(freshDeal.current_gate, freshDeal);
              if (readiness.ready && readiness.paywallRequired && readiness.nextGate) {
                const league = freshDeal.league || user.league || 'L1';
                const paywall = generatePaywallPrompt({
                  gate: readiness.nextGate,
                  league,
                  journeyType: freshDeal.journey_type,
                  dealData: {
                    industry: freshDeal.industry || undefined,
                    revenue: freshDeal.revenue || undefined,
                    sde: freshDeal.sde || undefined,
                    ebitda: freshDeal.ebitda || undefined,
                    business_name: freshDeal.business_name || undefined,
                    asking_price: freshDeal.asking_price || undefined,
                  },
                });
                const balance = await getBalance(userId);
                res.write(`data: ${JSON.stringify({
                  type: 'paywall',
                  gate: readiness.nextGate,
                  currentGate: freshDeal.current_gate,
                  priceCents: paywall.priceCents,
                  priceDisplay: paywall.priceDisplay,
                  valueProps: paywall.valueProps,
                  comparisonText: paywall.comparisonText,
                  callToAction: paywall.callToAction,
                  balanceCents: balance,
                  balanceDisplay: `$${(balance / 100).toFixed(2)}`,
                  sufficient: balance >= paywall.priceCents,
                })}\n\n`);
              }
            }
          }
        } catch (e: any) {
          console.error('Gate auto-advance error:', e.message);
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Chat error:', err.message, err.stack);

    // If headers already sent (SSE started), send error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong. Please try again.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
});
