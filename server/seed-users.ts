import 'dotenv/config';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false });

const TEST_PASSWORD = 'test123';
const BCRYPT_ROUNDS = 12;

const testUsers = [
  { email: 'seller@test.com', displayName: 'Test Seller' },
  { email: 'buyer@test.com', displayName: 'Test Buyer' },
  { email: 'big@test.com', displayName: 'Test Enterprise' },
];

async function seed() {
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, BCRYPT_ROUNDS);
  console.log('Hashed password:', hashedPassword);

  for (const u of testUsers) {
    // Delete existing user + wallet if present
    const existing = await sql`SELECT id FROM users WHERE email = ${u.email} LIMIT 1`;
    if (existing.length > 0) {
      await sql`DELETE FROM wallets WHERE user_id = ${existing[0].id}`;
      await sql`DELETE FROM users WHERE id = ${existing[0].id}`;
      console.log(`Deleted existing ${u.email}`);
    }

    const [user] = await sql`
      INSERT INTO users (email, password, display_name)
      VALUES (${u.email}, ${hashedPassword}, ${u.displayName})
      RETURNING id, email
    `;

    await sql`INSERT INTO wallets (user_id, balance_cents) VALUES (${user.id}, 50000)`;
    console.log(`Created ${user.email} (id: ${user.id}) with $500 wallet`);
  }

  // Verify a hash round-trip
  const verify = await bcrypt.compare(TEST_PASSWORD, hashedPassword);
  console.log('Hash verify round-trip:', verify);

  console.log('Done.');
  await sql.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
