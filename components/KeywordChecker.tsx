'use client';

import { useState, useEffect } from 'react';
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pills hover enter event - GSAP scale-up triggers
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 1.04, duration: 0.15, ease: 'power2.out' });
  };

  // Pills hover exit event - scale-reset
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.15 });
  };

  return (
    <div 
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Title section and metrics summary */}
      <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
            Keyword Analysis
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            ATS systems scan for target keywords. Review which skills were successfully parsed.
          </p>
        </div>
        <div className="self-start sm:self-center font-mono text-[11px] uppercase tracking-wider text-[var(--accent)] bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.2)] px-3 py-1.5 rounded shrink-0 font-bold">
          {foundCount} / {totalKeywords} keywords found
        </div>
      </div>

      {/* Two columns layout: Found vs Missing */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '40px',
          alignItems: 'start',
        }}
      >
        {/* Found Keywords list */}
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
                onMouseLeave={handleMouseLeave}
                style={{
                  background: 'rgba(76,175,110,0.08)',
                  border: '1px solid rgba(76,175,110,0.20)',
                  color: '#4CAF6E',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: 'var(--font-sm)',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'default',
                }}
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

        {/* Missing Keywords list */}
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
                onMouseLeave={handleMouseLeave}
                style={{
                  background: 'rgba(218,48,54,0.06)',
                  border: '1px solid rgba(218,48,54,0.15)',
                  color: '#DA3036',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: 'var(--font-sm)',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'default',
                }}
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
