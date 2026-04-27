import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const schema = z.object({
  moduleId: z.number().int().positive().optional(),
  question: z.string().min(1).max(2000).optional(),
  starterCode: z.string().max(5000).nullable().optional(),
  expectedOutput: z.string().min(1).max(5000).optional(),
  testCases: z.string().max(10_000).nullable().optional(),
  hints: z.string().max(10_000).nullable().optional(),
  examples: z.string().max(20_000).nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  order: z.number().int().min(1).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  await db.update(tasks).set(parsed.data).where(eq(tasks.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  await db.delete(tasks).where(eq(tasks.id, id));
  return NextResponse.json({ ok: true });
}
