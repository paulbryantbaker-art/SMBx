/**
 * The three studio repositories (Paul, 2026-07-24).
 *
 * "Just like in Google Drive, we need repositories for different types of
 * data."
 *
 *   ARTIFACTS   the words — reports, LinkedIn post copy, research, specs.
 *               Text documents used to GENERATE collateral.
 *   ASSETS      the pictures — images used inside those documents.
 *   COLLATERAL  the finished product — what actually gets posted on LinkedIn
 *               or sent to a potential customer.
 *
 * Assets and collateral already lived in `studio_assets`, separated by `kind`;
 * artifacts had no home, so report and master markdown was scattered across
 * research_runs and research_lanes with no way to browse or hand-write one.
 * This module gives all three the same shape so the UI can treat them as
 * folders, and records the chain between them:
 *
 *   ARTIFACT (words) + ASSET (pictures) -> COLLATERAL (output)
 *
 * That chain is what lets a finished PDF answer "where did this come from" —
 * the same defensibility discipline the research audit enforces on figures.
 */
import { sql } from '../db.js';

export type RepoName = 'artifacts' | 'assets' | 'collateral';

export interface ArtifactRow {
  id: number; user_id: number; kind: string; label: string;
  body_md: string; notes: string | null;
  lane_id: number | null; lane_version: number | null;
  run_id: number | null; schedule_id: number | null;
  archived: boolean; created_at: string; updated_at: string;
}

/* ── artifacts ────────────────────────────────────────────────────────── */

export async function listArtifacts(userId: number, opts: { kind?: string; laneId?: number; archived?: boolean } = {}) {
  return sql`
    SELECT id, kind, label, notes, lane_id, lane_version, run_id, schedule_id,
           archived, created_at, updated_at,
           length(body_md) AS chars,
           left(body_md, 240) AS preview
    FROM studio_artifacts
    WHERE user_id = ${userId}
      AND archived = ${opts.archived === true}
      ${opts.kind ? sql`AND kind = ${opts.kind}` : sql``}
      ${opts.laneId ? sql`AND lane_id = ${opts.laneId}` : sql``}
    ORDER BY updated_at DESC`;
}

export async function getArtifact(userId: number, id: number): Promise<ArtifactRow | null> {
  const [row] = await sql<ArtifactRow[]>`
    SELECT * FROM studio_artifacts WHERE id = ${id} AND user_id = ${userId}`;
  return row || null;
}

export async function createArtifact(userId: number, input: {
  label: string; bodyMd?: string; kind?: string; notes?: string;
  laneId?: number; laneVersion?: number; runId?: number; scheduleId?: number;
}): Promise<number> {
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO studio_artifacts (user_id, kind, label, body_md, notes, lane_id, lane_version, run_id, schedule_id)
    VALUES (${userId}, ${input.kind || 'document'}, ${input.label}, ${input.bodyMd || ''},
            ${input.notes || null}, ${input.laneId ?? null}, ${input.laneVersion ?? null},
            ${input.runId ?? null}, ${input.scheduleId ?? null})
    RETURNING id`;
  return row.id;
}

export async function updateArtifact(userId: number, id: number, patch: {
  label?: string; bodyMd?: string; kind?: string; notes?: string; archived?: boolean;
}): Promise<boolean> {
  const rows = await sql`
    UPDATE studio_artifacts SET
      label    = COALESCE(${patch.label ?? null}, label),
      body_md  = COALESCE(${patch.bodyMd ?? null}, body_md),
      kind     = COALESCE(${patch.kind ?? null}, kind),
      notes    = COALESCE(${patch.notes ?? null}, notes),
      archived = COALESCE(${patch.archived ?? null}, archived),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id`;
  return rows.length > 0;
}

export async function deleteArtifact(userId: number, id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM studio_artifacts WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

/**
 * File a synthesized research master into the artifacts repository.
 *
 * The master is the words a report is built from, so it belongs in artifacts
 * rather than only inside the lane. Re-filing the same lane version updates
 * the existing artifact instead of piling up duplicates.
 */
export async function fileLaneMaster(userId: number, lane: {
  id: number; label: string; master_md: string | null; master_title: string | null; master_version: number;
}): Promise<number | null> {
  if (!lane.master_md) return null;
  // Match on kind too. Corp-dev documents (market maps, who's who, theses) are
  // ALSO artifacts carrying this lane_id and the master version they were
  // derived from — without the kind filter, re-filing a master would find one
  // of those and overwrite it with the master's text.
  const [existing] = await sql<{ id: number }[]>`
    SELECT id FROM studio_artifacts
    WHERE user_id = ${userId} AND lane_id = ${lane.id} AND lane_version = ${lane.master_version}
      AND kind = 'research'
    LIMIT 1`;
  const label = `${lane.master_title || lane.label} — v${lane.master_version}`;
  if (existing) {
    await sql`UPDATE studio_artifacts SET label = ${label}, body_md = ${lane.master_md}, updated_at = NOW() WHERE id = ${existing.id}`;
    return existing.id;
  }
  return createArtifact(userId, {
    label, bodyMd: lane.master_md, kind: 'research',
    laneId: lane.id, laneVersion: lane.master_version,
  });
}

/* ── the three repositories, one shape ────────────────────────────────── */

/** Counts for the folder rail — what each repository holds. */
export async function repoSummary(userId: number) {
  const [art] = await sql<{ n: string }[]>`
    SELECT COUNT(*)::text AS n FROM studio_artifacts WHERE user_id = ${userId} AND archived = FALSE`;
  const [ass] = await sql<{ n: string; bytes: string }[]>`
    SELECT COUNT(*)::text AS n, COALESCE(SUM(octet_length(data)), 0)::text AS bytes
    FROM studio_assets WHERE kind = 'photo'`;
  const [col] = await sql<{ n: string; bytes: string }[]>`
    SELECT COUNT(*)::text AS n, COALESCE(SUM(octet_length(data)), 0)::text AS bytes
    FROM studio_assets WHERE kind = 'collateral'`;
  return {
    artifacts: { label: 'Artifacts', description: 'The words — reports, post copy, research', count: Number(art?.n || 0) },
    assets: { label: 'Assets', description: 'The pictures used in documents', count: Number(ass?.n || 0), bytes: Number(ass?.bytes || 0) },
    collateral: { label: 'Collateral', description: 'Finished output, posted or sent', count: Number(col?.n || 0), bytes: Number(col?.bytes || 0) },
  };
}
