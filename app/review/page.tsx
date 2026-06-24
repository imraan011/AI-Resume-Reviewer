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
  const storedJD = typeof window !== 'undefined' ? sessionStorage.getItem('jobDescription') || '' : '';
  const hasJD = Boolean(storedJD && storedJD.trim().length > 50);
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
    if (jdMatchRef.current && review.jdMatch) {
      tl.fromTo(jdMatchRef.current,
        { opacity:0, y:24 },
        { opacity:1, y:0, duration:0.7, ease:'expo.out' },
        '-=0.4'
      );
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
        width: '100%',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
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

      {/* Center content container layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1120px',
          margin: '0 auto',
          padding: 'clamp(24px, 5vw, 64px) var(--nav-side)',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >

      {/* Back button segment - Minimal text style */}
      <div ref={backBtnRef} className="opacity-0 flex justify-start items-center no-print" style={{ position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => router.push('/')}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono text-[11px] uppercase tracking-[0.12em] flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
        >
          ← BACK
        </button>
      </div>

      {/* Hero section overall ATS score - Full width, no box container */}
      <div 
        ref={heroRef} 
        className="opacity-0 flex flex-col md:flex-row md:items-center gap-8 w-full pb-10 border-b border-[var(--border-subtle)]"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* visual circular progress ring (uses new CircularScore component) */}
        <div style={{ flexShrink: 0 }}>
          <CircularScore score={review.overallScore} size={160} />
        </div>

        {/* overall summary analysis context */}
        <div className="space-y-3 text-center md:text-left flex-1">
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight leading-tight">Overall Assessment</h2>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed">{review.summary}</p>
        </div>
      </div>

      {/* Job Description Match Analysis (only if jdMatch is provided) */}
      {review.jdMatch && (
        <div ref={jdMatchRef} style={{
          opacity: 0,
          padding: '24px 28px',
          border: '1px solid var(--accent-border)',
          borderRadius: '14px',
          background: 'var(--accent-dim)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Header row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{
                width: '3px', height: '18px',
                background: 'var(--accent)',
                borderRadius: '2px', flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-label)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}>
                JD Match Score
              </span>
            </div>

            {/* Match label badge */}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: review.jdMatch.score >= 80 ? 'var(--success)'
                    : review.jdMatch.score >= 60 ? 'var(--warning)'
                    : '#DA3036',
              border: `1px solid ${
                review.jdMatch.score >= 80 ? 'rgba(76,175,110,0.3)'
                : review.jdMatch.score >= 60 ? 'rgba(255,184,0,0.3)'
                : 'rgba(218,48,54,0.3)'
              }`,
              background: review.jdMatch.score >= 80 ? 'rgba(76,175,110,0.07)'
                        : review.jdMatch.score >= 60 ? 'rgba(255,184,0,0.07)'
                        : 'rgba(218,48,54,0.06)',
              borderRadius: '999px',
              padding: '3px 12px',
            }}>
              {review.jdMatch.label}
            </span>
          </div>

          {/* Score + Progress bar */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(36px, 6vw, 52px)',
                fontWeight: 800,
                color: 'var(--accent)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}>
                {review.jdMatch.score}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                color: 'var(--text-muted)',
                fontWeight: 400,
              }}>
                /100
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              height: '3px',
              background: 'var(--border-subtle)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${review.jdMatch.score}%`,
                background: review.jdMatch.score >= 80 ? 'var(--success)'
                          : review.jdMatch.score >= 60 ? 'var(--warning)'
                          : '#DA3036',
                borderRadius: '999px',
                transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>

          {/* Recommendation */}
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            fontStyle: 'italic',
            margin: 0,
            paddingTop: '4px',
            borderTop: '1px solid var(--accent-border)',
          }}>
            "{review.jdMatch.recommendation}"
          </p>

          {/* Two columns: matched + missing */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>

            {/* Matched Skills */}
            <div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--success)',
                marginBottom: '10px',
              }}>
                ✓ Matched — {review.jdMatch.matchedSkills.length}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {review.jdMatch.matchedSkills.map((skill, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--success)',
                    background: 'rgba(76,175,110,0.08)',
                    border: '1px solid rgba(76,175,110,0.2)',
                    borderRadius: '999px',
                    padding: '3px 10px',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#DA3036',
                marginBottom: '10px',
              }}>
                ✗ Missing — {review.jdMatch.missingSkills.length}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {review.jdMatch.missingSkills.map((skill, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#DA3036',
                    background: 'rgba(218,48,54,0.06)',
                    border: '1px solid rgba(218,48,54,0.18)',
                    borderRadius: '999px',
                    padding: '3px 10px',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
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
          <KeywordChecker keywords={review.keywords} hasJD={review.hasJD} />
        </div>

        {/* critical top issues listings segment */}
        <div 
          ref={issuesRef} 
          className="opacity-0 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
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
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', listStyle: 'none', margin: 0, padding: 0 }}>
            {review.topIssues.map((issue, idx) => (
              <li key={issue} style={{ display: 'flex', alignItems: 'start', gap: '14px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: '#FF5252',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  {idx + 1}
                </span>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                  flex: 1,
                }}>
                  {issue}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* review reset trigger action with clipboard share */}
      <div 
        ref={actionRef} 
        className="opacity-0 flex items-center justify-center gap-6 pt-12 pb-6 flex-wrap no-print"
        style={{ position:'relative', zIndex:1 }}
      >
        <button
          onClick={() => router.push('/')}
          className="premium-btn magnetic-btn-analyze"
          style={{
            height: '46px',
            padding: '0 28px',
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: '1px solid var(--accent)',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.25s var(--ease-expo)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)';
            e.currentTarget.style.transform = 'translateY(-1.5px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Review another &rarr;
        </button>

        <button
          onClick={handleShare}
          className="premium-btn"
          style={{
            height: '46px',
            padding: '0 28px',
            background: 'rgba(255,255,255,0.025)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.25s var(--ease-expo)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-border)';
            e.currentTarget.style.background = 'var(--accent-dim)';
            e.currentTarget.style.transform = 'translateY(-1.5px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Share Results
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="premium-btn"
          style={{
            height: '46px',
            padding: '0 28px',
            background: 'rgba(255,255,255,0.025)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
            opacity: isGeneratingPdf ? 0.6 : 1,
            transition: 'all 0.25s var(--ease-expo)',
          }}
          onMouseEnter={e => {
            if (isGeneratingPdf) return;
            e.currentTarget.style.borderColor = 'var(--accent-border)';
            e.currentTarget.style.background = 'var(--accent-dim)';
            e.currentTarget.style.transform = 'translateY(-1.5px)';
          }}
          onMouseLeave={e => {
            if (isGeneratingPdf) return;
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
        </button>

        {/* Floating Toast Notification */}
        {toastVisible && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--accent)] text-xs font-mono px-4 py-2 rounded shadow-lg animate-fade-in duration-200 text-center max-w-[280px] sm:max-w-none">
            {toastMessage}
          </div>
        )}
      </div>
      </div> {/* Close center content container */}
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
