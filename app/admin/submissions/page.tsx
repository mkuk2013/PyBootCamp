import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions, users, tasks } from "@/lib/db/schema";
import SubmissionsTable from "@/components/SubmissionsTable";

export default async function AdminSubmissionsPage() {
  // Join submissions with user/task details
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
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Submissions Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Reviewing last 200 submissions across all users.
        </p>
      </div>

      <SubmissionsTable initialRows={rows} />
    </div>
  );
}
