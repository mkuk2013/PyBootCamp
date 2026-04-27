"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

type Level = {
  id: number;
  title: string;
  description: string | null;
  order: number;
};

export default function LevelsManager({ initialLevels }: { initialLevels: Level[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Level | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(payload: Partial<Level>, id?: number) {
    setBusy(true);
    try {
      const url = id ? `/api/admin/levels/${id}` : `/api/admin/levels`;
      const res = await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success(id ? "Updated" : "Created");
      setEditing(null);
      setCreating(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function del(id: number) {
    if (!confirm("Delete this level and ALL its modules/tasks?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/levels/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Delete failed");
        return;
      }
      toast.success("Deleted");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCreating(true)}
        className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        <Plus className="h-4 w-4" /> Add Level
      </button>

      {creating && (
        <LevelForm
          onCancel={() => setCreating(false)}
          onSave={(p) => save(p)}
          busy={busy}
          nextOrder={Math.max(0, ...initialLevels.map((l) => l.order)) + 1}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 w-16">Order</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialLevels.map((lv) =>
              editing?.id === lv.id ? (
                <tr key={lv.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td colSpan={4} className="p-3">
                    <LevelForm
                      initial={lv}
                      onCancel={() => setEditing(null)}
                      onSave={(p) => save(p, lv.id)}
                      busy={busy}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={lv.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-mono">{lv.order}</td>
                  <td className="px-4 py-3 font-medium">{lv.title}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {lv.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(lv)}
                        className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => del(lv.id)}
                        className="rounded-md bg-rose-600 p-1.5 text-white hover:bg-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {initialLevels.length === 0 && !creating && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No levels yet. Click <strong>Add Level</strong>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LevelForm({
  initial,
  onSave,
  onCancel,
  busy,
  nextOrder,
}: {
  initial?: Level;
  onSave: (p: { title: string; description: string | null; order: number }) => void;
  onCancel: () => void;
  busy: boolean;
  nextOrder?: number;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [order, setOrder] = useState<number>(initial?.order ?? nextOrder ?? 1);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ title, description: description || null, order });
      }}
      className="grid gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50 md:grid-cols-12"
    >
      <input
        type="number"
        min={1}
        value={order}
        onChange={(e) => setOrder(Number(e.target.value))}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2 dark:border-slate-700 dark:bg-slate-900"
        placeholder="Order"
      />
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-3 dark:border-slate-700 dark:bg-slate-900"
        placeholder="Title (e.g. Beginner)"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-5 dark:border-slate-700 dark:bg-slate-900"
        placeholder="Description"
      />
      <div className="flex gap-2 md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}
