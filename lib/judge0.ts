/**
 * Code execution client — uses local Python subprocess (free, no API).
 *
 * For multi-user production deploy, swap this re-export to point at a
 * sandboxed Judge0 / Piston instance.
 */

export {
  runPython,
  isAccepted,
  normalizeOutput,
  PYTHON_LANGUAGE_ID,
} from "./local-exec";

export type { LocalResult as Judge0Result } from "./local-exec";

export type Judge0Status =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Compilation Error"
  | "Runtime Error"
  | string;
