"use client";

import { useEffect, useRef, useState } from "react";
import {
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  RotateCcw,
} from "lucide-react";

type Submission = {
  id: number;
  code: string;
  result: "pass" | "fail";
  score: number;
  output: string | null;
  runtimeMs: number | null;
  createdAt: string;
};

export default function SubmissionHistory({
  taskId,
  onRestore,
}: {
  taskId: number;
  onRestore: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions?taskId=${taskId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load history");
      setItems(data.submissions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next && !items) load();
      return next;
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        title="Submission history"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[min(420px,90vw)] origin-top-right animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <History className="h-3.5 w-3.5" />
              Your Submissions
            </span>
            <button
              onClick={() => load()}
              disabled={loading}
              className="text-xs font-semibold text-brand-600 hover:underline disabled:opacity-50 dark:text-brand-400"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && !items && (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {error && (
              <div className="p-6 text-center text-sm text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}
            {items && items.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <Code2 className="h-8 w-8 opacity-50" />
                No submissions yet. Hit Submit to record one.
              </div>
            )}
            {items && items.length > 0 && (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((s) => {
                  const expanded = expandedId === s.id;
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() =>
                          setExpandedId(expanded ? null : s.id)
                        }
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            s.result === "pass"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                          }`}
                        >
                          {s.result === "pass" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {s.result === "pass" ? "Passed" : "Failed"}
                            </span>
                            {s.result === "pass" && s.score > 0 && (
                              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                +{s.score}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            <Clock className="-mt-0.5 mr-0.5 inline h-3 w-3" />
                            {timeAgo(new Date(s.createdAt))}
                            {typeof s.runtimeMs === "number" && s.runtimeMs > 0 && (
                              <> · {s.runtimeMs}ms</>
                            )}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                          {expanded ? "Hide" : "View"}
                        </span>
                      </button>
                      {expanded && (
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                          <pre className="max-h-48 overflow-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
                            {s.code}
                          </pre>
                          <button
                            onClick={() => {
                              onRestore(s.code);
                              setOpen(false);
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore this code
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}
