#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/android/app/src/main/assets"

echo "==> Building web app (Vite + React)..."
cd "$ROOT_DIR"
if [ ! -d node_modules ]; then
  echo "==> Installing npm dependencies..."
  npm ci --no-fund --no-audit
fi
npm run build

echo "==> Syncing dist/ to Android assets..."
rm -rf "$ASSETS_DIR"
mkdir -p "$ASSETS_DIR"
cp -r "$ROOT_DIR/dist/." "$ASSETS_DIR/"

echo "==> Web assets successfully synced to $ASSETS_DIR"
