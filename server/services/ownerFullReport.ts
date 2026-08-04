/**
 * server/services/ownerFullReport.ts — the FULL evaluation's renderer
 * (SELLER_EVALUATION_PLAN.md §P2, phase 4). The 16-page grammar from the
 * Acme sample build — SAMPLE-VALUATION-SPEC.md + build-acme-sample.mts are
 * the ground truth: same Letter pages, same dark bookends compositing the
 * boardroom texture UNDER an 0.84 jade glaze (never `background: color
 * url(texture)` — the opaque image wins and the page renders black), same
 * crumb/footer/bridge-table/range-card CSS — applied to a real owner's
 * computed FullEvaluationReport instead of the tuned fiction.
 *
 * THE LINE furniture is structural here, not editorial:
 *  • RANGE, NEVER A NUMBER — every valuation figure prints as a low–high
 *    pair off the published band. The DCF leg prints as a consistency
 *    CHECK against that range, labeled so, never as its own valuation.
 *  • Every threshold cites its source where it appears: the band carries
 *    laneBenchmarks' source string verbatim, size tiers carry
 *    SIZE_TIER_SOURCE, readiness carries the assessment attribution line,
 *    the financing test carries SBA SOP 50 10 8. The buyer's-ratios table
 *    has NO industry-average column because none is citable — the page
 *    says exactly that.
 *  • Tax is NAMED, never estimated (the CPA models it before anything is
 *    signed); the owned building is a SEPARATE ASSET whose number a
 *    licensed appraiser sets — the bifurcation leg deliberately ran
 *    without `cap_rate`, and the proceeds page says that plainly.
 *  • The disclaimer travels: cover, executive summary, the band page, the
 *    proceeds walk, the closer.
 *
 * DRAFT MODE: a page whose inputs aren't in is never faked — it renders an
 * honest gap card naming the exact open questions (ask + where to find it,
 * parked flagged), sourced from the report's own sectionStatus — the same
 * gate the chat reads. Every page carries the DRAFT strip with the ledger
 * count, and the page count never changes, so page references hold.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontFaceCss } from './fontEmbeds.js';
import { LEDGER, REPORT, rgba } from '../../house/tokens.js';
import { SIZE_TIERS, SIZE_TIER_SOURCE } from '../../house/laneBenchmarks.js';
import {
  ESCROW_PCT,
  type BuyerRatio,
  type FullBridgeLine,
  type FullEvaluationReport,
  type NarrowedBand,
  type SectionStatus,
} from '../../house/fullEvaluation.js';
import type { EvaluationResult, ReadinessDriver } from '../../house/evaluate.js';
import type { V19ModelExecution } from './v19ModelRuntime.js';
import { SBA_SOP_50_10_8 } from '../constants/v19Regulatory.js';

/** The four DEFINITIVE legs the full evaluation runs, unpersisted — null when
 *  the leg's owner inputs weren't sufficient to attempt it. The financing
 *  ceiling (dscrStress + lboSba) renders on the buyer-types page, the
 *  income-approach cross-check (dcfTwoStage) on the band page, and the
 *  building-as-separate-asset read (reBifurcation — deliberately missing
 *  `cap_rate`, the appraisal input the practice never supplies) on the
 *  proceeds walk. */
export interface FullEvalModelRuns {
  dscrStress: V19ModelExecution | null;
  lboSba: V19ModelExecution | null;
  dcfTwoStage: V19ModelExecution | null;
  reBifurcation: V19ModelExecution | null;
}

export interface FullReportMeta {
  name?: string;
  mode: 'draft' | 'final';
  /** THE NARROWED BAND (§P2): the published tier narrowed by the owner's
   *  verified drivers + the financing arithmetic, every step cited — the
   *  band page's hero. null when the valuation leg didn't run (unsupported
   *  lane, non-positive basis, inputs not in). */
  narrowed?: NarrowedBand | null;
}

/* ── brand assets, inlined like the sample build (base64, no asset server) ── */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const asset = (rel: string, mime: string): string => {
  try {
    return `data:${mime};base64,${readFileSync(path.resolve(__dirname, '../../client/public', rel)).toString('base64')}`;
  } catch { return ''; }
};
const LOGO_W = asset('logo-green-x-dark.png', 'image/png');
const LOGO_G = asset('logo-green-x.png', 'image/png');
const TEXTURE = asset('textures/blackbleed.webp', 'image/webp');
const HEAD = asset('founder-portrait.jpg', 'image/jpeg');

/* ── palette + standing sentences ────────────────────────────────────────── */

const INK = LEDGER.ink;
const GREEN = LEDGER.green;
const BRASS = LEDGER.brass;
const HONEY = LEDGER.honey;
const BONE = LEDGER.bone;
const IVORY = LEDGER.ivory;
const HAIR = LEDGER.hair;
const MUTED = LEDGER.muted;
const BODY = REPORT.body;
/** The Letter-report bookend law (SAMPLE-VALUATION-SPEC §1): texture under an
 *  0.84 jade glaze. Deliberately NOT tokens.BLOCK_GLAZE (0.72) — that value
 *  was tuned for the carousel cover's double-veil; the sample locked 0.84. */
const GLAZE = rgba(LEDGER.dark, 0.84);
const FIX_RED = '#B4552D'; // the P1 report's fix-before-sale color (ownerFunnel.ts)

const ATTRIBUTION =
  'Readiness thresholds carried from smbX published assessments: "Home Services — State of the Market" (Aug 2026) ' +
  'and "Commercial MEP Buy-Side Assessment" (Aug 2026).';

/* ── formatting ──────────────────────────────────────────────────────────── */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const signedMoney = (n: number) =>
  n < 0 ? '−$' + Math.abs(Math.round(n)).toLocaleString('en-US') : '+$' + Math.round(n).toLocaleString('en-US');
const compact = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1_000_000) {
    const m = Math.round(n / 100_000) / 10;
    return `$${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (a >= 10_000) return `$${Math.round(n / 1000)}K`;
  return money(n);
};
const compactRange = (lo: number, hi: number) => `${compact(lo)} – ${compact(hi)}`;
const usd = (c: unknown): number | null => (typeof c === 'number' && isFinite(c) ? Math.round(c / 100) : null);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Human names for BuyerRatio.missing keys — the table names its own gaps. */
const MISSING_NAMES: Record<string, string> = {
  arUsd: 'A/R outstanding',
  ttmRevenueUsd: 'TTM revenue',
  wipOverUnderUsd: 'the WIP over/under position',
  fundedDebtUsd: 'funded debt',
  cashUsd: 'cash on hand',
  workingCapitalUsd: 'working capital',
  backlogUsd: 'signed backlog',
  projectRevenueUsd: 'project revenue',
  employees: 'headcount',
  'normalized basis': 'the normalized basis (the bridge on page 5)',
};

const TOTAL_PAGES = 16;

const TITLES = [
  'Cover',
  'Contents & how this was built',
  'Executive summary',
  'The company & revenue lines',
  'Earnings, normalized',
  'Three-year trend',
  'The published band & size tiers',
  'Readiness — where you sit, and why',
  "The buyer's ratios",
  'What moves the number — 24 months',
  'The proceeds walk',
  'Anatomy of an offer',
  'Buyer types & the financing test',
  'Diligence preview',
  'The sequence',
  'For the owner',
];

/* ── the renderer ────────────────────────────────────────────────────────── */

export function renderFullReportHtml(
  report: FullEvaluationReport,
  models: FullEvalModelRuns,
  meta: FullReportMeta,
): string {
  const draft = meta.mode === 'draft';
  const q: EvaluationResult | null = report.quick && report.quick.laneSupported ? report.quick : null;
  const laneMsg = report.quick && !report.quick.laneSupported ? report.quick.message : null;
  const basisOk = !!q && q.basisUsd > 0;
  const prof = report.profile;
  const company = prof.companyName;
  const rl = report.revenueLines;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const ratioByKey = Object.fromEntries(report.ratios.map(r => [r.key, r]));
  const driverByKey: Record<string, ReadinessDriver> = q
    ? Object.fromEntries(q.readiness.drivers.map(d => [d.key, d]))
    : {};
  const statusColor = { strength: GREEN, watch: BRASS, fix: FIX_RED } as const;
  const statusWord = (s: 'strength' | 'watch' | 'fix') =>
    s === 'fix' ? 'Fix before sale' : s === 'watch' ? 'Watch' : 'Strength';

  /* ── shared fragments ── */

  const secByKey = Object.fromEntries(report.sections.map(s => [s.key, s]));

  /** The honest withheld card: names the exact open questions of the sections
   *  a page depends on. Never fakes; never errors. */
  const gapCard = (what: string, deps: string[]): string => {
    const secs = deps.map(k => secByKey[k]).filter((s): s is SectionStatus => !!s && !s.complete);
    const items = secs.flatMap(s =>
      s.missing.map(m =>
        `<li><b>${esc(m.ask)}</b><span class="gw">Find it: ${esc(m.whereToFind)}${
          m.state === 'parked' ? ' · parked on your go-get list' : ''
        }</span></li>`,
      ),
    );
    return `<div class="gap">
      <div class="gt">${what} is withheld — the inputs aren't in yet.</div>
      <p class="gp">No page of this report prints on partial inputs. Still needed:</p>
      <ul>${items.join('') || '<li><b>Finish the open sections in the chat.</b></li>'}</ul>
      <p class="gp">Answer these in the chat — parked questions ride your emailed go-get list — and this page fills in on the next build.</p>
    </div>`;
  };

  /** Honest non-gap states: unsupported lane, non-positive basis. */
  const noteCard = (text: string): string => `<div class="gap"><p class="gp" style="margin:0">${text}</p></div>`;

  const nonPositiveNote = q && !basisOk
    ? `After normalization your ${q.basisType} comes out at <b>${money(q.basisUsd)}</b> — at or below zero. ` +
      `Multiples of earnings don't produce a meaningful range from a non-positive base, so this report won't print one: ` +
      `at this profile the conversation with a buyer is about asset value, the customer book, and the turnaround plan ` +
      `rather than an earnings multiple. The readiness drivers on page 8 are where that conversation starts.`
    : null;

  /** Route a q-dependent block: content when computable, else the honest state. */
  const needsBasis = (what: string, deps: string[], content: () => string): string => {
    if (basisOk) return content();
    if (laneMsg) return noteCard(esc(laneMsg));
    if (nonPositiveNote) return noteCard(nonPositiveNote);
    return gapCard(what, deps);
  };

  const QUICK_DEPS = ['revenue-lines', 'normalization', 'customers', 'real-estate'];

  const draftStrip = draft
    ? `<div class="dstrip">DRAFT — BUILT FROM ${report.ledger.answered} OF ${report.ledger.total} ANSWERS · WITHHELD PAGES NAME THEIR OWN GAPS</div>`
    : '';
  const draftStripDark = draft
    ? `<div class="dstrip dark-strip">DRAFT — BUILT FROM ${report.ledger.answered} OF ${report.ledger.total} ANSWERS · WITHHELD PAGES NAME THEIR OWN GAPS</div>`
    : '';

  const footLeft = 'SMBX.AI · FULL OWNER EVALUATION — CONFIDENTIAL';
  const footRight = draft
    ? 'DRAFT — GAPS NAMED'
    : esc((company || 'PREPARED FOR THE OWNER').toUpperCase().slice(0, 48));

  const lightPage = (n: number, inner: string): string => `
  <div class="pg body-pg">
    ${draftStrip}
    <div class="crumb">${LOGO_G ? `<img src="${LOGO_G}">` : '<b>smbX.ai</b>'}<div class="t">Full owner evaluation · ${n} of ${TOTAL_PAGES}</div></div>
    ${inner}
    <div class="foot"><span>${footLeft}</span><span>${footRight}</span></div>
  </div>`;

  const disc = `<div class="disc"><b>How to read this:</b> ${report.disclaimer}</div>`;

  /* ═══ P1 · COVER (dark bookend) ═══ */

  const margin = q && rl && rl.totalUsd > 0 ? Math.round((q.basisUsd / rl.totalUsd) * 1000) / 10 : null;
  const stat = (n: string, l: string) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;
  const coverStats = [
    rl
      ? stat(compact(rl.totalUsd), `Revenue${rl.serviceMixPct !== null ? ` · ${rl.serviceMixPct}% service &amp; maintenance` : ''}`)
      : stat('—', 'Revenue · pending the revenue walk'),
    basisOk
      ? stat(compact(q!.basisUsd), `Normalized ${q!.basisType}${margin !== null ? ` · ${margin}% margin` : ''}`)
      : stat('—', 'Normalized earnings · pending the bridge'),
    basisOk
      ? stat(compactRange(q!.rangeUsd.low, q!.rangeUsd.high), `Full published band · ${q!.band.low}x–${q!.band.high}x`)
      : stat('—', 'Published band · pending the walk'),
    q
      ? stat(cap(q.readiness.position), 'Readiness read · of the band')
      : stat('—', 'Readiness read · pending the drivers'),
  ].join('');

  const hero = basisOk
    ? `<div class="hero-n">${compactRange(q!.rangeUsd.marketLow, q!.rangeUsd.marketHigh)}</div>
       <div class="hero-l">WHERE THE MARKET CLEARS · ${q!.band.marketLow}x–${q!.band.marketHigh}x NORMALIZED ${q!.basisType.toUpperCase()}</div>`
    : `<div class="hero-n hero-open">In progress</div>
       <div class="hero-l">${report.ledger.answered} OF ${report.ledger.total} ANSWERS IN — THE RANGE PRINTS WHEN THE WALK COMPLETES</div>`;

  const coverPage = `
  <div class="pg dark"><div class="tex"></div><div class="glaze"></div>${draftStripDark}<div class="inner">
    ${LOGO_W ? `<img class="cv-logo" src="${LOGO_W}">` : ''}
    <div class="kicker" style="margin-top:34px">FULL OWNER EVALUATION${draft ? ' · DRAFT' : ''} · CONFIDENTIAL</div>
    <div class="h1">Full Owner<br><span class="turn">Evaluation.</span></div>
    <div class="rule"></div>
    <div class="cv-sub"><b style="color:#fff">${esc(company || 'Your company')}</b> — ${q ? esc(q.band.label) : esc(report.lane)} · prepared ${dateStr}</div>
    <div class="hero">${hero}</div>
    <div class="stats">${coverStats}</div>
    <div class="byline">
      ${HEAD ? `<img src="${HEAD}">` : ''}
      <div class="who"><b>Prepared by Paul Baker</b>smbX.ai — buy-side corporate development · ${dateStr}</div>
    </div>
    <div class="cv-note">Prepared from figures the owner provided${company ? ` for ${esc(company)}` : ''}. ${report.disclaimer}</div>
  </div></div>`;

  /* ═══ P2 · CONTENTS + METHODOLOGY ═══ */

  const toc = TITLES.map((t, i) =>
    `<div class="toc-r"><span class="toc-n">${String(i + 1).padStart(2, '0')}</span><span class="toc-t">${t}</span></div>`,
  ).join('');

  // Draft status map: incomplete sections only, one open ask each — the
  // withheld page itself names every input, this is just the map.
  const openSections = report.sections.filter(s => !s.complete);
  const walkTable = draft
    ? `<h2>Where the walk stands</h2>
       <p>${report.sections.length - openSections.length} of ${report.sections.length} sections complete ·
       ${report.ledger.answered} answered · ${report.ledger.parked} parked · ${report.ledger.open} open.</p>
       ${openSections.length ? `<table>${openSections.map(s => `
         <tr><td class="dl">${s.title}</td>
         <td class="ds" style="color:${BRASS}">${s.missing.length} to go</td>
         <td class="dn">${esc(s.missing[0].ask)}${s.missing.length > 1 ? ` · +${s.missing.length - 1} more` : ''}</td></tr>`).join('')}
       </table>` : ''}`
    : '';

  const contentsPage = lightPage(2, `
    <h2>Contents</h2>
    <div class="toc">${toc}</div>
    <h2>How this report was built — three approaches</h2>
    <p><b>The market approach leads.</b> The published multiple band for your lane — carried verbatim from the
    practice's cited assessments, source printed where the band appears — applied to earnings normalized the way a
    buyer's accountants rebuild them. The deliverable is a range, never a single number: the exact landing point is
    priced in diligence.</p>
    <p><b>The income approach is a cross-check, not a headline.</b> A two-stage DCF on a planning growth rate set
    deliberately below your achieved rate, discounted at the band's own implied yield — arithmetic on published data
    and your own figures, used on page 7 to test that the market range is internally consistent. It never prints as
    its own valuation.</p>
    <p><b>The asset approach is named, not used.</b> It prices machinery and property, not the earnings a going
    concern produces; it matters when normalized earnings are non-positive or the deal is really a real-estate
    transaction. Owned real estate is a separate asset in every case — a licensed appraiser sets that number, never
    this report.</p>
    <p class="src">One more test runs underneath the range: the SBA-shaped financing arithmetic on page 13 — a buyer
    cannot pay what the earnings cannot service, and that is arithmetic, not opinion.</p>
    ${walkTable}
  `);

  /* ═══ P3 · EXECUTIVE SUMMARY ═══ */

  const svcLine = rl?.lines.find(l => l.key === 'service');
  const projLine = rl?.lines.find(l => l.key === 'project');
  const profileBits = [
    prof.yearFounded !== null ? `founded ${prof.yearFounded}` : null,
    prof.employees !== null ? `${prof.employees} employees` : null,
    prof.statesServed !== null ? `working in ${prof.statesServed} state${prof.statesServed === 1 ? '' : 's'}` : null,
    prof.suretyLine ? `surety ${esc(prof.suretyLine)}` : null,
  ].filter(Boolean).join(' · ');

  const timelineLine =
    prof.timeline === 'ready-12mo'
      ? 'You told us you are ready inside 12 months — the sequence on page 15 is ordered for that clock.'
      : prof.timeline === '1-3-years'
        ? 'You told us 1–3 years — the right window to work the levers on page 10 before a process starts.'
        : prof.timeline === 'exploring'
          ? 'You told us you are just curious — this report stays current: log back in, update a number, and it rebuilds.'
          : '';

  const strengths = q ? q.readiness.drivers.filter(d => d.status === 'strength').map(d => d.label) : [];
  const fixes = q ? q.readiness.drivers.filter(d => d.status === 'fix').map(d => d.label) : [];

  const execRange = basisOk
    ? `<div class="range">
        <div class="rr"><div class="n">${money(q!.rangeUsd.low)} – ${money(q!.rangeUsd.high)}</div><div class="l">Full published band · ${q!.band.low}x–${q!.band.high}x</div></div>
        <div class="rr hero-rr"><div class="n">${money(q!.rangeUsd.marketLow)} – ${money(q!.rangeUsd.marketHigh)}</div><div class="l">Where the market clears · ${q!.band.marketLow}x–${q!.band.marketHigh}x</div></div>
      </div>
      <div class="src">Band: ${q!.band.source} — ${q!.band.scopeNote}.</div>`
    : laneMsg ? noteCard(esc(laneMsg)) : nonPositiveNote ? noteCard(nonPositiveNote) : gapCard('The valuation range', QUICK_DEPS);

  const execSummaryPage = lightPage(3, `
    <h2>Executive summary</h2>
    <p><b>${esc(company || 'This business')}</b>${profileBits ? ` — ${profileBits}` : ''}.
    ${rl && svcLine && projLine
      ? `Revenue of <b>${money(rl.totalUsd)}</b> splits ${money(svcLine.revenueUsd)} service &amp; maintenance` +
        `${rl.serviceMixPct !== null ? ` (${rl.serviceMixPct}%)` : ''} against ${money(projLine.revenueUsd)} construction and project work.`
      : 'The revenue-by-line walk is on page 4.'}
    ${basisOk ? ` Normalized ${q!.basisType} comes to <b>${money(q!.basisUsd)}</b> — page 5 shows every adjustment in the walk.` : ''}</p>
    ${execRange}
    ${q ? `<p>On the readiness drivers buyers actually price, this profile reads in the <b>${q.readiness.position}</b> of that band.
      ${strengths.length ? `${strengths.join(', ')} carry the read.` : ''}
      ${fixes.length
        ? ` ${fixes.join(', ')} ${fixes.length === 1 ? 'is' : 'are'} the work list — page 10 shows the arithmetic of moving ${fixes.length === 1 ? 'it' : 'them'}.`
        : ' No driver reads fix-before-sale.'}</p>` : ''}
    ${timelineLine ? `<p>${timelineLine}</p>` : ''}
    ${report.gaps.length
      ? `<h2>What we don't know yet</h2><ul class="plain">${report.gaps.slice(0, 8)
          // Each gap sentence carries its full go-get list; here only the
          // headline prints — the withheld page itself names the inputs.
          .map(g => `<li>${esc(g.split(' — still needed:')[0])}${g.includes(' — still needed:') ? ' — its page names the inputs.' : ''}</li>`).join('')}
        ${report.gaps.length > 8 ? `<li>+${report.gaps.length - 8} more — each named on its own page.</li>` : ''}</ul>`
      : ''}
    ${disc}
  `);

  /* ═══ P4 · THE COMPANY + REVENUE LINES ═══ */

  const factsCards = [
    rl && rl.serviceMixPct !== null ? { n: `${rl.serviceMixPct}%`, l: 'Service &amp; maintenance mix' } : null,
    prof.employees !== null ? { n: String(prof.employees), l: 'Employees, field and office' } : null,
    prof.statesServed !== null ? { n: String(prof.statesServed), l: 'States served' } : null,
    prof.suretyLine ? { n: compact(Number(prof.suretyLine.match(/\$([\d,]+)/)?.[1]?.replace(/,/g, '') || 0)), l: 'Surety · single-job limit' } : null,
  ].filter((c): c is { n: string; l: string } => c !== null)
    .map(c => `<div class="fact"><div class="n">${c.n}</div><div class="l">${c.l}</div></div>`).join('');

  const revenueTable = rl
    ? `<table>
        <tr class="thead"><td class="bl"></td><td class="bn">Revenue</td><td class="bn" style="width:90px">Gross margin</td><td class="bn" style="width:110px">Gross profit</td></tr>
        ${rl.lines.map(l => `
          <tr><td class="bl"><b>${l.label}</b></td>
          <td class="bn">${money(l.revenueUsd)}</td>
          <td class="bn" style="width:90px">${l.gmPct !== null ? l.gmPct + '%' : '—'}</td>
          <td class="bn" style="width:110px">${l.grossProfitUsd !== null ? money(l.grossProfitUsd) : '—'}</td></tr>`).join('')}
        <tr class="tot"><td class="bl">Total revenue</td><td class="bn">${money(rl.totalUsd)}</td>
        <td class="bn" style="width:90px">${rl.blendedGmPct !== null ? rl.blendedGmPct + '%' : ''}</td><td class="bn" style="width:110px"></td></tr>
      </table>
      ${rl.blendedGmPct !== null ? `<div class="src">Blended gross margin across the lines where a margin landed. Buyers price the two books differently — the published spread between a project-led book and a service-led book is measured in full turns of the multiple.</div>` : ''}`
    : gapCard('The revenue-by-line table', ['revenue-lines']);

  const companyPage = lightPage(4, `
    <h2>The company</h2>
    <p>${esc(company || 'The business')}${prof.yearFounded !== null ? `, founded ${prof.yearFounded},` : ''} operates in the
    ${q ? esc(q.band.label.toLowerCase()) : esc(report.lane)} trade${prof.statesServed !== null ? ` across ${prof.statesServed} state${prof.statesServed === 1 ? '' : 's'}` : ''}${prof.employees !== null ? ` with ${prof.employees} people on payroll` : ''}.
    ${prof.suretyLine ? `The surety program runs ${esc(prof.suretyLine)} — bonding capacity a buyer underwrites as part of the platform.` : ''}
    Everything on this page is your own figures, printed back — the buyer's first read is whether they reconcile.</p>
    ${factsCards ? `<div class="facts">${factsCards}</div>` : ''}
    <h2>Revenue by line</h2>
    ${revenueTable}
  `);

  /* ═══ P5 · THE BRIDGE ═══ */

  const bridgeRow = (l: FullBridgeLine): string => {
    const label = `<b>${esc(l.label)}</b>${l.note ? `<span class="nt">${esc(l.note)}</span>` : ''}`;
    if (l.kind === 'start') return `<tr><td class="bl">${label}</td><td class="bn">${money(l.amountUsd)}</td></tr>`;
    if (l.kind === 'subtotal') return `<tr class="sub"><td class="bl">${label}</td><td class="bn">${money(l.amountUsd)}</td></tr>`;
    if (l.kind === 'total') return `<tr class="tot"><td class="bl">${label}</td><td class="bn">${money(l.amountUsd)}</td></tr>`;
    return `<tr><td class="bl">${esc(l.label)}</td><td class="bn">${signedMoney(l.amountUsd)}</td></tr>`;
  };

  const bridgePage = lightPage(5, `
    <h2>Earnings, normalized the way a buyer will</h2>
    <p>Buyers don't price the tax return — their accountants rebuild it, adding back what won't recur under new
    ownership and restating what isn't at market. This is that walk, run on the figures you provided:</p>
    ${report.bridge
      ? `<table>${report.bridge.map(bridgeRow).join('')}</table>
         ${q?.realEstateNote ? `<div class="src">The occupancy line restates rent to market because you own the property — the full treatment (and what it means for proceeds) is on page 11.</div>` : ''}`
      : laneMsg ? noteCard(esc(laneMsg)) : gapCard('The normalized-earnings bridge', QUICK_DEPS)}
  `);

  /* ═══ P6 · THREE-YEAR TREND ═══ */

  const trendTable = report.trend
    ? `<table>
        <tr class="thead"><td class="bl"></td><td class="bn">Revenue</td><td class="bn" style="width:78px">Growth</td><td class="bn" style="width:90px">Service mix</td><td class="bn" style="width:110px">EBITDA</td><td class="bn" style="width:78px">Margin</td></tr>
        ${report.trend.rows.map(r => `
          <tr><td class="bl"><b>${r.period === 'TTM' ? 'Trailing 12 months' : r.period === 'FY-1' ? 'Last fiscal year' : 'Two years back'}</b></td>
          <td class="bn">${money(r.revenueUsd)}</td>
          <td class="bn" style="width:78px">${r.growthPct !== null ? (r.growthPct >= 0 ? '+' : '') + r.growthPct + '%' : '—'}</td>
          <td class="bn" style="width:90px">${r.serviceMixPct !== null ? r.serviceMixPct + '%' : '—'}</td>
          <td class="bn" style="width:110px">${r.ebitdaUsd !== null ? money(r.ebitdaUsd) : '—'}</td>
          <td class="bn" style="width:78px">${r.ebitdaMarginPct !== null ? r.ebitdaMarginPct + '%' : '—'}</td></tr>`).join('')}
      </table>
      ${report.trend.achievedCagrPct !== null
        ? `<p style="margin-top:10px">Achieved two-year compound growth: <b>${report.trend.achievedCagrPct}%</b> a year.
           The projection on page 10 deliberately plans below this rate.</p>`
        : ''}
      <div class="src">${esc(report.trend.note)}</div>`
    : gapCard('The three-year trend page', ['trend', 'revenue-lines']);

  const trendPage = lightPage(6, `
    <h2>Three-year trend</h2>
    <p>A buyer reads three years before believing one. Trajectory is the context every other page sits in — growth
    explains the backlog, the mix shift explains the margin, and diligence tests whether the trend survives the
    handoff.</p>
    ${trendTable}
  `);

  /* ═══ P7 · THE BAND + SIZE TIERS ═══ */

  const dcf = models.dcfTwoStage;
  const dcfEv = dcf && dcf.status === 'complete' ? usd(dcf.outputs.enterprise_value_cents) : null;
  const dcfBlock = basisOk && dcfEv !== null
    ? (() => {
        const g = report.whatMoves?.growthPctUsed ?? 0;
        const impliedYield = (100 / q!.band.marketLow).toFixed(1);
        const where =
          dcfEv < q!.rangeUsd.low
            ? 'below the published band applied to your earnings — expected from arithmetic that assumes growth stops entirely after year five; it tests the floor of the band, not the ceiling'
            : dcfEv > q!.rangeUsd.high
              ? 'above the published band applied to your earnings — the market range is the more conservative read, and this report keeps it'
              : 'inside the published band applied to your earnings';
        return `<h2 style="margin:16px 0 6px">The income-approach cross-check</h2>
        <p>Five years of the normalized basis grown at the planning rate (${g}%), nothing perpetual beyond a
        zero-growth terminal, discounted at the band's own implied yield (1 ÷ ${q!.band.marketLow}x ≈ ${impliedYield}%):
        the arithmetic lands at roughly <b>${compact(dcfEv)}</b> — ${where}. A consistency check on published data and your own
        figures, never a valuation of its own.</p>`;
      })()
    : '';

  const tierTable = q
    ? `<h2 style="margin:16px 0 6px">Size context — where scale itself prices</h2>
      <table>
        ${SIZE_TIERS.map(t => {
          const hot = t.label === q.sizeTier.label;
          return `<tr${hot ? ' class="hot"' : ''}><td class="bl">${hot ? '<b>' : ''}${t.label}${hot ? ' — you are here</b>' : ''}</td>
          <td class="bn" style="width:90px">${t.basis}</td><td class="bn" style="width:90px">${t.low}–${t.high}x</td></tr>`;
        }).join('')}
      </table>
      <div class="src">${SIZE_TIER_SOURCE}.</div>`
    : '';

  /* THE NARROWED BAND (§P2, Paul: "we should be able to narrow it down") —
   * the band page's hero. The published tier is the STARTING band; every
   * narrowing step is attributed to a published threshold, and parked or
   * unanswered drivers say exactly what width they leave in. Draft mode
   * renders the same block: the wide band plus what completing would narrow. */
  const fmtX = (n: number) => `${n.toFixed(1)}x`;
  const nb = meta.narrowed ?? null;
  // Every step is attributed; identical sources collapse into one numbered
  // footnote so the table stays on the page without dropping a citation.
  const nbSources: string[] = nb ? [...new Set(nb.steps.map(s => s.source))] : [];
  const srcMark = (s: string) => nbSources.length > 1 ? ` <b>[${nbSources.indexOf(s) + 1}]</b>` : '';
  const narrowedBlock = nb
    ? `
      <div class="nb">
        <div class="nb-n">${fmtX(nb.lowX)} – ${fmtX(nb.highX)}</div>
        <div class="nb-d">The market clears for a business with <b>your profile</b> at
          <b>${fmtX(nb.lowX)}–${fmtX(nb.highX)}</b> — <b>${compactRange(nb.lowUsd, nb.highUsd)}</b>.</div>
        <div class="nb-l">THE NARROWED BAND · YOUR VERIFIED DRIVERS ON THE PUBLISHED TIER · STILL A RANGE, NEVER A NUMBER</div>
      </div>
      ${nb.steps.length ? `
      <table class="nbt">
        <tr class="thead"><td class="ds" style="width:56px">Moved</td><td class="bn" style="width:100px">Band</td><td class="dn">The evidence — and the published threshold it clears</td></tr>
        ${nb.steps.map(s => `
          <tr><td class="ds" style="width:56px">${s.moved === 'floor' ? 'Floor' : 'Ceiling'}</td>
          <td class="bn" style="width:100px">${s.fromX === s.toX ? `holds ${fmtX(s.toX)}` : `${fmtX(s.fromX)} → ${fmtX(s.toX)}`}</td>
          <td class="dn">${esc(s.label)}${srcMark(s.source)}</td></tr>`).join('')}
      </table>
      <div class="src">${nbSources.map((s, i) => `${nbSources.length > 1 ? `[${i + 1}] ` : 'Source: '}${esc(s)}.`).join(' ')}</div>`
      : `<p style="margin-top:10px">No driver is verified yet, so the band still runs the full published tier —
         each item below names the width finishing the walk takes out.</p>`}
      <div class="src">Starting band: the published tier, ${nb.band.marketLow}x–${nb.band.marketHigh}x. Where a
      published figure is a range, the conservative endpoint moves the band — evidence narrows it, never opinion.</div>
      ${nb.widthNotes.length ? `
      <h2 style="margin:16px 0 6px">${draft || report.ledger.answered < report.ledger.total ? 'What completing the walk would narrow' : 'Width still in the band, and why'}</h2>
      <ul class="plain">${nb.widthNotes.map(w => `<li>${esc(w)}</li>`).join('')}</ul>`
      : ''}`
    : '';

  const bandPage = lightPage(7, `
    <h2>What buyers are paying in your lane</h2>
    ${nb
      // The narrowed band is self-contained (band + basis travel inside it),
      // so the hero renders even in a draft whose readiness legs haven't run
      // — the wide band plus what completing the walk would narrow.
      ? `
      <p>${nb.band.label} businesses in the published data trade between <b>${nb.band.low}x and ${nb.band.high}x</b>,
      with the market's middle at <b>${nb.band.marketLow}x–${nb.band.marketHigh}x</b> (${nb.band.basisNote}).
      Applied to your normalized ${nb.basisType} of ${money(nb.basisUsd)}:</p>
      ${narrowedBlock}
      <div class="src">Band: ${nb.band.source} — ${nb.band.scopeNote}. A range, never a single number: the exact landing
      point is priced in diligence.</div>
      ${basisOk ? dcfBlock : ''}
      ${basisOk ? tierTable : ''}`
      : needsBasis('The published band', QUICK_DEPS, () => `
      <p>${q!.band.label} businesses in the published data trade between <b>${q!.band.low}x and ${q!.band.high}x</b>,
      with the market's middle at <b>${q!.band.marketLow}x–${q!.band.marketHigh}x</b> (${q!.band.basisNote}).
      Applied to your normalized ${q!.basisType} of ${money(q!.basisUsd)}:</p>
      <div class="range">
        <div class="rr"><div class="n">${money(q!.rangeUsd.low)} – ${money(q!.rangeUsd.high)}</div><div class="l">Full published band · ${q!.band.low}x–${q!.band.high}x</div></div>
        <div class="rr hero-rr"><div class="n">${money(q!.rangeUsd.marketLow)} – ${money(q!.rangeUsd.marketHigh)}</div><div class="l">Where the market clears · ${q!.band.marketLow}x–${q!.band.marketHigh}x</div></div>
      </div>
      <div class="src">Band: ${q!.band.source} — ${q!.band.scopeNote}. A range, never a single number: the exact landing
      point is priced in diligence.</div>
      ${dcfBlock}
      ${tierTable}
    `)}
    ${disc}
  `);

  /* ═══ P8 · READINESS ═══ */

  const readinessPage = lightPage(8, `
    <h2>Where you sit, and why</h2>
    ${q
      ? `<p>On the readiness drivers buyers actually price, this profile reads in the <b>${q.readiness.position}</b> of the band.
         Each driver below is a published buyer behavior, not our opinion — and each one is a lever, not a verdict.</p>
         <table>${q.readiness.drivers.map(d => `
           <tr><td class="dl">${d.label}</td>
           <td class="ds" style="color:${statusColor[d.status]}">${statusWord(d.status)}</td>
           <td class="dn">${d.note}</td></tr>`).join('')}
         </table>
         <div class="src">${ATTRIBUTION}</div>
         ${fixes.length
           ? `<h2>The work list</h2>
              <p>${fixes.join(' · ')} — ${fixes.length === 1 ? 'this is' : 'these are'} the fix-before-sale line${fixes.length === 1 ? '' : 's'}.
              Page 10 prices the mix lever in dollars; the diligence preview on page 14 shows where each one gets tested.</p>`
           : ''}`
      : laneMsg ? noteCard(esc(laneMsg)) : gapCard('The readiness read', ['customers', ...QUICK_DEPS])}
  `);

  /* ═══ P9 · THE BUYER'S RATIOS ═══ */

  const ratioRow = (r: BuyerRatio): string => {
    const missing = r.missing.map(k => MISSING_NAMES[k] || k).join(', ');
    return `<tr><td class="dl">${r.label}</td>
      <td class="ds" style="color:${r.value !== null ? INK : MUTED}">${r.value !== null ? r.display : '—'}</td>
      <td class="dn">${r.testing}${r.value === null ? `<span class="miss">Needs: ${esc(missing)}.</span>` : ''}</td></tr>`;
  };

  const ratiosPage = lightPage(9, `
    <h2>The ratios a buyer computes before the first call</h2>
    <p>Every figure below is arithmetic on your own numbers. The third column is what a buyer's diligence does with
    each one — the tests these ratios exist to feed.</p>
    <table>
      <tr class="thead"><td class="dl"></td><td class="ds">Your figure</td><td class="dn">What diligence tests with it</td></tr>
      ${report.ratios.map(ratioRow).join('')}
    </table>
    <div class="gap" style="margin-top:14px">
      <p class="gp" style="margin:0"><b>Why there is no "industry average" column.</b> We publish no sourced per-lane
      ratio benchmarks, and an uncited average would be an invented number — the one thing this report never prints.
      Where this report does use published thresholds (the multiple band, the readiness drivers), the source is
      printed where the number appears. The comparison base a buyer actually brings is their own operations.</p>
    </div>
  `);

  /* ═══ P10 · WHAT MOVES THE NUMBER ═══ */

  const wm = report.whatMoves;
  const whatMovesPage = lightPage(10, `
    <h2>What moves the number — the 24-month arithmetic</h2>
    ${wm && basisOk
      ? `<p>${esc(wm.growthNote)}</p>
        <div class="facts">
          <div class="fact"><div class="n">${compact(wm.revenueAt24moUsd)}</div><div class="l">Revenue at 24 months · ${wm.growthPctUsed}%/yr</div></div>
          <div class="fact"><div class="n">${wm.serviceMix.currentPct !== null ? wm.serviceMix.currentPct + '%' : '—'} → ${wm.serviceMix.targetPct}%</div><div class="l">Service mix · today → target</div></div>
          <div class="fact"><div class="n">${wm.serviceMix.serviceRevenueGapUsd !== null ? compact(wm.serviceMix.serviceRevenueGapUsd) : compact(wm.serviceMix.serviceRevenueAt24moUsd)}</div><div class="l">${wm.serviceMix.serviceRevenueGapUsd !== null ? 'Service revenue to build' : 'Service revenue at target'}</div></div>
          <div class="fact"><div class="n">${compact(wm.perTurnUsd)}</div><div class="l">Worth of one full turn of the band</div></div>
        </div>
        <div class="range" style="margin-top:16px">
          <div class="rr"><div class="n">${money(q!.rangeUsd.marketLow)} – ${money(q!.rangeUsd.marketHigh)}</div><div class="l">Where the market clears · today</div></div>
          <div class="rr hero-rr"><div class="n">${money(wm.rangeAt24moUsd.marketLow)} – ${money(wm.rangeAt24moUsd.marketHigh)}</div><div class="l">Where the market clears · at 24 months</div></div>
        </div>
        <div class="src">${esc(wm.note)}</div>
        <h2>Why the mix is the lever</h2>
        <p>Project revenue re-wins itself every year; a maintenance contract renews. Buyers underwrite the renewal —
        contracted service revenue survives ownership change, smooths the bid cycle, and feeds the project pipeline
        from inside customer buildings. The published spread between a project-led book and a service-led book is
        measured in full turns of the multiple — on your earnings, each turn is worth roughly ${compact(wm.perTurnUsd)}
        of enterprise value.</p>
        <div class="src">Spread: ${q!.band.source} — ${q!.band.scopeNote}.</div>`
      : basisOk
        ? gapCard('The 24-month what-moves page', ['what-moves'])
        : laneMsg ? noteCard(esc(laneMsg)) : nonPositiveNote ? noteCard(nonPositiveNote) : gapCard('The 24-month what-moves page', ['what-moves', ...QUICK_DEPS])}
  `);

  /* ═══ P11 · THE PROCEEDS WALK ═══ */

  const wf = report.waterfall;
  const re = models.reBifurcation;
  const reBlock = q?.realEstateNote
    ? `<h2>The building sits on top of this walk</h2>
      <p>${
        // The engine's note says "the range below" — true on the one-page P1
        // report it was written for; here the range lives on page 7.
        q.realEstateNote.replace(/range below/g, 'range on page 7')
      }</p>
      ${re && re.missingInputs.includes('cap_rate')
        ? `<div class="src">The operating-business / real-property bifurcation model was run WITHOUT a capitalization
           rate, on purpose: capitalizing rent into a property value is an appraisal, and appraisal is a licensed
           specialist's work this practice does not do. The model honestly records the missing input — an appraiser
           sets that number, and whatever it is, it is additional to and separate from the walk above.</div>`
        : ''}`
    : '';

  const waterfallPage = lightPage(11, `
    <h2>The proceeds walk — what a headline becomes</h2>
    ${wf && basisOk
      ? `<p>Run on both endpoints of where the market clears — a range in, a range out:</p>
        <table>
          <tr class="thead"><td class="bl"></td><td class="bn">Low</td><td class="bn" style="width:130px">High</td></tr>
          ${wf.lines.map((l, i) => `
            <tr><td class="bl">${i === 0 ? `<b>${esc(l.label)}</b>` : esc(l.label)}</td>
            <td class="bn">${i === 0 ? money(l.lowUsd) : signedMoney(l.lowUsd)}</td>
            <td class="bn" style="width:130px">${i === 0 ? money(l.highUsd) : signedMoney(l.highUsd)}</td></tr>`).join('')}
          <tr class="tot"><td class="bl">Cash at close, before tax</td>
          <td class="bn">${money(wf.cashAtCloseUsd.low)}</td><td class="bn" style="width:130px">${money(wf.cashAtCloseUsd.high)}</td></tr>
        </table>
        ${wf.shortfallNote ? `<div class="src">${esc(wf.shortfallNote)}</div>` : ''}
        <div class="src">${esc(wf.costsNote)} ${esc(wf.escrowNote)}</div>
        <h2>The tax line — named, not estimated</h2>
        <p>Tax is the next deduction, and this report deliberately does not estimate it: what you keep after tax
        depends on entity form, asset-versus-equity structure, basis, and purchase-price allocation — variables that
        move the answer by whole percentage points and that your CPA models before anything is signed. The line is
        named here so the walk is honest, not because we can price it. No unlicensed opinions: tax is the CPA's
        number, the way the building is the appraiser's.</p>
        ${reBlock}`
      : basisOk
        ? gapCard('The proceeds walk', ['balance-sheet'])
        : laneMsg ? noteCard(esc(laneMsg)) : nonPositiveNote ? noteCard(nonPositiveNote) : gapCard('The proceeds walk', ['balance-sheet', ...QUICK_DEPS])}
    ${disc}
  `);

  /* ═══ P12 · ANATOMY OF AN OFFER ═══ */

  const wcRatio = ratioByKey['workingCapitalPct'];
  const ownerDrv = driverByKey['owner'];
  const concDrv = driverByKey['concentration'];
  const offerRows: Array<[string, string]> = [
    ['Cash at close', 'The wire on the closing date — the proceeds walk on page 11 is this line\'s arithmetic, before tax.'],
    ['Working capital peg',
      `The business is delivered with a normal level of working capital — part of the price, not extra.` +
      (wcRatio && wcRatio.value !== null
        ? ` Yours runs at ${wcRatio.display}; the peg gets set off that base, and running heavier than the peg gives the difference back in proceeds.`
        : ' The peg gets set off your trailing balance-sheet base in diligence.')],
    ['Escrow / holdback',
      `A share of the price held against representations and warranties — the walk on page 11 plans at ${ESCROW_PCT}%, a labeled practice norm, negotiated deal by deal. Deferred, not lost: released on the escrow schedule net of claims.`],
    ['Seller note / earnout',
      ownerDrv?.status === 'strength' && concDrv?.status === 'strength'
        ? 'Buyers use notes and earnouts to price transfer risk — on your drivers that risk reads low, which supports a cleaner, mostly-cash structure.'
        : `Buyers use notes and earnouts to price what they cannot yet verify${ownerDrv && ownerDrv.status !== 'strength' ? ' — expect the owner-transition question to be priced in structure' : ''}${concDrv?.status === 'fix' ? ', and expect contingency tied to the concentrated account' : ''}. Every dollar moved into structure is a negotiation, not a law.`],
    ['Transition & employment',
      ownerDrv?.status === 'strength'
        ? 'A business that runs without the owner supports a short, advisory transition.'
        : 'Expect a transition commitment as part of the offer — buyers pay for what transfers, and the transfer is you until the bench proves otherwise.'],
    ...(q?.realEstateNote
      ? [['The real estate', 'Priced separately from the business in every structure: a market lease back to you, or a separate purchase at the appraiser\'s number — page 11 has the full treatment.'] as [string, string]]
      : []),
  ];

  const offerPage = lightPage(12, `
    <h2>Anatomy of an offer</h2>
    ${q
      ? `<p>A headline number arrives as a structure. These are the parts every offer for a business like yours is
        built from, and how your profile conditions each one:</p>
        <table>${offerRows.map(([l, t]) => `<tr><td class="dl">${l}</td><td class="dn">${t}</td></tr>`).join('')}</table>
        <div class="src">Structure norms above are the practice's planning figures, labeled as such where they enter
        arithmetic — never market facts. The actual structure is negotiated, papered by your deal attorney, and priced
        in diligence.</div>`
      : laneMsg ? noteCard(esc(laneMsg)) : gapCard('The offer-anatomy page', QUICK_DEPS)}
  `);

  /* ═══ P13 · BUYER TYPES + THE FINANCING TEST ═══ */

  const stress = models.dscrStress;
  const lbo = models.lboSba;
  let financing = '';
  if (basisOk && stress && stress.status === 'complete') {
    const baseDscr = Number(stress.outputs.base_dscr);
    const floor = Number(stress.outputs.lender_floor);
    const cases: Array<{ revenue_change_pct: number; cash_flow_cents: number; dscr: number }> =
      Array.isArray(stress.outputs.stressed_cases) ? stress.outputs.stressed_cases : [];
    const price = usd(lbo?.inputs?.purchase_price_cents) ?? q!.rangeUsd.marketHigh;
    const equity = usd(lbo?.inputs?.buyer_equity_cents);
    const loan = equity !== null ? price - equity : null;
    const max7a = usd(lbo?.outputs?.max_7a_loan_cents);
    const clears = baseDscr >= floor;
    financing = `
      <h2>The financing test — can the earnings carry the top of the band?</h2>
      <p>Priced at the top of where the market clears (${money(price)}), SBA-shaped: ${Math.round(SBA_SOP_50_10_8.EQUITY_INJECTION_PCT * 100)}%
      buyer equity (the SOP floor), the balance amortized at the SOP's published ceiling rate
      (${(SBA_SOP_50_10_8.ALL_IN_RATE_HIGH * 100).toFixed(2)}%) over the acquisition maturity — the most expensive
      structure a compliant lender could write. Your normalized earnings cover that debt service at
      <b>${baseDscr.toFixed(2)}x</b> against the ${floor.toFixed(2)}x lender standard — the top of the band
      ${clears ? 'finances on your own cash flow' : 'does not finance on cash flow alone at this structure, which shifts the top of the band toward buyers with equity to bridge it'}.</p>
      <table>
        <tr class="thead"><td class="bl">Revenue stress</td><td class="bn">Cash flow</td><td class="bn" style="width:78px">DSCR</td><td class="bn" style="width:110px">Read</td></tr>
        ${cases.map(c => {
          const ok = c.dscr >= floor;
          return `<tr><td class="bl">${c.revenue_change_pct === 0 ? 'As reported' : Math.round(c.revenue_change_pct * 100) + '%'}</td>
          <td class="bn">${money(c.cash_flow_cents / 100)}</td>
          <td class="bn" style="width:78px">${c.dscr.toFixed(2)}x</td>
          <td class="bn" style="width:110px;color:${ok ? GREEN : FIX_RED}">${ok ? 'Clears' : 'Below floor'}</td></tr>`;
        }).join('')}
      </table>
      ${loan !== null && max7a !== null && loan > max7a
        ? `<p style="margin-top:10px">The implied loan (${money(loan)}) exceeds the 7(a) program maximum
          (${money(max7a)}) — the SBA route caps out below your range, which points your buyer set at platforms and
          funded groups rather than individual buyers.</p>`
        : ''}
      <div class="src">Financing test: SBA SOP 50 10 8 (effective ${SBA_SOP_50_10_8.EFFECTIVE_DATE}) — ${Math.round(SBA_SOP_50_10_8.EQUITY_INJECTION_PCT * 100)}%
      minimum equity injection; DSCR floors ${SBA_SOP_50_10_8.DSCR_SBA_FLOOR} (SBA) / ${SBA_SOP_50_10_8.DSCR_LENDER_STD} (lender standard);
      all-in rate band ${(SBA_SOP_50_10_8.ALL_IN_RATE_LOW * 100).toFixed(2)}–${(SBA_SOP_50_10_8.ALL_IN_RATE_HIGH * 100).toFixed(2)}%.
      A buyer cannot pay what the earnings cannot service — this is arithmetic on your own figures, not an opinion.</div>`;
  } else if (basisOk) {
    financing = `<div class="src" style="margin-top:14px">The financing test runs when the range prints — it prices the top of the band against your own cash flow under SBA SOP 50 10 8.</div>`;
  }

  const buyerTypesPage = lightPage(13, `
    <h2>Who buys a business like this</h2>
    ${q
      ? `<div class="grid3">
          <div class="lstep"><div class="n">01</div><div class="h">The trade consolidator</div><div class="b">A strategic already in your trade. Prices the service book against the published spread, integrates the back office, and pays for what transfers: contracts, technicians, the customer record.</div></div>
          <div class="lstep"><div class="n">02</div><div class="h">The funded platform</div><div class="b">A private-equity platform or its add-on program. Underwrites to its own leverage math — the financing test below is the arithmetic version of the question every one of them asks first.</div></div>
          <div class="lstep"><div class="n">03</div><div class="h">The individual buyer</div><div class="b">Often SBA-financed, so the SOP writes the outer limits of the check: minimum equity down, debt service the earnings must cover. The stress ladder below is their lender's worksheet.</div></div>
        </div>
        ${financing}`
      : laneMsg ? noteCard(esc(laneMsg)) : nonPositiveNote ? noteCard(nonPositiveNote) : gapCard('The buyer-types page', QUICK_DEPS)}
  `);

  /* ═══ P14 · DILIGENCE PREVIEW ═══ */

  const drvStand = (key: string): string => {
    const d = driverByKey[key];
    return d ? `<span style="color:${statusColor[d.status]};font-weight:700">${statusWord(d.status)}</span>` : '—';
  };
  const ratioStand = (key: string): string => {
    const r = ratioByKey[key];
    return r && r.value !== null ? r.display : '—';
  };
  const dilRows: Array<[string, string, string]> = [
    ['Quality of earnings', 'Three years of statements, the add-back paper trail, POC schedules', drvStand('books')],
    ['Revenue quality', 'Agreement files, renewal history, service-billing detail', drvStand('recurring')],
    ['Customer base', 'Top-10 customer schedule; reference calls late in the process', drvStand('concentration')],
    ['WIP & percentage-of-completion', 'The WIP schedule tied to the general ledger', ratioStand('wip')],
    ['Receivables', 'A/R aging and collections history', ratioStand('dso')],
    ['Debt & liens', 'Debt schedule; UCC and lien searches', ratioStand('debtToEbitda')],
    ['Backlog', 'Signed-contract listing and gross margin in backlog', ratioStand('backlogCoverage')],
    ['Surety', 'The program letter; loss runs', prof.suretyLine ? esc(prof.suretyLine) : '—'],
    ['Real estate', 'Deed or lease; environmental review on owned property',
      q ? (q.realEstateNote ? 'Owned — separate asset, appraiser-valued' : 'Leased from a third party') : '—'],
  ];

  const diligencePage = lightPage(14, `
    <h2>Diligence preview — what a buyer will ask for</h2>
    <p>None of this is a reason to wait; it is the checklist to be ready for. The third column is where you stand on
    the pages of this report — the drivers on page 8, the ratios on page 9.</p>
    <table>
      <tr class="thead"><td class="dl"></td><td class="dn">What they'll ask for</td><td class="ds" style="width:150px">Where you stand</td></tr>
      ${dilRows.map(([a, b, c]) => `<tr><td class="dl">${a}</td><td class="dn">${b}</td><td class="ds" style="width:150px">${c}</td></tr>`).join('')}
    </table>
    <p style="margin-top:12px">Quality of earnings is won before the process starts: the record that already
    reconciles — books to returns, WIP to the general ledger, add-backs to their paper trail — defends the multiple.
    The record assembled under deadline is the one that gets chipped.</p>
  `);

  /* ═══ P15 · THE SEQUENCE ═══ */

  const seqLead =
    prof.timeline === 'ready-12mo'
      ? 'On a 12-month clock, order matters more than speed — the steps below are sequenced so the record is ready before the first conversation, not assembled under deadline inside one.'
      : prof.timeline === '1-3-years'
        ? 'A 1–3 year window is the strong position: enough time to work every lever on page 10 before a process starts, and to run it from strength when it does.'
        : 'No clock is running. The sequence below is what the path looks like whenever you start it — and steps 1 and 2 pay for themselves even if you never sell.';

  const seqSteps: Array<[string, string]> = [
    ['Ready the record',
      'Accrual books that tie to the returns, the add-back paper trail, WIP tied to the general ledger. Quality of earnings is won here, before it starts.' +
      (fixes.length ? ` Your fix-before-sale list — ${fixes.join(', ').toLowerCase()} — is part of this step.` : '')],
    ['Work the levers',
      'The 24-month arithmetic on page 10: the service mix, the bench, the concentration line. Each is a multiple lever with its published spread — the same work that makes the business better makes it worth more.'],
    ['Run the market from strength',
      'A range you can defend beats a number you hope for. The leverage in any process is not needing it — which is what steps 1 and 2 buy you.'],
    ['Paper it with the licensed specialists',
      'Your deal attorney papers the structure, your CPA models the tax, a licensed appraiser values the building. This report frames their questions; it never substitutes for their answers.'],
  ];

  const sequencePage = lightPage(15, `
    <h2>The sequence</h2>
    <p>${seqLead}</p>
    <div class="grid2">
      ${seqSteps.map(([h, b], i) => `<div class="lstep"><div class="n">${String(i + 1).padStart(2, '0')}</div><div class="h">${h}</div><div class="b">${b}</div></div>`).join('')}
    </div>
    <p style="margin-top:14px">Nothing in this report is an engagement or an offer — a formal process runs under its
    own papered engagement, with your own advisors on your side of the table. This practice works the buy side, and
    says so plainly.</p>
  `);

  /* ═══ P16 · CLOSER (dark bookend) ═══ */

  const closerPage = `
  <div class="pg dark"><div class="tex"></div><div class="glaze"></div>${draftStripDark}<div class="inner">
    ${LOGO_W ? `<img class="cv-logo" src="${LOGO_W}">` : ''}
    <div class="kicker" style="margin-top:40px">FOR THE OWNER</div>
    <div class="close-h">A range you can defend.<br><span class="turn">And a list that moves it.</span></div>
    <div class="close-b">We are buy-side corporate development — acquirers pay us, owners never do. This report is
    yours: put it in front of your banker or your CPA, work the list, and come back whenever a number changes. The
    evaluation workspace rebuilds it from wherever you left off.</div>
    <div class="steps">
      <div class="step"><div class="n">1</div><div class="b">Take it to your people — the banker, the CPA, the attorney. Every market figure in here is cited so they can check the work.</div></div>
      <div class="step"><div class="n">2</div><div class="b">Work the levers, then log back in — update a number and the report rebuilds. Delete anytime; the keep-or-delete decision governs everything on file.</div></div>
      <div class="step"><div class="n">3</div><div class="b">When a buyer engages us in your lane, registered owners are the first call.</div></div>
    </div>
    <div class="close-url">SMBX.AI <span>→ OWNERS</span></div>
    <div class="byline" style="margin-top:auto">
      ${HEAD ? `<img src="${HEAD}">` : ''}
      <div class="who"><b>Paul Baker</b>Founder · two decades on the buy side · smbX.ai</div>
    </div>
    <div class="credits">EVERY MARKET FIGURE CITED · BUY-SIDE ONLY · NEVER A FEE FROM AN OWNER</div>
    <div class="cv-note">${report.disclaimer}${draft ? ' Draft build — withheld pages name their own gaps; finish the walk and they fill in.' : ''}</div>
  </div></div>`;

  /* ── assemble ─────────────────────────────────────────────────────────── */

  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaceCss()}
* { margin:0; padding:0; box-sizing:border-box; }
html,body { background:#fff; }
body { font-family:'Inter',sans-serif; color:${INK}; }
.pg { width:8.5in; height:11in; position:relative; overflow:hidden; page-break-after:always; background:${BONE}; }
.pg:last-child { page-break-after:auto; }

/* ── dark bookends: texture UNDER the 0.84 jade glaze (the composite law) ── */
.dark { color:${IVORY}; }
.dark .tex, .dark .glaze { position:absolute; inset:0; }
.dark .tex { background:${TEXTURE ? `url(${TEXTURE}) center/cover no-repeat` : LEDGER.dark}; }
.dark .glaze { background:${GLAZE}; }
.dark .inner { position:relative; height:100%; display:flex; flex-direction:column; padding:0.8in 0.9in 0.65in; }

.dstrip { position:absolute; top:0; left:0; right:0; z-index:5; text-align:center; padding:5px 0 4px;
  font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:0.18em;
  background:${rgba(LEDGER.brass, 0.16)}; color:${INK}; border-bottom:1px solid ${BRASS}; }
.dstrip.dark-strip { background:rgba(0,0,0,0.30); color:${HONEY}; border-bottom:1px solid ${rgba(LEDGER.honey, 0.5)}; }

.kicker { font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.2em; color:${HONEY}; }
.h1 { font-family:'Fraunces',serif; font-weight:560; font-size:54px; line-height:1.02; letter-spacing:-0.01em; margin-top:20px; }
.h1 .turn { color:${HONEY}; }
.cv-sub { margin-top:18px; font-size:15px; line-height:1.6; color:${IVORY}; opacity:0.92; max-width:5.8in; }
.rule { width:72px; height:3px; background:${HONEY}; margin-top:24px; }
.hero { margin-top:30px; }
.hero-n { font-family:'Fraunces',serif; font-size:52px; color:#fff; font-variant-numeric:tabular-nums; white-space:nowrap; line-height:1.05; }
.hero-n.hero-open { color:${IVORY}; opacity:0.85; }
.hero-l { margin-top:8px; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.15em; color:${HONEY}; }
.stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:34px; }
.stat { border:1px solid ${rgba(LEDGER.ivory, 0.28)}; border-radius:12px; padding:15px 14px 13px; }
.stat .n { font-family:'Fraunces',serif; font-size:21px; color:#fff; font-variant-numeric:tabular-nums; white-space:nowrap; }
.stat .l { margin-top:8px; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:0.12em; color:${HONEY}; text-transform:uppercase; line-height:1.5; }
.byline { margin-top:auto; display:flex; align-items:center; gap:14px; }
.byline img { width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid ${HONEY}; }
.byline .who { font-size:13.5px; line-height:1.5; }
.byline .who b { display:block; font-size:15px; }
.cv-note { margin-top:16px; font-size:10.5px; line-height:1.55; color:${IVORY}; opacity:0.62; max-width:6.4in; }
.cv-logo { height:26px; width:auto; align-self:flex-start; }

/* ── light body pages ── */
.body-pg { padding:0.68in 0.85in 0.85in; display:flex; flex-direction:column; }
.crumb { display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid ${INK}; padding-bottom:10px; }
.crumb img { height:20px; width:auto; }
.crumb .t { font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.15em; color:${MUTED}; text-transform:uppercase; }
h2 { font-family:'Fraunces',serif; font-weight:560; font-size:21px; margin:24px 0 9px; }
h2:first-of-type { margin-top:26px; }
p, li { font-size:12px; line-height:1.6; color:${BODY}; }
ul.plain { margin:6px 0 0 18px; }
ul.plain li { margin-bottom:6px; }
.facts { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:14px 0 2px; }
.fact { border:1px solid ${HAIR}; border-radius:10px; background:#fff; padding:12px 12px 10px; }
.fact .n { font-family:'Fraunces',serif; font-size:18px; color:${GREEN}; font-variant-numeric:tabular-nums; white-space:nowrap; }
.fact .l { margin-top:5px; font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:0.1em; color:${MUTED}; text-transform:uppercase; line-height:1.45; }
table { width:100%; border-collapse:collapse; margin-top:8px; }
td { border-top:1px solid ${HAIR}; padding:7px 6px; font-size:11px; vertical-align:top; }
tr.thead td { border-top:none; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:0.1em; color:${MUTED}; text-transform:uppercase; padding-bottom:3px; }
tr.thead td.bn, tr.thead td.ds { font-weight:400; }
.bl b { color:${INK}; }
.bl .nt { display:block; font-size:9.5px; color:${MUTED}; margin-top:2px; line-height:1.45; }
.bn { text-align:right; font-variant-numeric:tabular-nums; font-weight:600; width:110px; white-space:nowrap; }
tr.sub td { border-top:1.5px solid ${INK}; font-weight:700; }
tr.tot td { border-top:2.5px solid ${GREEN}; font-weight:800; color:${INK}; font-size:12px; padding-top:9px; }
tr.tot .bn { color:${GREEN}; }
tr.hot td { background:${LEDGER.greenTint}; }
tr.hot td:first-child { border-left:3px solid ${GREEN}; }
.range { display:flex; gap:16px; margin:14px 0 4px; }
.rr { flex:1; border:1px solid ${HAIR}; border-radius:12px; padding:16px 18px 13px; background:#fff; }
.rr .n { font-family:'Fraunces',serif; font-size:23px; color:${GREEN}; font-variant-numeric:tabular-nums; white-space:nowrap; }
.rr .l { font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:0.11em; color:${MUTED}; text-transform:uppercase; margin-top:8px; line-height:1.5; }
.rr.hero-rr { border-left:3px solid ${BRASS}; }

/* ── the narrowed band — the band page's hero ── */
.nb { border:1px solid ${HAIR}; border-left:4px solid ${GREEN}; border-radius:14px; background:#fff; padding:11px 18px 10px; margin:8px 0 0; }
.nb-n { font-family:'Fraunces',serif; font-size:28px; color:${GREEN}; font-variant-numeric:tabular-nums; white-space:nowrap; line-height:1.05; }
.nb-d { margin-top:5px; font-size:11.5px; line-height:1.5; color:${BODY}; }
.nb-d b { color:${INK}; }
.nb-l { margin-top:6px; font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:0.11em; color:${MUTED}; line-height:1.5; }
.nbt td { padding:4px 6px; }
.nbt .dn { font-size:10px; line-height:1.45; }
.nbt .gw { font-size:8.5px; }
.nbt + .src { margin-top:6px; }
.src { font-size:9.5px; color:${MUTED}; margin-top:9px; line-height:1.55; }
.dl { font-weight:600; width:150px; } .ds { width:110px; font-weight:700; font-size:10.5px; } .dn { color:${BODY}; font-size:10.5px; line-height:1.5; }
.miss { display:block; font-size:9.5px; color:${MUTED}; margin-top:2px; }
.disc { margin-top:auto; border:1px solid ${HAIR}; border-left:3px solid ${BRASS}; background:#fff; padding:10px 14px; font-size:10px; color:${BODY}; line-height:1.5; }
.foot { position:absolute; left:0.85in; right:0.85in; bottom:0.32in; display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:0.08em; color:${MUTED}; }

/* ── contents ── */
.toc { display:grid; grid-template-columns:1fr 1fr; gap:2px 32px; margin-top:10px; }
.toc-r { display:flex; gap:12px; align-items:baseline; border-bottom:1px solid ${HAIR}; padding:5px 2px; }
.toc-n { font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:${GREEN}; letter-spacing:0.08em; }
.toc-t { font-size:11px; color:${BODY}; }

/* ── the honest cards: gaps + notes ── */
.gap { border:1px solid ${HAIR}; border-left:3px solid ${BRASS}; border-radius:10px; background:#fff; padding:14px 16px; margin-top:12px; }
.gap .gt { font-family:'Fraunces',serif; font-weight:560; font-size:15px; margin-bottom:6px; }
.gap .gp { font-size:10.5px; color:${BODY}; margin:4px 0; }
.gap ul { margin:6px 0 4px 16px; }
.gap li { font-size:10.5px; margin-bottom:6px; }
.gap li b { color:${INK}; }
.gw { display:block; font-size:9.5px; color:${MUTED}; margin-top:1px; }

/* ── light step / type cards ── */
.grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:14px; }
.grid2 { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-top:14px; }
.lstep { border:1px solid ${HAIR}; border-radius:12px; background:#fff; padding:14px; }
.lstep .n { font-family:'IBM Plex Mono',monospace; font-size:10px; color:${BRASS}; letter-spacing:0.14em; }
.lstep .h { font-family:'Fraunces',serif; font-weight:560; font-size:14.5px; margin-top:5px; }
.lstep .b { margin-top:5px; font-size:10.5px; line-height:1.55; color:${BODY}; }

/* ── closer ── */
.close-h { font-family:'Fraunces',serif; font-weight:560; font-size:44px; line-height:1.06; margin-top:20px; max-width:6in; }
.close-h .turn { color:${HONEY}; }
.close-b { margin-top:20px; font-size:14px; line-height:1.7; color:${IVORY}; opacity:0.92; max-width:5.8in; }
.close-url { margin-top:30px; font-family:'IBM Plex Mono',monospace; font-size:19px; letter-spacing:0.14em; color:#fff; }
.close-url span { color:${HONEY}; }
.steps { margin-top:24px; display:grid; grid-template-columns:repeat(3,1fr); gap:12px; max-width:6.6in; }
.step { border:1px solid ${rgba(LEDGER.ivory, 0.28)}; border-radius:12px; padding:14px; }
.step .n { font-family:'Fraunces',serif; font-size:20px; color:${HONEY}; }
.step .b { margin-top:6px; font-size:10.5px; line-height:1.55; color:${IVORY}; opacity:0.9; }
.credits { margin-top:24px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.14em; color:${IVORY}; opacity:0.72; }
</style></head><body>
${coverPage}
${contentsPage}
${execSummaryPage}
${companyPage}
${bridgePage}
${trendPage}
${bandPage}
${readinessPage}
${ratiosPage}
${whatMovesPage}
${waterfallPage}
${offerPage}
${buyerTypesPage}
${diligencePage}
${sequencePage}
${closerPage}
</body></html>`;
}
