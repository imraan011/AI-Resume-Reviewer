/**
 * lib/animations/effects.ts
 *
 * Micro-interactions (hover actions and number counting).
 */
import { gsap } from '@/lib/gsap';

const DEFAULT_COUNTER_DURATION = 1.5;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 0 se target number tak numeric counter
export function counterAnimate(
  el: HTMLElement,
  target: number,
  duration: number = DEFAULT_COUNTER_DURATION
): gsap.core.Tween | null {
  if (!el) return null;

  if (prefersReducedMotion()) {
    el.innerHTML = String(target);
    return null;
  }

  // proxy object jiske value attribute ko gsap interpolate karega
  const counter = { value: 0 };

  return gsap.to(counter, {
    value: target,
    duration,
    ease: 'power2.out',
    onUpdate() {
      el.innerHTML = String(Math.round(counter.value));
    },
  });
}

// mouse hover par dynamic spring lift effect, returns cleanup function
export function cardHoverEffect(selector: string): (() => void) | null {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return null;

  if (prefersReducedMotion()) return null;

  const handlers: Array<{
    el: HTMLElement;
    enter: () => void;
    leave: () => void;
  }> = [];

  elements.forEach((el) => {
    const enter = () =>
      gsap.to(el, { y: -4, duration: 0.3, ease: 'power2.out' });
    const leave = () =>
      gsap.to(el, { y: 0, duration: 0.3, ease: 'power2.out' });

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    handlers.push({ el, enter, leave });
  });

  return () => {
    handlers.forEach(({ el, enter, leave }) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    });
  };
}
