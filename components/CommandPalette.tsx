"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Command, FileText, Layout, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SearchItem {
  id: string;
  title: string;
  type: "level" | "module" | "task";
  href: string;
  descriptionText: string;
}

export default function CommandPalette({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredItems = useMemo(() => {
    if (!query) return [];
    return items.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query, items]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 transition-all hover:border-brand-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 lg:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search curriculum...</span>
        <kbd className="ml-4 flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-bold dark:border-slate-700 dark:bg-slate-800">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center border-b border-slate-100 px-6 dark:border-slate-800">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  autoFocus
                  placeholder="What do you want to learn today?"
                  className="h-16 w-full bg-transparent px-4 text-slate-900 outline-none dark:text-white"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4">
                {filteredItems.length > 0 ? (
                  <div className="space-y-2">
                    {filteredItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-4 rounded-2xl p-4 transition hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                          {item.type === "level" ? <Layout className="h-5 w-5 text-brand-500" /> : <FileText className="h-5 w-5 text-py-300" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold group-hover:text-brand-600 dark:group-hover:text-brand-400">{item.title}</h4>
                          <p className="text-xs text-slate-500">{item.descriptionText}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                      <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                      {query ? "No results found for your search." : "Start typing to search modules and tasks..."}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PyBootCamp Navigator</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <kbd className="rounded border border-slate-200 bg-white px-1 dark:border-slate-700 dark:bg-slate-800">↵</kbd> select
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <kbd className="rounded border border-slate-200 bg-white px-1 dark:border-slate-700 dark:bg-slate-800">↑↓</kbd> navigate
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
