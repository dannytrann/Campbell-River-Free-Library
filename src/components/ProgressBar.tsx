export function ProgressBar({ visited, total }: { visited: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((visited / total) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-bold">
        <span>Tour progress</span>
        <span>
          {visited} of {total} libraries
        </span>
      </div>
      <div
        className="h-5 overflow-hidden rounded-full border-[2.5px] border-ink bg-white"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={visited}
      >
        <div
          className="h-full bg-[repeating-linear-gradient(45deg,var(--leaf),var(--leaf)_10px,#5fb07a_10px,#5fb07a_20px)] transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
