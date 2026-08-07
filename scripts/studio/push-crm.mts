/**
 * push-crm.mts — THE COWORK → APP BRIDGE, client side (2026-08-07, Paul:
 * "I'd like to be able to do all of this in Cowork and just have that
 * updated list put into the app… where we're not having to drop data back
 * and forth… but I don't want to burn up API").
 *
 * The loop this closes:
 *   1. A Cowork session (on the SUBSCRIPTION — never the app's metered key)
 *      does the smart half: reads whatever messy sheet or research exists,
 *      maps it into the seven-table bundle (01_contacts.csv …), writes the
 *      CSVs into a folder.
 *   2. This CLI does the dumb half: one command POSTs the folder to
 *      /api/crm/import-bundle, where the app's pure loader (zero model
 *      calls) upserts every row idempotently and returns the honest report.
 *
 * No GitHub round-trip, no hand-formatting (the session already formatted),
 * no server-side model spend. Google Sheets fits the same loop: export the
 * tabs as CSV into the folder (or let the session download them), push.
 *
 * Usage:
 *   SMBX_TOKEN=… npx tsx scripts/studio/push-crm.mts <dir>
 *
 *   SMBX_TOKEN       the Cowork access token — get it in the app under
 *                    Settings → Connections → "Show my token". This is the
 *                    normal path: Paul signs in with GOOGLE and has no
 *                    password, so there is nothing for a script to log in
 *                    with (2026-08-07). Valid a year, revocable there.
 *   <dir>            folder of CSVs (default: ./crm-bundle, then content/crm-seed)
 *   SMBX_APP_URL     app base (default https://smbx.ai)
 *   SMBX_EMAIL/_PASSWORD  fallback for password identities
 *
 * File names are matched by number prefix or meaning (01_/contacts,
 * 02_/organizations, waves, steps/sequence, templates, events,
 * research/queue). Unrecognized files are REPORTED, never silently dropped.
 * Only contacts/organizations are required; a partial bundle (say, just an
 * updated contacts sheet) is a legitimate push — the loader upserts.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const APP = (process.env.SMBX_APP_URL || 'https://smbx.ai').replace(/\/$/, '');

async function token(): Promise<string> {
  if (process.env.SMBX_TOKEN) return process.env.SMBX_TOKEN;
  const email = process.env.SMBX_EMAIL, password = process.env.SMBX_PASSWORD;
  if (!email || !password) {
    console.error('No credentials.\n');
    console.error('Get a token: open the app → Settings → Connections → "Show my token", then:');
    console.error('  export SMBX_TOKEN="…"\n');
    console.error('(SMBX_EMAIL + SMBX_PASSWORD also work for password identities.)');
    process.exit(1);
  }
  const r = await fetch(`${APP}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    console.error(`Login failed (${r.status}): ${await r.text()}`);
    process.exit(1);
  }
  return (await r.json()).token;
}

const argDir = process.argv[2];
const dir = [argDir, './crm-bundle', './content/crm-seed']
  .filter(Boolean)
  .map(d => path.resolve(d as string))
  .find(d => existsSync(d));
if (!dir) {
  console.error('No bundle folder found — pass a directory of CSVs.');
  process.exit(1);
}

const files: Record<string, string> = {};
for (const f of readdirSync(dir)) {
  if (f.toLowerCase().endsWith('.csv')) files[f] = readFileSync(path.join(dir, f), 'utf8');
}
if (!Object.keys(files).length) {
  console.error(`${dir} contains no .csv files.`);
  process.exit(1);
}
console.log(`Pushing ${Object.keys(files).length} files from ${dir} → ${APP}`);

const t = await token();
const res = await fetch(`${APP}/api/crm/import-bundle`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
  body: JSON.stringify({ files }),
});
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`Import failed (${res.status}): ${body.error ?? 'unknown error'}`);
  process.exit(1);
}
console.log('\nTHE REPORT');
console.log(`  firms:      ${body.accountsCreated} new · ${body.accountsUpdated} refreshed`);
console.log(`  contacts:   ${body.contactsAdded} added · ${body.unnamedParked} still need a named person`);
console.log(`  campaign:   ${body.wavesLoaded} waves · ${body.stepsLoaded} steps · ${body.templatesLoaded} templates · ${body.eventsLoaded} events`);
console.log(`  queue:      ${body.touchesQueued} touches queued · ${body.touchesExcluded} excluded (do-not-pitch/unsubscribed)`);
if (body.targetsUnmatched?.length) {
  console.log(`  unmatched targets (research these, nothing was dropped):`);
  for (const u of body.targetsUnmatched) console.log(`    - ${u}`);
}
if (body.ignoredFiles?.length) console.log(`  ignored files: ${body.ignoredFiles.join(', ')}`);
console.log('\nDone — the board and the Outreach queue are updated.');
