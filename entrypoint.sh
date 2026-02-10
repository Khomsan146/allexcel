#!/bin/sh
set -e

# Ensure the database file exists and has correct schema
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# Execute the main command
exec "$@"
