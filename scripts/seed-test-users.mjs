/**
 * Seed 3 test users with deals, conversations, messages, and paid-plan state.
 * Run via: node scripts/seed-test-users.mjs
 */
import 'dotenv/config';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

const DEFAULT_LOCAL_DB = 'postgres://smbx:smbx@localhost:5432/smbx';
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || DEFAULT_LOCAL_DB;

if (process.env.NODE_ENV === 'production' && process.env.FORCE_DEV_SEED !== 'true') {
  console.error('Refusing to seed test users while NODE_ENV=production. Set FORCE_DEV_SEED=true if this is truly a disposable dev database.');
  process.exit(1);
}

function useSsl(url) {
  if (process.env.DATABASE_SSL === 'true') return true;
  if (process.env.DATABASE_SSL === 'false') return false;
  return /railway|rlwy|render|supabase|neon|amazonaws/i.test(url);
}

function maskUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username ? `${parsed.username}:***@` : ''}${parsed.host}${parsed.pathname}`;
  } catch {
    return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  }
}

const sql = postgres(connectionString, {
  ssl: useSsl(connectionString) ? 'require' : false,
  prepare: false,
  connect_timeout: 10,
});

const PASSWORD_HASH = await bcrypt.hash('test123', 10);

async function getOrCreateDeal({ userId, journeyType, businessName, values }) {
  const [existing] = await sql`
    SELECT id FROM deals
    WHERE user_id = ${userId}
      AND journey_type = ${journeyType}
      AND business_name = ${businessName}
    ORDER BY id
    LIMIT 1
  `;

  if (existing) {
    await sql`
      UPDATE deals SET
        current_gate = ${values.currentGate},
        league = ${values.league},
        industry = ${values.industry},
        location = ${values.location},
        revenue = ${values.revenue ?? null},
        sde = ${values.sde ?? null},
        ebitda = ${values.ebitda ?? null},
        status = 'active',
        naics_code = ${values.naicsCode ?? null},
        employee_count = ${values.employeeCount ?? null},
        updated_at = NOW()
      WHERE id = ${existing.id}
    `;
    return existing.id;
  }

  const [created] = await sql`
    INSERT INTO deals (
      user_id, journey_type, current_gate, league, industry, location,
      business_name, revenue, sde, ebitda, status, naics_code, employee_count
    )
    VALUES (
      ${userId}, ${journeyType}, ${values.currentGate}, ${values.league},
      ${values.industry}, ${values.location}, ${businessName},
      ${values.revenue ?? null}, ${values.sde ?? null}, ${values.ebitda ?? null},
      'active', ${values.naicsCode ?? null}, ${values.employeeCount ?? null}
    )
    RETURNING id
  `;
  return created.id;
}

async function ensureConversation({ userId, dealId, title, journey, currentGate, league, messages }) {
  const [existing] = await sql`
    SELECT id FROM conversations
    WHERE user_id = ${userId}
      AND deal_id = ${dealId}
      AND title = ${title}
    ORDER BY id
    LIMIT 1
  `;

  const conversationId = existing?.id ?? (await sql`
    INSERT INTO conversations (user_id, title, deal_id, journey, current_gate, league)
    VALUES (${userId}, ${title}, ${dealId}, ${journey}, ${currentGate}, ${league})
    RETURNING id
  `)[0].id;

  const [messageCount] = await sql`
    SELECT COUNT(*)::int AS count FROM messages WHERE conversation_id = ${conversationId}
  `;

  if (messageCount.count === 0) {
    for (const message of messages) {
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${conversationId}, ${message.role}, ${message.content})
      `;
    }
  }

  return conversationId;
}

async function ensurePaidPlans(users) {
  try {
    await sql`
      UPDATE users SET
        plan = CASE
          WHEN email = 'seller@test.com' THEN 'professional'
          WHEN email = 'buyer@test.com' THEN 'starter'
          WHEN email = 'advisor@test.com' THEN 'enterprise'
          ELSE plan
        END,
        free_deliverable_used = false,
        trial_ends_at = NOW() + INTERVAL '90 days',
        updated_at = NOW()
      WHERE id IN (${sql(users.map((user) => user.id))})
    `;
  } catch (err) {
    console.warn(`Plan columns not fully available yet: ${err.message}`);
  }

  try {
    for (const user of users) {
      await sql`
        INSERT INTO subscriptions (
          user_id, plan, status, stripe_subscription_id, stripe_customer_id,
          current_period_start, current_period_end, trial_ends_at
        )
        VALUES (
          ${user.id}, ${user.plan}, 'active',
          ${`dev_sub_${user.plan}_${user.id}`},
          ${`dev_cus_${user.id}`},
          NOW(), NOW() + INTERVAL '30 days', NOW() + INTERVAL '90 days'
        )
        ON CONFLICT (user_id) DO UPDATE SET
          plan = EXCLUDED.plan,
          status = 'active',
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          trial_ends_at = EXCLUDED.trial_ends_at,
          updated_at = NOW()
      `;
    }
  } catch (err) {
    console.warn(`Subscription table not ready yet: ${err.message}`);
  }
}

try {
  console.log(`Seeding dev data into ${maskUrl(connectionString)} (${useSsl(connectionString) ? 'ssl' : 'no ssl'})`);

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

  await ensurePaidPlans([
    { id: seller.id, plan: 'professional' },
    { id: buyer.id, plan: 'starter' },
    { id: advisor.id, plan: 'enterprise' },
  ]);
  console.log('Plan/subscription state updated');

  // ── 2. Deals ──────────────────────────────────────────────
  const sellerDealId = await getOrCreateDeal({
    userId: seller.id,
    journeyType: 'sell',
    businessName: 'Comfort Air HVAC',
    values: {
      currentGate: 'S2',
      league: 'L2',
      industry: 'HVAC',
      location: 'Austin, TX',
      revenue: 180000000,
      sde: 42000000,
      ebitda: 36000000,
      naicsCode: '238220',
      employeeCount: 22,
    },
  });
  console.log(`Seller deal: id=${sellerDealId}`);

  const buyerDealId = await getOrCreateDeal({
    userId: buyer.id,
    journeyType: 'buy',
    businessName: 'Target MSP Acquisition',
    values: {
      currentGate: 'B1',
      league: 'L1',
      industry: 'IT/MSP',
      location: 'Denver, CO',
      revenue: null,
      sde: null,
      ebitda: null,
      naicsCode: '541512',
      employeeCount: null,
    },
  });
  console.log(`Buyer deal: id=${buyerDealId}`);

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
    const convId = await ensureConversation({
      userId: seller.id,
      dealId: sellerDealId,
      title: 'Comfort Air HVAC - Sell',
      journey: 'sell',
      currentGate: 'S2',
      league: 'L2',
      messages: [
        { role: 'user', content: 'I want to sell my HVAC business. We do about $1.8M in revenue with $420K SDE.' },
        { role: 'assistant', content: 'Great - Comfort Air HVAC looks like a solid L2 business. I have estimated your SDE at $420K, which puts your preliminary valuation range at $1.26M-$2.10M using a 3.0-5.0x SDE multiple. Let me walk you through the next steps to get your CIM ready.' },
      ],
    });
    console.log(`Seller conversation: id=${convId}`);
  }

  if (buyerDealId) {
    const convId = await ensureConversation({
      userId: buyer.id,
      dealId: buyerDealId,
      title: 'MSP Acquisition Search',
      journey: 'buy',
      currentGate: 'B1',
      league: 'L1',
      messages: [
        { role: 'user', content: "I'm looking to buy a managed IT services business in the Denver area, ideally under $500K." },
        { role: 'assistant', content: "I can help you find MSP businesses in the Denver metro. For L1 deals under $500K, we're typically looking at businesses with $150K-$250K in SDE. Let me set up your buyer thesis and start scanning for matches." },
      ],
    });
    console.log(`Buyer conversation: id=${convId}`);
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
