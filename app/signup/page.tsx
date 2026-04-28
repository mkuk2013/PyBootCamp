"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  Mail,
  Lock,
  User,
} from "lucide-react";
import PythonLogo from "@/components/PythonLogo";
import AvatarUpload from "@/components/AvatarUpload";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          const first = Object.values(data.issues).flat()[0] as string;
          toast.error(first || data.error || "Validation error");
        } else {
          toast.error(data.error || "Something went wrong");
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Account created — pending admin approval.");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 dark:bg-slate-950">
        <Decor />
        <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-slate-200/70 bg-white/80 p-10 text-center shadow-xl backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-9 w-9 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight">
            Account created! 🎉
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Your account is awaiting admin approval. You&apos;ll be able to log in once
            an admin approves you.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-glow active:scale-[0.98]"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 dark:bg-slate-950">
      <Decor />

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
            Create your account
          </h1>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Sign up to start learning Python. Free forever — no credit card.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <AvatarUpload
                value={image}
                onChange={setImage}
                name={form.name}
                size={80}
              />
            </div>

            <Field
              label="Full Name"
              icon={<User className="h-4 w-4" />}
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="Ada Lovelace"
            />
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
              minLength={8}
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="At least 8 chars, with letter & number"
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
                  Create Account
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Note:</strong>{" "}
            New accounts require admin approval before login.
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Decor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(55,118,171,0.25),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-20 top-20 -z-10 h-72 w-72 animate-blob rounded-full bg-py-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 -z-10 h-72 w-72 animate-blob rounded-full bg-brand-400/30 blur-3xl [animation-delay:3s]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
    </>
  );
}

function Field({
  label,
  icon,
  type,
  required,
  minLength,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  required?: boolean;
  minLength?: number;
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
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-brand-900/40"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
