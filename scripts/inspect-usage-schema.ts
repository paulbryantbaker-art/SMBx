import 'dotenv/config';
import postgres from 'postgres';
(async () => {
  const sql = postgres(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'agency_usage_events'
    ORDER BY ordinal_position
  `;
  for (const r of rows) console.log(r.column_name, '|', r.data_type);
  console.log('---');
  const sample = await sql`SELECT * FROM agency_usage_events ORDER BY created_at DESC LIMIT 1`;
  if (sample.length) console.log('SAMPLE ROW:', JSON.stringify(sample[0], null, 2));
  await sql.end();
})();
