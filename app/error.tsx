"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import PythonLogo from "@/components/PythonLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(244,63,94,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />

      <div className="w-full max-w-md animate-fade-in-up text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 shadow-lg shadow-rose-500/30">
          <AlertTriangle className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
          Something went wrong
        </h1>
        <p className="mb-2 text-slate-600 dark:text-slate-400">
          An unexpected error occurred. Don&apos;t worry — your progress is safe.
        </p>
        {error?.digest && (
          <p className="mb-6 font-mono text-xs text-slate-400">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 font-bold text-white shadow-md shadow-brand-500/30 transition hover:shadow-glow active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 text-xs text-slate-400">
          <PythonLogo size={14} />
          PyBootCamp
        </div>
      </div>
    </main>
  );
}
