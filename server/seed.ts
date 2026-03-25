import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

async function seed() {
  // Menu items are seeded via migration 006_menu_items_and_wallets.sql (91 items).
  // No need to duplicate here — the migration is the source of truth.
  // Wallet blocks are no longer used — platform fee model replaced wallet top-ups.
  console.log('Menu items handled by migration 006 (91 items).');
  console.log('Seed complete.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
