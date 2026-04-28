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
  Zap,
  XCircle,
  Activity,
  Award,
  TrendingUp,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  getLevelsWithProgress,
  getStreak,
  getRecentActivity,
} from "@/lib/progress";
import { db } from "@/lib/db";
import { users, achievements, userAchievements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "admin") redirect("/admin");
  if (!session.user.approved) redirect("/pending");

  const [allLevels, streak, recent, user, userAchievementsData] = await Promise.all([
    getLevelsWithProgress(session.user.id),
    getStreak(session.user.id),
    getRecentActivity(session.user.id, 6),
    db.select().from(users).where(eq(users.id, session.user.id)).get(),
    db
      .select({
        id: achievements.id,
        name: achievements.name,
        icon: achievements.icon,
        badgeColor: achievements.badgeColor,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, session.user.id))
      .orderBy(userAchievements.unlockedAt),
  ]);

  if (!user) redirect("/login");

  const totalTasks = allLevels.reduce((s, l) => s + l.totalTasks, 0);
  const totalCompleted = allLevels.reduce((s, l) => s + l.completedTasks, 0);
  const overall =
    totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);
  const currentLevel =
    allLevels.find((l) => l.unlocked && l.percent < 100) ??
    allLevels[allLevels.length - 1];

  // XP progress to next level
  const currentXP = user.xp ?? 0;
  const userLevel = user.level ?? 1;
  const xpForNextLevel = getXpForLevel(userLevel + 1);
  const xpForCurrentLevel = getXpForLevel(userLevel);
  const xpProgress = Math.min(
    100,
    Math.round(((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)
  );

  function getXpForLevel(level: number): number {
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    return thresholds[Math.min(level - 1, thresholds.length - 1)] ?? 4500;
  }

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
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Target className="h-5 w-5" />}
            color="from-brand-500 to-cyan-500"
            label="Overall Progress"
            value={`${overall}%`}
          >
            <ProgressBar percent={overall} className="mt-3" />
          </StatCard>
          <StatCard
            icon={<Zap className="h-5 w-5" />}
            color="from-purple-500 to-pink-500"
            label="XP Points"
            value={`${currentXP} XP`}
          >
            <div className="mt-3">
              <ProgressBar percent={xpProgress} className="mb-1" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Level {userLevel} · {xpForNextLevel - currentXP} XP to Level {userLevel + 1}
              </p>
            </div>
          </StatCard>
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            color="from-orange-500 to-rose-500"
            label="Daily Streak"
            value={streak.current === 0 ? "0 days" : `${streak.current} day${streak.current === 1 ? "" : "s"}`}
          >
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              {streak.current > 0 ? (
                <>
                  <Flame className="h-3 w-3 text-orange-500" />
                  Best: {streak.longest} day{streak.longest === 1 ? "" : "s"}
                </>
              ) : (
                <>Solve a task today to start a streak!</>
              )}
            </p>
          </StatCard>
          <StatCard
            icon={<Award className="h-5 w-5" />}
            color="from-emerald-500 to-teal-500"
            label="Achievements"
            value={`${userAchievementsData.length}`}
          >
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {userAchievementsData.length === 0
                ? "Complete tasks to unlock badges!"
                : "Keep learning to earn more!"}
            </p>
          </StatCard>
        </div>

        {/* Additional detailed stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            color="from-blue-500 to-indigo-500"
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
            color="from-cyan-500 to-blue-500"
            label="Current Level"
            value={currentLevel?.title ?? "—"}
          >
            <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {currentLevel?.description ?? ""}
            </p>
          </StatCard>
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="from-green-500 to-emerald-500"
            label="Success Rate"
            value={recent.length > 0 ? `${Math.round((recent.filter(r => r.result === "pass").length / recent.length) * 100)}%` : "—"}
          >
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {recent.length > 0 ? "Based on recent attempts" : "No attempts yet"}
            </p>
          </StatCard>
        </div>

        {/* Recent activity */}
        {recent.length > 0 && (
          <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Activity className="h-5 w-5 text-brand-500" />
                Recent Activity
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Last {recent.length} attempt{recent.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/task/${r.taskId}`}
                    className="group flex items-center gap-3 py-3 transition hover:opacity-90"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        r.result === "pass"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {r.result === "pass" ? (
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      ) : (
                        <XCircle className="h-4.5 w-4.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                          {truncate(r.taskQuestion, 70)}
                        </span>
                        {r.result === "pass" && r.score > 0 && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            +{r.score}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {r.moduleTitle} · {timeAgo(r.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

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

function truncate(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n).trim() + "…" : s;
}

function timeAgo(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return d.toLocaleDateString();
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
