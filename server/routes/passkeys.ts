/**
 * Passkey Routes — WebAuthn registration and authentication endpoints.
 *
 * Registration: user creates a passkey (Face ID / Touch ID / security key)
 * Authentication: user verifies identity for sensitive actions
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  startRegistration, completeRegistration,
  startAuthentication, completeAuthentication,
  getUserPasskeys, deletePasskey,
  type PasskeyAction,
} from '../services/passkeyService.js';

export const passkeyRouter = Router();
passkeyRouter.use(requireAuth);

// ─── Registration ───────────────────────────────────────────────

passkeyRouter.post('/passkeys/register/start', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const options = await startRegistration(userId);
    return res.json(options);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

passkeyRouter.post('/passkeys/register/complete', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { response, deviceName } = req.body;
    const result = await completeRegistration(userId, response, deviceName);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ─── Authentication (for sensitive actions) ─────────────────────

passkeyRouter.post('/passkeys/verify/start', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { action, context } = req.body;

    const validActions: PasskeyAction[] = ['login', 'nda_sign', 'doc_execute', 'review_approve', 'share_auth'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const options = await startAuthentication(userId, action, context);
    return res.json(options);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

passkeyRouter.post('/passkeys/verify/complete', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { action, response } = req.body;

    const result = await completeAuthentication(userId, action, response, {
      ip: req.ip || (req.headers['x-forwarded-for'] as string),
      userAgent: req.headers['user-agent'],
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ─── Manage Passkeys ────────────────────────────────────────────

passkeyRouter.get('/passkeys', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const passkeys = await getUserPasskeys(userId);
    return res.json(passkeys);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

passkeyRouter.delete('/passkeys/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const passkeyId = parseInt(req.params.id, 10);
    const deleted = await deletePasskey(userId, passkeyId);
    if (!deleted) return res.status(404).json({ error: 'Passkey not found' });
    return res.json({ deleted: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
