interface SpectrumBarProps {
  leftLabel: string;
  rightLabel: string;
  value: number; // 1-4
}

export default function SpectrumBar({ leftLabel, rightLabel, value }: SpectrumBarProps) {
  // Convert 1-4 to percentage (1=0%, 4=100%)
  const position = ((value - 1) / 3) * 100;

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono text-sepia">
      <span className="w-20 text-right shrink-0 truncate">{leftLabel}</span>
      <div className="relative flex-1 h-2 bg-ink/10 rounded-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-terracotta rounded-full border-2 border-paper shadow-sm transition-all"
          style={{ left: `calc(${position}% - 6px)` }}
        />
        {/* Track marks at each of the 4 positions */}
        {[0, 33.3, 66.7, 100].map((pct) => (
          <div
            key={pct}
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-ink/20 rounded-full"
            style={{ left: `${pct}%` }}
          />
        ))}
      </div>
      <span className="w-20 shrink-0 truncate">{rightLabel}</span>
    </div>
  );
}
