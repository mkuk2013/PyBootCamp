/**
 * Progress utilities — compute level/module completion + lock state for a user.
 *
 * Rules:
 *   - Level 1 (lowest order) is always unlocked.
 *   - Level N is unlocked iff user has completed every task in level N-1.
 *   - A task is "completed" iff user has ≥ 1 submission with result = 'pass'.
 */

import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { levels, modules, tasks, submissions } from "@/lib/db/schema";

export type LevelProgress = {
  id: number;
  title: string;
  description: string | null;
  order: number;
  totalTasks: number;
  completedTasks: number;
  percent: number;
  unlocked: boolean;
};

/**
 * Returns all levels with progress info for the given user.
 */
export async function getLevelsWithProgress(
  userId: string
): Promise<LevelProgress[]> {
  // 1) all levels (sorted by order)
  const allLevels = await db.select().from(levels).orderBy(levels.order);

  if (allLevels.length === 0) return [];

  const levelIds = allLevels.map((l) => l.id);

  // 2) all modules belonging to these levels
  const allModules = await db
    .select()
    .from(modules)
    .where(inArray(modules.levelId, levelIds));

  const moduleIds = allModules.map((m) => m.id);

  // 3) all tasks for those modules
  const allTasks = moduleIds.length
    ? await db.select().from(tasks).where(inArray(tasks.moduleId, moduleIds))
    : [];

  // 4) user's passing submissions (distinct task ids)
  const passedTaskIds = new Set<number>();
  if (allTasks.length > 0) {
    const taskIds = allTasks.map((t) => t.id);
    const passed = await db
      .select({ taskId: submissions.taskId })
      .from(submissions)
      .where(
        and(
          eq(submissions.userId, userId),
          eq(submissions.result, "pass"),
          inArray(submissions.taskId, taskIds)
        )
      );
    passed.forEach((p) => passedTaskIds.add(p.taskId));
  }

  // 5) reduce per level
  const moduleByLevel = new Map<number, number[]>(); // levelId → moduleIds[]
  allModules.forEach((m) => {
    const arr = moduleByLevel.get(m.levelId) ?? [];
    arr.push(m.id);
    moduleByLevel.set(m.levelId, arr);
  });

  const tasksByModule = new Map<number, number[]>(); // moduleId → taskIds[]
  allTasks.forEach((t) => {
    const arr = tasksByModule.get(t.moduleId) ?? [];
    arr.push(t.id);
    tasksByModule.set(t.moduleId, arr);
  });

  const result: LevelProgress[] = [];
  let previousFullyComplete = true; // level 1 always unlocked

  for (const lv of allLevels) {
    const modIds = moduleByLevel.get(lv.id) ?? [];
    const taskIds = modIds.flatMap((mid) => tasksByModule.get(mid) ?? []);

    const total = taskIds.length;
    const completed = taskIds.filter((id) => passedTaskIds.has(id)).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    result.push({
      id: lv.id,
      title: lv.title,
      description: lv.description,
      order: lv.order,
      totalTasks: total,
      completedTasks: completed,
      percent,
      unlocked: previousFullyComplete,
    });

    // unlock the next level only if this one is fully complete (and has tasks)
    previousFullyComplete = total > 0 && completed === total;
  }

  return result;
}

export type ModuleProgress = {
  id: number;
  title: string;
  order: number;
  totalTasks: number;
  completedTasks: number;
  percent: number;
  /** True iff every task in this module has at least one passing submission. */
  completed: boolean;
  /**
   * True iff this module is accessible. Module 1 (lowest order) is always
   * unlocked; subsequent modules unlock automatically when the previous one
   * is fully completed.
   */
  unlocked: boolean;
};

/**
 * Returns all modules of a level with progress for the user.
 *
 * Unlock rules:
 *   - The first module (lowest `order`) is always unlocked.
 *   - Every other module is unlocked iff the previous module is fully
 *     completed (every task has a passing submission).
 *   - A module with no tasks does NOT unlock the next one (it's a dead end
 *     that admins should fix).
 */
export async function getModulesWithProgress(
  levelId: number,
  userId: string
): Promise<ModuleProgress[]> {
  const mods = await db
    .select()
    .from(modules)
    .where(eq(modules.levelId, levelId))
    .orderBy(modules.order);

  if (mods.length === 0) return [];

  const moduleIds = mods.map((m) => m.id);
  const allTasks = await db
    .select()
    .from(tasks)
    .where(inArray(tasks.moduleId, moduleIds));

  const taskIds = allTasks.map((t) => t.id);
  const passedTaskIds = new Set<number>();
  if (taskIds.length > 0) {
    const passed = await db
      .select({ taskId: submissions.taskId })
      .from(submissions)
      .where(
        and(
          eq(submissions.userId, userId),
          eq(submissions.result, "pass"),
          inArray(submissions.taskId, taskIds)
        )
      );
    passed.forEach((p) => passedTaskIds.add(p.taskId));
  }

  const tasksByModule = new Map<number, number[]>();
  allTasks.forEach((t) => {
    const arr = tasksByModule.get(t.moduleId) ?? [];
    arr.push(t.id);
    tasksByModule.set(t.moduleId, arr);
  });

  let prevCompleted = true; // first module always unlocked
  return mods.map((m) => {
    const tids = tasksByModule.get(m.id) ?? [];
    const completed = tids.filter((id) => passedTaskIds.has(id)).length;
    const percent =
      tids.length === 0 ? 0 : Math.round((completed / tids.length) * 100);
    const isCompleted = tids.length > 0 && completed === tids.length;
    const unlocked = prevCompleted;
    prevCompleted = isCompleted;
    return {
      id: m.id,
      title: m.title,
      order: m.order,
      totalTasks: tids.length,
      completedTasks: completed,
      percent,
      completed: isCompleted,
      unlocked,
    };
  });
}

/**
 * Returns the module that comes immediately after `moduleId` in its level
 * (sorted by `order`), or `null` if it's the last one.
 *
 * Used to render a "Next module" CTA once the user finishes a module.
 */
export async function getNextModule(moduleId: number): Promise<{
  id: number;
  title: string;
  order: number;
} | null> {
  const current = await db
    .select({ id: modules.id, levelId: modules.levelId, order: modules.order })
    .from(modules)
    .where(eq(modules.id, moduleId))
    .get();
  if (!current) return null;

  const siblings = await db
    .select({ id: modules.id, title: modules.title, order: modules.order })
    .from(modules)
    .where(eq(modules.levelId, current.levelId))
    .orderBy(modules.order);

  const idx = siblings.findIndex((m) => m.id === current.id);
  if (idx < 0 || idx === siblings.length - 1) return null;
  return siblings[idx + 1];
}

/**
 * Compute the user's daily learning streak.
 *
 * A "streak" = number of consecutive days (ending today or yesterday) on
 * which the user has at least one passing submission. We allow "yesterday"
 * as the most-recent day so a user doesn't lose their streak the moment
 * UTC ticks over.
 */
export async function getStreak(userId: string): Promise<{
  current: number;
  longest: number;
  lastActiveDay: string | null;
}> {
  const rows = await db
    .select({ createdAt: submissions.createdAt })
    .from(submissions)
    .where(
      and(eq(submissions.userId, userId), eq(submissions.result, "pass"))
    );

  if (rows.length === 0) {
    return { current: 0, longest: 0, lastActiveDay: null };
  }

  const dayKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const days = new Set<string>();
  for (const r of rows) {
    const d = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
    days.add(dayKey(d));
  }
  const sorted = Array.from(days).sort(); // ascending YYYY-MM-DD

  // Longest streak across all history
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current streak: walk back from today/yesterday
  const today = new Date();
  const todayKey = dayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = dayKey(yesterday);

  let current = 0;
  const cursor = days.has(todayKey)
    ? new Date(today)
    : days.has(yesterdayKey)
    ? new Date(yesterday)
    : null;
  if (cursor) {
    while (days.has(dayKey(cursor))) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return {
    current,
    longest,
    lastActiveDay: sorted[sorted.length - 1] ?? null,
  };
}

export type RecentActivity = {
  id: number;
  taskId: number;
  taskQuestion: string;
  moduleId: number;
  moduleTitle: string;
  result: "pass" | "fail";
  score: number;
  createdAt: Date;
};

/**
 * Get the user's most recent submissions with task/module context.
 */
export async function getRecentActivity(
  userId: string,
  limit = 8
): Promise<RecentActivity[]> {
  const rows = await db
    .select({
      id: submissions.id,
      taskId: submissions.taskId,
      result: submissions.result,
      score: submissions.score,
      createdAt: submissions.createdAt,
      taskQuestion: tasks.question,
      moduleId: tasks.moduleId,
      moduleTitle: modules.title,
    })
    .from(submissions)
    .innerJoin(tasks, eq(submissions.taskId, tasks.id))
    .innerJoin(modules, eq(tasks.moduleId, modules.id))
    .where(eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    taskId: r.taskId,
    taskQuestion: r.taskQuestion,
    moduleId: r.moduleId,
    moduleTitle: r.moduleTitle,
    result: r.result,
    score: r.score,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
  }));
}

/**
 * Get the set of task IDs the user has already passed (for a list of tasks).
 */
export async function getPassedTaskIds(
  userId: string,
  taskIds: number[]
): Promise<Set<number>> {
  const out = new Set<number>();
  if (taskIds.length === 0) return out;
  const rows = await db
    .select({ taskId: submissions.taskId })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        eq(submissions.result, "pass"),
        inArray(submissions.taskId, taskIds)
      )
    );
  rows.forEach((r) => out.add(r.taskId));
  return out;
}
