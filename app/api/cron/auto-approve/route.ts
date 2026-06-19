import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get("secret");
  const authHeader = req.headers.get("Authorization");

  const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;

  // Protect the endpoint with a secret
  if (
    cronSecret &&
    authHeader !== `Bearer ${cronSecret}` &&
    secretParam !== cronSecret
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Approve all users with role 'user' who are currently not approved
    const result = await db
      .update(users)
      .set({ approved: true })
      .where(
        and(
          eq(users.approved, false),
          eq(users.role, "user")
        )
      );

    return NextResponse.json({
      success: true,
      message: "Pending users successfully auto-approved.",
      result,
    });
  } catch (error: any) {
    console.error("Auto-approval cron error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to auto-approve users" },
      { status: 500 }
    );
  }
}
