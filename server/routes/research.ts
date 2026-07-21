/**
 * Research Agent + Studio campaign routes (internal-only — mounted after the
 * blanket /api requireAuth, inside the practice-mode perimeter). Paul's
 * control panel: topic, type, depth, output format per run; campaigns
 * (research_schedules) put a topic on a cadence. Artifacts (letter PDF,
 * LinkedIn card PNG, raw markdown) render on demand from the stored run.
 */
import { fillPostCard } from '../services/postcardFiller.js';
import { Router } from 'express';
import { sql } from '../db.js';
import {
  RESEARCH_TYPES,
  DEPTHS,
  OUTPUT_FORMATS,
  CADENCES,
  POST_ANGLES,
  validateRunInput,
  createResearchRun,
  executeResearchRun,
  getMonthSpendCents,
  getMonthlyCapCents,
  nextRunAt,
  parseCampaignPlan,
} from '../services/researchAgent.js';
import { renderResearchPdf, renderResearchCardPng, renderLinkedInDocPdf, renderCoverPng, researchPostText, renderAnnouncementCardPng, docPages, type ResearchRunRow, type AnnouncementSpec, renderPostCardPng, type PostCardSpec } from '../services/researchComposer.js';
import { listStudioAssets, getStudioAsset, createStudioAsset, updateStudioAsset, deleteStudioAsset } from '../services/studioAssets.js';
import { importLinkedInWorkbook, analyzeLinkedInImport } from '../services/linkedinAnalytics.js';
import multer from 'multer';

export const researchRouter = Router();

/* Media uploads: images only, memory storage (bytes land in Postgres). */
const assetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype));
  },
});

/* Plan imports: a strategy PDF (sent to Claude as a native document block)
 * or a text/markdown file. */
const planUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/') || file.mimetype === 'application/octet-stream');
  },
});

/* Analytics imports: LinkedIn's .xlsx export (parsed mechanically server-side). */
const xlsxUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /\.xlsx?$/i.test(file.originalname) ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/octet-stream');
  },
});

function userIdFromReq(req: any): number | null {
  const id = Number(req.userId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function slugify(s: string): string {
  return (s || 'research').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'research';
}

/* ─── catalog + usage ─────────────────────────────────────────────────── */

researchRouter.get('/research/catalog', (_req, res) => {
  res.json({
    types: RESEARCH_TYPES.map(t => ({ key: t.key, label: t.label, blurb: t.blurb })),
    depths: DEPTHS.map(d => ({ key: d.key, label: d.label, blurb: d.blurb })),
    angles: POST_ANGLES.map(a => ({ key: a.key, label: a.label, blurb: a.blurb })),
    formats: OUTPUT_FORMATS,
    cadences: CADENCES,
  });
});

researchRouter.get('/research/usage', async (_req, res) => {
  try {
    const spentCents = await getMonthSpendCents();
    res.json({ spentCents, capCents: Number.isFinite(getMonthlyCapCents()) ? getMonthlyCapCents() : null });
  } catch (err: any) {
    console.error('[research] usage failed:', err.message);
    res.status(500).json({ error: 'Failed to load usage' });
  }
});

/* ─── runs ────────────────────────────────────────────────────────────── */

researchRouter.post('/research/runs', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const input: any = {
    userId,
    researchType: String(req.body?.researchType ?? ''),
    topic: String(req.body?.topic ?? ''),
    depth: String(req.body?.depth ?? 'standard'),
    outputFormat: String(req.body?.outputFormat ?? 'report'),
    postAngle: String(req.body?.postAngle ?? 'auto'),
  };
  const invalid = validateRunInput(input);
  if (invalid) return res.status(400).json({ error: invalid });
  try {
    // Optional: tie the run to a campaign ("Run now" from a campaign folder).
    if (req.body?.scheduleId != null) {
      const sid = Number(req.body.scheduleId);
      if (Number.isInteger(sid) && sid > 0) {
        const [sched] = await sql`SELECT id FROM research_schedules WHERE id = ${sid} AND user_id = ${userId}`;
        if (!sched) return res.status(404).json({ error: 'Campaign not found' });
        input.scheduleId = sid;
      }
    }
    const spent = await getMonthSpendCents();
    if (spent >= getMonthlyCapCents()) {
      return res.status(429).json({ error: `Monthly research budget reached ($${(spent / 100).toFixed(0)} of $${(getMonthlyCapCents() / 100).toFixed(0)}).` });
    }
    const [{ active }] = await sql`SELECT COUNT(*)::int AS active FROM research_runs WHERE user_id = ${userId} AND status IN ('queued', 'running')`;
    if (Number(active) >= 2) return res.status(429).json({ error: 'Two runs are already in flight — let one finish first.' });

    const id = await createResearchRun(input);
    executeResearchRun(id).catch(err => console.error(`[research] Run ${id} crashed:`, err?.message));
    return res.json({ id });
  } catch (err: any) {
    console.error('[research] create run failed:', err.message);
    return res.status(500).json({ error: 'Failed to start the run' });
  }
});

researchRouter.get('/research/runs', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const runs = await sql`
      SELECT id, schedule_id, research_type, topic, depth, output_format, post_angle, status, progress,
             report_title, (studio_feed IS NOT NULL) AS has_feed, review_status, archived, error, usage, created_at, completed_at
      FROM research_runs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 60
    `;
    return res.json({ runs });
  } catch (err: any) {
    console.error('[research] list runs failed:', err.message);
    return res.status(500).json({ error: 'Failed to load runs' });
  }
});

researchRouter.get('/research/runs/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad run id' });
  try {
    const [run] = await sql`SELECT * FROM research_runs WHERE id = ${id} AND user_id = ${userId}`;
    if (!run) return res.status(404).json({ error: 'Run not found' });
    return res.json({ run });
  } catch (err: any) {
    console.error('[research] get run failed:', err.message);
    return res.status(500).json({ error: 'Failed to load run' });
  }
});

researchRouter.delete('/research/runs/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad run id' });
  try {
    await sql`DELETE FROM research_runs WHERE id = ${id} AND user_id = ${userId}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[research] delete run failed:', err.message);
    return res.status(500).json({ error: 'Failed to delete run' });
  }
});

/** Import a campaign plan (2026-07-19): a Claude-written strategy PDF or
 *  pasted text goes to Claude as-is; back come proposed campaigns in the
 *  app's vocabulary. Parse-only — creation happens from the review sheet
 *  via the normal POST /research/schedules. */
researchRouter.post('/research/import-plan', planUpload.single('file'), async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  const file = (req as any).file as { buffer: Buffer; mimetype: string; originalname: string } | undefined;
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  if (!file && !text.trim()) return res.status(400).json({ error: 'Attach the plan (PDF) or paste its text' });
  try {
    const isPdf = !!file && (file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname));
    const out = await parseCampaignPlan({
      pdf: isPdf ? file!.buffer : undefined,
      text: !isPdf && file ? file.buffer.toString('utf8') : text,
    });
    return res.json(out);
  } catch (err: any) {
    console.error('[research] import-plan failed:', err?.message);
    const apiMsg = err?.error?.error?.message;
    return res.status(500).json({ error: apiMsg ? String(apiMsg) : (err?.message || 'Import failed') });
  }
});

/* ─── Performance: LinkedIn analytics imports + Yulia's read ──────────────
   The workbook is parsed MECHANICALLY (zero hallucination — the stored data
   is exactly what LinkedIn exported); the analysis is a separate on-demand
   Claude pass with no web tools that may only cite the stored numbers. */

researchRouter.post('/research/analytics', xlsxUpload.single('workbook'), async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const file = (req as any).file as { buffer: Buffer; originalname: string } | undefined;
  if (!file) return res.status(400).json({ error: 'Attach the LinkedIn analytics .xlsx export' });
  try {
    const id = await importLinkedInWorkbook(userId, file.originalname, file.buffer);
    return res.json({ id });
  } catch (err: any) {
    console.error('[research] analytics import failed:', err?.message);
    return res.status(400).json({ error: err?.message || 'Could not read the workbook' });
  }
});

researchRouter.get('/research/analytics', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const items = await sql`
      SELECT id, label, source, period_start, period_end, analysis_status, analysis_error,
             (analysis IS NOT NULL) AS has_analysis, created_at
      FROM studio_analytics WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 40`;
    return res.json({ items });
  } catch (err: any) {
    console.error('[research] analytics list failed:', err.message);
    return res.status(500).json({ error: 'Failed to load analytics' });
  }
});

researchRouter.get('/research/analytics/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad import id' });
  try {
    const [row] = await sql`
      SELECT id, label, source, period_start, period_end, analysis, analysis_status, analysis_error,
             data->'summary' AS summary, created_at
      FROM studio_analytics WHERE id = ${id} AND user_id = ${userId}`;
    if (!row) return res.status(404).json({ error: 'Import not found' });
    return res.json({ item: row });
  } catch (err: any) {
    console.error('[research] analytics get failed:', err.message);
    return res.status(500).json({ error: 'Failed to load the import' });
  }
});

researchRouter.post('/research/analytics/:id/analyze', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad import id' });
  try {
    const [row] = await sql`SELECT id, analysis_status FROM studio_analytics WHERE id = ${id} AND user_id = ${userId}`;
    if (!row) return res.status(404).json({ error: 'Import not found' });
    if ((row as any).analysis_status === 'running') return res.status(429).json({ error: 'The analysis is already running.' });
    analyzeLinkedInImport(id, userId).catch(err => console.error(`[research] analytics ${id} analysis crashed:`, err?.message));
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[research] analytics analyze failed:', err.message);
    return res.status(500).json({ error: 'Failed to start the analysis' });
  }
});

researchRouter.delete('/research/analytics/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad import id' });
  try {
    await sql`DELETE FROM studio_analytics WHERE id = ${id} AND user_id = ${userId}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[research] analytics delete failed:', err.message);
    return res.status(500).json({ error: 'Failed to delete the import' });
  }
});

/** Campaign-manager verbs (2026-07-18): archive/unarchive a run, and move it
 *  between campaigns (schedule_id) or out to one-offs — the library's
 *  organize actions. Only the fields present in the body change. */
researchRouter.patch('/research/runs/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad run id' });
  try {
    const [run] = await sql`SELECT id, schedule_id, archived FROM research_runs WHERE id = ${id} AND user_id = ${userId}`;
    if (!run) return res.status(404).json({ error: 'Run not found' });

    const b = req.body ?? {};
    let scheduleId: number | null = (run as any).schedule_id ?? null;
    if ('scheduleId' in b) {
      if (b.scheduleId === null || b.scheduleId === '') {
        scheduleId = null;
      } else {
        const sid = Number(b.scheduleId);
        if (!Number.isInteger(sid) || sid <= 0) return res.status(400).json({ error: 'Bad campaign id' });
        const [sched] = await sql`SELECT id FROM research_schedules WHERE id = ${sid} AND user_id = ${userId}`;
        if (!sched) return res.status(404).json({ error: 'Campaign not found' });
        scheduleId = sid;
      }
    }
    const archived = typeof b.archived === 'boolean' ? b.archived : (run as any).archived === true;
    await sql`UPDATE research_runs SET schedule_id = ${scheduleId}, archived = ${archived} WHERE id = ${id} AND user_id = ${userId}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[research] update run failed:', err.message);
    return res.status(500).json({ error: 'Failed to update the run' });
  }
});

/* ─── artifacts (rendered on demand) ──────────────────────────────────── */

/** File an exported artifact into the Collateral folder, linked to its run
 *  and campaign. A save hiccup must never fail the export itself. */
async function saveCollateral(run: any, label: string, mime: string, data: Buffer): Promise<void> {
  try {
    await createStudioAsset({
      label: label.slice(0, 140),
      mime,
      data,
      kind: 'collateral',
      runId: run.id ?? null,
      scheduleId: run.schedule_id ?? null,
    });
  } catch (err: any) {
    console.warn('[studio] collateral save failed:', err?.message);
  }
}

async function loadCompleteRun(id: number, userId: number): Promise<ResearchRunRow | null> {
  const [run] = await sql`SELECT * FROM research_runs WHERE id = ${id} AND user_id = ${userId} AND status = 'complete'`;
  if (!run) return null;
  // Review edits ride in feed_override; every artifact renders the edited
  // feed. MERGE over the original (never replace): overrides saved before
  // 2026-07-19 carried only {hooks, dataPoints}, and replacing wholesale
  // stripped post/docPages/chart — this read-time merge heals those rows.
  if ((run as any).feed_override) {
    (run as any).studio_feed = { ...((run as any).studio_feed ?? {}), ...((run as any).feed_override ?? {}) };
  }
  return run as any;
}


/* ─── review workflow (2026-07-18) ────────────────────────────────────────
 * Runs land as DRAFTS. The practitioner edits the studio feed (hook + data
 * points — stored as feed_override, the agent's original stays untouched),
 * re-previews, then approves. Artifact routes render the edited feed via
 * loadCompleteRun.
 */
researchRouter.get('/research/runs/:id/feed', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = Number(req.params.id);
  const run = await loadCompleteRun(id, userId);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  if (!run.studio_feed) return res.status(404).json({ error: 'This run has no studio feed' });
  const { deck: _deck, ...feedOut } = (run.studio_feed as any) ?? {};
  return res.json({ feed: feedOut, reviewStatus: (run as any).review_status ?? 'draft' });
});

researchRouter.patch('/research/runs/:id/feed', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = Number(req.params.id);
  const b = req.body?.feed ?? {};
  const str = (v: unknown, max: number) => String(v ?? '').slice(0, max).trim();
  const hooks = Array.isArray(b.hooks) ? b.hooks.map((h: unknown) => str(h, 240)).filter(Boolean).slice(0, 5) : [];
  const dataPoints = Array.isArray(b.dataPoints)
    ? b.dataPoints.slice(0, 4).map((p: any) => ({
        stat: str(p?.stat, 120),
        source: str(p?.source, 140),
        note: str(p?.note, 240) || undefined,
        freshness: str(p?.freshness, 40) || undefined,
        confidence: str(p?.confidence, 24) || undefined,
      })).filter((p: any) => p.stat)
    : [];
  if (!hooks.length) return res.status(400).json({ error: 'Keep at least one hook' });
  // Cover artwork pick (2026-07-20): undefined = leave as-is, null = "no
  // artwork" (split cover), number = that media asset (ownership-checked).
  let artAssetId: number | null | undefined = undefined;
  if ('artAssetId' in b) {
    if (b.artAssetId === null || b.artAssetId === '') artAssetId = null;
    else {
      const aid = Number(b.artAssetId);
      if (!Number.isInteger(aid) || aid <= 0) return res.status(400).json({ error: 'Bad artwork id' });
      const asset = await getStudioAsset(aid);
      if (!asset || !asset.mime.startsWith('image/')) return res.status(404).json({ error: 'Artwork not found' });
      artAssetId = aid;
    }
  }
  // Per-page artwork (2026-07-20, drag & drop): {finalPageIndex: assetId|null}.
  // Full replace on every save; the client always sends the complete map.
  let pageArt: Record<string, number> | undefined = undefined;
  if ('pageArt' in b) {
    pageArt = {};
    const entries = Object.entries(b.pageArt && typeof b.pageArt === 'object' ? b.pageArt : {}).slice(0, 12);
    for (const [k, v] of entries) {
      const idx = Number(k);
      if (!Number.isInteger(idx) || idx < 0 || idx > 11) continue;
      if (v === null || v === '') continue; // dropped back off — omit
      const aid = Number(v);
      if (!Number.isInteger(aid) || aid <= 0) return res.status(400).json({ error: 'Bad page artwork id' });
      const asset = await getStudioAsset(aid);
      if (!asset || !asset.mime.startsWith('image/')) return res.status(404).json({ error: 'Page artwork not found' });
      pageArt[String(idx)] = aid;
    }
  }
  try {
    // MERGE the edits over the full generated feed — storing only
    // {hooks, dataPoints} used to wipe post/docPages/chart out of the
    // effective feed and broke every artifact render after a review save.
    const [existing] = await sql`
      SELECT studio_feed, feed_override FROM research_runs
       WHERE id = ${id} AND user_id = ${userId} AND status = 'complete'`;
    if (!existing) return res.status(404).json({ error: 'Run not found' });
    const base = { ...((existing as any).studio_feed ?? {}), ...((existing as any).feed_override ?? {}) };
    const merged = { ...base, hooks, dataPoints, ...(artAssetId !== undefined ? { artAssetId } : {}), ...(pageArt !== undefined ? { pageArt } : {}) };
    const [row] = await sql`
      UPDATE research_runs
         SET feed_override = ${sql.json(merged)}::jsonb, review_status = 'draft'
       WHERE id = ${id} AND user_id = ${userId} AND status = 'complete'
       RETURNING id`;
    if (!row) return res.status(404).json({ error: 'Run not found' });
    // Warm the Claude-designed deck in the background so the re-preview and
    // the exports hit the cache instead of sitting through the design call.
    loadCompleteRun(id, userId)
      .then(fresh => fresh ? import('../services/researchComposer.js').then(m => m.designedDeckHtml(fresh as any)) : null)
      .catch(err => console.warn('[research] deck warm after save failed:', err?.message));
    return res.json({ ok: true });
  } catch (err) {
    console.error('[research] feed save failed', err);
    return res.status(500).json({ error: 'Save failed' });
  }
});

/** The carousel's pages in FINAL rendered order — the review sheet's
 *  drop targets for per-page artwork. Cover art rides feed.artAssetId;
 *  content pages ride feed.pageArt[index]. */
researchRouter.get('/research/runs/:id/pages', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad run id' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run || !run.studio_feed) return res.status(404).json({ error: 'Run not found' });
    const pages = docPages(run as any).map((p: any, i: number) => ({
      i, kind: p.kind, heading: String(p.heading ?? '').slice(0, 90), artAssetId: p.artAssetId ?? null,
    }));
    return res.json({ pages });
  } catch (err: any) {
    console.error('[research] pages failed:', err?.message);
    return res.status(500).json({ error: 'Couldn’t list the pages' });
  }
});

/** The run's copy-ready Gemini prompt (2026-07-20, Paul generates images in
 *  the Gemini app himself: "AFTER the research runs, it can generate the
 *  right image prompt for Gemini, i'll import and assign"). Composed from
 *  the feed's story-specific visual brief (else derived from the title)
 *  through the same single-scene style contract the API path uses. */
researchRouter.get('/research/runs/:id/artwork-prompt', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad run id' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    const feed = (run as any).studio_feed ?? {};
    const title = (run as any).report_title || (run as any).topic;
    const { artworkPrompt, derivedVisualBrief } = await import('../services/artworkService.js');
    const brief = String(feed.visual ?? '').trim() || derivedVisualBrief(title);
    return res.json({ prompt: artworkPrompt(brief, title) });
  } catch (err: any) {
    console.error('[research] artwork prompt failed:', err?.message);
    return res.status(500).json({ error: 'Couldn’t compose the prompt' });
  }
});

/** Regenerate the run's story artwork on demand (review sheet). The fresh
 *  asset becomes the cover pick immediately via feed_override.artAssetId. */
researchRouter.post('/research/runs/:id/artwork', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad run id' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    const feed = (run as any).studio_feed ?? {};
    if (!process.env.GOOGLE_AI_API_KEY) return res.status(400).json({ error: 'GOOGLE_AI_API_KEY is not configured on the server' });
    const { generateRunArtwork, derivedVisualBrief } = await import('../services/artworkService.js');
    // Priority: an explicit brief in the request, then the feed's own visual
    // spec, then a brief derived from the title (pre-pipeline runs have none).
    const brief = String(req.body?.brief ?? '').trim() || String(feed.visual ?? '').trim()
      || derivedVisualBrief((run as any).report_title || (run as any).topic);
    const art = await generateRunArtwork({ runId: id, scheduleId: (run as any).schedule_id ?? null, title: (run as any).report_title || (run as any).topic, visualBrief: brief });
    if (art.assetId == null) return res.status(502).json({ error: `Artwork generation failed — ${(art as any).reason}` });
    const [existing] = await sql`SELECT studio_feed, feed_override FROM research_runs WHERE id = ${id} AND user_id = ${userId}`;
    const base = { ...((existing as any)?.studio_feed ?? {}), ...((existing as any)?.feed_override ?? {}) };
    await sql`UPDATE research_runs SET feed_override = ${sql.json({ ...base, artAssetId: art.assetId })}::jsonb WHERE id = ${id} AND user_id = ${userId}`;
    return res.json({ assetId: art.assetId });
  } catch (err: any) {
    console.error('[research] artwork regen failed:', err?.message);
    return res.status(500).json({ error: err?.message || 'Artwork generation failed' });
  }
});

/** The carousel cover alone, as PNG — the review sheet's poster preview. */
researchRouter.get('/research/runs/:id/cover.png', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = Number(req.params.id);
  const run = await loadCompleteRun(id, userId);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  if (!run.studio_feed) return res.status(404).json({ error: 'This run has no studio feed' });
  try {
    const png = await renderCoverPng(run as any);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(png);
  } catch (err: any) {
    console.error('[research] cover render failed:', err?.message);
    return res.status(500).json({ error: `Cover render failed — ${err?.message}` });
  }
});

/** Force a fresh Claude design of the deck (review sheet's Redesign). The
 *  next preview/export regenerates; a failed design falls back to the
 *  template, never an error. */
researchRouter.post('/research/runs/:id/deck', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad run id' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run || !run.studio_feed) return res.status(404).json({ error: 'Run not found' });
    const { clearDeckCache } = await import('../services/deckDesigner.js');
    await clearDeckCache(id);
    const fresh = await loadCompleteRun(id, userId);
    const { designedDeckHtml } = await import('../services/researchComposer.js');
    const html = fresh ? await designedDeckHtml(fresh as any) : null;
    return res.json({ ok: true, designed: !!html });
  } catch (err: any) {
    console.error('[research] deck redesign failed:', err?.message);
    return res.status(500).json({ error: 'Couldn’t reset the design' });
  }
});

/** EVERY carousel page stacked into one tall PNG — the review sheet's
 *  full-deck preview so Paul can see the whole carousel before saving. */
researchRouter.get('/research/runs/:id/carousel.png', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = Number(req.params.id);
  const run = await loadCompleteRun(id, userId);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  if (!run.studio_feed) return res.status(404).json({ error: 'This run has no studio feed' });
  try {
    const { renderCarouselStripPng } = await import('../services/researchComposer.js');
    const png = await renderCarouselStripPng(run as any);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(png);
  } catch (err: any) {
    console.error('[research] carousel strip render failed:', err?.message);
    return res.status(500).json({ error: `Carousel render failed — ${err?.message}` });
  }
});

researchRouter.post('/research/runs/:id/review', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = Number(req.params.id);
  const status = req.body?.status === 'approved' ? 'approved' : 'draft';
  try {
    const [row] = await sql`
      UPDATE research_runs SET review_status = ${status}
       WHERE id = ${id} AND user_id = ${userId} AND status = 'complete'
       RETURNING id`;
    if (!row) return res.status(404).json({ error: 'Run not found' });
    return res.json({ ok: true, reviewStatus: status });
  } catch (err) {
    console.error('[research] review update failed', err);
    return res.status(500).json({ error: 'Update failed' });
  }
});

researchRouter.get('/research/runs/:id/pdf', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId || !id) return res.status(400).json({ error: 'Bad request' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run || !run.report_md) return res.status(404).json({ error: 'No completed report for this run' });
    const pdf = await renderResearchPdf(run);
    if (req.query.save === '1') await saveCollateral(run, `Report — ${run.report_title || run.topic}`, 'application/pdf', Buffer.from(pdf));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="smbx-research-${slugify(run.report_title || run.topic)}.pdf"`);
    return res.send(pdf);
  } catch (err: any) {
    console.error('[research] pdf render failed:', err.message);
    return res.status(500).json({ error: `PDF render failed — ${err?.message || 'unknown error'}` });
  }
});

researchRouter.get('/research/runs/:id/card.png', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId || !id) return res.status(400).json({ error: 'Bad request' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run) return res.status(404).json({ error: 'No completed run' });
    if (!run.studio_feed) return res.status(404).json({ error: 'This run has no studio feed to build a card from' });
    const hook = Number(req.query.hook);
    const variant = req.query.variant === 'dark' ? 'dark' as const : 'light' as const;
    const png = await renderResearchCardPng(run, Number.isFinite(hook) && hook >= 0 ? hook : 0, variant);
    if (req.query.save === '1') await saveCollateral(run, `1-pager${variant === 'dark' ? ' (dark)' : ''} — ${run.report_title || run.topic}`, 'image/png', Buffer.from(png));
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="smbx-card-${variant === 'dark' ? 'dark-' : ''}${slugify(run.report_title || run.topic)}.png"`);
    return res.send(png);
  } catch (err: any) {
    console.error('[research] card render failed:', err.message);
    return res.status(500).json({ error: `Card render failed — ${err?.message || 'unknown error'}` });
  }
});

// LinkedIn document post — swipeable 1080×1350 PDF in the practice brand.
researchRouter.get('/research/runs/:id/linkedin.pdf', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId || !id) return res.status(400).json({ error: 'Bad request' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run) return res.status(404).json({ error: 'No completed run' });
    if (!run.studio_feed) return res.status(404).json({ error: 'This run has no studio feed to build a document post from' });
    const pdf = await renderLinkedInDocPdf(run);
    if (req.query.save === '1') await saveCollateral(run, `Carousel — ${run.report_title || run.topic}`, 'application/pdf', Buffer.from(pdf));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="smbx-linkedin-${slugify(run.report_title || run.topic)}.pdf"`);
    return res.send(pdf);
  } catch (err: any) {
    console.error('[research] linkedin pdf render failed:', err.message);
    return res.status(500).json({ error: `LinkedIn PDF render failed — ${err?.message || 'unknown error'}` });
  }
});

// The ready-to-paste post text that ships with either LinkedIn artifact.
researchRouter.get('/research/runs/:id/post.txt', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId || !id) return res.status(400).json({ error: 'Bad request' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run) return res.status(404).json({ error: 'No completed run' });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(researchPostText(run));
  } catch (err: any) {
    console.error('[research] post text failed:', err.message);
    return res.status(500).json({ error: 'Post text failed' });
  }
});

researchRouter.get('/research/runs/:id/md', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId || !id) return res.status(400).json({ error: 'Bad request' });
  try {
    const run = await loadCompleteRun(id, userId);
    if (!run || !run.report_md) return res.status(404).json({ error: 'No completed report for this run' });
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="smbx-research-${slugify(run.report_title || run.topic)}.md"`);
    return res.send(run.report_md);
  } catch (err: any) {
    console.error('[research] md download failed:', err.message);
    return res.status(500).json({ error: 'Download failed' });
  }
});

/* ─── campaigns (schedules) ───────────────────────────────────────────── */

researchRouter.post('/research/schedules', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const name = String(req.body?.name ?? '').trim();
  const cadence = String(req.body?.cadence ?? 'weekly');
  const input = {
    userId,
    researchType: String(req.body?.researchType ?? ''),
    topic: String(req.body?.topic ?? ''),
    depth: String(req.body?.depth ?? 'standard'),
    outputFormat: String(req.body?.outputFormat ?? 'report'),
    postAngle: String(req.body?.postAngle ?? 'auto'),
  };
  if (!name) return res.status(400).json({ error: 'Campaign name is required' });
  if (!CADENCES.includes(cadence as any)) return res.status(400).json({ error: 'Unknown cadence' });
  const invalid = validateRunInput(input);
  if (invalid) return res.status(400).json({ error: invalid });
  try {
    const next = nextRunAt(cadence, new Date(), true);
    const [row] = await sql`
      INSERT INTO research_schedules (user_id, name, research_type, topic, depth, output_format, post_angle, cadence, active, next_run_at)
      VALUES (${userId}, ${name.slice(0, 120)}, ${input.researchType}, ${input.topic.trim()}, ${input.depth},
              ${input.outputFormat}, ${input.postAngle ?? 'auto'}, ${cadence}, TRUE, ${next})
      RETURNING *
    `;
    // "Run the first one now" — kick an immediate run tied to the campaign.
    if (req.body?.runNow === true) {
      const runId = await createResearchRun({ ...input, scheduleId: row.id });
      executeResearchRun(runId).catch(err => console.error(`[research] Run ${runId} crashed:`, err?.message));
    }
    return res.json({ schedule: row });
  } catch (err: any) {
    console.error('[research] create schedule failed:', err.message);
    return res.status(500).json({ error: 'Failed to create the campaign' });
  }
});

researchRouter.get('/research/schedules', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const schedules = await sql`
      SELECT * FROM research_schedules WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 40
    `;
    return res.json({ schedules });
  } catch (err: any) {
    console.error('[research] list schedules failed:', err.message);
    return res.status(500).json({ error: 'Failed to load campaigns' });
  }
});

researchRouter.patch('/research/schedules/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad campaign id' });
  try {
    const [existing] = await sql`SELECT * FROM research_schedules WHERE id = ${id} AND user_id = ${userId}`;
    if (!existing) return res.status(404).json({ error: 'Campaign not found' });

    const b = req.body ?? {};
    const next: any = {
      name: typeof b.name === 'string' && b.name.trim() ? b.name.trim().slice(0, 120) : existing.name,
      topic: typeof b.topic === 'string' && b.topic.trim() ? b.topic.trim() : existing.topic,
      research_type: typeof b.researchType === 'string' ? b.researchType : existing.research_type,
      depth: typeof b.depth === 'string' ? b.depth : existing.depth,
      output_format: typeof b.outputFormat === 'string' ? b.outputFormat : existing.output_format,
      post_angle: typeof b.postAngle === 'string' ? b.postAngle : ((existing as any).post_angle ?? 'auto'),
      cadence: typeof b.cadence === 'string' ? b.cadence : existing.cadence,
      active: typeof b.active === 'boolean' ? b.active : existing.active,
      archived: typeof b.archived === 'boolean' ? b.archived : ((existing as any).archived === true),
      folder: 'folder' in b
        ? (typeof b.folder === 'string' && b.folder.trim() ? b.folder.trim().slice(0, 80) : null)
        : ((existing as any).folder ?? null),
    };
    const invalid = validateRunInput({ userId, researchType: next.research_type, topic: next.topic, depth: next.depth, outputFormat: next.output_format, postAngle: next.post_angle });
    if (invalid) return res.status(400).json({ error: invalid });
    if (!CADENCES.includes(next.cadence)) return res.status(400).json({ error: 'Unknown cadence' });

    // Cadence change or reactivation re-anchors the next fire.
    const reanchor = next.cadence !== existing.cadence || (next.active && !existing.active);
    const nextRun = reanchor ? nextRunAt(next.cadence, new Date(), true) : existing.next_run_at;

    const [row] = await sql`
      UPDATE research_schedules
      SET name = ${next.name}, topic = ${next.topic}, research_type = ${next.research_type},
          depth = ${next.depth}, output_format = ${next.output_format}, post_angle = ${next.post_angle},
          cadence = ${next.cadence}, active = ${next.active}, archived = ${next.archived},
          folder = ${next.folder}, next_run_at = ${nextRun}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return res.json({ schedule: row });
  } catch (err: any) {
    console.error('[research] update schedule failed:', err.message);
    return res.status(500).json({ error: 'Failed to update the campaign' });
  }
});

researchRouter.delete('/research/schedules/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  const id = parseId(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!id) return res.status(400).json({ error: 'Bad campaign id' });
  try {
    await sql`DELETE FROM research_schedules WHERE id = ${id} AND user_id = ${userId}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[research] delete schedule failed:', err.message);
    return res.status(500).json({ error: 'Failed to delete the campaign' });
  }
});

/* ─── Studio media library (2026-07-17) ───────────────────────────────────
 * Photos the composers pull into artifacts. Each asset carries a focal point
 * (0–1 fractions) so any layout crops it correctly. Served bytes are private
 * (behind auth); the client fetches with authHeaders and object-URLs them.
 */

researchRouter.get('/studio/assets', async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  try {
    return res.json({ assets: await listStudioAssets() });
  } catch (err) {
    console.error('[studio] list assets failed', err);
    return res.status(500).json({ error: 'Failed to load media' });
  }
});

researchRouter.post('/studio/assets', assetUpload.single('file'), async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  const file = (req as any).file as { buffer: Buffer; mimetype: string; originalname: string } | undefined;
  if (!file) return res.status(400).json({ error: 'Attach an image file (png, jpeg, or webp, ≤12MB)' });
  try {
    const label = String(req.body?.label || '').trim() || file.originalname.replace(/\.[a-z0-9]+$/i, '');
    const id = await createStudioAsset({ label, mime: file.mimetype, data: file.buffer });
    return res.json({ id });
  } catch (err) {
    console.error('[studio] upload failed', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

researchRouter.get('/studio/assets/:id/raw', async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad asset id' });
  try {
    const asset = await getStudioAsset(id);
    if (!asset) return res.status(404).json({ error: 'Not found' });
    res.setHeader('Content-Type', asset.mime);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.send(asset.data);
  } catch (err) {
    console.error('[studio] asset raw failed', err);
    return res.status(500).json({ error: 'Failed to load asset' });
  }
});

researchRouter.patch('/studio/assets/:id', async (req, res) => {
  const userId = userIdFromReq(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad asset id' });
  try {
    // Drag-to-file: move a collateral piece under a campaign (or out of one).
    let scheduleId: number | null | undefined = undefined;
    if ('scheduleId' in (req.body ?? {})) {
      if (req.body.scheduleId === null || req.body.scheduleId === '') {
        scheduleId = null;
      } else {
        const sid = Number(req.body.scheduleId);
        if (!Number.isInteger(sid) || sid <= 0) return res.status(400).json({ error: 'Bad campaign id' });
        const [sched] = await sql`SELECT id FROM research_schedules WHERE id = ${sid} AND user_id = ${userId}`;
        if (!sched) return res.status(404).json({ error: 'Campaign not found' });
        scheduleId = sid;
      }
    }
    const ok = await updateStudioAsset(id, {
      label: typeof req.body?.label === 'string' ? req.body.label : undefined,
      focalX: req.body?.focalX != null ? Number(req.body.focalX) : undefined,
      focalY: req.body?.focalY != null ? Number(req.body.focalY) : undefined,
      scheduleId,
    });
    if (!ok) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[studio] asset patch failed', err);
    return res.status(500).json({ error: 'Update failed' });
  }
});

researchRouter.delete('/studio/assets/:id', async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad asset id' });
  try {
    const ok = await deleteStudioAsset(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[studio] asset delete failed', err);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

/** Standalone story artwork (2026-07-20) — the announcement composer's
 *  Generate button. Same Gemini pipeline as run artwork, no run provenance;
 *  the image lands in Media where every composer can pick it. */
researchRouter.post('/studio/artwork', async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  try {
    if (!process.env.GOOGLE_AI_API_KEY) return res.status(400).json({ error: 'GOOGLE_AI_API_KEY is not configured on the server' });
    const title = String(req.body?.title ?? '').trim();
    const { generateRunArtwork, derivedVisualBrief } = await import('../services/artworkService.js');
    const brief = String(req.body?.brief ?? '').trim() || (title ? derivedVisualBrief(title) : '');
    if (!brief) return res.status(400).json({ error: 'Describe the artwork (or write the headline first)' });
    const art = await generateRunArtwork({ runId: null, scheduleId: null, title: title || brief.slice(0, 90), visualBrief: brief });
    if (art.assetId == null) return res.status(502).json({ error: `Artwork generation failed — ${(art as any).reason}` });
    return res.json({ assetId: art.assetId });
  } catch (err: any) {
    console.error('[studio] artwork generation failed:', err?.message);
    return res.status(500).json({ error: err?.message || 'Artwork generation failed' });
  }
});

/* ─── Announcement card compose (2026-07-17) ──────────────────────────────
 * The approved 1080×1350 announcement layouts (light split · dark textured),
 * rendered on demand with the caller's copy and a library photo. Returns PNG.
 */
researchRouter.post('/studio/announcement.png', async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  const b = req.body ?? {};
  const variant = b.variant === 'dark' ? 'dark' : 'light';
  const str = (v: unknown, max: number) => String(v ?? '').slice(0, max).trim();
  const spec: AnnouncementSpec = {
    variant,
    headline: str(b.headline, 140),
    accent: str(b.accent, 90),
    sub: str(b.sub, 320),
    bullets: Array.isArray(b.bullets) ? b.bullets.map((x: unknown) => str(x, 200)).filter(Boolean).slice(0, 4) : [],
    mandate: str(b.mandate, 220),
    kicker: str(b.kicker, 40) || undefined,
    footerTag: str(b.footerTag, 90) || 'smbx.ai · Book a call',
    footerNote: str(b.footerNote, 90) || undefined,
    photo: null,
  };
  if (!spec.headline) return res.status(400).json({ error: 'Headline is required' });
  try {
    const assetId = b.assetId != null ? Number(b.assetId) : null;
    if (assetId && Number.isFinite(assetId)) {
      const asset = await getStudioAsset(assetId);
      if (!asset) return res.status(404).json({ error: 'Photo not found in the media library' });
      spec.photo = {
        dataUri: `data:${asset.mime};base64,${asset.data.toString('base64')}`,
        focalX: asset.focal_x,
        focalY: asset.focal_y,
      };
    }
    const png = await renderAnnouncementCardPng(spec);
    // Rendered output is collateral — keep it in the managed library so it
    // can be browsed/re-downloaded/archived later. Never fail the download
    // over a save hiccup.
    if (b.save === true) {
      await createStudioAsset({
        label: `Announcement — ${spec.headline.slice(0, 60)} (${variant})`,
        mime: 'image/png',
        data: Buffer.from(png),
        kind: 'collateral',
      }).catch(err => console.warn('[studio] collateral save failed:', (err as any)?.message));
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="smbx-announcement-${variant}.png"`);
    return res.send(png);
  } catch (err) {
    console.error('[studio] announcement compose failed', err);
    return res.status(500).json({ error: 'Render failed' });
  }
});

/* ─── Post cards — daily-campaign templates (2026-07-18) ──────────────────
 * compose: Haiku fills a template from a pasted brief (never renders).
 * postcard.png: renders a (possibly hand-edited) spec. Photo only on quote.
 */
researchRouter.post('/studio/postcard/compose', async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  const brief = String(req.body?.brief ?? '').trim();
  if (brief.length < 20) return res.status(400).json({ error: 'Give the brief at least a sentence or two' });
  const template = ['stat', 'quote', 'thesis', 'playbook', 'auto'].includes(req.body?.template) ? req.body.template : 'auto';
  const variant = req.body?.variant === 'dark' ? 'dark' : 'light';
  try {
    const spec = await fillPostCard(brief, { template, variant });
    return res.json({ spec });
  } catch (err) {
    console.error('[studio] postcard compose failed', err);
    return res.status(500).json({ error: 'Smart fill failed — try again or fill the fields by hand' });
  }
});

researchRouter.post('/studio/postcard.png', async (req, res) => {
  if (!userIdFromReq(req)) return res.status(401).json({ error: 'Not authenticated' });
  const b = req.body ?? {};
  const str = (v: unknown, max: number) => String(v ?? '').slice(0, max).trim();
  const template = ['stat', 'quote', 'thesis', 'playbook'].includes(b.template) ? b.template : null;
  if (!template) return res.status(400).json({ error: 'Unknown template' });
  const spec: PostCardSpec = {
    template,
    variant: b.variant === 'dark' ? 'dark' : 'light',
    kicker: str(b.kicker, 40) || undefined,
    value: str(b.value, 16) || undefined,
    claim: str(b.claim, 180) || undefined,
    source: str(b.source, 110) || undefined,
    quote: str(b.quote, 300) || undefined,
    name: str(b.name, 60) || undefined,
    role: str(b.role, 80) || undefined,
    title: str(b.title, 120) || undefined,
    rows: Array.isArray(b.rows)
      ? b.rows.slice(0, 4).map((r: any) => ({ k: str(r?.k, 40), v: str(r?.v, 170) })).filter((r: any) => r.k && r.v)
      : undefined,
    insight: str(b.insight, 190) || undefined,
    steps: Array.isArray(b.steps) ? b.steps.map((x: unknown) => str(x, 150)).filter(Boolean).slice(0, 5) : undefined,
    footerTag: str(b.footerTag, 90) || 'smbx.ai · Book a call',
    photo: null,
  };
  if (template === 'stat' && !spec.value) return res.status(400).json({ error: 'Stat cards need a value' });
  if (template === 'quote' && !spec.quote) return res.status(400).json({ error: 'Quote cards need a quote' });
  if ((template === 'thesis' || template === 'playbook') && !spec.title) return res.status(400).json({ error: 'This template needs a title' });
  try {
    const assetId = b.assetId != null ? Number(b.assetId) : null;
    if (assetId && Number.isFinite(assetId)) {
      const asset = await getStudioAsset(assetId);
      if (!asset) return res.status(404).json({ error: 'Photo not found in the media library' });
      spec.photo = {
        dataUri: `data:${asset.mime};base64,${asset.data.toString('base64')}`,
        focalX: asset.focal_x,
        focalY: asset.focal_y,
      };
    }
    const png = await renderPostCardPng(spec);
    if (b.save === true) {
      const tag = spec.title || spec.claim || spec.quote || spec.kicker || template;
      await createStudioAsset({
        label: `Post card — ${String(tag).slice(0, 60)} (${template}, ${spec.variant})`,
        mime: 'image/png',
        data: Buffer.from(png),
        kind: 'collateral',
      }).catch(err => console.warn('[studio] collateral save failed:', (err as any)?.message));
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="smbx-card-${template}-${spec.variant}.png"`);
    return res.send(png);
  } catch (err) {
    console.error('[studio] postcard render failed', err);
    return res.status(500).json({ error: 'Render failed' });
  }
});
