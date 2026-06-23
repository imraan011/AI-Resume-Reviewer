/**
 * Centralized GSAP setup file.
 * All plugins are registered here once.
 * Import gsap from this file — never directly from 'gsap' package.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ScrollTrigger ek baar register karo — yahi se export hoga poore app mein
gsap.registerPlugin(ScrollTrigger);

/**
 * Call this once at app root to ensure all plugins are initialized.
 * Safe to call multiple times — GSAP handles deduplication internally.
 */
export function initGSAP(): void {
  // ScrollTrigger pehle se registered hai, yeh function future plugins ke liye extensible hai
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
