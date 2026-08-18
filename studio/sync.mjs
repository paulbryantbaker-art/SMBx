#!/usr/bin/env node
/**
 * SYNC — put the agent's work on this Mac's disk, and keep the tooling current.
 *
 * Paul, 2026-08-10: "the only thing that I want to be sure that happens is that
 * the Docs.MTS and the collateral all get updated on the Mac on disk. Where the
 * work is processed I don't care."
 *
 * That is the requirement the PR-review design did not meet on its own, and it
 * is worth stating plainly: GIT IS A TRANSPORT, NOT A DESTINATION. A weekly
 * sweep that opens a pull request puts nothing on this machine. Merge it and
 * still nothing is here — the masters, the documents and the collateral sit on
 * GitHub until something pulls them down, and in the meantime every builder on
 * this Mac renders from a stale master. Silently, and with no error.
 *
 * So this closes the loop. Run it (or let launchd run it) and the disk is the
 * disk again.
 *
 * TWO REPOSITORIES, because the work and the tools live apart:
 *   the WORKSPACE — this folder: masters, research, documents, collateral
 *   the ENGINE    — the SMBx repo: the .mts builders, the audit, the laws
 * Pulling only the first leaves you building this week's master with last
 * month's builder, which is the same class of drift in the other direction.
 *
 * Lives IN the workspace as plain node on built-ins — no npm install, no tsx,
 * no network beyond git itself — the same rule engagements.mjs follows, and for
 * the same reason: a session (or a cron) opened on this folder must be able to
 * run it immediately.
 *
 *     node sync.mjs              pull both, refresh the laws, report
 *     node sync.mjs --check      report only; change nothing (exit 1 if behind)
 *     node sync.mjs --install    print the launchd job that runs this hourly
 *
 * WHERE THE ENGINE IS: $SMBX_REPO, else a `.smbx-repo` file beside this script
 * holding the path, else the usual places. If it cannot be found, the workspace
 * still syncs and the engine is reported as unknown — a partial sync that says
 * so beats a total refusal.
 *
 * NEVER DESTRUCTIVE. Pulls are --ff-only, so a local edit is never silently
 * merged or overwritten; a divergence stops and tells you, because the one
 * thing worse than a stale master is a lost one.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const WS = path.dirname(new URL(import.meta.url).pathname);
const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');

/* ── git, quietly ──────────────────────────────────────────────────────── */

function git(cwd, args) {
  try {
    return { ok: true, out: execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (err) {
    return { ok: false, out: String(err?.stderr || err?.stdout || err?.message || err).trim() };
  }
}

const isRepo = dir => existsSync(path.join(dir, '.git')) && git(dir, ['rev-parse', '--is-inside-work-tree']).out === 'true';

/* ── find the engine ───────────────────────────────────────────────────── */

/** Is this the SMBx engine? Judged by CONTENT, never by folder name — which is
 *  exactly why a clone called `smbx-engine` resolves correctly. */
function isEngine(dir) {
  return !!dir && existsSync(path.join(dir, 'scripts/studio/build-report.mts'));
}

/** Immediate subdirectories, tolerating anything unreadable. */
function safeDirs(root) {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => path.join(root, e.name));
  } catch { return []; }
}

function findRepo() {
  const home = os.homedir();
  const pin = path.join(WS, '.smbx-repo');
  const expand = c => path.resolve(String(c).replace(/^~/, home));

  // An explicit answer wins and is never second-guessed.
  for (const c of [process.env.SMBX_REPO, existsSync(pin) ? readFileSync(pin, 'utf8').trim() : null]) {
    if (c && isEngine(expand(c))) return { dir: expand(c), all: [expand(c)], pinned: true };
  }

  // Otherwise look where clones actually land. GitHubRepos is on this list
  // because that is where Paul's are (2026-08-10, from a Finder screenshot);
  // the first version of this guessed ~/SMBx and ~/code/SMBx and would have
  // found nothing at all on his machine.
  const roots = [
    home,
    path.join(home, 'Documents'),
    path.join(home, 'Documents/GitHubRepos'),
    path.join(home, 'GitHubRepos'),
    path.join(home, 'code'),
    path.join(home, 'Developer'),
    path.join(home, 'Projects'),
    path.join(home, 'src'),
  ];
  const found = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    // The root, then TWO levels down. Not a deep walk — a sync script has no
    // business crawling a home directory — but one level was not enough and
    // failed in the worst available way (2026-08-14).
    //
    // Paul's engine is at GitHubRepos/SMBx-live/SMBx: the clone sits inside a
    // wrapper folder, so it is TWO below GitHubRepos. A one-level scan checked
    // GitHubRepos/SMBx-live for scripts/studio/build-report.mts, did not find
    // it, and moved on — so THE REAL ENGINE WAS INVISIBLE to discovery, while
    // the stale clones frozen on 2026-07-27 sit one level down and are found.
    //
    // How bad that got depended on how many stale clones were lying around,
    // which is a poor thing to depend on. With SMBx-main AND SMBx-main-old
    // present the scan found two, the guard fired, and it refused — safe by
    // luck. With only one of them present it found exactly one candidate, the
    // guard saw nothing to complain about, and sync would have pulled the
    // stale clone and refreshed the workspace's laws from it. Silent,
    // plausible and wrong: the precise failure this file exists to prevent,
    // arriving through the depth limit rather than through ambiguity.
    // Verified both ways against a replica of his layout.
    //
    // Going deeper makes the guard MORE likely to fire on his machine, not
    // less, and that is the intended outcome: three clones found, refuse,
    // print the pin instruction. Refusing loudly beats guessing quietly.
    const level1 = safeDirs(root);
    const level2 = level1.flatMap(safeDirs);
    for (const dir of [root, ...level1, ...level2]) {
      if (isEngine(dir) && !found.includes(dir)) found.push(dir);
    }
  }

  // MORE THAN ONE CLONE IS AMBIGUOUS AND MUST NOT BE GUESSED AT. Paul has
  // smbx-engine, SMBx-main and SMBx-main-old side by side. Picking the stale
  // one would render this week's collateral from last quarter's design system
  // and look like it worked, which is the failure mode this whole file exists
  // to prevent one level up.
  return { dir: found.length === 1 ? found[0] : null, all: found, pinned: false };
}

/* ── one repository ────────────────────────────────────────────────────── */

function sync(label, dir) {
  if (!dir) return { label, state: 'not found' };
  if (!isRepo(dir)) return { label, dir, state: 'not a git repo' };

  const branch = git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']).out || '?';
  const dirty = git(dir, ['status', '--porcelain']).out;
  const before = git(dir, ['rev-parse', 'HEAD']).out;

  const fetched = git(dir, ['fetch', '--quiet', '--all']);
  if (!fetched.ok) return { label, dir, branch, state: 'offline', detail: fetched.out.split('\n')[0] };

  const behind = Number(git(dir, ['rev-list', '--count', `HEAD..@{u}`]).out || '0');
  const ahead = Number(git(dir, ['rev-list', '--count', `@{u}..HEAD`]).out || '0');

  if (CHECK) return { label, dir, branch, state: behind ? 'behind' : 'current', behind, ahead, dirty: !!dirty };
  if (!behind) return { label, dir, branch, state: 'current', behind: 0, ahead, dirty: !!dirty };

  // --ff-only: refuse rather than merge. A workspace is someone's writing, and
  // an automatic merge of a master document is not a thing anyone wants to
  // debug on a Sunday.
  const pulled = git(dir, ['pull', '--ff-only', '--quiet']);
  if (!pulled.ok) {
    return {
      label, dir, branch, behind, ahead, dirty: !!dirty, state: 'BLOCKED',
      detail: dirty
        ? `${dirty.split('\n').length} uncommitted change(s) here — commit or stash them, then re-run.`
        : `local commits diverge from the remote — reconcile by hand (git log --oneline @{u}..HEAD).`,
    };
  }
  const after = git(dir, ['rev-parse', 'HEAD']).out;
  const files = git(dir, ['diff', '--name-only', before, after]).out;
  return {
    label, dir, branch, state: 'updated', behind, ahead, dirty: !!dirty,
    files: files ? files.split('\n').filter(Boolean) : [],
  };
}

/* ── launchd ───────────────────────────────────────────────────────────── */

if (ARGS.includes('--install')) {
  const plist = path.join(os.homedir(), 'Library/LaunchAgents/ai.smbx.studio.sync.plist');
  console.log(`
Write this to ${plist}, then:
    launchctl load ${plist}

It runs every hour. Merging a weekly PR on your phone therefore lands the files
on this Mac within the hour, with nothing to remember. Logs to sync.log here.

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>ai.smbx.studio.sync</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string>
    <string>node</string>
    <string>${path.join(WS, 'sync.mjs')}</string>
  </array>
  <key>StartInterval</key><integer>3600</integer>
  <key>RunAtLoad</key><true/>
  <key>WorkingDirectory</key><string>${WS}</string>
  <key>StandardOutPath</key><string>${path.join(WS, 'sync.log')}</string>
  <key>StandardErrorPath</key><string>${path.join(WS, 'sync.log')}</string>
</dict>
</plist>
`);
  process.exit(0);
}

/* ── run ───────────────────────────────────────────────────────────────── */

const engine = findRepo();
const repo = engine.dir;
const results = [sync('workspace', WS), sync('engine (SMBx repo)', repo)];

console.log(`\n[${new Date().toISOString()}] studio sync${CHECK ? ' — check only' : ''}`);
for (const r of results) {
  const head = `  ${r.label.padEnd(20)} ${r.state}`;
  if (r.state === 'updated') {
    console.log(`${head}  (+${r.behind} commit${r.behind === 1 ? '' : 's'}, ${r.files.length} file${r.files.length === 1 ? '' : 's'})`);
    for (const f of r.files.slice(0, 15)) console.log(`      ${f}`);
    if (r.files.length > 15) console.log(`      …and ${r.files.length - 15} more`);
  } else if (r.state === 'BLOCKED') {
    console.log(`${head}  ${r.behind} commit(s) waiting and NOT pulled`);
    console.log(`      ${r.detail}`);
  } else if (r.state === 'behind') {
    console.log(`${head}  ${r.behind} commit(s) waiting — run without --check to pull`);
  } else if (r.state === 'not found' && engine.all.length > 1) {
    console.log(`  ${r.label.padEnd(20)} AMBIGUOUS — ${engine.all.length} clones found. Guessing between them could`);
    console.log(`      build from a stale one, so nothing was pulled. Pin the right one:`);
    console.log(`        echo "<path>" > ${path.join(WS, '.smbx-repo')}`);
    for (const d of engine.all) console.log(`      · ${d}`);
  } else if (r.state === 'not found') {
    console.log(`${head}  — set SMBX_REPO, or put its path in .smbx-repo beside this script`);
  } else {
    console.log(`${head}${r.detail ? `  ${r.detail}` : ''}${r.ahead ? `  (${r.ahead} unpushed)` : ''}`);
  }
}

/* Refresh the law files from the engine. They are the rules a session reads,
   and create-if-missing strands them at whatever version first landed — which
   is exactly the drift this script exists to stop, one level up. */
if (!CHECK && repo) {
  const init = path.join(repo, 'scripts/studio/init-workspace.mts');
  if (existsSync(init)) {
    const r = git(WS, ['--version']); // node's execFileSync is already imported; reuse the shape
    void r;
    try {
      const out = execFileSync('npx', ['tsx', init, WS, '--update'], { cwd: WS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      const refreshed = /rules?:\s*(.+)/.exec(out)?.[1];
      console.log(`  laws                 refreshed${refreshed ? `  (${refreshed.trim()})` : ''}`);
    } catch (err) {
      // Not fatal: the pull is the load-bearing part, and npx may be offline.
      console.log(`  laws                 skipped — ${String(err?.message || err).split('\n')[0].slice(0, 90)}`);
    }
  }
}

// Ambiguity is the same class as BLOCKED: something that should have synced
// did not, and a person has to act. Exiting 0 would let a launchd job report
// success forever while the engine silently never updated.
const blocked = results.some(r => r.state === 'BLOCKED') || engine.all.length > 1;
const behind = results.some(r => r.state === 'behind');
console.log('');
process.exit(blocked ? 2 : (CHECK && behind) ? 1 : 0);
