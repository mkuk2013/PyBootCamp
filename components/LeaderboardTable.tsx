"use client";

import { useState } from "react";
import { Trophy, Medal, Award, Search, Sparkles } from "lucide-react";

type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  email: string;
  totalScore: number;
  tasksSolved: number;
};

interface LeaderboardTableProps {
  board: LeaderboardRow[];
  currentUserId?: string;
}

export default function LeaderboardTable({
  board,
  currentUserId,
}: LeaderboardTableProps) {
  const [search, setSearch] = useState("");

  const filteredBoard = board.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  // Extract top 3 for the podium
  const top1 = board.find((r) => r.rank === 1);
  const top2 = board.find((r) => r.rank === 2);
  const top3 = board.find((r) => r.rank === 3);

  function getAvatarInitials(name: string) {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Visual Podium Showcase */}
      {board.length > 0 && !search && (
        <div className="grid gap-4 sm:grid-cols-3 items-end pt-4 max-w-2xl mx-auto">
          {/* 2nd Place Card */}
          {top2 && (
            <div className="order-2 sm:order-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center relative overflow-hidden sm:h-[180px] flex flex-col justify-center items-center">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-slate-300 to-slate-400" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold mb-2 dark:bg-slate-800 dark:text-slate-400">
                <Medal className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                  2
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-full">
                {top2.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-1 font-semibold">
                {top2.totalScore} XP
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {top2.tasksSolved} tasks solved
              </p>
            </div>
          )}

          {/* 1st Place Card - Center/Highest */}
          {top1 && (
            <div className="order-1 sm:order-2 rounded-2xl border-2 border-amber-400 bg-amber-50/20 p-6 shadow-md dark:bg-slate-900/60 text-center relative overflow-hidden sm:h-[210px] flex flex-col justify-center items-center">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />
              <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-amber-400/10 blur-xl" />
              
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-white font-bold mb-3 shadow-md shadow-amber-500/20 animate-bounce">
                <Trophy className="h-7 w-7 text-yellow-100" />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-[11px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                  1
                </span>
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate max-w-full flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-yellow-500 shrink-0" />
                {top1.name}
              </h4>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-mono font-black mt-1">
                {top1.totalScore} XP
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {top1.tasksSolved} tasks solved
              </p>
            </div>
          )}

          {/* 3rd Place Card */}
          {top3 && (
            <div className="order-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center relative overflow-hidden sm:h-[160px] flex flex-col justify-center items-center">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 to-amber-700" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold mb-2 dark:bg-slate-800 dark:text-amber-400">
                <Award className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                  3
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-full">
                {top3.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-1 font-semibold">
                {top3.totalScore} XP
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {top3.tasksSolved} tasks solved
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Search Bar */}
      <div className="relative max-w-md mx-auto">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search learner rankings..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      {/* Rankings List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5 w-20">Rank</th>
              <th className="px-5 py-3.5">Explorer</th>
              <th className="px-5 py-3.5 text-right w-28">Tasks</th>
              <th className="px-5 py-3.5 text-right w-28">Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredBoard.map((r) => {
              const isMe = r.userId === currentUserId;
              
              const rankIcon = (rank: number) => {
                if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500 inline" />;
                if (rank === 2) return <Medal className="h-5 w-5 text-slate-400 inline" />;
                if (rank === 3) return <Award className="h-5 w-5 text-amber-600 inline" />;
                return <span className="text-xs font-mono font-bold text-slate-400">#{rank}</span>;
              };

              return (
                <tr
                  key={r.userId}
                  className={`border-t border-slate-100 dark:border-slate-800/80 transition-colors ${
                    isMe 
                      ? "bg-brand-50/60 font-semibold dark:bg-brand-900/10 border-l-4 border-l-brand-500" 
                      : "hover:bg-slate-50/50 dark:hover:bg-slate-850/40"
                  }`}
                >
                  <td className="px-5 py-4">{rankIcon(r.rank)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-xs font-black text-slate-600 dark:text-slate-350">
                        {getAvatarInitials(r.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-slate-900 dark:text-slate-100">
                          {r.name}
                          {isMe && (
                            <span className="ml-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 px-2 py-0.5 text-[9px] font-black uppercase text-brand-700 dark:text-brand-300">
                              You
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {r.tasksSolved}
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-extrabold text-brand-600 dark:text-brand-400">
                    {r.totalScore}
                  </td>
                </tr>
              );
            })}
            
            {filteredBoard.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-450 dark:text-slate-500 font-semibold">
                  No matching rankings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
