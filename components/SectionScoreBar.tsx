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
    if (val >= 8) return '#4CAF6E';
    if (val >= 5) return '#FFB800';
    return '#DA3036';
  };

  const getBadgeStyle = (val: number) => {
    if (val >= 8) return { color: '#4CAF6E', background: 'rgba(76,175,110,0.06)', border: '1px solid rgba(76,175,110,0.18)' };
    if (val >= 5) return { color: '#FFB800', background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.18)' };
    return { color: '#DA3036', background: 'rgba(218,48,54,0.05)', border: '1px solid rgba(218,48,54,0.15)' };
  };

  return (
    <div className="space-y-5 py-2">
      {/* Heading section */}
      <div>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: 'var(--font-label)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          <span className="w-1.5 h-3 bg-[var(--accent)] rounded-full" />
          Section Score Summary
        </h3>
      </div>

      {/* Scores list */}
      <div className="flex flex-col gap-4">
        {sections.map((sec) => {
          const badgeStyle = getBadgeStyle(sec.score);
          const barColor = getProgressColor(sec.score);

          return (
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

              {/* Unique segmented progress bar in the middle */}
              <div 
                style={{
                  flex: 1,
                  display: 'flex',
                  gap: '3.5px',
                  alignItems: 'center',
                }}
              >
                {Array.from({ length: 10 }).map((_, idx) => {
                  const isFilled = idx < sec.score;
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: '6px',
                        borderRadius: '1.5px',
                        backgroundColor: mounted && isFilled ? barColor : 'rgba(255, 255, 255, 0.045)',
                        transition: `background-color 0.4s ease ${idx * 0.04}s`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Numeric badge value on the right */}
              <span 
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  minWidth: '60px',
                  textAlign: 'right',
                  flexShrink: 0,
                  ...badgeStyle,
                }}
              >
                {sec.score} / 10
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
