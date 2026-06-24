'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ReviewResult } from '@/types';
import ScoreCard from '@/components/ScoreCard';
import KeywordChecker from '@/components/KeywordChecker';
import CircularScore from '@/components/CircularScore';
import SectionScoreBar from '@/components/SectionScoreBar';
import JDMatchCard from '@/components/JDMatchCard';
import ReviewSkeleton from '@/components/ReviewSkeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cardHoverEffect } from '@/lib/animations';

function ReviewPageContent() {
  const router = useRouter();
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('Link copied!');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    
    // print window cleanup listener register kiya hai
    const handleAfterPrint = () => {
      setIsGeneratingPdf(false);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // animation elements references
  const pageRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const jdMatchRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const keywordsRef = useRef<HTMLDivElement>(null);
  const issuesRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // local session cache and URL param check
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlData = queryParams.get('data');
    
    if (urlData) {
      try {
        // Base64 decode matching unicode characters
        const decoded = window.atob(urlData).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('');
        const parsed = JSON.parse(decodeURIComponent(decoded));
        setReview(parsed);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed to parse shareable link data:', err);
      }
    }

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

    // JD Match details panel if present
    if (jdMatchRef.current) {
      tl.fromTo(jdMatchRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35');
    }

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
    if (!review) return;
    try {
      // safe UTF-8 base64 encoding
      const str = JSON.stringify(review);
      const base64 = window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${base64}`;
      navigator.clipboard.writeText(shareUrl);
      
      if (base64.length > 2000) {
        setToastMessage('Link copied! Warning: Link is long, may truncate.');
      } else {
        setToastMessage('Link copied!');
      }
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } catch (err) {
      console.error('Failed to generate shareable link:', err);
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copied!');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    }
  };

  // ReviewSkeleton component show karo jab tak data load ho raha hai
  if (loading) {
    return <ReviewSkeleton />;
  }

  if (!review) return null;

  return (
    <main ref={pageRef} className="opacity-0 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-10">
      {/* Back button segment - Minimal text style */}
      <div ref={backBtnRef} className="opacity-0 flex justify-start items-center no-print">
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

      {/* Job Description Match Analysis (only if jdMatch is provided) */}
      {review.jdMatch && (
        <div ref={jdMatchRef} className="opacity-0 w-full">
          <JDMatchCard jdMatch={review.jdMatch} />
        </div>
      )}

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
      <div ref={actionRef} className="opacity-0 flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 relative no-print">
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
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto px-8 py-3.5 border border-[var(--accent-border)] hover:bg-[var(--accent-dim)] bg-transparent active:scale-98 transition-all font-display font-bold text-[14px] uppercase tracking-[0.05em] rounded-[4px] text-white cursor-pointer flex items-center justify-center gap-2"
        >
          {isGeneratingPdf ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            'Download PDF'
          )}
        </button>

        {/* Floating Toast Notification */}
        {toastVisible && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--accent)] text-xs font-mono px-4 py-2 rounded shadow-lg animate-fade-in duration-200 text-center max-w-[280px] sm:max-w-none">
            {toastMessage}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <ErrorBoundary>
      <ReviewPageContent />
    </ErrorBoundary>
  );
}
