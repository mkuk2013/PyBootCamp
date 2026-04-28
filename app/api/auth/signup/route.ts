/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 *
 * Creates a new user with role="user" and approved=false.
 * The user must wait for admin approval before they can log in.
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signupSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, image } = parsed.data;

    // Check duplicate
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password and insert
    const hash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name,
      email,
      password: hash,
      role: "user",
      approved: false,
      image: image ?? null,
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Account created. Please wait for admin approval before logging in.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
