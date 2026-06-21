"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monaco } from "@monaco-editor/react";

/**
 * Monaco editor is heavy; load only on the client.
 */
const MonacoEditorInstance = dynamic(() => import("@monaco-editor/react"), {
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
  theme?: "vs-light" | "vs-dark" | "hc-black" | "monokai";
  fontSize?: number;
  autocomplete?: boolean;
};

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  height = "400px",
  theme: customTheme,
  fontSize = 14,
  autocomplete = true,
}: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Determine standard vs custom theme fallback
  const getTheme = () => {
    if (customTheme) return customTheme;
    return resolvedTheme === "dark" ? "vs-dark" : "vs-light";
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    // Programmatically define Monokai theme
    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "F8F8F2", background: "272822" },
        { token: "comment", foreground: "75715E", fontStyle: "italic" },
        { token: "keyword", foreground: "F92672", fontStyle: "bold" },
        { token: "number", foreground: "AE81FF" },
        { token: "string", foreground: "E6DB74" },
        { token: "type", foreground: "66D9EF", fontStyle: "italic" },
        { token: "function", foreground: "A6E22E" },
      ],
      colors: {
        "editor.background": "#272822",
        "editor.foreground": "#F8F8F2",
        "editor.lineHighlightBackground": "#3E3D32",
        "editorLineNumber.foreground": "#90908A",
        "editor.selectionBackground": "#49483E",
        "editorCursor.foreground": "#F8F8F0",
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
      <MonacoEditorInstance
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme={mounted ? getTheme() : "vs-dark"}
        onMount={handleEditorDidMount}
        options={{
          fontSize: fontSize,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          automaticLayout: true,
          quickSuggestions: autocomplete,
          suggestOnTriggerCharacters: autocomplete,
          snippetSuggestions: autocomplete ? "inline" : "none",
          fontFamily:
            "JetBrains Mono, Menlo, Consolas, 'Courier New', monospace",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}

