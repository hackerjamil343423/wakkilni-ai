import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Neon HTTP client - uses HTTP instead of TCP for better serverless compatibility
 * This eliminates connection timeout issues with Neon's serverless architecture
 */
const sql = neon(process.env.DATABASE_URL);

/**
 * Drizzle ORM instance with full schema support
 */
export const db = drizzle(sql, { schema });

/**
 * Migration client - for drizzle-kit migrations
 * Note: For HTTP driver, we export the neon client directly
 */
export const migrationClient = sql;

/**
 * No-op graceful shutdown handler
 * HTTP driver doesn't maintain persistent connections, so nothing to close
 */
export async function closeDatabase() {
  // HTTP driver doesn't maintain persistent connections
}
