/**
 * usePasskey — Client-side WebAuthn hook for passkey registration and verification.
 *
 * Usage:
 *   const { register, verify, hasPasskey, loading } = usePasskey();
 *   await register('My MacBook');              // Create passkey (Face ID prompt)
 *   await verify('nda_sign', { dealId: 42 });  // Verify for NDA signing
 */
import { useState, useCallback } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { authHeaders } from './useAuth';

type PasskeyAction = 'login' | 'nda_sign' | 'doc_execute' | 'review_approve' | 'share_auth';

export function usePasskey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Register a new passkey ─────────────────────────────────

  const register = useCallback(async (deviceName?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get registration options from server
      const optionsRes = await fetch('/api/passkeys/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!optionsRes.ok) throw new Error('Failed to start registration');
      const options = await optionsRes.json();

      // 2. Create credential via browser API (triggers Face ID / Touch ID)
      const credential = await startRegistration({ optionsJSON: options });

      // 3. Send credential to server for verification + storage
      const verifyRes = await fetch('/api/passkeys/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ response: credential, deviceName }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || 'Registration failed');
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Passkey registration failed');
      setLoading(false);
      return false;
    }
  }, []);

  // ─── Verify identity for a sensitive action ─────────────────

  const verify = useCallback(async (
    action: PasskeyAction,
    context?: Record<string, any>,
  ): Promise<{ verified: boolean; verificationId?: number }> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get authentication options
      const optionsRes = await fetch('/api/passkeys/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ action, context }),
      });
      if (!optionsRes.ok) {
        const data = await optionsRes.json();
        throw new Error(data.error || 'Failed to start verification');
      }
      const options = await optionsRes.json();

      // 2. Authenticate via browser API (triggers Face ID / Touch ID)
      const credential = await startAuthentication({ optionsJSON: options });

      // 3. Verify on server
      const verifyRes = await fetch('/api/passkeys/verify/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ action, response: credential }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || 'Verification failed');
      }

      const result = await verifyRes.json();
      setLoading(false);
      return { verified: true, verificationId: result.verificationId };
    } catch (err: any) {
      setError(err.message || 'Passkey verification failed');
      setLoading(false);
      return { verified: false };
    }
  }, []);

  // ─── Check if user has passkeys ─────────────────────────────

  const checkHasPasskey = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/passkeys', { headers: authHeaders() });
      if (!res.ok) return false;
      const passkeys = await res.json();
      return passkeys.length > 0;
    } catch {
      return false;
    }
  }, []);

  return { register, verify, checkHasPasskey, loading, error };
}
