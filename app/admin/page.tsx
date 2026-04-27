import { sql } from "drizzle-orm";
import Link from "next/link";
import { Users, Layers, BookOpen, Code, ClipboardList, UserCheck } from "lucide-react";
import { db } from "@/lib/db";
import { users, levels, modules, tasks, submissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminOverview() {
  const [
    [{ c: usersCount }],
    [{ c: pendingCount }],
    [{ c: levelsCount }],
    [{ c: modulesCount }],
    [{ c: tasksCount }],
    [{ c: submissionsCount }],
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(users),
    db.select({ c: sql<number>`count(*)` }).from(users).where(eq(users.approved, false)),
    db.select({ c: sql<number>`count(*)` }).from(levels),
    db.select({ c: sql<number>`count(*)` }).from(modules),
    db.select({ c: sql<number>`count(*)` }).from(tasks),
    db.select({ c: sql<number>`count(*)` }).from(submissions),
  ]);

  const stats = [
    { label: "Total Users", value: usersCount, icon: Users, href: "/admin/users", color: "blue" },
    { label: "Pending Approval", value: pendingCount, icon: UserCheck, href: "/admin/users", color: "amber" },
    { label: "Levels", value: levelsCount, icon: Layers, href: "/admin/levels", color: "purple" },
    { label: "Modules", value: modulesCount, icon: BookOpen, href: "/admin/modules", color: "emerald" },
    { label: "Tasks", value: tasksCount, icon: Code, href: "/admin/tasks", color: "cyan" },
    { label: "Submissions", value: submissionsCount, icon: ClipboardList, href: "/admin/submissions", color: "rose" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {s.label}
                </p>
                <p className="mt-1 text-3xl font-bold">{s.value}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                <Icon className="h-6 w-6" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
