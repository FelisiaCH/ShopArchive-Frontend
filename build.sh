#!/usr/bin/env bash
# Builds the app and says where to copy the result for the backend to serve.
set -euo pipefail

cd "$(dirname "$0")"

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

npm run build

dist="$(cd dist && pwd)"
# The backend serves these files itself, so there is one origin. Point this at that repository's
# static directory; the default assumes the two repositories sit side by side.
destination="${SHOPARCHIVE_BACKEND_PUBLIC:-$(cd .. && pwd)/ShopArchive-Backend/public}"

echo
echo "Built: $dist"
echo
echo "Copy the contents into the backend's static directory:"
echo
echo "  mkdir -p \"$destination\" && cp -R \"$dist/.\" \"$destination/\""
echo
echo "Asset filenames carry a content hash, so an older build's files are ignored rather than"
echo "served. Empty the directory first if you want it to match this build exactly."
echo
if [ ! -d "$destination" ]; then
  echo "That directory does not exist on this machine yet."
  echo "Set SHOPARCHIVE_BACKEND_PUBLIC=/path/to/backend/public to point this at the real one."
fi
