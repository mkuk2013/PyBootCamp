type Props = {
  percent: number;
  label?: string;
  className?: string;
};

export default function ProgressBar({ percent, label, className = "" }: Props) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>{label}</span>
          <span>{safe}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
