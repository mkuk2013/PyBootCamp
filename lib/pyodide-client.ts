/**
 * Browser-side Python execution via Pyodide (Python compiled to WebAssembly).
 *
 * - Loaded once per session, cached as a singleton.
 * - Works on Netlify/Vercel/static hosting — no server execution.
 * - Free forever, no API keys, no rate limits.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<any>;
  }
}

const PYODIDE_VERSION = "0.26.2";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodidePromise: Promise<any> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

/** Lazy-load and initialise Pyodide. Returns the Pyodide runtime instance. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPyodide(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Pyodide is browser-only"));
  }
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (!window.loadPyodide) {
        await loadScript(`${PYODIDE_CDN}pyodide.js`);
      }
      if (!window.loadPyodide) {
        throw new Error("Pyodide global not available after script load");
      }
      const py = await window.loadPyodide({ indexURL: PYODIDE_CDN });
      return py;
    })().catch((err) => {
      pyodidePromise = null; // allow retry
      throw err;
    });
  }
  return pyodidePromise;
}

export type PyRunResult = {
  stdout: string;
  stderr: string;
  /** Total wall-clock seconds. */
  time: number;
  /** True if code threw a Python exception. */
  errored: boolean;
};

/**
 * Run Python code in the browser. Optional stdin string is fed line-by-line
 * to `input()` calls.
 */
export async function runPythonInBrowser(
  code: string,
  stdin?: string
): Promise<PyRunResult> {
  const py = await getPyodide();

  let stdout = "";
  let stderr = "";

  // Pyodide's `batched` callback emits one call per line *without* the
  // terminating newline, so we must add it back to faithfully reproduce
  // the program's stdout / stderr.
  py.setStdout({ batched: (s: string) => (stdout += s + "\n") });
  py.setStderr({ batched: (s: string) => (stderr += s + "\n") });

  // Feed stdin via sys.stdin so input() works naturally.
  const stdinData = stdin ?? "";
  py.globals.set("__pbc_stdin", stdinData);
  await py.runPythonAsync(`
import sys, io
sys.stdin = io.StringIO(__pbc_stdin)
`);

  const start = performance.now();
  let errored = false;
  try {
    await py.runPythonAsync(code);
  } catch (e: unknown) {
    errored = true;
    const msg = e instanceof Error ? e.message : String(e);
    stderr += msg;
  }
  const time = (performance.now() - start) / 1000;

  // Add a trailing newline to stdout if missing for nicer display
  return { stdout, stderr, time, errored };
}

/** Strip trailing whitespace + normalise line endings for fair comparison. */
export function normalize(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trimEnd();
}
