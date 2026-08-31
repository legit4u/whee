import express, { Express, Request, Response } from "express";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

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

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ============================================================================
// API Routes (v1)
// ============================================================================

// Categories
app.get("/v1/categories", (req: Request, res: Response) => {
  res.json(categories);
});

// Items - Search
app.get("/v1/items/search", (req: Request, res: Response) => {
  // TODO: Implement item search endpoint
  res.status(501).json({ error: "Not implemented" });
});

// Items - Price history
app.get("/v1/items/:id/price-history", (req: Request, res: Response) => {
  // TODO: Implement price history endpoint
  res.status(501).json({ error: "Not implemented" });
});

// Items - Nearby cheaper
app.get("/v1/items/:id/nearby-cheaper", (req: Request, res: Response) => {
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

    // Validate required fields
    if (!storeName || !purchaseDate || !items || !anonymousDeviceId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Bill must contain at least one item" });
    }

    // Generate bill ID and price point IDs
    const billId = generateId();
    const pricePointIds = items.map(() => generateId());

    // Store bill (in-memory; will be database later)
    bills.set(billId, {
      id: billId,
      storeName,
      storeLat,
      storeLng,
      purchaseDate,
      items,
      anonymousDeviceId,
      createdAt: new Date().toISOString()
    });

    // Log to console for debugging
    console.log(`✓ Bill submitted: ${billId}`);
    console.log(`  Store: ${storeName}`);
    console.log(`  Items: ${items.length}`);
    console.log(`  Total value: ₹${items.reduce((sum: number, item: any) => sum + (item.rawPrice || 0), 0).toFixed(2)}`);

    res.json({
      billId,
      pricePointIds
    });
  } catch (error) {
    console.error("Error submitting bill:", error);
    res.status(500).json({ error: "Failed to submit bill" });
  }
});

// Bills - Report
app.get("/v1/bills/:id/report", (req: Request, res: Response) => {
  // TODO: Implement bill report endpoint
  res.status(501).json({ error: "Not implemented" });
});

// ============================================================================
// Error handling and server start
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Whee API server listening on port ${PORT}`);
});

