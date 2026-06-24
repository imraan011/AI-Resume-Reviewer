'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { GREETINGS } from '@/lib/greetings';

interface GreetingIntroProps {
  /** skipped=true jab session already seen thi — caller animations skip kar sakta hai */
  onComplete?: (skipped?: boolean) => void;
}

const SESSION_KEY = 'ai-resume-intro-seen';

// Static styling objects taaki JSX clear aur compact rahe
const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: '#0a0a0a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none', // background click block nahi hoga
};

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(3rem, 8vw, 7rem)',
  fontWeight: 800,
  color: '#ffffff',
  lineHeight: 1,
  letterSpacing: '-0.02em',
  userSelect: 'none',
  willChange: 'opacity, transform', // performance optimization
};

export default function GreetingIntro({ onComplete }: GreetingIntroProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const text = textRef.current;
    if (!overlay || !text) return;

    // session or accessibility skip validation
    if (sessionStorage.getItem(SESSION_KEY) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      overlay.style.display = 'none';
      onCompleteRef.current?.(true); // skipped=true
      return;
    }

    const tl = gsap.timeline();
    tlRef.current = tl;

    // har ek greeting ko cycle kar rahe hain (ab total 5 seconds ke target ke mutabik set kiya hai)
    GREETINGS.forEach(({ text: word, accent }) => {
      tl.call(() => {
        text.textContent = word;
        text.style.color = accent ? 'var(--accent)' : '#ffffff';
      });
      tl.fromTo(text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' });
      tl.to(text, { opacity: 0, y: -20, duration: 0.15, delay: 0.1 });
    });

    // Title card ka animation phase
    tl.call(() => {
      text.innerHTML = 'AI Resume <span style="color: var(--accent)">Reviewer</span>';
    });
    tl.fromTo(text, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    tl.to(text, { delay: 0.5, duration: 0 }); // holding duration ko 5 seconds timeline ke hisab se set kiya

    // parent component ko signal karein ki intro complete ho gaya hai
    tl.call(() => {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onCompleteRef.current?.(false); // skipped=false
    });

    // curtain animation (overlay upar slide hoga aur text fade out hoga)
    tl.to(overlay, { yPercent: -100, duration: 0.65, ease: 'power3.inOut' });
    tl.to(text, { opacity: 0, y: -40, duration: 0.5, ease: 'power2.in' }, '<');

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  return (
    <div ref={overlayRef} role="status" aria-label="Loading" aria-live="polite" style={OVERLAY_STYLE}>
      <span ref={textRef} style={TEXT_STYLE} aria-hidden="true" />
    </div>
  );
}
