/**
 * Category definitions and metadata for Whee.
 * Categories are structured as data, not hardcoded conditionals,
 * so new categories can be added without code changes.
 */

export const CANONICAL_UNITS = {
  PER_100G: "per_100g",
  PER_100ML: "per_100ml",
  PER_PIECE: "per_piece"
} as const;

export type CanonicalUnit = typeof CANONICAL_UNITS[keyof typeof CANONICAL_UNITS];

export interface Category {
  id: string;
  label: string;
  canonicalUnit: CanonicalUnit;
  description: string;
}

/**
 * POC category list. Easily extended by adding new entries.
 */
export const CATEGORIES: Record<string, Category> = {
  fruits: {
    id: "fruits",
    label: "Fruits",
    canonicalUnit: CANONICAL_UNITS.PER_100G,
    description: "Fresh fruits (apples, mangoes, bananas, etc.)"
  },
  vegetables: {
    id: "vegetables",
    label: "Vegetables",
    canonicalUnit: CANONICAL_UNITS.PER_100G,
    description: "Fresh vegetables (tomatoes, onions, carrots, etc.)"
  },
  groceries: {
    id: "groceries",
    label: "Groceries",
    canonicalUnit: CANONICAL_UNITS.PER_100G,
    description: "Packaged foods (rice, dal, flour, oil, etc.)"
  },
  dairy: {
    id: "dairy",
    label: "Dairy",
    canonicalUnit: CANONICAL_UNITS.PER_100ML,
    description: "Milk, yogurt, cheese, and other dairy products"
  },
  stationery: {
    id: "stationery",
    label: "Stationery",
    canonicalUnit: CANONICAL_UNITS.PER_PIECE,
    description: "Pens, pencils, notebooks, etc."
  }
};

/**
 * Get a category by ID.
 * Returns undefined if category doesn't exist.
 */
export function getCategory(id: string): Category | undefined {
  return CATEGORIES[id];
}

/**
 * Get all categories as an array.
 */
export function getAllCategories(): Category[] {
  return Object.values(CATEGORIES);
}

/**
 * Check if a category exists.
 */
export function categoryExists(id: string): boolean {
  return id in CATEGORIES;
}
