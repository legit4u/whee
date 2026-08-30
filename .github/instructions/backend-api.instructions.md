---
description: "Backend API design rules"
applyTo: "server/**"
---

# Backend API rules

## Endpoints (POC scope)

- `POST /bills` — submit a reviewed/confirmed bill: store info (existing
  store_id or new store lat/lng/name), date, array of line items (item
  match, category, raw + normalized price), `anonymous_device_id`. Creates
  a `price_points` row per line item (creating a new `store` or `item` row
  if no close match exists).
- `GET /items/search?q=` — fuzzy search items by name/alias, for both the
  scan-review autocomplete and the browse screen.
- `GET /items/:id/price-history?from=&to=` — time series of
  `normalized_value` for charting.
- `GET /items/:id/nearby-cheaper?lat=&lng=&radiusKm=` — cheapest recent
  price for this item per nearby store, sorted by price, with distance.
- `GET /bills/:id/report` — per-line-item comparison: for each item in the
  bill, cheapest nearby alternative and delta, or "already cheapest".
- `GET /categories` — list of categories and their canonical unit.

## Rules

- Validate that no request or response payload ever includes a name, email,
  phone number, or precise user-location trail — only `anonymous_device_id`
  (a UUID) identifies the submitter, and it must never be returned in any
  read endpoint (write-only, for abuse-mitigation/rate-limiting use only).
- All geo queries go through PostGIS functions (`ST_DWithin`,
  `ST_Distance`), not manual haversine math in application code.
- `POST /bills` must reject line items missing `normalized_unit` /
  `normalized_value` — normalization happens client-side per
  `.github/instructions/data-model.instructions.md`, the API doesn't
  re-derive it.
- Version the API from the start (`/v1/...`) since the schema (especially
  the category list) will evolve.
- Add basic outlier rejection on write (see data-model instructions) before
  persisting a `price_points` row.
