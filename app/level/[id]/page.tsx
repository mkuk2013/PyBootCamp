import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { levels } from "@/lib/db/schema";
import { getLevelsWithProgress, getModulesWithProgress } from "@/lib/progress";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";

export default async function LevelPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.approved && session.user.role !== "admin") {
    redirect("/pending");
  }

  const levelId = Number(params.id);
  if (Number.isNaN(levelId)) notFound();

  const level = await db.select().from(levels).where(eq(levels.id, levelId)).get();
  if (!level) notFound();

  // Verify the level is unlocked for this user
  const allWithProgress = await getLevelsWithProgress(session.user.id);
  const thisLevel = allWithProgress.find((l) => l.id === levelId);
  if (!thisLevel?.unlocked && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const mods = await getModulesWithProgress(levelId, session.user.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Level {level.order}: {level.title}
          </h1>
          {level.description && (
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {level.description}
            </p>
          )}
          {thisLevel && (
            <ProgressBar
              percent={thisLevel.percent}
              label={`${thisLevel.completedTasks} / ${thisLevel.totalTasks} tasks completed`}
              className="mt-4"
            />
          )}
        </div>

        <h2 className="mb-3 text-xl font-semibold">Modules</h2>
        <div className="space-y-3">
          {mods.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
              No modules in this level yet.
            </div>
          )}

          {mods.map((m) => {
            const done = m.totalTasks > 0 && m.completedTasks === m.totalTasks;
            return (
              <Link
                key={m.id}
                href={`/module/${m.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                    </span>
                    <div>
                      <h3 className="font-semibold">
                        {m.order}. {m.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.completedTasks} / {m.totalTasks} tasks
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
                <ProgressBar percent={m.percent} className="mt-3" />
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
