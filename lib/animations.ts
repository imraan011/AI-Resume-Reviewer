/**
 * lib/animations.ts
 *
 * Reusable GSAP animation functions — app-wide use.
 * Import GSAP from @/lib/gsap — never directly from the 'gsap' package.
 */
import { gsap, ScrollTrigger } from '@/lib/gsap';

// ScrollTrigger ka import use ho raha hai via gsap.ts — yahan sirf ensure karo
void ScrollTrigger;

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_STAGGER = 0.1;
const DEFAULT_COUNTER_DURATION = 1.5;

// ─── Internal Helper ──────────────────────────────────────────────────────────

/**
 * Check if the user has requested reduced motion via OS/browser settings.
 * All animation functions in this file respect this preference.
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─── 1. fadeUpReveal ──────────────────────────────────────────────────────────

/**
 * Animate elements from y:40/opacity:0 to y:0/opacity:1 when they
 * enter the viewport. Powered by ScrollTrigger.
 *
 * @param selector - CSS selector for target elements
 * @param stagger  - delay between each element in seconds (default 0.1)
 * @returns GSAP Tween for chaining, or null if skipped
 */
export function fadeUpReveal(
  selector: string,
  stagger: number = DEFAULT_STAGGER
): gsap.core.Tween | null {
  // element nahi mila toh silently return karo
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return null;

  // reduced motion — seedha final state set karo, animate mat karo
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
      once: true, // ek baar ho phir dobara trigger mat karo
    },
  });
}

// ─── 2. lineReveal ────────────────────────────────────────────────────────────

/**
 * Clip-path curtain wipe reveal for text lines.
 * Animates: inset(0 100% 0 0) → inset(0 0% 0 0)
 * Effect: text sweeps in from left to right (Mohed-style).
 *
 * Note: target elements must have overflow:hidden or the clip will show
 * artifacts on the parent. Wrap text in a div if needed.
 *
 * @param selector - CSS selector for text elements
 * @returns GSAP Tween for chaining, or null if skipped
 */
export function lineReveal(selector: string): gsap.core.Tween | null {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return null;

  // reduced motion — clip hata ke directly dikhao
  if (prefersReducedMotion()) {
    gsap.set(elements, { clipPath: 'inset(0 0% 0 0)' });
    return null;
  }

  // right: 100%→0% = left se right reveal
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

// ─── 3. counterAnimate ────────────────────────────────────────────────────────

/**
 * Cinematic number counter: animates from 0 → target and writes the
 * rounded value into the element's innerHTML on every frame.
 *
 * Uses a plain object proxy {value: 0} because GSAP cannot tween
 * innerHTML directly — it needs a numeric property to interpolate.
 *
 * @param el       - HTMLElement whose innerHTML will show the count
 * @param target   - final number to count to
 * @param duration - animation length in seconds (default 1.5)
 * @returns GSAP Tween for chaining, or null if skipped
 */
export function counterAnimate(
  el: HTMLElement,
  target: number,
  duration: number = DEFAULT_COUNTER_DURATION
): gsap.core.Tween | null {
  if (!el) return null;

  // reduced motion — seedha number dikhao
  if (prefersReducedMotion()) {
    el.innerHTML = String(target);
    return null;
  }

  // numeric proxy — gsap yeh object ko tween karega
  const counter = { value: 0 };

  return gsap.to(counter, {
    value: target,
    duration,
    ease: 'power2.out',
    onUpdate() {
      // har frame pe rounded value innerHTML mein likhte hain
      el.innerHTML = String(Math.round(counter.value));
    },
  });
}

// ─── 4. cardHoverEffect ───────────────────────────────────────────────────────

/**
 * Adds a subtle lift effect to all matching elements on hover.
 * mouseenter → y: -4px | mouseleave → y: 0
 *
 * Returns a cleanup function — call it in your useEffect return:
 *   useEffect(() => { const cleanup = cardHoverEffect('.card'); return cleanup ?? undefined; }, [])
 *
 * @param selector - CSS selector for hoverable card elements
 * @returns Cleanup function to remove all event listeners, or null if skipped
 */
export function cardHoverEffect(selector: string): (() => void) | null {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return null;

  // reduced motion mein hover lift skip karo
  if (prefersReducedMotion()) return null;

  // handlers store karo taaki cleanup properly ho sake
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

  // cleanup function return karo — caller useEffect mein use karega
  return () => {
    handlers.forEach(({ el, enter, leave }) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    });
  };
}

// ─── 5. staggerReveal ─────────────────────────────────────────────────────────

/**
 * Staggered child reveal triggered when parent enters the viewport.
 * Children animate: y:30/opacity:0 → y:0/opacity:1 with 0.08s stagger.
 *
 * @param parent   - CSS selector for the scroll trigger container
 * @param children - CSS selector for elements to stagger in
 * @returns GSAP Timeline for chaining, or null if skipped
 */
export function staggerReveal(
  parent: string,
  children: string
): gsap.core.Timeline | null {
  const parentEl = document.querySelector<HTMLElement>(parent);
  const childEls = document.querySelectorAll<HTMLElement>(children);

  // parent ya children koi bhi missing ho toh skip
  if (!parentEl || !childEls.length) return null;

  // reduced motion — seedha final state
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

  // children ek ke baad ek 0.08s ke gap se aayenge
  tl.from(childEls, {
    y: 30,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.08,
  });

  return tl;
}
