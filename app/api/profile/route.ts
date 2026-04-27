import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * PATCH /api/profile
 * Body:
 *   { name?: string, currentPassword?: string, newPassword?: string }
 *
 * - Updating the name only requires a session.
 * - Changing the password requires currentPassword + newPassword.
 */
const schema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(200)
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a number")
      .optional(),
  })
  .refine(
    (d) => !d.newPassword || !!d.currentPassword,
    { message: "currentPassword is required to change password", path: ["currentPassword"] }
  );

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, currentPassword, newPassword } = parsed.data;
  if (!name && !newPassword) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .get();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates: { name?: string; password?: string } = {};

  if (name && name !== user.name) {
    updates.name = name;
  }

  if (newPassword) {
    const ok = await bcrypt.compare(currentPassword!, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  await db.update(users).set(updates).where(eq(users.id, user.id));

  return NextResponse.json({
    ok: true,
    name: updates.name ?? user.name,
    passwordChanged: !!updates.password,
  });
}
