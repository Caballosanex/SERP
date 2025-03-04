#!/bin/bash

#Making Migrations
echo "Migrating DB"


until alembic upgrade head
do
  echo "Try again"
  sleep 5
done

#Starting Server
echo "Starting Server"
uvicorn main:app --host 0.0.0.0 --port 5001 --reload