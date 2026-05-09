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
import { users, achievements, userAchievements, levels, modules, submissions } from "@/lib/db/schema";
import { eq, asc, desc, sql } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import PythonLogo from "@/components/PythonLogo";
import SkillProgress from "@/components/SkillProgress";
import { getCachedLevels, getCachedModules } from "@/lib/db/cache";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "admin") redirect("/admin");
  if (!session.user.approved) redirect("/pending");

  // 1. Parallel Data Fetching
  const [user, allLevels, allModulesData, streak, recent, userAchievementsData] = await Promise.all([
    db.select().from(users).where(eq(users.id, session.user.id)).get(),
    getLevelsWithProgress(session.user.id),
    db.select().from(modules).orderBy(asc(modules.order)),
    getStreak(session.user.id),
    getRecentActivity(session.user.id, 6),
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

  const searchItems = [
    ...(await getCachedLevels()).map(l => ({
      id: `l-${l.id}`,
      title: l.title,
      type: "level" as const,
      href: `/level/${l.id}`,
      descriptionText: l.description || "Level details"
    })),
    ...(await getCachedModules()).map(m => ({
      id: `m-${m.id}`,
      title: m.title,
      type: "module" as const,
      href: `/module/${m.id}`,
      descriptionText: "Lesson content"
    }))
  ];

  return (
    <>
      <Navbar searchItems={searchItems} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 1. MISSION CONTROL HEADER */}
        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          {/* Welcome Card */}
          <div className="relative col-span-2 overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl dark:bg-slate-900 md:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-py-300/10 blur-[80px]" />
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
                  <PythonLogo size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                    Mission Control
                  </h1>
                  <p className="text-slate-400">Welcome back, explorer {firstName}.</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {currentLevel && (
                  <Link
                    href={`/level/${currentLevel.id}`}
                    className="group inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
                  >
                    Resume: {currentLevel.title}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white backdrop-blur-xl transition-all hover:bg-white/10"
                >
                  <Trophy className="h-4 w-4 text-py-300" />
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Daily Goal</h2>
              <Target className="h-5 w-5 text-brand-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{totalCompleted % 5}</span>
                  <span className="text-slate-500"> / 5 tasks</span>
                </div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                  {(totalCompleted % 5) >= 5 ? "Complete!" : "In Progress"}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, ((totalCompleted % 5) / 5) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete 5 tasks today to earn a <span className="font-bold text-orange-500">Bonus XP Pack!</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. STATS ROW */}
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
                Level {userLevel} · {xpForNextLevel - currentXP} XP to next
              </p>
            </div>
          </StatCard>
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            color="from-orange-500 to-rose-500"
            label="Daily Streak"
            value={`${streak.current} days`}
          >
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Longest: {streak.longest} days
            </p>
          </StatCard>
          <StatCard
            icon={<Award className="h-5 w-5" />}
            color="from-emerald-500 to-teal-500"
            label="Achievements"
            value={`${userAchievementsData.length}`}
          >
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Unlocking your potential
            </p>
          </StatCard>
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Learning Path */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black tracking-tight">
              <Sparkles className="h-6 w-6 text-brand-500" />
              Learning Path
            </h2>
            <div className="space-y-4">
              {allLevels.map((lv) => {
                const completed = lv.percent === 100 && lv.totalTasks > 0;
                return (
                  <div
                    key={lv.id}
                    className={`group relative overflow-hidden rounded-[1.5rem] border p-6 transition-all ${
                      lv.unlocked
                        ? "border-slate-200 bg-white hover:border-brand-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                        : "border-slate-100 bg-slate-50/50 opacity-60 dark:border-slate-800/50 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${
                          completed ? "bg-emerald-500 shadow-emerald-500/20" : 
                          lv.unlocked ? "bg-brand-500 shadow-brand-500/20" : "bg-slate-300"
                        }`}>
                          {completed ? <CheckCircle2 className="h-7 w-7" /> : 
                           lv.unlocked ? <Trophy className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Level {lv.order}</span>
                          <h3 className="text-xl font-bold">{lv.title}</h3>
                          <p className="text-sm text-slate-500">{lv.description}</p>
                        </div>
                      </div>
                      {lv.unlocked ? (
                        <Link
                          href={`/level/${lv.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-600 active:scale-95 dark:bg-brand-500"
                        >
                          {completed ? "Review" : "Continue"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-400 dark:bg-slate-800">
                          <Lock className="h-4 w-4" /> Locked
                        </div>
                      )}
                    </div>
                    <div className="mt-6">
                      <ProgressBar percent={lv.percent} label={`${lv.completedTasks} / ${lv.totalTasks} modules`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="space-y-8">
            <SkillProgress completedCount={totalCompleted} />
            
            {/* Recent Activity Mini */}
            {recent.length > 0 && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Activity className="h-5 w-5 text-brand-500" />
                  Recent
                </h2>
                <div className="space-y-4">
                  {recent.slice(0, 3).map((r) => (
                    <Link key={r.id} href={`/task/${r.taskId}`} className="group block">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${r.result === 'pass' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="truncate text-sm font-bold group-hover:text-brand-500 transition-colors">
                          {truncate(r.taskQuestion, 20)}
                        </span>
                      </div>
                      <p className="ml-5 text-[10px] text-slate-400 uppercase tracking-wider">{timeAgo(r.createdAt)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
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
