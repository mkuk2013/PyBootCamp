/**
 * POST /api/run
 * Body: { code: string, stdin?: string }
 *
 * Runs Python code and returns stdout/stderr — does NOT save a submission.
 * Used by the "Run" button in the editor.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runPython } from "@/lib/judge0";

const schema = z.object({
  code: z.string().max(20_000),
  stdin: z.string().max(5_000).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const result = await runPython({
      code: parsed.data.code,
      stdin: parsed.data.stdin,
    });
    return NextResponse.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      status: result.status,
      time: result.time,
      memory: result.memory,
    });
  } catch (err) {
    console.error("run error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    let userMessage = "Failed to execute code.";
    if (msg.includes("403") || msg.toLowerCase().includes("not subscribed")) {
      userMessage =
        "Judge0 API not subscribed. Admin must subscribe (free) at https://rapidapi.com/judge0-official/api/judge0-ce";
    } else if (msg.includes("429")) {
      userMessage = "Rate limit reached. Try again in a minute.";
    } else if (msg.includes("API key") || msg.includes("not set")) {
      userMessage = "Judge0 API key missing. Check .env.local";
    }
    return NextResponse.json(
      { error: userMessage, detail: msg },
      { status: 502 }
    );
  }
}
