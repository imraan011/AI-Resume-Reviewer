'use client';

import { type KeywordMatch } from '@/types';

interface KeywordCheckerProps {
  keywords: KeywordMatch[];
}

export default function KeywordChecker({ keywords }: KeywordCheckerProps) {
  // keyword details level color maps
  const getImportanceColor = (imp: 'high' | 'medium' | 'low') => {
    if (imp === 'high') return 'text-[var(--danger)] bg-[rgba(255,68,68,0.05)] border-[rgba(255,68,68,0.2)]';
    if (imp === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-6">
      {/* Title block info */}
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
          Keyword Match Checker
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          ATS parsers look for specific skill keywords. Here is how your resume matches up.
        </p>
      </div>

      {/* keyword list display grid */}
      <div className="flex flex-wrap gap-3">
        {keywords.map((kw) => (
          <div
            key={kw.word}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
              ${kw.found
                ? 'bg-[rgba(68,255,136,0.06)] border-[rgba(68,255,136,0.25)] text-[var(--success)]'
                : 'bg-[rgba(255,68,68,0.05)] border-[rgba(255,68,68,0.2)] text-[var(--danger)]'
              }
            `}
          >
            <span aria-hidden="true" className="font-bold">
              {kw.found ? '✓' : '✗'}
            </span>
            <span>{kw.word}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getImportanceColor(kw.importance)}`}>
              {kw.importance}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
