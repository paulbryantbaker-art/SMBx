/**
 * Claude-designed carousels (2026-07-21) — Paul, after three days of fighting
 * the fixed template: "i think it is bc you're trying to hard code the
 * builder instead of letting yulia / claude do it the way you would do it.
 * the point of the builder is so i can say what image would go where, but
 * then let Claude create outputs." … "the hard-coded builder can't do it."
 *
 * So: Paul assigns the copy and which image goes on which page (the review
 * sheet is unchanged); CLAUDE composes the actual pages — it SEES each
 * assigned image (vision blocks) and designs around it like a designer
 * would: how the image sits, how it blends, where the text lives. The
 * output is a complete page set in the locked brand system.
 *
 * Contract with the model:
 *   input  — the run's verbatim copy (headings/bodies/stats/sources), the
 *            assigned images as vision blocks + {{IMG_n}} tokens, the brand
 *            law (palette/type/two-dark-bookends/zero-hallucination).
 *   output — ONE <style> block + one <section class="pg"> per page (1080×
 *            1350). Image/logo/headshot/texture srcs are TOKENS we
 *            substitute after generation, so the model never emits base64.
 *
 * STRICTLY FAIL-SOFT: any API error, token miss, page-count mismatch, or a
 * stat that stopped appearing verbatim → the fixed template renders instead
 * (the safety net, never the product). Generated decks are cached on the
 * run (feed_override.deck {key, html}) keyed by a hash of the inputs, so
 * previews and exports match and re-downloads don't re-pay the design call.
 */
import { createHash } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '../db.js';
import { newRenderPage } from './premiumPdfRenderer.js';

const DECK_MODEL = process.env.RESEARCH_DECK_MODEL || 'claude-sonnet-4-6';
const PROMPT_VERSION = 'v3'; // v3 (2026-07-21): NO-ABUTMENT layering — v2's flush-edge law still butt-joined zones and PDF rounding printed a white line; now the image goes UNDER the neighbor and fades (Paul's call)

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 600_000, maxRetries: 2 });
  return client;
}

export interface DeckImage { token: string; dataUri: string; focalX: number; focalY: number; role: string; pageIndex: number | null }
export interface DeckPageSpec { kind: string; heading?: string; body?: string; stat?: string; source?: string; imageToken?: string }

/* ─── vision thumbnails + edge analysis ──────────────────────────────────
 * The model needs to SEE each image to design around it, but raw uploads
 * can be 12MB. Downscale through the shared Chromium (no native deps):
 * draw onto a canvas capped at 640px long side, return JPEG. While the
 * pixels are on the canvas, also measure the image's EDGE color (average
 * of a 3px border frame) — a white-background illustration on the dark
 * cover needs a completely different treatment than a full-frame photo,
 * and stating the measured color in the brief makes the seam law
 * actionable instead of aspirational. Fail-soft to the original if
 * anything hiccups (the API caps images ~5MB). */
export interface ImageAnalysis { thumb: string; w: number; h: number; edgeHex: string | null; edgeLight: boolean | null }

export async function analyzeImage(dataUri: string): Promise<ImageAnalysis> {
  try {
    const page = await newRenderPage();
    try {
      const out = await page.evaluate(async (src: string) => {
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
        const long = Math.max(img.width, img.height) || 1;
        const s = Math.min(1, 640 / long);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        let r = 0, g = 0, b = 0, n = 0;
        const f = Math.min(3, c.width, c.height);
        const grab = (x: number, y: number, w: number, h: number) => {
          const d = ctx.getImageData(x, y, Math.max(1, w), Math.max(1, h)).data;
          for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        };
        grab(0, 0, c.width, f);
        grab(0, c.height - f, c.width, f);
        grab(0, 0, f, c.height);
        grab(c.width - f, 0, f, c.height);
        let edgeHex: string | null = null, edgeLight: boolean | null = null;
        if (n > 0) {
          r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
          edgeHex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
          edgeLight = (0.2126 * r + 0.7152 * g + 0.0722 * b) >= 150;
        }
        return { thumb: c.toDataURL('image/jpeg', 0.8), w: img.width, h: img.height, edgeHex, edgeLight };
      }, dataUri);
      const o = out as any;
      return { thumb: o.thumb || dataUri, w: o.w || 0, h: o.h || 0, edgeHex: o.edgeHex ?? null, edgeLight: o.edgeLight ?? null };
    } finally {
      await page.close().catch(() => {});
    }
  } catch {
    return { thumb: dataUri.length < 3_500_000 ? dataUri : '', w: 0, h: 0, edgeHex: null, edgeLight: null };
  }
}

export async function thumbDataUri(dataUri: string): Promise<string> {
  return (await analyzeImage(dataUri)).thumb;
}

/* ─── the design brief ─────────────────────────────────────────────────── */

export function deckSystemPrompt(): string {
  return [
    'You are the senior editorial designer for smbX.ai, composing a LinkedIn document carousel for Paul Baker (buy-side corporate development). Your pages must look professionally designed — the standard is a Bloomberg/Monocle editorial spread, not a slide template.',
    '',
    'CANVAS: each page is EXACTLY 1080×1350 (a <section class="pg">, position:relative, overflow:hidden). Output ONE <style> block followed by one <section class="pg" data-i="n"> per page, in order. NOTHING else — no markdown fences, no <html>/<head>/<body>, no comments outside CSS.',
    '',
    'BRAND (locked, no other values):',
    '- Bone paper #F6F4EF; ink #14181C; body gray #5C6670; muted #8A9099; hairline #E4E1D9.',
    '- Deal Green #16624C (deep #0F4E3C); mint on dark #8FD0AE; brass #B08637 (jewelry only); boardroom dark #0F1A16; ivory #F3F1EA; ivory-sub #D8D5CA.',
    "- Type: 'Fraunces' (display serif, weight 545) for headlines and pull-lines; 'Inter' for everything else (numerals font-weight 800, letter-spacing -0.03em); 'IBM Plex Mono' ONLY for small labels/sources (13px+ equivalent, letter-spacing ≤0.12em). Fonts are already loaded — just use the family names.",
    '- Dark pages: background #0F1A16 with the texture image url({{TEXTURE_DARK}}) (background-size:cover) + a soft green halo (radial-gradient, rgba(22,98,76,0.28) fading out) is the house look. Paint it on the SECTION element itself — never only on an inner column div — so a sub-pixel gap between children can only ever reveal dark, never a light page beneath.',
    '',
    'ASSETS arrive as tokens — use them as literal src values and NEVER invent other URLs:',
    '- {{LOGO}} (ink wordmark img, use height 30-48px), {{LOGO_WHITE}} (for dark pages).',
    "- {{HEADSHOT}} — Paul's real face photo. Byline grammar: 44-104px circle, 3px rgba(143,208,174,0.65) ring, next to 'Paul Baker' + 'Buy-side corporate development'.",
    '- {{IMG_n}} — the images Paul assigned to specific pages. You are SHOWN each one. Design each placement around what the image actually is: its shape, background, and subject.',
    '',
    'IMAGE LAW (this is where past decks failed — obey every clause):',
    '- Text NEVER touches or overlaps an image, unless the image is a full-bleed background behind a real legibility scrim (dark gradient ≥55% under light text).',
    '- NO ABUTMENT — LAYER, NEVER TILE. Two visual zones (image / text column / band) must NEVER meet at a shared hard edge: PDF rasterization rounds fractional pixels and prints a hairline of whatever lies beneath at every butt-joint (this exact defect shipped to LinkedIn as a white line — never again). The image always goes UNDERNEATH: extend its layer ≥120px PAST the boundary, under the neighboring zone, then paint that zone\'s field OVER it — solid where the text lives, dissolving to transparent across ≥200px of the image via absolutely-positioned linear-gradient overlay DIVS stacked ON TOP of the image (a gradient painted on a container BEHIND an <img> does nothing). Nothing ever butts; one layer always underlaps the other.',
    '- An image fills its layer COMPLETELY: position:absolute, object-fit:cover (object-position from the stated focal point). NEVER object-fit:contain, never auto height — no letterbox bars, no margins, flush to every page edge its layer touches.',
    "- Each image's brief states its measured EDGE/BACKGROUND color — design with it: (a) light-edged image on a LIGHT page: set the surrounding panel or page background to that exact color so the image floats seamlessly, or bleed it to the edge; (b) light-edged image on a DARK page: the dark must own the page — the image slides UNDER the dark field and every exposed edge (the inner edge, plus top/bottom when the background is light) fades out beneath #0F1A16 overlays. A hard light-to-dark cut, a white band, or any visible seam is a DEFECT.",
    '- Photographic full-bleed images: dissolve exposed edges toward the page background the same way (overlay gradients), or hold them in a clean architectural column — never a small floating card with a drop shadow.',
    '- Compose AROUND the image: give it a full column/half/band; cap the text column so a long headline wraps instead of spreading; balance the whitespace deliberately.',
    '',
    'STRUCTURE LAW: EXACTLY two dark pages — page 1 (the cover) and the final page (the closer). Everything between is light bone. The cover leads with the hook set large in Fraunces (two-tone: the second sentence/beat in mint on dark) and, if the cover has an image, uses the house cover grammar — LAYERED, per the image law: the image is a full-height layer anchored to the top/right/bottom page edges, spanning roughly the right 55-65% of the page so it slides UNDER the text side; over it, one linear-gradient overlay runs from solid #0F1A16 on the left (fully covering the text column\'s field) to transparent toward the right, so the image emerges from the dark with no seam anywhere (add matching top/bottom fades when its background is light); the text column sits on the dark field, vertically centered, and never crosses onto the unfaded part of the image. The closer carries the takeaway payoff: a small brass mono tag "FOR THE ACQUIRER", the takeaway headline in Fraunces ivory, its body, then the byline (ringed headshot + name + title), {{LOGO_WHITE}}, and a mint mono line "FOLLOW FOR THE NEXT READ." Light pages carry a small header lockup ({{LOGO}} + a mono section label) and a footer strip: either a slim dark band (#0F1A16, {{LOGO_WHITE}} at 34px + mono page "n / N") or an equally consistent light grammar — but be CONSISTENT across all light pages.',
    '',
    'CONTENT LAW (zero hallucination — hard rule): use the provided headings, bodies, stats and sources VERBATIM. Never invent, round, extend, or reword a number, source, or claim. You may choose which provided element is the visual hero of a page (e.g., set the number huge in Inter 800 with a brass bar, or lead with the heading), but the words themselves are fixed. Every stat page must show its source line (mono, muted).',
    '',
    'LEGIBILITY: body text ≥24px, sources ≥17px, headlines 40-64px (Fraunces), hero numerals 110-190px (Inter 800, tabular). Generous margins (≥76px sides). No element within 40px of another element it does not relate to.',
    '',
    'BE CONCISE IN CODE: shared classes in the one <style> block, no repeated inline styles, no comments. The whole output should stay well under 8,000 tokens.',
    '',
    'FINAL SELF-CHECK before returning: exactly two dark pages; NO butt-joints anywhere — every image underlaps its neighboring zone and fades beneath it, zero gaps, zero letterbox strips; dark backgrounds painted on the section itself; every heading/stat/source verbatim; section count exactly matches the brief.',
    '',
    'Return the <style> block + sections ONLY.',
  ].join('\n');
}

function pagesBrief(pages: DeckPageSpec[], typeLabel: string, title: string): string {
  const lines: string[] = [
    `DECK: "${title}" — section label "${typeLabel.toUpperCase()}". ${pages.length} content pages + you add NOTHING (the closer is the last entry below).`,
    '',
    'PAGES (in order; imageToken = the image Paul assigned to that page):',
  ];
  pages.forEach((p, i) => {
    lines.push(`${i + 1}. kind=${p.kind}${p.imageToken ? ` image=${p.imageToken}` : ''}`);
    if (p.heading) lines.push(`   heading: ${p.heading}`);
    if (p.stat) lines.push(`   stat (display numeral, verbatim): ${p.stat}`);
    if (p.body) lines.push(`   body: ${p.body}`);
    if (p.source) lines.push(`   source: ${p.source}`);
  });
  return lines.join('\n');
}

/* ─── generation ─────────────────────────────────────────────────────────── */

export interface DesignInputs {
  runId: number;
  title: string;
  typeLabel: string;
  pages: DeckPageSpec[];
  images: DeckImage[];       // tokens referenced by pages, with real data URIs
  logoUri: string;           // {{LOGO}}
  logoWhiteUri: string;      // {{LOGO_WHITE}}
  headshotUri: string;       // {{HEADSHOT}}
  textureUri: string;        // {{TEXTURE_DARK}}
}

export function deckKey(inp: DesignInputs): string {
  const h = createHash('sha1');
  h.update(JSON.stringify({
    v: PROMPT_VERSION, m: DECK_MODEL,
    pages: inp.pages, imgs: inp.images.map(i => ({ t: i.token, u: i.dataUri.length, fx: i.focalX, fy: i.focalY })),
    title: inp.title, type: inp.typeLabel,
  }));
  return h.digest('hex');
}

/** Validate + substitute. Returns full HTML (wrapped) or null when the
 *  output breaks a hard law — the caller then falls back to the template. */
export function assembleDeckHtml(raw: string, inp: DesignInputs, fontsHead: string): string | null {
  let body = String(raw ?? '').trim();
  body = body.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/, '').trim();
  if (!body.includes('<style')) return null;
  // one <section class="pg …"> per provided page (any extra class list is fine)
  const sections = body.match(/<section class="pg[^"]*"/g) ?? [];
  if (sections.length !== inp.pages.length) return null;
  // Zero-hallucination enforcement: headings, stats and sources must appear
  // VERBATIM (tag-stripped, whitespace/entity/quote-normalized — spans for
  // two-tone treatment are fine), and every NUMBER in a body must survive.
  const norm = (s: string) => s
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&times;/g, '×')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ').trim().toLowerCase();
  const hay = norm(body.replace(/<[^>]+>/g, ' '));
  for (const p of inp.pages) {
    for (const must of [p.heading, p.stat, p.source]) {
      if (must && must.trim() && !hay.includes(norm(must))) return null;
    }
    for (const num of (p.body ?? '').match(/\d[\d,.]*%?/g) ?? []) {
      if (!hay.includes(norm(num))) return null;
    }
  }
  // all tokens known; no foreign remote images
  const tokens = new Set(['{{LOGO}}', '{{LOGO_WHITE}}', '{{HEADSHOT}}', '{{TEXTURE_DARK}}', ...inp.images.map(i => i.token)]);
  for (const m of body.match(/\{\{[A-Z_0-9]+\}\}/g) ?? []) if (!tokens.has(m)) return null;
  if (/src="https?:/i.test(body) || /url\(\s*['"]?https?:/i.test(body)) return null;

  let html = body
    .replaceAll('{{LOGO_WHITE}}', inp.logoWhiteUri)
    .replaceAll('{{LOGO}}', inp.logoUri)
    .replaceAll('{{HEADSHOT}}', inp.headshotUri)
    .replaceAll('{{TEXTURE_DARK}}', inp.textureUri);
  for (const im of inp.images) html = html.replaceAll(im.token, im.dataUri);
  if (html.includes('{{')) return null;

  // img is inline by default — the baseline descender gap paints a white
  // hairline under every image (exactly the LinkedIn-cover seam Paul saw).
  // The @layer backstop paints every section the right register even when
  // the model painted only an inner column div: layered rules lose to ANY
  // unlayered model declaration, so this only fills sections the model left
  // unset — a rounding gap then reveals dark/bone, never the white PDF page.
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${fontsHead}
  <style>@layer pgbase { .pg { background: #F6F4EF; } section.pg:first-of-type, section.pg:last-of-type { background: #0F1A16; } }
  * { margin: 0; padding: 0; box-sizing: border-box; } img { vertical-align: middle; } html, body { width: 1080px; }
  .pg { width: 1080px; height: 1350px; position: relative; overflow: hidden; page-break-after: always; }
  .pg:last-child { page-break-after: auto; }</style>
  </head><body>${html}</body></html>`;
}

/** One design call. Streamed (long HTML), vision blocks for every assigned
 *  image so the model composes around what it actually sees. */
export async function generateDeckHtml(inp: DesignInputs, fontsHead: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const content: any[] = [{ type: 'text', text: pagesBrief(inp.pages, inp.typeLabel, inp.title) }];
  for (const im of inp.images) {
    const meta = await analyzeImage(im.dataUri);
    const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(meta.thumb);
    if (!m) continue;
    const dims = meta.w > 0 ? `${meta.w}×${meta.h}px` : 'dimensions unknown';
    const edge = meta.edgeHex
      ? `measured edge/background ≈ ${meta.edgeHex} (${meta.edgeLight ? 'LIGHT — on a dark page, slide it UNDER the dark field and fade its exposed edges out beneath #0F1A16 overlays; never butt its edge against another zone; a white band or visible seam is a defect' : 'dark-toned'})`
      : 'edge color unknown — judge from the image';
    content.push({ type: 'text', text: `${im.token} — assigned to page ${im.pageIndex != null ? im.pageIndex + 1 : '?'} (${im.role}). ${dims}; ${edge}. Focal point ${Math.round(im.focalX * 100)}% ${Math.round(im.focalY * 100)}% (use as object-position). Design its placement around what you see:` });
    content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } });
  }
  try {
    const resp: any = await anthropic().messages
      .stream({ model: DECK_MODEL, max_tokens: 14000, system: deckSystemPrompt(), messages: [{ role: 'user', content }] })
      .finalMessage();
    const raw = (resp.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    return assembleDeckHtml(raw, inp, fontsHead);
  } catch (err: any) {
    console.warn(`[deck] design call failed for run ${inp.runId}:`, err?.message);
    return null;
  }
}

/* ─── cache on the run (feed_override.deck) ─────────────────────────────── */

export async function readDeckCache(runId: number): Promise<{ key: string; html: string } | null> {
  try {
    const [row] = await sql`SELECT feed_override FROM research_runs WHERE id = ${runId}`;
    const d = (row as any)?.feed_override?.deck;
    return d && typeof d.key === 'string' && typeof d.html === 'string' ? d : null;
  } catch { return null; }
}

export async function writeDeckCache(runId: number, key: string, html: string): Promise<void> {
  try {
    const [row] = await sql`SELECT feed_override FROM research_runs WHERE id = ${runId}`;
    const base = ((row as any)?.feed_override && typeof (row as any).feed_override === 'object') ? (row as any).feed_override : {};
    await sql`UPDATE research_runs SET feed_override = ${sql.json({ ...base, deck: { key, html } })}::jsonb WHERE id = ${runId}`;
  } catch (err: any) {
    console.warn(`[deck] cache write failed for run ${runId}:`, err?.message);
  }
}

/** Drop the cached design (the review sheet's "Redesign" button). */
export async function clearDeckCache(runId: number): Promise<void> {
  try {
    const [row] = await sql`SELECT feed_override FROM research_runs WHERE id = ${runId}`;
    const base = ((row as any)?.feed_override && typeof (row as any).feed_override === 'object') ? { ...(row as any).feed_override } : {};
    delete (base as any).deck;
    await sql`UPDATE research_runs SET feed_override = ${sql.json(base)}::jsonb WHERE id = ${runId}`;
  } catch (err: any) {
    console.warn(`[deck] cache clear failed for run ${runId}:`, err?.message);
  }
}

/* In-flight dedupe: the review sheet fires cover + strip + pdf together —
 * only one design call per run at a time. */
const inflight = new Map<number, Promise<string | null>>();
export function dedupeDesign(runId: number, make: () => Promise<string | null>): Promise<string | null> {
  const cur = inflight.get(runId);
  if (cur) return cur;
  const p = make().finally(() => inflight.delete(runId));
  inflight.set(runId, p);
  return p;
}
