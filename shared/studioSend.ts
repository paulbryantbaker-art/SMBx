/**
 * SEND TO STUDIO — is this slot ready to be built, and what is being asked for.
 *
 * Paul, 2026-08-20: *"we need a Send to Studio button that tells cowork to build
 * it… we just need to pass back what I want it to build and template type."*
 *
 * THE APP CANNOT BUILD ANYTHING and this file does not pretend otherwise. The
 * renderer is local Chromium against the workspace on Paul's Mac; the app runs
 * on Railway, calls no builder and writes nothing to the clone. So "Send to
 * Studio" is a REQUEST — a timestamp against a decision — and `pull-queue.mjs`
 * on the Mac is what acts on it. What the button actually buys is the thing
 * that was missing: before it, `pull-queue` pulled every row carrying an edit,
 * with no way to tell "I am still working on this" from "build this one".
 *
 * AND IT PASSES BACK THE DECISION, NOT A PLACE TO PUT THE RESULT. The first cut
 * of this also assembled a ready-to-post folder on disk; Paul: *"Cowork already
 * knows where to put created collateral just let it do its thing."* It does —
 * `studio/CLAUDE.md` §4 and the plan's own `filed_at` have said where since
 * July. What the studio was missing was never the destination.
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
 *             would block them.
 *   image     a TEMPLATE. Something has to be rendered; without a pick the
 *             session is guessing at the house style, which is the drift
 *             FORMATS.md exists to stop.
 *   document  a TEMPLATE, same argument as image.
 *   video     NOTHING, and there is nothing to send (Paul, 2026-08-20: "if it
 *             is a video, then there is nothing for it to do i guess bc i will
 *             have the video already made"). He films it; the file is already
 *             on his disk. The app does not ask which take, because knowing
 *             would not change anything it does.
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
}

export interface SendVerdict {
  /** May the request be made? */
  ok: boolean;
  /** Why not — one sentence, shown on the button and returned by the API. */
  reason?: string;
  /** What Cowork is being asked to make, once ok. */
  asks?: 'template' | 'copy only';
  /**
   * There is nothing for the studio to do — not a problem to fix, a fact about
   * the slot. Separate from `ok: false` so the screen can say it in grey rather
   * than dressing a filmed post up as a blocked one.
   */
  noBuild?: boolean;
}

/** The text that would be posted: the live edit if there is one, else the plan's. */
export function outgoingCopy(row: SendRow): string {
  const edit = (row.copy_edit ?? '').trim();
  return edit || (row.body ?? '').trim();
}

export function sendReadiness(row: SendRow): SendVerdict {
  if (row.status === 'posted') return { ok: false, reason: 'Already posted — there is nothing left to build.' };
  if (row.status === 'parked') return { ok: false, reason: 'This slot is parked. Unpark it first.' };

  // A VIDEO SLOT HAS NOTHING TO SEND, and that is true whether or not the
  // script is written — so it is decided BEFORE the copy is looked at. Ordering
  // it after meant a filmed day with no script yet showed a live Send button
  // reading "no copy yet", which is a job to go and finish; there is no job.
  if (row.kind === 'video') {
    return { ok: false, noBuild: true, reason: 'Nothing to build — this one is filmed and you already have it. Post it and mark it here.' };
  }

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

  if (row.template && row.template.trim()) return { ok: true, asks: 'template' };

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
