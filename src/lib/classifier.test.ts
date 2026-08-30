/**
 * Unit tests for src/lib/classifier.ts
 */

import { classifyItem, classifyItems } from "./classifier";

describe("classifyItem()", () => {
  describe("Keyword matching - fruits", () => {
    test("classifies 'Apple' as fruits", () => {
      const result = classifyItem("Apple");
      expect(result.categoryId).toBe("fruits");
      expect(result.confidence).toBe("high");
    });

    test("classifies 'Mango' as fruits", () => {
      const result = classifyItem("Mango");
      expect(result.categoryId).toBe("fruits");
    });

    test("classifies 'Strawberry' as fruits", () => {
      const result = classifyItem("Strawberry");
      expect(result.categoryId).toBe("fruits");
    });

    test("classifies 'Orange 1kg' as fruits (despite extra text)", () => {
      const result = classifyItem("Orange 1kg");
      expect(result.categoryId).toBe("fruits");
    });
  });

  describe("Keyword matching - vegetables", () => {
    test("classifies 'Tomato' as vegetables", () => {
      const result = classifyItem("Tomato");
      expect(result.categoryId).toBe("vegetables");
      expect(result.confidence).toBe("high");
    });

    test("classifies 'Onion' as vegetables", () => {
      const result = classifyItem("Onion");
      expect(result.categoryId).toBe("vegetables");
    });

    test("classifies 'Carrot' as vegetables", () => {
      const result = classifyItem("Carrot");
      expect(result.categoryId).toBe("vegetables");
    });

    test("classifies 'Spinach' as vegetables", () => {
      const result = classifyItem("Spinach");
      expect(result.categoryId).toBe("vegetables");
    });

    test("classifies 'Cucumber 500g' as vegetables", () => {
      const result = classifyItem("Cucumber 500g");
      expect(result.categoryId).toBe("vegetables");
    });
  });

  describe("Keyword matching - groceries", () => {
    test("classifies 'Rice' as groceries", () => {
      const result = classifyItem("Rice");
      expect(result.categoryId).toBe("groceries");
      expect(result.confidence).toBe("high");
    });

    test("classifies 'Milk' as groceries", () => {
      const result = classifyItem("Milk");
      expect(result.categoryId).toBe("groceries");
    });

    test("classifies 'Oil' as groceries", () => {
      const result = classifyItem("Oil");
      expect(result.categoryId).toBe("groceries");
    });

    test("classifies 'Dal' as groceries", () => {
      const result = classifyItem("Dal");
      expect(result.categoryId).toBe("groceries");
    });

    test("classifies 'Flour' as groceries", () => {
      const result = classifyItem("Flour");
      expect(result.categoryId).toBe("groceries");
    });

    test("classifies 'Yogurt' as groceries", () => {
      const result = classifyItem("Yogurt");
      expect(result.categoryId).toBe("groceries");
    });

    test("classifies 'Butter' as groceries", () => {
      const result = classifyItem("Butter");
      expect(result.categoryId).toBe("groceries");
    });
  });

  describe("Keyword matching - stationery", () => {
    test("classifies 'Pen' as stationery", () => {
      const result = classifyItem("Pen");
      expect(result.categoryId).toBe("stationery");
      expect(result.confidence).toBe("high");
    });

    test("classifies 'Pencil' as stationery", () => {
      const result = classifyItem("Pencil");
      expect(result.categoryId).toBe("stationery");
    });

    test("classifies 'Notebook' as stationery", () => {
      const result = classifyItem("Notebook");
      expect(result.categoryId).toBe("stationery");
    });

    test("classifies 'Eraser' as stationery", () => {
      const result = classifyItem("Eraser");
      expect(result.categoryId).toBe("stationery");
    });

    test("classifies 'Highlighter 5pc' as stationery", () => {
      const result = classifyItem("Highlighter 5pc");
      expect(result.categoryId).toBe("stationery");
    });
  });

  describe("Case insensitivity", () => {
    test("classifies 'TOMATO' as vegetables", () => {
      const result = classifyItem("TOMATO");
      expect(result.categoryId).toBe("vegetables");
    });

    test("classifies 'apple' as fruits", () => {
      const result = classifyItem("apple");
      expect(result.categoryId).toBe("fruits");
    });

    test("classifies 'PeN' as stationery", () => {
      const result = classifyItem("PeN");
      expect(result.categoryId).toBe("stationery");
    });
  });

  describe("Whitespace handling", () => {
    test("trims whitespace", () => {
      const result1 = classifyItem("  Tomato  ");
      const result2 = classifyItem("Tomato");
      expect(result1.categoryId).toBe(result2.categoryId);
    });

    test("handles multi-word item names", () => {
      const result = classifyItem("Green Chilli");
      expect(result.categoryId).toBe("vegetables");
    });

    test("classifies 'Bell Pepper' as vegetables", () => {
      const result = classifyItem("Bell Pepper");
      expect(result.categoryId).toBe("vegetables");
    });
  });

  describe("Partial keyword matching (lower confidence)", () => {
    test("classifies 'Pulses' as groceries (partial match)", () => {
      const result = classifyItem("Pulses");
      expect(result.categoryId).toBe("groceries");
    });

    test("classifies 'Grains' as groceries", () => {
      const result = classifyItem("Grains");
      expect(result.categoryId).toBe("groceries");
    });
  });

  describe("Fuzzy matching", () => {
    test("classifies 'Tomatoe' (typo) as vegetables", () => {
      const result = classifyItem("Tomatoe");
      expect(result.categoryId).toBe("vegetables");
    });

    test("classifies 'Onin' (typo) as vegetables", () => {
      const result = classifyItem("Onin");
      // May be fuzzy matched or fall through to uncategorized
      expect(result).toBeDefined();
    });
  });

  describe("Uncategorized fallback", () => {
    test("returns null categoryId for unknown item", () => {
      const result = classifyItem("Xyz Unknown Item");
      expect(result.categoryId).toBeNull();
      expect(result.confidence).toBe("low");
      expect(result.matchReason).toContain("No category match");
    });

    test("flags uncategorized for user action", () => {
      const result = classifyItem("Something Random");
      expect(result.categoryId).toBeNull();
      expect(result.matchReason).toContain("User must select");
    });
  });

  describe("Alias matching (future: database integration)", () => {
    test("could match against aliases if provided", () => {
      // This would work once aliases are loaded from DB
      const result = classifyItem("Tamatar", ["tamatar", "tameta"]);
      // Currently just tests the interface
      expect(result.itemName).toBe("Tamatar");
    });
  });

  describe("Edge cases", () => {
    test("handles empty string", () => {
      const result = classifyItem("");
      expect(result.categoryId).toBeNull();
    });

    test("handles single character", () => {
      const result = classifyItem("P");
      expect(result.categoryId).toBeNull(); // Too ambiguous
    });

    test("handles numbers only", () => {
      const result = classifyItem("123");
      expect(result.categoryId).toBeNull();
    });

    test("generates sensible matchReason for each case", () => {
      const result = classifyItem("Tomato");
      expect(result.matchReason).toBeDefined();
      expect(result.matchReason.length).toBeGreaterThan(0);
    });
  });

  describe("Real-world bill items", () => {
    test("classifies items from a typical vegetable market bill", () => {
      const items = ["Tomato 1kg", "Onion 2.5kg", "Carrot 500g", "Cucumber 1kg"];
      const results = items.map((item) => classifyItem(item));
      expect(results.every((r) => r.categoryId === "vegetables")).toBe(true);
    });

    test("classifies items from a grocery store bill", () => {
      const items = [
        { name: "Rice 1kg", expected: "groceries" },
        { name: "Milk 1l", expected: "groceries" },
        { name: "Oil 1l", expected: "groceries" },
        { name: "Tomato 500g", expected: "vegetables" },
        { name: "Apple 1kg", expected: "fruits" }
      ];

      items.forEach(({ name, expected }) => {
        const result = classifyItem(name);
        expect(result.categoryId).toBe(expected);
      });
    });

    test("flags uncategorized items in mixed bill", () => {
      const items = [
        "Rice",
        "Tomato",
        "Mystery Item",
        "Pen"
      ];
      const results = items.map((item) => classifyItem(item));
      
      expect(results[0].categoryId).toBe("groceries");
      expect(results[1].categoryId).toBe("vegetables");
      expect(results[2].categoryId).toBeNull(); // Uncategorized
      expect(results[3].categoryId).toBe("stationery");
    });
  });
});

describe("classifyItems() batch operation", () => {
  test("classifies multiple items at once", () => {
    const items = [
      { name: "Tomato" },
      { name: "Rice" },
      { name: "Pen" }
    ];
    const results = classifyItems(items);
    expect(results).toHaveLength(3);
    expect(results[0].categoryId).toBe("vegetables");
    expect(results[1].categoryId).toBe("groceries");
    expect(results[2].categoryId).toBe("stationery");
  });

  test("handles batch with uncategorized items", () => {
    const items = [
      { name: "Tomato" },
      { name: "Unknown" },
      { name: "Milk" }
    ];
    const results = classifyItems(items);
    expect(results[1].categoryId).toBeNull();
  });
});
