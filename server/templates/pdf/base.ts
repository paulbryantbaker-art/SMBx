/**
 * Base HTML shell for premium PDF templates.
 * Loads Google Fonts (Sora + Inter), Tailwind CDN, and brand CSS variables.
 */

export function wrapHtml(body: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    :root {
      --terra: #C25572;
      --terra-dark: #9A3250;
      --text: #1A1A18;
      --text-muted: #6E6A63;
      --text-light: #A9A49C;
      --cream: #FAF8F4;
      --table-header: #F3F0EA;
      --table-stripe: #FAFAF8;
      --border: #DDD9D1;
      --white: #FFFFFF;
    }

    * {
      margin: 0; padding: 0; box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text);
      font-size: 10.5pt;
      line-height: 1.55;
      /* Force sRGB color interpretation */
      color-scheme: light;
      /* Anti-aliased text for print */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    h1, h2, h3, h4 {
      font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text);
      line-height: 1.25;
    }

    /* ─── Print / PDF optimization ─── */

    @page {
      size: Letter;
      margin: 0.5in 0.6in;
    }

    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      * { color-adjust: exact !important; }
      .no-break { page-break-inside: avoid !important; break-inside: avoid !important; }
      .page-break { page-break-after: always !important; break-after: page !important; }
      canvas { max-width: 100% !important; }
      img { max-width: 100% !important; }
      table { page-break-inside: avoid; }
      tr { page-break-inside: avoid; }
      thead { display: table-header-group; } /* repeat headers on new pages */
    }

    /* Page break utilities */
    .page-break { page-break-after: always; break-after: page; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }

    /* Prevent chart canvases from overflowing */
    canvas {
      max-width: 100% !important;
      height: auto !important;
    }

    /* Tables never split mid-row */
    .fin-table tr { page-break-inside: avoid; break-inside: avoid; }
    .fin-table thead { display: table-header-group; } /* headers repeat on page break */

    /* Cover page */
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--cream);
      position: relative;
      padding: 60px;
    }
    .cover::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 5px;
      background: var(--terra);
    }

    /* Section headers */
    .section-title {
      font-family: 'Sora', sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: var(--text);
      padding-bottom: 8px;
      border-bottom: 2.5px solid var(--terra);
      margin-bottom: 16px;
    }

    .section-subtitle {
      font-family: 'Sora', sans-serif;
      font-size: 11pt;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 10px;
    }

    /* Financial tables */
    .fin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 20px;
    }
    .fin-table th {
      text-align: left;
      font-size: 8.5pt;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 8px 12px;
      border-bottom: 2px solid var(--terra);
      background: var(--table-header);
    }
    .fin-table td {
      padding: 8px 12px;
      border-bottom: 1.5px solid #EBEBEB;
      vertical-align: top;
    }
    .fin-table tr:nth-child(even) td {
      background: var(--table-stripe);
    }
    .fin-table .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }

    /* Hero value callout */
    .value-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 24px 0;
    }
    .value-hero .val-col {
      text-align: center;
      flex: 1;
    }
    .value-hero .val-label {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .value-hero .val-mid .val-label {
      color: var(--terra);
    }
    .value-hero .val-amount {
      font-family: 'Sora', sans-serif;
      font-size: 18pt;
      font-weight: 800;
      color: var(--text-muted);
    }
    .value-hero .val-mid .val-amount {
      font-size: 28pt;
      color: var(--terra);
    }

    /* Chart container */
    .chart-container {
      margin: 16px 0;
      text-align: center;
    }
    .chart-container img {
      max-width: 100%;
      height: auto;
    }
    .chart-caption {
      font-size: 8.5pt;
      color: var(--text-light);
      margin-top: 6px;
    }

    /* Callout box */
    .callout {
      background: var(--cream);
      border-left: 4px solid var(--terra);
      padding: 14px 18px;
      margin: 16px 0;
      border-radius: 0 6px 6px 0;
    }
    .callout p {
      font-size: 10pt;
      line-height: 1.6;
      color: #3D3B37;
    }

    /* Disclaimer */
    .disclaimer {
      font-size: 7.5pt;
      color: var(--text-light);
      line-height: 1.5;
      border-top: 1.5px solid var(--border);
      padding-top: 12px;
      margin-top: 30px;
    }

    /* Brand mark */
    .brand-mark {
      font-family: 'Sora', sans-serif;
      font-weight: 800;
      color: var(--text);
    }
    .brand-mark .x { color: var(--terra); }

    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      font-weight: 800;
      color: rgba(0,0,0,0.04);
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    }

    /* Header/footer */
    .page-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.6in;
      font-size: 7pt;
      color: var(--text-light);
      border-bottom: 1.5px solid var(--border);
    }
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.6in;
      font-size: 7pt;
      color: var(--text-light);
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
