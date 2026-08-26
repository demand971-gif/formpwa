#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/android/app/src/main/assets"

echo "==> Syncing web assets to Android project..."
mkdir -p "$ASSETS_DIR"

# Copy root web files
cp -f "$ROOT_DIR/index.html" "$ASSETS_DIR/"
cp -f "$ROOT_DIR/offline.html" "$ASSETS_DIR/"
cp -f "$ROOT_DIR/manifest.json" "$ASSETS_DIR/"
cp -f "$ROOT_DIR/manifest.webmanifest" "$ASSETS_DIR/"
cp -f "$ROOT_DIR/sw.js" "$ASSETS_DIR/"

# Sync directories
rm -rf "$ASSETS_DIR/icons" "$ASSETS_DIR/media"
cp -r "$ROOT_DIR/icons" "$ASSETS_DIR/"
cp -r "$ROOT_DIR/media" "$ASSETS_DIR/"

echo "==> Web assets successfully synced to $ASSETS_DIR"
