import { Pool } from "pg";
import type { QueryResult } from "pg";

/**
 * Database connection pool for Whee backend.
 * 
 * Supports Supabase PostgreSQL or any PostgreSQL database.
 * Connection string should be provided via DATABASE_URL env variable.
 */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("⚠️  DATABASE_URL not set. Running in in-memory mode (development only).");
}

// Create connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  // Connection pool settings
  max: 20, // max connections
  idleTimeoutMillis: 30000, // idle timeout
  connectionTimeoutMillis: 2000, // connection timeout
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

/**
 * Execute a database query.
 * Returns results or null if database is not connected.
 */
export async function query<T>(
  text: string,
  params?: any[]
): Promise<QueryResult<T> | null> {
  if (!databaseUrl) {
    console.warn(`[DB] Query attempted but DATABASE_URL not set: ${text.substring(0, 50)}...`);
    return null;
  }

  try {
    const result = await pool.query<T>(text, params);
    return result;
  } catch (error) {
    console.error("[DB] Query error:", error);
    throw error;
  }
}

/**
 * Get a single row from query results, or null if not found.
 */
export async function queryOne<T>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result?.rows[0] || null;
}

/**
 * Get multiple rows from query results.
 */
export async function queryMany<T>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result?.rows || [];
}

/**
 * Execute a query that returns no rows (INSERT, UPDATE, DELETE).
 */
export async function execute(
  text: string,
  params?: any[]
): Promise<number> {
  const result = await query(text, params);
  return result?.rowCount || 0;
}

/**
 * Check if database is connected.
 */
export async function isConnected(): Promise<boolean> {
  if (!databaseUrl) return false;
  
  try {
    const result = await query("SELECT 1");
    return result !== null;
  } catch {
    return false;
  }
}

/**
 * Close the connection pool (for testing or graceful shutdown).
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export { pool };
