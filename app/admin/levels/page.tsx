import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { levels } from "@/lib/db/schema";
import LevelsManager from "./LevelsManager";

export default async function AdminLevelsPage() {
  const all = await db.select().from(levels).orderBy(asc(levels.order));
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Levels</h1>
      <LevelsManager initialLevels={all} />
    </div>
  );
}
