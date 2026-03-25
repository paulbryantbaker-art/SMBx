/**
 * Seed 3 test users with deals, wallets, conversations, and messages.
 * Run via: node scripts/seed-test-users.mjs
 */
import postgres from 'postgres';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgres://smbx:smbx@localhost:5432/smbx';
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const isRailway = connectionString.includes('rlwy.net') || connectionString.includes('railway');
const sql = postgres(connectionString, {
  ssl: isRailway ? 'require' : false,
  prepare: false,
  connect_timeout: 10,
});

const PASSWORD_HASH = await bcrypt.hash('test123', 10);

try {
  // ── 1. Users ──────────────────────────────────────────────
  const [seller] = await sql`
    INSERT INTO users (email, password, display_name, league, role)
    VALUES ('seller@test.com', ${PASSWORD_HASH}, 'Sarah Seller', 'L2', 'user')
    ON CONFLICT (email) DO UPDATE SET password = ${PASSWORD_HASH}, display_name = EXCLUDED.display_name
    RETURNING id
  `;
  console.log(`Seller user: id=${seller.id}`);

  const [buyer] = await sql`
    INSERT INTO users (email, password, display_name, league, role)
    VALUES ('buyer@test.com', ${PASSWORD_HASH}, 'Ben Buyer', 'L1', 'user')
    ON CONFLICT (email) DO UPDATE SET password = ${PASSWORD_HASH}, display_name = EXCLUDED.display_name
    RETURNING id
  `;
  console.log(`Buyer user: id=${buyer.id}`);

  const [advisor] = await sql`
    INSERT INTO users (email, password, display_name, league, role, is_advisor)
    VALUES ('advisor@test.com', ${PASSWORD_HASH}, 'Alex Advisor', 'L3', 'user', true)
    ON CONFLICT (email) DO UPDATE SET password = ${PASSWORD_HASH}, display_name = EXCLUDED.display_name, is_advisor = true
    RETURNING id
  `;
  console.log(`Advisor user: id=${advisor.id}`);

  // ── 2. Deals ──────────────────────────────────────────────
  const [sellerDeal] = await sql`
    INSERT INTO deals (user_id, journey_type, current_gate, league, industry, location, business_name, name, revenue, sde, ebitda, status, naics_code, employee_count)
    VALUES (
      ${seller.id}, 'sell', 'S2', 'L2',
      'HVAC', 'Austin, TX',
      'Comfort Air HVAC', 'Comfort Air HVAC Sale',
      180000000, 42000000, 36000000,
      'active', '238220', 22
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `;
  const sellerDealId = sellerDeal?.id;
  if (sellerDealId) console.log(`Seller deal: id=${sellerDealId}`);

  const [buyerDeal] = await sql`
    INSERT INTO deals (user_id, journey_type, current_gate, league, industry, location, business_name, name, status, naics_code)
    VALUES (
      ${buyer.id}, 'buy', 'B1', 'L1',
      'IT/MSP', 'Denver, CO',
      'Target MSP Acquisition', 'MSP Search',
      'active', '541512'
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `;
  const buyerDealId = buyerDeal?.id;
  if (buyerDealId) console.log(`Buyer deal: id=${buyerDealId}`);

  // ── 4. Gate progress ─────────────────────────────────────
  if (sellerDealId) {
    for (const gate of ['S0', 'S1']) {
      await sql`
        INSERT INTO gate_progress (deal_id, gate, status, completed_at)
        VALUES (${sellerDealId}, ${gate}, 'completed', NOW())
        ON CONFLICT (deal_id, gate) DO NOTHING
      `;
    }
    await sql`
      INSERT INTO gate_progress (deal_id, gate, status)
      VALUES (${sellerDealId}, 'S2', 'active')
      ON CONFLICT (deal_id, gate) DO NOTHING
    `;
  }

  if (buyerDealId) {
    await sql`
      INSERT INTO gate_progress (deal_id, gate, status, completed_at)
      VALUES (${buyerDealId}, 'B0', 'completed', NOW())
      ON CONFLICT (deal_id, gate) DO NOTHING
    `;
    await sql`
      INSERT INTO gate_progress (deal_id, gate, status)
      VALUES (${buyerDealId}, 'B1', 'active')
      ON CONFLICT (deal_id, gate) DO NOTHING
    `;
  }
  console.log('Gate progress rows created');

  // ── 5. Deal participants ──────────────────────────────────
  if (sellerDealId) {
    await sql`
      INSERT INTO deal_participants (deal_id, user_id, role, access_level, accepted_at)
      VALUES (${sellerDealId}, ${seller.id}, 'owner', 'full', NOW())
      ON CONFLICT (deal_id, user_id) DO NOTHING
    `;
  }
  if (buyerDealId) {
    await sql`
      INSERT INTO deal_participants (deal_id, user_id, role, access_level, accepted_at)
      VALUES (${buyerDealId}, ${buyer.id}, 'owner', 'full', NOW())
      ON CONFLICT (deal_id, user_id) DO NOTHING
    `;
  }
  console.log('Deal participants created');

  // ── 6. Conversations + Messages ───────────────────────────
  if (sellerDealId) {
    const [conv] = await sql`
      INSERT INTO conversations (user_id, title, deal_id, journey, current_gate, league)
      VALUES (${seller.id}, 'Comfort Air HVAC — Sell', ${sellerDealId}, 'sell', 'S2', 'L2')
      RETURNING id
    `;
    await sql`
      INSERT INTO messages (conversation_id, role, content) VALUES
        (${conv.id}, 'user', 'I want to sell my HVAC business. We do about $1.8M in revenue with $420K SDE.'),
        (${conv.id}, 'assistant', 'Great — Comfort Air HVAC looks like a solid L2 business. I''ve estimated your SDE at $420K, which puts your preliminary valuation range at $1.26M–$2.10M using a 3.0–5.0x SDE multiple. Let me walk you through the next steps to get your CIM ready.')
    `;
    console.log(`Seller conversation: id=${conv.id} with 2 messages`);
  }

  if (buyerDealId) {
    const [conv] = await sql`
      INSERT INTO conversations (user_id, title, deal_id, journey, current_gate, league)
      VALUES (${buyer.id}, 'MSP Acquisition Search', ${buyerDealId}, 'buy', 'B1', 'L1')
      RETURNING id
    `;
    await sql`
      INSERT INTO messages (conversation_id, role, content) VALUES
        (${conv.id}, 'user', 'I''m looking to buy a managed IT services business in the Denver area, ideally under $500K.'),
        (${conv.id}, 'assistant', 'I can help you find MSP businesses in the Denver metro. For L1 deals under $500K, we''re typically looking at businesses with $150K–$250K in SDE. Let me set up your buyer thesis and start scanning for matches.')
    `;
    console.log(`Buyer conversation: id=${conv.id} with 2 messages`);
  }

  console.log('\n=== Test users seeded successfully ===');
  console.log('  seller@test.com / test123');
  console.log('  buyer@test.com  / test123');
  console.log('  advisor@test.com / test123');

} catch (err) {
  console.error('Seed error:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
