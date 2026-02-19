import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import bcrypt from 'bcrypt';
import { users, wallets } from '../shared/schema.js';

const client = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
const db = drizzle(client);

const TEST_PASSWORD = 'test123';
const BCRYPT_ROUNDS = 12;

const testUsers = [
  { email: 'seller@test.com', displayName: 'Test Seller' },
  { email: 'buyer@test.com', displayName: 'Test Buyer' },
  { email: 'big@test.com', displayName: 'Test Enterprise' },
];

async function seed() {
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, BCRYPT_ROUNDS);
  console.log('Password hashed.');

  for (const u of testUsers) {
    const [user] = await db
      .insert(users)
      .values({
        email: u.email,
        password: hashedPassword,
        displayName: u.displayName,
      })
      .returning();

    await db.insert(wallets).values({
      userId: user.id,
      balanceCents: 50000,
    });

    console.log(`Created ${u.email} (id: ${user.id}) with $500 wallet`);
  }

  console.log('Done.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
