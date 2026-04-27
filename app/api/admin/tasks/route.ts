import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const schema = z.object({
  moduleId: z.number().int().positive(),
  question: z.string().min(1).max(2000),
  starterCode: z.string().max(5000).optional().nullable(),
  expectedOutput: z.string().min(1).max(5000),
  testCases: z.string().max(10_000).optional().nullable(),
  hints: z.string().max(10_000).optional().nullable(),
  examples: z.string().max(20_000).optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  order: z.number().int().min(1).default(1),
});

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db
    .insert(tasks)
    .values({
      moduleId: parsed.data.moduleId,
      question: parsed.data.question,
      starterCode: parsed.data.starterCode ?? "",
      expectedOutput: parsed.data.expectedOutput,
      testCases: parsed.data.testCases ?? null,
      hints: parsed.data.hints ?? null,
      examples: parsed.data.examples ?? null,
      difficulty: parsed.data.difficulty,
      order: parsed.data.order,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
