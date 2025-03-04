#!/bin/bash

#Making Migrations
echo "Migrating DB"
alembic upgrade head
#Starting Server
echo "Starting Server"
uvicorn main:app --host 0.0.0.0 --port 5001 --reload