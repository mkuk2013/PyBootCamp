"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

type Module = {
  id: number;
  levelId: number;
  title: string;
  content: string;
  order: number;
};

type Level = { id: number; title: string; order: number };

export default function ModulesManager({
  initialModules,
  levels,
}: {
  initialModules: Module[];
  levels: Level[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Module | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(payload: Partial<Module>, id?: number) {
    setBusy(true);
    try {
      const url = id ? `/api/admin/modules/${id}` : `/api/admin/modules`;
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
    if (!confirm("Delete this module and ALL its tasks?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
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

  const levelTitle = (id: number) => levels.find((l) => l.id === id)?.title ?? "?";

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCreating(true)}
        disabled={levels.length === 0}
        className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> Add Module
      </button>
      {levels.length === 0 && (
        <p className="text-sm text-amber-600">⚠️ Create a Level first.</p>
      )}

      {creating && (
        <ModuleForm
          levels={levels}
          onCancel={() => setCreating(false)}
          onSave={(p) => save(p)}
          busy={busy}
        />
      )}

      <div className="space-y-3">
        {initialModules.map((m) =>
          editing?.id === m.id ? (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <ModuleForm
                initial={m}
                levels={levels}
                onCancel={() => setEditing(null)}
                onSave={(p) => save(p, m.id)}
                busy={busy}
              />
            </div>
          ) : (
            <div
              key={m.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex-1">
                <p className="text-xs font-medium text-brand-600">
                  {levelTitle(m.levelId)} · order {m.order}
                </p>
                <h3 className="font-semibold">{m.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {m.content.slice(0, 200)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(m)}
                  className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => del(m.id)}
                  className="rounded-md bg-rose-600 p-1.5 text-white hover:bg-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}
        {initialModules.length === 0 && !creating && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 dark:border-slate-700">
            No modules yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleForm({
  initial,
  levels,
  onSave,
  onCancel,
  busy,
}: {
  initial?: Module;
  levels: Level[];
  onSave: (p: { levelId: number; title: string; content: string; order: number }) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [levelId, setLevelId] = useState<number>(initial?.levelId ?? levels[0]?.id ?? 0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [order, setOrder] = useState<number>(initial?.order ?? 1);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ levelId, title, content, order });
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 md:grid-cols-12">
        <select
          value={levelId}
          onChange={(e) => setLevelId(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-4 dark:border-slate-700 dark:bg-slate-900"
        >
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-6 dark:border-slate-700 dark:bg-slate-900"
          placeholder="Module title"
        />
        <input
          type="number"
          min={1}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2 dark:border-slate-700 dark:bg-slate-900"
          placeholder="Order"
        />
      </div>
      <textarea
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        placeholder="Markdown content (supports headings, code blocks, lists, tables)…"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}
