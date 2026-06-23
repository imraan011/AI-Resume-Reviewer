'use client';

import { type ReviewSection } from '@/lib/types';
import { getScoreColor } from '@/components/ScoreRing';

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  section: ReviewSection;
}

export function SectionCard({ section }: SectionCardProps) {
  const scoreColor = getScoreColor(section.score);

  return (
    <article
      data-card
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {section.title}
        </h3>

        {/* score badge */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: scoreColor,
            background: `${scoreColor}14`,
            border: `1px solid ${scoreColor}30`,
            padding: '3px 10px',
            borderRadius: '999px',
            flexShrink: 0,
          }}
        >
          {section.score}/100
        </span>
      </header>

      {/* thin progress bar */}
      <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${section.score}%`,
            background: scoreColor,
            borderRadius: '2px',
            boxShadow: `0 0 6px ${scoreColor}60`,
            transition: 'width 0.8s ease',
          }}
        />
      </div>

      <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
        {section.feedback}
      </p>

      {/* suggestions — accent bullet ke saath */}
      {section.suggestions && section.suggestions.length > 0 && (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0 }}>
          {section.suggestions.map((tip) => (
            <li
              key={tip}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  marginTop: '5px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'inline-block',
                }}
              />
              {tip}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

// ─── Keyword Chip ─────────────────────────────────────────────────────────────

interface KeywordChipProps {
  word: string;
  found: boolean;
}

export function KeywordChip({ word, found }: KeywordChipProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 12px',
        borderRadius: '999px',
        border: `1px solid ${found ? 'rgba(68,255,136,0.25)' : 'rgba(255,68,68,0.2)'}`,
        background: found ? 'rgba(68,255,136,0.06)' : 'rgba(255,68,68,0.05)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        fontWeight: 500,
        color: found ? 'var(--success)' : 'var(--danger)',
        letterSpacing: '0.02em',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '10px' }}>{found ? '✓' : '✗'}</span>
      {word}
    </span>
  );
}
