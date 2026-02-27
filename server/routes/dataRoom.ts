/**
 * Data Room Routes — Folder structure, documents, and file management per deal.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const dataRoomRouter = Router();
dataRoomRouter.use(requireAuth);

// Default folder templates by journey gate
const FOLDER_TEMPLATES: Record<string, { name: string; gate: string | null; sort: number }[]> = {
  sell: [
    { name: 'Financials', gate: null, sort: 0 },
    { name: 'Valuation', gate: 'S2', sort: 1 },
    { name: 'Marketing', gate: 'S3', sort: 2 },
    { name: 'Buyer Management', gate: 'S4', sort: 3 },
    { name: 'Closing', gate: 'S5', sort: 4 },
  ],
  buy: [
    { name: 'Thesis & Criteria', gate: null, sort: 0 },
    { name: 'Target Analysis', gate: 'B2', sort: 1 },
    { name: 'Due Diligence', gate: 'B3', sort: 2 },
    { name: 'Deal Structure', gate: 'B4', sort: 3 },
    { name: 'Closing', gate: 'B5', sort: 4 },
  ],
  raise: [
    { name: 'Financials', gate: null, sort: 0 },
    { name: 'Investor Materials', gate: 'R2', sort: 1 },
    { name: 'Outreach', gate: 'R3', sort: 2 },
    { name: 'Term Sheets', gate: 'R4', sort: 3 },
    { name: 'Closing', gate: 'R5', sort: 4 },
  ],
  pmi: [
    { name: 'Acquisition Docs', gate: null, sort: 0 },
    { name: 'Integration Plan', gate: 'PMI1', sort: 1 },
    { name: 'Assessment', gate: 'PMI2', sort: 2 },
    { name: 'Optimization', gate: 'PMI3', sort: 3 },
  ],
};

/** Auto-create folder structure for a deal */
async function ensureFolders(dealId: number, journeyType: string, currentGate: string) {
  const templates = FOLDER_TEMPLATES[journeyType] || FOLDER_TEMPLATES.sell;

  // Get current gate index to determine which folders to show
  const gateIndex = parseInt(currentGate.replace(/[A-Z]+/g, ''), 10) || 0;

  for (const tmpl of templates) {
    // Show folder if no gate requirement or if we've reached that gate
    if (tmpl.gate) {
      const folderGateIndex = parseInt(tmpl.gate.replace(/[A-Z]+/g, ''), 10) || 0;
      if (gateIndex < folderGateIndex) continue;
    }

    await sql`
      INSERT INTO data_room_folders (deal_id, name, gate, sort_order)
      VALUES (${dealId}, ${tmpl.name}, ${tmpl.gate}, ${tmpl.sort})
      ON CONFLICT (deal_id, name) DO NOTHING
    `.catch(() => {}); // Ignore if already exists
  }
}

// ─── Get data room (folders + documents) ────────────────────

dataRoomRouter.get('/deals/:dealId/data-room', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [deal] = await sql`SELECT id, journey_type, current_gate FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    // Ensure folders exist
    await ensureFolders(dealId, deal.journey_type, deal.current_gate);

    // Get folders
    const folders = await sql`
      SELECT id, name, gate, sort_order
      FROM data_room_folders
      WHERE deal_id = ${dealId}
      ORDER BY sort_order
    `;

    // Get documents
    const documents = await sql`
      SELECT d.id, d.folder_id, d.name, d.file_type, d.status, d.version,
             d.deliverable_id, d.created_at, d.updated_at,
             del.status as deliverable_status, del.completed_at as deliverable_completed_at
      FROM data_room_documents d
      LEFT JOIN deliverables del ON del.id = d.deliverable_id
      WHERE d.deal_id = ${dealId}
      ORDER BY d.created_at DESC
    `;

    // Get generated deliverables not yet filed
    const unfiledDeliverables = await sql`
      SELECT d.id, d.status, d.created_at, d.completed_at,
             m.name, m.slug, m.tier, m.gate, m.journey
      FROM deliverables d
      JOIN menu_items m ON m.id = d.menu_item_id
      WHERE d.deal_id = ${dealId} AND d.user_id = ${userId}
        AND d.id NOT IN (SELECT deliverable_id FROM data_room_documents WHERE deliverable_id IS NOT NULL AND deal_id = ${dealId})
      ORDER BY d.created_at DESC
    `;

    return res.json({ folders, documents, unfiledDeliverables });
  } catch (err: any) {
    console.error('Data room error:', err.message);
    return res.status(500).json({ error: 'Failed to load data room' });
  }
});

// ─── File a deliverable into a folder ───────────────────────

dataRoomRouter.post('/deals/:dealId/data-room/file', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const { deliverableId, folderId } = req.body;

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const [deliverable] = await sql`SELECT id, status FROM deliverables d JOIN menu_items m ON m.id = d.menu_item_id WHERE d.id = ${deliverableId} AND d.deal_id = ${dealId}`;
    if (!deliverable) return res.status(404).json({ error: 'Deliverable not found' });

    const [menuItem] = await sql`SELECT name FROM menu_items WHERE id = (SELECT menu_item_id FROM deliverables WHERE id = ${deliverableId})`;

    const [doc] = await sql`
      INSERT INTO data_room_documents (deal_id, folder_id, user_id, deliverable_id, name, file_type, status)
      VALUES (${dealId}, ${folderId || null}, ${userId}, ${deliverableId}, ${menuItem?.name || 'Deliverable'}, 'deliverable', 'draft')
      ON CONFLICT DO NOTHING
      RETURNING id, name, status
    `;

    return res.json(doc || { filed: true });
  } catch (err: any) {
    console.error('File deliverable error:', err.message);
    return res.status(500).json({ error: 'Failed to file deliverable' });
  }
});

// ─── Update document status ─────────────────────────────────

dataRoomRouter.patch('/data-room/documents/:docId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const docId = parseInt(req.params.docId, 10);
    const { status } = req.body;

    const validStatuses = ['draft', 'review', 'approved', 'locked'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    // Check ownership
    const [doc] = await sql`SELECT id, status FROM data_room_documents WHERE id = ${docId} AND user_id = ${userId}`;
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (doc.status === 'locked') return res.status(400).json({ error: 'Document is locked and cannot be modified' });

    const [updated] = await sql`
      UPDATE data_room_documents SET status = ${status}, updated_at = NOW()
      WHERE id = ${docId}
      RETURNING id, status, updated_at
    `;

    return res.json(updated);
  } catch (err: any) {
    console.error('Update document error:', err.message);
    return res.status(500).json({ error: 'Failed to update document' });
  }
});
