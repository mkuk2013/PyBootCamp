import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { modules, levels } from "@/lib/db/schema";
import ModulesManager from "./ModulesManager";

export default async function AdminModulesPage() {
  const [allModules, allLevels] = await Promise.all([
    db.select().from(modules).orderBy(asc(modules.levelId), asc(modules.order)),
    db.select().from(levels).orderBy(asc(levels.order)),
  ]);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Modules</h1>
      <ModulesManager initialModules={allModules} levels={allLevels} />
    </div>
  );
}
