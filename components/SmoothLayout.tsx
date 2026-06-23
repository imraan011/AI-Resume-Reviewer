'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from '@/lib/gsap';

interface SmoothLayoutProps {
  children: React.ReactNode;
}

export default function SmoothLayout({ children }: SmoothLayoutProps) {
  // lenis instance ko ref mein rakhte hain — re-render se bachane ke liye
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    /**
     * Respect prefers-reduced-motion accessibility setting.
     * If user has requested reduced motion, skip smooth scroll entirely.
     */
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // Lenis initialize karo smooth scroll ke liye
    const lenis = new Lenis({
      duration: 1.2,
      // Custom easing — exponential deceleration curve (buttery smooth feel)
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    /**
     * GSAP ticker se Lenis ka RAF connect kar rahe hain.
     * Isse alag RAF loop nahi banata — GSAP ka existing loop use hota hai.
     * time * 1000 kyunki GSAP seconds mein deta hai, Lenis milliseconds chahta hai.
     */
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);

    // GSAP ka lag smoothing band karo — Lenis khud handle karta hai
    gsap.ticker.lagSmoothing(0);

    // unmount pe sab kuch saaf karo
    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <div className="smooth-layout">{children}</div>;
}
