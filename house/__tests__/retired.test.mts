/**
 * The retirement register — every entry's proof, executed.
 *
 * Run: npx tsx house/__tests__/retired.test.mts   (npm run test:retired)
 *
 * A list of things-to-delete-later is worth nothing if it is not checked. The
 * whole point of `house/retired.ts` is that each entry says what must stay true
 * for its retirement to hold, and this runs those claims.
 *
 * A FAILURE HERE IS NOT NOISE. It means something marked dead came back to
 * life — a nav flag flipped, a lane re-armed, an orphan grew an importer — and
 * nobody connected that to the register. That is precisely the gap between
 * "we decided to remove this" and "this is actually gone" where four of this
 * repo's stale laws lived.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { RETIRED, byKind, SWEEP_RULE, type Retired } from '../retired.js';
import { DEFAULT_LANES } from '../../server/services/apiSpend.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const codeOf = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ── the register is well formed ──────────────────────────────────────── */

ok('every entry says what it is and why',
  RETIRED.every(r => r.id && r.why && r.marked && r.proof));
is('ids are unique', RETIRED.length, new Set(RETIRED.map(r => r.id)).size);
ok('every entry is dated ISO', RETIRED.every(r => /^\d{4}-\d{2}-\d{2}$/.test(r.marked)));

/* SUPERSEDED means something else does the job — so it must say what.
   ORPHANED legitimately has no replacement: nothing does the job because the
   job stopped existing. That asymmetry is the difference between the two. */
ok('every superseded entry names its replacement',
  byKind('superseded').every(r => !!r.replacedBy));

/* ── each proof, executed ─────────────────────────────────────────────── */

for (const r of RETIRED) {
  const label = r.id.split(' ')[0].split('/').pop();
  switch (r.proof.check) {
    case 'unreferenced': {
      /* Comments stripped, and the file itself excluded. A file that documents
         its own retirement mentions its own name; reading that as a live
         reference is the mistake this suite made three times yesterday. */
      const out = execFileSync('grep', [
        '-rl', r.proof.pattern, '--include=*.ts', '--include=*.tsx',
        'server', 'client/src', 'shared', 'house', 'scripts',
      ], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
      const live = out
        .filter(f => f !== r.proof.selfPath && !f.includes('__tests__') && f !== 'house/retired.ts')
        .filter(f => new RegExp(`\\b${r.proof.pattern}\\b`).test(codeOf(read(f))));
      is(`${label}: nothing imports it`, live, []);
      break;
    }
    case 'flagOff': {
      const src = codeOf(read(r.proof.file));
      ok(`${label}: ${r.proof.constant} is off`,
        new RegExp(`${r.proof.constant}\\s*=\\s*false`).test(src));
      break;
    }
    case 'laneOff':
      ok(`${label}: the ${r.proof.lane} lane is not armed by default`,
        !(DEFAULT_LANES as readonly string[]).includes(r.proof.lane));
      break;
    case 'exists':
      ok(`${label}: its replacement is present (${r.proof.path})`,
        existsSync(path.join(ROOT, r.proof.path)));
      break;
  }
}

/* ── the notes are load-bearing ───────────────────────────────────────── */

/* A DARK entry still compiles and is reachable by direct URL, so deleting one
   is never a single-file change — there is always a route case, a cron guard
   or a shared constant that has to go with it. Requiring the note is what
   stops the register becoming a list of filenames that looks safer to act on
   than it is. */
ok('every dark entry carries a note about what else must go',
  byKind('dark').every(r => !!r.note && r.note.length > 40));

/* The one that matters most is the least intuitive: superseded code is
   REACHABLE. Nobody is surprised that dark code is dead; the risk is someone
   calling the stale implementation and getting the older answer. */
ok('the sweep rule warns that superseded is the reachable kind',
  /SUPERSEDED is reachable/.test(SWEEP_RULE));

/* ── it agrees with the routing table ─────────────────────────────────── */

/* Anything retired because the seam moved it should be findable in where.ts on
   the OTHER side. If the register says sourcing is gone from the app and the
   routing table still says the app owns it, one of them is lying — and this
   session has already watched that exact pair disagree. */
{
  const where = read('house/where.ts');
  ok('the routing table agrees sourcing left the app',
    /id: 'sourcing-pipeline',[\s\S]{0,200}?owner: 'workspace'/.test(where));
}

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
