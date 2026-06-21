import { sql } from "drizzle-orm";
import Link from "next/link";
import { 
  Users, 
  Layers, 
  BookOpen, 
  Code, 
  ClipboardList, 
  UserCheck, 
  Server, 
  BrainCircuit, 
  Mail, 
  Cpu, 
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { db } from "@/lib/db";
import { users, levels, modules, tasks, submissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  // 1. Parallel Database Fetches
  const dbStart = Date.now();
  
  const [
    [{ c: usersCount }],
    [{ c: pendingCount }],
    [{ c: levelsCount }],
    [{ c: modulesCount }],
    [{ c: tasksCount }],
    [{ c: submissionsCount }],
    [{ c: passCount }],
    [{ c: failCount }],
    levelDistribution,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(users),
    db.select({ c: sql<number>`count(*)` }).from(users).where(eq(users.approved, false)),
    db.select({ c: sql<number>`count(*)` }).from(levels),
    db.select({ c: sql<number>`count(*)` }).from(modules),
    db.select({ c: sql<number>`count(*)` }).from(tasks),
    db.select({ c: sql<number>`count(*)` }).from(submissions),
    db.select({ c: sql<number>`count(*)` }).from(submissions).where(eq(submissions.result, "pass")),
    db.select({ c: sql<number>`count(*)` }).from(submissions).where(eq(submissions.result, "fail")),
    db
      .select({
        level: users.level,
        count: sql<number>`count(*)`
      })
      .from(users)
      .groupBy(users.level)
      .orderBy(users.level)
      .all(),
  ]);

  const dbLatency = Date.now() - dbStart;

  // 2. Stats list
  const stats = [
    { label: "Total Users", value: usersCount, icon: Users, href: "/admin/users", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
    { label: "Pending Approval", value: pendingCount, icon: UserCheck, href: "/admin/users", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
    { label: "Curriculum Levels", value: levelsCount, icon: Layers, href: "/admin/levels", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" },
    { label: "Modules", value: modulesCount, icon: BookOpen, href: "/admin/modules", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
    { label: "Tasks", value: tasksCount, icon: Code, href: "/admin/tasks", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400" },
    { label: "Submissions", value: submissionsCount, icon: ClipboardList, href: "/admin/submissions", color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400" },
  ];

  // 3. Diagnostics statuses
  const geminiStatus = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "Connected" : "Not Configured";
  const smtpStatus = process.env.SMTP_HOST ? "Connected" : "Not Configured";

  // Calculate percentages
  const passRate = submissionsCount > 0 ? Math.round((passCount / submissionsCount) * 100) : 0;
  const failRate = submissionsCount > 0 ? Math.round((failCount / submissionsCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time system statistics and platform configuration diagnostics.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 group"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {s.label}
                </p>
                <p className="mt-1.5 text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {s.value}
                </p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${s.color}`}>
                <Icon className="h-6 w-6" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Diagnostics Panel */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Cpu className="h-5 w-5 text-brand-500 animate-pulse" />
              Diagnostics & Health
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
              System Online
            </span>
          </div>

          <div className="space-y-4">
            {/* Database latency */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Turso Database</h4>
                  <p className="text-xs text-slate-400">libSQL Core Storage</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-md">
                  Healthy
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{dbLatency} ms latency</p>
              </div>
            </div>

            {/* Gemini API */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Gemini AI Tutor</h4>
                  <p className="text-xs text-slate-400">AI Coding Hints API</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                  geminiStatus === "Connected" 
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400" 
                    : "text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400"
                }`}>
                  {geminiStatus}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Models: flash/pro</p>
              </div>
            </div>

            {/* SMTP config */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">SMTP Mailer</h4>
                  <p className="text-xs text-slate-400">Welcome & approval emails</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                  smtpStatus === "Connected" 
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400" 
                    : "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400"
                }`}>
                  {smtpStatus}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Relay: {process.env.SMTP_HOST || "Localhost"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Distribution Charts */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Submission Analytics
            </h2>
            <span className="text-xs text-slate-400 font-medium">Auto-graded runs</span>
          </div>

          <div className="space-y-6">
            {/* Pass vs Fail breakdown bar chart */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                <span>Success Rate Overview</span>
                <span className="text-emerald-500">{passRate}% Pass</span>
              </div>
              <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex font-sans text-[10px] font-black text-white">
                {passCount > 0 && (
                  <div 
                    className="h-full bg-emerald-500 flex items-center justify-center transition-all shadow-inner"
                    style={{ width: `${passRate}%` }}
                    title={`Pass: ${passCount} submissions`}
                  >
                    {passRate > 15 ? `${passRate}%` : ""}
                  </div>
                )}
                {failCount > 0 && (
                  <div 
                    className="h-full bg-rose-500 flex items-center justify-center transition-all shadow-inner"
                    style={{ width: `${failRate}%` }}
                    title={`Fail: ${failCount} submissions`}
                  >
                    {failRate > 15 ? `${failRate}%` : ""}
                  </div>
                )}
                {submissionsCount === 0 && (
                  <div className="w-full flex items-center justify-center text-slate-400">
                    No submissions recorded yet
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold px-0.5 mt-2">
                <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded" /> Passed ({passCount})</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 bg-rose-500 rounded" /> Failed ({failCount})</span>
              </div>
            </div>

            {/* User Level Distribution */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                <span>User Levels Distribution</span>
                <span className="text-slate-400">{usersCount} total explorer(s)</span>
              </div>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {levelDistribution.length === 0 ? (
                  <div className="text-xs text-center text-slate-400 py-4">No data available</div>
                ) : (
                  levelDistribution.map((dist) => {
                    const ratio = usersCount > 0 ? Math.round((dist.count / usersCount) * 100) : 0;
                    return (
                      <div key={dist.level} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 w-12">Lvl {dist.level}</span>
                        <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 rounded"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 w-10 text-right">
                          {dist.count} ({ratio}%)
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
