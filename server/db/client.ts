/**
 * Database Client - PostgreSQL connection and query execution
 * 
 * Abstraction layer for database operations. Supports:
 * - Supabase (managed PostgreSQL)
 * - Self-hosted PostgreSQL
 * 
 * Connection pooling and error handling built-in.
 */

import pg from "pg";
import type { PoolClient, QueryResult } from "pg";

const { Pool } = pg;

// Database configuration from environment
const DB_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

// Use DATABASE_URL if provided (Supabase), otherwise construct from individual vars
const connectionConfig = DB_URL
  ? { connectionString: DB_URL, max: 20 }
  : {
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      max: 20
    };

// Connection pool
const pool = new Pool(connectionConfig);

console.log("[DB] Connection pool initialized");
console.log("[DB] Config:", { 
  connectionString: DB_URL ? "set" : "not set",
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER ? "set" : "not set"
});

// Error handling
pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle client", err);
});

pool.on("connect", () => {
  console.log("[DB] Client connected to pool");
});

/**
 * Execute a query
 */
export async function query<T extends Record<string, any> = Record<string, any>>(
  text: string,
  values?: (string | number | boolean | null | undefined)[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  let client;
  try {
    client = await pool.connect();
    const result = await client.query<T>(text, values);
    const duration = Date.now() - start;
    console.log(`[DB] Executed query in ${duration}ms`, { rows: result.rowCount });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[DB] Query failed:", errorMessage);
    throw error;
  } finally {
    if (client) client.release();
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query("SELECT 1");
    return result.rows.length > 0;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code;
    console.error("[DB] Health check failed:");
    console.error("  Code:", errorCode);
    console.error("  Message:", errorMessage);
    if ((error as any)?.hostname) {
      console.error("  Hostname:", (error as any).hostname);
    }
    return false;
  }
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log("[DB] Connection pool closed");
}

export default { query, getClient, healthCheck, closePool };
