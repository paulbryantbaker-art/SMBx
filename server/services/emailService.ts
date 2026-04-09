/**
 * Email Service — Sends transactional emails via Resend.
 * Falls back to console.log when RESEND_API_KEY is not configured.
 */
import { sql } from '../db.js';

let resendClient: any = null;

async function getResend() {
  if (resendClient) return resendClient;
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set');
    return null;
  }
  try {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log('[email] Resend client initialized');
    return resendClient;
  } catch (err: any) {
    console.error('[email] Failed to import resend:', err.message);
    return null;
  }
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'SMBx <notifications@smbx.ai>';
const BASE_URL = process.env.APP_URL || process.env.BASE_URL || 'https://smbx.ai';

// ─── Branded email wrapper matching marketing materials ───
export function brandedEmail({ headline, body, ctaLabel, ctaUrl, footnote }: {
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}): string {
  const cta = ctaLabel && ctaUrl ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
      <tr><td style="background:#1A1C1E;border-radius:100px;">
        <a href="${ctaUrl}" style="display:inline-block;background:#1A1C1E;color:#ffffff;padding:16px 36px;border-radius:100px;text-decoration:none;font-weight:700;font-size:16px;font-family:'Inter',system-ui,sans-serif;letter-spacing:-0.01em;mso-padding-alt:0;text-underline-color:#1A1C1E;">
          ${ctaLabel}
        </a>
      </td></tr>
    </table>` : '';

  const foot = footnote ? `
    <p class="email-footnote" style="color:#A9A49C;font-size:13px;line-height:1.5;margin:28px 0 0;font-family:'Inter',system-ui,sans-serif;">
      ${footnote}
    </p>` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #151617 !important; }
      .email-card { background-color: #1A1C1E !important; }
      .email-headline { color: #F0F0F3 !important; }
      .email-text { color: #A0A0A0 !important; }
      .email-cta { background-color: #F0F0F3 !important; color: #1A1C1E !important; }
      .email-footer { border-top-color: rgba(255,255,255,0.06) !important; }
      .email-footer-text { color: #636467 !important; }
      .email-footnote { color: #636467 !important; }
    }
  </style>
</head>
<body class="email-body" style="margin:0;padding:0;background:#F8F6F2;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-text-size-adjust:100%;">
  <!-- Full-bleed rose accent stripe -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:4px;background:#D44A78;"></td></tr></table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- Logo -->
        <tr><td style="padding:40px 32px 0;">
          <img src="https://smbx.ai/G3L.png" alt="smbx.ai" height="32" width="140" style="height:32px;width:auto;display:block;" />
        </td></tr>

        <!-- Content -->
        <tr><td style="padding:32px 32px 44px;">
          <h1 class="email-headline" style="font-family:'Inter',system-ui,sans-serif;font-weight:800;font-size:28px;color:#1A1C1E;margin:0 0 20px;line-height:1.15;letter-spacing:-0.03em;">
            ${headline}
          </h1>
          <div class="email-text" style="font-family:'Inter',system-ui,sans-serif;font-size:16px;color:#5D5E61;line-height:1.7;">
            ${body}
          </div>
          ${cta}
          ${foot}
        </td></tr>

        <!-- Footer -->
        <tr><td class="email-footer" style="padding:24px 32px;border-top:1px solid rgba(0,0,0,0.06);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <img src="https://smbx.ai/G3L.png" alt="smbx.ai" height="18" width="80" style="height:18px;width:auto;display:block;opacity:0.4;" />
            </td>
            <td align="right">
              <p class="email-footer-text" style="font-family:'Inter',system-ui,sans-serif;font-size:11px;color:#A9A49C;margin:0;letter-spacing:0.03em;">
                AI Deal Intelligence
              </p>
            </td>
          </tr></table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Send an email. Falls back to console.log if Resend is not configured.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  const resend = await getResend();

  if (!resend) {
    console.log(`[EMAIL-FALLBACK] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL-FALLBACK] Body preview: ${html.replace(/<[^>]*>/g, '').substring(0, 200)}`);
    return false;
  }

  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (err: any) {
    console.error('Email send error:', err.message);
    return false;
  }
}

/**
 * Send invitation email with accept link.
 */
export async function sendInvitationEmail(invitation: {
  email: string;
  token: string;
  role: string;
  dealName?: string;
  inviterName?: string;
}): Promise<boolean> {
  const acceptUrl = `${BASE_URL}/invite/${invitation.token}`;
  const roleName = invitation.role.replace(/_/g, ' ');

  return sendEmail({
    to: invitation.email,
    subject: `You've been invited to collaborate on ${invitation.dealName || 'a deal'} — smbx.ai`,
    html: brandedEmail({
      headline: 'You\'re invited to collaborate.',
      body: `
        <p style="margin:0 0 12px;">${invitation.inviterName || 'Someone'} has invited you to join <strong style="color:#1A1C1E;">${invitation.dealName || 'a deal'}</strong> as a <strong style="color:#1A1C1E;">${roleName}</strong>.</p>
      `,
      ctaLabel: 'Accept Invitation',
      ctaUrl: acceptUrl,
      footnote: 'This invitation expires in 7 days. If you didn\'t expect this email, you can ignore it.',
    }),
  });
}

/**
 * Send day pass email with activation link.
 */
export async function sendDayPassEmail(dayPass: {
  email: string;
  token: string;
  role: string;
  dealName?: string;
}): Promise<boolean> {
  const passUrl = `${BASE_URL}/day-pass/${dayPass.token}`;

  return sendEmail({
    to: dayPass.email,
    subject: `48-hour access to ${dayPass.dealName || 'a deal'} — smbx.ai`,
    html: brandedEmail({
      headline: '48-hour Day Pass.',
      body: `
        <p style="margin:0 0 12px;">You've been granted temporary access to <strong style="color:#1A1C1E;">${dayPass.dealName || 'a deal'}</strong> as a <strong style="color:#1A1C1E;">${dayPass.role.replace(/_/g, ' ')}</strong>.</p>
        <p style="margin:0;">Your access window starts when you click the button below.</p>
      `,
      ctaLabel: 'Activate Day Pass',
      ctaUrl: passUrl,
      footnote: 'This pass provides limited-time access. No account required.',
    }),
  });
}

/**
 * Send thesis match alert digest.
 */
export async function sendThesisMatchAlert(userId: number, matchCount: number): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  return sendEmail({
    to: user.email,
    subject: `${matchCount} new listing${matchCount > 1 ? 's' : ''} match your thesis — smbx.ai`,
    html: brandedEmail({
      headline: `${matchCount} new match${matchCount > 1 ? 'es' : ''} found.`,
      body: `
        <p style="margin:0 0 12px;">Hi ${user.display_name || 'there'},</p>
        <p style="margin:0;">We found <strong style="color:#1A1C1E;">${matchCount}</strong> new listing${matchCount > 1 ? 's' : ''} that match your buy thesis criteria.</p>
      `,
      ctaLabel: 'View Matches',
      ctaUrl: `${BASE_URL}/chat`,
      footnote: 'You\'re receiving this because you have an active buy thesis on smbx.ai.',
    }),
  });
}

/**
 * Send new document notification.
 */
export async function sendDocumentNotification(userId: number, dealName: string, docName: string): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  return sendEmail({
    to: user.email,
    subject: `New document added to ${dealName} — smbx.ai`,
    html: brandedEmail({
      headline: 'New document uploaded.',
      body: `
        <p style="margin:0;">A new document "<strong style="color:#1A1C1E;">${docName}</strong>" has been added to <strong style="color:#1A1C1E;">${dealName}</strong>.</p>
      `,
      ctaLabel: 'View in SMBx',
      ctaUrl: `${BASE_URL}/chat`,
    }),
  });
}

/**
 * Send welcome email after signup.
 */
export async function sendWelcomeEmail(email: string, displayName?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to smbx.ai — Yulia is ready',
    html: brandedEmail({
      headline: `Welcome${displayName ? `, ${displayName}` : ''}.`,
      body: `
        <p style="margin:0 0 12px;">I'm Yulia, your AI deal intelligence advisor. Whether you're buying, selling, or raising capital, I'll guide you through every step — from initial valuation to closing.</p>
        <p style="margin:0;">Start by telling me about your deal. Upload financials, and I'll generate your first deliverable for free.</p>
      `,
      ctaLabel: 'Start a Conversation',
      ctaUrl: `${BASE_URL}/chat`,
      footnote: 'Free gates include intake, financial analysis, and your first valuation. No credit card required.',
    }),
  });
}

/**
 * Send gate advancement notification.
 */
export async function sendGateAdvancementEmail(userId: number, gateName: string, journeyType: string, dealName?: string): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  const journey = journeyType.charAt(0).toUpperCase() + journeyType.slice(1);

  return sendEmail({
    to: user.email,
    subject: `${journey} journey advanced to ${gateName} — smbx.ai`,
    html: brandedEmail({
      headline: 'New gate unlocked.',
      body: `
        <p style="margin:0 0 12px;">Hi ${user.display_name || 'there'},</p>
        <p style="margin:0;">Your ${journey.toLowerCase()} journey${dealName ? ` for <strong style="color:#1A1C1E;">${dealName}</strong>` : ''} has advanced to <strong style="color:#1A1C1E;">${gateName}</strong>. New deliverables and tools are now available.</p>
      `,
      ctaLabel: 'Continue Your Journey',
      ctaUrl: `${BASE_URL}/chat`,
    }),
  });
}

/**
 * Send deliverable ready notification.
 */
export async function sendDeliverableReadyEmail(userId: number, deliverableName: string, dealName?: string): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  return sendEmail({
    to: user.email,
    subject: `Your ${deliverableName} is ready — smbx.ai`,
    html: brandedEmail({
      headline: 'Deliverable ready.',
      body: `
        <p style="margin:0 0 12px;">Hi ${user.display_name || 'there'},</p>
        <p style="margin:0;">Your <strong style="color:#1A1C1E;">${deliverableName}</strong>${dealName ? ` for <strong style="color:#1A1C1E;">${dealName}</strong>` : ''} has been generated and is ready for review.</p>
      `,
      ctaLabel: 'View Deliverable',
      ctaUrl: `${BASE_URL}/chat`,
      footnote: 'You can export to PDF, DOCX, or XLSX from the canvas view.',
    }),
  });
}
