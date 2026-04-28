import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { eq, and, asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, modules, submissions } from "@/lib/db/schema";
import { getNextModule } from "@/lib/progress";
import Navbar from "@/components/Navbar";
import TaskWorkspace from "@/components/TaskWorkspace";

export default async function TaskPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.approved && session.user.role !== "admin") {
    redirect("/pending");
  }

  const taskId = Number(params.id);
  if (Number.isNaN(taskId)) notFound();

  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) notFound();

  const mod = await db
    .select()
    .from(modules)
    .where(eq(modules.id, task.moduleId))
    .get();

  // Sibling tasks in the same module (ordered) for prev/next navigation
  const siblings = await db
    .select({
      id: tasks.id,
      order: tasks.order,
      difficulty: tasks.difficulty,
    })
    .from(tasks)
    .where(eq(tasks.moduleId, task.moduleId))
    .orderBy(asc(tasks.order), asc(tasks.id))
    .all();

  const idx = siblings.findIndex((t) => t.id === task.id);
  const prevTask = idx > 0 ? siblings[idx - 1] : null;
  const nextTask =
    idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const total = siblings.length;
  const position = idx + 1;

  // If this is the last task in the module, surface the next module so the
  // user can continue learning instead of bouncing back to the level page.
  const nextModule = !nextTask ? await getNextModule(task.moduleId) : null;

  // Check if user already passed this task
  const passed = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, session.user.id),
        eq(submissions.taskId, task.id),
        eq(submissions.result, "pass")
      )
    )
    .get();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/module/${task.moduleId}`}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {mod?.title ?? "Module"}
          </Link>
          {total > 0 && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Task {position} of {total}
            </span>
          )}
        </div>

        <h1 className="mb-6 text-2xl font-bold">
          {mod ? `${mod.title} — ` : ""}Practice Task
        </h1>

        <TaskWorkspace
          task={{
            id: task.id,
            moduleId: task.moduleId,
            question: task.question,
            starterCode: task.starterCode,
            expectedOutput: task.expectedOutput,
            difficulty: task.difficulty,
            testCases: task.testCases ?? null,
            hints: task.hints ?? null,
            examples: task.examples ?? null,
          }}
          initiallyCompleted={Boolean(passed)}
          prevTaskId={prevTask?.id ?? null}
          nextTaskId={nextTask?.id ?? null}
          nextModuleId={nextModule?.id ?? null}
          nextModuleTitle={nextModule?.title ?? null}
          levelId={mod?.levelId ?? null}
          position={position}
          total={total}
          moduleContent={mod?.content ?? null}
          moduleTitle={mod?.title ?? null}
        />
      </main>
    </>
  );
}
