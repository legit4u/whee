/**
 * Unit tests for src/lib/units.ts
 */

import { normalize } from "./units";
import { CANONICAL_UNITS } from "./categories";

describe("normalize()", () => {
  describe("Weight-based categories (per 100g)", () => {
    test("converts kg to per 100g", () => {
      // 1 kg of item costs ₹80
      // → per 100g: ₹80 / 10 = ₹8
      const result = normalize("vegetables", 1, "kg", 80);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100G);
      expect(result.value).toBe(8);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("converts grams to per 100g", () => {
      // 500g of item costs ₹40
      // → price per gram: ₹40 / 500 = ₹0.08
      // → per 100g: ₹0.08 * 100 = ₹8
      const result = normalize("fruits", 500, "g", 40);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100G);
      expect(result.value).toBe(8);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("handles 'per 100g' unit directly", () => {
      // Already in canonical form
      const result = normalize("groceries", 1, "per_100g", 10);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100G);
      expect(result.value).toBe(10);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("flags unrecognized weight unit for review", () => {
      // Unknown unit for weight category
      const result = normalize("vegetables", 1, "barrel", 100);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100G);
      expect(result.wasFlaggedForReview).toBe(true);
      expect(result.flagReason).toContain("Unrecognized weight unit");
    });
  });

  describe("Volume-based categories (per 100ml)", () => {
    test("converts liters to per 100ml", () => {
      // 1 L of milk costs ₹60
      // → per 100ml: ₹60 / 10 = ₹6
      const result = normalize("groceries", 1, "l", 60);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100ML);
      expect(result.value).toBe(6);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("converts ml to per 100ml", () => {
      // 250ml costs ₹15
      // → price per ml: ₹15 / 250 = ₹0.06
      // → per 100ml: ₹0.06 * 100 = ₹6
      const result = normalize("groceries", 250, "ml", 15);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100ML);
      expect(result.value).toBe(6);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("handles 'per 100ml' unit directly", () => {
      const result = normalize("groceries", 1, "per_100ml", 5);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100ML);
      expect(result.value).toBe(5);
      expect(result.wasFlaggedForReview).toBe(false);
    });
  });

  describe("Discrete units (per piece)", () => {
    test("converts dozen to per piece", () => {
      // 1 dozen (12) eggs costs ₹120
      // → per piece: ₹120 / 12 = ₹10
      const result = normalize("stationery", 1, "dozen", 120);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_PIECE);
      expect(result.value).toBe(10);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("converts per-piece unit", () => {
      // Already per piece
      const result = normalize("stationery", 10, "piece", 50);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_PIECE);
      expect(result.value).toBe(5); // ₹50 / 10 pieces = ₹5/piece
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("converts pack sizes (e.g. 6-pack)", () => {
      // 6-pack of pens costs ₹60
      // → per piece: ₹60 / 6 = ₹10
      const result = normalize("stationery", 1, "pack of 6", 60);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_PIECE);
      expect(result.value).toBe(10);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("handles 'dz' abbreviation for dozen", () => {
      const result = normalize("stationery", 1, "dz", 120);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_PIECE);
      expect(result.value).toBe(10);
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("flags ambiguous pack without quantity", () => {
      // 1 pack (unclear if 1 item or multiple) costs ₹100
      const result = normalize("stationery", 1, "pack", 100);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_PIECE);
      expect(result.wasFlaggedForReview).toBe(true);
      expect(result.flagReason).toContain("Assumed 1 pack = 1 piece");
    });

    test("flags unrecognized discrete unit for review", () => {
      // Unknown discrete unit
      const result = normalize("stationery", 1, "flute", 10);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_PIECE);
      expect(result.wasFlaggedForReview).toBe(true);
      expect(result.flagReason).toContain("Unrecognized discrete unit");
    });
  });

  describe("Edge cases and error handling", () => {
    test("flags invalid (zero) quantity", () => {
      const result = normalize("vegetables", 0, "kg", 100);
      expect(result.wasFlaggedForReview).toBe(true);
      expect(result.flagReason).toContain("Invalid quantity");
    });

    test("flags negative price", () => {
      const result = normalize("fruits", 1, "kg", -50);
      expect(result.wasFlaggedForReview).toBe(true);
      expect(result.flagReason).toContain("Invalid price");
    });

    test("flags non-existent category", () => {
      const result = normalize("nonexistent_category", 1, "kg", 100);
      expect(result.wasFlaggedForReview).toBe(true);
      expect(result.flagReason).toContain("Category");
    });

    test("handles case-insensitive units", () => {
      // Units should be case-insensitive
      const result1 = normalize("vegetables", 1, "KG", 80);
      const result2 = normalize("vegetables", 1, "kg", 80);
      expect(result1.value).toBe(result2.value);
      expect(result1.wasFlaggedForReview).toBe(result2.wasFlaggedForReview);
    });

    test("handles whitespace in units", () => {
      // Units might have leading/trailing whitespace
      const result = normalize("vegetables", 1, "  kg  ", 80);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100G);
      expect(result.value).toBe(8);
      expect(result.wasFlaggedForReview).toBe(false);
    });
  });

  describe("Real-world scenarios", () => {
    test("common tomato purchase: 500g at ₹30", () => {
      // Scenario: bill says "Tomato 500g ₹30"
      const result = normalize("vegetables", 500, "g", 30);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100G);
      expect(result.value).toBe(6); // ₹30 / 500g * 100g = ₹6 per 100g
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("oil purchase: 1L at ₹250", () => {
      // Scenario: bill says "Oil 1L ₹250"
      const result = normalize("groceries", 1, "l", 250);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_100ML);
      expect(result.value).toBe(25); // ₹250 / 1L = ₹250/L → ₹25/100ml
      expect(result.wasFlaggedForReview).toBe(false);
    });

    test("pen purchase: 1 pack of 10 at ₹50", () => {
      // Scenario: bill says "Pens 10pc ₹50" or "Pens pack of 10 ₹50"
      const result = normalize("stationery", 1, "pack of 10", 50);
      expect(result.unit).toBe(CANONICAL_UNITS.PER_PIECE);
      expect(result.value).toBe(5); // ₹50 / 10 = ₹5 per pen
      expect(result.wasFlaggedForReview).toBe(false);
    });
  });
});
