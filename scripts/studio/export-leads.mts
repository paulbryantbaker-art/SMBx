/**
 * The campaign list (2026-07-29).
 *
 * Paul: "save their email for a later campaign." The addresses are captured by
 * the report download and the site intake; this pulls out the ones that are
 * actually MAILABLE — consented, never opted out, deduplicated to one row per
 * person — as a CSV any sender will take.
 *
 * It refuses to export anyone who unsubscribed, and it will not silently
 * include leads captured before consent was recorded (they were told "no list,
 * no sequence"). `--all` shows everything with a mailable column instead, so
 * the difference is visible rather than hidden.
 *
 * Usage:
 *   npx tsx scripts/studio/export-leads.mts [--out <file.csv>] [--source report] [--all]
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { createSql } = await import(pathToFileURL(path.join(ROOT, 'server/dbConfig.ts')).href);

const args = process.argv.slice(2);
const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const all = args.includes('--all');
const sourceLike = flag('--source');
const outPath = path.resolve(flag('--out') || `leads-${new Date().toISOString().slice(0, 10)}.csv`);

const sql = createSql();
try {
  // One row per address: the earliest capture, the latest source, and the
  // consent state as it stands now.
  const rows = await sql`
    SELECT
      LOWER(email)                                   AS email,
      MIN(created_at)                                AS first_seen,
      MAX(created_at)                                AS last_seen,
      COUNT(*)                                       AS captures,
      (ARRAY_AGG(source ORDER BY created_at DESC))[1] AS latest_source,
      BOOL_OR(marketing_consent)                     AS consented,
      MAX(unsubscribed_at)                           AS unsubscribed_at,
      (ARRAY_AGG(consent_text ORDER BY created_at DESC))[1] AS consent_text
    FROM practice_leads
    WHERE email IS NOT NULL AND email <> ''
      ${sourceLike ? sql`AND source ILIKE ${'%' + sourceLike + '%'}` : sql``}
    GROUP BY LOWER(email)
    ORDER BY MIN(created_at) DESC
  `;

  const mailable = (r: any) => r.consented === true && r.unsubscribed_at === null;
  const chosen = all ? rows : rows.filter(mailable);

  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ['email', 'first_seen', 'last_seen', 'captures', 'latest_source', 'mailable', 'unsubscribed_at', 'consent_text'];
  const csv = [
    header.join(','),
    ...chosen.map((r: any) => [
      r.email,
      new Date(r.first_seen).toISOString(),
      new Date(r.last_seen).toISOString(),
      r.captures,
      r.latest_source,
      mailable(r),
      r.unsubscribed_at ? new Date(r.unsubscribed_at).toISOString() : '',
      r.consent_text,
    ].map(esc).join(',')),
  ].join('\n');

  writeFileSync(outPath, csv + '\n');

  const total = rows.length;
  const ok = rows.filter(mailable).length;
  const out = rows.filter((r: any) => r.unsubscribed_at !== null).length;
  const noConsent = total - ok - out;

  console.log(`✓ ${chosen.length} row${chosen.length === 1 ? '' : 's'} → ${outPath}`);
  console.log(`  ${ok} mailable · ${out} unsubscribed · ${noConsent} captured before consent was recorded (excluded)`);
  if (!all && noConsent > 0) {
    console.log('  Those pre-consent leads were told "no list, no sequence" — run with --all to see them,');
    console.log('  but do not mail them without asking first.');
  }
} finally {
  await sql.end();
}
