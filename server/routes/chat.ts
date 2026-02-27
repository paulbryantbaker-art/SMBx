import { Router } from 'express';
import postgres from 'postgres';
import Anthropic from '@anthropic-ai/sdk';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { buildSystemPrompt } from '../services/promptBuilder.js';
import { streamAgenticResponse } from '../services/aiService.js';
import { checkAndAutoAdvance, getDeal, updateDealFields, updateDealFinancials, advanceGate } from '../services/dealService.js';
import { extractFields } from '../services/fieldExtractor.js';
import { checkGateReadiness } from '../services/gateReadinessService.js';
import { generatePaywallPrompt } from '../services/paywallService.js';
import { getBalance, debitWallet } from '../services/walletService.js';
import { getLeagueMultiplier } from '../services/leagueClassifier.js';
import { getGateMenuItems } from '../services/menuCatalogService.js';
import { enqueueDeliverableGeneration } from '../services/jobQueue.js';
import { createNotification } from './notifications.js';
import { MASTER_SYSTEM_PROMPT } from '../prompts/masterPrompt.js';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

const STREAMING_MODEL = 'claude-sonnet-4-20250514';

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

export const chatRouter = Router();

// Auth is now optional — endpoints work with or without JWT
chatRouter.use(optionalAuth);

// ─── POST /message — Main SSE streaming endpoint ────────────

chatRouter.post('/message', async (req, res) => {
  const userId = (req as any).userId || null;
  const { message, conversationId, journeyContext } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let convId = conversationId ? parseInt(String(conversationId), 10) : null;

    // Create conversation if none provided
    if (!convId) {
      const shortTitle = message.trim().substring(0, 60) + (message.trim().length > 60 ? '...' : '');
      const [conv] = await sql`
        INSERT INTO conversations (user_id, title)
        VALUES (${userId}, ${shortTitle})
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

    // Build system prompt — include journey context if provided
    let systemPrompt = MASTER_SYSTEM_PROMPT;
    if (journeyContext) {
      systemPrompt += `\n\nCURRENT CONTEXT: The user is interested in: ${journeyContext}`;
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', String(convId));

    // Stream from Anthropic
    const anthropic = getAnthropicClient();
    let fullText = '';

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
  } catch (err: any) {
    console.error('Chat message error:', err.message, err.stack);

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

// ─── List conversations ─────────────────────────────────────

chatRouter.get('/conversations', async (req, res) => {
  try {
    const userId = (req as any).userId || null;

    const convos = userId
      ? await sql`
          SELECT id, title, deal_id, is_archived, created_at, updated_at
          FROM conversations
          WHERE user_id = ${userId} AND is_archived = false
          ORDER BY updated_at DESC
        `
      : await sql`
          SELECT id, title, deal_id, is_archived, created_at, updated_at
          FROM conversations
          WHERE user_id IS NULL AND is_archived = false
          ORDER BY updated_at DESC
          LIMIT 50
        `;

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
    const convId = parseInt(req.params.id, 10);

    // Allow access if user owns it or if conversation has no owner
    const [conv] = userId
      ? await sql`SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${userId} LIMIT 1`
      : await sql`SELECT id FROM conversations WHERE id = ${convId} LIMIT 1`;
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
    const convId = parseInt(req.params.id, 10);

    // Verify ownership (or allow if no owner)
    const [conv] = userId
      ? await sql`SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${userId} LIMIT 1`
      : await sql`SELECT id FROM conversations WHERE id = ${convId} AND user_id IS NULL LIMIT 1`;
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
        await enqueueDeliverableGeneration({
          deliverableId: deliverable.id,
          dealId,
          userId,
          menuItemSlug: primaryItem.slug,
          deliverableType: primaryItem.slug.replace(/-/g, '_'),
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
    const systemPrompt = buildSystemPrompt(user as any, deal as any, convId);

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

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMsg, dealId: deal?.id || null })}\n\n`);

      // Extract fields from conversation and update deal, then check gate advancement
      if (deal) {
        try {
          const allMsgs = [...messages, { role: 'assistant' as const, content: assistantText }];
          const fields = await extractFields(allMsgs);
          if (fields) {
            const dealColumns: Record<string, any> = {};
            const financialsFields: Record<string, any> = {};
            const DEAL_COLUMNS = new Set(['industry', 'location', 'business_name', 'revenue', 'sde', 'ebitda', 'asking_price', 'employee_count', 'naics_code', 'league']);

            for (const [key, value] of Object.entries(fields)) {
              if (key === 'journey_type') continue;
              if (DEAL_COLUMNS.has(key)) {
                dealColumns[key] = value;
              } else {
                financialsFields[key] = value;
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
