import { Award } from "lucide-react";
import * as Icons from "lucide-react";

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
  xpRequired: number;
  unlockedAt: Date;
};

type Props = {
  achievements: Achievement[];
};

const badgeColors: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  blue: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  purple: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  amber: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  orange: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  green: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
};

function getIcon(iconName: string) {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent className="h-5 w-5" /> : <Award className="h-5 w-5" />;
}

export default function AchievementsSection({ achievements }: Props) {
  if (achievements.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
          <Award className="h-5 w-5 text-brand-500" />
          Achievements
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete tasks to unlock achievements!
        </p>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No achievements yet. Keep learning to earn your first badge!
          </p>
        </div>
      </div>
    );
  }

  const unlockedDate = (date: Date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
        <Award className="h-5 w-5 text-brand-500" />
        Achievements
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Badges you've earned by completing tasks and challenges.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-start gap-3 rounded-xl border p-4 transition hover:shadow-md ${
              badgeColors[achievement.badgeColor] || badgeColors.emerald
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/50 shadow-sm dark:bg-black/20">
              {getIcon(achievement.icon)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">{achievement.name}</h3>
              <p className="mt-0.5 text-xs opacity-90">{achievement.description}</p>
              <p className="mt-1 text-[10px] opacity-75">
                Unlocked {unlockedDate(achievement.unlockedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
