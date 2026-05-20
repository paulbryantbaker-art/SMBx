#!/usr/bin/env npx tsx
/**
 * V19 schema verifier.
 *
 * Static mode runs without DATABASE_URL and checks that the migration files
 * contain the required V19 tables/columns. DB mode runs the same inventory
 * against a live database when DATABASE_URL is present.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSql, maskDatabaseUrl } from '../server/dbConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const requiredTables = [
  'authority_register',
  'citation_registry',
  'model_registry',
  'audit_trail',
  'deal_model_stack',
  'tax_position_registry',
  'legal_defer_log',
  'studio_drafts',
  'studio_books',
  'studio_book_versions',
  'studio_sources',
  'studio_exports',
  'model_executions',
  'firm_memory',
  'today_operating_briefs',
  'market_data_cache',
] as const;

const requiredColumns: Record<string, string[]> = {
  authority_register: ['authority_id', 'cite_tag', 'authority_type', 'jurisdiction', 'source_url', 'effective_date', 'supersedes_authority_id', 'status', 'validation_status', 'next_check_due', 'aliases'],
  market_data_cache: ['series_id', 'value', 'as_of_date', 'source_url', 'cite_tag', 'metadata'],
  audit_trail: ['session_id', 'deal_id', 'user_id', 'conversation_id', 'turn_id', 'model_stack', 'citations_validated', 'output_hash', 'spec_version', 'methodology_version', 'spec_uri', 'methodology_uri'],
  studio_book_versions: ['slides', 'assumptions', 'model_outputs', 'provenance', 'audit', 'speaker_notes', 'spec_version', 'methodology_version'],
  studio_exports: ['output_hash', 'metadata', 'spec_version', 'methodology_version'],
  model_executions: ['model_id', 'version', 'status', 'input_hash', 'output_hash', 'missing_inputs', 'citation_tags', 'audit_payload', 'spec_version', 'methodology_version', 'spec_uri', 'methodology_uri'],
  deal_model_stack: ['primary_models', 'supporting', 'tax_legal', 'sensitivity', 'spec_version', 'methodology_version'],
  firm_memory: ['memory_type', 'label', 'value', 'source', 'confidence', 'status'],
  today_operating_briefs: ['source_fingerprint', 'morning_brief', 'gate_countdown', 'deal_pulse', 'studio_refresh_needs', 'firm_memory_snapshot'],
};

let passed = 0;
let failed = 0;

function pass(message: string) {
  passed++;
  console.log(`  ✓ ${message}`);
}

function fail(message: string) {
  failed++;
  console.log(`  ✗ ${message}`);
}

function assert(condition: unknown, message: string) {
  condition ? pass(message) : fail(message);
}

function readMigrationBundle(): string {
  const migrationDir = path.join(root, 'server/migrations');
  return fs.readdirSync(migrationDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => fs.readFileSync(path.join(migrationDir, file), 'utf8'))
    .join('\n\n');
}

async function verifyStatic() {
  console.log('\nV19 schema verification — static migrations');
  const sqlText = readMigrationBundle().toLowerCase();
  for (const table of requiredTables) {
    assert(sqlText.includes(table), `${table} appears in migrations`);
  }
  for (const [table, columns] of Object.entries(requiredColumns)) {
    for (const column of columns) {
      assert(sqlText.includes(column.toLowerCase()), `${table}.${column} appears in migrations`);
    }
  }
  assert(sqlText.includes('idx_market_data_cache_v19_unique'), 'market_data_cache V19 unique index exists');
}

async function verifyDatabase() {
  if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
    console.log('\nDATABASE_URL is not set; skipped live DB verification.');
    return;
  }

  console.log(`\nV19 schema verification — live database ${maskDatabaseUrl()}`);
  const sql = createSql();
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ${sql(requiredTables as unknown as string[])}
    `;
    const presentTables = new Set((tables as any[]).map(row => String(row.table_name)));
    for (const table of requiredTables) {
      assert(presentTables.has(table), `${table} exists in database`);
    }

    for (const [table, columns] of Object.entries(requiredColumns)) {
      const rows = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${table}
          AND column_name IN ${sql(columns)}
      `;
      const presentColumns = new Set((rows as any[]).map(row => String(row.column_name)));
      for (const column of columns) {
        assert(presentColumns.has(column), `${table}.${column} exists in database`);
      }
    }

    const [citationCount] = await sql`SELECT COUNT(*)::int as count FROM citation_registry WHERE status = 'active'`;
    assert(Number(citationCount?.count || 0) >= 10, 'citation_registry has active V19 seeds');
    const [authorityCount] = await sql`SELECT COUNT(*)::int as count FROM authority_register WHERE status = 'active'`;
    assert(Number(authorityCount?.count || 0) >= 50, 'authority_register has 50+ active DEFINITIVE seeds');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

await verifyStatic();
await verifyDatabase();

console.log(`\n${passed} checks passed, ${failed} failed`);
if (failed > 0) process.exit(1);
