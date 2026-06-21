"use client";

import { useState } from "react";
import { Award, X, Lock, CheckCircle2, Calendar } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  xpRequired: number;
  badgeColor: string;
};

export type UnlockedAchievement = {
  id: number;
  unlockedAt: string;
};

interface AchievementsGalleryProps {
  allAchievements: Achievement[];
  unlockedIds: number[];
  unlockedAtMap: Record<number, string>; // mapping achievementId -> unlockedAt date string
}

export default function AchievementsGallery({
  allAchievements,
  unlockedIds,
  unlockedAtMap,
}: AchievementsGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const total = allAchievements.length;
  const unlockedCount = unlockedIds.length;
  const percent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <>
      {/* Clickable Stat Card Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 group"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md group-hover:scale-110 transition-transform">
            <Award className="h-5 w-5" />
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {percent}% Completed
          </span>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Achievements
        </p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
          {unlockedCount} <span className="text-sm font-normal text-slate-400">/ {total} Unlocked</span>
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 group-hover:text-brand-500 transition-colors">
          View achievements gallery →
        </p>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Award className="h-5 w-5 text-emerald-500" />
                    Achievements Showcase
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Unlock badges by completing levels, tasks, and streaks.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Summary */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50/25 dark:bg-slate-900/40">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span>Unlocked Badges</span>
                    <span>{unlockedCount} of {total}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="max-h-[380px] overflow-y-auto p-6 grid gap-4 sm:grid-cols-2">
                {allAchievements.map((ach) => {
                  const isUnlocked = unlockedIds.includes(ach.id);
                  const unlockedDate = unlockedAtMap[ach.id];
                  
                  // Dynamically resolve icon
                  const Icon = (LucideIcons as any)[ach.icon] || Award;
                  
                  return (
                    <div
                      key={ach.id}
                      className={`relative flex gap-4 items-start p-4 rounded-2xl border transition-all ${
                        isUnlocked
                          ? "border-emerald-200 bg-emerald-50/15 dark:border-emerald-950/40 dark:bg-emerald-950/5"
                          : "border-slate-100 bg-slate-50/30 opacity-60 dark:border-slate-800/20 dark:bg-slate-950/10"
                      }`}
                    >
                      {/* Badge Icon */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md relative ${
                        isUnlocked
                          ? ach.badgeColor === "emerald"
                            ? "bg-emerald-500 shadow-emerald-500/20"
                            : ach.badgeColor === "amber"
                            ? "bg-amber-500 shadow-amber-500/20"
                            : ach.badgeColor === "rose"
                            ? "bg-rose-500 shadow-rose-500/20"
                            : "bg-brand-500 shadow-brand-500/20"
                          : "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-inner"
                      }`}>
                        <Icon className="h-6 w-6" />
                        {!isUnlocked && (
                          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-500 text-white shadow ring-2 ring-white dark:ring-slate-900">
                            <Lock className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {ach.name}
                          </h4>
                          {isUnlocked && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                          {ach.description}
                        </p>
                        
                        {isUnlocked && unlockedDate && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <Calendar className="h-3 w-3" />
                            Unlocked {new Date(unlockedDate).toLocaleDateString()}
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                            Requires {ach.xpRequired} XP
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Close Gallery
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
