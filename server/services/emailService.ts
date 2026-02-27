/**
 * Email Service — Sends transactional emails via Resend.
 * Falls back to console.log when RESEND_API_KEY is not configured.
 */
import { sql } from '../db.js';

let resendClient: any = null;

async function getResend() {
  if (resendClient) return resendClient;
  if (!process.env.RESEND_API_KEY) return null;
  try {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
  } catch {
    return null;
  }
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'SMBx <notifications@smbx.ai>';
const BASE_URL = process.env.BASE_URL || 'https://app.smbx.ai';

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
    subject: `You've been invited to collaborate on ${invitation.dealName || 'a deal'} — SMBx`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A1A18; font-size: 20px;">You're invited to collaborate</h2>
        <p style="color: #6E6A63; line-height: 1.6;">
          ${invitation.inviterName || 'Someone'} has invited you to join
          <strong>${invitation.dealName || 'a deal'}</strong> as a <strong>${roleName}</strong>.
        </p>
        <a href="${acceptUrl}" style="display: inline-block; background: #D4714E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0;">
          Accept Invitation
        </a>
        <p style="color: #A9A49C; font-size: 12px; margin-top: 24px;">
          This invitation expires in 7 days. If you didn't expect this email, you can ignore it.
        </p>
      </div>
    `,
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
    subject: `48-hour access to ${dayPass.dealName || 'a deal'} — SMBx`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A1A18; font-size: 20px;">You have a 48-hour Day Pass</h2>
        <p style="color: #6E6A63; line-height: 1.6;">
          You've been granted temporary access to <strong>${dayPass.dealName || 'a deal'}</strong>
          as a <strong>${dayPass.role.replace(/_/g, ' ')}</strong>.
        </p>
        <p style="color: #6E6A63; line-height: 1.6;">
          Your 48-hour access window starts when you click the button below.
        </p>
        <a href="${passUrl}" style="display: inline-block; background: #D4714E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0;">
          Activate Day Pass
        </a>
        <p style="color: #A9A49C; font-size: 12px; margin-top: 24px;">
          This pass provides limited-time access. No account required.
        </p>
      </div>
    `,
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
    subject: `${matchCount} new listing${matchCount > 1 ? 's' : ''} match your thesis — SMBx`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A1A18; font-size: 20px;">New matches found</h2>
        <p style="color: #6E6A63; line-height: 1.6;">
          Hi ${user.display_name || 'there'},
        </p>
        <p style="color: #6E6A63; line-height: 1.6;">
          We found <strong>${matchCount}</strong> new listing${matchCount > 1 ? 's' : ''} that match your buy thesis criteria.
        </p>
        <a href="${BASE_URL}/chat" style="display: inline-block; background: #D4714E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0;">
          View Matches
        </a>
        <p style="color: #A9A49C; font-size: 12px; margin-top: 24px;">
          You're receiving this because you have an active buy thesis on SMBx.
        </p>
      </div>
    `,
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
    subject: `New document added to ${dealName} — SMBx`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A1A18; font-size: 20px;">New document uploaded</h2>
        <p style="color: #6E6A63; line-height: 1.6;">
          A new document "<strong>${docName}</strong>" has been added to <strong>${dealName}</strong>.
        </p>
        <a href="${BASE_URL}/chat" style="display: inline-block; background: #D4714E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0;">
          View in SMBx
        </a>
      </div>
    `,
  });
}
