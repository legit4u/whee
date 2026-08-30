/**
 * Category classifier for Whee.
 * 
 * Maps item names (from OCR parsing) to categories using:
 * 1. Exact/fuzzy match against item aliases in database (if available)
 * 2. Keyword matching against category keyword lists
 * 3. Fallback to "uncategorized" with user prompt
 * 
 * Pure function — testable and replaceable with ML later.
 */

import { Category, getCategory } from "./categories";

/**
 * Classification result for an item.
 */
export interface ClassificationResult {
  itemName: string;
  categoryId: string | null; // null means "uncategorized" / user must choose
  category: Category | null;
  confidence: "high" | "medium" | "low";
  matchReason: string; // Why this category was chosen (for UI feedback)
}

/**
 * Default category keyword mappings for POC.
 * Can be extended or moved to database later.
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  fruits: [
    "apple",
    "banana",
    "mango",
    "orange",
    "grape",
    "guava",
    "strawberry",
    "papaya",
    "watermelon",
    "pomegranate",
    "lemon",
    "coconut",
    "pineapple",
    "kiwi",
    "fruit",
    "berries"
  ],
  vegetables: [
    "tomato",
    "onion",
    "carrot",
    "potato",
    "cucumber",
    "broccoli",
    "cabbage",
    "cauliflower",
    "spinach",
    "lettuce",
    "capsicum",
    "bell pepper",
    "green chilli",
    "garlic",
    "ginger",
    "beetroot",
    "radish",
    "pumpkin",
    "zucchini",
    "vegetable"
  ],
  groceries: [
    "rice",
    "dal",
    "pulse",
    "flour",
    "atta",
    "oil",
    "ghee",
    "butter",
    "milk",
    "yogurt",
    "curd",
    "paneer",
    "cheese",
    "bread",
    "sugar",
    "salt",
    "spice",
    "tea",
    "coffee",
    "soap",
    "detergent",
    "grain",
    "bean",
    "lentil",
    "jam",
    "sauce",
    "ketchup",
    "pickle",
    "honey",
    "nuts",
    "cereal",
    "biscuit"
  ],
  stationery: [
    "pen",
    "pencil",
    "notebook",
    "paper",
    "eraser",
    "sharpener",
    "ruler",
    "scale",
    "highlighter",
    "marker",
    "ink",
    "pencil lead",
    "stationary",
    "file",
    "folder",
    "notepad",
    "sticky notes",
    "tape",
    "glue"
  ]
};

/**
 * Classify an item name to a category.
 * 
 * Uses keyword matching in order of confidence.
 * Returns null for categoryId if no confident match.
 * 
 * @param itemName - Name of the item from OCR
 * @param aliases - Optional list of known item aliases (from database)
 * @returns Classification result
 */
export function classifyItem(
  itemName: string,
  aliases?: string[]
): ClassificationResult {
  const normalizedName = itemName.toLowerCase().trim();

  // Edge case: empty string or too short
  if (normalizedName.length < 2) {
    return {
      itemName,
      categoryId: null,
      category: null,
      confidence: "low",
      matchReason: "Item name too short or empty"
    };
  }

  // Step 1: Try exact or fuzzy match against provided aliases (highest confidence)
  if (aliases && aliases.length > 0) {
    const aliasMatch = aliases.find(
      (alias) =>
        normalizedName === alias.toLowerCase() ||
        fuzzyMatch(normalizedName, alias.toLowerCase())
    );
    if (aliasMatch) {
      return {
        itemName,
        categoryId: null, // would need to look up the category from the alias
        category: null, // would be fetched from DB
        confidence: "high",
        matchReason: `Matched against known item alias: "${aliasMatch}"`
      };
    }
  }

  // Step 2: Try keyword matching within each category
  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (
        normalizedName.includes(keyword) ||
        keyword.includes(normalizedName) ||
        fuzzyMatch(normalizedName, keyword)
      ) {
        const category = getCategory(categoryId);
        return {
          itemName,
          categoryId,
          category: category || null,
          confidence: "high",
          matchReason: `Keyword match: "${keyword}" in "${itemName}"`
        };
      }
    }
  }

  // Step 3: Try partial keyword match (lower confidence)
  const tokens = normalizedName.split(/\s+/);
  for (const token of tokens) {
    for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (token.length > 3 && keyword.includes(token)) {
          const category = getCategory(categoryId);
          return {
            itemName,
            categoryId,
            category: category || null,
            confidence: "medium",
            matchReason: `Partial keyword match: "${token}" → category "${categoryId}"`
          };
        }
      }
    }
  }

  // Step 4: Uncategorized (user must choose)
  return {
    itemName,
    categoryId: null,
    category: null,
    confidence: "low",
    matchReason: `No category match found. User must select.`
  };
}

/**
 * Classify multiple items at once.
 */
export function classifyItems(
  items: Array<{ name: string; aliases?: string[] }>
): ClassificationResult[] {
  return items.map((item) => classifyItem(item.name, item.aliases));
}

/**
 * Fuzzy string matching using Levenshtein distance.
 * Returns true if strings are similar enough (threshold ~75%).
 */
function fuzzyMatch(str1: string, str2: string, threshold: number = 0.75): boolean {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  const similarity = 1 - distance / maxLen;
  return similarity >= threshold;
}

/**
 * Calculate Levenshtein distance between two strings.
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}
