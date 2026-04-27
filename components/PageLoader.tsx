import PythonLogo from "./PythonLogo";

/**
 * Centered, branded loader used as a `loading.tsx` for slow routes.
 * Shows instantly while the page below it compiles / fetches.
 */
export default function PageLoader({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/30 to-py-300/30 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
            <PythonLogo size={48} className="animate-py-float" />
          </div>
        </div>
        <div className="text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            {label}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            One moment…
          </p>
        </div>
        {/* shimmer skeleton bar */}
        <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-1/3 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-500 to-py-300" />
        </div>
      </div>
    </main>
  );
}
