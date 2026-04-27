import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { modules } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const schema = z.object({
  levelId: z.number().int().positive(),
  title: z.string().min(1).max(150),
  content: z.string().min(1).max(20_000),
  order: z.number().int().min(1),
});

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(modules).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}
