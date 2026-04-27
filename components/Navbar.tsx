"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Shield,
  Trophy,
  Award,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import PythonLogo from "./PythonLogo";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isAdmin = session?.user.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          href={homeHref}
          className="group flex items-center gap-2.5 transition"
        >
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/20 to-py-300/20 blur-md transition group-hover:from-brand-500/40 group-hover:to-py-300/40" />
            <PythonLogo size={32} className="relative drop-shadow-sm" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Py<span className="text-brand-600 dark:text-brand-400">BootCamp</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {session && !isAdmin && (
            <>
              <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </NavLink>
              <NavLink href="/leaderboard" icon={<Trophy className="h-4 w-4" />}>
                Leaderboard
              </NavLink>
              <NavLink href="/certificate" icon={<Award className="h-4 w-4" />}>
                Certificate
              </NavLink>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="mr-1 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-py-300 px-3 py-1.5 text-sm font-bold text-amber-900 shadow-sm shadow-amber-500/20 transition hover:from-amber-500 hover:to-py-400"
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

          {session && (
            <Link
              href="/profile"
              title="Your profile"
              aria-label="Profile"
              className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-600 dark:hover:bg-slate-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-py-400 text-[10px] font-black text-white">
                {(session.user.name || session.user.email || "P")
                  .split(/\s+/)
                  .map((s: string) => s[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <span className="hidden sm:inline">Profile</span>
            </Link>
          )}

          {session && <LogoutButton />}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300 sm:inline-flex"
    >
      {icon}
      {children}
    </Link>
  );
}
