/**
 * GET /api/modules/[id]
 * Returns a module + its tasks (with completion flags for current user).
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { modules, tasks } from "@/lib/db/schema";
import { getPassedTaskIds } from "@/lib/progress";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const moduleId = Number(params.id);
  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id" }, { status: 400 });
  }

  const mod = await db
    .select()
    .from(modules)
    .where(eq(modules.id, moduleId))
    .get();
  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const moduleTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.moduleId, moduleId))
    .orderBy(tasks.order);

  const passed = await getPassedTaskIds(
    session.user.id,
    moduleTasks.map((t) => t.id)
  );

  return NextResponse.json({
    module: mod,
    tasks: moduleTasks.map((t) => ({ ...t, completed: passed.has(t.id) })),
  });
}
