import { Router } from 'express';
import {
  addPitchBookSection,
  createPitchBook,
  getPitchBookModelIds,
  getPitchBook,
  listPitchBookFormats,
  listPitchBooks,
  pitchBookToExportContent,
  recordPitchBookExport,
  refreshPitchBookFromModels,
  revisePitchBook,
} from '../services/pitchBookStudio.js';
import { exportPitchBookToPPTX } from '../services/pitchBookExportService.js';
import { exportToPDF } from '../services/exportService.js';
import { readStudioBookV19Readiness } from '../services/v19ReadinessService.js';
import {
  checkV19Entitlement,
  formatV19TollgateForYulia,
  readV19UsageMeter,
  recordV19UsageEvent,
  type V19EntitlementCheck,
} from '../services/v19EntitlementService.js';

export const studioRouter = Router();

function userIdFromReq(req: any): number | null {
  const id = Number(req.userId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function tollgateStatus(check: V19EntitlementCheck): number {
  if (check.tollgate?.code === 'credit_budget_required') return 402;
  if (check.tollgate?.code === 'enterprise_scope_required') return 403;
  if (check.tollgate?.code === 'human_approval_required') return 428;
  return 403;
}

function tollgatePayload(check: V19EntitlementCheck) {
  return {
    error: check.tollgate?.message || 'This action is not available on the current plan',
    tollgate: formatV19TollgateForYulia(check.tollgate),
    usage: check.meter,
  };
}

studioRouter.get('/studio/formats', (_req, res) => {
  res.json({ formats: listPitchBookFormats() });
});

studioRouter.get('/studio/pitch-books', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const books = await listPitchBooks(userId);
    return res.json({ books });
  } catch (err: any) {
    console.error('[studio] list pitch books failed:', err.message);
    return res.status(500).json({ error: 'Failed to load pitch books' });
  }
});

studioRouter.post('/studio/pitch-books', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const gate = await checkV19Entitlement(userId, 'studio_book', {
      actionId: 'create_pitch_book',
      toolName: 'create_pitch_book',
      sourceSurface: 'studio',
      resourceType: 'studio_book',
      metadata: { format: req.body?.format },
    });
    if (!gate.allowed) return res.status(tollgateStatus(gate)).json(tollgatePayload(gate));

    const book = await createPitchBook({
      userId,
      dealId: req.body?.dealId == null ? null : Number(req.body.dealId),
      format: req.body?.format,
      title: req.body?.title,
      brief: req.body?.brief,
    });
    await recordV19UsageEvent({
      userId,
      eventType: 'studio_book',
      actionId: 'create_pitch_book',
      toolName: 'create_pitch_book',
      sourceSurface: 'studio',
      resourceType: 'studio_book',
      resourceId: book.id,
      metadata: { format: book.format, dealId: book.dealId },
    });
    const readiness = await readStudioBookV19Readiness(userId, book.id);
    const usage = await readV19UsageMeter(userId);
    return res.status(201).json({ book, readiness, usage });
  } catch (err: any) {
    console.error('[studio] create pitch book failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to create pitch book' });
  }
});

studioRouter.get('/studio/pitch-books/:bookId', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const bookId = parseId(req.params.bookId);
  if (!bookId) return res.status(400).json({ error: 'Invalid pitch book id' });
  try {
    const book = await getPitchBook(userId, bookId);
    if (!book) return res.status(404).json({ error: 'Pitch book not found' });
    const readiness = await readStudioBookV19Readiness(userId, book.id);
    return res.json({ book, readiness });
  } catch (err: any) {
    console.error('[studio] read pitch book failed:', err.message);
    return res.status(500).json({ error: 'Failed to load pitch book' });
  }
});

studioRouter.post('/studio/pitch-books/:bookId/revise', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const bookId = parseId(req.params.bookId);
  if (!bookId) return res.status(400).json({ error: 'Invalid pitch book id' });
  try {
    const book = await revisePitchBook({
      userId,
      bookId,
      instruction: String(req.body?.instruction || ''),
    });
    const readiness = await readStudioBookV19Readiness(userId, book.id);
    return res.json({ book, readiness });
  } catch (err: any) {
    console.error('[studio] revise pitch book failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to revise pitch book' });
  }
});

studioRouter.post('/studio/pitch-books/:bookId/sections', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const bookId = parseId(req.params.bookId);
  if (!bookId) return res.status(400).json({ error: 'Invalid pitch book id' });
  try {
    const book = await addPitchBookSection({
      userId,
      bookId,
      title: String(req.body?.title || ''),
      body: typeof req.body?.body === 'string' ? req.body.body : null,
      bullets: Array.isArray(req.body?.bullets) ? req.body.bullets.map(String) : [],
    });
    const readiness = await readStudioBookV19Readiness(userId, book.id);
    return res.json({ book, readiness });
  } catch (err: any) {
    console.error('[studio] add pitch book section failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to add section' });
  }
});

studioRouter.post('/studio/pitch-books/:bookId/refresh', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const bookId = parseId(req.params.bookId);
  if (!bookId) return res.status(400).json({ error: 'Invalid pitch book id' });
  try {
    const existing = await getPitchBook(userId, bookId);
    if (!existing) return res.status(404).json({ error: 'Pitch book not found' });
    const modelIds = getPitchBookModelIds(existing);
    const gate = await checkV19Entitlement(userId, 'model_run', {
      quantity: modelIds.length || 1,
      actionId: 'refresh_pitch_book_from_models',
      toolName: 'refresh_pitch_book_from_models',
      sourceSurface: 'studio',
      resourceType: 'studio_book',
      resourceId: bookId,
      metadata: { modelIds },
    });
    if (!gate.allowed) return res.status(tollgateStatus(gate)).json(tollgatePayload(gate));

    const book = await refreshPitchBookFromModels(userId, bookId);
    await recordV19UsageEvent({
      userId,
      eventType: 'model_run',
      quantity: modelIds.length || 1,
      actionId: 'refresh_pitch_book_from_models',
      toolName: 'refresh_pitch_book_from_models',
      sourceSurface: 'studio',
      resourceType: 'studio_book',
      resourceId: book.id,
      metadata: { modelIds },
    });
    const readiness = await readStudioBookV19Readiness(userId, book.id);
    const usage = await readV19UsageMeter(userId);
    return res.json({ book, readiness, usage });
  } catch (err: any) {
    console.error('[studio] refresh pitch book failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to refresh pitch book' });
  }
});

studioRouter.get('/studio/pitch-books/:bookId/readiness', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const bookId = parseId(req.params.bookId);
  if (!bookId) return res.status(400).json({ error: 'Invalid pitch book id' });
  try {
    const readiness = await readStudioBookV19Readiness(userId, bookId);
    return res.json({ readiness });
  } catch (err: any) {
    console.error('[studio] read pitch book readiness failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to read pitch book readiness' });
  }
});

studioRouter.get('/studio/pitch-books/:bookId/export/:format', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const bookId = parseId(req.params.bookId);
  const format = String(req.params.format || '').toLowerCase();
  if (!bookId) return res.status(400).json({ error: 'Invalid pitch book id' });
  if (format !== 'pptx' && format !== 'pdf') return res.status(400).json({ error: 'Invalid export format' });

  try {
    const book = await getPitchBook(userId, bookId);
    if (!book) return res.status(404).json({ error: 'Pitch book not found' });
    const readiness = await readStudioBookV19Readiness(userId, book.id);
    const strict = req.query.strict === '1' || req.query.strict === 'true';
    if (strict && !readiness.readyForExternalDelivery) {
      return res.status(409).json({
        error: 'Pitch book is not ready for external delivery',
        readiness,
      });
    }
    const gate = await checkV19Entitlement(userId, 'studio_export', {
      actionId: 'export_pitch_book',
      toolName: 'export_pitch_book',
      sourceSurface: 'studio',
      resourceType: 'studio_book',
      resourceId: book.id,
      metadata: { format, strict, readyForExternalDelivery: readiness.readyForExternalDelivery },
    });
    if (!gate.allowed) return res.status(tollgateStatus(gate)).json(tollgatePayload(gate));

    const content = pitchBookToExportContent(book);
    const buffer = format === 'pptx'
      ? await exportPitchBookToPPTX(book)
      : await exportToPDF(content, book.title);
    const exportRecord = await recordPitchBookExport(userId, book.id, format, buffer);
    await recordV19UsageEvent({
      userId,
      eventType: 'studio_export',
      actionId: 'export_pitch_book',
      toolName: 'export_pitch_book',
      sourceSurface: 'studio',
      resourceType: 'studio_export',
      resourceId: exportRecord.exportId,
      metadata: {
        bookId: book.id,
        format,
        strict,
        outputHash: exportRecord.outputHash,
        readyForExternalDelivery: readiness.readyForExternalDelivery,
      },
    });
    const safeName = book.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_').substring(0, 60);

    res.set({
      'Content-Type': format === 'pptx'
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName || 'smbx-pitch-book'}.${format}"`,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'no-store',
      'X-SMBX-Export-Id': String(exportRecord.exportId),
      'X-SMBX-Output-Hash': exportRecord.outputHash,
      'X-SMBX-V19-Ready': readiness.readyForExternalDelivery ? 'true' : 'false',
      'X-SMBX-V19-Warnings': String(readiness.issues.length),
    });
    return res.send(buffer);
  } catch (err: any) {
    console.error('[studio] export pitch book failed:', err.message);
    return res.status(500).json({ error: 'Failed to export pitch book' });
  }
});
