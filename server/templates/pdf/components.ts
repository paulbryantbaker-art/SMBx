/**
 * Reusable HTML components for premium PDF templates.
 */

export function coverPageHtml(opts: {
  documentType: string;
  title: string;
  subtitle?: string;
  date?: string;
}): string {
  const date = opts.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div class="cover page-break">
      <div style="margin-bottom: 32px;">
        <span class="brand-mark" style="font-size: 22pt;">smb<span class="x">x</span>.ai</span>
      </div>
      <div style="width: 40px; height: 2px; background: var(--terra); margin-bottom: 28px;"></div>
      <h1 style="font-family: 'Sora', sans-serif; font-size: 32pt; font-weight: 800; text-align: center; margin-bottom: 12px;">
        ${escapeHtml(opts.documentType)}
      </h1>
      <p style="font-size: 16pt; color: var(--text-muted); text-align: center; margin-bottom: 6px;">
        ${escapeHtml(opts.title)}
      </p>
      ${opts.subtitle ? `<p style="font-size: 11pt; color: var(--text-light); text-align: center;">${escapeHtml(opts.subtitle)}</p>` : ''}
      <p style="font-size: 10pt; color: var(--text-light); margin-top: 32px;">${date}</p>
      <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center;">
        <p style="font-size: 8pt; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.15em;">
          Confidential
        </p>
      </div>
    </div>`;
}

export function tableHtml(
  headers: string[],
  rows: (string | number | null)[][],
  opts?: { rightAlignFrom?: number },
): string {
  const rightFrom = opts?.rightAlignFrom ?? headers.length; // default: no right alignment

  return `
    <table class="fin-table no-break">
      <thead>
        <tr>
          ${headers.map((h, i) => `<th${i >= rightFrom ? ' class="num"' : ''}>${escapeHtml(h)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map((cell, i) => {
              const val = cell === null || cell === undefined ? '—' : String(cell);
              return `<td${i >= rightFrom ? ' class="num"' : ''}>${escapeHtml(val)}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

export function chartHtml(base64: string, caption?: string): string {
  return `
    <div class="chart-container no-break">
      <img src="${base64}" alt="Chart" />
      ${caption ? `<p class="chart-caption">${escapeHtml(caption)}</p>` : ''}
    </div>`;
}

export function disclaimerHtml(): string {
  return `
    <div class="disclaimer">
      <p><strong>smbx.ai</strong> is a technology platform, not a business brokerage, law firm, or financial advisor.
      All valuations, analyses, and documents are AI-generated estimates for informational purposes only.
      Actual transaction values may differ based on market conditions, buyer interest, deal structure, and
      due diligence findings. Consult qualified professional advisors before making business decisions.</p>
    </div>`;
}

export function watermarkHtml(text: string): string {
  return `<div class="watermark">${escapeHtml(text)}</div>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
