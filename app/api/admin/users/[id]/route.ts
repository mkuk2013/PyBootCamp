/**
 * PATCH /api/admin/users/[id]    body: { approved?, role? }
 * DELETE /api/admin/users/[id]
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const patchSchema = z.object({
  approved: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await db.update(users).set(parsed.data).where(eq(users.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Prevent admin from deleting themselves
  if (guard.session!.user.id === params.id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account." },
      { status: 400 }
    );
  }

  await db.delete(users).where(eq(users.id, params.id));
  return NextResponse.json({ ok: true });
}
