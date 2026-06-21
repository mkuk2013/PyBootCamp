"use client";

import { X, Settings, Check } from "lucide-react";

export type EditorPreferences = {
  theme: "vs-light" | "vs-dark" | "hc-black" | "monokai";
  fontSize: number;
  autocomplete: boolean;
};

interface EditorSettingsProps {
  preferences: EditorPreferences;
  onPreferencesChange: (prefs: EditorPreferences) => void;
  onClose: () => void;
}

const THEMES = [
  { id: "vs-dark", name: "VS Dark" },
  { id: "vs-light", name: "VS Light" },
  { id: "monokai", name: "Monokai Retro" },
  { id: "hc-black", name: "High Contrast Black" },
];

export default function EditorSettings({
  preferences,
  onPreferencesChange,
  onClose,
}: EditorSettingsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-fade-in-up"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <Settings className="h-4 w-4 text-brand-500" />
            Editor Preferences
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Theme selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => {
                const active = preferences.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onPreferencesChange({ ...preferences, theme: theme.id as any })}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all ${
                      active
                        ? "border-brand-500 bg-brand-50/50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span>{theme.name}</span>
                    {active && <Check className="h-3.5 w-3.5 text-brand-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Font Size
              </label>
              <span className="text-xs font-mono font-bold text-slate-500">{preferences.fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="24"
              value={preferences.fontSize}
              onChange={(e) => onPreferencesChange({ ...preferences, fontSize: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5 mt-1">
              <span>Small (12px)</span>
              <span>Medium (16px)</span>
              <span>Large (24px)</span>
            </div>
          </div>

          {/* Autocomplete Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Auto-complete Suggestions
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Show inline autocomplete hints for Python code
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPreferencesChange({ ...preferences, autocomplete: !preferences.autocomplete })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.autocomplete ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.autocomplete ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
