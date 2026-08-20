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
 * SEND TO STUDIO (2026-08-20, Paul: "when i have the copy the way i want it and
 * have saved the decision — we need a Send to Studio button that tells cowork
 * to build it and put it in the Finder and ready for posting"). That button is
 * why this script now defaults to the SENT slots only. Before it, every row
 * carrying an edit came down the wire and a caption Paul was still working on
 * looked exactly like one he had finished. `--all` restores the old behaviour
 * and says how many it added.
 *
 * What it does — and does not:
 *   · GET /api/post-queue/drafts?sent=1, authed like push-crm (SMBX_TOKEN, or
 *     SMBX_EMAIL + SMBX_PASSWORD).
 *   · Writes one JSON per slot to studio/drafts/<campaign>/<queue_id>.json
 *     — the edit beside the plan's copy, the template id and its renderer
 *     hint, the spec path — and prints a report a session can act on.
 *   · Assembles the READY FOLDER: studio/ready/<date>-<queue_id>/ holding
 *     caption.txt (the exact text to paste) and WORK-ORDER.md (what to build,
 *     which template and with which flag, or which video). A video pick is
 *     linked in beside them, so the folder is the whole post in one place —
 *     open it in Finder, drag, paste, done. First run also drops a Desktop
 *     alias pointing at studio/ready.
 *   · DOES NOT edit a spec. A .deck.mts is code; rewriting it by regex from a
 *     cron would be how a caption gets a stray quote and the build fails at
 *     2am. The session opens the spec, applies the draft by hand (it is a
 *     caption and a template flag), renders into the ready folder, and updates
 *     the plan markdown so the next export carries the edit as the content of
 *     record.
 *   · DOES NOT render. There is no builder call in here; the session runs the
 *     builder the work order names.
 *
 * Plain node on built-ins — no npm install, no tsx (which has broken three
 * times today under a shared clone). Run from the clone root:
 *
 *   SMBX_TOKEN=… node scripts/studio/pull-queue.mjs               # what was SENT
 *   SMBX_TOKEN=… node scripts/studio/pull-queue.mjs --all         # every decision
 *   SMBX_TOKEN=… node scripts/studio/pull-queue.mjs D-02 D-05     # just these
 *   … --print                     print the full drafts to stdout as well
 *   … --videos                    list the video folder, so you know what to name
 *   … --built D-02 <path>         tell the app it is filed (closes the request)
 *
 * THE VIDEO FOLDER lives outside the repo (video never goes in any repo) and
 * the app cannot see it — it is on this Mac and the app is on Railway. Point
 * this script at it with SMBX_VIDEO_DIR, or write the path into a
 * `.smbx-video-dir` file at the clone root (the same shape as sync.mjs's
 * `.smbx-repo`). A pick this script cannot resolve is REPORTED, never filed as
 * a work order naming a video nobody can produce.
 *
 * Exit 0 with drafts written · 0 with "nothing sent" (a quiet day is a correct
 * day) · 1 when a slot was pulled but its video could not be found (the work
 * order is still written, and the failure is loud) · 2 on auth/network
 * failure, so a scheduled run cannot report success while pulling nothing.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, statSync, linkSync, copyFileSync, symlinkSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = (process.env.SMBX_APP_URL || 'https://smbx.ai').replace(/\/$/, '');
const args = process.argv.slice(2);
const PRINT = args.includes('--print');
const ALL = args.includes('--all');
const LIST_VIDEOS = args.includes('--videos');
const BUILT_AT = args.indexOf('--built');
const positional = args.filter(a => !a.startsWith('--'));
// `--built D-02 <path>` consumes its two arguments; everything else positional
// is a slot filter.
const BUILT = BUILT_AT >= 0 ? { id: args[BUILT_AT + 1], where: args[BUILT_AT + 2] } : null;
const ONLY = new Set(BUILT ? [] : positional);

/** The video folder: env, else `.smbx-video-dir` at the clone root, else none. */
function videoDir() {
  const fromEnv = process.env.SMBX_VIDEO_DIR;
  if (fromEnv) return fromEnv.replace(/^~(?=\/)/, os.homedir());
  const f = path.join(ROOT, '.smbx-video-dir');
  if (existsSync(f)) {
    const v = readFileSync(f, 'utf8').split('\n').map(l => l.trim()).find(l => l && !l.startsWith('#'));
    if (v) return v.replace(/^~(?=\/)/, os.homedir());
  }
  return null;
}
const VIDEO_EXT = /\.(mov|mp4|m4v|avi|webm)$/i;

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

/* ── --videos: what is in the folder, so a pick can be named correctly ──── */
if (LIST_VIDEOS) {
  const dir = videoDir();
  if (!dir) {
    console.error(`pull-queue: no video folder configured.
  export SMBX_VIDEO_DIR="/path/to/your/videos"
  …or write that path into ${path.relative(ROOT, path.join(ROOT, '.smbx-video-dir'))} (git-ignored).`);
    process.exit(2);
  }
  if (!existsSync(dir)) { console.error(`pull-queue: video folder does not exist — ${dir}`); process.exit(2); }
  const found = [];
  const walk = (d, depth = 0) => {
    for (const name of readdirSync(d)) {
      if (name.startsWith('.')) continue;
      const full = path.join(d, name);
      let st; try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) { if (depth < 2) walk(full, depth + 1); }
      else if (VIDEO_EXT.test(name)) found.push({ rel: path.relative(dir, full), mb: st.size / 1e6 });
    }
  };
  walk(dir);
  if (!found.length) { console.log(`pull-queue: no video files under ${dir}`); process.exit(0); }
  console.log(`pull-queue: ${found.length} video${found.length === 1 ? '' : 's'} under ${dir}\n`);
  for (const f of found.sort((a, b) => a.rel.localeCompare(b.rel))) {
    console.log(`  ${f.rel.padEnd(56)} ${f.mb.toFixed(1)} MB`);
  }
  console.log(`\nPaste one of those names into the slot's "Video file" field in Campaigns.`);
  process.exit(0);
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

/* ── the ready folder — the whole post in one place, for Finder ──────────── */

const READY = path.join(ROOT, 'studio', 'ready');
const VIDEO_DIR = videoDir();
let videoTrouble = 0;

/**
 * Resolve a video pick to a file on THIS Mac. The app stored what Paul typed
 * — a bare filename, a relative path inside the video folder, or an absolute
 * path — because the app cannot see his disk and has no id to offer.
 * A pick that does not resolve is reported and the work order says so; it is
 * never quietly dropped, because a video slot with no video is a post that
 * cannot go out and the person needs to hear about it now.
 */
function resolveVideo(pick) {
  const want = String(pick).replace(/^~(?=\/)/, os.homedir());
  const tries = [];
  if (path.isAbsolute(want)) tries.push(want);
  else {
    if (VIDEO_DIR) tries.push(path.join(VIDEO_DIR, want));
    tries.push(path.join(ROOT, want));
  }
  for (const t of tries) if (existsSync(t) && statSync(t).isFile()) return { file: t };
  // A bare NAME may sit in a subfolder — look for it rather than failing on a
  // path the person was never asked to know.
  if (!path.isAbsolute(want) && VIDEO_DIR && existsSync(VIDEO_DIR) && !want.includes('/')) {
    const stack = [VIDEO_DIR];
    for (let guard = 0; stack.length && guard < 400; guard++) {
      const d = stack.pop();
      let names; try { names = readdirSync(d); } catch { continue; }
      for (const n of names) {
        if (n.startsWith('.')) continue;
        const full = path.join(d, n);
        let st; try { st = statSync(full); } catch { continue; }
        if (st.isDirectory()) stack.push(full);
        else if (n === want) return { file: full };
      }
    }
  }
  return { error: VIDEO_DIR ? `not found under ${VIDEO_DIR} (or as a path from the clone)` : 'no video folder configured — set SMBX_VIDEO_DIR or write the path into .smbx-video-dir' };
}

/** Put the video in the folder WITHOUT a second copy of a large file where we
 *  can: a hard link is instant and costs no disk, and Finder shows it as an
 *  ordinary file that drags into LinkedIn. Across filesystems it has to be a
 *  real copy; a symlink is the last resort because some upload dialogs will
 *  not follow one. */
function placeVideo(src, dest) {
  if (existsSync(dest)) rmSync(dest, { force: true });
  try { linkSync(src, dest); return 'linked'; } catch { /* different volume */ }
  try { copyFileSync(src, dest); return 'copied'; } catch { /* permissions, space */ }
  try { symlinkSync(src, dest); return 'symlinked'; } catch { return null; }
}

/** `2026-08-22-D-02` — the date first so the folder list IS the calendar. */
function readyName(d) {
  const day = String(d.scheduled_for ?? '').slice(0, 10) || 'undated';
  return `${day}-${safe(d.queue_id)}`;
}

function workOrder(d, video) {
  const t = d.template && typeof d.template === 'object' ? d.template : null;
  const L = [];
  L.push(`# ${d.queue_id} · ${d.title ?? ''}`.trim());
  L.push('');
  L.push(`**${d.scheduled_for ? String(d.scheduled_for).slice(0, 10) : 'undated'}** · ${d.kind ?? 'text'} · campaign ${d.campaign ?? 'standing'}`);
  L.push('');
  L.push('## What to make');
  L.push('');
  if (d.asks === 'video' || video) {
    if (video?.file) {
      L.push(`**A video post.** The take is \`${path.basename(video.file)}\`, placed in this folder (${video.how}) from \`${video.file}\`.`);
      L.push('');
      L.push('Nothing renders a piece to camera — there is no builder to run. Confirm the take is the right one, then post.');
    } else {
      L.push(`⛔ **A video post, and the pick did not resolve.** \`${d.video_file}\` — ${video?.error ?? 'not found'}.`);
      L.push('');
      L.push('**Nothing was placed in this folder, so there is nothing to post yet.** Either fix the pick in Campaigns, or point the script at the right folder (`SMBX_VIDEO_DIR`, or a path in `.smbx-video-dir`), then pull again. Do not substitute another take — which one goes out is Paul\'s call.');
      // A template pick that a video overrode is worth naming here, because it
      // is the fallback if the video turns out not to exist at all.
      if (t) {
        L.push('');
        L.push(`This slot also carries a template pick, \`${t.id}\` (${t.renderer} · \`${t.hint}\`), which the video overrode. If the video is not coming, that is what to render — but ask first.`);
      }
    }
  } else if (t) {
    L.push(`**Template:** \`${t.id}\` — ${t.label ?? ''}`);
    L.push('');
    L.push(`Run **\`${t.renderer}\`** with: \`${t.hint}\``);
    if (t.status === 'pending') {
      L.push('');
      L.push('> ⛔ **This template is PENDING — no builder renders it today.** The pick is recorded because it is Paul\'s decision. Do NOT hand-roll it from the reference HTML (studio/CLAUDE.md: never hand-roll a layout). Either render the nearest live template and say so, or leave the slot and tell him.');
    }
    L.push('');
    L.push(d.spec ? `Spec: \`${d.spec}\`` : 'No spec on the row — write a new one; do not regex an existing spec.');
    if (d.filed_at) L.push(`The plan files the render at \`${d.filed_at}\`. **Copy the finished artifact into THIS folder too** — this is the one Paul opens.`);
  } else {
    L.push('**Nothing to render.** This is a plain text post — `caption.txt` beside this file is the whole thing.');
  }
  L.push('');
  L.push('## The copy');
  L.push('');
  const useIt = d.asks === 'video' ? 'post from it' : 'render from it';
  L.push(`It is in \`caption.txt\`, exactly as it should be pasted. ${d.copy?.state === 'live' ? `It is Paul's edit, not the plan's text — ${useIt}.` : d.copy?.state === 'superseded' ? '⚠ The stored edit is SUPERSEDED (the plan moved on since he made it); caption.txt carries the edit he last saved — check it against the plan before posting.' : "It is the plan's text."}`);
  if (d.gate) { L.push(''); L.push(`> ⛔ **Gate on this slot:** ${d.gate}`); }
  if (d.law_check) { L.push(''); L.push(`**Law check (from the plan):** ${d.law_check}`); }
  L.push('');
  L.push('## When it is done');
  L.push('');
  L.push('Leave the finished artifact in this folder beside `caption.txt`, then close the request so the app stops showing it as waiting:');
  L.push('');
  L.push('```bash');
  L.push(`node scripts/studio/pull-queue.mjs --built ${d.queue_id} studio/ready/${readyName(d)}`);
  L.push('```');
  L.push('');
  L.push('Then update the plan markdown to match the copy that actually went out, re-run `campaign-export.mjs` and re-import, so the app shows plan == edit.');
  L.push('');
  return L.join('\n');
}

/** A Finder alias for the ready folder, once. A symlink is what Finder shows
 *  as an alias and what `open` follows; it is created only if nothing of that
 *  name is there, so it can never clobber a real folder on the Desktop. */
function desktopAlias() {
  const link = path.join(os.homedir(), 'Desktop', 'smbX ready to post');
  try {
    if (existsSync(link)) return null;
    symlinkSync(READY, link);
    return link;
  } catch { return null; }
}

const lines = [];
const readyDirs = [];
for (const d of chosen) {
  const dir = path.join(OUT, safe(d.campaign ?? 'standing'));
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${safe(d.queue_id)}.json`);
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n');

  /* THE READY FOLDER — the whole post in one place, for Finder. The caption is
     the resolved one (the server chose between the edit and the plan, so this
     script never has to), and it is written even for a slot whose render still
     has to happen: the folder is where the session leaves the artifact. */
  const readyDir = path.join(READY, readyName(d));
  mkdirSync(readyDir, { recursive: true });
  writeFileSync(path.join(readyDir, 'caption.txt'), (d.caption ?? '') + '\n');

  let video = null;
  if (d.video_file) {
    const found = resolveVideo(d.video_file);
    if (found.file) {
      const how = placeVideo(found.file, path.join(readyDir, path.basename(found.file)));
      video = how ? { file: found.file, how } : { error: 'could not be linked or copied into the folder (permissions or disk space)' };
      if (!how) videoTrouble++;
    } else {
      video = found;
      videoTrouble++;
    }
  }
  writeFileSync(path.join(readyDir, 'WORK-ORDER.md'), workOrder(d, video));
  readyDirs.push(path.relative(ROOT, readyDir));

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
  if (video) what.push(video.file ? `video ${video.how} → ${path.basename(video.file)}` : `VIDEO NOT FOUND: ${d.video_file} — ${video.error}`);
  if (d.send === 'stale') what.push('SENT, THEN EDITED — the app has a newer decision than this request; send it again');
  lines.push(`  ${d.queue_id.padEnd(6)} ${(d.title ?? d.queue_id).slice(0, 44).padEnd(46)} ${d.kind ?? '-'}  ${what.join(' · ') || '(draft fields present but equal to plan)'}`);
  lines.push(`         ${d.spec ? `spec ${d.spec}` : 'no spec on the row — write a new one where the plan says; never regex an existing spec'}  →  ${path.relative(ROOT, file)}`);
  lines.push(`         ready  studio/ready/${readyName(d)}/`);
  if (PRINT) {
    if (d.copy?.state === 'live') lines.push('', '         ── caption (the edit, render from this) ──', ...d.copy.edit.split('\n').map(l => '         ' + l));
    if (d.pages?.state === 'live') for (const pg of d.pages.edit) lines.push('', `         ── page ${pg.n}${pg.label ? ' · ' + pg.label : ''} ──`, ...pg.text.split('\n').map(l => '         ' + l));
    lines.push('');
  }
}

console.log(`pull-queue: ${chosen.length} slot${chosen.length === 1 ? '' : 's'} ${ALL ? 'carrying a decision' : 'sent to the studio'} (${APP})`);
console.log(lines.join('\n'));

const alias = desktopAlias();
if (alias) console.log(`\n  Finder alias created: ${alias}  →  studio/ready/`);

console.log(`
Next, in the studio (by hand — nothing here edits a spec or runs a builder):
  1. open studio/ready/<folder>/WORK-ORDER.md — it names the template and the exact flag, or the video;
  2. render (figure-deck.py --ground … | build-onepager.mts | build-deck.mts | offer-docs.py) from the LIVE caption, never a SUPERSEDED one, and leave the artifact IN the ready folder (file it under the plan's filed_at as well, when it has one);
  3. close the request:  node scripts/studio/pull-queue.mjs --built <slot> studio/ready/<folder>
  4. update the plan markdown to match, then campaign-export → /import so the app shows plan == edit and the "edited" flag clears.`);

if (videoTrouble) {
  console.error(`\npull-queue: ${videoTrouble} video pick${videoTrouble === 1 ? '' : 's'} could not be placed — see the report above and the WORK-ORDER.md in each folder.`);
  process.exit(1);
}
