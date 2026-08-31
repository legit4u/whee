import express from "express";
import type { Express, Request, Response } from "express";
import pluralize from "pluralize";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Enable CORS for all routes
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// In-memory storage for testing (will be replaced with database)
const bills: Map<string, any> = new Map();
const categories = [
  { id: "fruits", label: "Fruits", canonicalUnit: "per_100g" },
  { id: "vegetables", label: "Vegetables", canonicalUnit: "per_100g" },
  { id: "groceries", label: "Groceries", canonicalUnit: "per_100g" },
  { id: "dairy", label: "Dairy", canonicalUnit: "per_100ml" },
  { id: "stationery", label: "Stationery", canonicalUnit: "per_piece" }
];

// Utility: Generate UUID
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Utility: Normalize item names
// - Converts to lowercase
// - Singularizes plural forms (e.g., "carrots" → "carrot")
function normalizeItemName(name: string): string {
  const lowercase = name.toLowerCase().trim();
  return pluralize.singular(lowercase);
}

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ============================================================================
// API Routes (v1)
// ============================================================================

// Categories
app.get("/v1/categories", (_req: Request, res: Response) => {
  res.json(categories);
});

// Items - Search
app.get("/v1/items/search", (req: Request, res: Response) => {
  const query = (req.query.q as string || "").toLowerCase();

  // Aggregate items from all bills
  const itemsMap: Record<string, any> = {};

  bills.forEach((bill) => {
    bill.items.forEach((item: any) => {
      // Normalize item name (lowercase, singularize)
      const normalizedName = normalizeItemName(item.itemName);
      const key = `${normalizedName}-${item.categoryId}`;

      if (!itemsMap[key]) {
        itemsMap[key] = {
          id: `item-${Object.keys(itemsMap).length}`,
          name: normalizedName,
          categoryId: item.categoryId,
          pricePoints: []
        };
      }

      itemsMap[key].pricePoints.push({
        normalizedValue: item.normalizedValue,
        normalizedUnit: item.normalizedUnit,
        storeName: bill.storeName,
        purchaseDate: bill.purchaseDate,
        rawPrice: item.rawPrice,
        rawUnit: item.rawUnit,
        rawQuantity: item.rawQuantity
      });
    });
  });

  // Filter by search query (normalize query for plurals)
  let results = Object.values(itemsMap);
  if (query) {
    const normalizedQuery = pluralize.singular(query);
    results = results.filter((item) =>
      item.name.includes(normalizedQuery) || normalizedQuery.includes(item.name)
    );
  }

  // Sort by name
  results.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`[GET /v1/items/search] Query: "${query}" returned ${results.length} items`);

  res.json({
    query,
    items: results,
    total: results.length
  });
});

// Items - Price history
app.get("/v1/items/:id/price-history", (_req: Request, res: Response) => {
  // TODO: Implement price history endpoint
  res.status(501).json({ error: "Not implemented" });
});

// Items - Nearby cheaper
app.get("/v1/items/:id/nearby-cheaper", (_req: Request, res: Response) => {
  // TODO: Implement nearby cheaper endpoint
  res.status(501).json({ error: "Not implemented" });
});

// Bills - Submit
app.post("/v1/bills", (req: Request, res: Response) => {
  try {
    const {
      storeName,
      storeLat,
      storeLng,
      purchaseDate,
      items,
      anonymousDeviceId
    } = req.body;

    console.log("[POST /v1/bills] Received request body:", JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!storeName || !purchaseDate || !items || !anonymousDeviceId) {
      console.log("[POST /v1/bills] Validation failed - missing fields");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log("[POST /v1/bills] Validation failed - invalid items array");
      res.status(400).json({ error: "Bill must contain at least one item" });
      return;
    }

    // Generate bill ID and price point IDs
    const billId = generateId();
    const pricePointIds = items.map(() => generateId());

    // Normalize item names (lowercase, singularize)
    const normalizedItems = items.map((item: any) => ({
      ...item,
      itemName: normalizeItemName(item.itemName)
    }));

    // Store bill (in-memory; will be database later)
    bills.set(billId, {
      id: billId,
      storeName,
      storeLat,
      storeLng,
      purchaseDate,
      items: normalizedItems,
      anonymousDeviceId,
      createdAt: new Date().toISOString()
    });

    // Log to console for debugging
    console.log(`✓ Bill submitted: ${billId}`);
    console.log(`  Store: ${storeName}`);
    console.log(`  Items: ${items.length}`);
    console.log(`  Total value: ₹${items.reduce((sum: number, item: any) => sum + (item.rawPrice || 0), 0).toFixed(2)}`);

    const responsePayload = {
      billId,
      pricePointIds
    };
    console.log("[POST /v1/bills] Sending response:", JSON.stringify(responsePayload));
    res.json(responsePayload);
  } catch (error) {
    console.error("Error submitting bill:", error);
    res.status(500).json({ error: "Failed to submit bill" });
  }
});

// Bills - Report
app.get("/v1/bills/:id/report", (_req: Request, res: Response) => {
  // TODO: Implement bill report endpoint
  res.status(501).json({ error: "Not implemented" });
});

// ============================================================================
// Error handling and server start
// ============================================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, _req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Whee API server listening on port ${PORT}`);
});

