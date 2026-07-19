/**
 * Studio media library (2026-07-17).
 *
 * Photos and brand imagery the Studio composers pull into LinkedIn artifacts —
 * the announcement card today, covers and future formats next. Bytes live in
 * Postgres (Railway disk is ephemeral); each asset carries a FOCAL POINT
 * (fractions 0–1) so composers frame the crop correctly in any slot
 * (object-position `${fx*100}% ${fy*100}%`), which is what keeps a face in
 * frame regardless of the layout's aspect ratio.
 *
 * The library lazy-seeds from the two photos already in the repo (the walking
 * shot and the site headshot) so it is never empty on first open.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface StudioAssetMeta {
  id: number;
  label: string;
  mime: string;
  /** 'photo' = uploaded imagery; 'collateral' = rendered outputs (cards). */
  kind: string;
  /** Provenance for collateral: the run/campaign it was exported from. */
  run_id: number | null;
  schedule_id: number | null;
  width: number | null;
  height: number | null;
  focal_x: number;
  focal_y: number;
  created_at: string;
  bytes: number;
}

/** PNG/JPEG dimension sniff — enough for the formats the upload filter admits. */
export function imageDimensions(buf: Buffer, mime: string): { width: number; height: number } | null {
  try {
    if (mime === 'image/png' && buf.readUInt32BE(0) === 0x89504e47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (mime === 'image/jpeg') {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (mime === 'image/webp' && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
      const fmt = buf.slice(12, 16).toString();
      if (fmt === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (fmt === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
  } catch { /* dimension sniff is best-effort */ }
  return null;
}

const clamp01 = (v: number, fallback: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback);

export async function listStudioAssets(): Promise<StudioAssetMeta[]> {
  await seedIfEmpty();
  const rows = await sql`
    SELECT id, label, mime, kind, run_id, schedule_id, width, height, focal_x, focal_y, created_at, octet_length(data) AS bytes
    FROM studio_assets ORDER BY created_at DESC, id DESC`;
  return rows as unknown as StudioAssetMeta[];
}

export async function getStudioAsset(id: number): Promise<(StudioAssetMeta & { data: Buffer }) | null> {
  const rows = await sql`
    SELECT id, label, mime, kind, run_id, schedule_id, width, height, focal_x, focal_y, created_at, octet_length(data) AS bytes, data
    FROM studio_assets WHERE id = ${id}`;
  return (rows[0] as any) ?? null;
}

export async function createStudioAsset(input: { label: string; mime: string; data: Buffer; focalX?: number; focalY?: number; kind?: string; runId?: number | null; scheduleId?: number | null }): Promise<number> {
  const dims = imageDimensions(input.data, input.mime);
  const rows = await sql`
    INSERT INTO studio_assets (label, mime, kind, run_id, schedule_id, data, width, height, focal_x, focal_y)
    VALUES (${input.label}, ${input.mime}, ${input.kind === 'collateral' ? 'collateral' : 'photo'},
            ${input.runId ?? null}, ${input.scheduleId ?? null}, ${input.data},
            ${dims?.width ?? null}, ${dims?.height ?? null},
            ${clamp01(input.focalX ?? 0.5, 0.5)}, ${clamp01(input.focalY ?? 0.25, 0.25)})
    RETURNING id`;
  return Number((rows[0] as any).id);
}

export async function updateStudioAsset(id: number, patch: { label?: string; focalX?: number; focalY?: number; scheduleId?: number | null }): Promise<boolean> {
  const cur = await sql`SELECT id, label, focal_x, focal_y, schedule_id FROM studio_assets WHERE id = ${id}`;
  if (!cur[0]) return false;
  const c = cur[0] as any;
  await sql`
    UPDATE studio_assets SET
      label = ${patch.label?.trim() || c.label},
      focal_x = ${clamp01(patch.focalX ?? c.focal_x, c.focal_x)},
      focal_y = ${clamp01(patch.focalY ?? c.focal_y, c.focal_y)},
      schedule_id = ${patch.scheduleId === undefined ? c.schedule_id : patch.scheduleId}
    WHERE id = ${id}`;
  return true;
}

export async function deleteStudioAsset(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM studio_assets WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

/** First-open seed: the two photos already shipped in the repo, with the
 *  framing points the approved announcement renders used. Never overwrites. */
async function seedIfEmpty(): Promise<void> {
  try {
    const [{ n }] = (await sql`SELECT COUNT(*)::int AS n FROM studio_assets`) as any;
    if (n > 0) return;
    const seeds: Array<{ file: string; label: string; mime: string; fx: number; fy: number }> = [
      { file: path.resolve(__dirname, '../../assets/founder.png'), label: 'Paul — walking, Times Square', mime: 'image/png', fx: 0.5, fy: 0.18 },
      { file: path.resolve(__dirname, '../../client/public/founder-portrait.jpg'), label: 'Paul — headshot (site portrait)', mime: 'image/jpeg', fx: 0.5, fy: 0.24 },
    ];
    for (const s of seeds) {
      if (!existsSync(s.file)) continue;
      const data = readFileSync(s.file);
      await createStudioAsset({ label: s.label, mime: s.mime, data, focalX: s.fx, focalY: s.fy });
    }
  } catch { /* seed is best-effort; an empty library is still usable */ }
}
