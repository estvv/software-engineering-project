#!/usr/bin/env bash
# Manual API check (docs/evidence/2026-10-15_api_manual_check.md).
# Builds the app, starts it on a free port, sends the 6 requests,
# prints expected vs actual, then stops the server.
# Usage: bash scripts/api_check.sh
set -u
cd "$(dirname "$0")/.."

PORT=${PORT:-3123}
BASE="http://localhost:$PORT/api/tables"
LOG=$(mktemp)

echo "== npm run build"
npm run build >"$LOG" 2>&1 || { echo "build failed, see $LOG"; exit 1; }

npx next start -p "$PORT" >>"$LOG" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
for _ in $(seq 1 40); do curl -s "$BASE" >/dev/null && break; sleep 0.5; done

pass=0
check() { # step, description, expected status, actual status, body
  local ok="FAIL"; [ "$3" = "$4" ] && ok="ok" && pass=$((pass + 1))
  printf '\n%s. %s\n   expected HTTP %s, got HTTP %s  [%s]\n   %s\n' "$1" "$2" "$3" "$4" "$ok" "$5"
}
req() { # method path [json body] -> sets CODE and BODY
  local out
  if [ $# -ge 3 ]; then
    out=$(curl -s -w '\n%{http_code}' -X "$1" -H 'Content-Type: application/json' -d "$3" "$BASE$2")
  else
    out=$(curl -s -w '\n%{http_code}' -X "$1" "$BASE$2")
  fi
  CODE=${out##*$'\n'}
  BODY=${out%$'\n'*}
}

echo "== date: $(date -Iseconds)  commit: $(git rev-parse --short HEAD)  user: $(git config user.name)"

req POST /T1/checkin
TOKEN=$(printf '%s' "$BODY" | sed -n 's/.*"checkinToken":"\([^"]*\)".*/\1/p')
check 1 "check-in T1 (S2-AC1)" 201 "$CODE" "$BODY"

req GET ""
T1=$(printf '%s' "$BODY" | grep -o '"id":"T1"[^}]*' )
check 2 "T1 shown occupied on the map" 200 "$CODE" "$T1"

req POST /T1/checkin
check 3 "second check-in at T1 (R1)" 409 "$CODE" "$BODY"

req POST /T1/checkout '{"checkinToken":"x"}'
check 4 "check-out with a wrong token (security)" 403 "$CODE" "$BODY"

req POST /T1/checkout "{\"checkinToken\":\"$TOKEN\"}"
check 5 "check-out with the right token (S2-AC2)" 200 "$CODE" "$BODY"

req POST /T99/checkin
check 6 "unknown table" 404 "$CODE" "$BODY"

printf '\n== %s/6 checks passed\n' "$pass"
[ "$pass" -eq 6 ]
