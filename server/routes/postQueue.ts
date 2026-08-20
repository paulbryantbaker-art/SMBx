/**
 * The post queue — routes (migration 123).
 *
 * `content/studio/POST_QUEUE.md` owns the content; this owns the state. See
 * `server/services/postQueue.ts` for the ownership rule and why an import may
 * never touch a posted date.
 *
 * NOTHING HERE DISPATCHES. Migration 122 disarmed the research scheduler after
 * a campaign spent unattended on the metered key; a posting calendar is rows
 * with dates and needs no scheduler. No route in this file calls a model, and
 * none should ever be invoked on a timer.
 *
 * `POST /:queueId/posted` is a deliberate separate route rather than a status
 * value on the patch. Marking something published is the one irreversible,
 * outward-facing act in this whole loop, and it should not be reachable by a
 * client that meant to set a slot and sent the wrong field.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { sql } from '../db.js';
import {
  importQueue, importCampaign, listCampaigns, listQueue, updateQueueState, queuePerformance, readQueueFile, updateQueueDraft, listQueueDrafts,
  sendQueueToStudio, unsendQueue, markQueueBuilt } from '../services/postQueue.js';

const router = Router();

/** The board. */
router.get('/', requireAuth, async (req: any, res) => {
  try {
    res.json({ rows: await listQueue(req.userId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Re-import from `post-queue.json`. Idempotent: content is overwritten, state is
 * untouched, and any row already further along than the markdown thinks is
 * reported in `heldAtHigherState` rather than pulled backwards.
 */
router.post('/import', requireAuth, async (req: any, res) => {
  try {
    const result = await importQueue(req.userId);
    res.json(result);
  } catch (err: any) {
    // A malformed queue names every problem and imports nothing — 422 rather
    // than 500, because the file is wrong, not the server.
    res.status(422).json({ error: err.message });
  }
});

/**
 * The campaign files the app ships, newest first — what the calendar offers
 * and what /import-campaign loads by default. Reads the filesystem, calls no
 * model, touches no row.
 */
router.get('/campaigns', requireAuth, async (_req, res) => {
  try {
    res.json({ campaigns: await listCampaigns() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Import a campaign file (content/studio/campaign-<name>.json; body
 * `{ campaign: "2026-08-18" }`, newest when omitted) — the same
 * state-preserving contract as /import, plus dates filled ONLY where a row has
 * none, the superseded calendar's rows PARKED (never a posted one), and the
 * file's queue bookkeeping applied with the same floor. Idempotent; safe to
 * press twice. A campaign that reuses another campaign's queue ids is refused
 * whole and every collision named (422) — an id is one post forever.
 */
router.post('/import-campaign', requireAuth, async (req: any, res) => {
  try {
    const name = typeof req.body?.campaign === 'string' && req.body.campaign.trim() ? req.body.campaign.trim() : null;
    const result = await importCampaign(req.userId, name);
    res.json(result);
  } catch (err: any) {
    res.status(422).json({ error: err.message });
  }
});

/** Validate without writing — what `queue-export --check` does, over HTTP. */
router.get('/check', requireAuth, async (_req, res) => {
  try {
    const rows = await readQueueFile();
    const byGrade = (g: string) => rows.filter(r => r.evidence_grade === g).length;
    res.json({
      ok: true,
      count: rows.length,
      strong: byGrade('STRONG'), moderate: byGrade('MODERATE'), thin: byGrade('THIN'),
      mayNotStateFigure: rows.filter(r => !r.may_state_figure).map(r => r.queue_id),
    });
  } catch (err: any) {
    res.status(422).json({ ok: false, error: err.message });
  }
});

/** State only. Content fields are not settable — the markdown owns them. */
/**
 * THE DRAFT (migration 138) — template pick + edited copy, decided in the app
 * before Cowork renders. Separate from PATCH /:queueId on purpose: that route
 * is STATE (posted, parked, URL, notes) and refuses content; this one is the
 * human's decision ABOUT the content, which the importer never overwrites.
 * Body: { template?: string|null, copyEdit?: string|null, pagesEdit?: [{n,label,text,note}]|null }.
 * An undefined field is left alone; null clears it.
 */
router.patch('/:queueId/draft', requireAuth, async (req: any, res) => {
  try {
    const b = req.body || {};
    const row = await updateQueueDraft(req.userId, req.params.queueId, {
      template: 'template' in b ? b.template : undefined,
      copyEdit: 'copyEdit' in b ? b.copyEdit : undefined,
      pagesEdit: 'pagesEdit' in b ? b.pagesEdit : undefined,
      videoFile: 'videoFile' in b ? b.videoFile : undefined,
    });
    if (!row) return res.status(404).json({ error: 'Not in the queue' });
    res.json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * What the studio pulls before rendering: every slot carrying a decision, edit
 * beside plan. `?sent=1` narrows it to the slots Paul has actually pressed Send
 * to Studio on — which is the difference between "I am still working on this"
 * and "build it", and the reason the button exists.
 */
router.get('/drafts', requireAuth, async (req: any, res) => {
  try {
    res.json({ drafts: await listQueueDrafts(req.userId, req.query.sent === '1' || req.query.sent === 'true') });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * SEND TO STUDIO (migration 140) — record that this slot is ready to be built.
 * Nothing is rendered here: the app calls no builder. It records a request that
 * `pull-queue.mjs --sent` picks up on the Mac. The server refuses a slot that
 * is not ready (no copy, unfilled receipt brackets, no template on a slot that
 * needs one, no video on a video slot) with the sentence the button shows.
 */
router.post('/:queueId/send', requireAuth, async (req: any, res) => {
  try {
    const row = await sendQueueToStudio(req.userId, req.params.queueId);
    if (!row) return res.status(404).json({ error: 'Not in the queue' });
    res.json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/** Withdraw the request. Leaves every decision on the row alone. */
router.delete('/:queueId/send', requireAuth, async (req: any, res) => {
  try {
    const row = await unsendQueue(req.userId, req.params.queueId);
    if (!row) return res.status(404).json({ error: 'Not in the queue' });
    res.json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * The studio's answer — called by `pull-queue.mjs --built`, not by a person.
 * A 409 rather than a 404 when the slot was never sent, because that case is a
 * session working from a stale pull and is worth telling apart from a typo in
 * the id.
 */
router.post('/:queueId/built', requireAuth, async (req: any, res) => {
  try {
    const row = await markQueueBuilt(req.userId, req.params.queueId, req.body?.path);
    if (!row) {
      const [exists] = await sql`SELECT 1 FROM post_queue WHERE user_id = ${req.userId} AND queue_id = ${req.params.queueId}`;
      return exists
        ? res.status(409).json({ error: `${req.params.queueId} was never sent to the studio — nothing asked for this build.` })
        : res.status(404).json({ error: 'Not in the queue' });
    }
    res.json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:queueId', requireAuth, async (req: any, res) => {
  try {
    const row = await updateQueueState(req.userId, req.params.queueId, req.body || {});
    if (!row) return res.status(404).json({ error: 'Not in the queue' });
    res.json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Mark posted. A HUMAN ACTION, and the only path to `posted_at`.
 *
 * Refuses if retired-check has not run or came back flagged — a caption is the
 * most exposed artifact this practice produces and was, until 2026-08-10, the
 * least guarded.
 */
router.post('/:queueId/posted', requireAuth, async (req: any, res) => {
  try {
    const row = await updateQueueState(req.userId, req.params.queueId, {
      status: 'posted',
      postUrl: req.body?.postUrl ?? null,
      retiredCheck: req.body?.retiredCheck ?? null,
    });
    if (!row) return res.status(404).json({ error: 'Not in the queue' });
    res.json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/** The loop closed: posted angles joined to what LinkedIn actually reported. */
router.get('/performance', requireAuth, async (req: any, res) => {
  try {
    res.json({ rows: await queuePerformance(req.userId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
