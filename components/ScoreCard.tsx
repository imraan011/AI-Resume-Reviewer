'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

export interface ScoreCardProps {
  title: string;
  score: number; // 0-10 range
  issues: string[];
  suggestions: string[];
  defaultOpen?: boolean;
}

export default function ScoreCard({
  title,
  score,
  issues,
  suggestions,
  defaultOpen = false,
}: ScoreCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  // Badge background, border and text style mapping based on score
  const getBadgeStyle = (val: number) => {
    if (val >= 8) {
      return 'text-[var(--success)] bg-[rgba(16,185,129,0.06)] border-[rgba(16,185,129,0.2)]';
    }
    if (val >= 5) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
    return 'text-[var(--danger)] bg-[rgba(244,63,94,0.05)] border-[rgba(244,63,94,0.2)]';
  };

  const getProgressColor = (val: number) => {
    if (val >= 8) return 'bg-[var(--success)]';
    if (val >= 5) return 'bg-amber-400';
    return 'bg-[var(--danger)]';
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      data-card
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col hover:border-[var(--accent)]/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.02)] transition-all duration-300 cursor-pointer overflow-hidden h-fit"
      onClick={toggleOpen}
    >
      {/* Header section name, progress and score */}
      <div className="p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base font-display tracking-tight truncate">
            {title}
          </h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border font-mono shrink-0 ${getBadgeStyle(
              score
            )}`}
          >
            {score}/10
          </span>
        </div>

        {/* progress bar */}
        <div className="h-[2px] w-full bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(
              score
            )}`}
            style={{ width: `${score * 10}%` }}
          />
        </div>

        {/* Collapsible toggle info line */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-medium pt-0.5">
          <span>
            {issues.length} {issues.length === 1 ? 'issue' : 'issues'} &bull;{' '}
            {suggestions.length} {suggestions.length === 1 ? 'fix' : 'fixes'}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Collapsible content with smooth CSS transition (max-height based) */}
      <div
        ref={contentRef}
        className="transition-all duration-300 ease-[var(--ease-expo)] overflow-hidden border-t border-[var(--border-subtle)]"
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight || 1000}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()} // prevent toggle when clicking content inside card
      >
        <div className="p-5 pt-4 flex flex-col gap-4 text-xs">
          {/* Issues bullet list */}
          {issues.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-[var(--danger)] uppercase font-mono tracking-wider text-[10px]">
                Issues ({issues.length})
              </h5>
              <ul className="space-y-2">
                {issues.map((issue, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-[var(--text-secondary)] leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] mt-1.5 shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions arrow list */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-[var(--accent)] uppercase font-mono tracking-wider text-[10px]">
                Suggestions ({suggestions.length})
              </h5>
              <ul className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-[var(--text-secondary)] leading-relaxed"
                  >
                    {/* green arrow icon */}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-1 shrink-0"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
