#!/usr/bin/env node
/**
 * Seed the 500 Paul Baker sample deals into one explicit existing user.
 *
 * Usage:
 *   DEMO_SEED_USER_EMAIL=paul@example.com node scripts/seed-demo-user-data.mjs
 *
 * Optional:
 *   DEMO_SEED_PLAN=professional          # free|starter|professional|enterprise
 *   DEMO_SEED_TRIAL_DAYS=90              # keeps doc generation open for testing
 *   DEMO_SEED_CREATE_USER=true           # creates the user if missing
 *   DEMO_SEED_DRY_RUN=true               # report only
 */
import postgres from "postgres";
import XLSX from "xlsx";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const XLSX_PATH = resolve(ROOT, "SMBX_SAMPLE_DEALS_500_PAUL_BAKER.xlsx");

const targetEmail = (process.env.DEMO_SEED_USER_EMAIL || process.argv[2] || "").trim().toLowerCase();
const displayName = process.env.DEMO_SEED_DISPLAY_NAME || "Paul Baker";
const plan = process.env.DEMO_SEED_PLAN || "professional";
const trialDays = Number(process.env.DEMO_SEED_TRIAL_DAYS || 90);
const createUser = process.env.DEMO_SEED_CREATE_USER === "true";
const dryRun = process.env.DEMO_SEED_DRY_RUN === "true";

if (!targetEmail) {
  console.error("DEMO_SEED_USER_EMAIL is required.");
  process.exit(1);
}
if (!["free", "starter", "professional", "enterprise"].includes(plan)) {
  console.error(`Invalid DEMO_SEED_PLAN: ${plan}`);
  process.exit(1);
}

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL or DATABASE_PUBLIC_URL is required.");
  process.exit(1);
}

const isRemote = /railway|rlwy|render|supabase|neon|amazonaws/i.test(connectionString);
const sql = postgres(connectionString, {
  ssl: isRemote ? "require" : false,
  prepare: false,
  connect_timeout: 15,
});

const JOURNEY_FROM_DEAL_TYPE = {
  Sell: "sell",
  Divest: "sell",
  Buy: "buy",
  Merge: "buy",
  Raise: "raise",
};

const STATUS_RULES = {
  Prospect: { gate: 0, status: "active" },
  "Initial Conversation": { gate: 0, status: "active" },
  "Due Diligence": { gate: 3, status: "active" },
  "LOI Stage": { gate: 4, status: "active" },
  "Closing Soon": { gate: 5, status: "active" },
  Closed: { gate: 5, status: "closed" },
  Stalled: { gate: null, status: "stalled" },
};

const GATE_PREFIX = { sell: "S", buy: "B", raise: "R", pmi: "PMI" };

function dollarsStringToCents(value) {
  if (value == null) return null;
  const n = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

function multipleStringToNumber(value) {
  if (value == null) return null;
  const n = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function deriveGate(journey, statusLabel) {
  const rule = STATUS_RULES[statusLabel];
  if (!rule || rule.gate == null) return null;
  return `${GATE_PREFIX[journey] || "S"}${rule.gate}`;
}

function deriveStatus(statusLabel) {
  return STATUS_RULES[statusLabel]?.status || "active";
}

function readRecords() {
  const wb = XLSX.readFile(XLSX_PATH);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets.Deals, { defval: null });
  return rows.map((row) => {
    const dealType = row["Deal Type"];
    const journey = JOURNEY_FROM_DEAL_TYPE[dealType] || "sell";
    const statusLabel = row.Status;
    return {
      sample_id: row["Deal ID"],
      business_name: row["Company Name"],
      location: row.Location,
      industry: row.Industry,
      journey_type: journey,
      current_gate: deriveGate(journey, statusLabel),
      league: row.League,
      sde_cents: dollarsStringToCents(row["EBITDA/SDE ($)"]),
      revenue_cents: dollarsStringToCents(row["Revenue ($)"]),
      asking_cents: dollarsStringToCents(row["Enterprise Value ($)"]),
      multiple: multipleStringToNumber(row["EV/EBITDA Multiple"]),
      deal_status: deriveStatus(statusLabel),
      exit_type: row["Transaction Type"],
      deal_type_label: dealType,
      status_label: statusLabel,
      notes: row.Notes,
      est_close: row["Est. Close Date"],
      created_at: row["Created Date"],
    };
  });
}

async function ensureUser() {
  const [existing] = await sql`SELECT id, email FROM users WHERE lower(email) = ${targetEmail} LIMIT 1`;
  if (existing) return existing;
  if (dryRun) {
    throw new Error(`User ${targetEmail} does not exist. Dry run will not create users.`);
  }
  if (!createUser) {
    throw new Error(`User ${targetEmail} does not exist. Have them sign up first, or set DEMO_SEED_CREATE_USER=true.`);
  }
  const trialEnd = Number.isFinite(trialDays) && trialDays > 0
    ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
    : null;
  const [created] = await sql`
    INSERT INTO users (email, display_name, role, is_advisor, league, plan, trial_ends_at)
    VALUES (${targetEmail}, ${displayName}, 'user', true, 'L4', ${plan}, ${trialEnd})
    RETURNING id, email
  `;
  return created;
}

async function grantPlan(userId) {
  const trialEnd = Number.isFinite(trialDays) && trialDays > 0
    ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
    : null;

  await sql`
    UPDATE users
    SET is_advisor = true,
        display_name = COALESCE(NULLIF(display_name, ''), ${displayName}),
        league = COALESCE(league, 'L4'),
        plan = ${plan},
        trial_ends_at = ${trialEnd},
        updated_at = NOW()
    WHERE id = ${userId}
  `.catch(async (err) => {
    console.warn(`Plan update warning: ${err.message}`);
    await sql`
      UPDATE users
      SET is_advisor = true,
          display_name = COALESCE(NULLIF(display_name, ''), ${displayName}),
          league = COALESCE(league, 'L4'),
          updated_at = NOW()
      WHERE id = ${userId}
    `;
  });

  await sql`
    INSERT INTO subscriptions (user_id, plan, status, trial_end, trial_ends_at, created_at, updated_at)
    VALUES (${userId}, ${plan}, 'trialing', ${trialEnd}, ${trialEnd}, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      trial_end = EXCLUDED.trial_end,
      trial_ends_at = EXCLUDED.trial_ends_at,
      updated_at = NOW()
  `.catch((err) => {
    console.warn(`Subscription upsert warning: ${err.message}`);
  });
}

async function seedDeals(userId, records) {
  let inserted = 0;
  let skipped = 0;
  for (const record of records) {
    const [existing] = await sql`
      SELECT id FROM deals
      WHERE user_id = ${userId}
        AND financials->>'sample_id' = ${record.sample_id}
      LIMIT 1
    `;
    if (existing) {
      skipped += 1;
      continue;
    }
    if (!dryRun) {
      await sql`
        INSERT INTO deals (
          user_id, journey_type, current_gate, league, industry, location,
          business_name, name, revenue, sde, ebitda, asking_price, exit_type,
          financials, status, created_at, updated_at
        )
        VALUES (
          ${userId}, ${record.journey_type}, ${record.current_gate}, ${record.league},
          ${record.industry}, ${record.location}, ${record.business_name}, ${record.business_name},
          ${record.revenue_cents}, ${record.sde_cents}, ${record.sde_cents},
          ${record.asking_cents}, ${record.exit_type},
          ${sql.json({
            sample_id: record.sample_id,
            deal_type_label: record.deal_type_label,
            status_label: record.status_label,
            multiple: record.multiple,
            notes: record.notes,
            est_close: record.est_close,
            seed_source: "SMBX_SAMPLE_DEALS_500_PAUL_BAKER",
          })},
          ${record.deal_status},
          COALESCE(NULLIF(${record.created_at}, '')::timestamptz, NOW()),
          NOW()
        )
      `;
    }
    inserted += 1;
  }
  return { inserted, skipped };
}

async function main() {
  const records = readRecords();
  const user = await ensureUser();
  console.log(`Target user: ${user.email} (id=${user.id})`);
  console.log(`Sample records: ${records.length}`);
  if (!dryRun) await grantPlan(user.id);
  const result = await seedDeals(user.id, records);
  const [count] = await sql`
    SELECT COUNT(*)::int AS c
    FROM deals
    WHERE user_id = ${user.id}
      AND financials->>'seed_source' = 'SMBX_SAMPLE_DEALS_500_PAUL_BAKER'
  `;
  console.log(JSON.stringify({ ...result, totalSeededForUser: count?.c ?? 0, dryRun }, null, 2));
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 }).catch(() => {});
  });
