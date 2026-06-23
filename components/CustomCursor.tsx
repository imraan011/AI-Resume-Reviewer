'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const CURSOR_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'var(--accent)',
  border: '0px solid var(--accent)',
  pointerEvents: 'none',
  zIndex: 999999,
  transform: 'translate(-50%, -50%)',
  // GSAP animations performance optimization
  willChange: 'width, height, background-color, border-width, transform',
};

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // touch device check — responsive design
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      cursor.style.display = 'none';
      return;
    }

    // native cursor class active karo
    document.documentElement.classList.add('custom-cursor-active');

    // cursor absolute coordinates placement via GSAP lag
    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    // hover trigger expand animation
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-pill]') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (isInteractive) {
        gsap.to(cursor, {
          width: 40,
          height: 40,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          duration: 0.25,
          ease: 'power2.out',
        });
      }
    };

    // release and revert cursor coordinates size
    const onMouseOut = () => {
      gsap.to(cursor, {
        width: 8,
        height: 8,
        backgroundColor: 'var(--accent)',
        borderWidth: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return <div ref={cursorRef} style={CURSOR_STYLE} aria-hidden="true" />;
}
