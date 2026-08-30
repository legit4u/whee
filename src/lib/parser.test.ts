/**
 * Unit tests for src/lib/parser.ts
 * 
 * Tests bill parsing with real-world bill text examples.
 */

import { parseBillText } from "./parser";

describe("parseBillText()", () => {
  describe("Pattern 1: qty unit price", () => {
    test("parses 'Tomato 500 g ₹40'", () => {
      const result = parseBillText("Tomato 500 g ₹40");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: "Tomato",
        quantity: 500,
        unit: "g",
        price: 40
      });
      expect(result[0].confidence).toBe("high");
    });

    test("parses 'Milk 1 l 60'", () => {
      const result = parseBillText("Milk 1 l 60");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: "Milk",
        quantity: 1,
        unit: "l",
        price: 60
      });
    });

    test("parses 'Pen (pack of 10) 50'", () => {
      const result = parseBillText("Pen (pack of 10) 50");
      expect(result).toHaveLength(1);
      const item = result[0];
      expect(item.itemNameGuess).toContain("Pen");
      expect(item.price).toBe(50);
    });

    test("parses 'Rice 1 kg ₹320'", () => {
      const result = parseBillText("Rice 1 kg ₹320");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: "Rice",
        quantity: 1,
        unit: "kg",
        price: 320
      });
    });

    test("parses with decimal quantities", () => {
      const result = parseBillText("Onion 2.5 kg 75");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: "Onion",
        quantity: 2.5,
        unit: "kg",
        price: 75
      });
    });

    test("parses with decimal prices", () => {
      const result = parseBillText("Apple 1 kg 150.50");
      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(150.5);
    });
  });

  describe("Pattern 2: price/unit", () => {
    test("parses 'Tomato 80/kg'", () => {
      const result = parseBillText("Tomato 80/kg");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: "Tomato",
        quantity: null,
        unit: "kg",
        price: 80
      });
      expect(result[0].warnings.join()).toContain("quantity is unknown");
      expect(result[0].confidence).toBe("medium");
    });

    test("parses 'Oil ₹250/L'", () => {
      const result = parseBillText("Oil ₹250/L");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: "Oil",
        quantity: null,
        unit: "l",
        price: 250
      });
    });
  });

  describe("Pattern 3: item price (ambiguous)", () => {
    test("parses 'Eggs (dozen) 120' as low confidence", () => {
      const result = parseBillText("Eggs (dozen) 120");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: expect.stringContaining("Eggs"),
        quantity: null,
        unit: null,
        price: 120
      });
      expect(result[0].confidence).toBe("low");
      expect(result[0].warnings.length).toBeGreaterThan(0);
    });

    test("parses 'Pen 5' as low confidence", () => {
      const result = parseBillText("Pen 5");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemNameGuess: "Pen",
        quantity: null,
        unit: null,
        price: 5
      });
      expect(result[0].confidence).toBe("low");
    });
  });

  describe("Meta-line filtering", () => {
    test("skips 'Total ₹500' line", () => {
      const result = parseBillText("Tomato 500 g 40\nTotal ₹500");
      expect(result).toHaveLength(1);
      expect(result[0].itemNameGuess).toBe("Tomato");
    });

    test("skips tax/GST lines", () => {
      const result = parseBillText(
        "Milk 1 l 60\nTax 10%\nSubtotal ₹70"
      );
      expect(result).toHaveLength(1);
      expect(result[0].itemNameGuess).toBe("Milk");
    });

    test("skips invoice header/footer", () => {
      const result = parseBillText(
        "Invoice #123\nTomato 500 g 40\nThank you for shopping"
      );
      expect(result).toHaveLength(1);
      expect(result[0].itemNameGuess).toBe("Tomato");
    });

    test("skips separator lines", () => {
      const result = parseBillText(
        "Tomato 500 g 40\n----\nMilk 1 l 60"
      );
      expect(result).toHaveLength(2);
      expect(result[0].itemNameGuess).toBe("Tomato");
      expect(result[1].itemNameGuess).toBe("Milk");
    });
  });

  describe("Multiline bills", () => {
    test("parses a complete realistic bill", () => {
      const billText = `
        Store: Big Bazaar
        Date: 12-08-2024
        ---
        Tomato 500 g ₹40
        Milk 1 l 60
        Rice 1 kg 320
        Pen 10 piece 50
        Total ₹470
        Thank you
      `;
      const result = parseBillText(billText);
      expect(result).toHaveLength(4);
      expect(result[0].itemNameGuess).toBe("Tomato");
      expect(result[1].itemNameGuess).toBe("Milk");
      expect(result[2].itemNameGuess).toContain("Rice");
      expect(result[3].itemNameGuess).toContain("Pen");
    });

    test("handles empty lines and whitespace", () => {
      const billText = `
        Tomato 500 g 40

        Milk 1 l 60
        
      `;
      const result = parseBillText(billText);
      expect(result).toHaveLength(2);
    });
  });

  describe("Ambiguity warnings", () => {
    test("flags ambiguous units (pc, pk, box)", () => {
      const result1 = parseBillText("Item 5 pc 100");
      expect(result1[0].warnings.length).toBeGreaterThan(0);
      expect(result1[0].warnings[0]).toContain("ambiguous");
      expect(result1[0].confidence).toBe("medium");

      const result2 = parseBillText("Item 2 box 200");
      expect(result2[0].warnings.length).toBeGreaterThan(0);
    });

    test("flags when quantity/unit is missing", () => {
      const result = parseBillText("Eggs (dozen) 120");
      expect(result[0].warnings.length).toBeGreaterThan(0);
      expect(result[0].warnings[0]).toContain("manually");
    });

    test("flags when quantity is missing (price/unit pattern)", () => {
      const result = parseBillText("Oil 250/L");
      expect(result[0].warnings.length).toBeGreaterThan(0);
      expect(result[0].warnings[0]).toContain("quantity is unknown");
    });
  });

  describe("Unparseable lines", () => {
    test("returns low-confidence item for unparseable line", () => {
      const result = parseBillText("xyz abc def");
      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBe("low");
      expect(result[0].quantity).toBeNull();
      expect(result[0].unit).toBeNull();
      expect(result[0].price).toBeNull();
      expect(result[0].warnings.length).toBeGreaterThan(0);
      expect(result[0].warnings[0]).toContain("manual");
    });

    test("marks text-only lines as needing manual entry", () => {
      const result = parseBillText("Some random text");
      expect(result[0].confidence).toBe("low");
      expect(result[0].itemNameGuess).toBe("Some random text");
    });
  });

  describe("Real-world bill scenarios", () => {
    test("parses a typical vegetable market bill", () => {
      const billText = `
        Tomato 1 kg 80
        Onion 2.5 kg 75
        Carrot 500 g 40
        Cucumber 1 kg 30
        Total ₹225
      `;
      const result = parseBillText(billText);
      expect(result).toHaveLength(4);
      expect(result.every((item) => item.quantity !== null)).toBe(true);
      expect(result.every((item) => item.unit !== null)).toBe(true);
    });

    test("parses a grocery store bill with mixed formats", () => {
      const billText = `
        Rice 1 kg 320
        Dal 500 g 150
        Oil 1 l 250
        Milk 1 l 60
        Eggs (dozen) 120
        Salt 1 kg 30
      `;
      const result = parseBillText(billText);
      expect(result.length).toBeGreaterThanOrEqual(5);
    });

    test("handles price per unit format from wholesale stores", () => {
      const billText = `
        Tomato 40/kg
        Onion 25/kg
        Carrot 50/kg
      `;
      const result = parseBillText(billText);
      expect(result).toHaveLength(3);
      expect(result.every((item) => item.confidence === "medium")).toBe(true);
      expect(result.every((item) => item.quantity === null)).toBe(true);
    });
  });

  describe("Edge cases", () => {
    test("handles empty input", () => {
      const result = parseBillText("");
      expect(result).toHaveLength(0);
    });

    test("handles only whitespace", () => {
      const result = parseBillText("   \n\n  ");
      expect(result).toHaveLength(0);
    });

    test("handles only meta lines", () => {
      const result = parseBillText("Total 500\nThank you");
      expect(result).toHaveLength(0);
    });

    test("generates unique IDs for items", () => {
      const result = parseBillText(
        "Tomato 500 g 40\nMilk 1 l 60\nRice 1 kg 320"
      );
      const ids = new Set(result.map((item) => item.id));
      expect(ids.size).toBe(result.length);
    });
  });

  describe("Case insensitivity", () => {
    test("normalizes units to lowercase", () => {
      const result1 = parseBillText("Tomato 500 G 40");
      const result2 = parseBillText("Tomato 500 g 40");
      expect(result1[0].unit).toBe(result2[0].unit);
      expect(result1[0].unit).toBe("g");
    });

    test("handles 'KG', 'L', 'PC' correctly", () => {
      const result = parseBillText("Rice 1 KG 320\nMilk 1 L 60\nPen 5 PC 50");
      expect(result).toHaveLength(3);
      expect(result[0].unit).toBe("kg");
      expect(result[1].unit).toBe("l");
      expect(result[2].unit).toBe("pc");
    });
  });
});
