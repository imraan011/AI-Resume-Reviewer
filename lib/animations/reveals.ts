/**
 * lib/animations/reveals.ts
 *
 * Viewport dynamic animations (ScrollTrigger based).
 */
import { gsap } from '@/lib/gsap';

const DEFAULT_STAGGER = 0.1;

// OS/browser dynamic animation preferences check karne ke liye helper
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// target coordinates slide up and fade in
export function fadeUpReveal(
  selector: string,
  stagger: number = DEFAULT_STAGGER
): gsap.core.Tween | null {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return null;

  // animation skip for accessibility
  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return null;
  }

  return gsap.from(elements, {
    y: 40,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger,
    scrollTrigger: {
      trigger: elements[0],
      start: 'top 85%',
      once: true,
    },
  });
}

// clip-path sweep reveal effect (Mohed style)
export function lineReveal(selector: string): gsap.core.Tween | null {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return null;

  // show instantly
  if (prefersReducedMotion()) {
    gsap.set(elements, { clipPath: 'inset(0 0% 0 0)' });
    return null;
  }

  return gsap.fromTo(
    elements,
    { clipPath: 'inset(0 100% 0 0)' },
    {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 90%',
        once: true,
      },
    }
  );
}

// items parent entry par frame-by-frame stagger reveal honge
export function staggerReveal(
  parent: string,
  children: string
): gsap.core.Timeline | null {
  const parentEl = document.querySelector<HTMLElement>(parent);
  const childEls = document.querySelectorAll<HTMLElement>(children);

  if (!parentEl || !childEls.length) return null;

  // skip transition
  if (prefersReducedMotion()) {
    gsap.set(childEls, { opacity: 1, y: 0 });
    return null;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: parentEl,
      start: 'top 80%',
      once: true,
    },
  });

  tl.from(childEls, {
    y: 30,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.08,
  });

  return tl;
}
