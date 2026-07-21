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

const dirs = ['media', 'assets', 'collateral', 'decks'];
for (const d of dirs) mkdirSync(path.join(target, d), { recursive: true });

// starter deck spec
const exampleSrc = path.join(ROOT, 'scripts/studio/decks/elevator-teardown-1.deck.mts');
const exampleDst = path.join(target, 'decks/example.deck.mts');
if (existsSync(exampleSrc) && !existsSync(exampleDst)) copyFileSync(exampleSrc, exampleDst);

// starter plan
const planSrc = path.join(ROOT, 'content/studio/posting-plan.md');
const planDst = path.join(target, 'posting-plan.md');
if (existsSync(planSrc) && !existsSync(planDst)) copyFileSync(planSrc, planDst);

// keep empty dirs in place + explain them
const notes: Record<string, string> = {
  media: 'Drop per-slot artwork here (Gemini exports, photos). The builder reads this + assets/ for cover/page images.',
  assets: 'Your recurring images — headshots, brand shots you keep on disk. Also searched for spec images.',
  collateral: 'Rendered decks land here: <slug>.pdf (post this), <slug>-caption.txt (paste this), <slug>-pNN.jpg (page previews).',
  decks: 'Your deck specs. Copy example.deck.mts, change the copy, point cover.image at a file in ../media, then build.',
};
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
