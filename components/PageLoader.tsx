import PythonLogo from "./PythonLogo";

/**
 * Centered, branded loader with a rotating gradient ring around the
 * Python logo, bouncing dots, and a sliding progress bar.
 */
export default function PageLoader({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 animate-fade-in-up">
      <div className="flex flex-col items-center gap-6">
        {/* Logo with rotating gradient ring */}
        <div className="relative h-28 w-28">
          {/* Soft glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500/40 to-py-300/40 blur-2xl" />

          {/* Rotating conic gradient ring */}
          <div
            className="absolute inset-0 animate-spin-slow rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, #3776AB 90deg, #FFD43B 180deg, #3776AB 270deg, transparent 360deg)",
              WebkitMask:
                "radial-gradient(circle, transparent 44%, black 46%, black 49%, transparent 51%)",
              mask: "radial-gradient(circle, transparent 44%, black 46%, black 49%, transparent 51%)",
            }}
          />

          {/* Inner card with floating logo */}
          <div className="absolute inset-2.5 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <PythonLogo size={48} className="animate-py-float" />
          </div>
        </div>

        {/* Label + bouncing dots */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">
            <span>{label}</span>
            <span className="flex items-end gap-1">
              <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-brand-500 [animation-delay:-0.32s]" />
              <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-brand-500 [animation-delay:-0.16s]" />
              <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-py-300" />
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hang tight, almost there
          </p>
        </div>

        {/* Indeterminate progress bar */}
        <div className="relative h-1 w-56 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="absolute inset-y-0 left-0 w-1/3 animate-progress-slide rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-py-300" />
        </div>
      </div>
    </main>
  );
}
