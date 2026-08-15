/**
 * The prompt-cache seam — behaviour suite.
 *
 * Run: npm run test:prompt-cache
 *
 * Why this file exists: caching is a PREFIX match, and every way of getting it
 * wrong is silent. Cache something that varies per request and you write a new
 * entry every time at 1.25× and never read one — strictly more expensive than
 * not caching, with no error and no log line. Split one byte early and the
 * marker ships to the model inside the prompt. Neither shows up in a diff and
 * neither throws.
 *
 * So the cases below are about the failure modes, not the happy path:
 *   • the marker must NEVER survive into a block sent to the model;
 *   • the cached half must be the FROZEN half, and nothing below it;
 *   • a prompt with no marker must go out UNCACHED rather than guess a split;
 *   • the breakpoint count must stay inside the API's limit of four;
 *   • and the whole thing must degrade to something valid on odd input, since
 *     a 400 on the main chat path is worse than a missed saving.
 */
import { readFileSync } from 'node:fs';
import { CACHE_SPLIT, splitCachedSystem, withToolCache, countBreakpoints } from '../promptCache.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

const FROZEN = 'MASTER PROMPT. Doctrine. Tax rules.';
const VOLATILE = '## CURRENT DEAL (ID: 42)\nBruno Air, $400k EBITDA.';
const BUILT = `${FROZEN}\n\n${CACHE_SPLIT}\n\n${VOLATILE}`;

/* ── the split ────────────────────────────────────────────────────────── */

const blocks = splitCachedSystem(BUILT);
is('splits into exactly two blocks', blocks.length, 2);
is('the FROZEN half is first', blocks[0].text, FROZEN);
is('…and it is the one marked cacheable', blocks[0].cache_control, { type: 'ephemeral' });
is('the volatile half follows', blocks[1].text, VOLATILE);
is('…and it is NOT cached', blocks[1].cache_control, undefined);

/* The loudest failure this suite exists to prevent. */
ok('the marker never survives into any block',
  blocks.every(b => !b.text.includes(CACHE_SPLIT)));

/* Content must be preserved exactly — a caching change must not silently
   edit the prompt. Whitespace around the marker is the only thing dropped. */
is('nothing is lost but the marker and its padding',
  blocks.map(b => b.text).join('\n\n'), `${FROZEN}\n\n${VOLATILE}`);

/* ── prompts that were never built for caching ────────────────────────── */

/* WRONG-FIRST. The tempting behaviour is to cache the whole thing when no
   marker is found — it looks like free savings. It is the opposite: the
   anonymous and intake prompts vary per visitor, so every request would write
   a fresh entry at 1.25× and read none. Uncached is the correct answer. */
const plain = splitCachedSystem('You are the intake engine for visitor 8213.');
is('no marker → a single block', plain.length, 1);
is('…and it is NOT cached', plain[0].cache_control, undefined);
is('…with the text untouched', plain[0].text, 'You are the intake engine for visitor 8213.');

/* ── degenerate input must stay VALID, not just safe ──────────────────── */

/* A zero-length text block is a 400 from the API, so a marker at position
   zero must not produce one. On the main chat path a 400 is worse than a
   missed saving. */
const leading = splitCachedSystem(`${CACHE_SPLIT}\n\nonly volatile`);
ok('a leading marker produces no empty block', leading.every(b => b.text.length > 0));
ok('…and caches nothing, because there is no frozen half',
  leading.every(b => !b.cache_control));
ok('…and still drops the marker', leading.every(b => !b.text.includes(CACHE_SPLIT)));

const trailing = splitCachedSystem(`${FROZEN}\n\n${CACHE_SPLIT}`);
is('a trailing marker yields just the frozen block', trailing.length, 1);
is('…which is cached', trailing[0].cache_control, { type: 'ephemeral' });
ok('…with no empty second block', trailing[0].text.length > 0);

is('an empty prompt stays a single block', splitCachedSystem('').length, 1);

/* ── tools ────────────────────────────────────────────────────────────── */

const TOOLS = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
const cached = withToolCache(TOOLS);
is('every tool survives', cached.map(t => t.name), ['a', 'b', 'c']);
is('exactly one breakpoint', cached.filter((t: any) => t.cache_control).length, 1);
ok('…on the LAST tool, since the prefix runs to the end of the array',
  !!(cached[cached.length - 1] as any).cache_control);

/* The shared array is read by other call sites; caching must not reach them. */
ok('the source array is not mutated', TOOLS.every((t: any) => !t.cache_control));
is('an empty tool list is handled', withToolCache([]).length, 0);

/* ── the API's limit of four ──────────────────────────────────────────── */

is('a real request carries two breakpoints, well inside the cap of 4',
  countBreakpoints({ system: blocks, tools: cached }), 2);
ok('…and two is under the limit', countBreakpoints({ system: blocks, tools: cached }) <= 4);
is('counting copes with absent parts', countBreakpoints({}), 0);

/* ── the wiring, which unit logic cannot see ──────────────────────────── */

/* The split only helps if the marker is actually emitted, and it only stays
   SAFE if every consumer of a built prompt splits before sending. Both are
   properties of other files, so they are checked as source rather than
   behaviour — `promptBuilder` imports Postgres and cannot be loaded here.

   The second assertion is the load-bearing one: today `buildSystemPrompt` has
   exactly one caller and it splits. A future path that sends the built prompt
   straight to the API would ship `<<<SMBX_PROMPT_CACHE_BREAKPOINT>>>` to the
   model inside the system prompt — visible in the output only if someone was
   reading closely. */
const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

const builder = read('../promptBuilder.ts');
is('promptBuilder emits the marker exactly once',
  (builder.match(/layers\.push\(CACHE_SPLIT\)/g) ?? []).length, 1);
ok('…and takes it from the shared module rather than redefining it',
  builder.includes("from './promptCache.js'"));

const ai = read('../aiService.ts');
ok('the agentic loop splits before sending', ai.includes('splitCachedSystem(ctx.systemPrompt)'));
ok('…and sends the cache-marked tools', ai.includes('tools: CACHED_TOOLS'));
ok('…and never passes the raw prompt as `system`',
  !/system:\s*ctx\.systemPrompt\b/.test(ai));

const chat = read('../../routes/chat.ts');
const callers = (chat.match(/buildSystemPrompt\(/g) ?? []).length;
is('chat.ts builds the prompt once', callers, 1);
ok('…and hands it to the loop that splits, not to the API directly',
  /streamAgenticResponse\(\s*\n?\s*\{[^}]*systemPrompt/.test(chat));

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
