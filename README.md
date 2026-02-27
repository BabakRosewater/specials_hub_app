# Specials Hub App

A data-driven frontend for dealership specials that renders offer content from a single JSON source.

This repository is designed to support:
- one canonical offer destination (`specials.htm`)
- consistent messaging/disclaimers across paid channels
- repeatable campaign handoff to implementation teams

---

## Table of Contents

1. [What this app does](#what-this-app-does)
2. [How the app works](#how-the-app-works)
3. [Repository structure](#repository-structure)
4. [File-by-file documentation](#file-by-file-documentation)
5. [Offers Tool (front-end campaign editor)](#offers-tool-front-end-campaign-editor)
6. [Run locally](#run-locally)
7. [Monthly/weekly update workflow](#monthlyweekly-update-workflow)
8. [Build a campaign handoff package](#build-a-campaign-handoff-package)
9. [Data model overview (`data/specials.json`)](#data-model-overview-dataspecialsjson)
10. [Operational governance recommendations](#operational-governance-recommendations)
11. [Troubleshooting](#troubleshooting)

---

## What this app does

The app renders a full Specials Hub page from `data/specials.json` instead of hardcoding offers in HTML.

This allows your team to:
- update offers in one place
- keep legal/disclaimer text centralized
- keep paid search/social/TV messaging aligned to one destination
- hand off a consistent deployment package to web implementation teams

---

## How the app works

1. `index.html` provides layout shell and mount points (`#hero`, `#content`, `#footer`, `#printFooter`).
2. `app.js` fetches `data/specials.json` with `no-store` cache behavior and renders each section type.
3. Rendering is type-based (`finance`, `leaseGrid`, `purchaseGrid`, `serviceCoupons`, `ctaSplit`).
4. Coupon print behavior is wired to a print button.
5. A fallback error panel renders when JSON fails to load.

---

## Repository structure

```txt
.
├── app.js
├── data/
│   └── specials.json
├── docs/
│   └── CAMPAIGN_PACK_SPEC.md
├── index.html
├── offers-tool.html
├── offers-tool.js
├── scripts/
│   └── build_campaign_pack.sh
├── templates/
│   ├── campaign-manifest.example.json
│   ├── publish-checklist.example.md
│   └── utm-map.example.csv
└── README.md
```

---

## File-by-file documentation

### `index.html`
Static shell page. Contains:
- Tailwind and Font Awesome includes
- shared style rules (including print styles)
- render mount points
- script include for `app.js`

You should rarely need to edit this file unless changing base layout/styling behavior.

### `app.js`
Client renderer and runtime logic.

### `offers-tool.html`
Browser-based internal editor UI for campaign operations.

Provides:
- load current `data/specials.json`
- import external JSON
- validate/format JSON
- download deployment-ready `specials.json`

### `offers-tool.js`
Client logic for the Offers Tool actions and validation flow.


Key responsibilities:
- Fetches JSON data
- Escapes content for safe HTML rendering (`safe`, `esc`, `money`)
- Renders all section types
- Wires print button for service coupons
- Handles JSON load errors

Renderer functions include:
- `renderHero`
- `renderFinanceSection`
- `renderLeaseGrid`
- `renderPurchaseGrid`
- `renderServiceCoupons`
- `renderCtaSplit`
- `renderFooter`

### `data/specials.json`
Single Source of Truth for campaign content.

Contains:
- page meta
- hero navigation cards
- sections and cards
- disclaimers and print footer
- dealer footer contact info

This is the main file to update for offer changes.

### `docs/CAMPAIGN_PACK_SPEC.md`
Operating and handoff spec for campaign publishing.

Documents:
- canonical destination strategy
- package contents
- governance and ownership
- UTM standards
- cadence and KPI scorecard expectations

### `scripts/build_campaign_pack.sh`
Build script that creates a ready-to-share handoff package under `dist/campaign-pack`.

Outputs:
- `specials.htm` (copied from `index.html`)
- `app.js`
- `offers-tool.html`
- `offers-tool.js`
- `data/specials.json`
- starter campaign ops files copied from `templates/`

### `templates/campaign-manifest.example.json`
Template for campaign metadata and approvals:
- campaign ID/name/dates
- owner/backup owner
- approvals
- canonical destination URLs

### `templates/utm-map.example.csv`
Template for channel-level URL governance and attribution:
- paid search/social/broadcast rows
- UTM naming and final URL examples

### `templates/publish-checklist.example.md`
Template checklist for weekly/event publishing QA.

---

## Offers Tool (front-end campaign editor)

Open the editor in browser:

```txt
http://localhost:4173/offers-tool.html
```

Typical team workflow:
1. Click **Load current data/specials.json**.
2. Update JSON content directly in the editor.
3. Click **Validate JSON** (must pass).
4. Click **Download specials.json**.
5. Hand the downloaded file to implementation team (or commit to repo).

---

## Run locally

Use any local web server (required because JSON is fetched via HTTP):

```bash
python -m http.server 4173
```

Open:

```txt
http://localhost:4173
```

---

## Monthly/weekly update workflow

1. Update `data/specials.json` with current offers/disclaimers/links.
2. Validate JSON:
   ```bash
   python -m json.tool data/specials.json >/dev/null
   ```
3. Validate JS syntax:
   ```bash
   node --check app.js
   ```
4. Preview locally in browser.
5. Commit and publish.

---

## Build a campaign handoff package

Generate deploy handoff package:

```bash
bash scripts/build_campaign_pack.sh
```

Generated output:

```txt
dist/campaign-pack/
```

Typical handoff process:
1. Run build script.
2. Add campaign assets into `dist/campaign-pack/assets/`.
3. Fill out `campaign-manifest.json`, `utm-map.csv`, and `publish-checklist.md`.
4. Zip and deliver to implementation team.

---

## Data model overview (`data/specials.json`)

Top-level structure:
- `meta`
- `navCards[]`
- `sections[]`
- `footer`

Section object basics:
- `id`
- `type`
- `title` / `subtitle`
- section-specific card arrays
- `disclaimer`

Supported section `type` values:
- `finance`
- `leaseGrid`
- `purchaseGrid`
- `serviceCoupons`
- `ctaSplit`

If you add a new section type in JSON, you must add a corresponding renderer in `app.js`.

---

## Operational governance recommendations

For paid media alignment and source-of-truth execution:
- assign one owner + backup owner for weekly approval
- keep disclaimers in JSON and validate before publish
- enforce one UTM convention in `utm-map.csv`
- keep one official destination strategy (specials page and/or model pages)
- version and archive every published campaign pack

---

## Troubleshooting

### Page shows “Could not load data/specials.json”
Cause: page opened as local file (`file://`) instead of web server.

Fix: run local server with `python -m http.server` and access via `http://localhost`.

### Section doesn’t render
Cause: unsupported `type` in `sections[]`.

Fix: add matching renderer in `app.js` and map it in `init()`.

### Offer card styling looks off
Cause: missing class fields or malformed object in JSON.

Fix: compare object shape against existing working cards in `data/specials.json`.

---

## Notes

This repo is intentionally static and lightweight for fast dealer implementation.
If needed later, you can add an authenticated admin UI that writes `data/specials.json` and exports campaign packs automatically.
