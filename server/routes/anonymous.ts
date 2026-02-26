import { Router } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { sql } from '../db.js';
import { buildAnonymousPrompt } from '../services/promptBuilder.js';
import { streamAnonymousResponse } from '../services/aiService.js';
import { extractFields } from '../services/fieldExtractor.js';
import { scoreSevenFactors, calculateCompositeScore, scoredFactorCount } from '../services/sevenFactorScoring.js';
import { extractFromDocument } from '../services/documentExtractor.js';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const anonymousRouter = Router();

// Upload config
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, XLSX, XLS, and CSV files are allowed'));
    }
  },
});

const MAX_MESSAGES = 20;
const MAX_SESSIONS_PER_IP = 3;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getClientIp(req: any): string {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

// ─── Create anonymous session ───────────────────────────────

anonymousRouter.post('/', async (req, res) => {
  const ip = getClientIp(req);

  try {
    // Rate limit: max sessions per IP in last 24h
    const [{ count }] = await sql`
      SELECT COUNT(*)::int as count FROM anonymous_sessions
      WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '24 hours'
    `;

    if (count >= MAX_SESSIONS_PER_IP) {
      return res.status(429).json({
        error: 'Session limit reached. Sign up for unlimited access.',
      });
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    await sql`
      INSERT INTO anonymous_sessions (session_id, ip, source_page, messages, message_count, expires_at)
      VALUES (${sessionId}, ${ip}, ${req.body.context || null}, '[]'::jsonb, 0, ${expiresAt}::timestamptz)
    `;

    return res.status(201).json({ sessionId, messagesRemaining: MAX_MESSAGES });
  } catch (err: any) {
    console.error('Create anonymous session error:', err.message);
    return res.status(500).json({ error: 'Failed to create session' });
  }
});

// ─── Get anonymous session (for restore) ─────────────────────

anonymousRouter.get('/:sessionId', async (req, res) => {
  try {
    const [session] = await sql`
      SELECT session_id, source_page, messages, message_count, expires_at, data
      FROM anonymous_sessions
      WHERE session_id = ${req.params.sessionId}
        AND expires_at > NOW()
        AND converted_to_user_id IS NULL
    `;

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const userMsgCount = (session.messages as any[]).filter((m: any) => m.role === 'user').length;

    return res.json({
      sessionId: session.session_id,
      sourcePage: session.source_page,
      messages: session.messages,
      messagesRemaining: MAX_MESSAGES - userMsgCount,
      limitReached: userMsgCount >= MAX_MESSAGES,
      sessionData: session.data || null,
    });
  } catch (err: any) {
    console.error('Get anonymous session error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// ─── Send message in anonymous session ──────────────────────

anonymousRouter.post('/:sessionId/messages', async (req, res) => {
  try {
    const [session] = await sql`
      SELECT id, session_id, source_page, messages, message_count, expires_at
      FROM anonymous_sessions
      WHERE session_id = ${req.params.sessionId}
        AND expires_at > NOW()
        AND converted_to_user_id IS NULL
    `;

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const msgs = (session.messages as any[]) || [];
    const userMsgCount = msgs.filter((m: any) => m.role === 'user').length;

    if (userMsgCount >= MAX_MESSAGES) {
      return res.status(403).json({
        error: 'Message limit reached',
        action: 'signup',
        message: 'Create a free account to continue chatting with Yulia.',
      });
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Add user message to array
    const updatedMsgs = [...msgs, { role: 'user', content: content.trim() }];

    // Persist user message immediately
    await sql`
      UPDATE anonymous_sessions
      SET messages = ${JSON.stringify(updatedMsgs)}::jsonb,
          message_count = ${updatedMsgs.length},
          last_active_at = NOW()
      WHERE id = ${session.id}
    `;

    // Build prompt with page context
    const systemPrompt = buildAnonymousPrompt(session.source_page || undefined);
    const apiMessages: MessageParam[] = updatedMsgs.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // SSE setup
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send user message confirmation
    res.write(`data: ${JSON.stringify({ type: 'user_message', content: content.trim() })}\n\n`);

    try {
      const assistantText = await streamAnonymousResponse(systemPrompt, apiMessages, res);

      if (assistantText) {
        const finalMsgs = [...updatedMsgs, { role: 'assistant', content: assistantText }];

        // Persist assistant response
        await sql`
          UPDATE anonymous_sessions
          SET messages = ${JSON.stringify(finalMsgs)}::jsonb,
              message_count = ${finalMsgs.length},
              last_active_at = NOW()
          WHERE id = ${session.id}
        `;
      }

      const remaining = MAX_MESSAGES - (userMsgCount + 1);
      res.write(`data: ${JSON.stringify({ type: 'done', messagesRemaining: remaining })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();

      // Fire-and-forget: extract structured fields + seven-factor scoring
      if (assistantText) {
        const finalMsgsForExtraction = [...updatedMsgs, { role: 'assistant', content: assistantText }];
        extractFields(finalMsgsForExtraction).then(async (fields) => {
          if (fields) {
            try {
              await sql`
                UPDATE anonymous_sessions
                SET data = COALESCE(data, '{}'::jsonb) || ${JSON.stringify(fields)}::jsonb
                WHERE id = ${session.id}
              `;

              // Run seven-factor scoring if we have enough data
              const [currentSession] = await sql`
                SELECT data FROM anonymous_sessions WHERE id = ${session.id}
              `;
              const allData = currentSession?.data || {};
              if (allData.industry && allData.revenue) {
                const scores = await scoreSevenFactors(allData);
                if (scores && scoredFactorCount(scores) >= 2) {
                  const composite = calculateCompositeScore(scores);
                  await sql`
                    UPDATE anonymous_sessions
                    SET data = COALESCE(data, '{}'::jsonb)
                      || ${JSON.stringify({ seven_factor_scores: scores, seven_factor_composite: composite })}::jsonb
                    WHERE id = ${session.id}
                  `;
                }
              }
            } catch (e: any) {
              console.error('Field storage error:', e.message);
            }
          }
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Anonymous chat error:', err.message);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong. Please try again.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.status(500).json({ error: 'Something went wrong.' });
      }
    }
  } catch (err: any) {
    console.error('Anonymous message error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process message' });
    }
  }
});

// ─── Upload file in anonymous session ────────────────────────

anonymousRouter.post('/:sessionId/upload', upload.single('file'), async (req, res) => {
  try {
    const [session] = await sql`
      SELECT id, session_id, messages, message_count, expires_at
      FROM anonymous_sessions
      WHERE session_id = ${req.params.sessionId}
        AND expires_at > NOW()
        AND converted_to_user_id IS NULL
    `;

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
    };

    // Store file info in session data
    await sql`
      UPDATE anonymous_sessions
      SET data = COALESCE(data, '{}'::jsonb) || ${JSON.stringify({ uploaded_file: fileInfo })}::jsonb,
          last_active_at = NOW()
      WHERE id = ${session.id}
    `;

    // Fire-and-forget: extract financial data from the document
    const fullPath = path.resolve(UPLOAD_DIR, req.file.filename);
    extractFromDocument(fullPath, req.file.originalname).then(async (extracted) => {
      if (extracted && extracted.confidence !== 'low') {
        try {
          await sql`
            UPDATE anonymous_sessions
            SET data = COALESCE(data, '{}'::jsonb) || ${JSON.stringify({ extracted_financials: extracted })}::jsonb
            WHERE id = ${session.id}
          `;
        } catch (e: any) {
          console.error('Document extraction storage error:', e.message);
        }
      }
    }).catch((e) => console.error('Document extraction error:', e.message));

    return res.json({
      success: true,
      file: {
        name: fileInfo.originalName,
        size: fileInfo.size,
        sizeFormatted: fileInfo.size > 1024 * 1024
          ? `${(fileInfo.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(fileInfo.size / 1024).toFixed(0)} KB`,
      },
    });
  } catch (err: any) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// ─── Convert anonymous session to authenticated user ────────

anonymousRouter.post('/:sessionId/convert', async (req, res) => {
  try {
    const [session] = await sql`
      SELECT id, messages FROM anonymous_sessions
      WHERE session_id = ${req.params.sessionId}
        AND expires_at > NOW()
        AND converted_to_user_id IS NULL
    `;

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const msgs = (session.messages as any[]) || [];

    // Create a conversation for the user
    const [conv] = await sql`
      INSERT INTO conversations (user_id, title)
      VALUES (${userId}, ${msgs[0]?.content?.substring(0, 60) || 'Continued from preview'})
      RETURNING id
    `;

    // Copy all messages to the conversation
    for (const msg of msgs) {
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${conv.id}, ${msg.role}, ${msg.content})
      `;
    }

    // Mark session as converted
    await sql`
      UPDATE anonymous_sessions
      SET converted_to_user_id = ${userId}
      WHERE id = ${session.id}
    `;

    return res.json({ success: true, conversationId: conv.id });
  } catch (err: any) {
    console.error('Session convert error:', err.message);
    return res.status(500).json({ error: 'Failed to convert session' });
  }
});
