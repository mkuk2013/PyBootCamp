"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Check, X, Shield, User as UserIcon, Trash2 } from "lucide-react";

type Row = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  approved: boolean;
  createdAt: string;
};

export default function UsersTable({ users }: { users: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

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
  );
}
