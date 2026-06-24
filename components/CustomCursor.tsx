'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // touch device check — responsive design
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      dot.style.display = 'none';
      ring.style.display = 'none';
      return;
    }

    // native cursor class active karo
    document.documentElement.classList.add('custom-cursor-active');

    // Set initial opacity to 0 to prevent flash before position is set
    gsap.set([dot, ring], { opacity: 0 });

    let isHovering = false;

    // cursor positioning via GSAP lag
    const onMouseMove = (e: MouseEvent) => {
      // Reveal on first move
      gsap.to([dot, ring], { opacity: 1, duration: 0.2, overwrite: 'auto' });

      // Inner dot follows instantly
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.05,
        overwrite: 'auto',
      });

      // Outer ring follows with smooth spring lag
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.28,
        ease: 'power3.out',
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
        target.closest('[data-card]') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (isInteractive && !isHovering) {
        isHovering = true;
        
        // Ring expands and glows
        gsap.to(ring, {
          width: 44,
          height: 44,
          borderColor: 'var(--accent)',
          background: 'var(--accent-glow)',
          borderWidth: '1px',
          duration: 0.25,
          ease: 'power2.out',
        });

        // Dot scales down and fades slightly
        gsap.to(dot, {
          scale: 0.4,
          backgroundColor: 'var(--accent)',
          duration: 0.25,
          ease: 'power2.out',
        });
      }
    };

    // release and revert cursor size
    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Ensure we are actually leaving the interactive element
      const relatedTarget = e.relatedTarget as HTMLElement;
      const wasInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-pill]') ||
        target.closest('[data-card]') ||
        window.getComputedStyle(target).cursor === 'pointer';

      const isStillInteractive = relatedTarget && (
        relatedTarget.tagName === 'A' ||
        relatedTarget.tagName === 'BUTTON' ||
        relatedTarget.closest('a') ||
        relatedTarget.closest('button') ||
        relatedTarget.closest('[data-pill]') ||
        relatedTarget.closest('[data-card]') ||
        window.getComputedStyle(relatedTarget).cursor === 'pointer'
      );

      if (wasInteractive && !isStillInteractive) {
        isHovering = false;
        
        // Ring reverts to default
        gsap.to(ring, {
          width: 28,
          height: 28,
          borderColor: 'var(--accent-border)',
          background: 'transparent',
          borderWidth: '1.2px',
          duration: 0.25,
          ease: 'power2.out',
        });

        // Dot reverts to default
        gsap.to(dot, {
          scale: 1,
          backgroundColor: 'var(--accent)',
          duration: 0.25,
          ease: 'power2.out',
        });
      }
    };

    // Viewport enter/leave visibility checks
    const hide = () => gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
    const show = () => gsap.to([dot, ring], { opacity: 1, duration: 0.25 });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
    };
  }, []);

  return (
    <>
      {/* Outer Floating Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1.2px solid var(--accent-border)',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 999999,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, width, height, border-color, background',
        }}
      />
      {/* Inner Micro Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          pointerEvents: 'none',
          zIndex: 999999,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, background-color, scale',
        }}
      />
    </>
  );
}
