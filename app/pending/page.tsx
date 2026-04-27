"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Hourglass } from "lucide-react";

export default function PendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <Hourglass className="mx-auto mb-4 h-14 w-14 text-amber-500" />
        <h1 className="mb-2 text-2xl font-bold">Awaiting Approval</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Your account has been created successfully but is still pending admin
          approval. Please check back later.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-brand-700"
          >
            Sign Out
          </button>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:underline dark:text-slate-400"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
