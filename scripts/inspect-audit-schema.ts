import 'dotenv/config';
import postgres from 'postgres';
(async () => {
  const sql = postgres(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'audit_trail'
    ORDER BY ordinal_position
  `;
  for (const r of rows) console.log(r.column_name, '|', r.data_type);
  await sql.end();
})();
