import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { levels } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const schema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  order: z.number().int().min(1),
});

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db
    .insert(levels)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      order: parsed.data.order,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
