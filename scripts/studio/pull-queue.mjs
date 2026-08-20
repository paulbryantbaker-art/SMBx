#!/usr/bin/env node
/**
 * pull-queue — the decisions Paul made in the app, brought to the studio
 * BEFORE a render. The reverse of campaign-export → import.
 *
 * Paul, 2026-08-19: "i want to be able to choose the template and edit the
 * copy before anything is finally rendered in Cowork." The app is where the
 * decision is made (a template pick, an edited caption, edited page copy —
 * state on the row, migration 138, which the importer never overwrites). The
 * studio is where the render happens (the spec on disk → build-deck /
 * figure-deck / build-onepager / offer-docs). This script is the hand-off
 * between them, and it is the ONLY way a decision in the app reaches a file
 * on disk: the app itself calls no builder and writes nothing to the clone.
 *
 * SEND TO STUDIO (2026-08-20, Paul: "we need a Send to Studio button that tells
 * cowork to build it… we just need to pass back what I want it to build and
 * template type"). That button is why this script defaults to the SENT slots
 * only. Before it, every row carrying an edit came down the wire and a caption
 * Paul was still working on looked exactly like one he had finished. `--all`
 * restores the old behaviour.
 *
 * IT PASSES BACK THE DECISION AND NOTHING ELSE. An earlier cut of this also
 * assembled a ready-to-post folder; Paul: "Cowork already knows where to put
 * created collateral just let it do its thing." It does — studio/CLAUDE.md §4
 * and the plan's own `filed_at` have said where since July, and a second
 * destination is a second thing to keep in step.
 *
 * A VIDEO SLOT NEVER APPEARS HERE. There is nothing to build: Paul films it and
 * already has the file, so the app refuses to send one (shared/studioSend.ts).
 *
 * What it does — and does not:
 *   · GET /api/post-queue/drafts?sent=1, authed like push-crm (SMBX_TOKEN, or
 *     SMBX_EMAIL + SMBX_PASSWORD).
 *   · Writes one JSON per slot to studio/drafts/<campaign>/<queue_id>.json
 *     — the caption to render from, the template id with its renderer and the
 *     exact flag, the spec path, the gate and the law check — and prints a
 *     report a session can act on.
 *   · DOES NOT edit a spec. A .deck.mts is code; rewriting it by regex from a
 *     cron would be how a caption gets a stray quote and the build fails at
 *     2am. The session opens the spec, applies the draft by hand (it is a
 *     caption and a template flag), renders, files it where it always files,
 *     and updates the plan markdown so the next export carries the edit as the
 *     content of record.
 *   · DOES NOT render. There is no builder call in here.
 *
 * Plain node on built-ins — no npm install, no tsx (which has broken three
 * times today under a shared clone). Run from the clone root:
 *
 *   SMBX_TOKEN=… node scripts/studio/pull-queue.mjs               # what was SENT
 *   SMBX_TOKEN=… node scripts/studio/pull-queue.mjs --all         # every decision
 *   SMBX_TOKEN=… node scripts/studio/pull-queue.mjs D-02 D-05     # just these
 *   … --print                     print the full drafts to stdout as well
 *   … --built D-02 <path>         tell the app where it landed (closes the request)
 *
 * Exit 0 with drafts written · 0 with "nothing sent" (a quiet day is a correct
 * day) · 2 on auth/network failure, so a scheduled run cannot report success
 * while pulling nothing.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = (process.env.SMBX_APP_URL || 'https://smbx.ai').replace(/\/$/, '');
const args = process.argv.slice(2);
const PRINT = args.includes('--print');
const ALL = args.includes('--all');
const BUILT_AT = args.indexOf('--built');
const positional = args.filter(a => !a.startsWith('--'));
// `--built D-02 <path>` consumes its two arguments; everything else positional
// is a slot filter.
const BUILT = BUILT_AT >= 0 ? { id: args[BUILT_AT + 1], where: args[BUILT_AT + 2] } : null;
const ONLY = new Set(BUILT ? [] : positional);


async function token() {
  if (process.env.SMBX_TOKEN) return process.env.SMBX_TOKEN;
  const email = process.env.SMBX_EMAIL, password = process.env.SMBX_PASSWORD;
  if (!email || !password) {
    console.error('pull-queue: no credentials.\n  export SMBX_TOKEN="…"   (or SMBX_EMAIL + SMBX_PASSWORD)');
    process.exit(2);
  }
  const r = await fetch(`${APP}/api/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) { console.error(`pull-queue: login failed (${r.status})`); process.exit(2); }
  const j = await r.json();
  if (!j?.token) { console.error('pull-queue: login returned no token'); process.exit(2); }
  return j.token;
}

const t = await token();

/* ── --built: close the request the app is holding open ─────────────────── */
if (BUILT) {
  if (!BUILT.id || !BUILT.where) {
    console.error('pull-queue: --built needs a slot and a path — e.g. --built D-02 studio/ready/2026-08-22-D-02');
    process.exit(2);
  }
  let r;
  try {
    r = await fetch(`${APP}/api/post-queue/${encodeURIComponent(BUILT.id)}/built`, {
      method: 'POST',
      headers: { authorization: `Bearer ${t}`, 'content-type': 'application/json' },
      body: JSON.stringify({ path: BUILT.where }),
    });
  } catch (e) { console.error(`pull-queue: ${APP} unreachable — ${e?.message ?? e}`); process.exit(2); }
  if (!r.ok) {
    console.error(`pull-queue: --built ${BUILT.id} → ${r.status} ${(await r.text().catch(() => '')).slice(0, 300)}`);
    process.exit(2);
  }
  console.log(`pull-queue: ${BUILT.id} marked built at ${BUILT.where}. The app now shows it ready to post.`);
  process.exit(0);
}

let res;
try {
  res = await fetch(`${APP}/api/post-queue/drafts${ALL ? '' : '?sent=1'}`, { headers: { authorization: `Bearer ${t}` } });
} catch (e) {
  console.error(`pull-queue: ${APP} unreachable — ${e?.message ?? e}`);
  process.exit(2);
}
if (!res.ok) {
  console.error(`pull-queue: GET /api/post-queue/drafts → ${res.status} ${await res.text().catch(() => '')}`);
  process.exit(2);
}
// A 200 that is not JSON (an older deploy answering the SPA shell, a proxy
// page) must be a loud exit 2, not a SyntaxError stack and exit 1.
let payload;
try { payload = await res.json(); } catch {
  console.error(`pull-queue: ${APP}/api/post-queue/drafts answered 200 but not JSON — is the deploy older than migration 138?`);
  process.exit(2);
}
const drafts = Array.isArray(payload?.drafts) ? payload.drafts : [];
const chosen = ONLY.size ? drafts.filter(d => ONLY.has(d.queue_id)) : drafts;

if (!chosen.length) {
  console.log(ONLY.size
    ? `pull-queue: none of ${[...ONLY].join(', ')} ${ALL ? 'carries a draft' : 'has been sent to the studio'}.`
    : ALL
      ? 'pull-queue: no drafts — nothing in the app carries a decision.'
      : 'pull-queue: nothing sent — press Send to Studio on a slot in Campaigns, then run this again.  (--all to see every decision, sent or not.)');
  process.exit(0);
}

/* The server sends the template WITH its renderer and flag (listQueueDrafts
   resolves the id through shared/templates.ts), so this script needs no
   TypeScript loader. queue_id is used as a filename: sanitised, because a
   hand-edited post-queue.json could carry a slash and write outside drafts/. */
const safe = (id) => String(id).replace(/[^A-Za-z0-9._-]/g, '_') || 'slot';
const OUT = path.join(ROOT, 'studio', 'drafts');
mkdirSync(OUT, { recursive: true });

const lines = [];
for (const d of chosen) {
  const dir = path.join(OUT, safe(d.campaign ?? 'standing'));
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${safe(d.queue_id)}.json`);
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n');

  const what = [];
  if (d.template) {
    const t = typeof d.template === 'string' ? { id: d.template, bare: true } : d.template;   // an older deploy sends the bare id
    what.push(t.unknown
      ? `template → ${t.id} (UNKNOWN id — not in shared/templates.ts)`
      : t.bare
        ? `template → ${t.id} (this deploy sent no renderer hint — look the id up in shared/templates.ts)`
        : `template → ${t.id} [${t.renderer} · ${t.hint}]${t.status === 'pending' ? ' — NOT BUILT YET: record the pick, do not hand-roll' : ''}`);
  }
  // States from shared/draft.ts: live = render from it · satisfied = plan
  // caught up · superseded = the plan moved past the edit — history, NOT a
  // decision; the app shows it greyed and asks Paul to re-save if he wants it.
  const pageText = (pg) => [pg.n, (pg.label ?? '').trim(), (pg.text ?? '').trim(), (pg.note ?? '').trim()].join('\u0001');
  if (d.copy) {
    if (d.copy.state === 'live') what.push(`caption edited (${d.copy.edit.length} chars vs plan ${d.copy.plan?.length ?? 0})`);
    else if (d.copy.state === 'satisfied') what.push('caption: plan matches the edit (satisfied)');
    else what.push('caption: plan moved on since the edit — SUPERSEDED, render from the plan');
  }
  if (d.pages) {
    if (d.pages.state === 'live') {
      const planSet = new Map((d.pages.plan || []).map(pg => [pg.n, pageText(pg)]));
      const changed = (d.pages.edit || []).filter(pg => planSet.get(pg.n) !== pageText(pg));
      what.push(`page copy edited (${changed.length} of ${d.pages.edit.length} pages)`);
    } else if (d.pages.state === 'satisfied') what.push('pages: plan matches the edit (satisfied)');
    else what.push('pages: plan moved on since the edit — SUPERSEDED, render from the plan');
  }
  if (d.send === 'stale') what.push('SENT, THEN EDITED — the app has a newer decision than this request; send it again');
  lines.push(`  ${d.queue_id.padEnd(6)} ${(d.title ?? d.queue_id).slice(0, 44).padEnd(46)} ${d.kind ?? '-'}  ${what.join(' · ') || '(draft fields present but equal to plan)'}`);
  lines.push(`         ${d.spec ? `spec ${d.spec}` : 'no spec on the row — write a new one where the plan says; never regex an existing spec'}  →  ${path.relative(ROOT, file)}`);
  if (PRINT) {
    if (d.copy?.state === 'live') lines.push('', '         ── caption (the edit, render from this) ──', ...d.copy.edit.split('\n').map(l => '         ' + l));
    if (d.pages?.state === 'live') for (const pg of d.pages.edit) lines.push('', `         ── page ${pg.n}${pg.label ? ' · ' + pg.label : ''} ──`, ...pg.text.split('\n').map(l => '         ' + l));
    lines.push('');
  }
}

console.log(`pull-queue: ${chosen.length} slot${chosen.length === 1 ? '' : 's'} ${ALL ? 'carrying a decision' : 'sent to the studio'} (${APP})`);
console.log(lines.join('\n'));
console.log(`
Next, in the studio (by hand — nothing here edits a spec or runs a builder):
  1. open the spec named above; set the template per the [renderer · hint] printed beside the pick, and paste the LIVE caption / page copy (never a SUPERSEDED one);
  2. render (figure-deck.py --ground … | build-onepager.mts | build-deck.mts | offer-docs.py) and file it where you always file it — the plan's filed_at, markets/<m>/collateral/<slug>/<date>/;
  3. close the request:  node scripts/studio/pull-queue.mjs --built <slot> <where you filed it>
  4. update the plan markdown to match, then campaign-export → /import so the app shows plan == edit and the "edited" flag clears.`);
