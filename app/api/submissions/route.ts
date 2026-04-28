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
import { tasks, submissions } from "@/lib/db/schema";

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

  return NextResponse.json({
    pass: allPassed,
    score,
    output: allPassed ? lastOutput : firstFailureOutput,
    detail,
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
