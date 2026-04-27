"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

type Task = {
  id: number;
  moduleId: number;
  question: string;
  starterCode: string | null;
  expectedOutput: string;
  testCases: string | null;
  hints: string | null;
  examples: string | null;
  difficulty: "easy" | "medium" | "hard";
  order: number;
};

type ModuleRef = { id: number; title: string };

export default function TasksManager({
  initialTasks,
  modules,
}: {
  initialTasks: Task[];
  modules: ModuleRef[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(payload: Partial<Task>, id?: number) {
    setBusy(true);
    try {
      const url = id ? `/api/admin/tasks/${id}` : `/api/admin/tasks`;
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
    if (!confirm("Delete this task and all its submissions?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
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

  const moduleTitle = (id: number) => modules.find((m) => m.id === id)?.title ?? "?";

  const diffClass: Record<string, string> = {
    easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCreating(true)}
        disabled={modules.length === 0}
        className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> Add Task
      </button>
      {modules.length === 0 && (
        <p className="text-sm text-amber-600">⚠️ Create a Module first.</p>
      )}

      {creating && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <TaskForm
            modules={modules}
            onCancel={() => setCreating(false)}
            onSave={(p) => save(p)}
            busy={busy}
          />
        </div>
      )}

      <div className="space-y-3">
        {initialTasks.map((t) =>
          editing?.id === t.id ? (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <TaskForm
                initial={t}
                modules={modules}
                onCancel={() => setEditing(null)}
                onSave={(p) => save(p, t.id)}
                busy={busy}
              />
            </div>
          ) : (
            <div
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2 text-xs">
                  <span className="font-medium text-brand-600">
                    {moduleTitle(t.moduleId)} · #{t.order}
                  </span>
                  <span className={`rounded px-2 py-0.5 font-medium ${diffClass[t.difficulty]}`}>
                    {t.difficulty}
                  </span>
                </div>
                <p className="text-sm">{t.question}</p>
                <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                  Expected: <code>{t.expectedOutput.slice(0, 80)}</code>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(t)}
                  className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => del(t.id)}
                  className="rounded-md bg-rose-600 p-1.5 text-white hover:bg-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}
        {initialTasks.length === 0 && !creating && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 dark:border-slate-700">
            No tasks yet.
          </div>
        )}
      </div>
    </div>
  );
}

function TaskForm({
  initial,
  modules,
  onSave,
  onCancel,
  busy,
}: {
  initial?: Task;
  modules: ModuleRef[];
  onSave: (p: {
    moduleId: number;
    question: string;
    starterCode: string | null;
    expectedOutput: string;
    testCases: string | null;
    hints: string | null;
    examples: string | null;
    difficulty: "easy" | "medium" | "hard";
    order: number;
  }) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [moduleId, setModuleId] = useState<number>(initial?.moduleId ?? modules[0]?.id ?? 0);
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [starterCode, setStarterCode] = useState(initial?.starterCode ?? "");
  const [expectedOutput, setExpectedOutput] = useState(initial?.expectedOutput ?? "");
  const [testCases, setTestCases] = useState(initial?.testCases ?? "");
  const [hints, setHints] = useState(initial?.hints ?? "");
  const [examples, setExamples] = useState(initial?.examples ?? "");
  const [difficulty, setDifficulty] = useState<Task["difficulty"]>(initial?.difficulty ?? "easy");
  const [order, setOrder] = useState<number>(initial?.order ?? 1);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          moduleId,
          question,
          starterCode: starterCode || null,
          expectedOutput,
          testCases: testCases || null,
          hints: hints || null,
          examples: examples || null,
          difficulty,
          order,
        });
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 md:grid-cols-12">
        <select
          value={moduleId}
          onChange={(e) => setModuleId(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-5 dark:border-slate-700 dark:bg-slate-900"
        >
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Task["difficulty"])}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
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
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        placeholder="Question / problem statement"
      />
      <textarea
        value={starterCode}
        onChange={(e) => setStarterCode(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        placeholder="# Starter code (optional)"
      />
      <textarea
        required
        value={expectedOutput}
        onChange={(e) => setExpectedOutput(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        placeholder="Expected stdout"
      />
      <textarea
        value={testCases}
        onChange={(e) => setTestCases(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
        placeholder='Optional JSON test cases: [{"input":"3\n","expected":"6"}]'
      />
      <textarea
        value={hints}
        onChange={(e) => setHints(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
        placeholder='Optional JSON hints (revealed one-by-one): ["Try a for loop", "Use input().split()", "Convert each item with int()"]'
      />
      <textarea
        value={examples}
        onChange={(e) => setExamples(e.target.value)}
        rows={5}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
        placeholder={`Optional Markdown examples (worked code samples). Example:\n\n### Example 1\n\n\u0060\u0060\u0060python\nfor i in range(3):\n    print(i)\n\u0060\u0060\u0060\nOutput:\n\u0060\u0060\u0060\n0\n1\n2\n\u0060\u0060\u0060`}
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
