/**
 * SEND TO STUDIO — is this slot ready to be built, and what is being asked for.
 *
 * Paul, 2026-08-20: *"when i have the copy the way i want it and have saved the
 * decision — we need a Send to Studio button that tells cowork to build it and
 * put it in the Finder and ready for posting. I need to be able to tell cowork
 * which template style to use or if this is using one of the videos."*
 *
 * THE APP CANNOT BUILD ANYTHING and this file does not pretend otherwise. The
 * renderer is local Chromium against the workspace on Paul's Mac; the app runs
 * on Railway, calls no builder and writes nothing to the clone. So "Send to
 * Studio" is a REQUEST — a timestamp and a work order — and `pull-queue.mjs`
 * on the Mac is what acts on it. What the button actually buys is the thing
 * that was missing: before it, `pull-queue` pulled every row carrying an edit,
 * with no way to tell "I am still working on this" from "build this one".
 *
 * ONE DEFINITION, THREE READERS — the server (which refuses the request), the
 * client (which disables the button and says why) and the pull script (which
 * reports what it was handed). The same rule written three times is how a slot
 * gets built from a caption that still has [RECEIPT] brackets in it.
 *
 * WHAT EACH MEDIUM OWES, and why it differs:
 *
 *   text      nothing but the copy. Seven of the thirty days are plain text
 *             posts — there is no artifact to render, and requiring a template
 *             would block them. The ready folder gets caption.txt and that is
 *             the whole job.
 *   image     a TEMPLATE. Something has to be rendered; without a pick the
 *             session is guessing at the house style, which is the drift
 *             FORMATS.md exists to stop.
 *   video     a VIDEO FILE. Nothing renders a piece to camera.
 *   document  a TEMPLATE, same argument as image.
 *
 * THE BRACKET RULE IS ABSOLUTE. A receipt-gated slot carries [N], [X]% and
 * [TRADE] where Paul's own record has to go, and the plan's law is that it
 * "does not ship with brackets in it". A build is the last moment anything
 * mechanical can catch that, so it is caught here rather than trusted to the
 * person pasting at 8pm.
 */

/** Unfilled receipts: [N], [X]%, [$X–Y], [TRADE], [RECEIPT: …]. Lowercase words
 *  in brackets are ordinary prose ("[see below]"), so the opener must be a
 *  capital or a currency mark — the same test the copy box uses on screen. */
export const UNFILLED = /\[[A-Z$][^\]]*\]/;

export interface SendRow {
  kind?: string | null;
  status?: string | null;
  body?: string | null;
  copy_edit?: string | null;
  gate?: string | null;
  template?: string | null;
  video_file?: string | null;
}

export interface SendVerdict {
  /** May the request be made? */
  ok: boolean;
  /** Why not — one sentence, shown on the button and returned by the API. */
  reason?: string;
  /** What Cowork is being asked to make, once ok. */
  asks?: 'template' | 'video' | 'copy only';
}

/** The text that would be posted: the live edit if there is one, else the plan's. */
export function outgoingCopy(row: SendRow): string {
  const edit = (row.copy_edit ?? '').trim();
  return edit || (row.body ?? '').trim();
}

export function sendReadiness(row: SendRow): SendVerdict {
  if (row.status === 'posted') return { ok: false, reason: 'Already posted — there is nothing left to build.' };
  if (row.status === 'parked') return { ok: false, reason: 'This slot is parked. Unpark it first.' };

  const copy = outgoingCopy(row);
  if (!copy) {
    return { ok: false, reason: 'No copy yet — the plan carries a brief for this slot and the post has not been drafted.' };
  }
  // The gate is why the slot cannot ship as planned; brackets are the proof it
  // still cannot. A gate whose brackets are filled is a decision Paul made and
  // is not second-guessed here.
  if (UNFILLED.test(copy)) {
    return {
      ok: false,
      reason: row.gate
        ? 'The copy still has unfilled brackets in it — this slot is gated and does not ship until they are filled.'
        : 'The copy still has unfilled brackets in it.',
    };
  }

  const video = !!(row.video_file && row.video_file.trim());
  const template = !!(row.template && row.template.trim());

  // A VIDEO SLOT IS SATISFIED BY A FILE AND BY NOTHING ELSE, and this has to be
  // decided BEFORE the template is looked at. Checking the template first made
  // a video day with a stray template pick read as ready to build — a work
  // order asking a builder to render a piece to camera, which no builder does.
  // (`updateQueueDraft` refuses that pick as well; the two guards are
  // independent so a hand-written row cannot slip past both.)
  if (row.kind === 'video') {
    return video
      ? { ok: true, asks: 'video' }
      : { ok: false, reason: 'Pick the video file first — nothing renders a piece to camera, so the studio needs to know which take to file.' };
  }

  // On every other medium a video pick is allowed and WINS: a number post can
  // go out as a video if that is the call, and choosing a file is the more
  // specific decision than choosing a renderer.
  if (video) return { ok: true, asks: 'video' };
  if (template) return { ok: true, asks: 'template' };

  if (row.kind === 'image' || row.kind === 'document') {
    return { ok: false, reason: `Pick a template first — an ${row.kind} slot has something to render, and without a pick the studio is guessing at the house style.` };
  }
  // text, and anything the plan left unlabelled: the copy IS the post.
  return { ok: true, asks: 'copy only' };
}

export type SendState = 'none' | 'sent' | 'stale' | 'built';

/**
 * Where the request stands.
 *
 *   none    never sent
 *   sent    sent, and the studio has not reported back
 *   stale   sent, then the decision changed — the studio would build the old
 *           one. This is the same failure `copy_base` exists to catch one step
 *           earlier, and it is why `draft_at` is compared rather than trusted.
 *   built   the studio filed it and said where
 */
export function sendState(row: {
  sent_at?: string | Date | null; built_at?: string | Date | null; draft_at?: string | Date | null;
}): SendState {
  const at = (v: string | Date | null | undefined) => (v ? new Date(v).getTime() : 0);
  const sent = at(row.sent_at);
  if (!sent) return 'none';
  const built = at(row.built_at);
  const drafted = at(row.draft_at);
  if (drafted > sent) return 'stale';
  return built >= sent ? 'built' : 'sent';
}
