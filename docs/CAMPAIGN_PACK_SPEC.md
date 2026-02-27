# Campaign Pack Specification (Single Source of Truth)

This spec defines the package your team can download and hand off for implementation on:

- `https://www.clarkhyundai.com/specials.htm`
- paid social destinations
- paid search destinations
- broadcast/TV destination references

## Goal

Run multiple paid channels while publishing offer copy, disclaimers, and destinations from one governed source.

## Package contents

```
campaign-pack/
  specials.htm
  app.js
  data/
    specials.json
  assets/
    (uploaded campaign files)
  campaign-manifest.json
  utm-map.csv
  publish-checklist.md
```

## File definitions

### `specials.htm`
Deploy-ready page shell for the dealership website.

### `app.js`
Renderer logic (already data-driven).

### `data/specials.json`
Single source of truth for all offers, disclaimers, links, and section content.

### `assets/`
Campaign images/videos/files used by cards, social links, and creatives.

### `campaign-manifest.json`
Campaign metadata and governance details.

Required keys:
- `campaignId`
- `campaignName`
- `store`
- `startDate`
- `endDate`
- `owner`
- `backupOwner`
- `approvedBy`
- `publishedAt`
- `version`
- `officialDestinations` (specials + optional model pages)

### `utm-map.csv`
Channel-specific destination links generated from the official pages.

Required columns:
- `channel` (paid_search / paid_social / broadcast_tv)
- `campaign`
- `ad_group`
- `creative`
- `destination_url`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `final_url`

### `publish-checklist.md`
Execution checklist for weekly/event updates.

## Governance model

- One publishing owner + one backup owner.
- Offer and disclaimer approval before publish.
- All channels link to official destinations in manifest.
- Version every publish and keep previous pack for rollback.

## Cadence recommendation

- Weekly updates + event-based exceptions.
- Freeze window for major events (no unreviewed edits).

## KPI alignment

Track weekly:
- specials sessions + conversion rate
- spend/leads/appointments by channel
- top model landing pages tied to specials
- lead-to-appointment and show rate

## One-line alignment statement

"We can run multiple paid channels, but we publish the offer in one place so every customer sees the same message."
