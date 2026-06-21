import { cache } from "react";
import { db } from "./index";
import { levels, modules, tasks, achievements } from "./schema";
import { asc, eq } from "drizzle-orm";
import { unstable_cache, revalidateTag } from "next/cache";

// Cache for 24 hours (86400 seconds) since we invalidate dynamically on update
const CACHE_TIME = 86400;

export const getCachedLevels = unstable_cache(
  async () => {
    console.log("CACHE MISS: Fetching all levels from DB...");
    return await db.select().from(levels).orderBy(asc(levels.order));
  },
  ["all-levels"],
  { revalidate: CACHE_TIME, tags: ["all-levels"] }
);

export const getCachedModules = unstable_cache(
  async () => {
    console.log("CACHE MISS: Fetching all modules from DB...");
    return await db.select().from(modules).orderBy(asc(modules.order));
  },
  ["all-modules"],
  { revalidate: CACHE_TIME, tags: ["all-modules"] }
);

export const getCachedAllTasks = unstable_cache(
  async () => {
    console.log("CACHE MISS: Fetching all tasks from DB...");
    return await db.select().from(tasks).orderBy(asc(tasks.order));
  },
  ["all-tasks"],
  { revalidate: CACHE_TIME, tags: ["all-tasks"] }
);

export const getCachedAchievements = unstable_cache(
  async () => {
    console.log("CACHE MISS: Fetching all achievements from DB...");
    return await db.select().from(achievements).orderBy(asc(achievements.xpRequired));
  },
  ["all-achievements"],
  { revalidate: CACHE_TIME, tags: ["all-achievements"] }
);

export const getCachedTask = (taskId: number) => unstable_cache(
  async () => {
    console.log(`CACHE MISS: Fetching task ${taskId} from DB...`);
    return await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  },
  [`task-${taskId}`],
  { revalidate: CACHE_TIME, tags: [`task-${taskId}`] }
)();

// Cache invalidation helpers
export function revalidateLevels() {
  try {
    revalidateTag("all-levels");
  } catch {}
}

export function revalidateModules() {
  try {
    revalidateTag("all-modules");
    revalidateTag("all-levels");
  } catch {}
}

export function revalidateTask(taskId: number) {
  try {
    revalidateTag(`task-${taskId}`);
    revalidateTag("all-tasks");
    revalidateTag("all-modules");
    revalidateTag("all-levels");
  } catch {}
}


