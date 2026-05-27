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
    const [user] = await sql`
      INSERT INTO users (email, password, display_name)
      VALUES (${u.email}, ${hashedPassword}, ${u.displayName})
      ON CONFLICT (email)
      DO UPDATE SET
        password = EXCLUDED.password,
        display_name = EXCLUDED.display_name,
        updated_at = NOW()
      RETURNING id, email
    `;

    console.log(`Seeded ${user.email} (id: ${user.id})`);
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
