"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search, ClipboardCopy, Check, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

type SubmissionRow = {
  id: number;
  code: string;
  result: "pass" | "fail";
  score: number;
  output: string | null;
  runtimeMs: number | null;
  createdAt: any;
  userName: string | null;
  userEmail: string | null;
  taskQuestion: string | null;
  taskDifficulty: string | null;
};

interface SubmissionsTableProps {
  initialRows: SubmissionRow[];
}

export default function SubmissionsTable({ initialRows }: SubmissionsTableProps) {
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<"all" | "pass" | "fail">("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredRows = initialRows.filter((r) => {
    const matchesSearch =
      (r.userName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (r.userEmail?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (r.taskQuestion?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesVerdict = verdictFilter === "all" || r.result === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  async function copyCode(id: number, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success("Code copied");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Search and Filters */}
      <div className="grid gap-3 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:grid-cols-12">
        <div className="relative md:col-span-8">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or task..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Verdicts</option>
            <option value="pass">Passed Only</option>
            <option value="fail">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredRows.map((s) => (
          <details
            key={s.id}
            className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 select-none">
              <div className="flex items-center gap-3">
                {s.result === "pass" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-150">
                    {s.userName} <span className="text-xs font-semibold text-slate-400">({s.userEmail})</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[280px] sm:max-w-md md:max-w-xl">
                    Task: {s.taskQuestion || "(task deleted)"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="hidden sm:inline rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-semibold text-[10px] uppercase">
                  {s.taskDifficulty}
                </span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">+{s.score} pts</span>
                <span className="font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {s.runtimeMs ?? 0} ms
                </span>
              </div>
            </summary>

            <div className="space-y-4 border-t border-slate-100 px-4 py-4 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/40">
              {/* Code section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Submitted Code
                  </h4>
                  <button
                    onClick={() => copyCode(s.id, s.code)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                  >
                    {copiedId === s.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-100 border border-slate-900 leading-relaxed max-h-[300px]">
                  <code>{s.code}</code>
                </pre>
              </div>

              {/* Output section */}
              {s.output && (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Execution Output / Diagnostic Log
                  </h4>
                  <pre className="overflow-x-auto rounded-xl bg-slate-100 p-4 font-mono text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-350 border border-slate-200 dark:border-slate-900 leading-relaxed max-h-[200px]">
                    <code>{s.output}</code>
                  </pre>
                </div>
              )}
            </div>
          </details>
        ))}

        {filteredRows.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-450 dark:border-slate-750 dark:text-slate-500 font-semibold">
            No matching submissions found.
          </div>
        )}
      </div>
    </div>
  );
}
