'use client';

interface ScoreCardProps {
  title: string;
  score: number; // 0-10 range
  issuesCount: number;
  suggestionsCount: number;
}

export default function ScoreCard({ title, score, issuesCount, suggestionsCount }: ScoreCardProps) {
  // score ranges colors
  const getBadgeStyle = (val: number) => {
    if (val >= 8) {
      return 'text-[var(--success)] bg-[rgba(68,255,136,0.06)] border-[rgba(68,255,136,0.2)]';
    }
    if (val >= 5) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
    return 'text-[var(--danger)] bg-[rgba(255,68,68,0.05)] border-[rgba(255,68,68,0.2)]';
  };

  const getProgressColor = (val: number) => {
    if (val >= 8) return 'bg-[var(--success)]';
    if (val >= 5) return 'bg-amber-400';
    return 'bg-[var(--danger)]';
  };

  return (
    <div 
      data-card 
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-3.5 hover:border-[var(--accent)]/30 hover:shadow-[0_0_20px_rgba(232,255,71,0.02)] transition-all duration-300 opacity-0"
    >
      {/* Header section name and badges */}
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base font-display tracking-tight truncate">
          {title}
        </h4>
        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border font-mono shrink-0 ${getBadgeStyle(score)}`}>
          {score}/10
        </span>
      </div>

      {/* visual custom progress bar indicator */}
      <div className="h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden p-[1px] border border-[var(--border-subtle)]">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(score)}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>

      {/* detailed counter counts statistics */}
      <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] font-medium pt-0.5">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]/60" />
          {issuesCount} {issuesCount === 1 ? 'issue' : 'issues'}
        </span>
        <span className="w-1 h-1 rounded-full bg-neutral-800" />
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/60" />
          {suggestionsCount} {suggestionsCount === 1 ? 'suggestion' : 'suggestions'}
        </span>
      </div>
    </div>
  );
}
