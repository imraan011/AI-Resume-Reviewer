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

// buttons par magnetic cursor-attract pull effect setup karne ke liye helper
export function magneticEffect(selector: string): (() => void) | null {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return null;

  if (prefersReducedMotion()) return null;

  const cleanups: Array<{
    el: HTMLElement;
    move: (e: MouseEvent) => void;
    leave: () => void;
  }> = [];

  elements.forEach((el) => {
    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // distance multiplier ke saath mouse path par pull apply karo
      gsap.to(el, {
        x: offsetX * 0.35,
        y: offsetY * 0.35,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const leave = () => {
      // release par elastic pull bounce ke saath spring-back trigger karo
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    cleanups.push({ el, move, leave });
  });

  return () => {
    cleanups.forEach(({ el, move, leave }) => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    });
  };
}
