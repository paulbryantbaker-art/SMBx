import 'dotenv/config';
import fs from 'fs';
import postgres from 'postgres';

const file = process.argv[2];
if (!file) {
  console.error('Usage: npx tsx server/run-migration.ts <migration-file>');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
const migration = fs.readFileSync(file, 'utf8');

// Strip single-line comments, then split on semicolons
const cleaned = migration.replace(/--.*$/gm, '');
const statements = cleaned
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

async function run() {
  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      console.log('OK:', stmt.substring(0, 80) + (stmt.length > 80 ? '...' : ''));
    } catch (err: any) {
      console.error('ERR:', stmt.substring(0, 80), '-', err.message);
    }
  }

  // Verify tables
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
  console.log('\nAll tables:', tables.map(t => t.tablename).join(', '));

  await sql.end();
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
