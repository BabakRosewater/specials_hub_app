#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="dist/campaign-pack"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/data" "$OUT_DIR/assets"

cp index.html "$OUT_DIR/specials.htm"
cp app.js "$OUT_DIR/app.js"
cp data/specials.json "$OUT_DIR/data/specials.json"

# Copy templates as starting point for campaign ops
cp templates/campaign-manifest.example.json "$OUT_DIR/campaign-manifest.json"
cp templates/utm-map.example.csv "$OUT_DIR/utm-map.csv"
cp templates/publish-checklist.example.md "$OUT_DIR/publish-checklist.md"

echo "Campaign pack created at: $OUT_DIR"
