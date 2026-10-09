#!/usr/bin/env bash
# Intentwall Concurrent Dev Runner
set -e

echo "🚀 Starting Intentwall FastAPI Backend on http://localhost:8000..."
PYTHONPATH=. ./.venv/bin/uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

echo "✨ Starting Intentwall Next.js Frontend on http://localhost:3000..."
cd apps/web && npm_config_cache=../../.npm-cache npm run dev &
WEB_PID=$!

trap "kill $API_PID $WEB_PID 2>/dev/null || true" EXIT INT TERM

wait
