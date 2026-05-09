import { cache } from "react";
import { db } from "./index";
import { levels, modules, tasks } from "./schema";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Cache for 1 hour
const CACHE_TIME = 3600;

export const getCachedLevels = unstable_cache(
  async () => {
    console.log("CACHE MISS: Fetching all levels from DB...");
    return await db.select().from(levels).orderBy(asc(levels.order));
  },
  ["all-levels"],
  { revalidate: CACHE_TIME }
);

export const getCachedModules = unstable_cache(
  async () => {
    console.log("CACHE MISS: Fetching all modules from DB...");
    return await db.select().from(modules).orderBy(asc(modules.order));
  },
  ["all-modules"],
  { revalidate: CACHE_TIME }
);

export const getCachedTask = (taskId: number) => unstable_cache(
  async () => {
    console.log(`CACHE MISS: Fetching task ${taskId} from DB...`);
    return await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  },
  [`task-${taskId}`],
  { revalidate: CACHE_TIME }
)();
