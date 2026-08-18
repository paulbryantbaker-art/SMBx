#!/usr/bin/env node
/**
 * market-data.mjs — cut federal market files down to a geography and a trade.
 *
 * Plain node, zero dependencies, no network, no tsx. Same reasoning as
 * engagements.mjs: the checks and cuts that matter most have to work in a
 * degraded environment, and a tool that needs a toolchain is not a tool.
 *
 * WHAT THIS IS NOT. It is not a method. `RESEARCH.md` is the method file and it
 * is the only one. This script does the arithmetic that was done by hand for
 * Dallas–Fort Worth on 2026-08-01, so the next metro and the next trade cost
 * minutes instead of a session. What to gather, when to stop, and what a figure
 * means are still RESEARCH.md's job.
 *
 * THE FILES IT READS — both public downloads, neither needs an API key.
 *
 *   County Business Patterns, Complete County File
 *     www2.census.gov/programs-surveys/cbp/datasets/<yy>/cbp<yy>co.zip
 *     Establishments, employment, payroll and the employment-size distribution,
 *     by county and NAICS. This is the only source that bands a market.
 *
 *   Economic Census, Construction: Value of Business Done for Kind-of-Business
 *     www2.census.gov/programs-surveys/economic-census/data/2022/sector23/EC2223KOB.zip
 *     Receipts by kind-of-business. State level only — construction is one of
 *     four sectors the Economic Census does not publish below state. That is a
 *     gap in the federal statistical system, not in the research, and every
 *     metro revenue figure for these trades is therefore derived.
 *
 * USAGE
 *
 *   node market-data.mjs bands --cbp <cbp##co.txt> --state 48 \
 *        --counties 085,113,121,139,231,251,257,367,397,439,497 \
 *        --naics 238220 --label "Dallas–Fort Worth"
 *
 *   node market-data.mjs kob --kob <EC2223KOB.dat> --state 48 --naics 238220
 *
 *   node market-data.mjs allocate --cbp <file> --kob <file> --state 48 \
 *        --counties <list> --naics 238220 --label "DFW"
 *
 * `allocate` prints the derived metro receipts three ways and refuses to pick
 * one, because the spread between them IS the size of the assumption. Carry the
 * payroll basis and state the range — see the citation law in CLAUDE.md.
 *
 * Add --json for machine-readable output.
 */

import { readFileSync, existsSync } from 'node:fs';

/* ── argument handling ─────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const cmd = argv[0];
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 || i === argv.length - 1 ? fallback : argv[i + 1];
};
const flag = (name) => argv.includes(`--${name}`);

const die = (msg) => { console.error(`\n  ✗ ${msg}\n`); process.exit(2); };

const readOrDie = (path, what) => {
  if (!path) die(`no ${what} given. Pass --${what} <path>.`);
  if (!existsSync(path)) die(`${what} not found at ${path}`);
  return readFileSync(path, 'utf8');
};

/* ── CBP: the size bands ───────────────────────────────────────────────── */

// The county file is quoted CSV with a header. Size-class columns changed name
// between vintages ("n1_4" in older years, "n<5" from 2022), so the header is
// read rather than assumed — a positional parser breaks silently on a new file.
const SIZE_LABELS = [
  ['n<5', 'n1_4', '<5'],
  ['n5_9', '5-9'],
  ['n10_19', '10-19'],
  ['n20_49', '20-49'],
  ['n50_99', '50-99'],
  ['n100_249', '100-249'],
  ['n250_499', '250-499'],
  ['n500_999', '500-999'],
  ['n1000', '1000+'],
];

function parseCbp(text, state, counties, naics) {
  const lines = text.split('\n');
  const head = lines[0].split(',').map((s) => s.replace(/"/g, '').trim());
  const col = (names) => {
    for (const n of names) { const i = head.indexOf(n); if (i !== -1) return i; }
    return -1;
  };
  const iState = col(['fipstate']), iCty = col(['fipscty']), iNaics = col(['naics']);
  const iEst = col(['est']), iEmp = col(['emp']), iAp = col(['ap']);
  if (iState < 0 || iCty < 0 || iNaics < 0 || iEst < 0) {
    die('this does not look like a CBP Complete County File — expected fipstate, fipscty, naics, est in the header.');
  }
  const bands = SIZE_LABELS.map((names) => ({
    label: names[names.length - 1],
    idx: col(names.slice(0, -1)),
  }));

  const want = new Set(counties);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const f = lines[i].split(',').map((s) => s.replace(/"/g, '').trim());
    if (f[iState] !== state) continue;
    if (f[iNaics] !== naics) continue;
    if (want.size && !want.has(f[iCty])) continue;
    rows.push({
      county: f[iCty],
      est: +f[iEst] || 0,
      emp: +f[iEmp] || 0,
      ap: +f[iAp] || 0,
      bands: bands.map((b) => (b.idx < 0 ? 'N' : f[b.idx])),
    });
  }
  return { rows, bandLabels: bands.map((b) => b.label) };
}

function bandsCmd() {
  const state = arg('state') || die('pass --state, e.g. --state 48');
  const naics = arg('naics') || die('pass --naics, e.g. --naics 238220');
  const counties = (arg('counties') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const label = arg('label') || (counties.length ? `${counties.length} counties` : `state ${state}`);
  const { rows, bandLabels } = parseCbp(readOrDie(arg('cbp'), 'cbp'), state, counties, naics);

  if (!rows.length) die(`no rows for state ${state}, NAICS ${naics}${counties.length ? `, counties ${counties.join(',')}` : ''}. Check the NAICS code is published at this level — CBP uses 6 characters exactly, e.g. 238220 not 2382.`);

  const missing = counties.filter((c) => !rows.some((r) => r.county === c));

  const tot = { est: 0, emp: 0, ap: 0 };
  const bandTot = bandLabels.map(() => 0);
  const bandSup = bandLabels.map(() => 0);
  for (const r of rows) {
    tot.est += r.est; tot.emp += r.emp; tot.ap += r.ap;
    r.bands.forEach((v, i) => { if (v === 'N' || v === '') bandSup[i]++; else bandTot[i] += +v || 0; });
  }
  const named = bandTot.reduce((a, b) => a + b, 0);

  const out = {
    label, state, naics, counties: rows.length, countiesMissing: missing,
    establishments: tot.est, employment: tot.emp, annualPayroll_thousands: tot.ap,
    bands: Object.fromEntries(bandLabels.map((l, i) => [l, bandTot[i]])),
    bandsSuppressedCells: Object.fromEntries(bandLabels.map((l, i) => [l, bandSup[i]])),
    establishmentsInSuppressedCells: tot.est - named,
    avgEmployeesPerEstablishment: tot.est ? +(tot.emp / tot.est).toFixed(1) : null,
    avgPayrollPerEmployee: tot.emp ? Math.round((tot.ap * 1000) / tot.emp) : null,
  };
  if (flag('json')) { console.log(JSON.stringify(out, null, 2)); return; }

  const $ = (n) => n.toLocaleString('en-US');
  console.log(`\n  ${label} · NAICS ${naics} · state ${state} · ${rows.length} county row(s)\n`);
  console.log(`  establishments        ${$(tot.est)}`);
  console.log(`  employment            ${$(tot.emp)}`);
  console.log(`  annual payroll        $${(tot.ap / 1e6).toFixed(3)}B  ($${$(tot.ap)}k)`);
  console.log(`  avg employees/estab   ${out.avgEmployeesPerEstablishment}`);
  console.log(`  avg payroll/employee  $${$(out.avgPayrollPerEmployee)}`);
  console.log(`\n  employment size distribution`);
  let cum = 0;
  bandLabels.forEach((l, i) => {
    cum += bandTot[i];
    const pct = tot.est ? ((bandTot[i] / tot.est) * 100).toFixed(1) : '0.0';
    const sup = bandSup[i] ? `  (${bandSup[i]} suppressed cell${bandSup[i] > 1 ? 's' : ''})` : '';
    console.log(`    ${l.padEnd(9)} ${String(bandTot[i]).padStart(6)}  ${pct.padStart(5)}%${sup}`);
  });
  if (out.establishmentsInSuppressedCells > 0) {
    console.log(`\n  ! ${out.establishmentsInSuppressedCells} establishment(s) sit inside N cells and are not in any band above.`);
    console.log(`    Census glossary: N = "Not available or not comparable" — a withholding symbol, not a zero.`);
    console.log(`    Never total the bands and call it the market. (Verified against the CBP glossary 2026-08-03.)`);
  }
  if (missing.length) {
    console.log(`\n  ! no CBP row for county code(s): ${missing.join(', ')}`);
    console.log(`    Either the county has no establishments in this NAICS, or the code is wrong. Check before treating it as zero.`);
  }
  console.log();
}

/* ── Economic Census KOB: the trade split ──────────────────────────────── */

function kobCmd() {
  const state = arg('state');
  const naics = arg('naics') || die('pass --naics, e.g. --naics 238220');
  const text = readOrDie(arg('kob'), 'kob');
  const lines = text.split('\n');
  const head = lines[0].replace(/^#/, '').split('|').map((s) => s.trim());
  const iSt = head.indexOf('ST'), iGeo = head.indexOf('GEO_LABEL'),
    iNaics = head.indexOf('NAICS2022'), iKb = head.indexOf('CONKB'),
    iKbL = head.indexOf('CONKB_LABEL'), iRcp = head.indexOf('RCPTOT');
  if (iNaics < 0 || iRcp < 0) die('this does not look like an EC22 KOB file — expected NAICS2022 and RCPTOT in the header.');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const f = lines[i].split('|');
    if (f[iNaics] !== naics) continue;
    if (state && f[iSt] !== state) continue;
    if (!state && f[iSt] !== '00') continue;
    rows.push({ kb: f[iKb], label: f[iKbL], geo: f[iGeo], rcp: +f[iRcp] || 0 });
  }
  if (!rows.length) die(`no rows for NAICS ${naics}${state ? `, state ${state}` : ' at national level'}.`);

  const total = rows.find((r) => r.kb === '001');
  const parts = rows.filter((r) => r.kb !== '001' && r.rcp > 0).sort((a, b) => b.rcp - a.rcp);
  const out = {
    geography: rows[0].geo, naics,
    totalReceipts_thousands: total ? total.rcp : null,
    kindOfBusiness: parts.map((p) => ({
      code: p.kb, label: p.label, receipts_thousands: p.rcp,
      shareOfTotal: total ? +((p.rcp / total.rcp) * 100).toFixed(1) : null,
    })),
  };
  if (flag('json')) { console.log(JSON.stringify(out, null, 2)); return; }

  console.log(`\n  ${rows[0].geo} · NAICS ${naics} · receipts by kind of business\n`);
  if (total) console.log(`  TOTAL  $${(total.rcp / 1e6).toFixed(3)}B\n`);
  for (const p of parts.slice(0, 18)) {
    const pct = total ? ((p.rcp / total.rcp) * 100).toFixed(1) : '—';
    console.log(`    ${String(pct).padStart(5)}%  $${(p.rcp / 1e6).toFixed(3).padStart(8)}B  ${p.label.slice(0, 62)}`);
  }
  console.log(`\n  Kind-of-business detail is the ONLY published split of this code.`);
  console.log(`  It is what separates HVAC from plumbing inside 238220 without an assumption.\n`);
}

/* ── allocate: the derived metro dollar figure ─────────────────────────── */

function allocateCmd() {
  const state = arg('state') || die('pass --state');
  const naics = arg('naics') || die('pass --naics');
  const counties = (arg('counties') || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!counties.length) die('pass --counties for the metro, or use `bands` for a whole state.');
  const label = arg('label') || 'metro';
  const cbpText = readOrDie(arg('cbp'), 'cbp');

  const metro = parseCbp(cbpText, state, counties, naics).rows;
  const stateRows = parseCbp(cbpText, state, [], naics).rows;
  const sum = (rs, k) => rs.reduce((a, r) => a + r[k], 0);
  const m = { est: sum(metro, 'est'), emp: sum(metro, 'emp'), ap: sum(metro, 'ap') };
  const s = { est: sum(stateRows, 'est'), emp: sum(stateRows, 'emp'), ap: sum(stateRows, 'ap') };

  const kobText = readOrDie(arg('kob'), 'kob');
  const kl = kobText.split('\n');
  const kh = kl[0].replace(/^#/, '').split('|').map((x) => x.trim());
  const kSt = kh.indexOf('ST'), kN = kh.indexOf('NAICS2022'), kKb = kh.indexOf('CONKB'), kR = kh.indexOf('RCPTOT');
  let stateReceipts = null;
  for (let i = 1; i < kl.length; i++) {
    const f = kl[i].split('|');
    if (f[kN] === naics && f[kSt] === state && f[kKb] === '001') { stateReceipts = +f[kR] || 0; break; }
  }
  if (stateReceipts === null) die(`no state-level receipts row for NAICS ${naics}, state ${state} in the KOB file.`);

  const basis = [
    ['annual payroll', m.ap / s.ap],
    ['employment', m.emp / s.emp],
    ['establishment count', m.est / s.est],
  ].map(([name, share]) => ({ name, share, receipts: share * stateReceipts }));

  if (flag('json')) {
    console.log(JSON.stringify({ label, naics, stateReceipts_thousands: stateReceipts, metro: m, state: s, allocations: basis }, null, 2));
    return;
  }
  console.log(`\n  ${label} · NAICS ${naics} — DERIVED receipts, three bases\n`);
  console.log(`  state receipts (measured, Economic Census)   $${(stateReceipts / 1e6).toFixed(3)}B\n`);
  for (const b of basis) {
    console.log(`    ${b.name.padEnd(21)} share ${(b.share * 100).toFixed(2).padStart(6)}%   →  $${(b.receipts / 1e6).toFixed(3)}B`);
  }
  const lo = Math.min(...basis.map((b) => b.receipts)), hi = Math.max(...basis.map((b) => b.receipts));
  console.log(`\n  range $${(lo / 1e6).toFixed(3)}B – $${(hi / 1e6).toFixed(3)}B   spread ${(((hi - lo) / lo) * 100).toFixed(0)}%`);
  console.log(`\n  This script does not pick one, and neither should a document without saying why.`);
  console.log(`  The spread IS the size of the assumption. Carry the payroll basis — establishment`);
  console.log(`  count weights a one-truck shop equally with a 200-person contractor — state the`);
  console.log(`  range, and register it under ## Derivations. Conflicting values keep BOTH ends`);
  console.log(`  and never an invented midpoint (citation law, CLAUDE.md).\n`);
  console.log(`  No metro receipts figure is published for construction. Anyone quoting one`);
  console.log(`  derived it, whether or not they say so.\n`);
}

/* ── dispatch ──────────────────────────────────────────────────────────── */

const USAGE = `
  market-data.mjs — cut federal market files to a geography and a trade

    bands     --cbp <cbp##co.txt> --state <fips> [--counties a,b,c] --naics <6-digit> [--label ..] [--json]
              establishments, employment, payroll and the employment-size distribution

    kob       --kob <EC22..KOB.dat> [--state <fips>] --naics <6-digit> [--json]
              receipts by kind of business. State level only — construction is not
              published below state, in any year

    allocate  --cbp <..> --kob <..> --state <fips> --counties a,b,c --naics <..> [--label ..] [--json]
              the DERIVED metro receipts figure, three bases, no midpoint

  Both source files are public downloads and need no API key. The key gates the
  API only — which is worth knowing, because a session can lose a day to it.

  RESEARCH.md is the method. This is the arithmetic.
`;

if (cmd === 'bands') bandsCmd();
else if (cmd === 'kob') kobCmd();
else if (cmd === 'allocate') allocateCmd();
else { console.log(USAGE); process.exit(cmd ? 2 : 0); }
