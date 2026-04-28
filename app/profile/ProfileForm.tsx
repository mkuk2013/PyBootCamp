"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Save,
  Loader2,
  CheckCircle2,
  Shield,
  Calendar,
  Camera,
} from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";

type Props = {
  initialName: string;
  initialImage: string | null;
  email: string;
  role: "user" | "admin";
  approved: boolean;
  memberSince: string | null;
};

export default function ProfileForm({
  initialName,
  initialImage,
  email,
  role,
  approved,
  memberSince,
}: Props) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);

  const [image, setImage] = useState<string | null>(initialImage);
  const [savingImage, setSavingImage] = useState(false);

  async function onSaveImage() {
    if ((image ?? null) === (initialImage ?? null)) {
      toast("No changes to save", { icon: "\u2139\uFE0F" });
      return;
    }
    setSavingImage(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.issues) {
          const first = Object.values(data.issues).flat()[0] as string;
          toast.error(first || data.error || "Update failed");
        } else {
          toast.error(data.error || "Update failed");
        }
        return;
      }
      toast.success(image ? "Photo updated!" : "Photo removed");
      await updateSession();
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSavingImage(false);
    }
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (name === initialName) {
      toast("No changes to save", { icon: "ℹ️" });
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Update failed");
        return;
      }
      toast.success("Name updated!");
      // Refresh session so navbar etc. reflect new name
      await updateSession();
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSavingName(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Fill both password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("Password must contain a letter and a number");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must differ from current");
      return;
    }

    setSavingPwd(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Password update failed");
        return;
      }
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Network error");
    } finally {
      setSavingPwd(false);
    }
  }

  const initials = (initialName || email)
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSinceLabel = memberSince
    ? new Date(memberSince).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6">
      {/* Header / identity card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-py-50/40 p-6 shadow-sm dark:border-slate-800 dark:from-brand-900/20 dark:via-slate-900 dark:to-py-900/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-blob rounded-full bg-brand-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 animate-blob rounded-full bg-py-300/20 blur-3xl [animation-delay:3s]" />

        <div className="relative flex flex-wrap items-center gap-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-lg shadow-brand-500/30">
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image}
                alt={initialName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-py-400 text-2xl font-black text-white">
                {initials || "PY"}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {initialName}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              {email}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {role === "admin" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <Shield className="h-3 w-3" /> Admin
                </span>
              )}
              {approved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> Approved
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Pending approval
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Calendar className="h-3 w-3" /> Member since {memberSinceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile picture */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
          <Camera className="h-5 w-5 text-brand-500" />
          Profile picture
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Your photo appears on your profile, the leaderboard, and the navbar.
        </p>
        <AvatarUpload
          value={image}
          onChange={setImage}
          name={initialName}
          size={96}
          disabled={savingImage}
        />
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onSaveImage}
            disabled={
              savingImage || (image ?? null) === (initialImage ?? null)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/30 transition hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save photo
          </button>
        </div>
      </div>

      {/* Update name */}
      <form
        onSubmit={onSaveName}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
          <User className="h-5 w-5 text-brand-500" />
          Profile information
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Update how your name appears across PyBootCamp.
        </p>

        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Display name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={80}
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-brand-900/40"
        />

        <label className="mt-4 mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60"
        />
        <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={savingName || name === initialName}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/30 transition hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingName ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        </div>
      </form>

      {/* Change password */}
      <form
        onSubmit={onChangePassword}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
          <KeyRound className="h-5 w-5 text-amber-500" />
          Change password
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Use a strong password — at least 8 characters with a letter and a
          number.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
            <Field
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 8 chars"
              autoComplete="new-password"
            />
            <Field
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={savingPwd}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/30 transition hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingPwd ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Update password
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm transition focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-amber-900/40"
      />
    </div>
  );
}
