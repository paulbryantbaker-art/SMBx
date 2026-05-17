/**
 * Export Routes — PDF, DOCX, XLSX download endpoints for deliverables.
 * Also: full deal data export (ZIP).
 */
import { Router } from 'express';
import archiver from 'archiver';
import { sql } from '../db.js';
import { hasDealAccess } from '../services/dealAccessService.js';
import { exportToPDF, exportToDOCX, exportToXLSX, exportLOIToPDF } from '../services/exportService.js';
import { exportToPPTX } from '../services/pptxExportService.js';
import { renderPremiumPdf, getPremiumTemplateKey } from '../services/premiumPdfRenderer.js';
// fs/promises no longer needed — file reads go through storageService

export const exportRouter = Router();

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const FILE_EXTENSIONS: Record<string, string> = {
  pdf: '.pdf',
  docx: '.docx',
  xlsx: '.xlsx',
  pptx: '.pptx',
};

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function compactText(value: unknown, fallback = '—'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function metricDisplay(data: Record<string, any>, key: string): string {
  const item = safeArray(data.metrics).find((metric: any) => metric?.key === key);
  return compactText(item?.displayValue, '—');
}

function assumptionValue(data: Record<string, any>, key: string): number | null {
  const item = safeArray(data.assumptions).find((assumption: any) => assumption?.key === key);
  const numeric = Number(item?.value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatCents(value: unknown): string {
  const cents = Number(value);
  if (!Number.isFinite(cents)) return '—';
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  if (Math.abs(dollars) >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString('en-US')}`;
}

function dealNameFromPayloadItem(item: Record<string, any>): string {
  const data = safeRecord(item.data);
  const calculations = safeRecord(data.calculations);
  return compactText(item.title, '')
    || compactText(calculations.dealName, '')
    || compactText(data.title, '')
    || 'Deal';
}

function modelRowsFromArtifactPayload(artifactPayload: Record<string, any>) {
  const rawDeals = safeArray(artifactPayload.deals);
  const sourceDeals = rawDeals.length
    ? rawDeals
    : [{ title: artifactPayload.selectedDeal || artifactPayload.title || 'Model', data: artifactPayload.primaryData }];

  return sourceDeals.map((item: any) => {
    const data = safeRecord(item?.data);
    const calculations = safeRecord(data.calculations);
    const normalizedSde = calculations.normalizedSdeCents ?? assumptionValue(data, 'normalized_sde_cents');
    const adjustedEbitda = calculations.adjustedEbitdaCents ?? assumptionValue(data, 'adjusted_ebitda_cents');
    const earningsValue = Number(adjustedEbitda ?? normalizedSde);
    const multiple = Number(assumptionValue(data, 'base_multiple') ?? safeRecord(data.verdict).multiple);
    const riskCount = safeArray(data.risks).length + safeArray(data.missingData).length;
    const score = Number(item?.modelScore ?? safeRecord(data.verdict).score ?? calculations.fitScore);
    return {
      deal: dealNameFromPayloadItem(safeRecord(item)),
      score: Number.isFinite(score) ? score : null,
      scoreDisplay: Number.isFinite(score) ? String(Math.round(score)) : metricDisplay(data, 'fit'),
      read: compactText(safeRecord(data.verdict).label, 'Model read'),
      sde: metricDisplay(data, 'sde') !== '—' ? metricDisplay(data, 'sde') : formatCents(normalizedSde),
      ebitda: metricDisplay(data, 'ebitda') !== '—' ? metricDisplay(data, 'ebitda') : formatCents(adjustedEbitda),
      valuation: metricDisplay(data, 'valuation') !== '—'
        ? metricDisplay(data, 'valuation')
        : `${formatCents(calculations.valuationLowCents)}-${formatCents(calculations.valuationHighCents)}`,
      earningsValue: Number.isFinite(earningsValue) ? earningsValue : null,
      multiple: Number.isFinite(multiple) ? multiple : null,
      riskCount,
      rationale: compactText(safeRecord(data.verdict).rationale || data.yuliaRead || data.summary, ''),
    };
  });
}

function winner<T>(rows: T[], score: (row: T) => number): T | null {
  if (rows.length === 0) return null;
  return rows.reduce((best, row) => score(row) > score(best) ? row : best, rows[0]);
}

function buildPublicModelArtifactContent(body: Record<string, any>) {
  const artifactPayload = safeRecord(body.artifactPayload);
  const title = compactText(body.title || artifactPayload.title || artifactPayload.canvasTitle, 'SMBx model export');
  const savedAt = compactText(artifactPayload.savedAt, new Date().toISOString());
  const rows = modelRowsFromArtifactPayload(artifactPayload);
  const byScore = winner(rows, row => row.score ?? -Infinity);
  const byEarnings = winner(rows, row => row.earningsValue ?? -Infinity);
  const byRisk = winner(rows, row => -row.riskCount);
  const byPrice = winner(rows, row => row.multiple == null ? -Infinity : -row.multiple);
  const comparisonLabel = rows.length > 1 ? `${rows.length} visible deals` : rows[0]?.deal || 'visible model';
  const yuliaRead = compactText(artifactPayload.yuliaRead, 'Exported from the live interactive canvas.');
  const rowMarkdown = rows
    .map(row => `| ${row.deal} | ${row.scoreDisplay} | ${row.read} | ${row.sde} | ${row.ebitda} | ${row.valuation} |`)
    .join('\n');

  const winRows = [
    { Lens: 'Best live model', Winner: byScore?.deal || '—', Read: byScore ? `${byScore.scoreDisplay} model score` : '—' },
    { Lens: 'Best price discipline', Winner: byPrice?.deal || '—', Read: byPrice?.multiple == null ? 'Needs multiple support' : `${byPrice.multiple.toFixed(1)}x EBITDA basis` },
    { Lens: 'Most earnings scale', Winner: byEarnings?.deal || '—', Read: byEarnings?.ebitda || '—' },
    { Lens: 'Lowest proof burden', Winner: byRisk?.deal || '—', Read: byRisk ? `${byRisk.riskCount} visible risks/gaps` : '—' },
  ];

  const markdown = [
    `# ${title}`,
    '',
    `Exported: ${new Date(savedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`,
    `Scope: ${comparisonLabel}`,
    '',
    '> Model output only. This is not legal, tax, investment, or transaction advice.',
    '',
    '## Yulia read',
    yuliaRead,
    '',
    '## Model output',
    '| Deal | Score | Read | SDE | EBITDA | Value range |',
    '|---|---:|---|---:|---:|---:|',
    rowMarkdown,
    '',
    '## What wins out',
    ...winRows.map(row => `- **${row.Lens}:** ${row.Winner} — ${row.Read}`),
    '',
    '## File boundary',
    'This demo export was generated from the visible canvas state. Logged-in saved boards are filed privately under the related deal Models folder and are not added to a data room unless the user explicitly files them there.',
  ].join('\n');

  return {
    company_name: title,
    subtitle: 'Model comparison export',
    markdown,
    sections: [
      {
        title: 'Decision frame',
        body: yuliaRead,
        bullets: [
          `Exported ${new Date(savedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`,
          `${comparisonLabel} on the current canvas`,
          'Model output only. Not legal, tax, investment, or transaction advice.',
        ],
      },
      {
        title: 'Model output',
        table: rows.map(row => ({
          Deal: row.deal,
          Score: row.scoreDisplay,
          Read: row.read,
          SDE: row.sde,
          EBITDA: row.ebitda,
          Value: row.valuation,
        })),
      },
      {
        title: 'What wins out',
        table: winRows,
      },
      {
        title: 'Sharing boundary',
        body: 'Demo exports are generated from the live canvas. Logged-in saved boards are saved to the deal file library under Models. Data-room publication remains a separate explicit action.',
      },
    ],
  };
}

exportRouter.post('/model-artifacts/export/:format', async (req, res) => {
  const format = req.params.format.toLowerCase();
  if (!['pdf', 'pptx'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format. Use pdf or pptx.' });
  }

  try {
    const content = buildPublicModelArtifactContent(safeRecord(req.body));
    const title = compactText(req.body?.title || content.company_name, 'SMBx model export');
    const buffer = format === 'pdf'
      ? await exportToPDF(content, title)
      : await exportToPPTX(content, title);
    const safeName = title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_').substring(0, 60);

    res.set({
      'Content-Type': CONTENT_TYPES[format],
      'Content-Disposition': `attachment; filename="${safeName || 'smbx-model-export'}${FILE_EXTENSIONS[format]}"`,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'no-store',
    });

    return res.send(buffer);
  } catch (err: any) {
    console.error('Public model artifact export error:', err.message);
    return res.status(500).json({ error: 'Failed to export model artifact' });
  }
});

// ─── Export deliverable ──────────────────────────────────────

exportRouter.post('/deliverables/:id/export/:format', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const deliverableId = parseInt(req.params.id, 10);
  const format = req.params.format.toLowerCase();

  if (!['pdf', 'docx', 'xlsx', 'pptx'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format. Use pdf, docx, xlsx, or pptx.' });
  }

  try {
    // Fetch deliverable with content
    const [deliverable] = await sql`
      SELECT d.id, d.deal_id, d.content, d.status,
             m.name, m.slug
      FROM deliverables d
      JOIN menu_items m ON m.id = d.menu_item_id
      WHERE d.id = ${deliverableId}
    `;

    if (!deliverable) return res.status(404).json({ error: 'Deliverable not found' });

    // RBAC check
    const access = await hasDealAccess(deliverable.deal_id, userId);
    if (!access) return res.status(404).json({ error: 'Deliverable not found' });

    if (!['complete', 'completed'].includes(deliverable.status)) {
      return res.status(400).json({ error: 'Deliverable is not yet completed' });
    }

    // Parse content
    const content = typeof deliverable.content === 'string'
      ? JSON.parse(deliverable.content)
      : deliverable.content;

    if (!content) {
      return res.status(400).json({ error: 'Deliverable has no content' });
    }

    const title = deliverable.name || 'Export';
    const slug = deliverable.slug || 'export';
    const isLOI = slug.includes('loi') || slug.includes('letter_of_intent');

    // Watermark for non-owner participants
    let watermark: string | undefined;
    if (access.role !== 'owner' && format === 'pdf') {
      const [viewer] = await sql`SELECT email FROM users WHERE id = ${userId}`;
      if (viewer?.email) watermark = viewer.email;
    }

    let buffer: Buffer;

    if (format === 'pdf') {
      const premiumTemplate = getPremiumTemplateKey(slug);
      if (premiumTemplate && !isLOI) {
        buffer = await renderPremiumPdf({ template: premiumTemplate, data: content, title, watermark });
      } else if (isLOI) {
        buffer = await exportLOIToPDF(content, title);
      } else {
        buffer = await exportToPDF(content, title, { watermark });
      }
    } else if (format === 'docx') {
      buffer = await exportToDOCX(content, title);
    } else if (format === 'pptx') {
      buffer = await exportToPPTX(content, title);
    } else {
      buffer = await exportToXLSX(content, title);
    }

    // Sanitize filename
    const safeName = title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_').substring(0, 60);
    const filename = `${safeName}${FILE_EXTENSIONS[format]}`;

    res.set({
      'Content-Type': CONTENT_TYPES[format],
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    return res.send(buffer);
  } catch (err: any) {
    console.error('Export error:', err.message);
    return res.status(500).json({ error: 'Failed to export deliverable' });
  }
});

// ─── Full deal data export (ZIP) ──────────────────────────────

exportRouter.get('/deals/:dealId/export-all', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const dealId = parseInt(req.params.dealId, 10);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal ID' });

  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });

    const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const safeName = (deal.business_name || `deal-${dealId}`).replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_').substring(0, 40);
    const filename = `${safeName}_export.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    // 1. Deal summary JSON
    const dealSummary = {
      id: deal.id,
      journey_type: deal.journey_type,
      current_gate: deal.current_gate,
      league: deal.league,
      business_name: deal.business_name,
      industry: deal.industry,
      location: deal.location,
      revenue: deal.revenue,
      sde: deal.sde,
      ebitda: deal.ebitda,
      asking_price: deal.asking_price,
      financials: deal.financials,
      status: deal.status,
      created_at: deal.created_at,
      updated_at: deal.updated_at,
    };
    archive.append(JSON.stringify(dealSummary, null, 2), { name: 'deal_summary.json' });

    // 2. Deliverables
    const deliverables = await sql`
      SELECT d.id, d.status, d.content, d.created_at, d.completed_at,
             m.name, m.slug
      FROM deliverables d
      JOIN menu_items m ON m.id = d.menu_item_id
      WHERE d.deal_id = ${dealId}
      ORDER BY d.created_at ASC
    `;

    for (const del of deliverables as any[]) {
      if (!del.content) continue;
      const content = typeof del.content === 'string' ? JSON.parse(del.content) : del.content;
      const markdown = content.markdown || content.text || JSON.stringify(content, null, 2);
      const delName = (del.name || del.slug || `deliverable-${del.id}`).replace(/[^a-zA-Z0-9_\- ]/g, '_');
      archive.append(markdown, { name: `deliverables/${delName}.md` });
    }

    // 3. Data room documents (metadata + file content if available)
    const documents = await sql`
      SELECT id, name, file_type, file_url, file_size, status, created_at
      FROM data_room_documents
      WHERE deal_id = ${dealId}
      ORDER BY created_at ASC
    `;

    const docManifest: any[] = [];
    for (const doc of documents as any[]) {
      docManifest.push({
        id: doc.id,
        name: doc.name,
        file_type: doc.file_type,
        file_size: doc.file_size,
        status: doc.status,
        created_at: doc.created_at,
      });

      // Try to include actual files (S3 or local)
      if (doc.file_url) {
        try {
          const { downloadFile } = await import('../services/storageService.js');
          const fileData = await downloadFile(doc.file_url);
          const docName = (doc.name || `document-${doc.id}`).replace(/[^a-zA-Z0-9._\- ]/g, '_');
          archive.append(fileData, { name: `data_room/${docName}` });
        } catch { /* file may not exist */ }
      }
    }
    archive.append(JSON.stringify(docManifest, null, 2), { name: 'data_room/manifest.json' });

    // 4. Conversation transcripts
    const conversations = await sql`
      SELECT id, title, gate_status, gate_label, summary, created_at, updated_at
      FROM conversations
      WHERE deal_id = ${dealId} AND user_id = ${userId}
      ORDER BY created_at ASC
    `;

    for (const convo of conversations as any[]) {
      const msgs = await sql`
        SELECT role, content, created_at FROM messages
        WHERE conversation_id = ${convo.id}
        ORDER BY created_at ASC
      `;

      const lines: string[] = [
        `# ${convo.title}`,
        `Gate: ${convo.gate_label || 'N/A'} | Status: ${convo.gate_status || 'active'}`,
        convo.summary ? `Summary: ${convo.summary}` : '',
        `Created: ${convo.created_at}`,
        '',
        '---',
        '',
      ];

      for (const msg of msgs as any[]) {
        const speaker = msg.role === 'user' ? 'User' : 'Yulia';
        const time = new Date(msg.created_at).toISOString();
        lines.push(`**${speaker}** (${time}):`);
        lines.push(msg.content || '');
        lines.push('');
      }

      const convoName = (convo.title || `conversation-${convo.id}`).replace(/[^a-zA-Z0-9_\- ]/g, '_').substring(0, 60);
      archive.append(lines.join('\n'), { name: `conversations/${convoName}.md` });
    }

    await archive.finalize();
  } catch (err: any) {
    console.error('Full export error:', err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to export deal data' });
    }
  }
});
