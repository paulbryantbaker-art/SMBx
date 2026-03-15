import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

async function seed() {
  console.log('Seeding wallet blocks...');
  await client`
    INSERT INTO wallet_blocks (name, price_cents, credits_cents, bonus_percent, sort_order) VALUES
      ('Exploratory',   5000,   5000,  0, 1),
      ('Early Commit', 10000,  10500,  5, 2),
      ('Active Deal',  25000,  26500,  6, 3),
      ('Serious',      50000,  54000,  8, 4),
      ('Full Journey',100000, 110000, 10, 5),
      ('Advisor',     250000, 280000, 12, 6)
    ON CONFLICT DO NOTHING
  `;

  // Menu items are seeded via migration 006_menu_items_and_wallets.sql (91 items).
  // No need to duplicate here — the migration is the source of truth.
  console.log('Menu items handled by migration 006 (91 items).');

  console.log('Seed complete.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
