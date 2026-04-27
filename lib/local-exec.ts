/**
 * Local Python execution via Node.js child_process.
 *
 * ⚠️  DEV/LEARNING ONLY — runs untrusted code on the host machine.
 * For multi-user production, swap back to a sandboxed Judge0 instance.
 *
 * Auto-detects available Python command (`py` on Windows, `python3` on Unix).
 */

import { spawn } from "child_process";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

export type LocalResult = {
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: string; // "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded"
  statusId: number; // 3, 4, 5, 11
  time: number | null;
  memory: number | null;
};

export type RunOpts = {
  code: string;
  stdin?: string;
  expectedOutput?: string;
  cpuTimeLimit?: number; // seconds
};

export const PYTHON_LANGUAGE_ID = 71;

let cachedCmd: string | null = null;

/** Pick the first working Python command on this OS. */
async function detectPython(): Promise<string> {
  if (cachedCmd) return cachedCmd;
  const candidates =
    process.platform === "win32"
      ? ["py", "python", "python3"]
      : ["python3", "python"];

  for (const cmd of candidates) {
    try {
      const ok = await new Promise<boolean>((resolve) => {
        const p = spawn(cmd, ["--version"], { shell: false });
        p.on("error", () => resolve(false));
        p.on("close", (code) => resolve(code === 0));
      });
      if (ok) {
        cachedCmd = cmd;
        return cmd;
      }
    } catch {
      /* try next */
    }
  }
  throw new Error(
    "Python interpreter not found. Install Python 3 from python.org and add it to PATH."
  );
}

export function normalizeOutput(s: string): string {
  return s.replace(/\r\n/g, "\n").trimEnd();
}

export function isAccepted(r: LocalResult): boolean {
  return r.statusId === 3;
}

/**
 * Execute Python code locally and return a Judge0-shaped result.
 */
export async function runPython(opts: RunOpts): Promise<LocalResult> {
  const py = await detectPython();
  const timeoutSec = opts.cpuTimeLimit ?? 5;
  const timeoutMs = timeoutSec * 1000;

  // Write code to a temp .py file (avoids Windows arg-length / quoting issues)
  const dir = join(tmpdir(), "pybootcamp");
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const file = join(dir, `run-${randomBytes(6).toString("hex")}.py`);
  await writeFile(file, opts.code, "utf-8");

  const start = Date.now();
  const result = await new Promise<{
    stdout: string;
    stderr: string;
    code: number | null;
    timedOut: boolean;
  }>((resolve) => {
    const child = spawn(py, [file], {
      shell: false,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    child.stdout.on("data", (d) => (stdout += d.toString("utf-8")));
    child.stderr.on("data", (d) => (stderr += d.toString("utf-8")));

    if (opts.stdin && opts.stdin.length > 0) {
      child.stdin.write(opts.stdin);
    }
    child.stdin.end();

    const killer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.on("close", (code) => {
      clearTimeout(killer);
      resolve({ stdout, stderr, code, timedOut });
    });

    child.on("error", (err) => {
      clearTimeout(killer);
      resolve({
        stdout,
        stderr: stderr + `\nspawn error: ${err.message}`,
        code: -1,
        timedOut: false,
      });
    });
  });

  // Cleanup temp file (best effort)
  unlink(file).catch(() => {});

  const elapsedSec = (Date.now() - start) / 1000;

  // Determine status
  let status = "Accepted";
  let statusId = 3;

  if (result.timedOut) {
    status = "Time Limit Exceeded";
    statusId = 5;
  } else if (result.code !== 0) {
    status = "Runtime Error";
    statusId = 11;
  } else if (typeof opts.expectedOutput === "string") {
    const expected = normalizeOutput(opts.expectedOutput);
    const actual = normalizeOutput(result.stdout);
    if (expected !== actual) {
      status = "Wrong Answer";
      statusId = 4;
    }
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    compileOutput: "",
    message: result.timedOut ? "SIGKILL" : "",
    status,
    statusId,
    time: elapsedSec,
    memory: null,
  };
}
