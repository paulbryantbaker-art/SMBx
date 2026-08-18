#!/usr/bin/env node
/**
 * SYNC — keep this Mac's ONE clone current, without ever losing anyone's work.
 *
 * Paul, 2026-08-10: "the only thing that I want to be sure that happens is that
 * the Docs.MTS and the collateral all get updated on the Mac on disk. Where the
 * work is processed I don't care."
 *
 * GIT IS A TRANSPORT, NOT A DESTINATION. Merging a PR on a phone puts nothing on
 * this machine until something pulls; until then every builder here renders
 * from a stale master, silently. This closes that loop.
 *
 * ONE CLONE (Paul, 2026-08-18: "i want everything in one place for you 2 to
 * work from"). The first version of this script pulled TWO repositories — the
 * workspace and, separately, the engine — and spent half its length finding the
 * engine and refusing to guess between stale clones (it once found the real one
 * invisible at two levels down and two frozen ones one level down). That whole
 * problem is gone: this file lives at `studio/sync.mjs` INSIDE the engine repo,
 * so the clone to pull is `..`, the laws are read in place (no refresh step —
 * `init-workspace.mts` is retired), and the engine and the workspace cannot be
 * at different commits.
 *
 * Plain node on built-ins — no npm install, no tsx, no network beyond git — so
 * a session or a launchd job can run it immediately.
 *
 *     node studio/sync.mjs            pull the clone (fast-forward only), report
 *     node studio/sync.mjs --check    report only; change nothing (exit 1 if behind)
 *     node studio/sync.mjs --install  print the launchd job that runs this hourly
 *
 * NEVER DESTRUCTIVE, and aware that two agents work here:
 *   · on `main` and clean        → `git pull --ff-only`. Fast-forward or refuse.
 *   · on `main` with local edits → BLOCKED (exit 2). Nothing is pulled over an
 *                                  uncommitted change; the one thing worse than
 *                                  a stale master is a lost one.
 *   · on any other branch        → fetch only, and REPORT how far `main` is
 *                                  behind. Somebody is mid-work on that branch;
 *                                  a cron must not move their checkout. Exit 0.
 * Exit 2 is deliberate for BLOCKED: exiting 0 would let a launchd job report
 * success forever while the disk silently never updated.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const CLONE = path.resolve(HERE, '..');
const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');

function git(args) {
  try {
    return { ok: true, out: execFileSync('git', args, { cwd: CLONE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (err) {
    return { ok: false, out: String(err?.stderr || err?.stdout || err?.message || err).trim() };
  }
}

/* ── launchd ───────────────────────────────────────────────────────────── */

if (ARGS.includes('--install')) {
  const plist = path.join(os.homedir(), 'Library/LaunchAgents/ai.smbx.studio.sync.plist');
  console.log(`
Write this to ${plist}, then:
    launchctl load ${plist}

It runs every hour against the ONE clone at ${CLONE}. Merging a PR on your phone
therefore lands the files on this Mac within the hour. Logs to studio/sync.log.
It only ever fast-forwards \`main\`; if the clone is on a work branch it fetches
and reports, and if \`main\` has uncommitted edits it refuses and says so.

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>ai.smbx.studio.sync</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string>
    <string>node</string>
    <string>${path.join(HERE, 'sync.mjs')}</string>
  </array>
  <key>StartInterval</key><integer>3600</integer>
  <key>RunAtLoad</key><true/>
  <key>WorkingDirectory</key><string>${CLONE}</string>
  <key>StandardOutPath</key><string>${path.join(HERE, 'sync.log')}</string>
  <key>StandardErrorPath</key><string>${path.join(HERE, 'sync.log')}</string>
</dict>
</plist>
`);
  process.exit(0);
}

/* ── run ───────────────────────────────────────────────────────────────── */

console.log(`\n[${new Date().toISOString()}] one-clone sync${CHECK ? ' — check only' : ''}  ${CLONE}`);

if (!existsSync(path.join(CLONE, '.git')) || git(['rev-parse', '--is-inside-work-tree']).out !== 'true') {
  console.log('  BLOCKED  the parent of studio/ is not a git checkout — this file must live at <clone>/studio/sync.mjs');
  process.exit(2);
}

const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).out || '?';
const dirty = git(['status', '--porcelain']).out;
const fetched = git(['fetch', '--quiet', '--prune', 'origin']);
if (!fetched.ok) {
  console.log(`  offline  ${fetched.out.split('\n')[0]}`);
  process.exit(0);
}
const mainBehind = Number(git(['rev-list', '--count', 'main..origin/main']).out || '0');
const mainAhead = Number(git(['rev-list', '--count', 'origin/main..main']).out || '0');

if (branch !== 'main') {
  console.log(`  branch   ${branch} — someone is mid-work here, checkout left alone`);
  console.log(`  main     ${mainBehind ? `${mainBehind} commit(s) behind origin/main — \`git checkout main && git pull --ff-only\` when the branch is done` : 'current with origin/main'}${mainAhead ? `  (${mainAhead} unpushed on main)` : ''}`);
  process.exit(0);
}

if (!mainBehind) {
  console.log(`  main     current${mainAhead ? `  (${mainAhead} unpushed — main is deploy; open a PR instead of pushing)` : ''}${dirty ? `  (${dirty.split('\n').length} uncommitted change(s) here)` : ''}`);
  process.exit(0);
}

if (CHECK) {
  console.log(`  main     ${mainBehind} commit(s) waiting — run without --check to pull${dirty ? ' (will be BLOCKED: uncommitted changes)' : ''}`);
  process.exit(1);
}

if (dirty) {
  console.log(`  BLOCKED  ${mainBehind} commit(s) waiting and NOT pulled — ${dirty.split('\n').length} uncommitted change(s) on main.`);
  console.log('           Commit them on a branch (never on main) or stash them, then re-run.');
  process.exit(2);
}

const before = git(['rev-parse', 'HEAD']).out;
const pulled = git(['pull', '--ff-only', '--quiet', 'origin', 'main']);
if (!pulled.ok) {
  console.log('  BLOCKED  main diverges from origin/main — reconcile by hand (git log --oneline origin/main..main).');
  process.exit(2);
}
const after = git(['rev-parse', 'HEAD']).out;
const files = (git(['diff', '--name-only', before, after]).out || '').split('\n').filter(Boolean);
console.log(`  updated  +${mainBehind} commit${mainBehind === 1 ? '' : 's'}, ${files.length} file${files.length === 1 ? '' : 's'}`);
for (const f of files.slice(0, 20)) console.log(`      ${f}`);
if (files.length > 20) console.log(`      …and ${files.length - 20} more`);
console.log('');
process.exit(0);
