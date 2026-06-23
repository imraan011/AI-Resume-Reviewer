'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ReviewResult } from '@/types';
import ScoreCard from '@/components/ScoreCard';
import KeywordChecker from '@/components/KeywordChecker';
import CircularScore from '@/components/CircularScore';
import SectionScoreBar from '@/components/SectionScoreBar';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cardHoverEffect } from '@/lib/animations';

export default function ReviewPage() {
  const router = useRouter();
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);

  // animation elements references
  const pageRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const keywordsRef = useRef<HTMLDivElement>(null);
  const issuesRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // local session cache check
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

  // GSAP animation reveals using useGSAP hook
  useGSAP(() => {
    if (!review) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([pageRef.current, backBtnRef.current, heroRef.current, cardsRef.current, keywordsRef.current, issuesRef.current, actionRef.current], { opacity: 1 });
      const cards = document.querySelectorAll('[data-card]');
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Page fade reveal
    tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    
    // Back button reveal
    tl.fromTo(backBtnRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.25');

    // Hero assessment circular meter and text reveal
    tl.fromTo(heroRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.25');

    // Score cards stagger reveal
    if (cardsRef.current) {
      tl.fromTo(cardsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.4');
      const cards = cardsRef.current.querySelectorAll('[data-card]');
      if (cards.length) {
        tl.fromTo(cards, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.35');
      }
    }

    // Keywords checker display list reveal
    if (keywordsRef.current) {
      tl.fromTo(keywordsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4');
    }

    // Top Issues list reveal
    if (issuesRef.current) {
      tl.fromTo(issuesRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.45');
    }

    // Action buttons reveal
    if (actionRef.current) {
      tl.fromTo(actionRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.2');
    }

  }, { dependencies: [review], scope: pageRef });

  // card hover spring lift effects trigger
  useGSAP(() => {
    if (!review) return;
    const cleanup = cardHoverEffect('[data-card]');
    return () => {
      cleanup?.();
    };
  }, { dependencies: [review], scope: pageRef });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  // Loading skeleton layout (theme variables compliant)
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-2 border-[var(--border-subtle)] border-t-[var(--accent)] rounded-full animate-spin" />
        <p className="text-sm font-mono tracking-wider uppercase text-neutral-500">
          Loading resume analysis...
        </p>
      </main>
    );
  }

  if (!review) return null;

  return (
    <main ref={pageRef} className="opacity-0 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-10">
      {/* Back button segment - Minimal text style */}
      <div ref={backBtnRef} className="opacity-0 flex justify-start items-center">
        <button
          onClick={() => router.push('/')}
          className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 flex items-center gap-1 cursor-pointer"
        >
          &larr; Back
        </button>
      </div>

      {/* Hero section overall ATS score - Full width, no box container */}
      <div ref={heroRef} className="opacity-0 flex flex-col md:flex-row items-center gap-8 w-full py-2">
        {/* visual circular progress ring (uses new CircularScore component) */}
        <div className="shrink-0">
          <CircularScore score={review.overallScore} size={150} />
        </div>

        {/* overall summary analysis context */}
        <div className="space-y-3 text-center md:text-left flex-1">
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">Overall Assessment</h2>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed">{review.summary}</p>
        </div>
      </div>

      {/* Horizontal rule separator */}
      <hr className="border-[var(--border-subtle)] my-2" />

      {/* Quick horizontal bars visual summary */}
      <SectionScoreBar sections={review.sections} />

      {/* 5 feedback section grid layout - 5-column grid on desktop */}
      <div ref={cardsRef} className="opacity-0 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] font-display flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[var(--accent)] rounded-full" />
          Section Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {review.sections.map((sec) => (
            <ScoreCard
              key={sec.title}
              title={sec.title}
              score={sec.score}
              issues={sec.issues}
              suggestions={sec.suggestions}
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
            <li key={issue} className="flex items-start gap-3.5 text-[var(--text-secondary)] text-sm leading-relaxed">
              <span className="flex items-center justify-center w-5.5 h-5.5 rounded bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] text-[var(--danger)] font-bold font-mono text-xs flex-shrink-0">
                {idx + 1}
              </span>
              <p className="mt-0.5">{issue}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* review reset trigger action with clipboard share */}
      <div ref={actionRef} className="opacity-0 flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 relative">
        <button
          onClick={() => router.push('/')}
          className="magnetic-btn-analyze w-full sm:w-auto px-8 py-3.5 bg-[var(--accent)] hover:brightness-110 active:scale-98 transition-all font-display font-bold text-[14px] uppercase tracking-[0.05em] rounded-[4px] text-white cursor-pointer shadow-[0_4px_20px_var(--accent-glow)]"
        >
          Review another resume &rarr;
        </button>
        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-8 py-3.5 border border-[var(--border-subtle)] hover:border-white/40 bg-transparent active:scale-98 transition-all font-display font-bold text-[14px] uppercase tracking-[0.05em] rounded-[4px] text-white cursor-pointer"
        >
          Share Results
        </button>

        {/* Floating Toast Notification */}
        {toastVisible && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--accent)] text-xs font-mono px-4 py-2 rounded shadow-lg animate-fade-in duration-200">
            Link copied!
          </div>
        )}
      </div>
    </main>
  );
}
