import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/LeaderboardTable";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.approved && session.user.role !== "admin") {
    redirect("/pending");
  }

  const board = await getLeaderboard(50);
  const myRow = board.find((r) => r.userId === session.user.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">🏆 Leaderboard</h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          Top 50 learners by total score across all completed tasks.
        </p>

        {myRow && (
          <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-900/10">
            <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">
              Your Rank: <span className="font-extrabold text-brand-600 dark:text-brand-400">#{myRow.rank}</span> · {myRow.totalScore} pts ·{" "}
              {myRow.tasksSolved} tasks solved
            </p>
          </div>
        )}

        <LeaderboardTable board={board} currentUserId={session.user.id} />
      </main>
    </>
  );
}
