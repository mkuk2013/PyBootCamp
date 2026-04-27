/**
 * Diagnostic: show the raw bytes of a task's expectedOutput so we can detect
 * literal-`\n` (escape) issues vs real newlines.
 *
 * Usage: npm run db:check-task -- --id=3
 *        npm run db:check-task -- --module=1
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { tasks } from "../lib/db/schema";

function arg(name: string) {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split("=").slice(1).join("=") : undefined;
}

function describe(s: string | null | undefined) {
  if (s == null) return "(null)";
  const bytes = Buffer.from(s, "utf8");
  return {
    length: s.length,
    bytes: bytes.length,
    hasRealLF: s.includes("\n"),
    hasLiteralBackslashN: /\\n/.test(s),
    hasCRLF: s.includes("\r\n"),
    repr: JSON.stringify(s),
    hex: bytes.toString("hex"),
  };
}

async function main() {
  const id = arg("id");
  const moduleId = arg("module");

  let rows;
  if (id) {
    rows = await db.select().from(tasks).where(eq(tasks.id, Number(id))).all();
  } else if (moduleId) {
    rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.moduleId, Number(moduleId)))
      .orderBy(tasks.order)
      .all();
  } else {
    rows = await db.select().from(tasks).orderBy(tasks.id).limit(10).all();
  }

  for (const t of rows) {
    console.log("---------------------------------------------");
    console.log(`Task #${t.id}  (module ${t.moduleId}, order ${t.order})`);
    console.log("question        :", JSON.stringify(t.question.slice(0, 80)));
    console.log("expectedOutput  :", describe(t.expectedOutput));
    console.log("starterCode     :", describe(t.starterCode));
    console.log("testCases       :", describe(t.testCases));
    console.log("hints           :", describe(t.hints));
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
