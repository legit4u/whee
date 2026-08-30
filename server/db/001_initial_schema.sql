-- Whee Database Schema - Initial Migration
-- 
-- This migration creates the core tables for the crowdsourced price tracking system.
-- Schema follows the data model from .github/instructions/data-model.instructions.md

-- Enable PostGIS extension (if using PostGIS)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- Categories table
-- Defines product categories and their canonical units for normalization
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  canonical_unit TEXT NOT NULL CHECK (canonical_unit IN ('per_100g', 'per_100ml', 'per_piece')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert POC categories
INSERT INTO categories (id, label, canonical_unit) VALUES
  ('fruits', 'Fruits', 'per_100g'),
  ('vegetables', 'Vegetables', 'per_100g'),
  ('groceries', 'Groceries', 'per_100g'),
  ('stationery', 'Stationery', 'per_piece')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Stores table
-- Public information about shops (not user data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  name TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  geohash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create PostGIS spatial index
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_stores_geohash ON stores (geohash);

-- ============================================================================
-- Items table
-- Canonical product definitions (e.g. "Tomato", "Toned Milk 1L")
-- ============================================================================
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_category ON items (category_id);
CREATE INDEX IF NOT EXISTS idx_items_name ON items (name);

-- ============================================================================
-- Price points table
-- Crowdsourced price submissions (anonymous)
-- Stores BOTH raw and normalized price data (never normalize-and-discard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_points (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  item_id UUID NOT NULL REFERENCES items(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  -- Raw bill data (preserve exactly as-is from OCR or manual entry)
  raw_quantity NUMERIC NOT NULL,
  raw_unit TEXT NOT NULL,
  raw_price NUMERIC NOT NULL,
  -- Normalized data (canonical units per category)
  normalized_unit TEXT NOT NULL CHECK (normalized_unit IN ('per_100g', 'per_100ml', 'per_piece')),
  normalized_value NUMERIC NOT NULL,
  -- Purchase metadata
  purchase_date DATE NOT NULL,
  -- Anonymous device identifier (random UUID, no link to real identity)
  anonymous_device_id UUID NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_price_points_item ON price_points (item_id);
CREATE INDEX IF NOT EXISTS idx_price_points_store ON price_points (store_id);
CREATE INDEX IF NOT EXISTS idx_price_points_date ON price_points (purchase_date);
CREATE INDEX IF NOT EXISTS idx_price_points_device ON price_points (anonymous_device_id);
CREATE INDEX IF NOT EXISTS idx_price_points_category_date ON price_points (item_id, purchase_date DESC);

-- ============================================================================
-- Views for common queries
-- ============================================================================

-- Latest prices per item per store (for "what's the current cheapest store?" queries)
CREATE OR REPLACE VIEW latest_prices AS
SELECT DISTINCT ON (item_id, store_id)
  item_id,
  store_id,
  normalized_value,
  normalized_unit,
  purchase_date,
  created_at
FROM price_points
ORDER BY item_id, store_id, purchase_date DESC, created_at DESC;

-- Average normalized price per item per category (for outlier detection)
CREATE OR REPLACE VIEW item_price_stats AS
SELECT
  pp.item_id,
  i.category_id,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pp.normalized_value) AS median_price,
  AVG(pp.normalized_value) AS avg_price,
  MIN(pp.normalized_value) AS min_price,
  MAX(pp.normalized_value) AS max_price,
  COUNT(*) AS sample_count
FROM price_points pp
JOIN items i ON pp.item_id = i.id
WHERE pp.purchase_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pp.item_id, i.category_id;

-- ============================================================================
-- Comments (documentation)
-- ============================================================================

COMMENT ON TABLE stores IS 'Public shop information. NOT user personal data.';
COMMENT ON TABLE price_points IS 'Crowdsourced price data. Identified only by anonymous_device_id (random UUID).';
COMMENT ON COLUMN price_points.raw_quantity IS 'Original quantity from bill (e.g., 1, 2.5, 12). Never normalize-and-discard.';
COMMENT ON COLUMN price_points.raw_unit IS 'Original unit from bill (e.g., kg, l, dozen, piece). Preserved for future re-normalization.';
COMMENT ON COLUMN price_points.raw_price IS 'Original price from bill in rupees (or local currency).';
COMMENT ON COLUMN price_points.normalized_value IS 'Price in canonical unit (per_100g, per_100ml, or per_piece) for comparison.';
COMMENT ON COLUMN price_points.anonymous_device_id IS 'Random UUID generated on device. No server-side link to real identity.';
