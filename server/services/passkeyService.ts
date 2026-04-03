/**
 * Passkey Service — WebAuthn/FIDO2 for authentication and authorization.
 *
 * Used for: login, NDA signing, document execution, review approval, share auth.
 * Every sensitive action gets a passkey challenge → cryptographic verification → audit trail.
 */
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { sql } from '../db.js';

// ─── Configuration ──────────────────────────────────────────────────

const RP_NAME = 'smbx.ai';
const RP_ID = process.env.PASSKEY_RP_ID || 'app.smbx.ai';
const ORIGIN = process.env.APP_URL || `https://${RP_ID}`;
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Registration (Create Passkey) ──────────────────────────────────

export async function startRegistration(userId: number): Promise<any> {
  const [user] = await sql`SELECT id, email, display_name FROM users WHERE id = ${userId}`;
  if (!user) throw new Error('User not found');

  // Get existing passkeys for this user (to exclude)
  const existingKeys = await sql`SELECT credential_id FROM passkeys WHERE user_id = ${userId}`;

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.email,
    userDisplayName: user.display_name || user.email,
    attestationType: 'none',
    excludeCredentials: existingKeys.map((k: any) => ({
      id: k.credential_id,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  // Store challenge
  await sql`
    INSERT INTO webauthn_challenges (user_id, challenge, type, expires_at)
    VALUES (${userId}, ${options.challenge}, 'registration', ${new Date(Date.now() + CHALLENGE_TTL_MS).toISOString()})
  `;

  return options;
}

export async function completeRegistration(
  userId: number,
  response: RegistrationResponseJSON,
  deviceName?: string,
): Promise<{ success: boolean; passkeyId: number }> {
  // Get stored challenge
  const [challenge] = await sql`
    SELECT id, challenge FROM webauthn_challenges
    WHERE user_id = ${userId} AND type = 'registration' AND NOT used
      AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1
  `;
  if (!challenge) throw new Error('No valid registration challenge found');

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed');
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  // Store passkey
  const [passkey] = await sql`
    INSERT INTO passkeys (user_id, credential_id, public_key, counter, device_type, backed_up, transports, name)
    VALUES (
      ${userId},
      ${Buffer.from(credential.id).toString('base64url')},
      ${Buffer.from(credential.publicKey).toString('base64')},
      ${credential.counter},
      ${credentialDeviceType},
      ${credentialBackedUp},
      ${response.response.transports || []},
      ${deviceName || null}
    )
    RETURNING id
  `;

  // Mark challenge used
  await sql`UPDATE webauthn_challenges SET used = true WHERE id = ${challenge.id}`;

  return { success: true, passkeyId: passkey.id };
}

// ─── Authentication (Verify Identity) ───────────────────────────────

export type PasskeyAction = 'login' | 'nda_sign' | 'doc_execute' | 'review_approve' | 'share_auth';

export async function startAuthentication(
  userId: number,
  action: PasskeyAction,
  context?: Record<string, any>,
): Promise<any> {
  const userKeys = await sql`
    SELECT credential_id, transports FROM passkeys WHERE user_id = ${userId}
  `;

  if (userKeys.length === 0) {
    throw new Error('No passkeys registered. Set up a passkey first.');
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: userKeys.map((k: any) => ({
      id: k.credential_id,
      transports: k.transports,
    })),
    userVerification: 'preferred',
  });

  // Store challenge with action context
  await sql`
    INSERT INTO webauthn_challenges (user_id, challenge, type, context, expires_at)
    VALUES (${userId}, ${options.challenge}, ${action}, ${context ? JSON.stringify(context) : null}::jsonb, ${new Date(Date.now() + CHALLENGE_TTL_MS).toISOString()})
  `;

  return options;
}

export async function completeAuthentication(
  userId: number,
  action: PasskeyAction,
  response: AuthenticationResponseJSON,
  meta?: { ip?: string; userAgent?: string },
): Promise<{ verified: boolean; verificationId: number; context: any }> {
  // Get stored challenge
  const [challenge] = await sql`
    SELECT id, challenge, context FROM webauthn_challenges
    WHERE user_id = ${userId} AND type = ${action} AND NOT used
      AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1
  `;
  if (!challenge) throw new Error('No valid authentication challenge found');

  // Get the passkey
  const credentialId = response.id;
  const [passkey] = await sql`
    SELECT id, credential_id, public_key, counter, transports
    FROM passkeys WHERE user_id = ${userId} AND credential_id = ${credentialId}
  `;
  if (!passkey) throw new Error('Passkey not found');

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: passkey.credential_id,
      publicKey: Buffer.from(passkey.public_key, 'base64'),
      counter: Number(passkey.counter),
      transports: passkey.transports,
    },
  });

  if (!verification.verified) {
    throw new Error('Authentication verification failed');
  }

  // Update counter
  await sql`
    UPDATE passkeys SET counter = ${verification.authenticationInfo.newCounter}, last_used_at = NOW()
    WHERE id = ${passkey.id}
  `;

  // Mark challenge used
  await sql`UPDATE webauthn_challenges SET used = true WHERE id = ${challenge.id}`;

  // Record verification in audit trail
  const [record] = await sql`
    INSERT INTO passkey_verifications (user_id, passkey_id, action, context)
    VALUES (${userId}, ${passkey.id}, ${action}, ${JSON.stringify({
      ...(challenge.context || {}),
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    })}::jsonb)
    RETURNING id
  `;

  return { verified: true, verificationId: record.id, context: challenge.context };
}

// ─── User's Passkeys ────────────────────────────────────────────────

export async function getUserPasskeys(userId: number): Promise<any[]> {
  return sql`
    SELECT id, device_type, backed_up, name, last_used_at, created_at
    FROM passkeys WHERE user_id = ${userId}
    ORDER BY last_used_at DESC NULLS LAST
  `;
}

export async function deletePasskey(userId: number, passkeyId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM passkeys WHERE id = ${passkeyId} AND user_id = ${userId}
    RETURNING id
  `;
  return result.length > 0;
}

export async function hasPasskey(userId: number): Promise<boolean> {
  const [row] = await sql`SELECT 1 FROM passkeys WHERE user_id = ${userId} LIMIT 1`;
  return !!row;
}
