/**
 * Data Access Layer - Bills
 * 
 * Handles all database operations related to bills.
 * Abstracts bill storage logic from API routes.
 */

import { randomUUID } from "crypto";
import { query, getClient } from "./client";
import { BillLineItem, BillSubmitResponse } from "../types";

/**
 * Store a bill and its price points
 */
export async function storeBill(
  billId: string,
  storeName: string,
  storeLat: number,
  storeLng: number,
  purchaseDate: string,
  items: BillLineItem[],
  anonymousDeviceId: string
): Promise<BillSubmitResponse> {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    // 1. Insert or get store
    const storeResult = await client.query(
      `INSERT INTO stores (name, location, geohash)
       VALUES ($1, ST_Point($2, $3), $4)
       ON CONFLICT (name, ST_AsText(location)) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [storeName, storeLng, storeLat, `${storeLat.toFixed(2)},${storeLng.toFixed(2)}`]
    );
    const storeId = storeResult.rows[0].id;

    // 2. Insert bill
    await client.query(
      `INSERT INTO bills (id, store_id, purchase_date, anonymous_device_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [billId, storeId, purchaseDate, anonymousDeviceId]
    );

    // 3. Insert items and price points
    const pricePointIds: string[] = [];

    for (const item of items) {
      // Get or create item
      const itemResult = await client.query(
        `INSERT INTO items (category_id, name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (category_id, name) DO UPDATE SET updated_at = NOW()
         RETURNING id`,
        [item.categoryId, item.itemName]
      );
      const itemId = itemResult.rows[0].id;

      // Insert price point
      const ppResult = await client.query(
        `INSERT INTO price_points (
          id, item_id, store_id, raw_quantity, raw_unit, raw_price,
          normalized_unit, normalized_value, purchase_date, anonymous_device_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING id`,
        [
          randomUUID(),
          itemId,
          storeId,
          item.rawQuantity,
          item.rawUnit,
          item.rawPrice,
          item.normalizedUnit,
          item.normalizedValue,
          purchaseDate,
          anonymousDeviceId
        ]
      );
      pricePointIds.push(ppResult.rows[0].id);
    }

    await client.query("COMMIT");

    console.log(`[DB] Bill stored: ${billId} with ${pricePointIds.length} price points`);
    return { billId, pricePointIds };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[DB] Error storing bill:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all bills (for admin/debugging)
 */
export async function getAllBills() {
  const result = await query(
    `SELECT b.*, s.name as store_name FROM bills b
     JOIN stores s ON b.store_id = s.id
     ORDER BY b.created_at DESC`
  );
  return result.rows;
}
