"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader2, ArrowRight, Mail, Lock } from "lucide-react";
import PythonLogo from "@/components/PythonLogo";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Show success toast on logout
  useEffect(() => {
    if (params.get("logout") === "success") {
      toast.success("Logged out successfully");
      // Clear the URL parameter without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // guard against double-submit
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      toast.error(res.error);
      return;
    }

    // Show full-screen overlay immediately so the user gets instant feedback
    setRedirecting(true);
    toast.success("Welcome back!");

    // Use a hard redirect (window.location). Faster perceived UX in dev mode
    // because there's no client-side route resolution; the browser itself
    // shows its native loading indicator while the destination is fetched.
    // Dashboard handles admin redirect server-side, so we always land there
    // unless an explicit callbackUrl was provided.
    const dest =
      callbackUrl && callbackUrl !== "/dashboard" ? callbackUrl : "/dashboard";

    // Tiny delay lets the toast paint a frame before navigation starts.
    setTimeout(() => {
      window.location.replace(dest);
    }, 80);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 dark:bg-slate-950">
      {redirecting && <RedirectOverlay />}
      {/* decorative bg */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(55,118,171,0.25),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-20 top-20 -z-10 h-72 w-72 animate-blob rounded-full bg-py-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 -z-10 h-72 w-72 animate-blob rounded-full bg-brand-400/30 blur-3xl [animation-delay:3s]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />

      <div className="w-full max-w-md animate-fade-in-up">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/30 to-py-300/30 blur-lg" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <PythonLogo size={32} />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Py<span className="text-brand-600 dark:text-brand-400">BootCamp</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80">
          <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">
            Welcome back 👋
          </h1>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Log in to continue your Python journey.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              required
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              required
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-[length:200%_auto] py-3 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-right-bottom hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Log In
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function RedirectOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500/40 to-py-300/40 blur-2xl" />
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
          <div className="absolute inset-3 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <PythonLogo size={56} className="animate-py-float" />
          </div>
        </div>
        <div className="text-center">
          <div className="mb-1 text-lg font-extrabold tracking-tight">
            Loading your dashboard
            <span className="ml-1 inline-flex gap-0.5">
              <span className="inline-block h-1 w-1 animate-dot-bounce rounded-full bg-brand-500 [animation-delay:-0.32s]" />
              <span className="inline-block h-1 w-1 animate-dot-bounce rounded-full bg-brand-500 [animation-delay:-0.16s]" />
              <span className="inline-block h-1 w-1 animate-dot-bounce rounded-full bg-py-300" />
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! 🎉
          </p>
        </div>
        <div className="relative h-1 w-56 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="absolute inset-y-0 left-0 w-1/3 animate-progress-slide rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-py-300" />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-500">
          {icon}
        </span>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-brand-900/40"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
