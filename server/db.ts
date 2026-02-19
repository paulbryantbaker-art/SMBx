import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

const isInternal = connectionString.includes('railway.internal');

console.log(`Database: ${isInternal ? 'internal' : 'external'} → ${connectionString.split('@')[1]?.split('/')[0] || 'unknown host'}`);

export const sql = postgres(connectionString, {
  ssl: isInternal ? false : 'require',
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });

export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as ok`;
    console.log('DB connected:', result[0]?.ok === 1 ? 'OK' : 'unexpected result');
  } catch (err) {
    console.error('DB connection failed:', err);
  }
}
