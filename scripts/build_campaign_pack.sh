#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="dist/campaign-pack"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/data" "$OUT_DIR/assets"

cp index.html "$OUT_DIR/specials.htm"
cp app.js "$OUT_DIR/app.js"
cp specials-preview.html "$OUT_DIR/specials-preview.html"
cp offers-tool.html "$OUT_DIR/offers-tool.html"
cp offers-tool.js "$OUT_DIR/offers-tool.js"
mkdir -p "$OUT_DIR/admin"
cp admin/index.html "$OUT_DIR/admin/index.html"
cp admin/admin.js "$OUT_DIR/admin/admin.js"
cp data/specials.json "$OUT_DIR/data/specials.json"

# Copy templates as starting point for campaign ops
cp templates/campaign-manifest.example.json "$OUT_DIR/campaign-manifest.json"
cp templates/utm-map.example.csv "$OUT_DIR/utm-map.csv"
cp templates/publish-checklist.example.md "$OUT_DIR/publish-checklist.md"

echo "Campaign pack created at: $OUT_DIR"
