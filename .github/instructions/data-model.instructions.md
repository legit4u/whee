---
description: "Database schema and data-model rules for Whee"
applyTo: "server/db/**,server/routes/**,supabase/**,**/*.sql,src/lib/units.ts,src/lib/geo.ts"
---

# Data model & schema rules

## Tables (minimum viable schema)

```sql
-- Public info about a shop. Not user data.
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location geography(Point, 4326) not null,   -- PostGIS
  geohash text not null,
  created_at timestamptz not null default now()
);

create table categories (
  id text primary key,                        -- e.g. 'vegetables'
  label text not null,
  canonical_unit text not null check (canonical_unit in ('per_100g','per_100ml','per_piece'))
);

create table items (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references categories(id),
  name text not null,
  aliases text[] default '{}'                  -- for OCR name matching
);

create table price_points (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id),
  store_id uuid not null references stores(id),
  raw_quantity numeric not null,
  raw_unit text not null,
  raw_price numeric not null,
  normalized_unit text not null check (normalized_unit in ('per_100g','per_100ml','per_piece')),
  normalized_value numeric not null,
  purchase_date date not null,
  anonymous_device_id uuid not null,           -- random UUID, never linked to identity
  created_at timestamptz not null default now()
);

create index on price_points using gist (item_id);
create index on stores using gist (location);
```

## Hard rules

- **Never add a column that stores name, email, phone, payment info, or any
  precise user-location trail.** `anonymous_device_id` is the only per-user
  field allowed, and it must be a random UUID generated on-device with no
  server-side link to a real identity.
- `price_points` must keep both raw (`raw_quantity`, `raw_unit`,
  `raw_price`) and normalized (`normalized_unit`, `normalized_value`)
  fields — never normalize-and-discard.
- Geo queries ("cheapest nearby") should use PostGIS `ST_DWithin` /
  `ST_Distance` on `stores.location`, not naive lat/lng math.
- `categories.canonical_unit` drives normalization — new categories must
  declare which of the three canonical units they use.
- Any migration that adds a field must be checked against the privacy rule
  above before being written — if in doubt, ask the user rather than adding
  the field.
- Rate-limit / sanity-check incoming `price_points` writes (e.g. reject
  normalized values that are >10x or <0.1x the current median for that item)
  to protect crowdsourced data quality — flag but don't silently drop; surface
  for review.
