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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
            }}
          >
            {/* Category label on the left */}
            <span 
              className="truncate"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                minWidth: '180px',
                flexShrink: 0,
              }}
            >
              {sec.title}
            </span>

            {/* Progress bar track in the middle */}
            <div 
              style={{
                flex: 1,
                height: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '999px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
              }}
            >
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-[var(--ease-expo)] ${getProgressColor(sec.score)}`}
                style={{ width: mounted ? `${sec.score * 10}%` : '0%' }}
              />
            </div>

            {/* Numeric badge value on the right */}
            <span 
              className={getBadgeStyle(sec.score)}
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid',
                fontFamily: 'var(--font-mono)',
                minWidth: '60px',
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {sec.score} / 10
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
