/**
 * CLI to quickly create or update an admin user.
 * Usage:
 *   npx tsx scripts/create-admin.ts --email=alice@x.com --password=Pass1234 --name="Alice"
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";

function getArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : undefined;
}

async function main() {
  const email = getArg("email") || process.env.ADMIN_EMAIL;
  const password = getArg("password") || process.env.ADMIN_PASSWORD;
  const name = getArg("name") || process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error(
      "❌  Provide --email=... --password=...  (or set ADMIN_EMAIL / ADMIN_PASSWORD in .env)"
    );
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const existing = await db.select().from(users).where(eq(users.email, email)).get();

  if (existing) {
    await db
      .update(users)
      .set({ password: hash, role: "admin", approved: true, name })
      .where(eq(users.email, email));
    console.log(`✅  Updated existing user → ${email} is now an approved admin.`);
  } else {
    await db.insert(users).values({
      name,
      email,
      password: hash,
      role: "admin",
      approved: true,
    });
    console.log(`✅  Admin created → ${email}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
