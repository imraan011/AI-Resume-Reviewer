'use client';

import React from 'react';
import { gsap } from '@/lib/gsap';

interface ReviewBackButtonProps {
  btnRef: React.RefObject<HTMLButtonElement | null>;
  onClick: () => void;
}

export function ReviewBackButton({ btnRef, onClick }: ReviewBackButtonProps) {
  // subtle shift left transition on hover
  function onEnter() {
    gsap.to(btnRef.current, { x: -3, color: '#f0f0f0', duration: 0.2 });
  }

  function onLeave() {
    gsap.to(btnRef.current, { x: 0, color: 'var(--text-muted)', duration: 0.2 });
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label="Go back"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: '14px',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        padding: '0',
        marginBottom: '48px',
        letterSpacing: '0.01em',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M5 12l7-7M5 12l7 7" />
      </svg>
      Back
    </button>
  );
}
