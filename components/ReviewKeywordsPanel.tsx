'use client';

import React from 'react';
import { type ReviewResult } from '@/lib/types';
import { KeywordChip } from './ReviewCards';

interface ReviewKeywordsPanelProps {
  review: ReviewResult;
  panelRef: React.RefObject<HTMLDivElement | null>;
}

export function ReviewKeywordsPanel({ review, panelRef }: ReviewKeywordsPanelProps) {
  return (
    <div ref={panelRef} style={{ opacity: 0 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Keyword Match
      </h2>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
        {/* found/missing indicators legend */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '18px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span><span style={{ color: 'var(--success)' }}>✓</span> Found in resume</span>
          <span><span style={{ color: 'var(--danger)' }}>✗</span> Missing</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {review.keywords.map(({ word, found }) => (
            <KeywordChip key={word} word={word} found={found} />
          ))}
        </div>
      </div>
    </div>
  );
}
