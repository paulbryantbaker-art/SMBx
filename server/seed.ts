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

  console.log('Seeding menu items...');
  await client`
    INSERT INTO menu_items (name, tier, base_price_cents, journey_type, gate, category, sort_order) VALUES
      ('Financial Spread',           'analyst',    1000, 'sell',  'S1',   'financial',    1),
      ('Add-Back Analysis',          'analyst',    1000, 'sell',  'S1',   'financial',    2),
      ('Quick Valuation',            'analyst',    1500, 'sell',  'S2',   'valuation',    3),
      ('Blind Teaser',               'analyst',    1500, 'sell',  'S3',   'packaging',    4),
      ('Data Room Structure',        'analyst',    1000, 'sell',  'S3',   'packaging',    5),
      ('Executive Summary',          'analyst',    1500, 'sell',  'S3',   'packaging',    6),
      ('Deal Scoring',               'analyst',    1000, 'buy',   'B1',   'sourcing',     7),
      ('DD Checklist',               'analyst',    1500, 'buy',   'B3',   'diligence',    8),
      ('Outreach Strategy',          'analyst',    2000, 'sell',  'S4',   'matching',     9),
      ('Full Valuation Report',      'associate',  5000, 'sell',  'S2',   'valuation',   10),
      ('CIM',                        'associate',  7500, 'sell',  'S3',   'packaging',   11),
      ('Buyer List',                 'associate',  4000, 'sell',  'S4',   'matching',    12),
      ('Acquisition Model',          'associate',  6000, 'buy',   'B2',   'valuation',   13),
      ('Investor Materials Package', 'associate',  7500, 'raise', 'R2',   'packaging',   14),
      ('Deal Structure Analysis',    'associate',  5000, 'sell',  'S5',   'closing',     15),
      ('Working Capital Analysis',   'associate',  5000, 'sell',  'S5',   'closing',     16),
      ('Closing Checklist',          'associate',  4000, 'sell',  'S5',   'closing',     17),
      ('Institutional CIM',          'vp',        20000, 'sell',  'S3',   'packaging',   18),
      ('LBO Model',                  'vp',        25000, 'buy',   'B2',   'valuation',   19),
      ('Funds Flow Statement',       'vp',        15000, 'sell',  'S5',   'closing',     20),
      ('Full Pitch Deck',            'vp',        20000, 'raise', 'R2',   'packaging',   21),
      ('Integration Plan',           'vp',        15000, 'pmi',   'PMI1', 'integration', 22),
      ('Value Creation Plan',        'vp',        20000, 'pmi',   'PMI3', 'optimization',23)
    ON CONFLICT DO NOTHING
  `;

  console.log('Seed complete.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
