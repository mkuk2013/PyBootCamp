"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Play,
  Send,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Lightbulb,
  Lock,
  BookOpen,
  ScrollText,
  FileCode2,
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import MarkdownContent from "@/components/MarkdownContent";
import {
  getPyodide,
  runPythonInBrowser,
  normalize,
} from "@/lib/pyodide-client";

type TestCase = { input?: string; expected: string };

type Task = {
  id: number;
  moduleId: number;
  question: string;
  starterCode: string | null;
  expectedOutput: string;
  difficulty: "easy" | "medium" | "hard";
  testCases: string | null; // JSON string
  hints: string | null; // JSON string array
  examples: string | null; // markdown
};

type Props = {
  task: Task;
  initiallyCompleted: boolean;
  prevTaskId: number | null;
  nextTaskId: number | null;
  position: number;
  total: number;
  moduleContent: string | null;
  moduleTitle: string | null;
};

type TabKey = "problem" | "theory" | "examples";

const difficultyClass: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  medium:
    "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
  hard: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800",
};

export default function TaskWorkspace({
  task,
  initiallyCompleted,
  prevTaskId,
  nextTaskId,
  position,
  total,
  moduleContent,
  moduleTitle,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("problem");
  const hasTheory = !!(moduleContent && moduleContent.trim().length > 0);
  const hasExamples = !!(task.examples && task.examples.trim().length > 0);
  const router = useRouter();
  const [code, setCode] = useState(task.starterCode || "# Write your code here\n");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<null | "pass" | "fail">(
    initiallyCompleted ? "pass" : null
  );
  const [pyReady, setPyReady] = useState(false);
  const [pyLoading, setPyLoading] = useState(true);
  const [pyError, setPyError] = useState<string | null>(null);

  // Parse test cases & hints once
  const testCases = useRef<TestCase[]>(parseTestCases(task.testCases));
  const hints = useRef<string[]>(parseHints(task.hints));
  const [hintsRevealed, setHintsRevealed] = useState(0);

  // Lazy-load Pyodide on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await getPyodide();
        if (!cancelled) {
          setPyReady(true);
          setPyLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setPyError(err instanceof Error ? err.message : "Pyodide failed to load");
          setPyLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onRun() {
    if (!pyReady) {
      toast.error("Python runtime is still loading…");
      return;
    }
    setRunning(true);
    setOutput("");
    try {
      // For Run, use the first test case's stdin (if any), else no stdin
      const firstCase = testCases.current[0];
      const result = await runPythonInBrowser(code, firstCase?.input ?? "");
      const out =
        result.stderr && result.errored
          ? `\u26a0\ufe0f  Error:\n${result.stderr}`
          : result.stdout
          ? result.stdout +
            (result.stderr ? `\n\n[stderr]\n${result.stderr}` : "")
          : "(no output)";
      setOutput(out + `\n\n\u2014 Ran in ${result.time.toFixed(2)}s`);
    } catch (err) {
      setOutput(
        `Failed to run: ${err instanceof Error ? err.message : "unknown error"}`
      );
    } finally {
      setRunning(false);
    }
  }

  async function onSubmit() {
    if (!pyReady) {
      toast.error("Python runtime is still loading…");
      return;
    }
    setSubmitting(true);
    setOutput("");
    const startedAt = performance.now();

    try {
      // Run the code against each test case in the browser
      const cases = testCases.current.length
        ? testCases.current
        : [{ expected: task.expectedOutput }];

      const results: Array<{ stdout: string; stderr: string }> = [];
      for (const tc of cases) {
        const r = await runPythonInBrowser(code, tc.input ?? "");
        results.push({
          stdout: r.stdout,
          stderr: r.errored ? r.stderr : "",
        });
      }
      const runtimeMs = Math.round(performance.now() - startedAt);

      // Send results to server for verification + persistence
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          code,
          results,
          runtimeMs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Submit failed");
        setOutput(`Server error: ${data.error || res.statusText}`);
        return;
      }

      setVerdict(data.pass ? "pass" : "fail");

      if (data.pass) {
        toast.success(`\u2728 Passed! +${data.score} points`);
        setOutput(
          `\u2705 All ${cases.length} test case${cases.length === 1 ? "" : "s"} passed!\n\nOutput:\n${data.output}`
        );
        router.refresh();
      } else {
        toast.error("Output didn't match. Keep going!");
        const failedDetail = data.detail?.find(
          (d: { pass: boolean }) => !d.pass
        );
        const expected = failedDetail?.expected ?? "";
        const got = failedDetail?.got ?? "";
        const stderr = failedDetail?.stderr ?? "";
        const diff = failedDetail?.diff ?? "";
        setOutput(
          `\u274c Test case ${failedDetail?.idx ?? 1} failed.\n\n` +
            (stderr
              ? `[error]\n${stderr}\n\n`
              : `Expected (${expected.length} chars):\n${expected}\n\n` +
                `Got (${got.length} chars):\n${got || "(no output)"}\n` +
                (diff ? `\n\u2192 ${diff}\n` : ""))
        );
      }
    } catch (err) {
      toast.error("Submit failed");
      setOutput(
        `Failed to submit: ${err instanceof Error ? err.message : "unknown error"}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  function onReset() {
    setCode(task.starterCode || "# Write your code here\n");
    setOutput("");
    setVerdict(initiallyCompleted ? "pass" : null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* LEFT: tabbed content panel */}
      <aside className="space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <TabButton
            active={activeTab === "problem"}
            onClick={() => setActiveTab("problem")}
            icon={<FileCode2 className="h-4 w-4" />}
            label="Problem"
          />
          {hasTheory && (
            <TabButton
              active={activeTab === "theory"}
              onClick={() => setActiveTab("theory")}
              icon={<BookOpen className="h-4 w-4" />}
              label="Theory"
            />
          )}
          {hasExamples && (
            <TabButton
              active={activeTab === "examples"}
              onClick={() => setActiveTab("examples")}
              icon={<ScrollText className="h-4 w-4" />}
              label="Examples"
            />
          )}
        </div>

        {/* Problem tab */}
        {activeTab === "problem" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${difficultyClass[task.difficulty]}`}
              >
                {task.difficulty}
              </span>
              {testCases.current.length > 1 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                  {testCases.current.length} test cases
                </span>
              )}
              {verdict === "pass" && (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </span>
              )}
            </div>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-5 w-5 text-brand-500" />
              Problem
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {task.question}
            </p>
          </div>
        )}

        {/* Theory tab */}
        {activeTab === "theory" && hasTheory && (
          <div className="max-h-[640px] overflow-y-auto rounded-2xl border border-brand-200/70 bg-gradient-to-br from-brand-50/50 to-white p-6 shadow-sm dark:border-brand-800/40 dark:from-brand-900/10 dark:to-slate-900/80">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              <BookOpen className="h-4 w-4" />
              Reading material{moduleTitle ? " \u2014 " + moduleTitle : ""}
            </div>
            <MarkdownContent content={moduleContent ?? ""} />
          </div>
        )}

        {/* Examples tab */}
        {activeTab === "examples" && hasExamples && (
          <div className="max-h-[640px] overflow-y-auto rounded-2xl border border-py-300/60 bg-gradient-to-br from-yellow-50/60 to-white p-6 shadow-sm dark:border-py-300/30 dark:from-yellow-900/10 dark:to-slate-900/80">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <ScrollText className="h-4 w-4" />
              Worked Examples
            </div>
            <MarkdownContent content={task.examples ?? ""} />
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Expected Output
          </h3>
          <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm leading-relaxed text-emerald-300 ring-1 ring-slate-800">
            {task.expectedOutput || "(none)"}
          </pre>
        </div>

        {hints.current.length > 0 && (
          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-sm dark:border-amber-800/40 dark:from-amber-900/20 dark:to-yellow-900/10">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <Lightbulb className="h-4 w-4" />
                Hints
              </h3>
              <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-800/60 dark:text-amber-200">
                {hintsRevealed}/{hints.current.length}
              </span>
            </div>

            <ol className="space-y-2">
              {hints.current.map((h, i) => {
                const unlocked = i < hintsRevealed;
                return (
                  <li
                    key={i}
                    className={`flex gap-2 rounded-lg border p-3 text-sm transition ${
                      unlocked
                        ? "border-amber-200 bg-white text-slate-700 dark:border-amber-800/50 dark:bg-slate-900 dark:text-slate-200"
                        : "border-dashed border-amber-300/60 bg-white/40 text-slate-400 dark:border-amber-800/30 dark:bg-slate-900/40"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        unlocked
                          ? "bg-amber-400 text-amber-950"
                          : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      {unlocked ? (
                        <span className="whitespace-pre-wrap leading-relaxed">{h}</span>
                      ) : (
                        <span className="flex items-center gap-1.5 italic">
                          <Lock className="h-3.5 w-3.5" /> Locked… click below to reveal
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {hintsRevealed < hints.current.length && (
              <button
                type="button"
                onClick={() => setHintsRevealed((n) => n + 1)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-amber-500/30 transition hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98]"
              >
                <Lightbulb className="h-4 w-4" />
                {hintsRevealed === 0 ? "Show first hint" : `Show hint ${hintsRevealed + 1}`}
              </button>
            )}
            {hintsRevealed === hints.current.length && (
              <button
                type="button"
                onClick={() => setHintsRevealed(0)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-800/50 dark:bg-slate-900 dark:text-amber-300"
              >
                Hide hints
              </button>
            )}
          </div>
        )}

        {testCases.current.length > 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sample Test Cases
            </h3>
            <ul className="space-y-3">
              {testCases.current.slice(0, 3).map((tc, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700"
                >
                  {tc.input !== undefined && (
                    <>
                      <div className="mb-1 font-semibold text-slate-500 dark:text-slate-400">
                        Input
                      </div>
                      <pre className="mb-2 whitespace-pre-wrap rounded bg-slate-100 p-2 font-mono dark:bg-slate-950/60">
                        {tc.input || "(empty)"}
                      </pre>
                    </>
                  )}
                  <div className="mb-1 font-semibold text-slate-500 dark:text-slate-400">
                    Expected
                  </div>
                  <pre className="whitespace-pre-wrap rounded bg-slate-100 p-2 font-mono dark:bg-slate-950/60">
                    {tc.expected}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sibling task nav (mini) */}
        <div className="grid grid-cols-2 gap-2">
          {prevTaskId ? (
            <Link
              href={`/task/${prevTaskId}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
              <ChevronLeft className="h-4 w-4" /> Previous
            </span>
          )}
          {verdict === "pass" ? (
            nextTaskId ? (
              <Link
                href={`/task/${nextTaskId}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/module/${task.moduleId}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                <ListChecks className="h-4 w-4" /> Finish module
              </Link>
            )
          ) : (
            <span
              title="Solve this task first"
              className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900/50"
            >
              Locked <ChevronRight className="h-4 w-4 opacity-60" />
            </span>
          )}
        </div>
      </aside>

      {/* RIGHT: editor + console */}
      <section className="space-y-4">
        {/* Editor card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="flex gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="ml-2 font-mono">main.py</span>
            </div>
            <PyStatus loading={pyLoading} ready={pyReady} error={pyError} />
          </div>
          <CodeEditor value={code} onChange={setCode} height="380px" />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRun}
            disabled={running || submitting || !pyReady}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run
          </button>

          <button
            onClick={onSubmit}
            disabled={running || submitting || !pyReady}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:from-brand-700 hover:to-cyan-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </button>

          <button
            onClick={onReset}
            disabled={running || submitting}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            title="Reset to starter code"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>

          {/* Spacer pushes prev/next to the right */}
          <div className="ml-auto flex items-center gap-1.5">
            {total > 1 && (
              <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-block">
                {position} / {total}
              </span>
            )}
            {prevTaskId && (
              <Link
                href={`/task/${prevTaskId}`}
                title="Previous task"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            )}
            {/* Next/Finish only after the task is solved */}
            {verdict === "pass" ? (
              nextTaskId ? (
                <Link
                  href={`/task/${nextTaskId}`}
                  title="Next task"
                  className="group inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-teal-600 active:scale-95"
                >
                  Next task
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              ) : (
                total > 1 && (
                  <Link
                    href={`/module/${task.moduleId}`}
                    title="Back to module"
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-teal-600 active:scale-95"
                  >
                    <ListChecks className="h-4 w-4" />
                    Finish
                  </Link>
                )
              )
            ) : (
              nextTaskId && (
                <span
                  title="Solve this task to unlock the next one"
                  className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <span className="hidden sm:inline">Solve to unlock</span>
                  <span className="sm:hidden">Locked</span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </span>
              )
            )}
          </div>
        </div>

        {/* Console */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            <Terminal className="h-3.5 w-3.5" />
            Console
            {verdict === "pass" && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pass
              </span>
            )}
            {verdict === "fail" && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-rose-400">
                <XCircle className="h-3.5 w-3.5" /> Fail
              </span>
            )}
            {!verdict && (running || submitting) && (
              <span className="ml-auto inline-flex items-center gap-1 text-slate-400">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                Running…
              </span>
            )}
          </div>
          <pre className="min-h-[140px] max-h-[400px] overflow-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed">
            {output || (
              <span className="text-slate-500">
                {pyReady
                  ? "Click Run to execute your code, or Submit to grade against test cases."
                  : pyLoading
                  ? "⏳ Loading Python runtime (Pyodide)… first time can take ~5s."
                  : pyError
                  ? `Failed to load Python runtime: ${pyError}`
                  : ""}
              </span>
            )}
          </pre>
        </div>
      </section>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/30"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PyStatus({
  loading,
  ready,
  error,
}: {
  loading: boolean;
  ready: boolean;
  error: string | null;
}) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
        <XCircle className="h-3 w-3" /> Python failed
      </span>
    );
  }
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading Python…
      </span>
    );
  }
  if (ready) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Python ready
      </span>
    );
  }
  return null;
}

function parseHints(json: string | null): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) {
      return arr.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
    }
  } catch {
    /* ignore */
  }
  return [];
}

function parseTestCases(json: string | null): TestCase[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) {
      return arr.filter(
        (t): t is TestCase => t && typeof t.expected === "string"
      );
    }
  } catch {
    /* ignore */
  }
  return [];
}
