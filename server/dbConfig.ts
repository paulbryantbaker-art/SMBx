import postgres from 'postgres';

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

export function shouldUseDatabaseSsl(url = getDatabaseUrl()): boolean {
  if (process.env.DATABASE_SSL === 'true') return true;
  if (process.env.DATABASE_SSL === 'false') return false;
  return /railway|rlwy|render|supabase|neon|amazonaws/i.test(url);
}

export function getPostgresOptions(url = getDatabaseUrl()) {
  return {
    ssl: shouldUseDatabaseSsl(url) ? 'require' : false as any,
    prepare: false,
    connect_timeout: 10,
  };
}

export function createSql(url = getDatabaseUrl()) {
  return postgres(url, getPostgresOptions(url));
}

export function maskDatabaseUrl(url = getDatabaseUrl()): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username ? `${parsed.username}:***@` : ''}${parsed.host}${parsed.pathname}`;
  } catch {
    return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  }
}
