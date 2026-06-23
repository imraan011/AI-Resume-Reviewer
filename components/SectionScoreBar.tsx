'use client';

import { useState, useEffect } from 'react';
import { type FeedbackSection } from '@/types';

interface SectionScoreBarProps {
  sections: FeedbackSection[];
}

export default function SectionScoreBar({ sections }: SectionScoreBarProps) {
  const [mounted, setMounted] = useState(false);

  // Trigger mounts to execute CSS transition on load
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getProgressColor = (val: number) => {
    if (val >= 8) return 'bg-[var(--success)]';
    if (val >= 5) return 'bg-amber-400';
    return 'bg-[var(--danger)]';
  };

  const getBadgeStyle = (val: number) => {
    if (val >= 8) return 'text-[var(--success)] bg-[rgba(16,185,129,0.06)] border-[rgba(16,185,129,0.2)]';
    if (val >= 5) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-[var(--danger)] bg-[rgba(244,63,94,0.05)] border-[rgba(244,63,94,0.2)]';
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-6">
      {/* Heading section */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] font-display flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[var(--accent)] rounded-full" />
          Section Score Summary
        </h3>
      </div>

      {/* Scores list */}
      <div className="flex flex-col gap-4">
        {sections.map((sec) => (
          <div 
            key={sec.title} 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-6"
          >
            {/* Category label on the left */}
            <span className="text-xs font-bold text-[var(--text-primary)] font-display w-full sm:w-44 truncate">
              {sec.title}
            </span>

            {/* Progress bar track in the middle */}
            <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-subtle)] p-[1px] relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-[var(--ease-expo)] ${getProgressColor(sec.score)}`}
                style={{ width: mounted ? `${sec.score * 10}%` : '0%' }}
              />
            </div>

            {/* Numeric badge value on the right */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono tracking-tight shrink-0 self-end sm:self-center text-center w-14 ${getBadgeStyle(sec.score)}`}>
              {sec.score} / 10
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
