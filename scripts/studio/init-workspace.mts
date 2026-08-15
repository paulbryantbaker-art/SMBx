/**
 * Set up a LOCAL studio workspace on your computer (Paul, 2026-07-22: "move
 * from App to my computer… folders for media, assets and collateral").
 *
 * Creates, in the target dir (default: current folder):
 *   media/       ← per-slot artwork you make (Gemini exports, photos)
 *   assets/      ← your recurring images (headshots, brand shots you keep local)
 *   collateral/  ← rendered outputs land here (the app's "Collateral", on disk)
 *   decks/       ← your deck specs live here (starter example copied in)
 *   posting-plan.md ← your local plan (starter copied from the repo)
 *
 * Then build any slot with:
 *   cd <this workspace>
 *   npx tsx <repo>/scripts/studio/build-deck.mts decks/<name>.deck.mts
 * (build-deck defaults to ./media + ./assets for images and ./collateral for
 *  output — no flags needed from inside the workspace.)
 *
 * Usage: npx tsx scripts/studio/init-workspace.mts [targetDir]
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const args = process.argv.slice(2).filter(a => a !== '--update');
const target = path.resolve(args[0] || '.');

/* --update refreshes the LAW FILES.
 *
 * Everything else here is create-if-missing, which is right for your work — a
 * re-run must never eat a plan or a market. But CLAUDE.md, PLAYBOOK.md,
 * FORMATS.md and DESIGN.md are not your work, they are the repo's rules
 * travelling with the workspace, and create-if-missing quietly strands them at
 * whatever version you first ran. That is how a fix ships and never arrives:
 * FORMATS.md lands because it is new, CLAUDE.md keeps the old text that never
 * mentions it, and a session is never told to read the thing that was just
 * written for it.
 *
 * So: `init-workspace.mts . --update` overwrites those four, keeping a .bak of
 * anything that actually differed so nothing is lost silently.
 */
const UPDATE = process.argv.includes('--update');
const refreshed: string[] = [], backedUp: string[] = [], stale: string[] = [];

/** Copy a law file: always if missing, on --update if changed (with a backup). */
function law(srcRel: string, dstName: string): void {
  const src = path.join(ROOT, srcRel), dst = path.join(target, dstName);
  if (!existsSync(src)) return;
  if (!existsSync(dst)) { copyFileSync(src, dst); refreshed.push(dstName); return; }
  if (readFileSync(src, 'utf8') === readFileSync(dst, 'utf8')) return;
  // It differs from the repo. Either refresh it, or say so — a silently stale
  // rule file is the failure this whole flag exists to prevent.
  if (!UPDATE) { stale.push(dstName); return; }
  copyFileSync(dst, dst + '.bak');
  copyFileSync(src, dst);
  refreshed.push(dstName); backedUp.push(dstName + '.bak');
}

/* Paul, 2026-07-26: "i want for all research artifacts and assets to live
   locally on my macbook. the collateral that is produced will be in a folder
   on my macbook. When we run analysis for a deals that analysis will live
   locally in Folders locally on my macbook."

   So the workspace covers all three now, not just collateral:
     markets/  the knowledge base per market — research in, master out
     deals/    per-deal documents and the analysis produced from them
     the rest  as before (media, assets, collateral, decks) */
const dirs = ['media', 'assets', 'collateral', 'decks', 'markets', 'deals', 'clients'];
for (const d of dirs) mkdirSync(path.join(target, d), { recursive: true });

/* A market is a folder. Seed one so the shape is obvious rather than described. */
const exampleMarket = path.join(target, 'markets/_example-market');
for (const sub of ['research', 'versions', 'documents', 'collateral']) {
  mkdirSync(path.join(exampleMarket, sub), { recursive: true });
}
const exampleDeal = path.join(target, 'deals/_example-deal');
for (const sub of ['documents', 'analysis']) {
  mkdirSync(path.join(exampleDeal, sub), { recursive: true });
}

// starter deck spec
const exampleSrc = path.join(ROOT, 'scripts/studio/decks/elevator-teardown-1.deck.mts');
const exampleDst = path.join(target, 'decks/example.deck.mts');
if (existsSync(exampleSrc) && !existsSync(exampleDst)) copyFileSync(exampleSrc, exampleDst);

// starter plan
const planSrc = path.join(ROOT, 'content/studio/posting-plan.md');
const planDst = path.join(target, 'posting-plan.md');
if (existsSync(planSrc) && !existsSync(planDst)) copyFileSync(planSrc, planDst);

/* THE LAW FILES — refreshed by --update, see `law()` above.

   CLAUDE.md   the operating instructions, named so a Claude Code session opened
               on this folder picks them up automatically: citation law, THE
               LINE, attribution — everything the server prompts used to carry.
   PLAYBOOK.md the corp-dev document specs (market map, who's who, target map,
               thesis), which used to live in server/services/corpDevDocs.ts.
   FORMATS.md  the collateral spec: which builder, the field grammar, the image
               slot dimensions, the imagery brief. Without it a session rebuilds
               the layout from memory and the output drifts — images cropped
               wrong because nobody knew the container was 476×1102, `image:`
               keys on page kinds that have no image slot, hand-rolled HTML
               approximating the house style.
   DESIGN.md   the house LOOK — palette, type, the layout grammar of the three
               formats, and the retired systems named with their hexes.
   RESEARCH.md the METHOD for building a market map: six passes, ~20 runs,
               several hours, spanning more than one session. PLAYBOOK.md says
               what the finished documents look like; this says how to gather
               what they need, and — because the job outlives a session — how to
               make it resumable (a frame file, one file per run, a coverage
               ledger, and a stop condition). Paul, 2026-07-31: "this needs to be
               a built out process that we can tell Cowork how to do."

   DESIGN.md is here because FORMATS.md was not enough on its own (Paul,
   2026-07-30: collateral "keeps wanting to reference design languages from last
   year"). FORMATS.md says what shape the container is; nothing that travelled
   said what the house looks like — CLAUDE.md and PLAYBOOK.md carry zero hexes
   and zero typefaces between them, and DESIGN_LANGUAGE.md lives at the repo
   root and never came along. So a session had the slot table and no visual
   system, and filled the gap from general familiarity with this repo — which
   contains seven retired palettes in committed CSS. The tell was always a warm
   accent where a green belongs. Naming the dead hexes is what lets a session
   catch itself. */
law('content/studio/workspace-CLAUDE.md', 'CLAUDE.md');
law('content/studio/PLAYBOOK.md', 'PLAYBOOK.md');
law('content/studio/FORMATS.md', 'FORMATS.md');
law('content/studio/DESIGN.md', 'DESIGN.md');
/* The state of the renderers, as opposed to the look. DESIGN.md says what the
   house looks like and FORMATS.md says what shape a container is; neither said
   which builders were actually converted, and for a week DESIGN.md claimed all
   four were when two were not. A session that trusts a law it cannot verify is
   exactly how the wrong palette ships. */
law('content/studio/COLLATERAL_STATE.md', 'COLLATERAL_STATE.md');
/* THE_LINE.md — added 2026-08-14, Paul: "Make sure that Cowork understands
   where the Lines are and what we need expert opinions on too. Tax, legal
   real estate, etc."

   The same defect DESIGN.md was created to fix, in the compliance layer rather
   than the visual one: `THE_LINE_POLICY.md` lives at the REPO root and was
   never in this list, so a session opened on the workspace could not read it —
   while CLAUDE.md cheerfully said "Full text in THE_LINE_POLICY.md in the
   repo." A pointer to a file that is not there is worse than no pointer,
   because it reads as though the law is available.

   It is not a copy of the policy. The policy states the perimeter and puts the
   whole specialist question in ONE clause — "securities, tax opinions, legal
   opinions, formal appraisal". THE_LINE.md carries the perimeter verbatim and
   then answers the question that clause leaves open: which QUESTION has crossed
   into which lane, who owns it, and what to hand them. Tax, legal, the five
   separate real-estate lanes, valuation, securities, trade licensing,
   employment, insurance and QoE. */
law('content/studio/THE_LINE.md', 'THE_LINE.md');
/* WHERE.md + where.json — added 2026-08-14. The settled answer to "which
   system does this", GENERATED from house/where.ts so the app and a session
   read the same table rather than two prose copies that agree today.

   It travels as a DOCUMENT because Cowork is Claude Desktop, not a terminal
   (Paul, same day): a session there reads files and cannot be relied on to run
   `npx tsx`. where.json is the same data machine-readable, for anything that
   wants to branch on it rather than read it. */
law('content/studio/WHERE.md', 'WHERE.md');
law('content/studio/where.json', 'where.json');
/* WHAT_LIVES_WHERE.md — the fourth law found dangling in this session's sweep
   (2026-08-14). It maps the two REPOSITORIES on the Mac and names the debris
   clones, which is exactly what a session needs when a command aims at the
   wrong checkout — and it had never been in this list, so it could not be
   read from the workspace it describes. Distinct from WHERE.md: that one
   routes PROCESSES between systems, this one routes PATHS between repos. The
   generated header on WHERE.md says so, because the two names collide. */
law('content/studio/WHAT_LIVES_WHERE.md', 'WHAT_LIVES_WHERE.md');
law('content/studio/RESEARCH.md', 'RESEARCH.md');
/* THE MACHINE (2026-08-12, Paul: "give Cowork the DL for the new element to
   be used in collateral"). MACHINE.md is the design language + content law;
   machine.html is the runnable element itself — a self-contained animated
   diagram a session copies beside a piece, edits the SPEC of, and Paul
   screen-records for video slideshows. The HTML travels like engagements.mjs:
   a tool, not a law, but it has to BE here or a session can't use it. */
law('content/studio/MACHINE.md', 'MACHINE.md');
law('scripts/studio/machine.html', 'machine.html');
/* The standing job for the Saturday agent (2026-08-10). It travels with the
   workspace for the same reason the other laws do: a scheduled session opens
   on this folder with nothing but what is in it, so the prompt has to be here
   rather than in the repo or in whoever set the schedule up. */
law('content/studio/WEEKLY.md', 'WEEKLY.md');

/* engagements.mjs is a TOOL, not a law, but it travels the same way and for the
   same reason (Paul, 2026-07-29: "I don't want to have to keep downloading main
   and reimporting it so that Cowork can use it"). It lands IN the workspace as
   plain JavaScript on node built-ins — no npm install, no tsx, no network — so
   a session opened on this folder can run it immediately and never needs the
   repo again. `--update` refreshes it in place, keeping a .bak. */
law('content/studio/engagements.mjs', 'engagements.mjs');

/* sync.mjs travels for the same reason and closes the loop the weekly agent
   opens (Paul, 2026-08-10: "the only thing that I want to be sure that happens
   is that the Docs.MTS and the collateral all get updated on the Mac on disk").
   GIT IS A TRANSPORT, NOT A DESTINATION — a merged PR puts nothing on the Mac
   until something pulls it, and until then every builder here renders from a
   stale master, silently. `node sync.mjs --install` prints the launchd job that
   makes it automatic. */
law('content/studio/sync.mjs', 'sync.mjs');

/* The workspace is meant to live in git (that is how a master gets version
   history without a database), so the one file that must never go up needs to
   be excluded before anyone commits — a key put somewhere sensible should not
   become a key in a repository. */
const gitignore = path.join(target, '.gitignore');
if (!existsSync(gitignore)) {
  writeFileSync(gitignore, [
    '# Secrets — never commit these.',
    '.env',
    '.env.local',
    '',
    '# OS noise',
    '.DS_Store',
    '',
  ].join('\n'));
}

/* A .env stub so there is an obvious place for the key, with nothing in it. */
const envFile = path.join(target, '.env');
if (!existsSync(envFile)) {
  writeFileSync(envFile, [
    '# Local keys for the studio tools. Gitignored — keep it that way.',
    '#',
    '# The Places key drives scripts/studio/screen.mts (target screening).',
    '# It is a DIFFERENT key from any Anthropic one: text search is free and',
    '# Place Details carries its own monthly free allowance.',
    '# Get one at https://console.cloud.google.com/ → APIs & Services →',
    '# Credentials, with the Places API (New) enabled.',
    '',
    '# GOOGLE_PLACES_API_KEY=',
    '',
  ].join('\n'));
}

// keep empty dirs in place + explain them
const notes: Record<string, string> = {
  media: 'Drop per-slot artwork here (Gemini exports, photos). The builder reads this + assets/ for cover/page images.',
  assets: 'Your recurring images — headshots, brand shots you keep on disk. Also searched for spec images.',
  collateral: 'Rendered decks land here: <slug>.pdf (post this), <slug>-caption.txt (paste this), <slug>-pNN.jpg (page previews).',
  decks: 'Your deck specs. Copy example.deck.mts, change the copy, point cover.image at a file in ../media, then build.',
  markets: 'One folder per market you keep a knowledge base for. Copy _example-market/ and rename it. Research goes in research/; the synthesized master is master.md.',
  deals: 'One folder per deal. Copy _example-deal/ and rename it. What the seller sent goes in documents/; what we produce goes in analysis/.',
  clients: 'One folder per client, one folder per engagement inside it — clients/<client>/<engagement>/engagement.md holds the stage, what we owe them, and the log. `node engagements.mjs list` is the board.',
};
writeFileSync(path.join(exampleMarket, 'README.txt'),
  ['A MARKET — everything you know about one lane.', '',
   'IF research/ IS EMPTY, START AT ../../RESEARCH.md. Gathering a market is six',
   'passes and roughly twenty runs across several hours — its own job, with its own',
   'procedure. A market map written from an empty research/ is not a thin map, it',
   'is an invented one.', '',
   'research/    the reads you gathered, however you gathered them (PDF, .md, pasted text)',
   'master.md    the one synthesized document, built from all of research/',
   'versions/    master-v1.md, master-v2.md … keep the history',
   'documents/   what you derive from the master: market-map.md, whos-who.md,',
   '             target-map.md, and one thesis per buyer profile',
   '             (thesis-family-office.md, thesis-independent-sponsor.md …)',
   'screen/      the target board — buy-box, the consolidator register, and',
   '             candidates.csv (open it in Google Sheets)',
   'collateral/  rendered output for this market',
   '',
   'Check any document against its research before it goes anywhere:',
   '  npx tsx <repo>/scripts/studio/audit.mts master.md',
   '',
   'A thesis is a position held for a particular buyer, and it ages as the',
   'master moves. Scaffold and track them from the workspace root:',
   '  npx tsx <repo>/scripts/studio/thesis.mts new <market> <buyer profile>',
   '  npx tsx <repo>/scripts/studio/thesis.mts check      (which ones went stale)',
   '',
   'Build the target board — a Places pull, tagged against who already owns what:',
   '  npx tsx <repo>/scripts/studio/screen.mts init <market>',
   '  npx tsx <repo>/scripts/studio/screen.mts pull <market>   (needs GOOGLE_PLACES_API_KEY)',
   '  npx tsx <repo>/scripts/studio/screen.mts rank <market>   (free, offline)',
   ''].join('\n'));
writeFileSync(path.join(exampleDeal, 'README.txt'),
  ['A DEAL — one transaction.', '',
   'documents/   what the seller sent (financials, CIM, contracts)',
   'analysis/    what we produced (QofE read, model output, memos)',
   'notes.md     the running record',
   '',
   'MODEL WITH THE CLI, never by hand — house/deal.ts is the same arithmetic',
   'the app runs, and a test fails if the two ever disagree. Working a return',
   'out in a scratch file is how a second answer gets born.',
   '',
   '  npx tsx <repo>/scripts/studio/deal.mts new <engagement> "<target>"',
   '  npx tsx <repo>/scripts/studio/deal.mts run analysis/<target>.deal.mts',
   '  npx tsx <repo>/scripts/studio/deal.mts list',
   '',
   'The .deal.mts spec is the artifact you maintain; <target>-model.md is',
   'output and the next run overwrites it. Money in CENTS, rates as DECIMALS.',
   '',
   'Document specs — model, memo, diligence plan, term framework — are in',
   'PLAYBOOK.md section 5. Deal documents render to decks/, never collateral/:',
   'collateral is publishable anywhere, and these name a live target.',
   '',
   'THE LINE applies: buy-side only, no unlicensed opinions — coordinate the',
   'specialist instead. Tax goes to the CPA (deal.mts carries no tax surface',
   'on purpose); clause language goes to counsel. See THE_LINE_POLICY.md.',
   ''].join('\n'));
for (const [d, note] of Object.entries(notes)) {
  const keep = path.join(target, d, 'README.txt');
  if (!existsSync(keep)) writeFileSync(keep, note + '\n');
}

writeFileSync(path.join(target, 'README.md'), [
  '# smbX Studio — local workspace',
  '',
  'Everything runs on this computer. No SMBX app, no app API key.',
  '',
  '```',
  'media/        per-slot artwork (Gemini exports, photos)',
  'assets/       recurring images (headshots, brand shots)',
  'collateral/   rendered outputs — post the .pdf, paste the -caption.txt',
  'decks/        your deck specs (start from example.deck.mts)',
  'clients/      one folder per client — engagements, their stage, and the log',
  'markets/      one folder per market — research in, master out, documents derived',
  'deals/        one folder per deal — what they sent, what we produced',
  'posting-plan.md   what to build next',
  'THESES.md     every position we hold and what it rests on (generated)',
  '```',
  '',
  '## The rule files — read the right one first',
  '```',
  'CLAUDE.md     the laws + the four jobs. A session here loads this automatically.',
  'RESEARCH.md   HOW to gather a market: six passes, ~20 runs, several hours.',
  '              Start here when a market has no research/ yet.',
  'PLAYBOOK.md   WHAT each client document contains, section by section.',
  '              The spec, not the method — it assumes research/ is populated.',
  'FORMATS.md    collateral containers: which builder, which fields, slot sizes.',
  'DESIGN.md     the house look — palette, type, and the retired systems by hex.',
  'THE_LINE.md   the perimeter, and whose lane each question is in. Read it',
  '              before anything client-facing, and whenever a question turns',
  '              tax, legal, real estate, valuation, licensing or insurance.',
  '```',
  '',
  '## Research a market from scratch',
  '```',
  '# in a session opened on this folder:',
  '#   "Build the research for <trade> in <geography>. Read RESEARCH.md first."',
  '```',
  'It is resumable: read markets/<m>/research/_log.md and continue from the first',
  'row that is not `done`.',
  '',
  '## Build a deck',
  '```',
  'npx tsx <path-to-SMBx-repo>/scripts/studio/build-deck.mts decks/<name>.deck.mts',
  '```',
  'Reads images from ./media + ./assets, writes to ./collateral.',
  '',
  '## Track the theses',
  '```',
  'npx tsx <path-to-SMBx-repo>/scripts/studio/thesis.mts check',
  '```',
  'Tells you which positions rest on a master that has since moved.',
  '',
  'Full guide: STUDIO_COWORK.md in the SMBx repo; the laws and the document',
  'specs are in CLAUDE.md and PLAYBOOK.md right here.',
].join('\n'));

const builder = path.join(ROOT, 'scripts/studio/build-deck.mts');
console.log(`✓ studio workspace ready at ${target}`);
if (refreshed.length) console.log(`  rules: ${refreshed.join(', ')}${UPDATE ? ' — refreshed from the repo' : ''}`);
if (backedUp.length) console.log(`  previous versions kept as ${backedUp.join(', ')}`);
/* The stale warning prints LAST, below the build hint — a warning above six
   lines of routine output is a warning nobody reads. */
console.log(`  folders: ${dirs.map(d => d + '/').join('  ')}  + posting-plan.md`);
console.log(`  to build a deck:`);
console.log(`    cd ${target}`);
console.log(`    npx tsx ${builder} decks/example.deck.mts`);
console.log(`  → outputs land in ${path.join(target, 'collateral')}/`);
if (stale.length) {
  console.log(`\n  ! ${stale.join(', ')} differ${stale.length === 1 ? 's' : ''} from the repo — this workspace is running OLDER RULES.`);
  console.log(`    A session here will follow them, so a fix in the repo never arrives.`);
  console.log(`    Refresh (keeps the current one as .bak):`);
  console.log(`      npx tsx ${path.join(ROOT, 'scripts/studio/init-workspace.mts')} ${target} --update`);
}
process.exit(0);
