import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

const connectionString = process.env.DATABASE_URL!;
const isInternal = connectionString.includes('railway.internal');

if (!connectionString) {
  console.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

console.log(`Database: connecting to ${isInternal ? 'internal' : 'external'} (${connectionString.split('@')[1]?.split('/')[0] || 'unknown host'})`);

const client = postgres(connectionString, {
  ssl: isInternal ? false : 'require',
  connect_timeout: 10,
  onnotice: () => {},
});

export const db = drizzle(client, { schema });
