'use client';

interface FeedbackSectionProps {
  title: string;
  score: number; // 0-10 score limit
  issues: string[];
  suggestions: string[];
}

export default function FeedbackSection({ title, score, issues, suggestions }: FeedbackSectionProps) {
  return (
    <div 
      data-card 
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col gap-6 hover:border-[var(--accent)]/10 transition-all duration-300 opacity-0"
    >
      {/* Title & Section score banner */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)] font-display tracking-tight">
          {title}
        </h3>
        <span className="px-3.5 py-1 text-xs font-bold font-mono rounded-full border border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)] tracking-wider shrink-0">
          SCORE: {score}/10
        </span>
      </div>

      {/* Content wrapper with layout flex gaps */}
      <div className="flex flex-col gap-5">
        {/* critical issues block */}
        <div className="border-l-4 border-[var(--danger)] bg-[var(--danger)]/[0.02] p-4 rounded-r-lg space-y-3">
          <h4 className="text-xs font-bold text-[var(--danger)] uppercase tracking-widest font-mono">
            Issues Found ({issues.length})
          </h4>
          {issues.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm italic">No major issues found in this section.</p>
          ) : (
            <ul className="space-y-2.5">
              {issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] mt-2 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* improvement suggestions block */}
        <div className="border-l-4 border-[var(--accent)] bg-[var(--accent-dim)] p-4 rounded-r-lg space-y-3">
          <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest font-mono">
            How to Improve ({suggestions.length})
          </h4>
          {suggestions.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm italic">No recommendations needed.</p>
          ) : (
            <ul className="space-y-2.5">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
