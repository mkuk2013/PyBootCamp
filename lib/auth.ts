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
          image: user.image ?? null,
          role: user.role,
          approved: user.approved,
          xp: user.xp ?? 0,
          level: user.level ?? 1,
          streak: user.streak ?? 0,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approved = user.approved;
        token.picture = user.image ?? null;
        token.xp = user.xp ?? 0;
        token.level = user.level ?? 1;
        token.streak = user.streak ?? 0;
      }
      // When the client calls update() (e.g. after profile change), refresh
      // image / name from the database so navbar etc. stay in sync.
      if (trigger === "update" && token.id) {
        const fresh = await db
          .select({ name: users.name, image: users.image, xp: users.xp, level: users.level, streak: users.streak })
          .from(users)
          .where(eq(users.id, token.id as string))
          .get();
        if (fresh) {
          token.name = fresh.name;
          token.picture = fresh.image ?? null;
          token.xp = fresh.xp ?? 0;
          token.level = fresh.level ?? 1;
          token.streak = fresh.streak ?? 0;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.approved = token.approved;
        session.user.image = (token.picture as string | null) ?? null;
        session.user.xp = token.xp as number;
        session.user.level = token.level as number;
        session.user.streak = token.streak as number;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
