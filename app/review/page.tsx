'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ReviewResult } from '@/types';
import ScoreCard from '@/components/ScoreCard';
import FeedbackSection from '@/components/FeedbackSection';
import KeywordChecker from '@/components/KeywordChecker';
import { gsap } from '@/lib/gsap';
import { cardHoverEffect } from '@/lib/animations';

export default function ReviewPage() {
  const router = useRouter();
  // state hooks for loading aur analysis reviews objects
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  // animation element targets references
  const pageRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const scoreNumRef = useRef<HTMLSpanElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const keywordsRef = useRef<HTMLDivElement>(null);
  const issuesRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // local session cache read validation step
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
    } finally {
      setLoading(false);
    }
  }, [router]);

  // GSAP animation reveals triggered after review data loads
  useEffect(() => {
    if (!review) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([pageRef.current, backBtnRef.current, heroRef.current, cardsRef.current, keywordsRef.current, issuesRef.current, detailsRef.current, actionRef.current], { opacity: 1 });
      const cards = document.querySelectorAll('[data-card]');
      gsap.set(cards, { opacity: 1, y: 0 });
      if (scoreNumRef.current) scoreNumRef.current.textContent = String(review.overallScore);
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(263.89 * (1 - review.overallScore / 100));
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Page fade reveal
    tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    
    // Back button slide reveal
    tl.fromTo(backBtnRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.25');

    // Hero assessment circle and text wrapper lift
    tl.fromTo(heroRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.25');

    // Circular ring progress stroke sweep animation
    if (ringRef.current) {
      tl.fromTo(ringRef.current, 
        { strokeDashoffset: 263.89 }, 
        { strokeDashoffset: 263.89 * (1 - review.overallScore / 100), duration: 1.6, ease: 'power2.out' }, 
        '-=0.55'
      );
    }

    // Number text tick counter animation
    const counter = { value: 0 };
    tl.to(counter, {
      value: review.overallScore,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate() {
        if (scoreNumRef.current) scoreNumRef.current.textContent = String(Math.round(counter.value));
      }
    }, '-=1.6');

    // Score cards container and items stagger reveal
    if (cardsRef.current) {
      tl.fromTo(cardsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.8');
      const cards = cardsRef.current.querySelectorAll('[data-card]');
      if (cards.length) {
        tl.fromTo(cards, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.6');
      }
    }

    // Keywords checker display list
    if (keywordsRef.current) {
      tl.fromTo(keywordsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4');
    }

    // Top Issues list reveal
    if (issuesRef.current) {
      tl.fromTo(issuesRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.45');
    }

    // Detailed recommendations stagger lift
    if (detailsRef.current) {
      tl.fromTo(detailsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.45');
      const dCards = detailsRef.current.querySelectorAll('[data-card]');
      if (dCards.length) {
        tl.fromTo(dCards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1 }, '-=0.35');
      }
    }

    // Action reload buttons reveal
    if (actionRef.current) {
      tl.fromTo(actionRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.2');
    }

  }, [review]);

  // card hover spring lift effects trigger
  useEffect(() => {
    if (!review) return;
    const cleanup = cardHoverEffect('[data-card]');
    return () => {
      cleanup?.();
    };
  }, [review]);

  // Loading skeleton layout (theme variables compliant)
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--border-subtle)] border-t-[var(--accent)] rounded-full animate-spin" />
        <p className="text-sm font-mono tracking-wider uppercase text-neutral-500">
          Loading resume analysis...
        </p>
      </main>
    );
  }

  if (!review) return null;

  return (
    <main ref={pageRef} className="opacity-0 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-8">
      {/* Back button segment */}
      <div ref={backBtnRef} className="opacity-0 flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--bg-card)] hover:bg-neutral-800 border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] transition-colors flex items-center gap-2 cursor-pointer active:scale-98"
        >
          &larr; Back to Upload
        </button>
      </div>

      {/* Hero section overall ATS score */}
      <div ref={heroRef} className="opacity-0 flex flex-col md:flex-row items-center gap-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        {/* visual circular progress ring (uses --accent for electric lime glow) */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0 bg-lime-400/[0.01] rounded-full shadow-[inset_0_0_24px_rgba(232,255,71,0.01)]">
          <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_8px_rgba(232,255,71,0.08)]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
            <circle
              ref={ringRef}
              cx="50"
              cy="50"
              r="42"
              stroke="var(--accent)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={263.89}
              strokeDashoffset={263.89}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span ref={scoreNumRef} className="text-3xl font-extrabold font-mono text-[var(--accent)]">0</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] font-display">ATS Score</span>
          </div>
        </div>

        {/* overall summary analysis context */}
        <div className="space-y-3 text-center md:text-left flex-1">
          <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Overall Assessment</h2>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed">{review.summary}</p>
        </div>
      </div>

      {/* Two-column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Detailed Recommendations */}
        <div ref={detailsRef} className="opacity-0 lg:col-span-7 flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] font-display flex items-center gap-2">
            <span className="w-1 h-3.5 bg-[var(--accent)] rounded-full" />
            Detailed Recommendations
          </h3>
          <div className="flex flex-col gap-6">
            {review.sections.map((sec) => (
              <FeedbackSection
                key={sec.title}
                title={sec.title}
                score={sec.score}
                issues={sec.issues}
                suggestions={sec.suggestions}
              />
            ))}
          </div>
        </div>

        {/* Right Column: High-level metrics */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* 5 feedback section grid layout */}
          <div ref={cardsRef} className="opacity-0 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] font-display flex items-center gap-2">
              <span className="w-1 h-3.5 bg-[var(--accent)] rounded-full" />
              Section Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {review.sections.map((sec) => (
                <ScoreCard
                  key={sec.title}
                  title={sec.title}
                  score={sec.score}
                  issuesCount={sec.issues.length}
                  suggestionsCount={sec.suggestions.length}
                />
              ))}
            </div>
          </div>

          {/* matching keywords component check */}
          <div ref={keywordsRef} className="opacity-0">
            <KeywordChecker keywords={review.keywords} />
          </div>

          {/* critical top issues listings segment */}
          <div ref={issuesRef} className="opacity-0 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <span className="w-1 h-4 bg-[var(--danger)] rounded-full animate-pulse" />
              Top Critical Issues
            </h3>
            <ul className="space-y-3.5 pt-2">
              {review.topIssues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-[var(--text-secondary)] text-sm leading-relaxed">
                  <span className="flex items-center justify-center w-5.5 h-5.5 rounded bg-[rgba(255,68,68,0.08)] border border-[rgba(255,68,68,0.2)] text-[var(--danger)] font-bold font-mono text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="mt-0.5">{issue}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* review reset trigger action */}
      <div ref={actionRef} className="opacity-0 flex justify-center pt-6">
        <button
          onClick={() => router.push('/')}
          className="magnetic-btn-analyze px-8 py-3.5 bg-[var(--accent)] hover:brightness-110 active:scale-98 transition-all font-display font-bold text-[14px] uppercase tracking-[0.05em] rounded-[4px] text-black cursor-pointer shadow-[0_4px_20px_rgba(232,255,71,0.15)]"
        >
          Review another resume &rarr;
        </button>
      </div>
    </main>
  );
}
