/**
 * SEND TO STUDIO — the rule, on its own.
 *
 * `shared/studioSend.ts` is read by three things: the server (which refuses the
 * request), the client (which greys the button out with the same sentence) and
 * `pull-queue.mjs` (which reports what it was handed). It is pure and it is the
 * only place the rule is written, so it is the only place worth testing — and
 * unlike the post-queue suite it needs no Postgres, so it runs anywhere.
 *
 * Why these cases and not others: every one of them is a way a post could reach
 * LinkedIn wrong, or a way the studio could be sent work it cannot do.
 *
 *   • A caption with [RECEIPT] brackets still in it must never be buildable.
 *     The plan's law is absolute — "does not ship with brackets in it" — and a
 *     build is the last moment anything mechanical can catch it.
 *   • A video day must not be sendable without a video: nothing renders a piece
 *     to camera, so a work order with no file is one nobody can fill.
 *   • An image slot must not be sendable without a template, or the session is
 *     guessing at the house style — the drift FORMATS.md exists to stop.
 *   • A plain TEXT day must be sendable with NOTHING but copy. Seven of the
 *     thirty days are text posts; requiring a template would block all of them.
 *   • A decision changed after sending must read STALE, not sent. Otherwise
 *     Cowork builds the old one and both sides think they agree.
 */
import { sendReadiness, sendState, outgoingCopy, UNFILLED } from '../../shared/studioSend.js';

let pass = 0, total = 0;
const T = (name: string, got: any, want: any) => {
  total++;
  const ok = typeof want === 'function' ? want(got) : JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name.padEnd(62)} ${typeof got === 'object' ? JSON.stringify(got).slice(0, 70) : String(got).slice(0, 70)}`);
};

const base = { kind: 'text', status: 'next', body: 'A finished post.', copy_edit: null, gate: null, template: null, video_file: null };

console.log('\nWHAT EACH MEDIUM OWES');
T('a plain text day needs only copy', sendReadiness(base), { ok: true, asks: 'copy only' });
T('an image day needs a template', sendReadiness({ ...base, kind: 'image' }).ok, false);
T('…and the reason names the medium', /image slot/.test(sendReadiness({ ...base, kind: 'image' }).reason ?? ''), true);
T('an image day with a template is ready', sendReadiness({ ...base, kind: 'image', template: 'figure-card' }), { ok: true, asks: 'template' });
T('a document day needs a template too', sendReadiness({ ...base, kind: 'document' }).ok, false);
T('a video day needs a video, not a template', sendReadiness({ ...base, kind: 'video' }).ok, false);
T('…and says so in the plan\'s own terms', /nothing renders a piece to camera/.test(sendReadiness({ ...base, kind: 'video' }).reason ?? ''), true);
T('a video day with a take is ready', sendReadiness({ ...base, kind: 'video', video_file: 'day-01.mov' }), { ok: true, asks: 'video' });
/* A template on a video slot is not a way to satisfy it: the pick has to be a
   file. (updateQueueDraft refuses the pick too, but the two guards are
   independent — this one holds even if a row was written by hand.) */
T('a template does NOT satisfy a video day', sendReadiness({ ...base, kind: 'video', template: 'figure-card' }).ok, false);
/* And the reverse IS allowed: a number post can go out as a video if that is
   the call. The video wins because it is the more specific decision. */
T('a video pick beats a template on any slot', sendReadiness({ ...base, kind: 'image', template: 'figure-card', video_file: 'x.mov' }).asks, 'video');

console.log('\nTHE BRACKET RULE — a receipt that was never filled must not ship');
const gated = { ...base, gate: 'RECEIPT-GATED. Does not ship with brackets in it.', body: 'The deal died on day [N]. Not at price.' };
T('unfilled receipts block the send', sendReadiness(gated).ok, false);
T('…and the reason names the gate', /gated/.test(sendReadiness(gated).reason ?? ''), true);
T('brackets block even with no gate recorded', sendReadiness({ ...base, body: 'It ran [$X–Y] per acquisition.' }).ok, false);
T('a filled receipt ships', sendReadiness({ ...gated, body: 'The deal died on day 41. Not at price.' }), { ok: true, asks: 'copy only' });
/* The opener must be a capital or a currency mark: ordinary prose puts lowercase
   words in brackets and would otherwise block every post that used an aside. */
T('lowercase prose in brackets is not a receipt', sendReadiness({ ...base, body: 'The check (see [the list below]) is free.' }).ok, true);
T('UNFILLED matches [N] [X]% [$X–Y] [TRADE] [RECEIPT: …]',
  ['[N]', '[X]%', '[$X–Y]', '[TRADE]', '[RECEIPT: the cost]'].every(x => UNFILLED.test(x)), true);
/* THE EDIT IS WHAT SHIPS, so the edit is what gets checked. Checking `body`
   would pass a clean plan while Paul's edit — the text that actually goes out —
   still had a bracket in it. */
T('the EDIT is what is checked, not the plan', sendReadiness({ ...base, body: 'clean', copy_edit: 'still has [N] in it' }).ok, false);
T('…and a clean edit over a bracketed plan is fine', sendReadiness({ ...base, body: 'has [N]', copy_edit: 'clean now' }).ok, true);

console.log('\nNOTHING TO SEND');
T('no copy at all is refused', sendReadiness({ ...base, body: null }).ok, false);
T('…and the reason says the post has not been drafted', /has not been drafted/.test(sendReadiness({ ...base, body: null }).reason ?? ''), true);
T('a posted slot is refused', sendReadiness({ ...base, status: 'posted' }).ok, false);
T('a parked slot is refused', sendReadiness({ ...base, status: 'parked' }).ok, false);
T('whitespace is not copy', sendReadiness({ ...base, body: '   \n  ' }).ok, false);

console.log('\noutgoingCopy — the edit if there is one, else the plan');
T('the edit wins', outgoingCopy({ body: 'plan', copy_edit: 'edit' }), 'edit');
T('an empty edit falls back to the plan', outgoingCopy({ body: 'plan', copy_edit: '  ' }), 'plan');
T('neither is the empty string, never null', outgoingCopy({ body: null, copy_edit: null }), '');

console.log('\nWHERE THE REQUEST STANDS');
const t0 = '2026-08-20T10:00:00Z', t1 = '2026-08-20T11:00:00Z', t2 = '2026-08-20T12:00:00Z';
T('never sent', sendState({}), 'none');
T('sent, nothing back', sendState({ sent_at: t1, draft_at: t0 }), 'sent');
T('built after the send', sendState({ sent_at: t1, built_at: t2, draft_at: t0 }), 'built');
/* THE ONE THAT MATTERS: edit after send. Without this the screen says "sent"
   while Cowork is holding a work order for the previous decision. */
T('edited after the send reads STALE', sendState({ sent_at: t1, draft_at: t2 }), 'stale');
T('…even when a build came back in between', sendState({ sent_at: t0, built_at: t1, draft_at: t2 }), 'stale');
T('a build from BEFORE the send does not count', sendState({ sent_at: t2, built_at: t1, draft_at: t0 }), 'sent');
/* Saving a decision and sending it in the same second must not read as stale —
   the save writes draft_at, then the send writes sent_at, and equal timestamps
   are the ordinary case rather than a conflict. */
T('a save and a send in the same instant is sent, not stale', sendState({ sent_at: t1, draft_at: t1 }), 'sent');
T('a build at the same instant as the send counts', sendState({ sent_at: t1, built_at: t1, draft_at: t0 }), 'built');
T('Date objects work as well as ISO strings', sendState({ sent_at: new Date(t1), draft_at: new Date(t2) }), 'stale');

console.log(`\n${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
