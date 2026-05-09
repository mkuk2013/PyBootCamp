"use client";

import { useState } from "react";
import { Sparkles, Loader2, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AITutorProps {
  code: string;
  question: string;
  expectedOutput: string;
  currentOutput: string;
  hintsRevealed: number;
}

export default function AITutor({
  code,
  question,
  expectedOutput,
  currentOutput,
  hintsRevealed,
}: AITutorProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function getAIHint() {
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          question,
          expectedOutput,
          currentOutput,
          hintsRevealed,
        }),
      });
      const data = await res.json();
      setResponse(data.message || data.error || "I'm having trouble thinking right now. Try again!");
    } catch (err) {
      setResponse("Failed to connect to AI Mentor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={getAIHint}
        disabled={loading}
        className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-70 dark:bg-brand-500 dark:hover:bg-brand-600"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-400/20 via-py-300/20 to-brand-400/20 opacity-0 transition-opacity group-hover:opacity-100 animate-gradient-x" />
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-py-300" />
        )}
        Ask AI Mentor
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-4 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">AI Mentor</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {loading ? (
                <div className="flex flex-col gap-2 py-2">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              ) : (
                response
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Powered by Gemini AI
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
