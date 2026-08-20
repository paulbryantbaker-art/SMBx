process.env.DATABASE_URL = process.env.PQ_URL || 'postgres://postgres@127.0.0.1:5434/postgres';
/**
 * The post queue — behaviour suite.
 *
 * Run against a scratch Postgres:
 *   PQ_URL=postgres://…  npm run test:post-queue
 *
 * Why these cases and not others: every one of them is a way the ownership rule
 * between `POST_QUEUE.md` and the app could silently break.
 *
 *   • An import that ran twice must not double the queue.
 *   • An import must NOT undo a posted week — the markdown cannot know a human
 *     clicked, so its status is a floor and never a ceiling.
 *   • `posted_at` must be stamped by the app on a human action, never inferred,
 *     and a `posted` row without one must be impossible at the database level.
 *   • `may_state_figure` missing must be an ERROR, not a falsy default. It
 *     decides whether a post may put a number in front of a reader.
 *
 * The floor-rule test is here because it CAUGHT A REAL BUG: computing the
 * elevated status in JS and inserting it offered Postgres a row with
 * status='posted' and a null posted_at, and the CHECK constraint rejected the
 * upsert before ON CONFLICT could resolve it. The constraint that exists to
 * make "never inferred" checkable was failing the one path that honoured it.
 * Reading the code would not have found that.
 */
const { importQueue, listQueue, updateQueueState, readQueueFile, validateQueue, listCampaigns, campaignMeta, normalizeQueueRow } =
  await import('../postQueue.js');
const { sql } = await import('../../db.js');

let pass = 0, total = 0;
const T = async (name: string, fn: () => any, want: any) => {
  total++;
  let got: any;
  try { got = await fn(); } catch (e: any) { got = `THREW: ${String(e.message).slice(0, 90)}`; }
  const ok = typeof want === 'function' ? want(got) : JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name.padEnd(52)} ${typeof got === 'object' ? JSON.stringify(got).slice(0,80) : got}`);
};

console.log('\nIMPORT the real queue');
await T('24 rows in, all new', async () => { const r = await importQueue(1); return `${r.inserted} inserted, ${r.updated} updated`; }, '24 inserted, 0 updated');
await T('re-import is idempotent',  async () => { const r = await importQueue(1); return `${r.inserted} inserted, ${r.updated} updated`; }, '0 inserted, 24 updated');
await T('may_state_figure survived', async () => (await sql`SELECT count(*)::int c FROM post_queue WHERE user_id=1 AND may_state_figure=false`)[0].c, 5);
await T('Q15 came in already drafted', async () => (await sql`SELECT status FROM post_queue WHERE queue_id='Q15'`)[0].status, 'drafted');

console.log('\nTHE HUMAN GATE — posted is never inferred');
await T('cannot post while retired_check=not_run', () => updateQueueState(1,'Q01',{status:'posted'}), (g:any)=>String(g).includes('retired-check has not been run'));
await T('cannot post when flagged', () => updateQueueState(1,'Q01',{status:'posted',retiredCheck:'flagged'}), (g:any)=>String(g).includes('flagged'));
await T('posts when the check is clean', async () => (await updateQueueState(1,'Q01',{status:'posted',retiredCheck:'clean'}))?.status, 'posted');
await T('posted_at was stamped by the app', async () => !!(await sql`SELECT posted_at FROM post_queue WHERE queue_id='Q01'`)[0].posted_at, true);

console.log('\nTHE OWNERSHIP RULE — an import must not undo a posted week');
await T('re-import keeps Q01 posted',   async () => { const r = await importQueue(1); return (await sql`SELECT status FROM post_queue WHERE queue_id='Q01'`)[0].status; }, 'posted');
await T('...and says it held the row',  async () => (await importQueue(1)).heldAtHigherState.some((s:string)=>s.startsWith('Q01')), true);
await T('posted_at survived the import',async () => !!(await sql`SELECT posted_at FROM post_queue WHERE queue_id='Q01'`)[0].posted_at, true);
await T('app-owned slot survives too',  async () => { await updateQueueState(1,'Q02',{slot:'mon',scheduledFor:'2026-08-17'}); await importQueue(1); return (await sql`SELECT slot FROM post_queue WHERE queue_id='Q02'`)[0].slot; }, 'mon');

console.log('\nMALFORMED INPUT — refuse everything, name every problem');
await T('missing may_state_figure is an error', () => validateQueue([{queue_id:'Q99',angle:'x'}]).length, 1);
await T('...and the message says why', () => validateQueue([{queue_id:'Q99',angle:'x'}])[0].includes('may_state_figure must be true or false'), true);
await T('duplicate id caught', () => validateQueue([{queue_id:'Q1',angle:'a',may_state_figure:true},{queue_id:'Q1',angle:'b',may_state_figure:true}]).some(p=>p.includes('duplicate')), true);
await T('a clean queue has no problems', async () => validateQueue(await readQueueFile()).length, 0);

console.log('\nCAMPAIGNS — named files, newest first, one id one campaign (pure: no DB)');
/* 2026-08-18: the plan was remade the same day the first campaign shipped, and
   the app was still showing the calendar it retired. The importer now resolves
   a NAMED file (newest by default), carries the calendar's own week labels,
   and its `supersedes`/`queue_bookkeeping` blocks are what the press applies.
   These cases pin the shape a campaign file must have to be importable and the
   ordering that decides what "Import campaign" loads with no argument. */
const camps = await listCampaigns();
await T('the newest campaign is first', () => camps[0]?.name, '2026-08-21');
await T('…and it supersedes the Aug 18 file', () => camps[0]?.supersedes, '2026-08-18');
await T('…carries its own week labels (W1…W4)', () => Object.keys(camps[0]?.weeks ?? {}).join(','), 'W1,W2,W3,W4');
await T('…knows its window from the schedule map', () => `${camps[0]?.first} → ${camps[0]?.last}`, '2026-08-21 → 2026-09-19');
await T('…and its 30 slots', () => camps[0]?.rows, 30);
await T('the Aug 18 file is still listed (history, not deleted)', () => camps.some(c => c.name === '2026-08-18' && c.rows === 14), true);
await T('the Aug 17 file is still listed (history, not deleted)', () => camps.some(c => c.name === '2026-08-17' && c.rows === 20), true);
await T('every shipped campaign validates', async () => {
  const { readFile } = await import('node:fs/promises');
  const bad: string[] = [];
  for (const c of camps) { const j = JSON.parse(await readFile(c.file, 'utf8')); if (validateQueue(j.rows).length) bad.push(c.name); }
  return bad;
}, []);
await T('a queue_id belongs to exactly one campaign across the shipped files', async () => {
  const { readFile } = await import('node:fs/promises');
  const owner = new Map<string, string>(); const dup: string[] = [];
  for (const c of camps) { const j = JSON.parse(await readFile(c.file, 'utf8')); for (const r of j.rows) { if (owner.has(r.queue_id) && owner.get(r.queue_id) !== c.name) dup.push(r.queue_id); owner.set(r.queue_id, c.name); } }
  return dup;
}, []);
await T('the superseded file is refused by name (would un-park its rows via the floor)', async () => { const { importCampaign } = await import('../postQueue.js'); try { await importCampaign(1, '2026-08-17'); return 'imported'; } catch (e: any) { return /superseded by 2026-08-18/.test(e.message) ? 'refused, names successor' : `THREW: ${e.message.slice(0,60)}`; } }, 'refused, names successor');
/* The chain is two deep now, and the refusal must follow the file that
   supersedes THIS one — not "the newest". 2026-08-18 is refused by 2026-08-21,
   2026-08-17 by 2026-08-18. Naming the wrong successor would send Paul to load
   a calendar that does not carry the rows he is looking at. */
await T('…and the refusal follows the chain, not the newest file', async () => { const { importCampaign } = await import('../postQueue.js'); try { await importCampaign(1, '2026-08-18', soloDir); return 'imported'; } catch (e: any) { return /superseded by 2026-08-21/.test(e.message) ? 'refused, names successor' : `THREW: ${e.message.slice(0,60)}`; } }, 'refused, names successor');
await T('an unknown campaign name is refused and the available ones named', async () => { const { importCampaign } = await import('../postQueue.js'); try { await importCampaign(1, '2099-01-01'); return 'imported'; } catch (e: any) { return /Available: 2026-08-21, 2026-08-18, 2026-08-17/.test(e.message); } }, true);
await T('campaignMeta tolerates a malformed file (0 rows, no dates)', () => { const m = campaignMeta('2099-01-01', 'x.json', null); return `${m.rows} ${m.first} ${Object.keys(m.weeks).length}`; }, '0 null 0');
await T('campaignMeta ignores non-string week labels', () => Object.keys(campaignMeta('2099-01-01', 'x.json', { weeks: { W1: 'ok', W2: 7 } }).weeks).join(','), 'W1');

console.log('\nTHE COPY RIDES WITH THE ROW (migration 136) — content, overwritten on import, never state');
/* 2026-08-18: campaign-export.mjs lifts each slot's copy out of
   CAMPAIGN_<date>.md into the JSON; the import carries it. These pin that the
   copy lands, that a document slot's PDF pointer only exists where the file
   ships, that the receipt-gated slot carries both the frame and the understudy,
   and that a re-import overwrites copy without touching state. */
/* The 2026-08-18 calendar is superseded now, so importCampaign refuses it by
   name from the shipped directory — correctly, and that refusal has its own
   case above. Its COPY behaviour still has to be pinned, and so does the DRAFT
   behaviour further down, so both run it out of a scratch directory holding
   only that file: no successor, nothing else changed. The alternative —
   asserting copy through whichever calendar happens to be newest — would have
   quietly stopped testing the document, deck-caption and understudy paths the
   moment a calendar without them shipped, which is exactly what shipped. */
const { mkdtemp, copyFile } = await import('node:fs/promises');
const { tmpdir } = await import('node:os');
const pathMod = await import('node:path');
const soloDir = await mkdtemp(pathMod.join(tmpdir(), 'pq-0818-'));
await copyFile('content/studio/campaign-2026-08-18.json', pathMod.join(soloDir, 'campaign-2026-08-18.json'));

await T('meta counts the rows with copy and the PDFs that ship', async () => { const [m] = await listCampaigns(soloDir); return `${m?.withCopy} ${m?.documentsReady}`; }, '8 3');
await T('importing the campaign lands the copy', async () => { const { importCampaign } = await import('../postQueue.js'); await importCampaign(1, '2026-08-18', soloDir); return (await sql`SELECT left(body, 30) b, kind, title FROM post_queue WHERE user_id=1 AND queue_id='P-1'`)[0]; }, { b: 'A sub-$10M EBITDA company trad', kind: 'text', title: 'The multiple nobody publishes' });
await T('a document slot carries its caption, its pages, and a PDF the build actually ships', async () => { const r = (await sql`SELECT kind, body IS NOT NULL AS has_body, jsonb_array_length(pages) np, document->>'pdf' pdf, (document->>'pages')::int dp FROM post_queue WHERE user_id=1 AND queue_id='P-2'`)[0]; return `${r.kind} ${r.has_body} ${r.np} ${r.pdf} ${r.dp}`; }, 'document true 10 /collateral/dead-deal-economics/2026-08-20/dead-deal-economics.pdf 10');
await T('where the deck caption differs from the plan, BOTH are carried and the difference is named', async () => { const r = (await sql`SELECT body_deck IS NOT NULL AS deck, copy_note FROM post_queue WHERE user_id=1 AND queue_id='P-5'`)[0]; return `${r.deck} ${/argues differently/.test(r.copy_note ?? '')}`; }, 'true true');
await T('the receipt-gated slot carries the frame, the gate, and the understudy', async () => { const r = (await sql`SELECT gate IS NOT NULL AS g, body ~ '\\[TRADE\\]' AS brackets, body_alt IS NOT NULL AS alt FROM post_queue WHERE user_id=1 AND queue_id='P-8'`)[0]; return `${r.g} ${r.brackets} ${r.alt}`; }, 'true true true');
await T('a Mandate edition carries no copy (the Sunday run builds it)', async () => (await sql`SELECT body, kind FROM post_queue WHERE user_id=1 AND queue_id='M-2'`)[0], { body: null, kind: null });
await T('a re-import overwrites the copy and leaves state alone', async () => {
  const { importCampaign } = await import('../postQueue.js');
  await sql`UPDATE post_queue SET body='stale', notes='mine' WHERE user_id=1 AND queue_id='P-1'`;
  await importCampaign(1, '2026-08-18', soloDir);
  const r = (await sql`SELECT left(body, 10) b, notes FROM post_queue WHERE user_id=1 AND queue_id='P-1'`)[0];
  return `${r.b}|${r.notes}`;
}, 'A sub-$10M|mine');

console.log('\nTHE DRAFT (migration 138) — decide in the app, render in Cowork');
/* 2026-08-19: Paul chooses a template and edits copy in the app; Cowork renders
   from it. These pin the three things a review said could go wrong: the SQL
   shape (CASE WHEN $bool THEN col ELSE $jsonb END — "could not determine data
   type" would 400 every save), the anchor (an edit remembers the plan text it
   edited, so a later plan revision reads as SUPERSEDED and never resurrects a
   consumed edit as the Copy default), and the importer's silence (a re-import
   must not touch a decision). */
const { updateQueueDraft, listQueueDrafts } = await import('../postQueue.js');
const { copyDraftState } = await import('../../../shared/draft.js');
await T('a template the register knows is stored; an unknown one is refused', async () => {
  await updateQueueDraft(1, 'P-2', { template: 'figure-deck-dark' });
  let refused = 'no';
  try { await updateQueueDraft(1, 'P-2', { template: 'not-a-template' }); } catch { refused = 'yes'; }
  return `${(await sql`SELECT template FROM post_queue WHERE user_id=1 AND queue_id='P-2'`)[0].template} ${refused}`;
}, 'figure-deck-dark yes');
await T('a text-slot template is refused on a document slot', async () => { try { await updateQueueDraft(1, 'P-2', { template: 'figure-card' }); return 'accepted'; } catch (e: any) { return /renders a text slot/.test(e.message) ? 'refused' : e.message; } }, 'refused');
await T('an undefined field is left alone; null clears', async () => {
  await updateQueueDraft(1, 'P-2', { copyEdit: 'X caption' });
  const a = (await sql`SELECT template, copy_edit FROM post_queue WHERE user_id=1 AND queue_id='P-2'`)[0];
  await updateQueueDraft(1, 'P-2', { template: null });
  const b = (await sql`SELECT template, copy_edit FROM post_queue WHERE user_id=1 AND queue_id='P-2'`)[0];
  return `${a.template}/${a.copy_edit} → ${b.template}/${b.copy_edit}`;
}, 'figure-deck-dark/X caption → null/X caption');
await T('pages_edit round-trips through the CASE as jsonb (the shape a review feared would 400)', async () => {
  const row = await updateQueueDraft(1, 'P-2', { pagesEdit: [{ n: 1, label: 'Cover', text: 'edited page one', note: null }] });
  return `${Array.isArray(row.pages_edit)} ${row.pages_edit[0].text}`;
}, 'true edited page one');
await T('an edit equal to the plan (end whitespace aside) is stored as NULL, not as an edit', async () => {
  const plan = (await sql`SELECT body FROM post_queue WHERE user_id=1 AND queue_id='P-1'`)[0].body;
  const row = await updateQueueDraft(1, 'P-1', { copyEdit: plan + '\n  ' });
  return row.copy_edit;
}, null);
await T('the edit remembers the plan it edited (copy_base), and reads LIVE while the plan stands', async () => {
  const plan = (await sql`SELECT body FROM post_queue WHERE user_id=1 AND queue_id='P-1'`)[0].body;
  const row = await updateQueueDraft(1, 'P-1', { copyEdit: 'my caption' });
  return `${row.copy_base === plan} ${copyDraftState(row)}`;
}, 'true live');
await T('a re-import does not touch the decision', async () => {
  const { importCampaign } = await import('../postQueue.js');
  await importCampaign(1, '2026-08-18', soloDir);
  const r = (await sql`SELECT template, copy_edit FROM post_queue WHERE user_id=1 AND queue_id='P-1'`)[0];
  return `${r.copy_edit}`;
}, 'my caption');
await T('the plan catching up reads SATISFIED; the plan moving PAST the edit reads SUPERSEDED — never live again', async () => {
  await sql`UPDATE post_queue SET body='my caption' WHERE user_id=1 AND queue_id='P-1'`;
  const sat = copyDraftState((await sql`SELECT copy_edit, body, copy_base FROM post_queue WHERE user_id=1 AND queue_id='P-1'`)[0]);
  await sql`UPDATE post_queue SET body='a later revision Y' WHERE user_id=1 AND queue_id='P-1'`;
  const sup = copyDraftState((await sql`SELECT copy_edit, body, copy_base FROM post_queue WHERE user_id=1 AND queue_id='P-1'`)[0]);
  return `${sat} ${sup}`;
}, 'satisfied superseded');
await T('GET /drafts lists the slot with the template resolved to its renderer + hint and the copy state', async () => {
  await updateQueueDraft(1, 'P-2', { template: 'figure-deck-dark' });   // P-2: template + the live 'X caption' edit (its plan has not moved)
  const ds = await listQueueDrafts(1);
  const d = ds.find((x: any) => x.queue_id === 'P-2');
  return `${d?.template?.renderer} ${d?.template?.status} ${d?.copy?.state} ${typeof d?.template?.hint}`;
}, 'figure-deck.py live live string');
await T('clean-up: revert leaves no decision on the rows', async () => {
  await updateQueueDraft(1, 'P-1', { template: null, copyEdit: null, pagesEdit: null });
  await updateQueueDraft(1, 'P-2', { template: null, copyEdit: null, pagesEdit: null });
  return (await listQueueDrafts(1)).filter((d: any) => ['P-1', 'P-2'].includes(d.queue_id)).length;
}, 0);

console.log('\nTHE PLAN ARRIVES BEFORE THE DRAFT (migration 139) — briefs, mediums, and the supersede press');
/* 2026-08-20: the 30-day "How I" hook sequence resets the calendar from Aug 21.
   It is a plan, not a draft — thirty slots carry a hook, a rehook and beats,
   and the copy is written later by the Sunday staging run. These pin that a
   brief is carried as a brief (not as an empty body), that the MEDIUM survives
   the trip (a video day needs a camera and a row reading "Text" hides that),
   and that landing the new calendar parks the old one WITHOUT touching the two
   posts the plan records as already shipped. */
await T('the new calendar is all brief and no copy, and the meta says so', () => `${camps[0]?.withCopy} ${camps[0]?.withBrief}`, '0 30');
await T('landing it imports thirty slots and dates every one', async () => { const { importCampaign } = await import('../postQueue.js'); const r = await importCampaign(1, '2026-08-21'); return `${r.inserted + r.updated} ${r.scheduled}`; }, '30 30');
await T('a brief rides in whole — hook, rehook, beats', async () => { const [r] = await sql`SELECT brief FROM post_queue WHERE user_id=1 AND queue_id='D-01'`; const b = normalizeQueueRow(r).brief as any; return `${/47% of broken/.test(b.hook)} ${/underwrite one question/.test(b.rehook)} ${b.beats.length}`; }, 'true true 3');
/* THE DOUBLE-ENCODE, one column later. `beats` is the field the screen
   iterates, so it is the one that throws as `c.map is not a function` if the
   value round-trips as a JSON string. Assert the ARRAY, from the same read path
   the API uses — a `SELECT brief->>'hook'` would pass either way. */
await T('…as a real array, not a JSON string (the #446 failure, one column later)', async () => { const [r] = await sql`SELECT brief FROM post_queue WHERE user_id=1 AND queue_id='D-01'`; return Array.isArray((normalizeQueueRow(r).brief as any)?.beats); }, true);
await T('…with no body, because the draft does not exist yet', async () => (await sql`SELECT body, body_alt FROM post_queue WHERE user_id=1 AND queue_id='D-01'`)[0], { body: null, body_alt: null });
await T('the MEDIUM survives — eight video days, eleven image days, four Mandates with no kind at all', async () => { const r = await sql<{ kind: string | null; c: number }[]>`SELECT kind, count(*)::int c FROM post_queue WHERE user_id=1 AND campaign='2026-08-21' GROUP BY kind ORDER BY kind`; return r.map(x => `${x.kind ?? 'null'}:${x.c}`).join(' '); }, 'image:11 text:7 video:8 null:4');
await T('a Mandate edition keeps a NULL kind and still carries its brief', async () => (await sql`SELECT kind, brief IS NOT NULL AS b FROM post_queue WHERE user_id=1 AND queue_id='D-06'`)[0], { kind: null, b: true });
/* THE ONE THAT MATTERS: the plan re-carried a figure this practice had already
   retired (R-HS-017, "PE add-ons up 88%" — contradicted by Capstone's own count
   of 38 add-ons against 36). It is blocked in the markdown and the block rides
   in as the slot's gate, so the screen cannot present it as ready. */
await T('the blocked figure arrives as a gate, not as ready copy', async () => { const r = (await sql`SELECT gate, body FROM post_queue WHERE user_id=1 AND queue_id='D-11'`)[0]; return `${/R-HS-017/.test(r.gate ?? '')} ${r.body === null}`; }, 'true true');
await T('a receipt-gated slot carries its gate and its extraction prompt', async () => { const r = (await sql`SELECT gate, brief->>'extraction' x FROM post_queue WHERE user_id=1 AND queue_id='D-08'`)[0]; return `${/RECEIPT-GATED/.test(r.gate ?? '')} ${/Extraction prompt/.test(r.x ?? '')}`; }, 'true true');
await T('the superseded calendar was parked by the press', async () => (await sql<{ c: number }[]>`SELECT count(*)::int c FROM post_queue WHERE user_id=1 AND campaign='2026-08-18' AND status='parked'`)[0].c, 12);
/* P-1 and P-2 shipped under the old calendar and the plan says they STAND, so
   they are deliberately absent from `supersedes.rows`. A press that parked them
   would erase the record that the window opened with two posts already out. */
await T('…but the two posts that shipped were left alone', async () => (await sql<{ queue_id: string; status: string }[]>`SELECT queue_id, status FROM post_queue WHERE user_id=1 AND queue_id IN ('P-1','P-2') ORDER BY queue_id`).map(r => `${r.queue_id}:${r.status}`).join(' '), 'P-1:drafted P-2:next');
await T('pressing it twice parks nothing more and moves no date', async () => { const { importCampaign } = await import('../postQueue.js'); const r = await importCampaign(1, '2026-08-21'); return `${r.inserted} ${r.scheduled} ${r.parkedSuperseded}`; }, '0 0 0');

console.log('\nTHE DB CONSTRAINT — posted with no timestamp is impossible');
await T('CHECK blocks a raw posted row', async () => { try { await sql`UPDATE post_queue SET status='posted', posted_at=NULL WHERE queue_id='Q03'`; return 'allowed'; } catch { return 'blocked'; } }, 'blocked');

console.log(`\n${pass}/${total} passed`);
await sql.end();
process.exit(pass === total ? 0 : 1);
