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
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Flame,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import PythonLogo from "./PythonLogo";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isAdmin = session?.user.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
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

        {/* Desktop right side */}
        <div className="hidden items-center gap-1 md:flex">
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

          {/* XP, Level, Streak display */}
          {session && !isAdmin && (
            <div className="mr-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                <Zap className="h-3.5 w-3.5" />
                <span>{session.user.xp || 0} XP</span>
              </div>
              <div className="h-3 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>Lvl {session.user.level || 1}</span>
              </div>
              {(session.user.streak || 0) > 0 && (
                <>
                  <div className="h-3 w-px bg-slate-300 dark:bg-slate-600" />
                  <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                    <Flame className="h-3.5 w-3.5" />
                    <span>{session.user.streak || 0}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {session && (
            <Link
              href="/profile"
              title="Your profile"
              aria-label="Profile"
              className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-600 dark:hover:bg-slate-700"
            >
              <Avatar
                name={session.user.name || session.user.email || "P"}
                image={session.user.image ?? null}
              />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          )}

          {session && <LogoutButton />}
        </div>

        {/* Mobile right side: theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          {session && (
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {session && menuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-[57px] z-20 bg-slate-900/40 backdrop-blur-sm"
          />
          {/* Panel */}
          <div className="absolute inset-x-0 top-full z-30 origin-top animate-fade-in-up border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <Avatar
                name={session.user.name || session.user.email || "P"}
                image={session.user.image ?? null}
                large
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">
                  {session.user.name || "User"}
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {session.user.email}
                </div>
              </div>
              {isAdmin && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Admin
                </span>
              )}
            </div>

            <div className="space-y-1">
              {isAdmin && (
                <MobileLink
                  href="/admin"
                  active={pathname?.startsWith("/admin") ?? false}
                  icon={<Shield className="h-5 w-5" />}
                  label="Admin Dashboard"
                  highlight
                />
              )}
              {!isAdmin && (
                <>
                  <MobileLink
                    href="/dashboard"
                    active={pathname === "/dashboard"}
                    icon={<LayoutDashboard className="h-5 w-5" />}
                    label="Dashboard"
                  />
                  <MobileLink
                    href="/leaderboard"
                    active={pathname === "/leaderboard"}
                    icon={<Trophy className="h-5 w-5" />}
                    label="Leaderboard"
                  />
                  <MobileLink
                    href="/certificate"
                    active={pathname === "/certificate"}
                    icon={<Award className="h-5 w-5" />}
                    label="Certificate"
                  />
                </>
              )}
              <MobileLink
                href="/profile"
                active={pathname === "/profile"}
                icon={<UserIcon className="h-5 w-5" />}
                label="Profile"
              />
              <button
                onClick={() => signOut({ callbackUrl: "/login?logout=success" })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function Avatar({
  name,
  image,
  large = false,
}: {
  name: string;
  image?: string | null;
  large?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sizeCls = large ? "h-10 w-10 text-sm" : "h-6 w-6 text-[10px]";
  if (image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={image}
        alt={name || "Avatar"}
        className={`shrink-0 rounded-md object-cover ${sizeCls}`}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-py-400 font-black text-white ${sizeCls}`}
    >
      {initials || "P"}
    </span>
  );
}

function MobileLink({
  href,
  active,
  icon,
  label,
  highlight = false,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
        highlight
          ? "bg-gradient-to-r from-amber-400 to-py-300 text-amber-900 shadow-sm"
          : active
          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {label}
    </Link>
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
