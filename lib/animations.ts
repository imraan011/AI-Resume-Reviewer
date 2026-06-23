/**
 * lib/animations.ts
 *
 * Unified entrypoint for GSAP animations.
 * Re-exports components from sub-modules to preserve compatibility.
 */

export { fadeUpReveal, lineReveal, staggerReveal } from './animations/reveals';
export { counterAnimate, cardHoverEffect, magneticEffect } from './animations/effects';
