import { execute, queryOne, queryMany } from "../connection";

export interface PricePoint {
  id: string;
  item_id: string;
  store_id: string;
  raw_quantity: number;
  raw_unit: string;
  raw_price: number;
  normalized_unit: string;
  normalized_value: number;
  purchase_date: string;
  anonymous_device_id: string;
  created_at: string;
}

export interface PricePointStats {
  item_id: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  latest_price: number;
  latest_store_id: string;
  latest_purchase_date: string;
  price_point_count: number;
}

/**
 * Price Points repository - manages crowdsourced price data.
 */

export const pricePointsRepository = {
  /**
   * Create a new price point.
   */
  async create(pricePoint: Omit<PricePoint, "id" | "created_at">): Promise<PricePoint> {
    const newPoint = await queryOne<PricePoint>(
      `INSERT INTO price_points (
        item_id, store_id, raw_quantity, raw_unit, raw_price,
        normalized_unit, normalized_value, purchase_date, anonymous_device_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        pricePoint.item_id,
        pricePoint.store_id,
        pricePoint.raw_quantity,
        pricePoint.raw_unit,
        pricePoint.raw_price,
        pricePoint.normalized_unit,
        pricePoint.normalized_value,
        pricePoint.purchase_date,
        pricePoint.anonymous_device_id
      ]
    );

    if (!newPoint) {
      throw new Error("Failed to create price point");
    }

    return newPoint;
  },

  /**
   * Get all price points for an item.
   */
  async getByItemId(itemId: string): Promise<PricePoint[]> {
    return queryMany<PricePoint>(
      `SELECT pp.*, s.name as store_name
       FROM price_points pp
       JOIN stores s ON pp.store_id = s.id
       WHERE pp.item_id = $1
       ORDER BY pp.purchase_date DESC, pp.created_at DESC`,
      [itemId]
    );
  },

  /**
   * Get latest price point for each item.
   * Used for quick lookup of current prices.
   */
  async getLatestPerItem(limit: number = 100): Promise<(PricePoint & { store_name: string })[]> {
    return queryMany<PricePoint & { store_name: string }>(
      `SELECT DISTINCT ON (pp.item_id)
         pp.*, s.name as store_name
       FROM price_points pp
       JOIN stores s ON pp.store_id = s.id
       ORDER BY pp.item_id, pp.purchase_date DESC, pp.created_at DESC
       LIMIT $1`,
      [limit]
    );
  },

  /**
   * Get price statistics for an item.
   * Used for price comparisons and analytics.
   */
  async getStatsForItem(itemId: string): Promise<PricePointStats | null> {
    return queryOne<PricePointStats>(
      `SELECT 
         item_id,
         AVG(normalized_value)::numeric as avg_price,
         MIN(normalized_value)::numeric as min_price,
         MAX(normalized_value)::numeric as max_price,
         (array_agg(normalized_value ORDER BY purchase_date DESC, created_at DESC))[1]::numeric as latest_price,
         (array_agg(store_id ORDER BY purchase_date DESC, created_at DESC))[1] as latest_store_id,
         (array_agg(purchase_date ORDER BY purchase_date DESC, created_at DESC))[1] as latest_purchase_date,
         COUNT(*) as price_point_count
       FROM price_points
       WHERE item_id = $1
       GROUP BY item_id`,
      [itemId]
    );
  },

  /**
   * Get all price points (paginated).
   */
  async getAll(limit: number = 1000, offset: number = 0): Promise<PricePoint[]> {
    return queryMany<PricePoint>(
      `SELECT * FROM price_points
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  },

  /**
   * Count total price points.
   */
  async count(): Promise<number> {
    const result = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM price_points"
    );
    return parseInt(result?.count || "0", 10);
  }
};
