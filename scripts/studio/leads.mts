/**
 * THE BUY-SIDE LEAD BOARD, LOCAL.
 *
 * Front end for `house/leads.ts` — the same scoring the app runs, so a ranking
 * produced here and a ranking produced in the app cannot disagree. No API key,
 * no database, no network.
 *
 *   npx tsx scripts/studio/leads.mts rank <register.csv> [options]
 *   npx tsx scripts/studio/leads.mts picture <register.csv> [options]
 *
 * Options
 *   --trades "a,b,c"   markets we hold a verified master for (drives the lane
 *                      score). Default: fire and life safety, hvac, plumbing.
 *   --as-of YYYY-MM-DD scoring date, so a run is reproducible. Default: today.
 *   --out <file>       write the ranked CSV here. Default: <input>.ranked.csv
 *   --top <n>          how many rows to print. Default 20. `--top 0` prints none.
 *
 * The board is a CSV because it is managed in Google Sheets. Any column added
 * there survives a re-rank — `toCsv` preserves unknown columns, because losing
 * someone's manual work on a re-score is unforgivable and silent.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseLeadCsv, rankLeads, picture, LEAD_COLUMNS, normSegment } from '../../house/leads.js';
import { toCsv } from '../../house/screen.js';

const argv = process.argv.slice(2);
const cmd = argv[0];
const file = argv[1];

function opt(name: string, fallback: string): string {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const USAGE = `usage: npx tsx scripts/studio/leads.mts <rank|picture> <register.csv>
             [--trades "fire and life safety,hvac"] [--as-of YYYY-MM-DD]
             [--out ranked.csv] [--top 20]`;

if (!cmd || !file || !['rank', 'picture'].includes(cmd)) {
  console.error(USAGE);
  process.exit(64);
}

const asOf = opt('as-of', new Date().toISOString().slice(0, 10));
const trades = opt('trades', 'fire and life safety,hvac,plumbing')
  .split(',').map(s => s.trim()).filter(Boolean);
const top = Number(opt('top', '20'));

let text: string;
try {
  text = readFileSync(file, 'utf8');
} catch (e: any) {
  console.error(`cannot read ${file}: ${e.message}`);
  process.exit(66);
}

const rows = parseLeadCsv(text);
if (!rows.length) {
  console.error(`${file} has no rows with a firm name — is it the right file?`);
  process.exit(65);
}

const ranked = rankLeads(rows, { trades, asOf, metro: 'Dallas' });
const pic = picture(ranked);

const pct = (n: number) => `${Math.round((n / pic.total) * 100)}%`;

console.log(`\nBUY-SIDE REGISTER — ${pic.total} firms`);
console.log(`scored as of ${asOf} · markets: ${trades.join(' · ')}\n`);

console.log('TIER      ' + (['A', 'B', 'C', 'D'] as const)
  .map(t => `${t} ${pic.byTier[t] ?? 0}`).join('   '));
console.log('MOMENT    ' + Object.entries(pic.byMoment)
  .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join('   '));
console.log('PITCH     ' + Object.entries(pic.byPitch)
  .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join('   '));
console.log('SEGMENT   ' + Object.entries(pic.bySegment)
  .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join('   '));
console.log('');
console.log(`in DFW              ${pic.inMetro} (${pct(pic.inMetro)})`);
console.log(`need a contact      ${pic.needContact} (${pct(pic.needContact)}) — research before outreach`);
console.log(`directory-only      ${pic.directoryOnly} (${pct(pic.directoryOnly)}) — verify before acting`);

if (cmd === 'rank') {
  if (top > 0) {
    console.log(`\nTOP ${Math.min(top, ranked.length)}\n`);
    const w = Math.max(...ranked.slice(0, top).map(r => (r.firm || '').length));
    ranked.slice(0, top).forEach((r, i) => {
      const flags = [
        r.dfw === 'yes' ? 'DFW' : '',
        !(r.key_person || '').trim() ? 'no contact' : '',
        r.grade === 'directory' ? 'directory only' : '',
      ].filter(Boolean).join(', ');
      console.log(
        `${String(i + 1).padStart(3)}. ${String(r.score).padStart(3)} ${r.tier}  ` +
        `${(r.firm || '').padEnd(w)}  ${normSegment(r.segment).padEnd(19)} ` +
        `${(r.buyer_moment || '').padEnd(18)} ${r.pitch.padEnd(12)}${flags ? ` [${flags}]` : ''}`,
      );
    });
  }
  const out = opt('out', file.replace(/\.csv$/i, '') + '.ranked.csv');
  writeFileSync(out, toCsv(ranked as any, LEAD_COLUMNS));
  console.log(`\nwrote ${out}`);
}

// A register nobody can act on is worth flagging loudly rather than quietly
// producing a tidy-looking board.
if (pic.needContact / pic.total > 0.4) {
  console.log(
    `\nNOTE: ${pic.needContact} of ${pic.total} rows carry no named contact. ` +
    `Reach is a scored scale, so those rows sit lower than their fit deserves — ` +
    `finding the person is the cheapest way to move them up.`,
  );
}
