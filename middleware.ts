/**
 * Route protection.
 *
 * - /dashboard/**  → must be logged in AND approved
 * - /admin/**      → must be logged in AND role="admin"
 *
 * Unauthorized users are redirected to /login (or /pending if not approved).
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }

    // Dashboard / learning routes — block unapproved users
    const protectedPrefixes = ["/dashboard", "/level", "/module"];
    if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
      if (token && !token.approved && token.role !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/pending";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Reject if no token at all → redirect to /login
      authorized: ({ token }) => Boolean(token),
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/level/:path*", "/module/:path*", "/admin/:path*"],
};
