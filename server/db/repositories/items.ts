import { execute, queryOne, queryMany } from "../connection";

export interface Item {
  id: string;
  category_id: string;
  name: string;
  aliases?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Items repository - manages product items.
 */

export const itemsRepository = {
  /**
   * Get or create an item.
   * Returns existing item if one with same category and name exists,
   * otherwise creates a new one.
   */
  async getOrCreate(categoryId: string, name: string): Promise<Item> {
    // Try to find existing item
    const existing = await queryOne<Item>(
      "SELECT * FROM items WHERE category_id = $1 AND name = $2 LIMIT 1",
      [categoryId, name]
    );

    if (existing) {
      return existing;
    }

    // Create new item
    const newItem = await queryOne<Item>(
      `INSERT INTO items (category_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [categoryId, name]
    );

    if (!newItem) {
      throw new Error(`Failed to create item: ${name}`);
    }

    return newItem;
  },

  /**
   * Get an item by ID.
   */
  async getById(id: string): Promise<Item | null> {
    return queryOne<Item>(
      "SELECT * FROM items WHERE id = $1",
      [id]
    );
  },

  /**
   * Search for items by name (case-insensitive, prefix match).
   */
  async search(query: string, categoryId?: string): Promise<Item[]> {
    if (!query) {
      // Return all items in category or all items
      if (categoryId) {
        return queryMany<Item>(
          "SELECT * FROM items WHERE category_id = $1 ORDER BY name",
          [categoryId]
        );
      }
      return queryMany<Item>("SELECT * FROM items ORDER BY name");
    }

    // Search by name prefix (case-insensitive)
    const searchPattern = `${query}%`;
    if (categoryId) {
      return queryMany<Item>(
        "SELECT * FROM items WHERE category_id = $1 AND LOWER(name) LIKE LOWER($2) ORDER BY name",
        [categoryId, searchPattern]
      );
    }
    return queryMany<Item>(
      "SELECT * FROM items WHERE LOWER(name) LIKE LOWER($1) ORDER BY name",
      [searchPattern]
    );
  },

  /**
   * Get all items.
   */
  async getAll(): Promise<Item[]> {
    return queryMany<Item>("SELECT * FROM items ORDER BY name");
  }
};
