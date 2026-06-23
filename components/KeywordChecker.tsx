'use client';

import { type KeywordMatch } from '@/types';
import { gsap } from '@/lib/gsap';

interface KeywordCheckerProps {
  keywords: KeywordMatch[];
}

export default function KeywordChecker({ keywords }: KeywordCheckerProps) {
  const foundKeywords = keywords.filter((kw) => kw.found);
  const missingKeywords = keywords.filter((kw) => !kw.found);
  const totalKeywords = keywords.length;
  const foundCount = foundKeywords.length;

  // hover enter border outline color transition
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { borderColor: 'var(--accent)', duration: 0.2, overwrite: 'auto' });
  };

  // hover exit border outline reset
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, found: boolean) => {
    const defaultBorderColor = found ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.15)';
    gsap.to(e.currentTarget, { borderColor: defaultBorderColor, duration: 0.2, overwrite: 'auto' });
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-6">
      {/* Title section and count summary metrics */}
      <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
            Keyword Analysis
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            ATS systems scan for target keywords. Review which skills were successfully parsed.
          </p>
        </div>
        <div className="self-start sm:self-center font-mono text-[11px] uppercase tracking-wider text-[var(--accent)] bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.2)] px-3 py-1.5 rounded-full shrink-0 font-bold">
          {foundCount} / {totalKeywords} keywords found
        </div>
      </div>

      {/* Two columns: Found vs Missing categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Found Keywords column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--success)] font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            Found ({foundKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {foundKeywords.map((kw) => (
              <div
                key={kw.word}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.06)] text-[var(--success)] text-xs font-medium transition-colors cursor-default"
              >
                <span>✓</span>
                <span>{kw.word}</span>
                {kw.importance === 'high' && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="var(--accent)"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    className="shrink-0 ml-0.5"
                    aria-label="High importance"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Missing Keywords column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--danger)] font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
            Missing ({missingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {missingKeywords.map((kw) => (
              <div
                key={kw.word}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={(e) => handleMouseLeave(e, false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(244,63,94,0.15)] bg-[rgba(244,63,94,0.02)] text-[var(--text-secondary)] line-through text-xs font-medium transition-colors cursor-default"
              >
                <span>✗</span>
                <span>{kw.word}</span>
                {kw.importance === 'high' && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="var(--accent)"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    className="shrink-0 ml-0.5 opacity-60"
                    aria-label="High importance"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
