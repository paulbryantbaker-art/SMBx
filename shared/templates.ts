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
 * SOURCE OF TRUTH FOR WHAT EACH TEMPLATE LOOKS LIKE IS `studio/FORMATS.md`
 * (the container) and `studio/DESIGN.md` (the look) — this register carries
 * ids and one-line descriptions only, derived from FORMATS.md §1 (build-deck),
 * §2.0 (the FIGURE one-pager, default since 2026-08-18), §2.2 (figure-deck.py
 * grounds) and the 2026-08-19 Claude Design handoffs
 * (design_handoff_smbx_figure_card · design_handoff_smbx_offer_docs). When a
 * builder gains a ground or a layout, it is added HERE in the same commit, or
 * the app cannot offer it. Retiring one: mark `retired: true` rather than
 * deleting — a row may still name it.
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
  renderer: 'build-onepager.mts' | 'figure-deck.py' | 'build-deck.mts' | 'offer-docs.py';
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
  /* ── single-image posts (text slots) ─────────────────────────────── */
  {
    id: 'figure-card',
    for: 'text',
    label: 'Figure card (the default)',
    desc: 'Paul standing oversized on the card, copy wrapping the silhouette — FORMATS.md §2.0, the default since 2026-08-18 (a spec with no layout and no image renders it). Dark + light variants both render.',
    renderer: 'build-onepager.mts',
    hint: "layout unset (or 'figure'); build-onepager.mts renders dark + light",
    status: 'live',
  },
  /* The Claude Design grounds for the figure card — monolith-dark and
     portal-light (design_handoff_smbx_figure_card, 2026-08-19) — are NOT yet a
     build-onepager.mts option: its spec has layout:'figure'|'split' and no
     `ground`. The handoff's own CLAUDE.md names the switch it wants
     ("ground: 'monolith-dark' | 'portal-light'"); until that lands these two
     ids are offered as the DECISION (so the pick is recorded) and the hint
     says plainly where the render has to come from today. */
  {
    id: 'figure-card-monolith',
    for: 'text',
    label: 'Figure card · monolith (dark) — Claude Design ground',
    desc: 'The approved dark ground: Deal Green monolith on the band, rim plate, aimed bloom. NOT BUILT YET — build-onepager.mts has no `ground:` option; the pick is recorded so the render can happen when it does. Reference: design_handoff_smbx_figure_card/dark-2a-green-monolith.html.',
    renderer: 'build-onepager.mts',
    hint: "ground: 'monolith-dark' — pending in build-onepager.mts (no builder renders this today; do not hand-roll from the reference HTML)",
    status: 'pending',
  },
  {
    id: 'figure-card-portal',
    for: 'text',
    label: 'Figure card · portal (light) — Claude Design ground',
    desc: 'The approved light ground: four receding green portal steps on paper, dot field. NOT BUILT YET — same status as the monolith.',
    renderer: 'build-onepager.mts',
    hint: "ground: 'portal-light' — pending in build-onepager.mts (no builder renders this today)",
    status: 'pending',
  },
  {
    id: 'split-dark',
    for: 'text',
    label: 'Split · dark',
    desc: 'The pre-2026-08-18 vertical split: copy column on the dark ground beside a full-bleed photo. Back catalogue; set layout: "split" explicitly.',
    renderer: 'build-onepager.mts',
    hint: "layout: 'split', variants: ['dark']",
    status: 'live',
  },
  {
    id: 'split-light',
    for: 'text',
    label: 'Split · light',
    desc: 'The split layout on bone.',
    renderer: 'build-onepager.mts',
    hint: "layout: 'split', variants: ['light']",
    status: 'live',
  },

  /* ── carousels (document slots) ──────────────────────────────────── */
  {
    id: 'figure-deck-dark',
    for: 'document',
    label: 'Figure carousel · monolith cover',
    desc: 'Cover and closer wear the monolith-dark figure ground; every page between is the house light grammar (bookend law).',
    renderer: 'figure-deck.py',
    hint: '--ground monolith-dark',
    status: 'live',
  },
  {
    id: 'figure-deck-light',
    for: 'document',
    label: 'Figure carousel · portal cover',
    desc: 'Cover and closer on the portal-light ground; light pages between.',
    renderer: 'figure-deck.py',
    hint: '--ground portal-light',
    status: 'live',
  },
  {
    id: 'offer-docs-light',
    for: 'document',
    label: 'Offer document · portal family (Claude Design, round two)',
    desc: 'The 2026-08-19 Claude Design carousel system: portal-light bookends, plated closer, body pages with real graphic presence. NOT YET A SLOT RENDERER — offer-docs.py (Cowork, in flight, uncommitted as of 2026-08-19) renders two fixed documents from copy inside the script, not a slot\'s pages; the pick is recorded for when it takes a spec.',
    renderer: 'offer-docs.py',
    hint: 'offer-docs.py — pending: no spec argument yet (the handoff CLAUDE.md suggests page kinds; the script decides its own interface)',
    status: 'pending',
  },
  {
    id: 'house-deck',
    for: 'document',
    label: 'House deck (classic)',
    desc: 'build-deck.mts: dark cover + closer bookends, numeral / statement / diagram / trade pages. The pre-figure grammar.',
    renderer: 'build-deck.mts',
    hint: 'build-deck.mts <spec.deck.mts>',
    status: 'live',
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
