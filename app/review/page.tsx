'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { cardHoverEffect } from '@/lib/animations';
import { type ReviewResult } from '@/lib/types';
import { RING_CIRCUMFERENCE, getScoreColor } from '@/components/ScoreRing';
import { SectionCard } from '@/components/ReviewCards';
import { ReviewBackButton } from '@/components/ReviewBackButton';
import { ReviewScoreHero } from '@/components/ReviewScoreHero';
import { ReviewKeywordsPanel } from '@/components/ReviewKeywordsPanel';

export default function ReviewPage() {
  const router = useRouter();
  const [review, setReview] = useState<ReviewResult | null>(null);

  // mount context loading from sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem('reviewResult');
    if (!data) {
      router.replace('/');
      return;
    }
    try {
      setReview(JSON.parse(data));
    } catch {
      router.replace('/');
    }
  }, [router]);

  const scoreColor = review ? getScoreColor(review.atsScore) : 'var(--accent)';

  const pageRef       = useRef<HTMLDivElement>(null);
  const backBtnRef    = useRef<HTMLButtonElement>(null);
  const scoreLabelRef = useRef<HTMLSpanElement>(null);
  const scoreNumRef   = useRef<HTMLSpanElement>(null);
  const ringRef       = useRef<SVGCircleElement>(null);
  const summaryRef    = useRef<HTMLParagraphElement>(null);
  const cardsRef      = useRef<HTMLDivElement>(null);
  const keywordsRef   = useRef<HTMLDivElement>(null);

  // GSAP Entry Reveal Timeline setup triggered after review data loads
  useEffect(() => {
    if (!review) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (pageRef.current) pageRef.current.style.opacity = '1';
      if (scoreNumRef.current) scoreNumRef.current.textContent = String(review.atsScore);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    tl.fromTo(scoreLabelRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, '+=0.05');
    tl.to(ringRef.current, { strokeDashoffset: RING_CIRCUMFERENCE * (1 - review.atsScore / 100), duration: 1.5, ease: 'power2.out' }, '<');

    const counter = { value: 0 };
    gsap.to(counter, {
      value: review.atsScore,
      duration: 1.5,
      ease: 'power2.out',
      delay: tl.duration() - 1.5,
      onUpdate() {
        if (scoreNumRef.current) scoreNumRef.current.textContent = String(Math.round(counter.value));
      },
    });

    tl.fromTo(summaryRef.current, { clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power3.out' }, '>-0.3');

    const cards = cardsRef.current?.querySelectorAll<HTMLElement>('[data-card]');
    if (cards?.length) {
      tl.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, '>-0.1');
    }
    tl.fromTo(keywordsRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, '>-0.1');

    return () => { tl.kill(); };
  }, [review]);

  // card hover spring lift trigger after review data loads
  useEffect(() => {
    if (!review) return;
    const cleanup = cardHoverEffect('[data-card]');
    return cleanup ?? undefined;
  }, [review]);

  if (!review) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
        Loading analysis result...
      </div>
    );
  }

  return (
    <div ref={pageRef} style={{ opacity: 0, minHeight: '100vh', background: 'var(--bg-primary)', padding: 'clamp(24px, 5vw, 60px) clamp(20px, 5vw, 80px)', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' }}>
      <ReviewBackButton btnRef={backBtnRef} onClick={() => router.back()} />

      <ReviewScoreHero
        review={review}
        scoreColor={scoreColor}
        scoreLabelRef={scoreLabelRef}
        scoreNumRef={scoreNumRef}
        ringRef={ringRef}
        summaryRef={summaryRef}
      />

      <div ref={cardsRef} style={{ marginBottom: 'clamp(40px, 6vw, 64px)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Section Breakdown
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', gap: '16px' }}>
          {review.sections.map((section) => (
            <SectionCard key={section.title} section={section} />
          ))}
        </div>
      </div>

      <ReviewKeywordsPanel review={review} panelRef={keywordsRef} />
    </div>
  );
}
