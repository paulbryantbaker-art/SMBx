import 'dotenv/config';
import postgres from 'postgres';
(async () => {
  const sql = postgres(process.env.DATABASE_URL!);
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'deal_model_stack'
    ORDER BY ordinal_position
  `;
  console.log('Columns:');
  for (const c of cols) console.log(` ${(c as any).column_name} | ${(c as any).data_type}`);
  console.log('\nConstraints:');
  const cons = await sql`
    SELECT conname, contype, pg_get_constraintdef(oid) as def
    FROM pg_constraint
    WHERE conrelid = 'deal_model_stack'::regclass
  `;
  for (const c of cons) console.log(` ${(c as any).conname} (${(c as any).contype}): ${(c as any).def}`);
  console.log('\nIndexes:');
  const idx = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'deal_model_stack'
  `;
  for (const i of idx) console.log(` ${(i as any).indexname}: ${(i as any).indexdef}`);
  await sql.end();
})();
