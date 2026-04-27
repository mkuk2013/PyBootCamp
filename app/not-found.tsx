import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import PythonLogo from "@/components/PythonLogo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* decorative bg */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(55,118,171,0.2),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-20 top-20 -z-10 h-72 w-72 animate-blob rounded-full bg-py-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 -z-10 h-72 w-72 animate-blob rounded-full bg-brand-400/20 blur-3xl [animation-delay:3s]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />

      <div className="w-full max-w-lg animate-fade-in-up text-center">
        {/* 404 with Python logo */}
        <div className="relative mx-auto mb-6 flex items-center justify-center gap-3">
          <span className="text-py-gradient text-8xl font-black tracking-tighter md:text-9xl">
            4
          </span>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-py-300/30 blur-2xl" />
            <PythonLogo size={96} className="relative animate-py-float" />
          </div>
          <span className="text-py-gradient text-8xl font-black tracking-tighter md:text-9xl">
            4
          </span>
        </div>

        <h1 className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          Page not found
        </h1>
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to learning.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 font-bold text-white shadow-md shadow-brand-500/30 transition hover:shadow-glow active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
