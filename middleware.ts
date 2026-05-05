/**
 * Route protection.
 *
 * - /dashboard/**  → must be logged in AND approved
 * - /admin/**      → must be logged in AND role="admin"
 *
 * Unauthorized users are redirected to /login (or /pending if not approved).
 * Using custom middleware instead of withAuth to handle dynamic origins correctly.
 */

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Define protection rules
  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedPage = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/level") || 
    pathname.startsWith("/module") || 
    isAdminPage;

  if (isProtectedPage) {
    // 1) Redirect unauthenticated users to /login
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // 2) Admin check
    if (isAdminPage && token.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // 3) Approval check — block unapproved users (except admins)
    if (token && !token.approved && token.role !== "admin" && pathname !== "/pending") {
      const url = req.nextUrl.clone();
      url.pathname = "/pending";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/level/:path*", 
    "/module/:path*", 
    "/admin/:path*",
    "/pending"
  ],
};
