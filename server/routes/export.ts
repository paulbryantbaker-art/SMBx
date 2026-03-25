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
import { readFile } from 'fs/promises';

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

    if (deliverable.status !== 'completed') {
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
      buffer = isLOI
        ? await exportLOIToPDF(content, title)
        : await exportToPDF(content, title, { watermark });
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

      // Try to include actual files
      if (doc.file_url) {
        try {
          const fileData = await readFile(doc.file_url);
          const ext = doc.name?.split('.').pop() || doc.file_type || 'bin';
          const docName = (doc.name || `document-${doc.id}`).replace(/[^a-zA-Z0-9._\- ]/g, '_');
          archive.append(fileData, { name: `data_room/${docName}` });
        } catch { /* file may not exist on disk */ }
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
