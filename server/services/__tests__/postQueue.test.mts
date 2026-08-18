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
const { importQueue, listQueue, updateQueueState, readQueueFile, validateQueue, listCampaigns, campaignMeta } =
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
await T('the newest campaign is first', () => camps[0]?.name, '2026-08-18');
await T('…and it supersedes the Aug 17 file', () => camps[0]?.supersedes, '2026-08-17');
await T('…carries its own week labels (W1…W5)', () => Object.keys(camps[0]?.weeks ?? {}).join(','), 'W1,W2,W3,W4,W5');
await T('…knows its window from the schedule map', () => `${camps[0]?.first} → ${camps[0]?.last}`, '2026-08-18 → 2026-09-16');
await T('…and its 14 slots', () => camps[0]?.rows, 14);
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
await T('an unknown campaign name is refused and the available ones named', async () => { const { importCampaign } = await import('../postQueue.js'); try { await importCampaign(1, '2099-01-01'); return 'imported'; } catch (e: any) { return /Available: 2026-08-18, 2026-08-17/.test(e.message); } }, true);
await T('campaignMeta tolerates a malformed file (0 rows, no dates)', () => { const m = campaignMeta('2099-01-01', 'x.json', null); return `${m.rows} ${m.first} ${Object.keys(m.weeks).length}`; }, '0 null 0');
await T('campaignMeta ignores non-string week labels', () => Object.keys(campaignMeta('2099-01-01', 'x.json', { weeks: { W1: 'ok', W2: 7 } }).weeks).join(','), 'W1');

console.log('\nTHE DB CONSTRAINT — posted with no timestamp is impossible');
await T('CHECK blocks a raw posted row', async () => { try { await sql`UPDATE post_queue SET status='posted', posted_at=NULL WHERE queue_id='Q03'`; return 'allowed'; } catch { return 'blocked'; } }, 'blocked');

console.log(`\n${pass}/${total} passed`);
await sql.end();
process.exit(pass === total ? 0 : 1);
