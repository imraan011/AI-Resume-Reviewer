'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { AnimatedDots } from './UploadZoneIcons';
import { magneticEffect } from '@/lib/animations';

interface UploadZoneButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export function UploadZoneButton({ isLoading, onClick }: UploadZoneButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  // magnetic button pull effect on mount
  useEffect(() => {
    const cleanup = magneticEffect('.magnetic-btn-analyze');
    return () => { cleanup?.(); };
  }, []);

  // GSAP micro-animations for interactions
  function onEnter() {
    if (isLoading) return;
    gsap.to(btnRef.current, { scale: 1.02, filter: 'brightness(1.1)', duration: 0.2 });
  }

  function onLeave() {
    gsap.to(btnRef.current, { scale: 1, filter: 'brightness(1)', duration: 0.2 });
  }

  function onDown() {
    gsap.to(btnRef.current, { scale: 0.98, duration: 0.1 });
  }

  function onUp() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
  }

  return (
    <button
      ref={btnRef}
      className="magnetic-btn-analyze"
      type="button"
      disabled={isLoading}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseDown={onDown}
      onMouseUp={onUp}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Analyzing resume' : 'Analyze resume'}
      style={{
        width: '100%',
        padding: '15px 24px',
        background: 'var(--accent)',
        color: '#000',
        border: 'none',
        borderRadius: '4px',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: isLoading ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }}
    >
      {isLoading ? (
        <>
          Analyzing
          <AnimatedDots />
        </>
      ) : (
        'Analyze Resume →'
      )}
    </button>
  );
}
