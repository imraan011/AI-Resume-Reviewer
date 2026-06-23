'use client';

import React from 'react';

interface RefProp<T> {
  elementRef?: React.RefObject<T | null>;
}

// "AI-Powered" tag label
export function HeroEyebrow({ elementRef }: RefProp<HTMLSpanElement>) {
  return (
    <span
      ref={elementRef}
      style={{
        opacity: 0,
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.2em',
        color: 'var(--accent)',
        textTransform: 'uppercase',
        padding: '5px 14px',
        border: '1px solid var(--accent-border)',
        borderRadius: '999px',
        background: 'var(--accent-dim)',
      }}
    >
      AI-Powered
    </span>
  );
}

// title with overflow:hidden container for lineReveal animation
export function HeroTitle({ elementRef }: RefProp<HTMLHeadingElement>) {
  return (
    <div style={{ overflow: 'hidden', lineHeight: 1 }}>
      <h1
        ref={elementRef}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.8rem, 8vw, 72px)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.08,
        }}
      >
        Resume <span style={{ color: 'var(--accent)' }}>Reviewer</span>
      </h1>
    </div>
  );
}

// dynamic subtext below heading
export function HeroSubtext({ elementRef }: RefProp<HTMLParagraphElement>) {
  return (
    <p
      ref={elementRef}
      style={{
        opacity: 0,
        fontSize: '16px',
        color: 'var(--text-secondary)',
        maxWidth: '440px',
        lineHeight: 1.65,
        letterSpacing: '0.01em',
      }}
    >
      Drop your PDF. Get brutal honesty.
    </p>
  );
}
