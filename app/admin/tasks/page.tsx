import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, modules } from "@/lib/db/schema";
import TasksManager from "./TasksManager";

export default async function AdminTasksPage() {
  const [allTasks, allModules] = await Promise.all([
    db.select().from(tasks).orderBy(asc(tasks.moduleId), asc(tasks.order)),
    db.select().from(modules).orderBy(asc(modules.levelId), asc(modules.order)),
  ]);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Tasks</h1>
      <TasksManager initialTasks={allTasks} modules={allModules} />
    </div>
  );
}
