/**
 * POST /api/submissions
 * Body: { taskId, code, results: [{ stdout, stderr }, ...], runtimeMs? }
 *
 * The CLIENT executes the user's code in-browser via Pyodide for each test
 * case and submits the resulting outputs. The server compares those outputs
 * against the task's expected output (and optional testCases) and saves a
 * submission row.
 *
 * This keeps the app fully serverless-friendly (Netlify/Vercel) and free —
 * no Judge0 / RapidAPI required.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, submissions, users, achievements, userAchievements } from "@/lib/db/schema";

const resultSchema = z.object({
  stdout: z.string().max(20_000),
  stderr: z.string().max(20_000).optional().default(""),
});

const bodySchema = z.object({
  taskId: z.number().int().positive(),
  code: z.string().min(1).max(20_000),
  results: z.array(resultSchema).min(1).max(50),
  runtimeMs: z.number().int().min(0).max(120_000).optional(),
});

type TestCase = { input?: string; expected: string };

function difficultyScore(d: "easy" | "medium" | "hard"): number {
  return d === "easy" ? 10 : d === "medium" ? 20 : 30;
}

/**
 * Calculate user level based on XP (1-10)
 * Level 1: 0-99 XP
 * Level 2: 100-299 XP
 * Level 3: 300-599 XP
 * Level 4: 600-999 XP
 * Level 5: 1000-1499 XP
 * Level 6: 1500-2099 XP
 * Level 7: 2100-2799 XP
 * Level 8: 2800-3599 XP
 * Level 9: 3600-4499 XP
 * Level 10: 4500+ XP
 */
function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  if (xp < 3600) return 8;
  if (xp < 4500) return 9;
  return 10;
}

/**
 * Robust output normalization for grading:
 *  - normalize line endings (CRLF / lone CR  ->  LF)
 *  - rtrim every line (strip trailing spaces / tabs)
 *  - drop blank lines at the very end
 *  - drop a single optional trailing newline (some runtimes emit it, some don't)
 *  - leave inner blank lines + leading whitespace untouched.
 */
function normalize(s: string): string {
  return s
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "");
}

function firstDiff(a: string, b: string): string {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) {
      return `at index ${i}: expected ${JSON.stringify(a[i])} (U+${a
        .charCodeAt(i)
        .toString(16)
        .padStart(4, "0")
        .toUpperCase()}) but got ${JSON.stringify(b[i])} (U+${b
        .charCodeAt(i)
        .toString(16)
        .padStart(4, "0")
        .toUpperCase()})`;
    }
  }
  if (a.length !== b.length) {
    return `length mismatch: expected ${a.length} chars, got ${b.length} chars`;
  }
  return "";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { taskId, code, results, runtimeMs } = parsed.data;

  // 1) Load task
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // 2) Build the list of expected outputs (one per test case)
  let expectedRuns: string[] = [];
  if (task.testCases) {
    try {
      const parsedTC = JSON.parse(task.testCases) as TestCase[];
      if (Array.isArray(parsedTC) && parsedTC.length > 0) {
        expectedRuns = parsedTC.map((t) => t.expected);
      }
    } catch {
      /* ignore malformed */
    }
  }
  if (expectedRuns.length === 0) {
    expectedRuns = [task.expectedOutput];
  }

  if (results.length !== expectedRuns.length) {
    return NextResponse.json(
      {
        error: `Expected ${expectedRuns.length} test result(s), received ${results.length}.`,
      },
      { status: 400 }
    );
  }

  // 3) Compare each result
  let allPassed = true;
  let firstFailureOutput = "";
  let lastOutput = "";
  const detail: Array<{
    idx: number;
    pass: boolean;
    expected: string;
    got: string;
    stderr: string;
    diff?: string;
  }> = [];

  for (let i = 0; i < expectedRuns.length; i++) {
    const got = normalize(results[i].stdout);
    const exp = normalize(expectedRuns[i]);
    const stderr = results[i].stderr ?? "";
    const pass = !stderr && got === exp;
    if (!pass) allPassed = false;
    if (!pass && !firstFailureOutput) {
      firstFailureOutput = stderr || got || "(no output)";
    }
    lastOutput = got;
    detail.push({
      idx: i + 1,
      pass,
      expected: exp,
      got,
      stderr,
      diff: pass ? undefined : firstDiff(exp, got),
    });
  }

  // 4) Save submission
  const score = allPassed ? difficultyScore(task.difficulty) : 0;
  await db.insert(submissions).values({
    userId: session.user.id,
    taskId: task.id,
    code,
    result: allPassed ? "pass" : "fail",
    score,
    output: allPassed ? lastOutput : firstFailureOutput,
    runtimeMs: runtimeMs ?? 0,
  });

  // 5) Update user XP, level, and streak if passed
  let newLevel = null;
  let unlockedAchievements = [];

  if (allPassed) {
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).get();
    if (user) {
      const newXP = (user.xp || 0) + score;
      const calculatedLevel = calculateLevel(newXP);

      // Update streak
      const now = new Date();
      const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
      let newStreak = user.streak || 0;

      if (lastActive) {
        const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          // Consecutive day
          newStreak += 1;
        } else if (daysDiff > 1) {
          // Streak broken
          newStreak = 1;
        }
        // daysDiff === 0 means same day, don't increment
      } else {
        newStreak = 1;
      }

      await db
        .update(users)
        .set({
          xp: newXP,
          level: calculatedLevel,
          streak: newStreak,
          lastActiveAt: now,
          updatedAt: now,
        })
        .where(eq(users.id, session.user.id));

      newLevel = calculatedLevel;

      // Check for unlocked achievements
      const allAchievements = await db.select().from(achievements).orderBy(achievements.xpRequired);
      for (const achievement of allAchievements) {
        // Check if user already has this achievement
        const existing = await db
          .select()
          .from(userAchievements)
          .where(
            and(
              eq(userAchievements.userId, session.user.id),
              eq(userAchievements.achievementId, achievement.id)
            )
          )
          .get();

        if (!existing) {
          let shouldUnlock = false;

          // XP-based achievements
          if (achievement.name.includes("XP") || achievement.xpRequired <= newXP) {
            if (achievement.name === "Python Beginner" && newXP >= 100) shouldUnlock = true;
            if (achievement.name === "Code Warrior" && newXP >= 500) shouldUnlock = true;
            if (achievement.name === "Python Master" && newXP >= 1000) shouldUnlock = true;
          }

          // Streak-based achievements
          if (achievement.name === "7-Day Streak" && newStreak >= 7) shouldUnlock = true;
          if (achievement.name === "30-Day Streak" && newStreak >= 30) shouldUnlock = true;

          // Level-based achievements
          if (achievement.name === "Level Up" && calculatedLevel >= 5) shouldUnlock = true;

          // First task completion
          if (achievement.name === "First Steps" && newXP >= 10) shouldUnlock = true;

          if (shouldUnlock) {
            await db.insert(userAchievements).values({
              userId: session.user.id,
              achievementId: achievement.id,
            });
            unlockedAchievements.push(achievement);
          }
        }
      }
    }
  }

  return NextResponse.json({
    pass: allPassed,
    score,
    output: allPassed ? lastOutput : firstFailureOutput,
    detail,
    newLevel,
    unlockedAchievements,
  });
}

/**
 * GET /api/submissions?taskId=123
 * Returns the current user's last 10 submissions for the given task.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const taskIdParam = url.searchParams.get("taskId");
  const taskId = taskIdParam ? Number(taskIdParam) : NaN;
  if (!Number.isFinite(taskId) || taskId <= 0) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: submissions.id,
      code: submissions.code,
      result: submissions.result,
      score: submissions.score,
      output: submissions.output,
      runtimeMs: submissions.runtimeMs,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, session.user.id),
        eq(submissions.taskId, taskId)
      )
    )
    .orderBy(desc(submissions.createdAt))
    .limit(10);

  return NextResponse.json({
    submissions: rows.map((r) => ({
      ...r,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : new Date(r.createdAt).toISOString(),
    })),
  });
}
