/**
 * Price normalization logic for Whee.
 * 
 * Normalizes raw purchase data (quantity, unit, price) into a canonical
 * unit per category so prices are comparable across users and stores.
 * 
 * Canonical units:
 * - Sold by weight: per 100 g
 * - Sold by volume: per 100 ml
 * - Discrete units: per piece
 */

import { getCategory, CanonicalUnit, CANONICAL_UNITS } from "./categories";

export interface NormalizedPrice {
  unit: CanonicalUnit;
  value: number;
  wasFlaggedForReview: boolean;
  flagReason?: string;
}

/**
 * Normalize a raw price point to the category's canonical unit.
 * 
 * @param categoryId - The category ID (must exist in CATEGORIES)
 * @param rawQuantity - The quantity from the bill (e.g. 1, 2.5, 12)
 * @param rawUnit - The unit from the bill (e.g. "kg", "l", "dozen", "piece")
 * @param rawPrice - The price from the bill (in ₹ or equivalent)
 * @returns Normalized price with unit and value, or flagged for review if the unit is unrecognized
 */
export function normalize(
  categoryId: string,
  rawQuantity: number,
  rawUnit: string,
  rawPrice: number
): NormalizedPrice {
  const category = getCategory(categoryId);

  if (!category) {
    return {
      unit: CANONICAL_UNITS.PER_PIECE,
      value: 0,
      wasFlaggedForReview: true,
      flagReason: `Category "${categoryId}" not found. Unknown category.`
    };
  }

  if (rawQuantity <= 0) {
    return {
      unit: category.canonicalUnit,
      value: 0,
      wasFlaggedForReview: true,
      flagReason: "Invalid quantity: must be greater than zero."
    };
  }

  if (rawPrice < 0) {
    return {
      unit: category.canonicalUnit,
      value: 0,
      wasFlaggedForReview: true,
      flagReason: "Invalid price: cannot be negative."
    };
  }

  const normalizedUnit = rawUnit.toLowerCase().trim();
  const pricePerUnit = rawPrice / rawQuantity;

  // Smart unit detection: check the raw unit type first, regardless of category
  // This allows "groceries" to contain both weight-based (rice) and volume-based (oil) items

  // Check if unit is volume-based
  if (["l", "liter", "litre", "ml"].includes(normalizedUnit) || normalizedUnit.startsWith("per_100ml") || normalizedUnit.startsWith("per 100ml")) {
    return normalizeVolume(normalizedUnit, pricePerUnit);
  }

  // Check if unit is weight-based
  if (["kg", "g"].includes(normalizedUnit) || normalizedUnit.startsWith("per_100g") || normalizedUnit.startsWith("per 100g")) {
    return normalizeWeight(normalizedUnit, pricePerUnit);
  }

  // Check if unit is discrete-based
  if (["dozen", "dz", "piece", "pc", "pcs", "each", "unit"].includes(normalizedUnit)) {
    return normalizeDiscreteUnit(normalizedUnit, pricePerUnit, rawQuantity);
  }

  // Fall back to category's canonical unit
  if (category.canonicalUnit === CANONICAL_UNITS.PER_100G) {
    return normalizeWeight(normalizedUnit, pricePerUnit);
  }

  if (category.canonicalUnit === CANONICAL_UNITS.PER_100ML) {
    return normalizeVolume(normalizedUnit, pricePerUnit);
  }

  if (category.canonicalUnit === CANONICAL_UNITS.PER_PIECE) {
    return normalizeDiscreteUnit(normalizedUnit, pricePerUnit, rawQuantity);
  }

  return {
    unit: category.canonicalUnit,
    value: 0,
    wasFlaggedForReview: true,
    flagReason: "Unknown canonical unit type."
  };
}

/**
 * Normalize weight-based units to price per 100g.
 */
function normalizeWeight(unit: string, pricePerUnit: number): NormalizedPrice {
  // kg → per 100g: 1kg = 1000g, so price per 100g = price per kg / 10
  if (unit === "kg") {
    return {
      unit: CANONICAL_UNITS.PER_100G,
      value: pricePerUnit / 10,
      wasFlaggedForReview: false
    };
  }

  // g → per 100g: price per g * 100 = price per 100g
  if (unit === "g") {
    return {
      unit: CANONICAL_UNITS.PER_100G,
      value: pricePerUnit * 100,
      wasFlaggedForReview: false
    };
  }

  // Already per 100g (or declared as such)
  if (unit === "per_100g" || unit === "per 100g" || unit === "100g") {
    return {
      unit: CANONICAL_UNITS.PER_100G,
      value: pricePerUnit,
      wasFlaggedForReview: false
    };
  }

  // Unrecognized weight unit
  return {
    unit: CANONICAL_UNITS.PER_100G,
    value: pricePerUnit,
    wasFlaggedForReview: true,
    flagReason: `Unrecognized weight unit: "${unit}". Assumed price per unit of weight; please review.`
  };
}

/**
 * Normalize volume-based units to price per 100ml.
 */
function normalizeVolume(unit: string, pricePerUnit: number): NormalizedPrice {
  // L → per 100ml: 1L = 1000ml, so price per 100ml = price per L / 10
  if (unit === "l" || unit === "liter" || unit === "litre") {
    return {
      unit: CANONICAL_UNITS.PER_100ML,
      value: pricePerUnit / 10,
      wasFlaggedForReview: false
    };
  }

  // ml → per 100ml: price per ml * 100 = price per 100ml
  if (unit === "ml") {
    return {
      unit: CANONICAL_UNITS.PER_100ML,
      value: pricePerUnit * 100,
      wasFlaggedForReview: false
    };
  }

  // Already per 100ml (or declared as such)
  if (unit === "per_100ml" || unit === "per 100ml" || unit === "100ml") {
    return {
      unit: CANONICAL_UNITS.PER_100ML,
      value: pricePerUnit,
      wasFlaggedForReview: false
    };
  }

  // Unrecognized volume unit
  return {
    unit: CANONICAL_UNITS.PER_100ML,
    value: pricePerUnit,
    wasFlaggedForReview: true,
    flagReason: `Unrecognized volume unit: "${unit}". Assumed price per unit of volume; please review.`
  };
}

/**
 * Normalize discrete units to price per piece.
 */
function normalizeDiscreteUnit(
  unit: string,
  pricePerUnit: number,
  originalQuantity: number
): NormalizedPrice {
  // Already per piece
  if (
    unit === "piece" ||
    unit === "pieces" ||
    unit === "pc" ||
    unit === "item" ||
    unit === "unit"
  ) {
    return {
      unit: CANONICAL_UNITS.PER_PIECE,
      value: pricePerUnit,
      wasFlaggedForReview: false
    };
  }

  // Dozen (12 pieces) → per piece: divide by 12
  if (unit === "dozen" || unit === "dz") {
    return {
      unit: CANONICAL_UNITS.PER_PIECE,
      value: pricePerUnit / 12,
      wasFlaggedForReview: false
    };
  }

  // Common pack sizes (e.g. "6-pack", "pack of 6")
  const packMatch = unit.match(/(?:pack|pack of|box|box of)\s*(\d+)/i);
  if (packMatch) {
    const packSize = parseInt(packMatch[1], 10);
    if (packSize > 0) {
      return {
        unit: CANONICAL_UNITS.PER_PIECE,
        value: pricePerUnit / packSize,
        wasFlaggedForReview: false
      };
    }
  }

  // If quantity is a known discrete count and unit is ambiguous, assume per-piece
  if (originalQuantity === 1 && (unit === "pack" || unit === "box")) {
    return {
      unit: CANONICAL_UNITS.PER_PIECE,
      value: pricePerUnit,
      wasFlaggedForReview: true,
      flagReason: `Unit is "${unit}" but quantity is 1. Assumed 1 pack = 1 piece; please review if pack contains multiple items.`
    };
  }

  // Unrecognized discrete unit
  return {
    unit: CANONICAL_UNITS.PER_PIECE,
    value: pricePerUnit,
    wasFlaggedForReview: true,
    flagReason: `Unrecognized discrete unit: "${unit}". Assumed price per unit; please verify.`
  };
}
