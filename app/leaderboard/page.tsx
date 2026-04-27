import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Trophy, Medal, Award } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.approved && session.user.role !== "admin") {
    redirect("/pending");
  }

  const board = await getLeaderboard(50);
  const myRow = board.find((r) => r.userId === session.user.id);

  function rankIcon(rank: number) {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-mono text-slate-400">#{rank}</span>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold">🏆 Leaderboard</h1>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          Top 50 learners by total score across all completed tasks.
        </p>

        {myRow && (
          <div className="mb-6 rounded-xl border-2 border-brand-400 bg-brand-50 p-4 dark:bg-brand-900/20">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              Your rank: <strong>#{myRow.rank}</strong> · {myRow.totalScore} pts ·{" "}
              {myRow.tasksSolved} tasks solved
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 w-16">Rank</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">Tasks</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {board.map((r) => {
                const isMe = r.userId === session.user.id;
                return (
                  <tr
                    key={r.userId}
                    className={`border-t border-slate-100 dark:border-slate-800 ${
                      isMe ? "bg-brand-50 font-semibold dark:bg-brand-900/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3">{rankIcon(r.rank)}</td>
                    <td className="px-4 py-3">{r.name} {isMe && <span className="text-xs text-brand-600">(you)</span>}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{r.tasksSolved}</td>
                    <td className="px-4 py-3 text-right font-mono text-brand-600">{r.totalScore}</td>
                  </tr>
                );
              })}
              {board.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No scores yet — be the first to solve a task!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
