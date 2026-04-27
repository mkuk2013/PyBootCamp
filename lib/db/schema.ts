/**
 * Drizzle ORM schema for PyBootCamp
 * Database: Turso (libSQL / SQLite)
 *
 * Tables:
 *  - users         → authentication + admin approval
 *  - levels        → Beginner / Intermediate / Advanced
 *  - modules       → belong to a level
 *  - tasks         → coding exercises inside a module
 *  - submissions   → user attempts on tasks
 */

import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*                              USERS                                  */
/* ------------------------------------------------------------------ */
export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(), // bcrypt hash
    role: text("role", { enum: ["user", "admin"] })
      .notNull()
      .default("user"),
    approved: integer("approved", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    roleIdx: index("users_role_idx").on(t.role),
  })
);

/* ------------------------------------------------------------------ */
/*                              LEVELS                                 */
/* ------------------------------------------------------------------ */
export const levels = sqliteTable(
  "levels",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    orderIdx: uniqueIndex("levels_order_idx").on(t.order),
  })
);

/* ------------------------------------------------------------------ */
/*                              MODULES                                */
/* ------------------------------------------------------------------ */
export const modules = sqliteTable(
  "modules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    levelId: integer("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(), // Markdown allowed
    order: integer("order").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    levelIdx: index("modules_level_idx").on(t.levelId),
  })
);

/* ------------------------------------------------------------------ */
/*                               TASKS                                 */
/* ------------------------------------------------------------------ */
export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    starterCode: text("starter_code").default(""),
    expectedOutput: text("expected_output").notNull(),
    /** Optional JSON array of test cases:
     *  [{ "input": "...", "expected": "..." }]
     */
    testCases: text("test_cases"),
    /** Optional JSON array of progressive hint strings:
     *  ["First hint…", "Second hint…", "Final hint with the trick"]
     */
    hints: text("hints"),
    /** Optional Markdown — worked examples for this specific task.
     *  Rendered as a tab in the task workspace alongside the problem. */
    examples: text("examples"),
    difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] })
      .notNull()
      .default("easy"),
    order: integer("order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    moduleIdx: index("tasks_module_idx").on(t.moduleId),
  })
);

/* ------------------------------------------------------------------ */
/*                            SUBMISSIONS                              */
/* ------------------------------------------------------------------ */
export const submissions = sqliteTable(
  "submissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    result: text("result", { enum: ["pass", "fail"] }).notNull(),
    score: integer("score").notNull().default(0),
    output: text("output"),
    runtimeMs: integer("runtime_ms"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    userIdx: index("submissions_user_idx").on(t.userId),
    taskIdx: index("submissions_task_idx").on(t.taskId),
    userTaskIdx: index("submissions_user_task_idx").on(t.userId, t.taskId),
  })
);

/* ------------------------------------------------------------------ */
/*                             RELATIONS                               */
/* ------------------------------------------------------------------ */
export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
}));

export const levelsRelations = relations(levels, ({ many }) => ({
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  level: one(levels, {
    fields: [modules.levelId],
    references: [levels.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  module: one(modules, {
    fields: [tasks.moduleId],
    references: [modules.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [submissions.taskId],
    references: [tasks.id],
  }),
}));

/* ------------------------------------------------------------------ */
/*                       INFERRED TS TYPES                             */
/* ------------------------------------------------------------------ */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Level = typeof levels.$inferSelect;
export type NewLevel = typeof levels.$inferInsert;

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
