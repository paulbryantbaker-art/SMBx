/**
 * THE DRIFT GUARD — a published copy must equal its studio source.
 *
 * WHY. A report published on smbx.ai is a COPY of a workspace document, and on
 * 2026-08-12 the two live home-services reports were found carrying band
 * labels the workspace master had corrected the day before: 307 published as
 * the 10–249 band when it is 20–249, platform share published as 8.5% where
 * the true 10–249 figure is 4.3%. The workspace was right. The website was
 * wrong. Nothing was watching the gap, and the wrong number was the one with
 * an audience.
 *
 * The law this enforces: the website copy is NEVER edited in place. When the
 * studio document changes, the copy is replaced wholesale. Only the
 * `<!--cover … -->` block may differ, because the website carries its own art
 * set. Everything below the first `---` after the cover must be IDENTICAL.
 *
 * The manifest below IS the map of what publishes where. A report in
 * `scripts/studio/reports/` that is wired into `shared/reports.ts` but absent
 * here is a finding (nobody knows its source); one that is mapped but whose
 * studio source is missing is a finding (the source of truth is gone).
 *
 *   npx tsx scripts/studio/drift-check.mts [--studio <path>] [--repo <path>]
 *
 * ONE CLONE (2026-08-18): both trees are in this repo — the studio root defaults
 * to `<repo>/studio`, so no flag is needed. Runs anywhere the clone is. Exit 0 in sync · 1 drift or
 * mapping failure · 2 usage.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/* slug → the two ends of the copy. Repo paths are relative to the repo root,
   studio paths to the studio root. Add a row when a report is published. */
const MANIFEST: { repo: string; studio: string }[] = [
  {
    repo: 'scripts/studio/reports/home-services-state-of-market.md',
    studio: 'markets/home-services/documents/market-assessment.md',
  },
  {
    repo: 'scripts/studio/reports/dfw-home-services.md',
    studio: 'markets/home-services/documents/dfw-home-services-market-map.md',
  },
  {
    repo: 'scripts/studio/reports/fire-safety-buy-side-assessment.md',
    studio: 'markets/fire-safety/documents/market-assessment.md',
  },
  {
    repo: 'scripts/studio/reports/commercial-mep-buy-side-assessment.md',
    studio: 'markets/commercial-mep/documents/mep-market-assessment.md',
  },
];

/* The method docs used to be carried TWICE — `content/studio/*` in the engine
   repo and a copy in the workspace, refreshed by init-workspace — and this
   list checked the pair. ONE CLONE (2026-08-18) ended that: the workspace is
   `studio/` inside this repo and the laws exist once, so there is no pair to
   compare. Empty on purpose; the MANIFEST above (published website copies vs
   their studio masters) is still two real copies and still the point. */
const DOC_PAIRS: { repo: string; studio: string }[] = [];

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const repoRoot = flag('--repo') ?? path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
/* ONE CLONE: the studio root defaults to `<repo>/studio`. `--studio` remains
   for the transition (an old separate folder), not as the normal case. */
const studioRoot = flag('--studio') ?? path.join(repoRoot, 'studio');
if (!existsSync(studioRoot)) {
  console.error(`drift-check.mts: studio root not found at ${studioRoot} — pass --studio <path> if the workspace is elsewhere`);
  process.exit(2);
}

/* Body = everything after the cover block and the first `---` separator; the
   cover (byline, art, stats) is the website's own and may differ. */
function body(raw: string): string {
  const noCover = raw.replace(/<!--\s*cover[\s\S]*?-->/i, '');
  const cut = noCover.indexOf('\n---\n');
  return (cut >= 0 ? noCover.slice(cut + 5) : noCover).replace(/\s+$/gm, '').trim();
}

let bad = 0;
console.log(`\nDrift check    repo   ${repoRoot}`);
console.log(`               studio ${studioRoot}\n`);

console.log('── published reports (cover exempt, body must be identical) ──');
for (const m of MANIFEST) {
  const r = path.join(repoRoot, m.repo);
  const s = path.join(studioRoot, m.studio);
  const name = path.basename(m.repo);
  if (!existsSync(r)) { console.log(`  ·        ${name} — not published (no repo copy); skipped`); continue; }
  if (!existsSync(s)) { console.log(`  ✗ NO SOURCE  ${name} — published, but ${m.studio} does not exist. The source of truth is gone.`); bad++; continue; }
  const rb = body(readFileSync(r, 'utf8'));
  const sb = body(readFileSync(s, 'utf8'));
  if (rb === sb) { console.log(`  ok       ${name}`); continue; }
  bad++;
  /* Name the first diverging line so the fix starts somewhere. */
  const rl = rb.split('\n'), sl = sb.split('\n');
  let i = 0; while (i < rl.length && i < sl.length && rl[i] === sl[i]) i++;
  console.log(`  ✗ DRIFT  ${name}`);
  console.log(`           first divergence at body line ${i + 1}:`);
  console.log(`             site:   ${(rl[i] ?? '(ends)').slice(0, 90)}`);
  console.log(`             studio: ${(sl[i] ?? '(ends)').slice(0, 90)}`);
  console.log(`           → replace the repo copy wholesale from ${m.studio}. Never patch it.`);
}

/* Reports on the site that no manifest row claims: provenance unknown. */
const reportsDir = path.join(repoRoot, 'scripts/studio/reports');
if (existsSync(reportsDir)) {
  const mapped = new Set(MANIFEST.map(m => path.basename(m.repo)));
  const orphans = readdirSync(reportsDir).filter(f => f.endsWith('.md') && !mapped.has(f));
  for (const f of orphans) {
    console.log(`  ? UNMAPPED  ${f} — in reports/ with no manifest row. Where is its source?`);
  }
}

console.log('\n── method docs (byte-identical, no exemption) ────────────────');
for (const m of DOC_PAIRS) {
  const r = path.join(repoRoot, m.repo);
  const s = path.join(studioRoot, m.studio);
  if (!existsSync(r) || !existsSync(s)) { console.log(`  ✗ MISSING  ${m.repo} ↔ ${m.studio}`); bad++; continue; }
  if (readFileSync(r, 'utf8') === readFileSync(s, 'utf8')) console.log(`  ok       ${path.basename(m.repo)}`);
  else { console.log(`  ✗ DRIFT  ${path.basename(m.repo)} — refresh from the studio copy (the system of record)`); bad++; }
}

console.log('\n──────────────────────────────────────────────────────────────');
if (bad) {
  console.log(`✗ ${bad} pair(s) out of sync. Pushing the repo now publishes stale or`);
  console.log('  unsourced text. Fix the studio document first, copy wholesale, re-run.');
} else {
  console.log('✓ every published copy matches its studio source. Safe to push on this axis.');
}
process.exit(bad ? 1 : 0);
