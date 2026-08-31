import { queryMany, queryOne } from "./connection";

export interface Category {
  id: string;
  label: string;
  canonical_unit: "per_100g" | "per_100ml" | "per_piece";
  created_at: string;
}

/**
 * Categories repository - read-only access to product categories.
 */

export const categoriesRepository = {
  /**
   * Get all categories.
   */
  async getAll(): Promise<Category[]> {
    return queryMany<Category>("SELECT * FROM categories ORDER BY label");
  },

  /**
   * Get a single category by ID.
   */
  async getById(id: string): Promise<Category | null> {
    return queryOne<Category>(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );
  },

  /**
   * Check if a category exists.
   */
  async exists(id: string): Promise<boolean> {
    const result = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM categories WHERE id = $1",
      [id]
    );
    return (result?.count || "0") !== "0";
  }
};
