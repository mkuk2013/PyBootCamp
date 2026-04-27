/**
 * NextAuth configuration — Credentials provider + JWT sessions.
 *
 * - Validates credentials with Zod.
 * - Looks up user from Turso, compares bcrypt hash.
 * - Adds id / role / approved to JWT and session.
 * - Blocks login for users who are not yet approved by an admin.
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validators";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1) Validate input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 2) Lookup user
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .get();
        if (!user) return null;

        // 3) Verify password
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // 4) Block unapproved users (admins approved by seed/admin panel)
        if (!user.approved) {
          throw new Error(
            "Your account is pending admin approval. Please try again later."
          );
        }

        // 5) Return user object — added to JWT in jwt() callback
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          approved: user.approved,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approved = user.approved;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.approved = token.approved;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
