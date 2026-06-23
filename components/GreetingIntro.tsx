'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GreetingIntroProps {
  onComplete?: () => void;
}

interface Greeting {
  text: string;
  /** agar true hai toh accent color lagega */
  accent: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'ai-resume-intro-seen';

/**
 * Greeting sequence — multilingual, played in order.
 * Last entry is "Hello" again with accent color as the final reveal beat.
 */
const GREETINGS: Greeting[] = [
  { text: 'Hello', accent: false },
  { text: 'سلام', accent: false },      // Urdu/Arabic — Salam
  { text: 'नमस्ते', accent: false },     // Hindi — Namaste
  { text: 'Hola', accent: false },      // Spanish
  { text: 'Bonjour', accent: false },   // French
  { text: 'こんにちは', accent: false }, // Japanese — Konnichiwa
  { text: '안녕하세요', accent: false }, // Korean — Annyeonghaseyo
  { text: 'Hello', accent: true },      // signature sign-off — accent color
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function GreetingIntro({ onComplete }: GreetingIntroProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // onComplete stable ref — re-render pe effect dobara nahi chalega
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // pehle session mein dekha hua hai toh intro skip karo
    if (sessionStorage.getItem(SESSION_KEY)) {
      onCompleteRef.current?.();
      return;
    }

    const overlay = overlayRef.current;
    const text = textRef.current;
    if (!overlay || !text) return;

    /**
     * Accessibility: prefers-reduced-motion respected.
     * Skip animation entirely — instantly hide overlay and continue.
     */
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      overlay.style.display = 'none';
      onCompleteRef.current?.();
      return;
    }

    /**
     * Build GSAP timeline for the full intro sequence.
     *
     * Each greeting:
     *   1. Swap text content (zero duration)
     *   2. Fade in  — opacity 0 → 1, y 20 → 0  (0.3s)
     *   3. Hold     — implicit via delay on fade-out (0.4s)
     *   4. Fade out — opacity 1 → 0, y 0 → -20  (0.3s)
     *
     * Final beat: curtain (overlay) slides up — yPercent -100 (0.8s).
     */
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        onCompleteRef.current?.();
      },
    });

    tlRef.current = tl;

    GREETINGS.forEach(({ text: word, accent }) => {
      // text swap — DOM change timeline ke andar karo
      tl.call(() => {
        text.textContent = word;
        text.style.color = accent ? 'var(--accent)' : '#ffffff';
      });

      // fade in
      tl.fromTo(
        text,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );

      // hold 0.4s → fade out
      tl.to(text, { opacity: 0, y: -20, duration: 0.3, delay: 0.4 });
    });

    // curtain upar slide — page reveal
    tl.to(overlay, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power3.inOut',
    });

    // cleanup — animation ke beech unmount ho jaye toh kill karo
    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []); // intentionally empty — runs once on mount only

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-label="Loading"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none', // scroll ya click block nahi hoga under page pe
      }}
    >
      <span
        ref={textRef}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          userSelect: 'none',
          willChange: 'opacity, transform', // GPU pe offload karo smooth animation ke liye
        }}
        aria-hidden="true"
      />
    </div>
  );
}
