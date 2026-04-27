/**
 * Progress utilities — compute level/module completion + lock state for a user.
 *
 * Rules:
 *   - Level 1 (lowest order) is always unlocked.
 *   - Level N is unlocked iff user has completed every task in level N-1.
 *   - A task is "completed" iff user has ≥ 1 submission with result = 'pass'.
 */

import { eq, and, inArray } from "drizzle-orm";
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
};

/**
 * Returns all modules of a level with progress for the user.
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

  return mods.map((m) => {
    const tids = tasksByModule.get(m.id) ?? [];
    const completed = tids.filter((id) => passedTaskIds.has(id)).length;
    const percent = tids.length === 0 ? 0 : Math.round((completed / tids.length) * 100);
    return {
      id: m.id,
      title: m.title,
      order: m.order,
      totalTasks: tids.length,
      completedTasks: completed,
      percent,
    };
  });
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
