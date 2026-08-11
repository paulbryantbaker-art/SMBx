/**
 * Collateral built FROM a master document (Paul, 2026-07-25).
 *
 * "Ultimately after a master document is created using the various artifacts,
 * researchers, etc. — from the master document I need to be able to select
 * which output type I want: a one pager, a PDF carousel, or a full depth PDF
 * report."
 *
 * The whole render pipeline — page composition, the Claude deck designer, the
 * per-page artwork map, the rasterized PDF, filing the output into Collateral —
 * already hangs off a research run. So a composition IS a run row, flagged
 * `origin='composed'` so nothing pretends a search happened. Everything
 * downstream works the day this lands, and there is exactly one renderer.
 *
 * The one genuinely new step is turning the master's markdown into a STUDIO
 * FEED. That reuses the research agent's own feed prompt verbatim — a master
 * document IS a report as far as that step is concerned, and a second prompt
 * would be a second place for the two surfaces to drift apart.
 *
 * CITATION LAW (Paul, repeatedly, 2026-07-24): "we cannot lose citation." The
 * feed is checked mechanically against the master — every figure on a card
 * must be a figure in the document — and a failure is retried once with the
 * specific offenders named, then recorded on the row rather than swallowed.
 */
import { sql } from '../db.js';
import { composeFeedFromMarkdown } from './researchAgent.js';
import { figuresNotIn } from './researchLanes.js';
import { getArtifact } from './studioRepos.js';
import { assertSpendAllowed } from './apiSpend.js';

export type OutputType = 'onepager' | 'carousel' | 'report';

/** Which render each output type ends at — the run's own output_format. */
const OUTPUT_FORMAT: Record<OutputType, string> = {
  onepager: 'card',
  carousel: 'both',
  report: 'report',
};

export interface ComposeResult {
  runId: number;
  title: string;
  /** Figures that reached the feed without appearing in the master, after the
   *  retry. Empty is the expected case; non-empty is shown in the builder. */
  uncited: string[];
}

/** Every figure the feed puts in front of a reader, as one blob to check. */
function feedFigureText(feed: any): string {
  if (!feed || typeof feed !== 'object') return '';
  const parts: string[] = [];
  const push = (v: unknown) => { if (typeof v === 'string') parts.push(v); };
  (Array.isArray(feed.hooks) ? feed.hooks : []).forEach(push);
  (Array.isArray(feed.dataPoints) ? feed.dataPoints : []).forEach((p: any) => { push(p?.stat); });
  (Array.isArray(feed.angles) ? feed.angles : []).forEach((a: any) => { push(a?.title); push(a?.body); });
  (Array.isArray(feed.docPages) ? feed.docPages : []).forEach((p: any) => { push(p?.heading); push(p?.body); push(p?.stat); });
  push(feed?.post?.text);
  return parts.join('\n');
}

/**
 * Sources for the report PDF's register.
 *
 * A master's Sources section is prose, not a table, so pull the links out and
 * title them from the surrounding line. Losing a URL here would silently drop
 * attribution from the one artifact that shows a register, so anything that
 * looks like a link travels.
 */
function extractSources(md: string): { url: string; title: string }[] {
  const out = new Map<string, string>();
  for (const line of md.split('\n')) {
    for (const m of line.matchAll(/https?:\/\/[^\s)<>\]"']+/gi)) {
      const url = m[0].replace(/[.,;]+$/, '');
      if (out.has(url)) continue;
      // Prefer a markdown link's own text, else the line stripped of markup.
      const linked = new RegExp(`\\[([^\\]]{2,120})\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).exec(line);
      const bare = line.replace(/https?:\/\/\S+/g, '').replace(/[[\]()*_#—–|-]+/g, ' ').replace(/\s+/g, ' ').trim();
      out.set(url, (linked?.[1] || bare || url).slice(0, 160));
    }
  }
  return [...out].map(([url, title]) => ({ url, title })).slice(0, 60);
}

/** The master's own H1, else the artifact label. */
function titleOf(md: string, fallback: string): string {
  const h1 = md.match(/^#\s+(.+)$/m);
  return (h1 ? h1[1].trim() : fallback).slice(0, 120);
}

/**
 * Build a composition from an artifact and return the run id the whole render
 * pipeline already understands.
 *
 * Re-composing the SAME artifact into the SAME output type updates the
 * existing composition rather than piling up near-identical rows — the page
 * board is a thing you come back to, not a thing you accumulate. Any per-page
 * artwork already placed survives, because that is Paul's layout work and it
 * is not the feed's to discard.
 */
/**
 * WHERE THE WORDS COME FROM (Paul, 2026-07-26: "when we complete a master
 * research — that can be updated later — where does it go?").
 *
 * A market's master lives in ONE place: the lane. It used to be copied into
 * Artifacts before collateral could be built from it, which made the copy a
 * snapshot — fold in new research and the Artifacts copy still held the old
 * version, with no answer to which one was real. So collateral reads the lane
 * directly, exactly as the corp-dev documents already did.
 *
 * Artifacts still feeds this path, because a DERIVED document (a thesis, hand
 * -written post copy) is a legitimate thing to render. It just isn't where the
 * master lives.
 */
export type ComposeSource = { kind: 'lane'; id: number } | { kind: 'artifact'; id: number };

async function loadSource(userId: number, source: ComposeSource): Promise<{ md: string; label: string }> {
  if (source.kind === 'lane') {
    const [lane] = await sql<{ label: string; master_md: string | null; master_title: string | null }[]>`
      SELECT label, master_md, master_title FROM research_lanes WHERE id = ${source.id} AND user_id = ${userId}`;
    if (!lane) throw new Error('Market not found');
    if (!lane.master_md) throw new Error('This market has no master document yet — synthesize the research first.');
    return { md: lane.master_md, label: lane.master_title || lane.label };
  }
  const artifact = await getArtifact(userId, source.id);
  if (!artifact) throw new Error('Document not found');
  return { md: artifact.body_md || '', label: artifact.label };
}

export async function composeFrom(opts: {
  userId: number;
  source: ComposeSource;
  outputType: OutputType;
  postAngle?: string | null;
  scheduleId?: number | null;
}): Promise<ComposeResult> {
  // composeFeedFromMarkdown below would refuse anyway (researchAgent's client
  // is guarded), but it does so several database writes in. Refuse at the door
  // so a blocked press leaves no half-built composition row behind.
  assertSpendAllowed('studio', 'Collateral composition');
  const { md: master, label } = await loadSource(opts.userId, opts.source);
  if (master.trim().length < 200) throw new Error('This document is too short to build collateral from.');

  const title = titleOf(master, label);

  // The feed carries every number that reaches a card, so it gets the audit.
  let feed: any = null;
  let uncited: string[] = [];
  try {
    const first = await composeFeedFromMarkdown(master, opts.postAngle);
    feed = first.feed;
    uncited = feed ? figuresNotIn(feedFigureText(feed), master) : [];
    if (feed && uncited.length) {
      const retry = await composeFeedFromMarkdown(
        master,
        opts.postAngle,
        `These figures were on the cards but appear nowhere in the report: ${uncited.join(', ')}. Use only figures the report states, exactly as it states them.`,
      );
      if (retry.feed) {
        const after = figuresNotIn(feedFigureText(retry.feed), master);
        // Keep the retry only if it actually improved the citation position.
        if (after.length < uncited.length) { feed = retry.feed; uncited = after; }
      }
    }
  } catch (err: any) {
    // A feed failure must not sink the composition: the report output needs no
    // feed at all, and the board can still be rebuilt.
    console.warn('[collateral] feed composition failed:', err?.message);
  }

  if (!feed && opts.outputType !== 'report') {
    throw new Error('Couldn’t compose the pages from this document — try again, or build the full report, which needs no page composition.');
  }

  const sources = extractSources(master);
  const outputFormat = OUTPUT_FORMAT[opts.outputType];

  const laneId = opts.source.kind === 'lane' ? opts.source.id : null;
  const artifactId = opts.source.kind === 'artifact' ? opts.source.id : null;

  // Reuse this source's existing composition for this output type, keeping
  // whatever page layout is already on it.
  const [existing] = await sql<{ id: number; studio_feed: any; feed_override: any }[]>`
    SELECT id, studio_feed, feed_override FROM research_runs
    WHERE user_id = ${opts.userId}
      AND ${laneId != null ? sql`lane_id = ${laneId} AND artifact_id IS NULL` : sql`artifact_id = ${artifactId}`}
      AND origin = 'composed' AND output_format = ${outputFormat}
    ORDER BY id DESC LIMIT 1`;

  if (existing) {
    const obj = (v: any) => (v && typeof v === 'object' ? v : {});
    const prevFeed = obj(existing.studio_feed);
    const prevOv = obj(existing.feed_override);
    // Recomposing regenerates the WORDS. The page layout is Paul's own work —
    // which image sits on which page, which one is the cover — so it survives,
    // while stale copy edits and the cached deck (both keyed to the old words)
    // do not. feed_override is where the effective feed picks up those edits,
    // so the layout is exactly what stays in it.
    const layout: Record<string, any> = {};
    const pageArt = prevOv.pageArt ?? prevFeed.pageArt;
    const artAssetId = prevOv.artAssetId !== undefined ? prevOv.artAssetId : prevFeed.artAssetId;
    if (pageArt !== undefined) layout.pageArt = pageArt;
    if (artAssetId !== undefined) layout.artAssetId = artAssetId;
    const hasLayout = Object.keys(layout).length > 0;

    await sql`
      UPDATE research_runs SET
        report_title = ${title}, report_md = ${master},
        studio_feed = ${feed ? sql.json(feed) : sql.json(prevFeed)}::jsonb,
        feed_override = ${hasLayout ? sql.json(layout) : null}::jsonb,
        sources = ${sql.json(sources as any)}::jsonb,
        status = 'complete', progress = 'complete', error = NULL,
        review_status = 'draft',
        completed_at = NOW()
      WHERE id = ${existing.id}`;
    return { runId: existing.id, title, uncited };
  }

  const [row] = await sql<{ id: number }[]>`
    INSERT INTO research_runs
      (user_id, schedule_id, research_type, topic, depth, output_format, status, progress,
       report_title, report_md, studio_feed, sources, origin, artifact_id, lane_id, completed_at)
    VALUES
      (${opts.userId}, ${opts.scheduleId ?? null}, 'topic_brief', ${title}, 'standard',
       ${outputFormat}, 'complete', 'complete', ${title}, ${master},
       ${feed ? sql.json(feed) : null}::jsonb, ${sql.json(sources as any)}::jsonb,
       'composed', ${artifactId}, ${laneId}, NOW())
    RETURNING id`;
  if (opts.outputType !== 'report') void predesign(row.id, opts.userId);
  return { runId: row.id, title, uncited };
}

/**
 * Warm the Claude deck design in the background, exactly as a research run
 * does on completion, so the board's first render isn't sitting through the
 * design call interactively. Fail-soft: the board falls back to the house
 * template, which is a complete deck in its own right.
 */
function predesign(runId: number, userId: number): void {
  (async () => {
    try {
      const [run] = await sql`SELECT * FROM research_runs WHERE id = ${runId} AND user_id = ${userId}`;
      if (!run) return;
      const { designedDeckHtml } = await import('./researchComposer.js');
      await designedDeckHtml(run as any);
    } catch (err: any) {
      console.warn(`[collateral] pre-design for composition ${runId} skipped:`, err?.message);
    }
  })();
}
