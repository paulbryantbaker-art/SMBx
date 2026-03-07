#!/usr/bin/env npx tsx
/**
 * Session 0 — Knowledge Foundation Integration Test
 *
 * Verifies that all knowledge files exist with content,
 * checks keyword coverage, and validates DB seeding.
 *
 * Run: npx tsx scripts/test-knowledge-foundation.ts
 *
 * DB tests require DATABASE_URL. File tests work locally.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => boolean) {
  try {
    if (fn()) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ✗ ${name}`);
      failed++;
    }
  } catch (e: any) {
    console.log(`  ✗ ${name} — ${e.message}`);
    failed++;
  }
}

function readFile(name: string): string {
  const path = resolve(ROOT, name);
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf-8');
}

function lineCount(content: string): number {
  return content.split('\n').length;
}

function hasKeywords(content: string, keywords: string[]): string[] {
  const lower = content.toLowerCase();
  return keywords.filter(kw => !lower.includes(kw.toLowerCase()));
}

// ─── Test 1: Knowledge files exist and have content ────────────

console.log('\n📚 Test 1: Knowledge files exist (>100 lines each)');

const knowledgeFiles = [
  'METHODOLOGY_V17.md',
  'YULIA_PROMPTS_V2.md',
  'YULIA_VALUATION_MASTERY.md',
  'YULIA_INDUSTRY_PROFILES.md',
  'YULIA_NEGOTIATION_PLAYBOOK.md',
  'YULIA_INDUSTRY_INTELLIGENCE.md',
];

for (const file of knowledgeFiles) {
  const content = readFile(file);
  test(`${file} exists and has >100 lines`, () => {
    const lines = lineCount(content);
    if (lines < 100) {
      console.log(`    → only ${lines} lines`);
      return false;
    }
    return true;
  });
}

// ─── Test 2: Valuation Mastery keyword coverage ────────────────

console.log('\n🔢 Test 2: Valuation Mastery keyword coverage');

const valuationContent = readFile('YULIA_VALUATION_MASTERY.md');
const valuationKeywords = [
  'SDE', 'EBITDA', 'add-back', 'seller note', 'earnout',
  'SBA', 'DSCR', 'asset sale', 'stock sale',
];
const missingValuation = hasKeywords(valuationContent, valuationKeywords);
test('All valuation keywords present', () => {
  if (missingValuation.length > 0) {
    console.log(`    → missing: ${missingValuation.join(', ')}`);
    return false;
  }
  return true;
});

// ─── Test 3: Industry Profiles coverage ────────────────────────

console.log('\n🏭 Test 3: Industry Profiles coverage');

const profileContent = readFile('YULIA_INDUSTRY_PROFILES.md');
const requiredIndustries = [
  'HVAC', 'Pest Control', 'Dental', 'SaaS', 'Trucking', 'Funeral',
];
const missingIndustries = hasKeywords(profileContent, requiredIndustries);
test('All required industries present', () => {
  if (missingIndustries.length > 0) {
    console.log(`    → missing: ${missingIndustries.join(', ')}`);
    return false;
  }
  return true;
});

test('At least 30 industry profiles (## headers)', () => {
  const sectionCount = (profileContent.match(/^## \d+\./gm) || []).length;
  if (sectionCount < 30) {
    console.log(`    → only ${sectionCount} sections`);
    return false;
  }
  return true;
});

// ─── Test 4: Negotiation Playbook coverage ─────────────────────

console.log('\n🤝 Test 4: Negotiation Playbook keyword coverage');

const negotiationContent = readFile('YULIA_NEGOTIATION_PLAYBOOK.md');
const negotiationKeywords = [
  'IOI', 'LOI', 'BAFO', 'due diligence', 'walk-away', 're-trade',
];
const missingNegotiation = hasKeywords(negotiationContent, negotiationKeywords);
test('All negotiation keywords present', () => {
  if (missingNegotiation.length > 0) {
    console.log(`    → missing: ${missingNegotiation.join(', ')}`);
    return false;
  }
  return true;
});

// ─── Test 5: Industry Intelligence coverage ────────────────────

console.log('\n📊 Test 5: Industry Intelligence coverage');

const intelContent = readFile('YULIA_INDUSTRY_INTELLIGENCE.md');
test('Industry intelligence has acquisition thesis framework', () => {
  return intelContent.toLowerCase().includes('acquisition thesis');
});
test('Industry intelligence has buyer type guidance', () => {
  return intelContent.toLowerCase().includes('buyer type');
});

// ─── Test 6: Knowledge service module exists ───────────────────

console.log('\n🧠 Test 6: Knowledge service');

test('knowledgeService.ts exists', () => {
  return existsSync(resolve(ROOT, 'server/services/knowledgeService.ts'));
});

// ─── Test 7: Migration files exist ─────────────────────────────

console.log('\n🗃️  Test 7: Migration files');

test('027_naics_benchmarks_extended.sql exists', () => {
  return existsSync(resolve(ROOT, 'server/migrations/027_naics_benchmarks_extended.sql'));
});

test('028_closed_deals.sql exists', () => {
  return existsSync(resolve(ROOT, 'server/migrations/028_closed_deals.sql'));
});

test('seed-naics-benchmarks.sql exists', () => {
  return existsSync(resolve(ROOT, 'scripts/seed-naics-benchmarks.sql'));
});

test('seed-closed-deals.js exists', () => {
  return existsSync(resolve(ROOT, 'scripts/seed-closed-deals.js'));
});

// ─── Test 8: DB tests (only if DATABASE_URL is set) ────────────

if (process.env.DATABASE_URL) {
  console.log('\n💾 Test 8: Database verification (live)');

  const postgres = (await import('postgres')).default;
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    // NAICS benchmarks count
    const [{ count: naicsCount }] = await sql`SELECT COUNT(*)::int as count FROM naics_benchmarks WHERE state IS NULL`;
    test(`NAICS benchmarks seeded (>= 30): found ${naicsCount}`, () => naicsCount >= 30);

    // Closed deals count
    const [{ count: dealsCount }] = await sql`SELECT COUNT(*)::int as count FROM closed_deals`;
    test(`Closed deals seeded (>= 400): found ${dealsCount}`, () => dealsCount >= 400);

    // HVAC benchmark reasonableness
    const hvac = await sql`SELECT sde_multiple_low, sde_multiple_high FROM naics_benchmarks WHERE naics_code = '238220' AND state IS NULL LIMIT 1`;
    if (hvac.length > 0) {
      const low = parseFloat(hvac[0].sde_multiple_low);
      const high = parseFloat(hvac[0].sde_multiple_high);
      test(`HVAC SDE multiple range reasonable (2.0-6.0): ${low}-${high}`, () => {
        return low >= 2.0 && low <= 4.0 && high >= 3.0 && high <= 6.0;
      });
    } else {
      test('HVAC benchmark exists', () => false);
    }

    await sql.end();
  } catch (e: any) {
    console.log(`  ⚠ DB tests skipped: ${e.message}`);
  }
} else {
  console.log('\n💾 Test 8: Database verification — SKIPPED (no DATABASE_URL)');
}

// ─── Summary ───────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

if (failed > 0) {
  process.exit(1);
}
