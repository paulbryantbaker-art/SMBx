#!/usr/bin/env node
import 'dotenv/config';
import postgres from 'postgres';

const required = ['DATABASE_URL', 'ANTHROPIC_API_KEY', 'JWT_SECRET'];
const recommended = ['APP_URL', 'TEST_MODE', 'DEV_NO_PAYWALL', 'VITE_DEV_AUTH_BYPASS', 'UPLOAD_PATH', 'DEV_ADMIN_EMAIL', 'DEV_ADMIN_PASSWORD'];
const adminEmail = (process.env.DEV_ADMIN_EMAIL || 'pbaker@smbx.ai').toLowerCase();

function has(name) {
  return Boolean(process.env[name]);
}

function maskUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username ? `${parsed.username}:***@` : ''}${parsed.host}${parsed.pathname}`;
  } catch {
    return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  }
}

function useSsl(url) {
  if (process.env.DATABASE_SSL === 'true') return true;
  if (process.env.DATABASE_SSL === 'false') return false;
  return /railway|rlwy|render|supabase|neon|amazonaws/i.test(url);
}

console.log('=== SMBx Dev Health ===');

for (const name of required) {
  console.log(`${has(name) ? 'ok' : 'missing'} ${name}`);
}
for (const name of recommended) {
  console.log(`${has(name) ? 'ok' : 'warn'} ${name}${name === 'VITE_DEV_AUTH_BYPASS' && process.env[name] !== 'false' ? ' (set false for real authed Yulia testing)' : ''}`);
}

if (!process.env.DATABASE_URL) {
  console.error('\nDATABASE_URL is required before the API can start.');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
console.log(`\nDB: ${maskUrl(dbUrl)} (${useSsl(dbUrl) ? 'ssl' : 'no ssl'})`);

const sql = postgres(dbUrl, {
  ssl: useSsl(dbUrl) ? 'require' : false,
  prepare: false,
  connect_timeout: 10,
});

try {
  const [ping] = await sql`SELECT 1 as ok`;
  console.log(`ok db ping: ${ping.ok}`);

  const tables = await sql`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'conversations', 'messages', 'deals', 'citation_registry', 'model_registry', 'audit_trail')
    ORDER BY tablename
  `;
  console.log(`ok core tables: ${tables.map((r) => r.tablename).join(', ') || 'none found'}`);

  const [migration] = await sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = '_migrations'
    ) as exists
  `;
  if (migration.exists) {
    const rows = await sql`
      SELECT name FROM _migrations
      WHERE name IN ('067_v19_foundation.sql')
      ORDER BY name
    `;
    console.log(`${rows.length ? 'ok' : 'warn'} V19 migration 067 ${rows.length ? 'applied' : 'not recorded yet'}`);
  } else {
    console.log('warn _migrations table not present yet; start the API once to auto-run migrations');
  }

  const [admin] = await sql`
    SELECT u.email, u.role, u.plan, u.is_advisor, s.plan AS subscription_plan, s.status AS subscription_status
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE lower(u.email) = ${adminEmail}
    LIMIT 1
  `;
  if (admin) {
    const ready = admin.role === 'superadmin' && admin.plan === 'enterprise';
    console.log(`${ready ? 'ok' : 'warn'} superadmin: ${admin.email} role=${admin.role} plan=${admin.plan} subscription=${admin.subscription_plan || 'none'}/${admin.subscription_status || 'none'} advisor=${admin.is_advisor}`);
  } else {
    console.log(`warn superadmin missing: run npm run dev:seed for ${adminEmail}`);
  }

  const users = await sql`
    SELECT email FROM users
    WHERE email IN ('seller@test.com', 'buyer@test.com', 'advisor@test.com')
    ORDER BY email
  `;
  console.log(`${users.length ? 'ok' : 'skip'} optional persona users: ${users.map((r) => r.email).join(', ') || 'not seeded'}`);
} catch (err) {
  console.error(`fail db check: ${err.message}`);
  process.exitCode = 1;
} finally {
  await sql.end();
}

if (process.env.DEV_HEALTH_TEST_AI === 'true' && process.env.ANTHROPIC_API_KEY) {
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Reply with: Yulia dev ok' }],
    });
    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    console.log(`ok Anthropic: ${text}`);
  } catch (err) {
    console.error(`fail Anthropic: ${err.message}`);
    process.exitCode = 1;
  }
} else {
  console.log('skip Anthropic live call (set DEV_HEALTH_TEST_AI=true to test it)');
}
