/**
 * Story artwork (2026-07-20) — Paul: the marketing plan now specifies "an
 * accompanying visual to tell the story"; the pages need graphics that catch
 * attention.
 *
 * Pipeline: the researcher already writes a one-sentence visual brief into
 * the studio feed (`feed.visual`, honoring any "Visual direction:" carried in
 * from an imported plan). This service turns that brief into an actual
 * editorial illustration via Google's Gemini image model (the app has
 * GOOGLE_AI_API_KEY; no SDK — one REST call), and files it into the Studio
 * media library linked to the run, where the carousel cover picks it up and
 * Paul can reuse it in the composers.
 *
 * LAWS baked into the prompt: flat editorial illustration in the Ledger
 * palette only — NEVER photoreal people, NEVER text/numbers/words inside the
 * image, NEVER logos, NEVER fake charts or documents. The facts live in the
 * typeset numerals; the artwork is atmosphere, so it can never hallucinate.
 *
 * STRICTLY FAIL-SOFT: any error (missing key, model rename, quota, safety
 * block) logs one line and returns null — the run completes and the carousel
 * falls back to the procedural motif. Artwork must never sink a run.
 */
import { createStudioAsset } from './studioAssets.js';

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

/**
 * Fallback brief for runs that predate the artwork pipeline (their feed has
 * no `visual` field). Derived from the run's own title so Generate and the
 * on-demand download path work on ANY run; artworkPrompt's style contract
 * (no text, no people, no logos, no charts) keeps a derived brief safe.
 */
export function derivedVisualBrief(title: string): string {
  const t = (title || '').trim().replace(/\s+/g, ' ').slice(0, 220);
  return `an abstract editorial scene representing this market story: "${t}" — the industry it describes and its central dynamic, rendered as simple confident geometric forms`;
}

/** The generation prompt — exported for tests and future tuning. */
export function artworkPrompt(visualBrief: string, title: string): string {
  return [
    `Flat editorial illustration for a financial research publication. Subject: ${visualBrief.trim()}`,
    `Context (do not render as text): "${title.trim()}".`,
    'ONE single cohesive scene with ONE focal subject — like a magazine cover illustration.',
    'NOT a collage, NOT a sprite sheet, NOT a grid of vignettes, NOT multiple separate drawings on one page.',
    'Style: minimal flat vector-like editorial art, generous negative space, confident geometric shapes,',
    'subtle paper grain. Palette STRICTLY: bone off-white background #F6F4EF, deep green #16624C,',
    'near-black ink #14181C, one small brass-gold accent #B08637. Portrait 4:5 composition.',
    'ABSOLUTELY NO: text, letters, numbers, words, logos, watermarks, charts, graphs, documents,',
    'photorealistic people, recognizable faces, company branding. Abstract human silhouettes are',
    'acceptable only as small flat shapes.',
  ].join(' ');
}

/** Parse a generateContent response into image bytes. Exported for tests. */
export function parseArtworkResponse(json: any): { mime: string; data: Buffer } | null {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  for (const p of parts) {
    const inline = p?.inlineData ?? p?.inline_data;
    const mime = inline?.mimeType ?? inline?.mime_type;
    if (inline?.data && typeof inline.data === 'string' && typeof mime === 'string' && mime.startsWith('image/')) {
      return { mime, data: Buffer.from(inline.data, 'base64') };
    }
  }
  return null;
}

/**
 * Generate story artwork and file it in the media library. runId null =
 * standalone artwork (the announcement composer's Generate button) — same
 * pipeline, no run provenance.
 * Returns the asset id, or null (soft-fail) with the reason in the message.
 */
export async function generateRunArtwork(input: {
  runId: number | null;
  scheduleId: number | null;
  title: string;
  visualBrief: string;
}): Promise<{ assetId: number } | { assetId: null; reason: string }> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return { assetId: null, reason: 'GOOGLE_AI_API_KEY not set' };
  if (!input.visualBrief?.trim()) return { assetId: null, reason: 'no visual brief in the feed' };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(IMAGE_MODEL)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: artworkPrompt(input.visualBrief, input.title) }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
        signal: controller.signal,
      },
    ).finally(() => clearTimeout(timer));
    const json: any = await resp.json().catch(() => null);
    if (!resp.ok) {
      const msg = json?.error?.message || `HTTP ${resp.status}`;
      return { assetId: null, reason: String(msg).slice(0, 200) };
    }
    const img = parseArtworkResponse(json);
    if (!img) return { assetId: null, reason: 'model returned no image (possibly safety-filtered)' };
    const assetId = await createStudioAsset({
      label: `Artwork — ${input.title.slice(0, 90)}`,
      mime: img.mime,
      data: img.data,
      kind: 'photo',
      runId: input.runId,
      scheduleId: input.scheduleId,
      focalX: 0.5,
      focalY: 0.5,
    });
    return { assetId };
  } catch (err: any) {
    const reason = err?.name === 'AbortError' ? 'timed out after 60s' : (err?.message || 'artwork generation failed');
    return { assetId: null, reason: String(reason).slice(0, 200) };
  }
}
