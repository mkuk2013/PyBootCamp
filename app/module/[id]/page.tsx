import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code,
  Sparkles,
  Trophy,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { modules, tasks } from "@/lib/db/schema";
import {
  getPassedTaskIds,
  getModulesWithProgress,
  getNextModule,
} from "@/lib/progress";
import Navbar from "@/components/Navbar";
import MarkdownContent from "@/components/MarkdownContent";

export default async function ModulePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.approved && session.user.role !== "admin") {
    redirect("/pending");
  }

  const moduleId = Number(params.id);
  if (Number.isNaN(moduleId)) notFound();

  const mod = await db.select().from(modules).where(eq(modules.id, moduleId)).get();
  if (!mod) notFound();

  // Module-level gating: enforce sequential unlock within the level.
  // Admins bypass the lock to preview content.
  const modulesInLevel = await getModulesWithProgress(mod.levelId, session.user.id);
  const thisProgress = modulesInLevel.find((m) => m.id === moduleId);
  const isAdmin = session.user.role === "admin";
  if (thisProgress && !thisProgress.unlocked && !isAdmin) {
    redirect(`/level/${mod.levelId}`);
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

  const moduleCompleted =
    moduleTasks.length > 0 &&
    moduleTasks.every((t) => passed.has(t.id));
  const nextModule = moduleCompleted ? await getNextModule(moduleId) : null;
  const firstUnsolvedTask = moduleTasks.find((t) => !passed.has(t.id));

  const difficultyColor: Record<string, string> = {
    easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href={`/level/${mod.levelId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Level
        </Link>

        <h1 className="mb-6 text-3xl font-bold">{mod.title}</h1>

        {/* Module-completed banner with "Next module" CTA */}
        {moduleCompleted && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-900/20 dark:via-slate-900 dark:to-teal-900/10">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                <Trophy className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold tracking-tight">
                  Module complete! 🎉
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {nextModule ? (
                    <>
                      The next module{" "}
                      <strong>&ldquo;{nextModule.title}&rdquo;</strong> is now
                      unlocked.
                    </>
                  ) : (
                    <>You&apos;ve finished every module in this level. Onward!</>
                  )}
                </p>
              </div>
              {nextModule ? (
                <Link
                  href={`/module/${nextModule.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/30 transition hover:shadow-glow active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  Next module
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={`/level/${mod.levelId}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/30 transition hover:shadow-glow active:scale-[0.98]"
                >
                  Back to level
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* In-progress: jump straight to the next unfinished task */}
        {!moduleCompleted && firstUnsolvedTask && passed.size > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-900/40 dark:bg-brand-900/20">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              <strong>{passed.size}</strong> /{" "}
              <strong>{moduleTasks.length}</strong> tasks done — keep the
              streak going.
            </p>
            <Link
              href={`/task/${firstUnsolvedTask.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-brand-700"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Lesson content */}
        <article className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <MarkdownContent content={mod.content} />
        </article>

        {/* Tasks */}
        <h2 className="mb-3 text-xl font-semibold">Practice Tasks</h2>
        <div className="space-y-3">
          {moduleTasks.length === 0 && (
            <p className="text-slate-500">No tasks in this module yet.</p>
          )}
          {moduleTasks.map((t, i) => {
            const done = passed.has(t.id);
            return (
              <Link
                key={t.id}
                href={`/task/${t.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-600"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      done
                        ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Code className="h-5 w-5" />}
                  </span>
                  <div>
                    <h3 className="font-medium">
                      Task {i + 1}: {t.question.slice(0, 80)}
                      {t.question.length > 80 && "…"}
                    </h3>
                    <span
                      className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        difficultyColor[t.difficulty]
                      }`}
                    >
                      {t.difficulty}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
