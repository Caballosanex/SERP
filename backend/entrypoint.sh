#!/bin/bash

#Making Migrations
echo "Migrating DB"

# Set the maximum number of retries (optional)
MAX_RETRIES=7
RETRY_INTERVAL=5  # Wait time in seconds before retrying

attempt=1

echo "Waiting for database connection..."

while [ $attempt -le $MAX_RETRIES ]; do
    alembic upgrade head && echo "Migration successful!" && exit 0
    echo "Database not ready yet. Retrying in $RETRY_INTERVAL seconds... (Attempt: $attempt)"
    attempt=$((attempt + 1))
    sleep $RETRY_INTERVAL
done
#Starting Server
echo "Starting Server"
uvicorn main:app --host 0.0.0.0 --port 5001 --reload