/**
 * Piston API client (Python execution).
 *
 * Piston is a 100% free public code-execution API by Engineer Man.
 * No auth, no signup, no rate limit issues for normal use.
 *
 * Docs: https://github.com/engineer-man/piston
 * Public endpoint: https://emkc.org/api/v2/piston
 */

const PISTON_URL =
  process.env.PISTON_API_URL ?? "https://emkc.org/api/v2/piston";

export type PistonResult = {
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: string; // "Accepted" | "Runtime Error" | "Time Limit Exceeded" | ...
  statusId: number; // 3 = Accepted, 6 = Runtime Error, 5 = TLE
  time: number | null; // seconds
  memory: number | null; // bytes
};

export type RunOpts = {
  code: string;
  stdin?: string;
  expectedOutput?: string; // for grading
  cpuTimeLimit?: number; // seconds
  memoryLimit?: number; // KB (informational only — Piston has its own limits)
};

/** Trim trailing whitespace per line for fair comparison. */
export function normalizeOutput(s: string): string {
  return s.replace(/\r\n/g, "\n").trimEnd();
}

/**
 * Run Python code via Piston. If `expectedOutput` is provided, the
 * `status`/`statusId` reflects exact-match acceptance.
 */
export async function runPython(opts: RunOpts): Promise<PistonResult> {
  const body = {
    language: "python",
    version: "3.10.0", // any 3.x — Piston picks closest available
    files: [{ name: "main.py", content: opts.code }],
    stdin: opts.stdin ?? "",
    run_timeout: (opts.cpuTimeLimit ?? 5) * 1000, // ms
  };

  let res: Response;
  try {
    res = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    throw new Error(`Piston network error: ${m}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Piston error ${res.status}: ${text}`);
  }

  const data = await res.json();

  // Piston response shape:
  // { language, version, run: { stdout, stderr, code, signal, output }, compile?: {...} }
  const stdout = (data.run?.stdout ?? "") as string;
  const stderr = (data.run?.stderr ?? "") as string;
  const compileOutput = (data.compile?.stderr ?? "") as string;
  const exitCode = data.run?.code as number | null;
  const signal = data.run?.signal as string | null;

  // Determine status
  let status: string;
  let statusId: number;
  if (compileOutput && compileOutput.trim().length > 0) {
    status = "Compilation Error";
    statusId = 6;
  } else if (signal === "SIGKILL") {
    status = "Time Limit Exceeded";
    statusId = 5;
  } else if (exitCode !== 0 && stderr) {
    status = "Runtime Error";
    statusId = 11;
  } else if (typeof opts.expectedOutput === "string") {
    const expected = normalizeOutput(opts.expectedOutput);
    const actual = normalizeOutput(stdout);
    if (expected === actual) {
      status = "Accepted";
      statusId = 3;
    } else {
      status = "Wrong Answer";
      statusId = 4;
    }
  } else {
    status = "Accepted";
    statusId = 3;
  }

  return {
    stdout,
    stderr,
    compileOutput,
    message: signal ?? "",
    status,
    statusId,
    time: null, // Piston doesn't return per-run timing
    memory: null,
  };
}

/** Did the run pass (exact match expected output)? */
export function isAccepted(r: PistonResult): boolean {
  return r.statusId === 3;
}

/** Constant kept for API compatibility with old judge0 client */
export const PYTHON_LANGUAGE_ID = 71;
