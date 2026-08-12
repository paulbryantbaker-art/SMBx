/**
 * BUILD.txt — the provenance line every dated output folder must carry.
 *
 * WHY. The rule files have said since 2026-08-10 that "each dated output
 * folder records the engine commit in BUILD.txt" — and no builder ever wrote
 * one. The 2026-08-12 home-services renders landed with no record of which
 * engine, which spec text, or which master produced them. Reproducibility
 * ("same inputs, same output, provable") needs the inputs NAMED, and a rule
 * no code enforces is a hope.
 *
 * Called by build-report, build-deck and build-onepager after a successful
 * write. Never throws — a render that succeeded is not failed by its receipt;
 * a BUILD.txt that says "engine commit unknown (not a git checkout)" is
 * itself an honest record.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

export function writeBuildRecord(outDir: string, builder: string, inputs: { label: string; file: string | null | undefined }[]): void {
  try {
    const lines: string[] = [];
    lines.push(`built      ${new Date().toISOString()}`);
    lines.push(`builder    ${builder}`);
    let commit = 'unknown (engine is not a git checkout)';
    try {
      const dir = path.dirname(new URL(import.meta.url).pathname);
      commit = execSync(`git -C ${JSON.stringify(dir)} rev-parse --short HEAD`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      const dirty = execSync(`git -C ${JSON.stringify(dir)} status --porcelain`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (dirty) commit += ' + uncommitted changes';
    } catch { /* recorded as unknown */ }
    lines.push(`engine     ${commit}`);
    lines.push(`node       ${process.version}`);
    for (const { label, file } of inputs) {
      if (!file || !existsSync(file)) { lines.push(`${label.padEnd(10)} (absent)`); continue; }
      const sha = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
      lines.push(`${label.padEnd(10)} ${path.resolve(file)}  sha256:${sha}`);
    }
    lines.push('');
    lines.push('Rebuild: same spec + same master + this engine commit reproduces this');
    lines.push('output. If any hash above differs on disk, this artifact is from a');
    lines.push('different text than the one now sitting there.');
    writeFileSync(path.join(outDir, 'BUILD.txt'), lines.join('\n') + '\n');
  } catch { /* the artifact stands; the receipt failed */ }
}
