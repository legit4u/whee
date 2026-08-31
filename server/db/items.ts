/**
 * Data Access Layer - Items
 * 
 * Handles all database operations related to items and price searches.
 * Abstracts search logic from API routes.
 */

import { query } from "./client";

/**
 * Search for items by name query
 * Returns aggregated price points per item
 */
export async function searchItems(queryParam: string = "") {
  let sql = `
    SELECT
      i.id,
      i.name,
      i.category_id,
      json_agg(json_build_object(
        'normalizedValue', pp.normalized_value,
        'normalizedUnit', pp.normalized_unit,
        'storeName', s.name,
        'purchaseDate', pp.purchase_date,
        'rawPrice', pp.raw_price,
        'rawUnit', pp.raw_unit,
        'rawQuantity', pp.raw_quantity
      ) ORDER BY pp.purchase_date DESC) as price_points
    FROM items i
    LEFT JOIN price_points pp ON i.id = pp.item_id
    LEFT JOIN stores s ON pp.store_id = s.id
    GROUP BY i.id, i.name, i.category_id
  `;

  const values: any[] = [];

  if (queryParam) {
    sql += ` WHERE i.name ILIKE $1 `;
    values.push(`%${queryParam}%`);
  }

  sql += ` ORDER BY i.name ASC`;

  const result = await query(sql, values);

  // Format response
  const items = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    pricePoints: row.price_points ? row.price_points.filter((pp: any) => pp.storeName !== null) : []
  }));

  return {
    query: queryParam,
    items,
    total: items.length
  };
}

/**
 * Get price history for a specific item
 */
export async function getPriceHistory(itemId: string, from?: string, to?: string) {
  let sql = `
    SELECT
      i.name,
      i.category_id,
      c.canonical_unit,
      pp.purchase_date,
      pp.normalized_value,
      pp.normalized_unit,
      s.name as store_name,
      s.id as store_id
    FROM price_points pp
    JOIN items i ON pp.item_id = i.id
    JOIN categories c ON i.category_id = c.id
    JOIN stores s ON pp.store_id = s.id
    WHERE pp.item_id = $1
  `;

  const values: any[] = [itemId];

  if (from) {
    sql += ` AND pp.purchase_date >= $${values.length + 1}`;
    values.push(from);
  }

  if (to) {
    sql += ` AND pp.purchase_date <= $${values.length + 1}`;
    values.push(to);
  }

  sql += ` ORDER BY pp.purchase_date DESC`;

  const result = await query(sql, values);

  if (result.rows.length === 0) {
    return null;
  }

  const firstRow = result.rows[0];
  return {
    itemId,
    itemName: firstRow.name,
    categoryId: firstRow.category_id,
    canonicalUnit: firstRow.canonical_unit,
    history: result.rows.map((row) => ({
      date: row.purchase_date,
      value: row.normalized_value,
      storeId: row.store_id,
      storeName: row.store_name
    }))
  };
}

/**
 * Get item statistics (for analytics/outlier detection)
 */
export async function getItemStats(itemId: string) {
  const result = await query(
    `SELECT
      COUNT(*) as sample_count,
      AVG(normalized_value) as avg_price,
      MIN(normalized_value) as min_price,
      MAX(normalized_value) as max_price,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY normalized_value) as median_price
     FROM price_points
     WHERE item_id = $1 AND purchase_date >= CURRENT_DATE - INTERVAL '30 days'`,
    [itemId]
  );

  return result.rows[0];
}
