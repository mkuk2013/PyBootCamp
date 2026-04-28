/**
 * Database client (singleton) — Turso (libSQL) + Drizzle ORM
 *
 * Usage:
 *   import { db } from "@/lib/db";
 *   const allUsers = await db.select().from(users);
 */

import { drizzle } from "drizzle-orm/libsql/web";
import { createClient, type Client } from "@libsql/client/web";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  throw new Error(
    "TURSO_DATABASE_URL is not set. Add it to .env.local (see .env.example)."
  );
}

/**
 * Reuse the Turso client across hot reloads in dev to avoid
 * creating dozens of connections.
 */
const globalForDb = globalThis as unknown as {
  _tursoClient: Client | undefined;
};

const client =
  globalForDb._tursoClient ??
  createClient({
    url,
    // Auth token is optional for local file:// urls
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._tursoClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
export type DB = typeof db;
