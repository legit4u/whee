import express, { Express, Request, Response } from "express";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ============================================================================
// API Routes (v1)
// ============================================================================

// Categories
app.get("/v1/categories", (req: Request, res: Response) => {
  // TODO: Implement categories endpoint
  res.status(501).json({ error: "Not implemented" });
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
  // TODO: Implement bill submission endpoint
  res.status(501).json({ error: "Not implemented" });
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
