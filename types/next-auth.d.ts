/**
 * Module augmentation for NextAuth.
 * Adds custom fields (id, role, approved) to Session and JWT.
 */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      approved: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "admin";
    approved: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "admin";
    approved: boolean;
  }
}
