/**
 * Export Routes — PDF, DOCX, XLSX download endpoints for deliverables.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { hasDealAccess } from '../services/dealAccessService.js';
import { exportToPDF, exportToDOCX, exportToXLSX, exportLOIToPDF } from '../services/exportService.js';

export const exportRouter = Router();

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const FILE_EXTENSIONS: Record<string, string> = {
  pdf: '.pdf',
  docx: '.docx',
  xlsx: '.xlsx',
};

// ─── Export deliverable ──────────────────────────────────────

exportRouter.post('/deliverables/:id/export/:format', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const deliverableId = parseInt(req.params.id, 10);
  const format = req.params.format.toLowerCase();

  if (!['pdf', 'docx', 'xlsx'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format. Use pdf, docx, or xlsx.' });
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
