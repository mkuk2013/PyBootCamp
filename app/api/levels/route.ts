/**
 * GET /api/levels
 * Returns all levels (with progress) for the logged-in user.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLevelsWithProgress } from "@/lib/progress";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getLevelsWithProgress(session.user.id);
  return NextResponse.json(data);
}
