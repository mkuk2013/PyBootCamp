"use client";

import { motion } from "framer-motion";
import { Code2, Hash, Repeat, Zap, Box } from "lucide-react";

interface Skill {
  name: string;
  icon: any;
  progress: number;
  color: string;
}

export default function SkillProgress({ completedCount }: { completedCount: number }) {
  // Mock logic: Skills unlock as the user completes more tasks
  const skills: Skill[] = [
    { name: "Basics", icon: Code2, progress: Math.min(100, completedCount * 10), color: "bg-blue-500" },
    { name: "Logic", icon: Zap, progress: Math.min(100, Math.max(0, (completedCount - 10) * 10)), color: "bg-amber-500" },
    { name: "Loops", icon: Repeat, progress: Math.min(100, Math.max(0, (completedCount - 20) * 10)), color: "bg-emerald-500" },
    { name: "Data", icon: Hash, progress: Math.min(100, Math.max(0, (completedCount - 30) * 10)), color: "bg-purple-500" },
    { name: "OOP", icon: Box, progress: Math.min(100, Math.max(0, (completedCount - 40) * 10)), color: "bg-rose-500" },
  ];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-6 text-lg font-bold">Skill Mastery</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
        {skills.map((skill, i) => (
          <div key={skill.name} className="group">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${skill.color} text-white shadow-lg shadow-${skill.color.split('-')[1]}-500/20`}>
                  <skill.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">{skill.name}</span>
              </div>
              <span className="text-xs font-black text-slate-400">{skill.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.progress}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`h-full ${skill.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
