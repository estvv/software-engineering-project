#!/usr/bin/env bash
# System check of the Docker deployment (Week 12, issue #35).
# Starts app + PostgreSQL with docker compose, checks in at T1, restarts the
# app container, and checks that T1 is still occupied, then checks out.
# Usage: bash scripts/compose_smoke.sh        (uses a throwaway project and volume)
set -euo pipefail
cd "$(dirname "$0")/.."

export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-seattogether-smoke}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-smoke-test-only}
export APP_PORT=${APP_PORT:-3456}
BASE="http://localhost:$APP_PORT/api/tables"
BUILD_FLAG=--build
[ -n "${SMOKE_NO_BUILD:-}" ] && BUILD_FLAG=--no-build   # CI: image already built

cleanup() { docker compose down -v --remove-orphans >/dev/null 2>&1 || true; }
trap cleanup EXIT

pass=0; fail=0
check() { # description, expected, actual
  if [ "$2" = "$3" ]; then echo "  ok    $1"; pass=$((pass + 1));
  else echo "  FAIL  $1: expected '$2', got '$3'"; fail=$((fail + 1)); fi
}
wait_ready() {
  for _ in $(seq 1 60); do curl -sf "$BASE" >/dev/null && return 0; sleep 1; done
  echo "app did not answer on $BASE"; docker compose logs app; exit 1
}
status_of() { curl -s "$BASE" | grep -o "\"id\":\"$1\",[^}]*" | grep -o '"status":"[a-z]*"' | cut -d'"' -f4; }

echo "== docker compose up ($COMPOSE_PROJECT_NAME, port $APP_PORT)"
docker compose up -d $BUILD_FLAG --wait
wait_ready

echo "== check-in at T1"
out=$(curl -s -w '\n%{http_code}' -X POST "$BASE/T1/checkin")
check "check-in returns 201" 201 "$(tail -n1 <<<"$out")"
token=$(head -n1 <<<"$out" | grep -o '"checkinToken":"[^"]*"' | cut -d'"' -f4)
check "T1 is occupied" occupied "$(status_of T1)"

echo "== restart the app container (the database keeps running)"
docker compose restart app >/dev/null
wait_ready
check "T1 is still occupied after the restart (#35)" occupied "$(status_of T1)"

echo "== check-out with the token"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
  -d "{\"checkinToken\":\"$token\"}" "$BASE/T1/checkout")
check "check-out returns 200" 200 "$code"
check "T1 is free" free "$(status_of T1)"

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
