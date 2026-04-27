import type { Config } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // also load .env if present

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
