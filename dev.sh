#!/usr/bin/env bash
# Starts the development server and proxies /api to the backend.
#
# Failures are explained rather than returned: a missing toolchain or a taken port should produce a
# sentence saying what to fix.
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-5173}"
API_URL="${SHOPARCHIVE_API_URL:-http://127.0.0.1:3000}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node is not installed, or not on this shell's PATH. This app needs Node 22 or newer." >&2
  exit 1
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$node_major" -lt 22 ]; then
  echo "Node $(node -v) is too old. This app needs Node 22 or newer." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)…"
  npm install
fi

if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Stop whatever is on it, or run PORT=5174 ./dev.sh." >&2
  exit 1
fi

echo "API requests to /api are proxied to $API_URL"
echo "Override with: SHOPARCHIVE_API_URL=http://<host>:<port> ./dev.sh"
echo "The backend is not required for the scaffold; without it, /api requests fail and nothing else does."
echo

# --host makes the server reachable from the shop's phones and tablets, and Vite prints the LAN
# address to open on them.
SHOPARCHIVE_API_URL="$API_URL" exec npm run dev -- --host --port "$PORT"
