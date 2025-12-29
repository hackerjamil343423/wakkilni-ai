import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;

/**
 * PostgreSQL connection configuration optimized for Neon serverless
 * See: https://neon.tech/docs/serverless/serverless-driver
 */
const postgresConfig = {
  // Connection pool settings
  max: 10, // Maximum number of connections in the pool

  // Timeout settings (in seconds)
  connect_timeout: 30, // Time to establish new connection
  idle_timeout: 20, // Close idle connections after this time
  statement_timeout: 60, // Maximum time for query execution

  // Neon-specific optimizations
  // Disable prepared statements for serverless (recommended for Neon)
  prepared: false,

  // Connection metadata
  connection: {
    application_name: 'wakklni-ai',
  },

  // Keep alive for better connection reuse
  keepalive: 60,

  // Enable SSL for Neon (required)
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? undefined : 'require' as const,
};

/**
 * Migration client - single connection for schema changes
 */
export const migrationClient = postgres(connectionString, {
  ...postgresConfig,
  max: 1,
});

/**
 * Query client - connection pool for application queries
 */
const queryClient = postgres(connectionString, postgresConfig);

/**
 * Drizzle ORM instance
 */
export const db = drizzle(queryClient, { schema });

/**
 * Graceful shutdown handler
 */
export async function closeDatabase() {
  await queryClient.end();
}
