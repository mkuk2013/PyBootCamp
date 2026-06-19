import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

import { sendApprovalEmail } from "@/lib/mail";

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
    // 1. Fetch all pending users before updating
    const pendingUsersList = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.approved, false),
          eq(users.role, "user")
        )
      )
      .all();

    if (pendingUsersList.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending users to auto-approve.",
      });
    }

    // 2. Approve them in the database
    const result = await db
      .update(users)
      .set({ approved: true })
      .where(
        and(
          eq(users.approved, false),
          eq(users.role, "user")
        )
      );

    // 3. Send approval emails to all auto-approved users
    for (const u of pendingUsersList) {
      try {
        await sendApprovalEmail(u.email, u.name);
      } catch (mailError) {
        console.error(`Failed to send auto-approval email to ${u.email}:`, mailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${pendingUsersList.length} pending users successfully auto-approved.`,
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
