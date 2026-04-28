/**
 * Module augmentation for NextAuth.
 * Adds custom fields (id, role, approved, xp, level, streak) to Session and JWT.
 */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      approved: boolean;
      xp: number;
      level: number;
      streak: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "admin";
    approved: boolean;
    xp: number;
    level: number;
    streak: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "admin";
    approved: boolean;
    xp: number;
    level: number;
    streak: number;
  }
}
