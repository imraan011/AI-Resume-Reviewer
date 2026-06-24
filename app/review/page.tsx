'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ReviewResult } from '@/types';
import FeedbackSection from '@/components/FeedbackSection';
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

    gsap.set(document.body, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Page fade reveal
    tl.to(document.body, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    
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
      const cards = cardsRef.current.querySelectorAll('[data-card]');
      if (cards.length) {
        gsap.set(cards, { opacity: 0 });
        tl.fromTo(cardsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.4');
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
    <main 
      ref={pageRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        width: '100%',
        maxWidth: '1120px',
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 80px) var(--nav-side)',
        display: 'flex',
        flexDirection: 'column',
        gap: '48px',
      }}
    >
      {/* Background elements */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        {/* Grid */}
        <div className="grid-bg" style={{ position:'absolute', inset:0 }} />
        {/* Radial glow — top right for review page (different from home) */}
        <div style={{
          position: 'absolute',
          top: '-100px', right: '-100px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)',
        }} />
        {/* Secondary glow — bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '-80px', left: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)',
          opacity: 0.5,
        }} />
      </div>

      {/* Back button segment - Minimal text style */}
      <div ref={backBtnRef} className="opacity-0 flex justify-start items-center no-print" style={{ position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-label)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← BACK
        </button>
      </div>

      {/* Hero section overall ATS score - Full width, no box container */}
      <div 
        ref={heroRef} 
        className="opacity-0 flex flex-col md:flex-row md:items-center gap-[24px] md:gap-[48px] w-full"
        style={{ paddingBottom: '40px', borderBottom: '1px solid var(--border-subtle)', position: 'relative', zIndex: 1 }}
      >
        {/* visual circular progress ring (uses new CircularScore component) */}
        <div style={{ flexShrink: 0 }}>
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
        <div ref={jdMatchRef} className="opacity-0 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <JDMatchCard jdMatch={review.jdMatch} />
        </div>
      )}

      {/* Horizontal rule separator */}
      <hr className="border-[var(--border-subtle)] my-2" style={{ position: 'relative', zIndex: 1 }} />

      {/* Quick horizontal bars visual summary */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SectionScoreBar sections={review.sections} />
      </div>

      {/* 5 feedback section grid layout - 5-column grid on desktop */}
      <div ref={cardsRef} className="opacity-0 space-y-4" style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: 'var(--font-label)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          <span style={{ width: '2px', height: '14px', background: 'var(--accent)', borderRadius: '2px', flexShrink: 0 }} />
          Section Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Two-column grid alignment fix */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '40px',
          alignItems: 'start',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* matching keywords component check */}
        <div ref={keywordsRef} className="opacity-0">
          <KeywordChecker keywords={review.keywords} />
        </div>

        {/* critical top issues listings segment */}
        <div ref={issuesRef} className="opacity-0 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: 'var(--font-label)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            <span style={{ width: '2px', height: '14px', background: 'var(--danger)', borderRadius: '2px', flexShrink: 0 }} />
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
      </div>

      {/* review reset trigger action with clipboard share */}
      <div 
        ref={actionRef} 
        className="opacity-0 no-print"
        style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', paddingTop: '24px', position: 'relative', zIndex: 1 }}
      >
        <button
          onClick={() => router.push('/')}
          className="magnetic-btn-analyze"
          style={{
            height: '44px',
            padding: '0 24px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--bg-primary)',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, transform 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => gsap.to(e.currentTarget, { boxShadow: '0 0 16px var(--accent-glow)', scale: 1.015, duration: 0.2 })}
          onMouseLeave={e => gsap.to(e.currentTarget, { boxShadow: 'none', scale: 1, duration: 0.2 })}
        >
          Review another resume →
        </button>
        
        <button
          onClick={handleShare}
          style={{
            height: '44px',
            padding: '0 24px',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          Share Results
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          style={{
            height: '44px',
            padding: '0 24px',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            if (!isGeneratingPdf) {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {isGeneratingPdf ? (
            <>
              <span className="spinner" />
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
