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
      .email-headline { color: #F0F0F3 !important; }
      .email-text { color: #A0A0A0 !important; }
      .email-cta-td { background-color: #F0F0F3 !important; }
      .email-cta-link { background-color: #F0F0F3 !important; color: #1A1C1E !important; }
      .email-footer { border-top-color: rgba(255,255,255,0.06) !important; }
      .email-footer-text { color: #636467 !important; }
      .email-footnote { color: #636467 !important; }
      .email-divider { border-color: rgba(255,255,255,0.06) !important; }
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

// ─── 4. INVITATION ───
export async function sendInvitationEmail(invitation: {
  email: string;
  token: string;
  role: string;
  dealName?: string;
  inviterName?: string;
}): Promise<boolean> {
  const acceptUrl = `${BASE_URL}/invite/${invitation.token}`;
  const inviter = invitation.inviterName || 'Someone';
  const deal = invitation.dealName || 'a deal';

  return sendEmail({
    to: invitation.email,
    subject: `${inviter} invited you to a deal on smbx.ai`,
    html: brandedEmail({
      headline: 'You\'ve been invited to collaborate.',
      body: `
        <p style="margin:0 0 14px;"><strong style="color:#1A1C1E;">${inviter}</strong> has invited you to join <strong style="color:#1A1C1E;">${deal}</strong> on smbx.ai. This gives you access to the deal workspace — financials, documents, conversations, and whatever stage the deal is at.</p>
        <p style="margin:0;">I'm Yulia, the AI running the analytical side of this engagement. I've been working with ${inviter} on this deal, and now you're part of the team. Jump in whenever you're ready. I'll catch you up.</p>
      `,
      ctaLabel: 'Join the Deal',
      ctaUrl: acceptUrl,
      footnote: `If you don't recognize ${inviter} or this deal, you can ignore this invitation.`,
    }),
  });
}

// ─── 5. DAY PASS ───
export async function sendDayPassEmail(dayPass: {
  email: string;
  token: string;
  role: string;
  dealName?: string;
  inviterName?: string;
}): Promise<boolean> {
  const passUrl = `${BASE_URL}/day-pass/${dayPass.token}`;
  const deal = dayPass.dealName || 'a deal';
  const inviter = dayPass.inviterName || 'Someone';

  return sendEmail({
    to: dayPass.email,
    subject: 'You\'ve got 48 hours — let\'s make them count',
    html: brandedEmail({
      headline: 'Your day pass is active.',
      body: `
        <p style="margin:0 0 14px;"><strong style="color:#1A1C1E;">${inviter}</strong> just gave you temporary access to <strong style="color:#1A1C1E;">${deal}</strong> on smbx.ai. You've got 48 hours to review everything in the workspace — documents, financials, analysis, the works.</p>
        <p style="margin:0;">I'm Yulia. If you need context on anything you're looking at, just ask me directly in the workspace. I know this deal inside and out.</p>
      `,
      ctaLabel: 'Open the Deal',
      ctaUrl: passUrl,
      footnote: 'This is temporary access — it expires automatically. No account or payment required.',
    }),
  });
}

// ─── 6. THESIS MATCH ALERT ───
export async function sendThesisMatchAlert(userId: number, matchCount: number, matchDetails?: { type?: string; location?: string; revenue?: string; sde?: string }): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  const details = matchDetails
    ? `<p style="margin:14px 0;padding:16px 20px;background:rgba(0,0,0,0.03);border-radius:12px;font-size:14px;color:#1A1C1E;font-weight:500;">${[matchDetails.type, matchDetails.location, matchDetails.revenue ? matchDetails.revenue + ' revenue' : '', matchDetails.sde ? matchDetails.sde + ' SDE' : ''].filter(Boolean).join(' &middot; ')}</p>`
    : '';

  return sendEmail({
    to: user.email,
    subject: `New match: ${matchCount} listing${matchCount > 1 ? 's' : ''} hit your thesis`,
    html: brandedEmail({
      headline: 'Something just came across my radar.',
      body: `
        <p style="margin:0 0 14px;">A new listing hit the market that matches your acquisition thesis — and it caught my eye before I even scored it.</p>
        ${details}
        <p style="margin:0;">I've already run a preliminary screen. Want the full breakdown? I can score it in 60 seconds and tell you if it's worth your time or if there are deal-killers hiding in the numbers.</p>
      `,
      ctaLabel: 'See the Match',
      ctaUrl: `${BASE_URL}/chat`,
      footnote: 'You\'re getting this because it matched your thesis criteria. Adjust your thesis anytime in your workspace.',
    }),
  });
}

// ─── 7. DOCUMENT NOTIFICATION ───
export async function sendDocumentNotification(userId: number, dealName: string, docName: string, uploadedBy?: string): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  return sendEmail({
    to: user.email,
    subject: `New document in ${dealName}`,
    html: brandedEmail({
      headline: 'Something new just landed in your deal room.',
      body: `
        <p style="margin:0;"><strong style="color:#1A1C1E;">${docName}</strong> was added to <strong style="color:#1A1C1E;">${dealName}</strong>${uploadedBy ? ` by ${uploadedBy}` : ''}. I've already scanned it. If you want a quick summary or need me to flag anything that looks off, just open the deal and ask.</p>
      `,
      ctaLabel: 'View Document',
      ctaUrl: `${BASE_URL}/chat`,
    }),
  });
}

// ─── 3. WELCOME ───
export async function sendWelcomeEmail(email: string, displayName?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'You\'re in. Let\'s talk about your deal.',
    html: brandedEmail({
      headline: `Welcome to smbx.ai.`,
      body: `
        <p style="margin:0 0 14px;">I'm Yulia — I'll be running the numbers, building the documents, and managing the process for your deal. You make the decisions. I do the heavy lifting.</p>
        <p style="margin:0 0 14px;">Whether you're selling, buying, raising capital, or figuring out what comes next — just tell me about your situation. I'll take it from there.</p>
        <p style="margin:0;">Fair warning: I'm going to ask you real questions and give you real answers. No fluff, no generic advice. Just the analysis you'd get from a deal team that actually knows your business.</p>
      `,
      ctaLabel: 'Talk to Yulia',
      ctaUrl: `${BASE_URL}/chat`,
      footnote: 'You\'re on the Free plan — unlimited conversation, plus your first deliverable is on me.',
    }),
  });
}

// ─── 8. GATE ADVANCEMENT ───
export async function sendGateAdvancementEmail(userId: number, gateName: string, journeyType: string, dealName?: string, unlockSummary?: string): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  const journey = journeyType.charAt(0).toUpperCase() + journeyType.slice(1);
  const prevGate = journey + ' stage';
  const unlocks = unlockSummary
    ? `<p style="margin:14px 0;padding:16px 20px;background:rgba(0,0,0,0.03);border-radius:12px;font-size:14px;color:#1A1C1E;line-height:1.6;">${unlockSummary}</p>`
    : '';

  return sendEmail({
    to: user.email,
    subject: 'Your deal just moved forward',
    html: brandedEmail({
      headline: `New gate unlocked: ${gateName}.`,
      body: `
        <p style="margin:0 0 14px;">Nice work — you just completed everything needed in the ${prevGate}, and your deal has advanced to <strong style="color:#1A1C1E;">${gateName}</strong>.</p>
        ${unlocks ? '<p style="margin:0 0 6px;font-weight:600;color:#1A1C1E;font-size:14px;">Here\'s what opens up now:</p>' + unlocks : ''}
        <p style="margin:0;">I've already started prepping the next phase. When you're ready to dive in, I'll walk you through what's ahead and what I need from you to keep things moving.</p>
      `,
      ctaLabel: 'Continue Your Deal',
      ctaUrl: `${BASE_URL}/chat`,
      footnote: 'Gates advance when all prerequisites are verified — not on a timer. Your deal moves at your pace.',
    }),
  });
}

// ─── 9. DELIVERABLE READY ───
export async function sendDeliverableReadyEmail(userId: number, deliverableName: string, dealName?: string): Promise<boolean> {
  const [user] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
  if (!user?.email) return false;

  return sendEmail({
    to: user.email,
    subject: `Your ${deliverableName} is ready`,
    html: brandedEmail({
      headline: 'Fresh off the press.',
      body: `
        <p style="margin:0 0 14px;">Your <strong style="color:#1A1C1E;">${deliverableName}</strong>${dealName ? ` for <strong style="color:#1A1C1E;">${dealName}</strong>` : ''} is done. I just finished building it from your verified financials and the analysis we've been working through together.</p>
        <p style="margin:0;">Before you share it with anyone, give it a read. If the assumptions look right, it's ready to go. If something needs adjusting, just tell me — I'll revise it while you grab coffee.</p>
      `,
      ctaLabel: `View Your ${deliverableName}`,
      ctaUrl: `${BASE_URL}/chat`,
      footnote: 'This document was generated by Yulia based on data you provided and verified. It does not constitute financial, legal, or tax advice.',
    }),
  });
}

// ─── TEST: Send all 9 templates to a given email ───
export async function sendTestEmails(toEmail: string): Promise<{ sent: number; failed: number }> {
  let sent = 0, failed = 0;
  const tests = [
    { subject: '[TEST 1/9] Verify Email', html: brandedEmail({ headline: 'Confirm your email.', body: '<p style="margin:0 0 14px;">Hey, it\'s Yulia from smbx.ai. Just making sure this is actually you (and not someone\'s cat walking across the keyboard).</p><p style="margin:0;">One click and we\'re set.</p>', ctaLabel: 'Confirm My Email', ctaUrl: `${BASE_URL}/verify-email?token=test`, footnote: 'If you didn\'t create an smbx.ai account, you can safely ignore this.' }) },
    { subject: '[TEST 2/9] Password Reset', html: brandedEmail({ headline: 'Forgot your password? Happens to the best of us.', body: '<p style="margin:0 0 14px;">No judgment here — I forget things too. (Not deal numbers. Never deal numbers.)</p><p style="margin:0;">Click below to set a new password. This link expires in 30 minutes, so don\'t sit on it.</p>', ctaLabel: 'Reset My Password', ctaUrl: `${BASE_URL}/reset-password/test`, footnote: 'Didn\'t request this? Someone may have typed your email by mistake. Nothing has changed on your account.' }) },
    { subject: '[TEST 3/9] Welcome', html: brandedEmail({ headline: 'Welcome to smbx.ai.', body: '<p style="margin:0 0 14px;">I\'m Yulia — I\'ll be running the numbers, building the documents, and managing the process for your deal. You make the decisions. I do the heavy lifting.</p><p style="margin:0 0 14px;">Whether you\'re selling, buying, raising capital, or figuring out what comes next — just tell me about your situation. I\'ll take it from there.</p><p style="margin:0;">Fair warning: I\'m going to ask you real questions and give you real answers. No fluff, no generic advice. Just the analysis you\'d get from a deal team that actually knows your business.</p>', ctaLabel: 'Talk to Yulia', ctaUrl: `${BASE_URL}/chat`, footnote: 'You\'re on the Free plan — unlimited conversation, plus your first deliverable is on me.' }) },
    { subject: '[TEST 4/9] Invitation', html: brandedEmail({ headline: 'You\'ve been invited to collaborate.', body: '<p style="margin:0 0 14px;"><strong style="color:#1A1C1E;">Sarah Chen</strong> has invited you to join <strong style="color:#1A1C1E;">Acme HVAC Acquisition</strong> on smbx.ai. This gives you access to the deal workspace — financials, documents, conversations, and whatever stage the deal is at.</p><p style="margin:0;">I\'m Yulia, the AI running the analytical side of this engagement. I\'ve been working with Sarah on this deal, and now you\'re part of the team. Jump in whenever you\'re ready. I\'ll catch you up.</p>', ctaLabel: 'Join the Deal', ctaUrl: `${BASE_URL}/invite/test`, footnote: 'If you don\'t recognize Sarah Chen or this deal, you can ignore this invitation.' }) },
    { subject: '[TEST 5/9] Day Pass', html: brandedEmail({ headline: 'Your day pass is active.', body: '<p style="margin:0 0 14px;"><strong style="color:#1A1C1E;">Marcus Rivera</strong> just gave you temporary access to <strong style="color:#1A1C1E;">Southwest Plumbing Group</strong> on smbx.ai. You\'ve got 48 hours to review everything in the workspace — documents, financials, analysis, the works.</p><p style="margin:0;">I\'m Yulia. If you need context on anything you\'re looking at, just ask me directly in the workspace. I know this deal inside and out.</p>', ctaLabel: 'Open the Deal', ctaUrl: `${BASE_URL}/day-pass/test`, footnote: 'This is temporary access — it expires automatically. No account or payment required.' }) },
    { subject: '[TEST 6/9] Thesis Match', html: brandedEmail({ headline: 'Something just came across my radar.', body: '<p style="margin:0 0 14px;">A new listing hit the market that matches your acquisition thesis — and it caught my eye before I even scored it.</p><p style="margin:14px 0;padding:16px 20px;background:rgba(0,0,0,0.03);border-radius:12px;font-size:14px;color:#1A1C1E;font-weight:500;">HVAC &middot; Dallas-Fort Worth &middot; $2.1M revenue &middot; $680K SDE</p><p style="margin:0;">I\'ve already run a preliminary screen. Want the full breakdown? I can score it in 60 seconds and tell you if it\'s worth your time or if there are deal-killers hiding in the numbers.</p>', ctaLabel: 'See the Match', ctaUrl: `${BASE_URL}/chat`, footnote: 'You\'re getting this because it matched your thesis criteria. Adjust your thesis anytime in your workspace.' }) },
    { subject: '[TEST 7/9] Document', html: brandedEmail({ headline: 'Something new just landed in your deal room.', body: '<p style="margin:0;"><strong style="color:#1A1C1E;">Q4 2025 P&L Statement</strong> was added to <strong style="color:#1A1C1E;">Acme HVAC Acquisition</strong> by Sarah Chen. I\'ve already scanned it. If you want a quick summary or need me to flag anything that looks off, just open the deal and ask.</p>', ctaLabel: 'View Document', ctaUrl: `${BASE_URL}/chat` }) },
    { subject: '[TEST 8/9] Gate Advancement', html: brandedEmail({ headline: 'New gate unlocked: Due Diligence.', body: '<p style="margin:0 0 14px;">Nice work — you just completed everything needed in the Valuation stage, and your deal has advanced to <strong style="color:#1A1C1E;">Due Diligence</strong>.</p><p style="margin:0 0 6px;font-weight:600;color:#1A1C1E;font-size:14px;">Here\'s what opens up now:</p><p style="margin:14px 0;padding:16px 20px;background:rgba(0,0,0,0.03);border-radius:12px;font-size:14px;color:#1A1C1E;line-height:1.6;">Quality of Earnings analysis, customer concentration risk, working capital assessment, and environmental review</p><p style="margin:0;">I\'ve already started prepping the next phase. When you\'re ready to dive in, I\'ll walk you through what\'s ahead and what I need from you to keep things moving.</p>', ctaLabel: 'Continue Your Deal', ctaUrl: `${BASE_URL}/chat`, footnote: 'Gates advance when all prerequisites are verified — not on a timer. Your deal moves at your pace.' }) },
    { subject: '[TEST 9/9] Deliverable Ready', html: brandedEmail({ headline: 'Fresh off the press.', body: '<p style="margin:0 0 14px;">Your <strong style="color:#1A1C1E;">ValueLens Report</strong> for <strong style="color:#1A1C1E;">Acme HVAC Acquisition</strong> is done. I just finished building it from your verified financials and the analysis we\'ve been working through together.</p><p style="margin:0;">Before you share it with anyone, give it a read. If the assumptions look right, it\'s ready to go. If something needs adjusting, just tell me — I\'ll revise it while you grab coffee.</p>', ctaLabel: 'View Your ValueLens Report', ctaUrl: `${BASE_URL}/chat`, footnote: 'This document was generated by Yulia based on data you provided and verified. It does not constitute financial, legal, or tax advice.' }) },
  ];

  for (let i = 0; i < tests.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 2000)); // 2s delay to avoid rate limits
    const ok = await sendEmail({ to: toEmail, ...tests[i] });
    if (ok) sent++; else failed++;
  }
  console.log(`[email-test] Sent ${sent}/${tests.length} test emails to ${toEmail}`);
  return { sent, failed };
}
