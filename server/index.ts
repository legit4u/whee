import "dotenv/config";
import express from "express";
import type { Express, Request, Response } from "express";
import pluralize from "pluralize";
import { randomUUID } from "crypto";
import { storeBill } from "./db/bills";
import { searchItems } from "./db/items";
import { healthCheck } from "./db/client";
import type { BillSubmitRequest } from "./types";

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

// Utility: Normalize item names
// - Converts to lowercase
// - Singularizes plural forms (e.g., "carrots" → "carrot")
function normalizeItemName(name: string): string {
  const lowercase = name.toLowerCase().trim();
  return pluralize.singular(lowercase);
}

// Categories (static data)
const categories = [
  { id: "fruits", label: "Fruits", canonicalUnit: "per_100g" },
  { id: "vegetables", label: "Vegetables", canonicalUnit: "per_100g" },
  { id: "groceries", label: "Groceries", canonicalUnit: "per_100g" },
  { id: "dairy", label: "Dairy", canonicalUnit: "per_100ml" },
  { id: "stationery", label: "Stationery", canonicalUnit: "per_piece" }
];

// Health check
app.get("/health", async (_req: Request, res: Response) => {
  const dbHealthy = await healthCheck();
  res.json({ 
    status: dbHealthy ? "ok" : "error",
    database: dbHealthy ? "connected" : "disconnected"
  });
});

// ============================================================================
// API Routes (v1)
// ============================================================================

// Categories
app.get("/v1/categories", (_req: Request, res: Response) => {
  res.json(categories);
});

// Items - Search
app.get("/v1/items/search", async (req: Request, res: Response) => {
  try {
    const queryParam = (req.query.q as string) || "";
    
    // Normalize search query
    const normalizedQuery = queryParam ? pluralize.singular(queryParam.toLowerCase()) : "";

    const result = await searchItems(normalizedQuery);

    console.log(`[GET /v1/items/search] Query: "${queryParam}" returned ${result.total} items`);

    res.json(result);
  } catch (error) {
    console.error("[GET /v1/items/search] Error:", error);
    res.status(500).json({ error: "Failed to search items" });
  }
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
app.post("/v1/bills", async (req: Request, res: Response) => {
  try {
    const {
      storeName,
      storeLat,
      storeLng,
      purchaseDate,
      items,
      anonymousDeviceId
    }: BillSubmitRequest = req.body;

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

    // Generate bill ID
    const billId = randomUUID();

    // Normalize item names (lowercase, singularize)
    const normalizedItems = items.map((item) => ({
      ...item,
      itemName: normalizeItemName(item.itemName)
    }));

    // Store bill in database
    const response = await storeBill(
      billId,
      storeName,
      storeLat,
      storeLng,
      purchaseDate,
      normalizedItems,
      anonymousDeviceId
    );

    // Log to console for debugging
    console.log(`✓ Bill submitted: ${billId}`);
    console.log(`  Store: ${storeName}`);
    console.log(`  Items: ${items.length}`);
    console.log(`  Total value: ₹${items.reduce((sum: number, item: any) => sum + (item.rawPrice || 0), 0).toFixed(2)}`);

    console.log("[POST /v1/bills] Sending response:", JSON.stringify(response));
    res.json(response);
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

