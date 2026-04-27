import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { modules } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const schema = z.object({
  levelId: z.number().int().positive().optional(),
  title: z.string().min(1).max(150).optional(),
  content: z.string().min(1).max(20_000).optional(),
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
  await db.update(modules).set(parsed.data).where(eq(modules.id, id));
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
  await db.delete(modules).where(eq(modules.id, id));
  return NextResponse.json({ ok: true });
}
