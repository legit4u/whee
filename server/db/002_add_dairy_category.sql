-- Add the dairy category supported by the bill-entry UI.
INSERT INTO categories (id, label, canonical_unit) VALUES
  ('dairy', 'Dairy', 'per_100ml')
ON CONFLICT (id) DO NOTHING;