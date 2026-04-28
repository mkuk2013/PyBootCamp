"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Check,
  X,
  Shield,
  User as UserIcon,
  Trash2,
  CheckCheck,
  Loader2,
  KeyRound,
  Copy,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Wand2,
} from "lucide-react";

type Row = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  approved: boolean;
  createdAt: string;
};

type ResetResult = {
  user: Row;
  password: string;
};

export default function UsersTable({ users }: { users: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  /** User whose password the admin is currently editing (form modal). */
  const [resetTarget, setResetTarget] = useState<Row | null>(null);
  /** After a successful reset — shown so admin can copy & share. */
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function openReset(u: Row) {
    setResetTarget(u);
  }

  async function submitReset(u: Row, password: string) {
    setResetBusy(true);
    setBusy(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const issue =
          data.issues?.password?.[0] ?? data.error ?? "Reset failed";
        toast.error(issue);
        return;
      }
      setResetTarget(null);
      setResetResult({ user: u, password: data.password });
      setCopied(false);
      toast.success("Password reset \u2713");
    } catch {
      toast.error("Network error");
    } finally {
      setResetBusy(false);
      setBusy(null);
    }
  }

  async function copyPassword() {
    if (!resetResult) return;
    try {
      await navigator.clipboard.writeText(resetResult.password);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed\u2014select & copy manually");
    }
  }

  const pendingUsers = users.filter((u) => !u.approved);

  async function approveAll() {
    if (pendingUsers.length === 0) return;
    if (
      !confirm(
        `Approve all ${pendingUsers.length} pending user${
          pendingUsers.length === 1 ? "" : "s"
        }?`
      )
    )
      return;
    setBulkBusy(true);
    try {
      const results = await Promise.allSettled(
        pendingUsers.map((u) =>
          fetch(`/api/admin/users/${u.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approved: true }),
          }).then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || `Failed for ${u.email}`);
            }
          })
        )
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;
      if (fail === 0) {
        toast.success(`Approved ${ok} user${ok === 1 ? "" : "s"} ✓`);
      } else {
        toast.error(`${ok} approved, ${fail} failed`);
      }
      router.refresh();
    } finally {
      setBulkBusy(false);
    }
  }

  async function patch(id: string, body: object, label: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success(`${label} ✓`);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success("User deleted");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {pendingUsers.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm dark:border-amber-900/40 dark:bg-amber-900/20">
          <span className="text-amber-800 dark:text-amber-200">
            <strong>{pendingUsers.length}</strong> pending user
            {pendingUsers.length === 1 ? "" : "s"} awaiting approval
          </span>
          <button
            onClick={approveAll}
            disabled={bulkBusy}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
          >
            {bulkBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Approve all ({pendingUsers.length})
          </button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    u.role === "admin"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                {u.approved ? (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Approved
                  </span>
                ) : (
                  <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                    Pending
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {!u.approved && (
                    <button
                      disabled={busy === u.id}
                      onClick={() => patch(u.id, { approved: true }, "Approved")}
                      className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      title="Approve"
                    >
                      <Check className="inline h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {u.approved && (
                    <button
                      disabled={busy === u.id}
                      onClick={() => patch(u.id, { approved: false }, "Revoked")}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      title="Revoke approval"
                    >
                      <X className="inline h-3.5 w-3.5" /> Revoke
                    </button>
                  )}
                  <button
                    disabled={busy === u.id}
                    onClick={() =>
                      patch(
                        u.id,
                        { role: u.role === "admin" ? "user" : "admin" },
                        u.role === "admin" ? "Demoted to user" : "Promoted to admin"
                      )
                    }
                    className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    title="Toggle role"
                  >
                    {u.role === "admin" ? <UserIcon className="inline h-3.5 w-3.5" /> : <Shield className="inline h-3.5 w-3.5" />}
                  </button>
                  <button
                    disabled={busy === u.id}
                    onClick={() => openReset(u)}
                    className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40"
                    title="Reset password"
                  >
                    <KeyRound className="inline h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={busy === u.id}
                    onClick={() => del(u.id)}
                    className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="inline h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                No users yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {resetTarget && (
        <ResetPasswordForm
          email={resetTarget.email}
          name={resetTarget.name}
          busy={resetBusy}
          onCancel={() => setResetTarget(null)}
          onSubmit={(pwd) => submitReset(resetTarget, pwd)}
        />
      )}

      {resetResult && (
        <ResetPasswordResult
          email={resetResult.user.email}
          name={resetResult.user.name}
          password={resetResult.password}
          copied={copied}
          onCopy={copyPassword}
          onClose={() => setResetResult(null)}
        />
      )}
    </div>
  );
}

/**
 * Modal where the admin TYPES the new password for the target user.
 * Validates against the same policy as the API (>=8 chars, letter + digit).
 * Includes a show/hide toggle and a "Generate" helper for convenience.
 */
function ResetPasswordForm({
  email,
  name,
  busy,
  onCancel,
  onSubmit,
}: {
  email: string;
  name: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 72) return "Password is too long";
    if (!/[A-Za-z]/.test(password)) return "Password must contain a letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    if (password !== confirmPwd) return "Passwords do not match";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onSubmit(password);
  }

  function generate() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%&*?";
    const all = upper + lower + digits + symbols;
    const buf = new Uint32Array(14);
    crypto.getRandomValues(buf);
    const required = [
      upper[buf[0] % upper.length],
      lower[buf[1] % lower.length],
      digits[buf[2] % digits.length],
      symbols[buf[3] % symbols.length],
    ];
    const rest: string[] = [];
    for (let i = 4; i < 14; i++) rest.push(all[buf[i] % all.length]);
    const out = [...required, ...rest];
    // Fisher–Yates shuffle
    const swap = new Uint32Array(out.length);
    crypto.getRandomValues(swap);
    for (let i = out.length - 1; i > 0; i--) {
      const j = swap[i] % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    const pwd = out.join("");
    setPassword(pwd);
    setConfirmPwd(pwd);
    setShow(true);
    setError(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-fade-in-up rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <KeyRound className="h-5 w-5 text-amber-500" />
            Set new password
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            For <strong>{name}</strong> ({email})
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              The user&apos;s current password will stop working immediately
              after you save. Share the new one with them securely.
            </span>
          </div>

          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            New password
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={busy}
                placeholder="Min 8 chars, letter + digit"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title={show ? "Hide" : "Show"}
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Generate a strong password"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>

          <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Confirm password
          </label>
          <input
            type={show ? "text" : "password"}
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            disabled={busy}
            placeholder="Re-enter password"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
          />

          {error && (
            <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-amber-700 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Set password
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * Confirmation modal shown AFTER the password was successfully set,
 * letting the admin copy it once to share with the user.
 */
function ResetPasswordResult({
  email,
  name,
  password,
  copied,
  onCopy,
  onClose,
}: {
  email: string;
  name: string;
  password: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-fade-in-up rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Check className="h-5 w-5 text-emerald-500" />
            Password updated
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            New password for <strong>{name}</strong> ({email})
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Share this password securely with the user. It won&apos;t be
              shown again after you close this dialog.
            </span>
          </div>

          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Password
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={password}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              onClick={onCopy}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-bold text-white transition ${
                copied
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy
                </>
              )}
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
