import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { walletBlocks, menuItems } from '../shared/schema.js';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  console.log('Seeding wallet blocks...');
  await db.insert(walletBlocks).values([
    { name: 'Exploratory', priceCents: 5000, creditsCents: 5000, bonusPercent: 0, sortOrder: 1 },
    { name: 'Early Commit', priceCents: 10000, creditsCents: 10500, bonusPercent: 5, sortOrder: 2 },
    { name: 'Active Deal', priceCents: 25000, creditsCents: 26500, bonusPercent: 6, sortOrder: 3 },
    { name: 'Serious', priceCents: 50000, creditsCents: 54000, bonusPercent: 8, sortOrder: 4 },
    { name: 'Full Journey', priceCents: 100000, creditsCents: 110000, bonusPercent: 10, sortOrder: 5 },
    { name: 'Advisor', priceCents: 250000, creditsCents: 280000, bonusPercent: 12, sortOrder: 6 },
  ]);

  console.log('Seeding menu items...');
  await db.insert(menuItems).values([
    // Analyst tier
    { name: 'Financial Spread', tier: 'analyst', basePriceCents: 1000, journeyType: 'sell', gate: 'S1', category: 'financial', sortOrder: 1 },
    { name: 'Add-Back Analysis', tier: 'analyst', basePriceCents: 1000, journeyType: 'sell', gate: 'S1', category: 'financial', sortOrder: 2 },
    { name: 'Quick Valuation', tier: 'analyst', basePriceCents: 1500, journeyType: 'sell', gate: 'S2', category: 'valuation', sortOrder: 3 },
    { name: 'Blind Teaser', tier: 'analyst', basePriceCents: 1500, journeyType: 'sell', gate: 'S3', category: 'packaging', sortOrder: 4 },
    { name: 'Data Room Structure', tier: 'analyst', basePriceCents: 1000, journeyType: 'sell', gate: 'S3', category: 'packaging', sortOrder: 5 },
    { name: 'Executive Summary', tier: 'analyst', basePriceCents: 1500, journeyType: 'sell', gate: 'S3', category: 'packaging', sortOrder: 6 },
    { name: 'Deal Scoring', tier: 'analyst', basePriceCents: 1000, journeyType: 'buy', gate: 'B1', category: 'sourcing', sortOrder: 7 },
    { name: 'DD Checklist', tier: 'analyst', basePriceCents: 1500, journeyType: 'buy', gate: 'B3', category: 'diligence', sortOrder: 8 },
    { name: 'Outreach Strategy', tier: 'analyst', basePriceCents: 2000, journeyType: 'sell', gate: 'S4', category: 'matching', sortOrder: 9 },

    // Associate tier
    { name: 'Full Valuation Report', tier: 'associate', basePriceCents: 5000, journeyType: 'sell', gate: 'S2', category: 'valuation', sortOrder: 10 },
    { name: 'CIM', tier: 'associate', basePriceCents: 7500, journeyType: 'sell', gate: 'S3', category: 'packaging', sortOrder: 11 },
    { name: 'Buyer List', tier: 'associate', basePriceCents: 4000, journeyType: 'sell', gate: 'S4', category: 'matching', sortOrder: 12 },
    { name: 'Acquisition Model', tier: 'associate', basePriceCents: 6000, journeyType: 'buy', gate: 'B2', category: 'valuation', sortOrder: 13 },
    { name: 'Investor Materials Package', tier: 'associate', basePriceCents: 7500, journeyType: 'raise', gate: 'R2', category: 'packaging', sortOrder: 14 },
    { name: 'Deal Structure Analysis', tier: 'associate', basePriceCents: 5000, journeyType: 'sell', gate: 'S5', category: 'closing', sortOrder: 15 },
    { name: 'Working Capital Analysis', tier: 'associate', basePriceCents: 5000, journeyType: 'sell', gate: 'S5', category: 'closing', sortOrder: 16 },
    { name: 'Closing Checklist', tier: 'associate', basePriceCents: 4000, journeyType: 'sell', gate: 'S5', category: 'closing', sortOrder: 17 },

    // VP tier
    { name: 'Institutional CIM', tier: 'vp', basePriceCents: 20000, journeyType: 'sell', gate: 'S3', category: 'packaging', sortOrder: 18 },
    { name: 'LBO Model', tier: 'vp', basePriceCents: 25000, journeyType: 'buy', gate: 'B2', category: 'valuation', sortOrder: 19 },
    { name: 'Funds Flow Statement', tier: 'vp', basePriceCents: 15000, journeyType: 'sell', gate: 'S5', category: 'closing', sortOrder: 20 },
    { name: 'Full Pitch Deck', tier: 'vp', basePriceCents: 20000, journeyType: 'raise', gate: 'R2', category: 'packaging', sortOrder: 21 },
    { name: 'Integration Plan', tier: 'vp', basePriceCents: 15000, journeyType: 'pmi', gate: 'PMI1', category: 'integration', sortOrder: 22 },
    { name: 'Value Creation Plan', tier: 'vp', basePriceCents: 20000, journeyType: 'pmi', gate: 'PMI3', category: 'optimization', sortOrder: 23 },
  ]);

  console.log('Seed complete.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
