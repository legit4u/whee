import { execute, queryOne, queryMany } from "../connection";

export interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  geohash: string;
  created_at: string;
}

/**
 * Stores repository - manages shop/store data.
 */

export const storesRepository = {
  /**
   * Get or create a store.
   * Returns existing store if one with same name and geohash exists,
   * otherwise creates a new one.
   */
  async getOrCreate(name: string, lat: number, lng: number, geohash: string): Promise<Store> {
    // Try to find existing store by name and location
    const existing = await queryOne<Store>(
      "SELECT * FROM stores WHERE name = $1 AND geohash = $2 LIMIT 1",
      [name, geohash]
    );

    if (existing) {
      return existing;
    }

    // Create new store
    const newStore = await queryOne<Store>(
      `INSERT INTO stores (name, location, geohash)
       VALUES ($1, ST_Point($2, $3), $4)
       RETURNING id, name, ST_Y(location) as lat, ST_X(location) as lng, geohash, created_at`,
      [name, lng, lat, geohash]
    );

    if (!newStore) {
      throw new Error(`Failed to create store: ${name}`);
    }

    return newStore;
  },

  /**
   * Get a store by ID.
   */
  async getById(id: string): Promise<Store | null> {
    return queryOne<Store>(
      "SELECT id, name, ST_Y(location) as lat, ST_X(location) as lng, geohash, created_at FROM stores WHERE id = $1",
      [id]
    );
  },

  /**
   * Get all stores.
   */
  async getAll(): Promise<Store[]> {
    return queryMany<Store>(
      "SELECT id, name, ST_Y(location) as lat, ST_X(location) as lng, geohash, created_at FROM stores ORDER BY name"
    );
  }
};
