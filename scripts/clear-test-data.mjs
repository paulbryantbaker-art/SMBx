/**
 * Clear all test conversation data from the database.
 * Run via: railway run -- node scripts/clear-test-data.mjs
 */
import postgres from 'postgres';

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const isRailway = connectionString.includes('rlwy.net') || connectionString.includes('railway');
const sql = postgres(connectionString, {
  ssl: isRailway ? 'require' : false,
  prepare: false,
  connect_timeout: 10,
});

try {
  // Clear in order of foreign key dependencies
  const msgResult = await sql`DELETE FROM messages`;
  console.log(`Deleted messages: ${msgResult.count} rows`);

  const convResult = await sql`DELETE FROM conversations`;
  console.log(`Deleted conversations: ${convResult.count} rows`);

  const anonResult = await sql`DELETE FROM anonymous_sessions`;
  console.log(`Deleted anonymous_sessions: ${anonResult.count} rows`);

  // Verify
  const counts = await sql`
    SELECT 'messages' as tbl, count(*)::int as cnt FROM messages
    UNION ALL SELECT 'conversations', count(*)::int FROM conversations
    UNION ALL SELECT 'anonymous_sessions', count(*)::int FROM anonymous_sessions
  `;
  console.log('\nVerification:');
  for (const row of counts) {
    console.log(`  ${row.tbl}: ${row.cnt}`);
  }

  console.log('\nAll test data cleared.');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
