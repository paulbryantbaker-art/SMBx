/**
 * THE TEMPLATE REGISTER — the collateral templates a slot can be rendered
 * with, named once so the app's picker, the server's validation and the
 * studio's pull script all mean the same thing by the same id.
 *
 * Paul, 2026-08-19: "i want to be able to choose the template and edit the
 * copy before anything is finally rendered in Cowork." The choice is made in
 * the app (it is a DECISION about a slot — state, queryable, THE SPLIT's
 * "pipelines are rows") and the render happens in Cowork from the spec on
 * disk (THE SPLIT's "documents are files"). This file is the vocabulary that
 * crosses that boundary.
 *
 * IT SPEAKS PAUL'S FIVE (2026-08-20). `studio/TEMPLATES.md` is the menu he
 * picks from and the card deck at
 * `studio/collateral/_reference/smbx-templates-reference.pdf` shows each one
 * as COVER · CONTENT · CTA. Paul: *"CC just needs to know which I will pick
 * from."* So every label here is one of his five words plus the LENGTH:
 *
 *   Carousel · One page · Monolith (dark look) · Portal (light look) · Report
 *
 * MONOLITH AND PORTAL ARE LOOKS, NOT LENGTHS — each arrives as a carousel or
 * as a single image, which is why each has two entries here rather than one.
 * A pick names both the look and the length, exactly as a request to Cowork
 * does. THE OFFER DOCUMENT IS PORTAL — a Portal carousel whose content happens
 * to be the offering — so `offer-docs-light` is RETIRED into that; the card
 * deck's BUILD.txt says "Paul removed the one-offs and folded the offer
 * document into Portal. Do not reinstate either."
 *
 * SOURCE OF TRUTH FOR WHAT EACH TEMPLATE LOOKS LIKE IS `studio/FORMATS.md`
 * (the container), `studio/DESIGN.md` (the look) and `studio/TEMPLATES.md`
 * (the menu and what parts go with each) — this register carries ids and
 * one-line descriptions only. `desc` says which CONTENT pages and which CTA
 * page belong to the template, because that is the question Paul asked it to
 * answer. When a builder gains a ground or a layout, it is added HERE in the
 * same commit, or the app cannot offer it. Retiring one: mark `retired: true`
 * rather than deleting — a row may still name it.
 *
 * `renderer` is the command family Cowork runs; `hint` is what the pull script
 * prints beside the pick so a session knows which flag to set. Neither is
 * executed by the app — the app calls no builder and no model.
 */

export type TemplateFor = 'text' | 'document';

export interface CollateralTemplate {
  id: string;
  /** Which slot kind it renders: a `text` slot is a single-image post, a `document` slot is a carousel PDF. */
  for: TemplateFor;
  label: string;
  /** One line, the user-facing description in the picker. */
  desc: string;
  /** Which builder, and how to ask it for this template. */
  renderer: 'build-onepager.mts' | 'figure-deck.py' | 'build-deck.mts' | 'offer-docs.py' | 'build-report.mts';
  hint: string;
  /** `live`: a committed builder renders it from a spec today. `pending`: the
   *  design is approved but no builder takes it yet — the pick is RECORDED (it
   *  is Paul's decision) and the picker says so, but nothing can render it
   *  until the builder gains the option. The builders-only law
   *  (studio/CLAUDE.md: never hand-roll a layout) is why this is a flag and
   *  not a hint buried in prose. */
  status: 'live' | 'pending';
  retired?: boolean;
}

export const TEMPLATES: readonly CollateralTemplate[] = [
  /* ── ONE PAGE — a single image post (text slots) ───────────────────
     No content pages and no CTA page: everything is on the one surface and
     the foot bar IS the CTA (TEMPLATES.md §2). */
  {
    id: 'figure-card',
    for: 'text',
    label: 'One page — figure (the default)',
    desc: 'The standing cutout with the copy wrapping it. Kicker, hook, lede, numbered points, source note, foot bar with the byline. Renders dark AND light.',
    renderer: 'build-onepager.mts',
    hint: "layout unset (or 'figure') — renders both variants",
    status: 'live',
  },
  {
    id: 'figure-card-monolith',
    for: 'text',
    label: 'One page — Monolith (dark)',
    desc: 'The dark figure card only: Deal Green monolith band, offset rim plate, bloom aimed at the torso. The C treatment is its default.',
    renderer: 'build-onepager.mts',
    // Was marked `pending` with "no builder renders this today" — wrong since
    // 2026-08-18, when the figure layout became the one-pager DEFAULT and the
    // C treatment (bloom + 1.16/1.05 lift) shipped with it. COLLATERAL_STATE
    // §1A. A pending flag on a live builder tells a session to refuse work it
    // can do, which is the same failure as naming a script that does not exist.
    hint: "layout: 'figure', variants: ['dark']",
    status: 'live',
  },
  {
    id: 'figure-card-portal',
    for: 'text',
    label: 'One page — Portal (light)',
    desc: 'The light figure card: receding green portal steps on paper, gradient copy panel, dot field. A different mechanic from the monolith, not a recolour.',
    renderer: 'build-onepager.mts',
    hint: "layout: 'figure', variants: ['light']",
    status: 'live',
  },
  {
    id: 'split-dark',
    for: 'text',
    label: 'One page — split, dark',
    desc: 'The older split: copy column left, full-bleed photo right, recessed seam. Kept so the back catalogue rebuilds unchanged.',
    renderer: 'build-onepager.mts',
    hint: "layout: 'split', variants: ['dark']",
    status: 'live',
  },
  {
    id: 'split-light',
    for: 'text',
    label: 'One page — split, light',
    desc: 'The split on bone. Same geometry as the dark, same back-catalogue reason for existing.',
    renderer: 'build-onepager.mts',
    hint: "layout: 'split', variants: ['light']",
    status: 'live',
  },

  /* ── CAROUSEL and REPORT — multi-page (document slots) ─────────────
     Cover and CTA are AUTO-ADDED; never author them as pages. Bookend law:
     the ground is worn by the cover and the CTA only, never a third, never
     two in a row (TEMPLATES.md §1, §3, §4). */
  {
    id: 'house-deck',
    for: 'document',
    label: 'Carousel — the house deck',
    desc: 'Cover auto-added from the hook. Body pages are numeral · statement · diagram · trade and nothing else; trade is the only one with an image slot. CTA page auto-added from closer{}.',
    renderer: 'build-deck.mts',
    hint: 'build-deck.mts <spec.deck.mts> [--bookend dark|light|both]',
    status: 'live',
  },
  {
    id: 'figure-deck-dark',
    for: 'document',
    label: 'Carousel — Monolith (dark)',
    desc: 'The monolith on the COVER, house light grammar on every body page, CTA is Frame C — the portrait in a golden rectangle with the green action bar. The monolith is a cover treatment, not a page style.',
    renderer: 'figure-deck.py',
    hint: '--ground monolith-dark',
    status: 'live',
  },
  {
    id: 'figure-deck-light',
    for: 'document',
    label: 'Carousel — Portal (light)',
    desc: 'Portal steps on the cover, the same house light body grammar, CTA is Frame C light with the plate pair where the content calls for it. THE OFFER DOCUMENT IS THIS — the content varies, the template does not.',
    renderer: 'figure-deck.py',
    hint: '--ground portal-light',
    status: 'live',
  },
  {
    id: 'report',
    for: 'document',
    label: 'Report — long-form PDF',
    desc: 'Dark cover with the stat band and headshot byline, markdown sections as content pages, hairline tables. NO CTA page — it closes on Sources, Derivations and What we don\'t know yet.',
    renderer: 'build-report.mts',
    // Missing from this register until 2026-08-20 even though build-report.mts
    // has been live since 2026-08-15 (COLLATERAL_STATE §2) — so it was the one
    // of Paul's five the app could not offer at all.
    hint: 'build-report.mts <report.md> [--eyebrow "…"] [--footer "…"]',
    status: 'live',
  },
  {
    id: 'offer-docs-light',
    for: 'document',
    label: 'Offer document (retired — it is Portal)',
    desc: 'Folded into Portal on 2026-08-20: the offer document is a Portal carousel whose content happens to be the offering. Pick "Carousel — Portal (light)".',
    renderer: 'offer-docs.py',
    hint: 'offer-docs.py — retired as a separate template; the worked example for the Portal ground',
    status: 'live',
    retired: true,
  },
] as const;

export const TEMPLATE_IDS = new Set(TEMPLATES.map(t => t.id));

/**
 * THE MEDIUM IS NOT THE RENDERER, and this is the one place that says so.
 *
 * `post_queue.kind` is the medium the plan chose — text · image · video ·
 * document. `TemplateFor` is the renderer family. They are not the same
 * vocabulary and mapping them in two places is how the app offers a template
 * the server then refuses to save (which is exactly what happened when the
 * 30-day sequence introduced `image`: the picker mapped image → text, the
 * server compared `t.for !== cur.kind` and threw "renders a text slot; this
 * slot is image" on Save).
 *
 *   text     → text      a plain post; a `text` template adds the single image
 *   image    → text      the single-image post IS what those templates render
 *   document → document  a carousel / offer document
 *   video    → null      NOTHING renders a piece to camera. A video slot picks
 *                        a FILE, not a template — see `video_file`.
 */
export function templateForKind(kind: string | null | undefined): TemplateFor | null {
  if (kind === 'text' || kind === 'image') return 'text';
  if (kind === 'document') return 'document';
  return null;
}

export function templatesFor(kind: TemplateFor | null | undefined): CollateralTemplate[] {
  return TEMPLATES.filter(t => t.for === kind && !t.retired);
}

/** Every template a slot of this MEDIUM may pick. Empty for video, by design. */
export function templatesForKind(kind: string | null | undefined): CollateralTemplate[] {
  return templatesFor(templateForKind(kind));
}

export function templateById(id: string | null | undefined): CollateralTemplate | null {
  if (!id) return null;
  return TEMPLATES.find(t => t.id === id) ?? null;
}
