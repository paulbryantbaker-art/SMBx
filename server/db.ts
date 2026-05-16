import postgres from 'postgres';
import { getDatabaseUrl, getPostgresOptions, maskDatabaseUrl, shouldUseDatabaseSsl } from './dbConfig.js';

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

console.log(`Database: ${shouldUseDatabaseSsl(connectionString) ? 'ssl' : 'local'} -> ${maskDatabaseUrl(connectionString)}`);

export const sql = postgres(getDatabaseUrl(), getPostgresOptions());

export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as ok`;
    console.log('DB connected:', result[0]?.ok === 1 ? 'OK' : 'unexpected result');
  } catch (err: any) {
    console.error('DB connection failed:', err.message);
  }
}
