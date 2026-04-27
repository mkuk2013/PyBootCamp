import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Lock,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Flame,
  Target,
  Layers,
  Sparkles,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getLevelsWithProgress } from "@/lib/progress";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "admin") redirect("/admin");
  if (!session.user.approved) redirect("/pending");

  const allLevels = await getLevelsWithProgress(session.user.id);
  const totalTasks = allLevels.reduce((s, l) => s + l.totalTasks, 0);
  const totalCompleted = allLevels.reduce((s, l) => s + l.completedTasks, 0);
  const overall =
    totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);
  const currentLevel =
    allLevels.find((l) => l.unlocked && l.percent < 100) ??
    allLevels[allLevels.length - 1];

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero header */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-700 p-8 text-white shadow-xl shadow-brand-500/20 md:p-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {overall === 100
                ? "Bootcamp Complete!"
                : overall > 0
                ? "Keep the streak going"
                : "Let's get started"}
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-2 max-w-xl text-brand-100">
              {currentLevel
                ? `You're on Level ${currentLevel.order}: ${currentLevel.title}. ${
                    totalTasks - totalCompleted
                  } task${totalTasks - totalCompleted === 1 ? "" : "s"} to go.`
                : "Browse the levels below to start learning."}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {currentLevel && (
                <Link
                  href={`/level/${currentLevel.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md transition hover:bg-slate-100 active:scale-95"
                >
                  {overall === 0 ? "Start Learning" : "Continue Learning"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Trophy className="h-4 w-4" /> Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<Target className="h-5 w-5" />}
            color="from-brand-500 to-cyan-500"
            label="Overall Progress"
            value={`${overall}%`}
          >
            <ProgressBar percent={overall} className="mt-3" />
          </StatCard>
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            color="from-amber-500 to-rose-500"
            label="Tasks Completed"
            value={`${totalCompleted} / ${totalTasks}`}
          >
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {totalCompleted === 0
                ? "Solve your first task to begin."
                : `${totalTasks - totalCompleted} remaining`}
            </p>
          </StatCard>
          <StatCard
            icon={<Layers className="h-5 w-5" />}
            color="from-emerald-500 to-teal-500"
            label="Current Level"
            value={currentLevel?.title ?? "—"}
          >
            <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {currentLevel?.description ?? ""}
            </p>
          </StatCard>
        </div>

        {/* Levels list */}
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Your Path</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {allLevels.length} level{allLevels.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-4">
          {allLevels.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
              No levels yet. Ask the admin to add some.
            </div>
          )}

          {allLevels.map((lv) => {
            const completed = lv.percent === 100 && lv.totalTasks > 0;
            return (
              <div
                key={lv.id}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition ${
                  lv.unlocked
                    ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                    : "border-slate-200 bg-slate-50/60 opacity-75 dark:border-slate-800 dark:bg-slate-900/40"
                }`}
              >
                {completed && (
                  <div className="absolute right-0 top-0 h-20 w-20 -translate-y-10 translate-x-10 rotate-45 bg-emerald-400" />
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md ${
                        completed
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                          : lv.unlocked
                          ? "bg-gradient-to-br from-brand-500 to-cyan-500"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : lv.unlocked ? (
                        <Trophy className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Level {lv.order}
                        </span>
                        {completed && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            Done
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold">{lv.title}</h3>
                      {lv.description && (
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          {lv.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {lv.unlocked ? (
                    <Link
                      href={`/level/${lv.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-brand-700 hover:to-cyan-700 active:scale-95"
                    >
                      {completed ? "Review" : "Continue"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Lock className="h-3.5 w-3.5" /> Locked
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <ProgressBar
                    percent={lv.percent}
                    label={`${lv.completedTasks} / ${lv.totalTasks} tasks`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

function StatCard({
  icon,
  color,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      {children}
    </div>
  );
}
