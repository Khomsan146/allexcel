#!/bin/sh
set -e

# Support DATABASE_URL from environment or fallback to default path
export DATABASE_URL="${DATABASE_URL:-file:/app/data/checklist.db}"

echo "Database URL is: $DATABASE_URL"

# Ensure the database file exists and has correct schema
echo "Running database migrations..."
if ! npx prisma db push --accept-data-loss; then
  echo "Migration failed, but attempting to start app anyway..."
fi

# Execute the main command
exec "$@"
