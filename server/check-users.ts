import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function main() {
  const users = await sql`SELECT id, email, display_name FROM users`;
  console.log('Users:', users);
  await sql.end();
}

main().catch(err => { console.error(err); process.exit(1); });
