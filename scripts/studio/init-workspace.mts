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
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const target = path.resolve(process.argv[2] || '.');

/* Paul, 2026-07-26: "i want for all research artifacts and assets to live
   locally on my macbook. the collateral that is produced will be in a folder
   on my macbook. When we run analysis for a deals that analysis will live
   locally in Folders locally on my macbook."

   So the workspace covers all three now, not just collateral:
     markets/  the knowledge base per market — research in, master out
     deals/    per-deal documents and the analysis produced from them
     the rest  as before (media, assets, collateral, decks) */
const dirs = ['media', 'assets', 'collateral', 'decks', 'markets', 'deals'];
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

/* The operating instructions, as CLAUDE.md so a Claude Code session opened on
   this folder picks them up automatically. This is what carries the citation
   law, THE LINE and the attribution rules once the app is no longer enforcing
   them in server prompts. */
const claudeSrc = path.join(ROOT, 'content/studio/workspace-CLAUDE.md');
const claudeDst = path.join(target, 'CLAUDE.md');
if (existsSync(claudeSrc) && !existsSync(claudeDst)) copyFileSync(claudeSrc, claudeDst);

// keep empty dirs in place + explain them
const notes: Record<string, string> = {
  media: 'Drop per-slot artwork here (Gemini exports, photos). The builder reads this + assets/ for cover/page images.',
  assets: 'Your recurring images — headshots, brand shots you keep on disk. Also searched for spec images.',
  collateral: 'Rendered decks land here: <slug>.pdf (post this), <slug>-caption.txt (paste this), <slug>-pNN.jpg (page previews).',
  decks: 'Your deck specs. Copy example.deck.mts, change the copy, point cover.image at a file in ../media, then build.',
  markets: 'One folder per market you keep a knowledge base for. Copy _example-market/ and rename it. Research goes in research/; the synthesized master is master.md.',
  deals: 'One folder per deal. Copy _example-deal/ and rename it. What the seller sent goes in documents/; what we produce goes in analysis/.',
};
writeFileSync(path.join(exampleMarket, 'README.txt'),
  ['A MARKET — everything you know about one lane.', '',
   'research/    the reads you gathered, however you gathered them (PDF, .md, pasted text)',
   'master.md    the one synthesized document, built from all of research/',
   'versions/    master-v1.md, master-v2.md … keep the history',
   'documents/   what you derive from the master: market-map.md, whos-who.md, thesis.md',
   'collateral/  rendered output for this market',
   '',
   'Check any document against its research before it goes anywhere:',
   '  npx tsx <repo>/scripts/studio/audit.mts master.md',
   ''].join('\n'));
writeFileSync(path.join(exampleDeal, 'README.txt'),
  ['A DEAL — one transaction.', '',
   'documents/   what the seller sent (financials, CIM, contracts)',
   'analysis/    what we produced (QofE read, model output, memos)',
   'notes.md     the running record',
   '',
   'THE LINE applies: buy-side only, no unlicensed opinions — coordinate the',
   'specialist instead. See THE_LINE_POLICY.md in the repo.',
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
  'posting-plan.md   what to build next',
  '```',
  '',
  '## Build a deck',
  '```',
  'npx tsx <path-to-SMBx-repo>/scripts/studio/build-deck.mts decks/<name>.deck.mts',
  '```',
  'Reads images from ./media + ./assets, writes to ./collateral. Full guide:',
  'STUDIO_COWORK.md in the SMBx repo.',
].join('\n'));

const builder = path.join(ROOT, 'scripts/studio/build-deck.mts');
console.log(`✓ studio workspace ready at ${target}`);
console.log(`  folders: ${dirs.map(d => d + '/').join('  ')}  + posting-plan.md`);
console.log(`  to build a deck:`);
console.log(`    cd ${target}`);
console.log(`    npx tsx ${builder} decks/example.deck.mts`);
console.log(`  → outputs land in ${path.join(target, 'collateral')}/`);
process.exit(0);
