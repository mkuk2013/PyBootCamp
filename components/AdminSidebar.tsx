"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  BookOpen,
  Code,
  ClipboardList,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/levels", label: "Levels", icon: Layers },
  { href: "/admin/modules", label: "Modules", icon: BookOpen },
  { href: "/admin/tasks", label: "Tasks", icon: Code },
  { href: "/admin/submissions", label: "Submissions", icon: ClipboardList },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-20 space-y-1">
        {items.map((it) => {
          const active = it.exact ? path === it.href : path.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
