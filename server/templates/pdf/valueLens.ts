/**
 * ValueLens Premium PDF Template
 *
 * 2-page document: branded cover + financial analysis with charts.
 * This is the conversion trigger — the first document a free user sees.
 */
import { wrapHtml } from './base.js';
import { coverPageHtml, tableHtml, disclaimerHtml, watermarkHtml } from './components.js';

function fmtDollars(cents: number | null | undefined): string {
  if (!cents) return '—';
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${Math.round(d / 1_000).toLocaleString()}K`;
  return `$${d.toLocaleString()}`;
}

function fmtMult(n: number): string {
  return `${n.toFixed(1)}x`;
}

const LEAGUE_INFO: Record<string, { min: number; max: number; metric: string; label: string }> = {
  L1: { min: 2.0, max: 3.5, metric: 'SDE', label: 'Main Street ($0–$500K SDE)' },
  L2: { min: 3.0, max: 5.0, metric: 'SDE', label: 'Lower Middle ($500K–$2M SDE)' },
  L3: { min: 4.0, max: 6.0, metric: 'EBITDA', label: 'Middle Market ($2M–$5M EBITDA)' },
  L4: { min: 6.0, max: 8.0, metric: 'EBITDA', label: 'Upper Middle ($5M–$10M EBITDA)' },
  L5: { min: 8.0, max: 12.0, metric: 'EBITDA', label: 'Large Cap ($10M–$50M EBITDA)' },
  L6: { min: 10.0, max: 15.0, metric: 'EBITDA', label: 'Mega Cap ($50M+ EBITDA)' },
};

export function valueLensTemplate(data: Record<string, any>, charts: Record<string, string>): string {
  const fd = data.financialData || data;
  const league = fd.league || 'L1';
  const leagueInfo = LEAGUE_INFO[league] || LEAGUE_INFO.L1;
  const earnings = fd.sde || fd.ebitda || 0;
  const midMult = (leagueInfo.min + leagueInfo.max) / 2;
  const valLow = Math.round(earnings * leagueInfo.min);
  const valMid = Math.round(earnings * midMult);
  const valHigh = Math.round(earnings * leagueInfo.max);

  const businessName = fd.business_name || data.dealName || 'Business';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const body = `
    ${data.watermark ? watermarkHtml(data.watermark) : ''}

    <!-- PAGE 1: COVER -->
    ${coverPageHtml({
      documentType: 'ValueLens',
      title: businessName,
      subtitle: [fd.industry, fd.location].filter(Boolean).join(' · '),
      date,
    })}

    <!-- PAGE 2: FINANCIAL ANALYSIS -->
    <div style="padding-top: 8px;">

      <!-- Brand header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
        <span class="brand-mark" style="font-size: 11pt;">smb<span class="x">x</span>.ai</span>
        <span style="font-size: 8pt; color: var(--text-light);">${date}</span>
      </div>

      <!-- Business Overview -->
      <div class="no-break" style="margin-bottom: 28px;">
        <h2 class="section-title">Business Overview</h2>
        ${tableHtml(
          ['Attribute', 'Detail'],
          [
            ['Business', businessName],
            ['Industry', fd.industry || '—'],
            ['Location', fd.location || '—'],
            ['Years Operating', fd.years_in_business ? `${fd.years_in_business} years` : '—'],
            ['Employees', fd.employee_count ? String(fd.employee_count) : '—'],
            ['Annual Revenue', fmtDollars(fd.revenue)],
            [leagueInfo.metric, fmtDollars(earnings)],
            ['Market League', `${league} — ${leagueInfo.label}`],
          ],
          { rightAlignFrom: 1 },
        )}
      </div>

      <!-- Valuation Range — Hero Section -->
      <div class="no-break" style="margin-bottom: 28px;">
        <h2 class="section-title">Estimated Value Range</h2>

        <div style="background: var(--cream); border-radius: 8px; padding: 24px; margin-bottom: 12px;">
          <div class="value-hero">
            <div class="val-col">
              <p class="val-label">Low</p>
              <p class="val-amount">${fmtDollars(valLow)}</p>
            </div>
            <div class="val-col val-mid">
              <p class="val-label">Most Likely</p>
              <p class="val-amount">${fmtDollars(valMid)}</p>
            </div>
            <div class="val-col">
              <p class="val-label">High</p>
              <p class="val-amount">${fmtDollars(valHigh)}</p>
            </div>
          </div>

          <p style="text-align: center; font-size: 9pt; color: var(--text-muted); margin-top: 8px;">
            Based on ${leagueInfo.metric} of ${fmtDollars(earnings)} at ${fmtMult(leagueInfo.min)}–${fmtMult(leagueInfo.max)} (${league} range)
          </p>
        </div>

        ${charts.valuationRange || ''}
      </div>

      <!-- Multiple Context -->
      ${charts.multipleComparison ? `
      <div class="no-break" style="margin-bottom: 28px;">
        <h2 class="section-subtitle">Market Multiple Context</h2>
        ${charts.multipleComparison}
      </div>
      ` : ''}

      <!-- Earnings Breakdown -->
      ${charts.earningsBreakdown ? `
      <div class="no-break" style="margin-bottom: 28px;">
        <h2 class="section-subtitle">Earnings Profile</h2>
        ${charts.earningsBreakdown}
      </div>
      ` : ''}

      <!-- Deal Score Radar -->
      ${charts.dealScoreRadar ? `
      <div class="no-break" style="margin-bottom: 28px;">
        <h2 class="section-subtitle">Deal Quality Assessment</h2>
        <div style="display: flex; justify-content: center;">
          <img src="${charts.dealScoreRadar}" alt="Deal Score" style="max-width: 320px;" />
        </div>
      </div>
      ` : ''}

      <!-- What This Means -->
      <div class="no-break" style="margin-bottom: 20px;">
        <h2 class="section-subtitle">What This Means</h2>
        <div class="callout">
          <p>${generateNarrative(fd, leagueInfo, valLow, valMid, valHigh)}</p>
        </div>
      </div>

      ${disclaimerHtml()}
    </div>
  `;

  return wrapHtml(body, `ValueLens — ${businessName}`);
}

function generateNarrative(
  fd: Record<string, any>,
  league: { min: number; max: number; metric: string; label: string },
  low: number,
  mid: number,
  high: number,
): string {
  const parts: string[] = [];

  const earnings = fd.sde || fd.ebitda || 0;
  const businessName = fd.business_name || 'This business';

  parts.push(
    `${businessName} is valued in the ${fmtDollars(low)} to ${fmtDollars(high)} range, ` +
    `with a most likely value of ${fmtDollars(mid)}.`
  );

  parts.push(
    `This is based on ${league.metric} of ${fmtDollars(earnings)} ` +
    `at ${fmtMult(league.min)}–${fmtMult(league.max)}, which is the typical range for businesses in the ${league.label} segment.`
  );

  if (earnings <= 50000000) { // $500K in cents
    parts.push(
      'At this size, the most likely buyer is an individual operator using SBA 7(a) financing. ' +
      'SBA loans require a DSCR of at least 1.25x, which means the business needs to generate enough cash flow to cover the loan payments with a 25% cushion.'
    );
  } else if (earnings <= 200000000) { // $2M in cents
    parts.push(
      'At this size, potential buyers include experienced individual operators, search fund entrepreneurs, and small PE firms looking for platform acquisitions. ' +
      'SBA financing may be available for deals under $5M.'
    );
  } else {
    parts.push(
      'At this size, the buyer universe includes PE firms, family offices, and strategic acquirers. ' +
      'Deal financing typically involves a combination of senior debt, mezzanine, and equity.'
    );
  }

  if (fd.years_in_business && fd.years_in_business >= 10) {
    parts.push(`With ${fd.years_in_business} years of operating history, this business has a track record that reduces buyer risk and may command a premium within the multiple range.`);
  }

  return parts.join(' ');
}
