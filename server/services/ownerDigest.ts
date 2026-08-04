/**
 * server/services/ownerDigest.ts — the practitioner's daily valuation digest
 * (Paul, 2026-08-04: "a report to me via email for valuation starts vs
 * completed ones, every early morning").
 *
 * Counts only what the database honestly holds — the quick tier is ephemeral
 * by law, so its "starts" are not persisted and are NOT invented here; what
 * exists is completions (a seller_registry row with a generated report),
 * waitlist hand-raises, and the full tier's workspaces (created = started,
 * report_generated_at = completed, the gap = in flight with parked counts).
 *
 * Fires once daily at ~06:00 Central (11:00 UTC) via a 15-minute in-process
 * tick, same pattern as the research scheduler. OWNER_DIGEST_DISABLED=true
 * turns it off. Recipient: first TEAM_ALLOWLIST email, fallback Paul.
 */
import { createSql } from '../dbConfig.js';
import { sendEmail } from './emailService.js';

const sql = createSql();
const DIGEST_UTC_HOUR = 11; // 06:00 Central (CDT)
let lastSentDay = '';

function recipient(): string {
  const first = (process.env.TEAM_ALLOWLIST || '').split(',')[0]?.trim();
  return first || 'paulbryantbaker@gmail.com';
}

export async function sendOwnerDigest(): Promise<boolean> {
  const [quick] = await sql`
    SELECT
      count(*) FILTER (WHERE report_generated_at > now() - interval '24 hours') AS completed_24h,
      count(*) FILTER (WHERE situation = 'lane-waitlist' AND created_at > now() - interval '24 hours') AS waitlist_24h,
      count(*) FILTER (WHERE retention = 'kept') AS kept_total
    FROM seller_registry`;
  const [full] = await sql`
    SELECT
      count(*) FILTER (WHERE created_at > now() - interval '24 hours') AS started_24h,
      count(*) FILTER (WHERE report_generated_at > now() - interval '24 hours') AS completed_24h,
      count(*) FILTER (WHERE report_generated_at IS NULL) AS in_flight,
      count(*) AS started_total,
      count(*) FILTER (WHERE report_generated_at IS NOT NULL) AS completed_total
    FROM owner_evaluations`;

  const row = (l: string, v: unknown) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#5C6670">${l}</td><td style="padding:6px 0;font-weight:700;text-align:right">${v}</td></tr>`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#16181A;max-width:520px">
      <h2 style="margin:0 0 4px">Owner valuations — daily digest</h2>
      <div style="color:#8A9099;font-size:13px;margin-bottom:18px">${new Date().toUTCString()}</div>
      <h3 style="margin:0 0 6px;font-size:15px">Full evaluations (workspaces)</h3>
      <table style="border-collapse:collapse;font-size:14px">
        ${row('Started, last 24h', full.started_24h)}
        ${row('Completed, last 24h', full.completed_24h)}
        ${row('In flight (all time)', full.in_flight)}
        ${row('Started / completed, all time', `${full.started_total} / ${full.completed_total}`)}
      </table>
      <h3 style="margin:18px 0 6px;font-size:15px">Quick valuations</h3>
      <table style="border-collapse:collapse;font-size:14px">
        ${row('Completed, last 24h', quick.completed_24h)}
        ${row('Waitlist hand-raises, last 24h', quick.waitlist_24h)}
        ${row('First-call list (kept, all time)', quick.kept_total)}
      </table>
      <div style="color:#8A9099;font-size:12px;margin-top:18px">
        Quick-tier starts are not counted — figures there are never stored, so
        only completions exist in the database. Full-tier starts are consented
        workspaces.
      </div>
    </div>`;

  const mailed = await sendEmail({
    to: recipient(),
    subject: `Valuations: ${full.started_24h} started · ${Number(full.completed_24h) + Number(quick.completed_24h)} completed (24h)`,
    html,
  });
  return mailed !== false;
}

export function startOwnerDigestScheduler(): void {
  if (process.env.OWNER_DIGEST_DISABLED === 'true') return;
  setInterval(async () => {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    if (now.getUTCHours() !== DIGEST_UTC_HOUR || lastSentDay === day) return;
    lastSentDay = day; // set BEFORE sending so a slow mail can't double-fire
    try {
      await sendOwnerDigest();
      console.log('[owner-digest] sent for', day);
    } catch (err: any) {
      console.warn('[owner-digest] failed:', err?.message);
    }
  }, 15 * 60 * 1000);
}
