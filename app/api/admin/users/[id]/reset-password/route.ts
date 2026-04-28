/**
 * POST /api/admin/users/[id]/reset-password
 * Body: { password?: string }   (optional — if omitted, a random one is generated)
 *
 * Admin-only. Resets the target user's password.
 *
 * The plaintext password is returned ONCE in the response so the admin can hand
 * it to the user (e.g. via chat / email). It is not stored in plaintext.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const bodySchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a number")
      .optional(),
  })
  .optional()
  .nullable();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const target = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, params.id))
    .get();
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newPassword = parsed.data?.password ?? generateStrongPassword(14);
  const hash = await bcrypt.hash(newPassword, 10);

  await db.update(users).set({ password: hash }).where(eq(users.id, target.id));

  return NextResponse.json({
    ok: true,
    email: target.email,
    password: newPassword, // returned ONCE — admin must share it with the user
    generated: !parsed.data?.password,
  });
}

/**
 * Generates a strong password that satisfies the app's policy:
 *  - >= 8 chars (we use `len`, default 14)
 *  - at least one letter
 *  - at least one digit
 *  - mixes upper/lower/digits and a couple of symbols for entropy
 *
 * Uses crypto.getRandomValues for unbiased randomness.
 */
function generateStrongPassword(len = 14): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I, O for readability
  const lower = "abcdefghijkmnpqrstuvwxyz"; // no l, o
  const digits = "23456789"; // no 0, 1
  const symbols = "!@#$%&*?";
  const all = upper + lower + digits + symbols;

  // Guarantee class coverage
  const required = [
    pickFrom(upper),
    pickFrom(lower),
    pickFrom(digits),
    pickFrom(symbols),
  ];
  const remaining = len - required.length;
  const rest: string[] = [];
  for (let i = 0; i < remaining; i++) rest.push(pickFrom(all));

  // Shuffle (Fisher-Yates with crypto-driven swaps)
  const out = [...required, ...rest];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}

function pickFrom(set: string): string {
  return set[randomInt(set.length)];
}

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}
