/**
 * THE WEEKLY MARKET SWEEP — the deterministic half of the Saturday agent.
 *
 * Paul, 2026-08-10: "why can we not have a series of agents that automate some
 * of these processes where the agent goes out and does the industry research
 * every week for the verticals that we use, and brings back an update the docs
 * and maintains other collateral" → "All markets should update weekly starting
 * in Saturday and Email me the delta of what's new or changed on Sunday."
 *
 * The agent does the thinking (research, synthesis, writing). THIS does
 * everything else, because everything else is countable and a model that
 * counts is a model that can be wrong about what changed. Nothing here calls a
 * model, reads a key, or touches the network.
 *
 *   weekly.mts status                 — the pre-flight: what each market is on,
 *                                       what is waiting to be folded in, which
 *                                       theses are behind. Run FIRST.
 *   weekly.mts digest [--since 7d]    — the Sunday email: what actually changed
 *                                       across every market, read from GIT.
 *
 * WHY THE DIGEST READS GIT. "What changed this week" has an exact answer if the
 * workspace is a repo, and only a guessed one if it isn't. Asking a model to
 * remember last week's state is how a delta quietly becomes a summary. Without
 * git the digest still runs — it reports current state and says plainly that it
 * could not compute a delta, which is the honest degradation.
 *
 * Exit codes follow audit.mts:
 *   0  nothing needs Paul
 *   1  something does — a flagged audit, a stale thesis, unfolded research
 *   2  a market could not be read at all
 *
 * Run from the workspace root (~/Documents/smbx-studio).
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const WS = process.cwd();
const MARKETS = path.join(WS, 'markets');

/* ── git, optional ─────────────────────────────────────────────────────── */

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { cwd: WS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const hasGit = () => git(['rev-parse', '--is-inside-work-tree']) === 'true';

/* ── the workspace, read the same way thesis.mts reads it ──────────────── */

type Front = Record<string, string>;

function parseFront(md: string): { front: Front; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(md);
  if (!m) return { front: {}, body: md };
  const front: Front = {};
  for (const line of m[1].split('\n')) {
    const kv = /^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/.exec(line);
    if (kv) front[kv[1].toLowerCase()] = kv[2];
  }
  return { front, body: md.slice(m[0].length) };
}

/** Highest versions/master-vN.md; a bare master.md with no versions/ is v1. */
function masterVersion(dir: string): number | null {
  const vdir = path.join(dir, 'versions');
  let top = 0;
  if (existsSync(vdir)) {
    for (const f of readdirSync(vdir)) {
      const n = /master-v(\d+)\.md$/i.exec(f);
      if (n) top = Math.max(top, Number(n[1]));
    }
  }
  if (!top && existsSync(path.join(dir, 'master.md'))) return 1;
  return top || null;
}

/** A folder under markets/ that is a real market, not an _example- scaffold. */
function marketDirs(): string[] {
  if (!existsSync(MARKETS)) return [];
  return readdirSync(MARKETS)
    .filter(m => !m.startsWith('_') && !m.startsWith('.'))
    .filter(m => { try { return statSync(path.join(MARKETS, m)).isDirectory(); } catch { return false; } })
    .sort();
}

const mtime = (p: string): number => { try { return statSync(p).mtimeMs; } catch { return 0; } };

interface MarketState {
  slug: string;
  version: number | null;
  masterAt: number;              // mtime of master.md, 0 if absent
  /** Research files modified AFTER the master was last written.
   *  A HEURISTIC, and named as one wherever it is printed: on disk there is no
   *  `incorporated_version` the way the retired database had, so newer-than-
   *  the-master is the only signal available. It over-reports (a touched file
   *  looks new) and never under-reports, which is the right direction for a
   *  prompt to act on. */
  pending: string[];
  sources: number;
  theses: { file: string; profile: string; status: string; builtOn: number | null; stale: boolean }[];
  unreadable: string | null;
}

function readMarket(slug: string): MarketState {
  const dir = path.join(MARKETS, slug);
  const st: MarketState = {
    slug, version: null, masterAt: 0, pending: [], sources: 0, theses: [], unreadable: null,
  };
  try {
    st.version = masterVersion(dir);
    st.masterAt = mtime(path.join(dir, 'master.md'));

    const rdir = path.join(dir, 'research');
    if (existsSync(rdir)) {
      for (const f of readdirSync(rdir)) {
        if (f.startsWith('.')) continue;
        const p = path.join(rdir, f);
        if (!statSync(p).isFile()) continue;
        st.sources++;
        // No master yet → everything is pending, which is correct: a market
        // with sources and no master is the loudest possible state.
        if (!st.masterAt || mtime(p) > st.masterAt) st.pending.push(f);
      }
    }

    const ddir = path.join(dir, 'documents');
    if (existsSync(ddir)) {
      for (const f of readdirSync(ddir)) {
        if (!/^thesis.*\.md$/i.test(f)) continue;
        const { front } = parseFront(readFileSync(path.join(ddir, f), 'utf8'));
        const builtOn = front.master_version ? Number(front.master_version) : null;
        const status = (front.status || 'draft').toLowerCase();
        st.theses.push({
          file: f,
          profile: front.profile || f.replace(/^thesis-?/i, '').replace(/\.md$/i, '') || '—',
          status,
          builtOn,
          // Only an ACTIVE thesis can be stale — a draft does not ship, so it
          // does not fail the gate. Same rule as `thesis.mts check`.
          stale: status === 'active' && st.version != null && (builtOn == null || builtOn < st.version),
        });
      }
    }
  } catch (err: any) {
    st.unreadable = String(err?.message || err).slice(0, 160);
  }
  return st;
}

/* ── status ────────────────────────────────────────────────────────────── */

function cmdStatus(): number {
  const slugs = marketDirs();
  if (!slugs.length) {
    // init-workspace does NOT create a market — it seeds markets/_example-market,
    // which this tool deliberately filters out. A market is a folder you make.
    console.log('No markets/ folder, or nothing in it but the _example- scaffold.');
    console.log('A market is a folder: mkdir -p markets/<slug>/{research,versions,documents,collateral}');
    console.log('Then follow RESEARCH.md to build its first master.');
    return 1;
  }
  let needsEye = 0, broken = 0;
  console.log(`\nWORKSPACE  ${WS}`);
  console.log(`GIT        ${hasGit() ? git(['rev-parse', '--abbrev-ref', 'HEAD']) : 'NOT A REPO — the digest cannot compute a delta'}`);
  console.log(`MARKETS    ${slugs.length}\n`);

  for (const slug of slugs) {
    const m = readMarket(slug);
    if (m.unreadable) { broken++; console.log(`  ✗ ${slug} — unreadable: ${m.unreadable}`); continue; }
    const v = m.version == null ? 'NO MASTER' : `master v${m.version}`;
    console.log(`  ${slug}`);
    console.log(`      ${v} · ${m.sources} source${m.sources === 1 ? '' : 's'} on disk`);
    if (m.pending.length) {
      needsEye++;
      console.log(`      ${m.pending.length} not yet folded in (newer than the master): ${m.pending.slice(0, 4).join(', ')}${m.pending.length > 4 ? ' …' : ''}`);
    }
    for (const t of m.theses) {
      const behind = t.stale ? `  ← STALE: built on v${t.builtOn ?? '?'}, master is v${m.version}` : '';
      if (t.stale) needsEye++;
      console.log(`      thesis · ${t.profile} (${t.status})${behind}`);
    }
    console.log('');
  }
  if (broken) return 2;
  return needsEye ? 1 : 0;
}

/* ── digest ────────────────────────────────────────────────────────────── */

/** "7d" / "14d" / "1 week ago" → a `git log --since` spec AND a readable label.
 *  Two values, because the git spec ("7 days ago") reads as nonsense inside a
 *  sentence — "the delta over the last 7 days ago". */
function sinceSpec(raw: string): { spec: string; label: string } {
  const d = /^(\d+)\s*d(ays?)?$/i.exec(raw.trim());
  if (d) return { spec: `${d[1]} days ago`, label: `${d[1]} day${d[1] === '1' ? '' : 's'}` };
  return { spec: raw, label: raw.replace(/\s*ago\s*$/i, '') };
}

interface Change { path: string; status: string }

/**
 * What changed in one market over the window — as a DIFF against the commit
 * that was HEAD a week ago, not as a log walk.
 *
 * `git log --since` was the obvious first choice and it is WRONG here: --since
 * PRUNES TRAVERSAL, so git stops walking at the first commit older than the
 * cutoff. One out-of-order commit date — which any rebase, cherry-pick or
 * backdated commit produces — silently truncates the log to nothing. Caught by
 * committing a market with an April date: the digest reported "0 of 4 markets
 * changed" while three of them had changed that morning. Confidently wrong and
 * quiet, which is the worst failure this tool could have.
 *
 * A two-point diff has neither problem, and is a better answer anyway: it is
 * the NET change over the week, not every intermediate step toward it.
 */
function changesFor(slug: string, base: string | null): Change[] | null {
  const args = base
    ? ['diff', '--name-status', base, 'HEAD', '--', `markets/${slug}/`]
    // No commit old enough: the repo itself is younger than the window, so
    // everything in it is new. Diff against the empty tree.
    : ['diff', '--name-status', EMPTY_TREE, 'HEAD', '--', `markets/${slug}/`];
  const out = git(args);
  if (out == null) return null;
  const seen = new Map<string, string>();
  for (const line of out.split('\n')) {
    const m = /^([AMDRT])\S*\t(.+?)(?:\t(.+))?$/.exec(line.trim());
    if (!m) continue;
    // A rename reports old\tnew; the new path is what the reader cares about.
    seen.set((m[3] || m[2]).trim(), m[1]);
  }
  return [...seen].map(([path, status]) => ({ path, status }));
}

/** git's canonical empty tree — diffing against it lists a whole tree as added. */
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

/** The last commit at or before the cutoff. null if the repo is younger. */
function baseCommit(since: string): string | null {
  return git(['rev-list', '-1', `--before=${since}`, 'HEAD']) || null;
}

const LABEL: Record<string, string> = { A: 'new', M: 'updated', D: 'removed', R: 'renamed', T: 'retyped' };

function bucket(p: string): string {
  if (/\/versions\/master-v\d+\.md$/i.test(p)) return 'master';
  if (/\/master\.md$/i.test(p)) return 'master';
  if (/\/research\//i.test(p)) return 'research';
  if (/\/documents\//i.test(p)) return 'documents';
  if (/\/collateral\//i.test(p)) return 'collateral';
  if (/\/screen\//i.test(p)) return 'screen';
  return 'other';
}

function cmdDigest(args: string[]): number {
  const sinceArg = args[args.indexOf('--since') + 1];
  const { spec: since, label: sinceLabel } = sinceSpec(args.includes('--since') && sinceArg ? sinceArg : '7d');
  const outArg = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;

  const slugs = marketDirs();
  const git_ = hasGit();
  const base = git_ ? baseCommit(since) : null;
  // base === HEAD means the newest commit is ALREADY older than the window, so
  // there is nothing to compare against and every market will read "no change".
  // True, but "0 of 4 markets changed" is a misleading way to say "nothing has
  // happened at all" — so it gets its own sentence.
  const baseIsHead = !!base && base === git(['rev-parse', 'HEAD']);
  const L: string[] = [];
  const SUMMARY_SLOT = '\u0000summary';
  let needsEye = 0, broken = 0, changedMarkets = 0;

  const baseDate = base ? (git(['log', '-1', '--format=%cs', base]) || '') : '';
  L.push(`# Weekly market sweep`);
  L.push('');
  L.push(git_
    ? (baseIsHead
        ? `**Nothing has been committed in the last ${sinceLabel}.** The newest commit is from ${baseDate}, `
          + `so there is no delta to report — the state below is simply where each market stands.`
        : `Delta over the last ${sinceLabel}` + (base ? `, against the workspace as it stood on ${baseDate}.` : ` — the whole workspace, since the repo is newer than that.`))
    : `**This workspace is not a git repository, so there is no delta to compute.** ` +
      `What follows is the CURRENT state of each market, not what changed. ` +
      `Put the workspace in git and this becomes an exact week-over-week diff.`);
  L.push('');
  L.push(SUMMARY_SLOT);

  const needs: string[] = [];

  for (const slug of slugs) {
    const m = readMarket(slug);
    if (m.unreadable) {
      broken++;
      L.push(`## ${slug}`, '', `**Could not read this market:** ${m.unreadable}`, '');
      continue;
    }

    const ch = git_ ? changesFor(slug, base) : null;
    const groups = new Map<string, Change[]>();
    for (const c of ch ?? []) {
      const b = bucket(c.path);
      (groups.get(b) ?? groups.set(b, []).get(b)!).push(c);
    }

    const quiet = git_ && (ch?.length ?? 0) === 0;
    if (!quiet) changedMarkets++;

    L.push(`## ${slug} — ${m.version == null ? '**no master yet**' : `master v${m.version}`}`);
    L.push('');

    if (quiet) {
      L.push(baseIsHead ? '_No commits to compare against._' : '_No change this week._');
      L.push('');
    } else {
      for (const b of ['master', 'research', 'documents', 'collateral', 'screen', 'other']) {
        const g = groups.get(b);
        if (!g?.length) continue;
        L.push(`**${b}**`);
        for (const c of [...g].sort((a, b) => a.path.localeCompare(b.path)).slice(0, 12)) {
          L.push(`- ${LABEL[c.status] ?? c.status} · \`${c.path.replace(`markets/${slug}/`, '')}\``);
        }
        if (g.length > 12) L.push(`- …and ${g.length - 12} more`);
        L.push('');
      }
      if (!git_) L.push(`_${m.sources} source${m.sources === 1 ? '' : 's'} on disk._`, '');
    }

    // What Paul has to DO, as opposed to what happened.
    const todo: string[] = [];
    const noMaster = m.version == null && m.sources > 0;
    if (noMaster) todo.push(`**${m.sources} source${m.sources === 1 ? '' : 's'} and no master** — nothing has been synthesized here yet.`);
    // Suppressed when there is no master: "newer than the master" is not a
    // second finding when the line above already says there isn't one.
    if (m.pending.length && !noMaster) todo.push(`**${m.pending.length} research file${m.pending.length === 1 ? '' : 's'} newer than the master** (${m.pending.slice(0, 3).join(', ')}${m.pending.length > 3 ? ' …' : ''}) — folded in, or missed?`);
    for (const t of m.theses.filter(t => t.stale)) {
      todo.push(`**Thesis \`${t.file}\` is stale** — it rests on master v${t.builtOn ?? '?'}, the master is v${m.version}. Re-check it before quoting it.`);
    }
    if (todo.length) {
      needsEye += todo.length;
      L.push('**Needs your eye**');
      for (const t of todo) L.push(`- ${t}`);
      L.push('');
      needs.push(`${slug}: ${todo.length}`);
    }
  }

  // The summary goes at the TOP, because this is read on a phone.
  const head: string[] = [];
  head.push(git_ && baseIsHead
    ? `**No commits this week** across ${slugs.length} market${slugs.length === 1 ? '' : 's'}. `
      + (needsEye ? `${needsEye} thing${needsEye === 1 ? '' : 's'} still need your eye — ${needs.join(' · ')}.` : 'Nothing needs your eye.')
    : git_
    ? `**${changedMarkets} of ${slugs.length} market${slugs.length === 1 ? '' : 's'} changed.** `
      + (needsEye ? `${needsEye} thing${needsEye === 1 ? '' : 's'} need your eye — ${needs.join(' · ')}.` : 'Nothing needs your eye.')
    : `**${slugs.length} market${slugs.length === 1 ? '' : 's'}.** `
      + (needsEye ? `${needsEye} thing${needsEye === 1 ? '' : 's'} need your eye — ${needs.join(' · ')}.` : 'Nothing needs your eye.'));
  head.push('');
  head.push('> The citation audit checks NUMBERS, not prose. A master that changed');
  head.push('> should be read before anything derived from it goes to a client.');
  head.push('');
  const at = L.indexOf(SUMMARY_SLOT);
  if (at < 0) throw new Error('summary slot missing from the digest header');
  L.splice(at, 1, ...head);

  const md = L.join('\n');
  if (outArg) { writeFileSync(path.resolve(WS, outArg), md + '\n'); console.log(`Wrote ${outArg}`); }
  else console.log(md);

  if (broken) return 2;
  return needsEye ? 1 : 0;
}


/* ── how old is a market's read? ────────────────────────────────────────────
 *
 * Paul, 2026-08-10: "once the market assessment is in place, it probably really
 * only needs to be updated quarterly for each vertical (so 1 per week)." So the
 * weekly job stopped being "sweep everything" and became a ROTATION: each
 * market gets one proper quarterly refresh, and the weeks are how they queue.
 *
 * AGE COMES FROM GIT, NOT MTIME, and that is not a preference. **git does not
 * preserve modification times on clone** — check out this workspace on a new
 * Mac and every master reads as refreshed today, so an mtime rotation would
 * quietly decide nothing was ever due again. Same class of bug as the
 * `--since` traversal trap above: plausible, silent, and wrong in the
 * direction of doing no work.
 *
 * Without git there is no honest answer, so `due` says so rather than guessing
 * from mtime — a rotation that cannot tell you when it last ran is not a
 * rotation.
 */
function masterAgeDays(slug: string, version: number | null): { days: number | null; on: string; how: 'git' | 'none' } {
  if (version == null) return { days: null, on: '', how: 'none' };
  // The newest master version file IS the refresh event; master.md is a copy of
  // it and gets touched by unrelated edits.
  const file = `markets/${slug}/versions/master-v${version}.md`;
  const iso = git(['log', '-1', '--format=%cI', '--', file])
    || git(['log', '-1', '--format=%cI', '--', `markets/${slug}/master.md`]);
  if (!iso) return { days: null, on: '', how: 'none' };
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return { days: null, on: '', how: 'none' };
  return { days: Math.floor((Date.now() - then) / 86_400_000), on: iso.slice(0, 10), how: 'git' };
}

/* ── due ──────────────────────────────────────────────────────────────────── */

function cmdDue(args: string[]): number {
  const num = (flag: string, dflt: number) => {
    const i = args.indexOf(flag);
    const v = i >= 0 ? Number(args[i + 1]) : NaN;
    return Number.isFinite(v) && v > 0 ? v : dflt;
  };
  const every = num('--every', 90);   // quarterly
  const warn = num('--warn', Math.round(every * 0.85));

  const slugs = marketDirs();
  if (!slugs.length) { console.log('No markets.'); return 0; }
  if (!hasGit()) {
    console.log('This workspace is not a git repository, so there is no reliable');
    console.log('record of when each master was last refreshed — mtimes are reset by');
    console.log('any clone, so guessing from them would silently skip the rotation.');
    console.log('Put the workspace in git and this command becomes exact.');
    return 2;
  }

  const rows = slugs.map(slug => {
    const m = readMarket(slug);
    return { m, age: masterAgeDays(slug, m.version) };
  });

  // A market with no master has never been BUILT. That is the full hunt in
  // RESEARCH.md, not a quarterly refresh, and conflating the two is how a
  // weekly cron talks itself into a six-hour job.
  const unbuilt = rows.filter(r => r.m.version == null);
  const built = rows.filter(r => r.m.version != null);
  const dated = built.filter(r => r.age.days != null) as { m: MarketState; age: { days: number; on: string; how: 'git' } }[];
  const undated = built.filter(r => r.age.days == null);

  dated.sort((a, b) => b.age.days - a.age.days);
  const top = dated[0];
  const isDue = !!top && top.age.days >= warn;

  console.log(isDue ? `DUE: ${top.m.slug}` : 'DUE: none');
  console.log('');

  if (isDue) {
    const over = top.age.days - every;
    console.log(`UP THIS WEEK`);
    console.log(`  ${top.m.slug} — master v${top.m.version}, last refreshed ${top.age.on} (${top.age.days} days ago${over >= 0 ? `, ${over} past the ${every}-day cycle` : `, due at ${every}`})`);
    console.log('');
  }

  // The arithmetic a person forgets: one market a week over a 90-day cycle
  // holds ~13 markets. Past that the rotation cannot keep its own promise, and
  // it should say so rather than quietly running later and later.
  const capacity = Math.floor(every / 7);
  console.log(`ROTATION  ${built.length} built market${built.length === 1 ? '' : 's'} · one per week · ${every}-day cycle`);
  if (built.length > capacity) {
    console.log(`  ⚠ ONE PER WEEK CANNOT HOLD ${built.length} MARKETS on a ${every}-day cycle — it tops out at ${capacity}.`);
    console.log(`    Every market will drift past ${every} days. Either widen the cycle (--every), do more`);
    console.log(`    than one some weeks, or accept that ${built.length - capacity} of them refresh less often.`);
  } else {
    console.log(`  Capacity is ${capacity}; every market comes round every ${built.length} week${built.length === 1 ? '' : 's'}. Comfortable.`);
  }
  console.log('');

  const others = dated.filter(r => r !== top);
  if (others.length) {
    console.log('NOT DUE');
    for (const r of others) console.log(`  ${r.m.slug.padEnd(22)} ${String(r.age.days).padStart(4)} days   (${r.age.on})`);
    console.log('');
  }
  if (undated.length) {
    console.log('NO COMMIT HISTORY — never committed, so age is unknown:');
    for (const r of undated) console.log(`  ${r.m.slug}`);
    console.log('');
  }
  if (unbuilt.length) {
    console.log('NOT BUILT YET — these need a FULL hunt (RESEARCH.md), not a refresh.');
    console.log('They are not part of the rotation and this job will not start one:');
    for (const r of unbuilt) console.log(`  ${r.m.slug}${r.m.sources ? `  (${r.m.sources} source${r.m.sources === 1 ? '' : 's'} waiting)` : ''}`);
    console.log('');
  }

  if (built.length > capacity) return 2;
  return isDue ? 1 : 0;
}

/* ── main ──────────────────────────────────────────────────────────────── */

const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case 'status': process.exit(cmdStatus());
  case 'digest': process.exit(cmdDigest(rest));
  case 'due': process.exit(cmdDue(rest));
  default:
    console.log(`
THE WEEKLY MARKET SWEEP — run from the workspace root.

  npx tsx <repo>/scripts/studio/weekly.mts status
      The Saturday pre-flight. Every market: what version its master is on,
      what research is sitting unfolded, which theses have gone stale.

  npx tsx <repo>/scripts/studio/weekly.mts due [--every 90] [--warn 77]
      WHICH market is up this week. Masters need a quarterly refresh, not a
      weekly one, so the weeks are a rotation — this says whose turn it is.
      First line is DUE: <slug> (or DUE: none), for a script to read.
      Exit: 0 nothing due (skip the week) · 1 work this market · 2 the
      rotation cannot keep up, or there is no git to date it from.

  npx tsx <repo>/scripts/studio/weekly.mts digest [--since 7d] [--out FILE]
      The Sunday delta, read from git. Markdown, phone-shaped, summary first.

Exit: 0 nothing needs you · 1 something does · 2 a market could not be read.
Calls no model, reads no key, touches no network.
`);
    process.exit(cmd ? 2 : 0);
}
