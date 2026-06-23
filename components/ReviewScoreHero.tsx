'use client';

import React from 'react';
import { type ReviewResult } from '@/lib/types';
import { ScoreRing } from './ScoreRing';

interface ReviewScoreHeroProps {
  review: ReviewResult;
  scoreColor: string;
  scoreLabelRef: React.RefObject<HTMLSpanElement | null>;
  scoreNumRef: React.RefObject<HTMLSpanElement | null>;
  ringRef: React.RefObject<SVGCircleElement | null>;
  summaryRef: React.RefObject<HTMLParagraphElement | null>;
}

export function ReviewScoreHero({
  review,
  scoreColor,
  scoreLabelRef,
  scoreNumRef,
  ringRef,
  summaryRef,
}: ReviewScoreHeroProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'clamp(200px, 25%, 260px) 1fr',
        gap: 'clamp(32px, 5vw, 64px)',
        alignItems: 'center',
        marginBottom: 'clamp(48px, 7vw, 80px)',
      }}
    >
      {/* circular score display */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <span
          ref={scoreLabelRef}
          style={{ opacity: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase' }}
        >
          ATS Score
        </span>
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <ScoreRing color={scoreColor} ringRef={ringRef} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <span
              ref={scoreNumRef}
              style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 24px ${scoreColor}50` }}
            >
              0
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* review overview summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          Resume Analysis
        </h1>
        <div style={{ overflow: 'hidden' }}>
          <p ref={summaryRef} style={{ fontSize: 'clamp(14px, 1.6vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '560px' }}>
            {review.summary}
          </p>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Analyzed {new Date(review.analyzedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
