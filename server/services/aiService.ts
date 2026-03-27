import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ContentBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { TOOL_DEFINITIONS, executeTool } from './tools.js';
import type { Response } from 'express';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOOL_ROUNDS = 10; // safety limit on agentic loops

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 120_000, // 120s timeout — agentic loops need headroom
      maxRetries: 2,    // Auto-retry on 429/529
    });
  }
  return client;
}

/** Safe SSE write — checks destroyed + writableEnded, catches errors */
function safeWrite(res: Response, data: string): boolean {
  try {
    if (res.destroyed || res.writableEnded) return false;
    res.write(data);
    return true;
  } catch (err: any) {
    console.error('SSE write failed:', err.code || err.message);
    return false;
  }
}

interface StreamContext {
  userId: number;
  conversationId: number;
  systemPrompt: string;
  messages: MessageParam[];
}

/**
 * Runs the agentic loop: calls Claude with tools, executes tool calls,
 * feeds results back, and streams the final text to the client via SSE.
 * Returns the full assistant text for saving to DB.
 */
export async function streamAgenticResponse(
  ctx: StreamContext,
  res: Response,
): Promise<string> {
  const anthropic = getClient();
  let messages = [...ctx.messages];
  let fullText = '';
  let round = 0;

  // Heartbeat during agentic loop — keeps SSE alive through proxies/Railway
  const heartbeat = setInterval(() => {
    safeWrite(res, ': heartbeat\n\n');
  }, 10_000);

  try {
    while (round < MAX_TOOL_ROUNDS) {
      round++;

      // Bail early if client disconnected
      if (res.destroyed || res.writableEnded) break;

      // Call Claude (non-streaming for tool use rounds, streaming for final response)
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: ctx.systemPrompt,
        messages,
        tools: TOOL_DEFINITIONS,
      });

      // Check if Claude wants to use tools
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
      const textBlocks = response.content.filter(b => b.type === 'text');

      // Collect any text from this response
      for (const block of textBlocks) {
        if (block.type === 'text' && block.text) {
          fullText += block.text;
        }
      }

      // If no tool calls, we're done — stream the text
      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        if (fullText) {
          streamText(res, fullText);
        }
        break;
      }

      // Execute tool calls
      const toolResults: ContentBlockParam[] = [];
      for (const block of toolUseBlocks) {
        if (block.type === 'tool_use') {
          safeWrite(res, `data: ${JSON.stringify({ type: 'tool_start', tool: block.name })}\n\n`);

          if (process.env.NODE_ENV !== 'production') {
            console.log(`Tool call: ${block.name}(${JSON.stringify(block.input).substring(0, 200)})`);
          }

          try {
            const result = await executeTool(
              block.name,
              block.input as Record<string, any>,
              ctx.userId,
              ctx.conversationId,
            );
            if (process.env.NODE_ENV !== 'production') {
              console.log(`Tool result: ${result.substring(0, 200)}`);
            }

            safeWrite(res, `data: ${JSON.stringify({ type: 'tool_done', tool: block.name })}\n\n`);

            toolResults.push({
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: result,
            });
          } catch (toolErr: any) {
            console.error(`Tool execution error (${block.name}):`, toolErr.message);
            safeWrite(res, `data: ${JSON.stringify({ type: 'tool_done', tool: block.name })}\n\n`);
            toolResults.push({
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: `Error: ${toolErr.message}`,
              is_error: true,
            } as any);
          }
        }
      }

      // Add assistant response and tool results to message history for next round
      messages = [
        ...messages,
        { role: 'assistant' as const, content: response.content },
        { role: 'user' as const, content: toolResults as any },
      ];

      // If Claude also produced text alongside tool calls, hold it for now
      if ((response.stop_reason as string) === 'end_turn') {
        if (fullText) streamText(res, fullText);
        break;
      }

      // Reset fullText — we only want the final response after all tools
      fullText = '';
    }
  } catch (err: any) {
    console.error('Agentic streaming error:', err.message, err.status, err.code);
    const userMessage = err.status === 429
      ? 'I\'m experiencing high demand right now. Please try again in a moment.'
      : 'I ran into a temporary issue. Let me try that again.';
    streamText(res, fullText ? `${fullText}\n\n${userMessage}` : userMessage);
    fullText = fullText ? `${fullText}\n\n${userMessage}` : userMessage;
  } finally {
    clearInterval(heartbeat);
  }

  return fullText;
}

/**
 * Streams text to client as SSE chunks (word by word for typing effect).
 */
function streamText(res: Response, text: string) {
  const words = text.split(/(\s+)/);
  let buffer = '';

  for (const word of words) {
    buffer += word;
    if (buffer.length >= 10 || word.includes('\n')) {
      if (!safeWrite(res, `data: ${JSON.stringify({ type: 'text_delta', text: buffer })}\n\n`)) return;
      buffer = '';
    }
  }

  if (buffer) {
    safeWrite(res, `data: ${JSON.stringify({ type: 'text_delta', text: buffer })}\n\n`);
  }
}

/**
 * Streams a simple response (no tools) for anonymous/public chat.
 * Lower token limit, no agentic loop.
 */
export async function streamAnonymousResponse(
  systemPrompt: string,
  messages: MessageParam[],
  res: Response,
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages,
  });

  const fullText = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');

  if (fullText) {
    streamText(res, fullText);
  }

  return fullText;
}

/**
 * Simple non-streaming call for when we don't need SSE.
 */
export async function callClaude(
  systemPrompt: string,
  messages: MessageParam[],
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  return response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');
}

/**
 * Non-streaming call with explicit model selection.
 * Used by the deliverable processor for tier-based model routing.
 */
export async function callClaudeWithModel(
  modelId: string,
  systemPrompt: string,
  messages: MessageParam[],
  maxTokens: number = 4096,
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  return response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');
}
