"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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

    // Immediate client-side navigation
    const dest =
      callbackUrl && callbackUrl !== "/dashboard" ? callbackUrl : "/dashboard";

    router.push(dest);
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 dark:bg-slate-950">
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
