#!/usr/bin/env bash
set -euo pipefail

DB_URL="${DATABASE_URL:-postgres://smbx:smbx@localhost:5432/smbx}"
MIGRATIONS_DIR="$(cd "$(dirname "$0")/../server/migrations" && pwd)"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Running migrations against: ${DB_URL%%@*}@*** ==="

# Run all .sql migrations in order
for f in "$MIGRATIONS_DIR"/*.sql; do
  name=$(basename "$f")
  echo "  -> $name"
  psql "$DB_URL" -f "$f" -v ON_ERROR_STOP=0 --quiet 2>&1 | grep -v "^NOTICE:" || true
done

echo ""
echo "=== Running seed scripts ==="

# NAICS benchmarks
echo "  -> seed-naics-benchmarks.sql"
psql "$DB_URL" -f "$SCRIPTS_DIR/seed-naics-benchmarks.sql" -v ON_ERROR_STOP=0 --quiet 2>&1 | grep -v "^NOTICE:" || true

# Closed deals
echo "  -> seed-closed-deals.js"
DATABASE_URL="$DB_URL" node "$SCRIPTS_DIR/seed-closed-deals.js" 2>&1 || true

echo ""
echo "=== All migrations and seeds complete ==="
