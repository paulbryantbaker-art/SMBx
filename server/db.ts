import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

const isRailway = connectionString.includes('rlwy.net') || connectionString.includes('railway');

console.log(`Database: ${isRailway ? 'railway' : 'local'} → ${connectionString.split('@')[1]?.split('/')[0] || 'unknown host'}`);

export const sql = postgres(connectionString, {
  ssl: isRailway ? 'require' : false,
  prepare: false,
  connect_timeout: 10,
});

export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as ok`;
    console.log('DB connected:', result[0]?.ok === 1 ? 'OK' : 'unexpected result');
  } catch (err: any) {
    console.error('DB connection failed:', err.message);
  }
}
