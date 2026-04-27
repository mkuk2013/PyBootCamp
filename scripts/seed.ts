/**
 * Seed script — populates the database with:
 *   1. A default admin user  (from .env)
 *   2. Three levels (Beginner / Intermediate / Advanced)
 *   3. Sample modules + tasks for the Beginner level
 *
 * Run with:  npm run db:seed
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();
import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { users, levels, modules, tasks } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱  Seeding database...\n");

  /* ---------------------- 1) Admin user ---------------------- */
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pybootcamp.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME ?? "Super Admin";

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .get();

  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({
      name: adminName,
      email: adminEmail,
      password: hash,
      role: "admin",
      approved: true,
    });
    console.log(`✅  Admin created → ${adminEmail}`);
  } else {
    console.log(`ℹ️   Admin already exists → ${adminEmail}`);
  }

  /* ---------------------- 2) Levels -------------------------- */
  const levelData = [
    { title: "Beginner", description: "Python basics: variables, types, IO, control flow.", order: 1 },
    { title: "Intermediate", description: "Functions, OOP, modules, error handling, files.", order: 2 },
    { title: "Advanced", description: "Decorators, generators, async, testing, packaging.", order: 3 },
  ];

  for (const lv of levelData) {
    const exists = await db.select().from(levels).where(eq(levels.order, lv.order)).get();
    if (!exists) {
      await db.insert(levels).values(lv);
      console.log(`✅  Level created → ${lv.title}`);
    }
  }

  /* ---------------------- 3) Sample modules + tasks ---------- */
  const beginner = await db.select().from(levels).where(eq(levels.order, 1)).get();
  if (!beginner) throw new Error("Beginner level not found after insert");

  const beginnerModules = await db
    .select()
    .from(modules)
    .where(eq(modules.levelId, beginner.id));

  if (beginnerModules.length === 0) {
    // Module 1 — Hello World
    const [mod1] = await db
      .insert(modules)
      .values({
        levelId: beginner.id,
        title: "Hello, Python!",
        order: 1,
        content: `# Hello, Python!

Welcome to your first Python lesson.

Python uses the \`print()\` function to display text on the screen.

\`\`\`python
print("Hello, World!")
\`\`\`

The text inside the quotes is called a **string**. Strings can be enclosed
in single (\`'...'\`) or double (\`"..."\`) quotes.`,
      })
      .returning();

    await db.insert(tasks).values([
      {
        moduleId: mod1.id,
        question: "Print the exact text:  Hello, World!",
        starterCode: "# Write your code below\n",
        expectedOutput: "Hello, World!",
        difficulty: "easy",
        order: 1,
      },
      {
        moduleId: mod1.id,
        question: "Print your name on one line and 'Welcome to PyBootCamp!' on the next.",
        starterCode: "# Hint: use print() twice\n",
        expectedOutput: "Your Name\nWelcome to PyBootCamp!",
        difficulty: "easy",
        order: 2,
      },
    ]);

    // Module 2 — Variables & Types
    const [mod2] = await db
      .insert(modules)
      .values({
        levelId: beginner.id,
        title: "Variables and Data Types",
        order: 2,
        content: `# Variables & Data Types

Variables are containers for storing data values.

\`\`\`python
name = "Ali"      # str
age  = 21         # int
pi   = 3.14       # float
ok   = True       # bool
\`\`\`

You can check the type with \`type(x)\` and combine values with f-strings:

\`\`\`python
print(f"{name} is {age} years old")
\`\`\``,
      })
      .returning();

    await db.insert(tasks).values([
      {
        moduleId: mod2.id,
        question:
          "Create a variable `age` set to 25 and print:  I am 25 years old",
        starterCode: "age = \n# print here\n",
        expectedOutput: "I am 25 years old",
        difficulty: "easy",
        order: 1,
      },
      {
        moduleId: mod2.id,
        question:
          "Given a = 7 and b = 3, print their sum, difference, product and integer division — each on a separate line.",
        starterCode: "a = 7\nb = 3\n# print results\n",
        expectedOutput: "10\n4\n21\n2",
        difficulty: "medium",
        order: 2,
      },
    ]);

    // Module 3 — Control Flow
    const [mod3] = await db
      .insert(modules)
      .values({
        levelId: beginner.id,
        title: "Control Flow: if / else",
        order: 3,
        content: `# Conditional Statements

Use \`if\`, \`elif\`, and \`else\` to make decisions.

\`\`\`python
n = 10
if n > 0:
    print("positive")
elif n == 0:
    print("zero")
else:
    print("negative")
\`\`\``,
      })
      .returning();

    await db.insert(tasks).values([
      {
        moduleId: mod3.id,
        question:
          "Read variable n = -5. Print 'positive', 'zero', or 'negative' based on its value.",
        starterCode: "n = -5\n# your code\n",
        expectedOutput: "negative",
        difficulty: "easy",
        order: 1,
      },
    ]);

    console.log(`✅  Seeded 3 modules + 5 tasks under Beginner level`);
  } else {
    console.log("ℹ️   Beginner modules already seeded — skipping");
  }

  console.log("\n🎉  Seeding complete.\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  });
