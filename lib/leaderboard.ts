/**
 * Leaderboard utility — ranks users by total score from passing submissions.
 * Counts only the FIRST passing submission per task (no double-scoring).
 */
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  email: string;
  totalScore: number;
  tasksSolved: number;
};

export async function getLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  // For each (user, task), pick the best pass score (typically the difficulty score),
  // then sum per user.
  const rows = await db.all<{
    user_id: string;
    name: string;
    email: string;
    total: number;
    solved: number;
  }>(sql`
    SELECT u.id   AS user_id,
           u.name AS name,
           u.email AS email,
           COALESCE(SUM(best.score), 0) AS total,
           COUNT(best.task_id) AS solved
    FROM users u
    LEFT JOIN (
      SELECT user_id, task_id, MAX(score) AS score
      FROM submissions
      WHERE result = 'pass'
      GROUP BY user_id, task_id
    ) best ON best.user_id = u.id
    WHERE u.role = 'user' AND u.approved = 1
    GROUP BY u.id
    ORDER BY total DESC, solved DESC, u.name ASC
    LIMIT ${limit};
  `);

  return rows.map((r, i) => ({
    rank: i + 1,
    userId: r.user_id,
    name: r.name,
    email: r.email,
    totalScore: Number(r.total) || 0,
    tasksSolved: Number(r.solved) || 0,
  }));
}
