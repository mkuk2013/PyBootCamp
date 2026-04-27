import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions, users, tasks } from "@/lib/db/schema";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function AdminSubmissionsPage() {
  // Join submissions with user/task details (manual join for clarity)
  const rows = await db
    .select({
      id: submissions.id,
      code: submissions.code,
      result: submissions.result,
      score: submissions.score,
      output: submissions.output,
      runtimeMs: submissions.runtimeMs,
      createdAt: submissions.createdAt,
      userName: users.name,
      userEmail: users.email,
      taskQuestion: tasks.question,
      taskDifficulty: tasks.difficulty,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.id))
    .leftJoin(tasks, eq(submissions.taskId, tasks.id))
    .orderBy(desc(submissions.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Submissions</h1>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Showing last 200 submissions across all users.
      </p>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 dark:border-slate-700">
            No submissions yet.
          </div>
        )}

        {rows.map((s) => (
          <details
            key={s.id}
            className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-3">
                {s.result === "pass" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {s.userName} <span className="text-slate-400">({s.userEmail})</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {s.taskQuestion?.slice(0, 80)}
                    {s.taskQuestion && s.taskQuestion.length > 80 ? "…" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{s.taskDifficulty}</span>
                <span>+{s.score} pts</span>
                <span>{s.runtimeMs ?? 0} ms</span>
              </div>
            </summary>

            <div className="space-y-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Code
                </h4>
                <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-100">
                  {s.code}
                </pre>
              </div>
              {s.output && (
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Output
                  </h4>
                  <pre className="overflow-x-auto rounded-md bg-slate-100 p-3 font-mono text-xs dark:bg-slate-800">
                    {s.output}
                  </pre>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
