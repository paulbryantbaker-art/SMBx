import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function main() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log('Tables:', tables.map(r => r.table_name));

  // Also check users table columns
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
  console.log('\nUsers columns:', cols.map(r => `${r.column_name} (${r.data_type})`));

  // Check row counts
  const userCount = await sql`SELECT count(*) as n FROM users`;
  const walletCount = await sql`SELECT count(*) as n FROM wallets`;
  console.log(`\nUsers: ${userCount[0].n}, Wallets: ${walletCount[0].n}`);

  await sql.end();
}

main().catch(err => { console.error(err); process.exit(1); });
