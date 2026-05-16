#!/usr/bin/env node
/**
 * Seed the one-account dev setup: Paul as superadmin with enterprise access
 * and enough sample work to test Yulia across the real authenticated app.
 */
import 'dotenv/config';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

const DEFAULT_LOCAL_DB = 'postgres://smbx:smbx@localhost:5432/smbx';
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || DEFAULT_LOCAL_DB;
const adminEmail = (process.env.DEV_ADMIN_EMAIL || 'pbaker@smbx.ai').toLowerCase();
const adminPassword = process.env.DEV_ADMIN_PASSWORD || 'test123';

if (process.env.NODE_ENV === 'production' && process.env.FORCE_DEV_SEED !== 'true') {
  console.error('Refusing to seed dev admin while NODE_ENV=production. Set FORCE_DEV_SEED=true only for a disposable test database.');
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

async function upsertPaul() {
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const [user] = await sql`
    INSERT INTO users (
      email, password, display_name, league, role, is_advisor,
      plan, free_deliverable_used, trial_ends_at, email_verified
    )
    VALUES (
      ${adminEmail}, ${passwordHash}, 'Paul Baker', 'L4', 'superadmin', true,
      'enterprise', false, NOW() + INTERVAL '90 days', true
    )
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      display_name = EXCLUDED.display_name,
      league = COALESCE(users.league, EXCLUDED.league),
      role = 'superadmin',
      is_advisor = true,
      plan = 'enterprise',
      free_deliverable_used = false,
      trial_ends_at = GREATEST(COALESCE(users.trial_ends_at, NOW()), EXCLUDED.trial_ends_at),
      email_verified = true,
      updated_at = NOW()
    RETURNING id, email, role
  `;

  await sql`
    INSERT INTO subscriptions (
      user_id, plan, status, stripe_subscription_id, stripe_customer_id,
      current_period_start, current_period_end, trial_ends_at
    )
    VALUES (
      ${user.id}, 'enterprise', 'active',
      ${`dev_superadmin_enterprise_${user.id}`},
      ${`dev_superadmin_${user.id}`},
      NOW(), NOW() + INTERVAL '30 days', NOW() + INTERVAL '90 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plan = 'enterprise',
      status = 'active',
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      trial_ends_at = EXCLUDED.trial_ends_at,
      updated_at = NOW()
  `;

  return user;
}

async function upsertDeal(userId, deal) {
  const [existing] = await sql`
    SELECT id FROM deals
    WHERE user_id = ${userId}
      AND business_name = ${deal.businessName}
      AND journey_type = ${deal.journeyType}
    ORDER BY id
    LIMIT 1
  `;

  if (existing) {
    await sql`
      UPDATE deals SET
        current_gate = ${deal.currentGate},
        league = ${deal.league},
        industry = ${deal.industry},
        location = ${deal.location},
        revenue = ${deal.revenue ?? null},
        sde = ${deal.sde ?? null},
        ebitda = ${deal.ebitda ?? null},
        asking_price = ${deal.askingPrice ?? null},
        financials = ${sql.json(deal.financials ?? {})},
        status = 'active',
        naics_code = ${deal.naicsCode ?? null},
        employee_count = ${deal.employeeCount ?? null},
        updated_at = NOW()
      WHERE id = ${existing.id}
    `;
    return existing.id;
  }

  const [created] = await sql`
    INSERT INTO deals (
      user_id, journey_type, current_gate, league, industry, location,
      business_name, name, revenue, sde, ebitda, asking_price,
      financials, status, naics_code, employee_count
    )
    VALUES (
      ${userId}, ${deal.journeyType}, ${deal.currentGate}, ${deal.league},
      ${deal.industry}, ${deal.location}, ${deal.businessName}, ${deal.businessName},
      ${deal.revenue ?? null}, ${deal.sde ?? null}, ${deal.ebitda ?? null}, ${deal.askingPrice ?? null},
      ${sql.json(deal.financials ?? {})}, 'active', ${deal.naicsCode ?? null}, ${deal.employeeCount ?? null}
    )
    RETURNING id
  `;
  return created.id;
}

async function ensureOwner(userId, dealId) {
  await sql`
    INSERT INTO deal_participants (deal_id, user_id, role, access_level, accepted_at)
    VALUES (${dealId}, ${userId}, 'owner', 'full', NOW())
    ON CONFLICT (deal_id, user_id) DO NOTHING
  `;
}

async function ensureGateProgress(dealId, completed, active) {
  for (const gate of completed) {
    await sql`
      INSERT INTO gate_progress (deal_id, gate, status, completed_at)
      VALUES (${dealId}, ${gate}, 'completed', NOW())
      ON CONFLICT (deal_id, gate) DO UPDATE SET status = 'completed', completed_at = COALESCE(gate_progress.completed_at, NOW())
    `;
  }
  await sql`
    INSERT INTO gate_progress (deal_id, gate, status)
    VALUES (${dealId}, ${active}, 'active')
    ON CONFLICT (deal_id, gate) DO UPDATE SET status = 'active'
  `;
}

async function ensureConversation(userId, dealId, spec) {
  const [existing] = await sql`
    SELECT id FROM conversations
    WHERE user_id = ${userId}
      AND deal_id = ${dealId}
      AND title = ${spec.title}
    ORDER BY id
    LIMIT 1
  `;

  const conversationId = existing?.id ?? (await sql`
    INSERT INTO conversations (user_id, title, deal_id, journey, current_gate, league)
    VALUES (${userId}, ${spec.title}, ${dealId}, ${spec.journey}, ${spec.currentGate}, ${spec.league})
    RETURNING id
  `)[0].id;

  const [messageCount] = await sql`
    SELECT COUNT(*)::int AS count FROM messages WHERE conversation_id = ${conversationId}
  `;

  if (messageCount.count === 0) {
    for (const message of spec.messages) {
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${conversationId}, ${message.role}, ${message.content})
      `;
    }
  }

  return conversationId;
}

const deals = [
  {
    businessName: 'Comfort Air HVAC',
    journeyType: 'sell',
    currentGate: 'S2',
    league: 'L2',
    industry: 'HVAC',
    location: 'Austin, TX',
    revenue: 180000000,
    sde: 42000000,
    ebitda: 36000000,
    askingPrice: 175000000,
    naicsCode: '238220',
    employeeCount: 22,
    financials: { seed_source: 'dev_admin', owner_dependency: 'moderate', recurring_revenue_pct: 34 },
    gates: { completed: ['S0', 'S1'], active: 'S2' },
    conversation: {
      title: 'Comfort Air HVAC - Sell',
      journey: 'sell',
      currentGate: 'S2',
      league: 'L2',
      messages: [
        { role: 'user', content: 'I want to sell my HVAC business. We do about $1.8M in revenue with $420K SDE.' },
        { role: 'assistant', content: 'I have the sell-side workspace started. Next I will validate the financials, pressure-test add-backs, and turn this into a ValueLens and CIM path.' },
      ],
    },
  },
  {
    businessName: 'Target MSP Acquisition',
    journeyType: 'buy',
    currentGate: 'B1',
    league: 'L1',
    industry: 'IT/MSP',
    location: 'Denver, CO',
    revenue: null,
    sde: null,
    ebitda: null,
    askingPrice: 50000000,
    naicsCode: '541512',
    employeeCount: null,
    financials: { seed_source: 'dev_admin', target_sde_min_cents: 15000000, target_sde_max_cents: 25000000 },
    gates: { completed: ['B0'], active: 'B1' },
    conversation: {
      title: 'MSP Acquisition Search',
      journey: 'buy',
      currentGate: 'B1',
      league: 'L1',
      messages: [
        { role: 'user', content: "I'm looking to buy a managed IT services business in Denver, ideally under $500K." },
        { role: 'assistant', content: 'I will treat this as a buy-side thesis and start from sourcing criteria, SBA fit, and target screening before we spend time on diligence.' },
      ],
    },
  },
  {
    businessName: 'Atlas Components Growth Raise',
    journeyType: 'raise',
    currentGate: 'R1',
    league: 'L3',
    industry: 'Industrial Components',
    location: 'Chicago, IL',
    revenue: 1250000000,
    sde: 165000000,
    ebitda: 142000000,
    askingPrice: null,
    naicsCode: '332710',
    employeeCount: 86,
    financials: { seed_source: 'dev_admin', raise_amount_cents: 650000000, use_of_proceeds: 'capacity expansion and two add-ons' },
    gates: { completed: ['R0'], active: 'R1' },
    conversation: {
      title: 'Atlas Components - Raise',
      journey: 'raise',
      currentGate: 'R1',
      league: 'L3',
      messages: [
        { role: 'user', content: 'We need to raise growth capital for a manufacturing platform doing $12.5M revenue and $1.42M EBITDA.' },
        { role: 'assistant', content: 'I will build the financial package first: normalized EBITDA, use of proceeds, debt capacity, and the investor narrative.' },
      ],
    },
  },
  {
    businessName: 'Lakeshore Dental Integration',
    journeyType: 'pmi',
    currentGate: 'PMI1',
    league: 'L2',
    industry: 'Dental Services',
    location: 'Grand Rapids, MI',
    revenue: 340000000,
    sde: 74000000,
    ebitda: 68000000,
    askingPrice: 310000000,
    naicsCode: '621210',
    employeeCount: 31,
    financials: { seed_source: 'dev_admin', close_date: '2026-05-01', thesis: 'retain clinical staff and consolidate billing' },
    gates: { completed: ['PMI0'], active: 'PMI1' },
    conversation: {
      title: 'Lakeshore Dental - PMI',
      journey: 'pmi',
      currentGate: 'PMI1',
      league: 'L2',
      messages: [
        { role: 'user', content: 'We closed a small dental platform. I need a Day 0 and 100-day integration plan.' },
        { role: 'assistant', content: 'I will organize this around stabilization first: payroll, banking, provider retention, patient communications, and the first operating rhythm.' },
      ],
    },
  },
];

try {
  console.log(`Seeding superadmin dev account into ${maskUrl(connectionString)} (${useSsl(connectionString) ? 'ssl' : 'no ssl'})`);
  const user = await upsertPaul();
  console.log(`Superadmin: ${user.email} id=${user.id} role=${user.role}`);

  for (const deal of deals) {
    const dealId = await upsertDeal(user.id, deal);
    await ensureOwner(user.id, dealId);
    await ensureGateProgress(dealId, deal.gates.completed, deal.gates.active);
    const conversationId = await ensureConversation(user.id, dealId, deal.conversation);
    console.log(`${deal.journeyType.toUpperCase()} deal ${dealId}: ${deal.businessName}; conversation ${conversationId}`);
  }

  console.log('\n=== Dev superadmin ready ===');
  console.log(`${adminEmail} / ${adminPassword}`);
  console.log('Plan: enterprise; role: superadmin; advisor: true');
} catch (err) {
  console.error('Seed error:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
