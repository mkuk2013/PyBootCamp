"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Monaco editor is heavy; load only on the client.
 */
const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Loading editor…
    </div>
  ),
});

type Props = {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  height?: string | number;
};

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  height = "400px",
}: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
      <Monaco
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme={mounted && resolvedTheme === "dark" ? "vs-dark" : "vs-light"}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          automaticLayout: true,
          fontFamily:
            "JetBrains Mono, Menlo, Consolas, 'Courier New', monospace",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
