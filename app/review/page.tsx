'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ReviewResult } from '@/types';
import FeedbackSection from '@/components/FeedbackSection';
import KeywordChecker from '@/components/KeywordChecker';
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
  const [hasJD, setHasJD] = useState(false);

  // animation elements references
  const pageRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const scoreNumRef = useRef<HTMLSpanElement>(null);
  const jdMatchRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const keywordsRef = useRef<HTMLDivElement>(null);
  const issuesRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

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
        const parsed = JSON.parse(decodeURIComponent(decoded)) as ReviewResult;
        setReview(parsed);
        setHasJD(parsed.hasJD === true);
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
      const parsed = JSON.parse(data) as ReviewResult;
      setReview(parsed);
      setHasJD(parsed.hasJD === true);
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
      if (jdMatchRef.current) gsap.set(jdMatchRef.current, { opacity: 1 });
      if (detailsRef.current) gsap.set(detailsRef.current, { opacity: 1 });
      const cards = document.querySelectorAll('[data-card]');
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(document.body, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Page fade reveal
    tl.to(document.body, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      .to(pageRef.current, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);
    
    // Back button reveal
    tl.fromTo(backBtnRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.25');

    // Hero assessment circular meter and text reveal
    tl.fromTo(heroRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.25');

    // Overall ATS Score circle and text count animations
    if (ringRef.current && scoreNumRef.current) {
      const scoreVal = review.overallScore;
      const targetOffset = 263.89 - (263.89 * scoreVal) / 100;
      
      tl.fromTo(ringRef.current,
        { strokeDashoffset: 263.89 },
        { strokeDashoffset: targetOffset, duration: 1.2, ease: 'power2.out' },
        '-=0.4'
      );
      
      const countObj = { val: 0 };
      tl.to(countObj, {
        val: scoreVal,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (scoreNumRef.current) {
            scoreNumRef.current.innerText = Math.round(countObj.val).toString();
          }
        }
      }, '<');
    }

    // JD Match card reveal
    if (jdMatchRef.current && review.jdMatch) {
      tl.fromTo(
        jdMatchRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.4'
      );
    }

    // Detailed breakdown column reveal
    if (detailsRef.current) {
      tl.fromTo(detailsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4');
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
      className="opacity-0 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-8"
      style={{ position: 'relative', marginLeft: 'auto', marginRight: 'auto' }}
    >
      {/* ── Fixed background glows ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div className="grid-bg" style={{ position:'absolute', inset:0, opacity:0.6 }} />
        <div style={{
          position:'absolute', top:'-100px', right:'-80px',
          width:'500px', height:'500px',
          background:'radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)',
        }} />
        <div style={{
          position:'absolute', bottom:'-80px', left:'-60px',
          width:'380px', height:'380px',
          background:'radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)',
          opacity:0.4,
        }} />
      </div>

      {/* ── All content above bg ── */}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:'36px' }}>
        {/* ── 1. BACK BUTTON ── */}
        <div ref={backBtnRef} className="opacity-0 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer transition-colors"
            style={{
              background: 'none', border: 'none', padding: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ← BACK
          </button>

          {/* Mode badge — shows which mode was used */}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: hasJD ? 'var(--accent)' : 'var(--text-muted)',
            background: hasJD ? 'var(--accent-dim)' : 'transparent',
            border: hasJD ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
            borderRadius: '999px',
            padding: '3px 12px',
          }}>
            {hasJD ? '⬡ JD-Tailored Analysis' : 'General Analysis'}
          </span>
        </div>

        {/* ── 2. HERO — Score Ring + Overall Assessment ── */}
        <div
          ref={heroRef}
          className="opacity-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            paddingBottom: '32px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'24px' }}>
            {/* @media md: flex-row */}
            <style>{`@media(min-width:768px){.hero-inner{flex-direction:row!important;align-items:center!important}}`}</style>
            <div className="hero-inner" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'28px', width:'100%' }}>

              {/* Score Ring */}
              <div style={{ position:'relative', width:'150px', height:'150px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg style={{ width:'100%', height:'100%', transform:'rotate(-90deg)', filter:'drop-shadow(0 0 16px var(--accent-glow))' }} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="7" fill="transparent" />
                  <circle
                    ref={ringRef}
                    cx="50" cy="50" r="42"
                    stroke="var(--accent)"
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={263.89}
                    strokeDashoffset={263.89}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position:'absolute', display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <span ref={scoreNumRef} style={{ fontFamily:'var(--font-mono)', fontSize:'2.4rem', fontWeight:800, color:'var(--accent)', lineHeight:1, letterSpacing:'-0.03em' }}>0</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginTop:'4px' }}>ATS Score</span>
                </div>
              </div>

              {/* Assessment text */}
              <div style={{ flex:1, textAlign:'left' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,4vw,32px)', fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:'12px' }}>
                  Overall Assessment
                </h2>
                <p style={{ fontSize:'15px', color:'var(--text-secondary)', lineHeight:1.7, maxWidth:'560px' }}>
                  {review.summary}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ── 3. JD MATCH CARD ── */}
        {hasJD && review.jdMatch && (
          <div
            ref={jdMatchRef}
            style={{
              opacity: 0,
              border: '1px solid var(--accent-border)',
              borderRadius: '16px',
              background: 'var(--accent-dim)',
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ width:'3px', height:'18px', background:'var(--accent)', borderRadius:'2px', flexShrink:0 }} />
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700 }}>
                  Job Description Match
                </span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '4px 14px',
                borderRadius: '999px',
                color: review.jdMatch.score >= 80 ? '#4CAF6E' : review.jdMatch.score >= 60 ? '#FFB800' : '#DA3036',
                background: review.jdMatch.score >= 80 ? 'rgba(76,175,110,0.1)' : review.jdMatch.score >= 60 ? 'rgba(255,184,0,0.1)' : 'rgba(218,48,54,0.08)',
                border: `1px solid ${review.jdMatch.score >= 80 ? 'rgba(76,175,110,0.25)' : review.jdMatch.score >= 60 ? 'rgba(255,184,0,0.25)' : 'rgba(218,48,54,0.25)'}`,
              }}>
                {review.jdMatch.label}
              </span>
            </div>

            {/* Card body */}
            <div style={{ padding: '24px', display:'flex', flexDirection:'column', gap:'24px' }}>
              {/* Score + bar */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(40px,7vw,64px)', fontWeight:800, color:'var(--accent)', lineHeight:1, letterSpacing:'-0.04em' }}>
                    {review.jdMatch.score}
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'18px', color:'var(--text-muted)' }}>/100</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginLeft:'8px' }}>
                    fit for this role
                  </span>
                </div>
                <div style={{ height:'3px', background:'var(--border-subtle)', borderRadius:'999px', overflow:'hidden' }}>
                  <div style={{
                    height:'100%',
                    width:`${review.jdMatch.score}%`,
                    background: review.jdMatch.score >= 80 ? '#4CAF6E' : review.jdMatch.score >= 60 ? '#FFB800' : '#DA3036',
                    borderRadius:'999px',
                    transition:'width 1.2s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                </div>
              </div>

              {/* Recommendation quote */}
              <div style={{
                padding: '14px 18px',
                borderLeft: '2px solid var(--accent)',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '0 8px 8px 0',
              }}>
                <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.7, fontStyle:'italic', margin:0 }}>
                  "{review.jdMatch.recommendation}"
                </p>
              </div>

              {/* Matched + Missing skills grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'20px' }}>
                {/* Matched */}
                <div>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'#4CAF6E', marginBottom:'10px', fontWeight:700 }}>
                    ✓ Matched Skills — {review.jdMatch.matchedSkills.length}
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {review.jdMatch.matchedSkills.map((skill, i) => (
                      <span key={i} style={{
                        fontFamily:'var(--font-mono)', fontSize:'11px',
                        color:'#4CAF6E',
                        background:'rgba(76,175,110,0.08)',
                        border:'1px solid rgba(76,175,110,0.22)',
                        borderRadius:'999px', padding:'3px 10px',
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'#DA3036', marginBottom:'10px', fontWeight:700 }}>
                    ✗ Missing Skills — {review.jdMatch.missingSkills.length}
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {review.jdMatch.missingSkills.map((skill, i) => (
                      <span key={i} style={{
                        fontFamily:'var(--font-mono)', fontSize:'11px',
                        color:'#DA3036',
                        background:'rgba(218,48,54,0.06)',
                        border:'1px solid rgba(218,48,54,0.2)',
                        borderRadius:'999px', padding:'3px 10px',
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. DETAILED BREAKDOWN (Horizontal 5-column grid) ── */}
        <div ref={detailsRef} className="opacity-0 flex flex-col gap-4">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h3 style={{
              display:'flex', alignItems:'center', gap:'8px',
              fontFamily:'var(--font-mono)', fontSize:'10px',
              letterSpacing:'0.16em', textTransform:'uppercase',
              color:'var(--text-muted)',
            }}>
              <span style={{ width:'2px', height:'14px', background:'var(--accent)', borderRadius:'2px' }} />
              Detailed Breakdown
            </h3>
            {hasJD && (
              <span style={{
                fontFamily:'var(--font-mono)', fontSize:'9px',
                letterSpacing:'0.1em', textTransform:'uppercase',
                color:'var(--accent)',
                background:'var(--accent-dim)',
                border:'1px solid var(--accent-border)',
                borderRadius:'999px', padding:'2px 10px',
              }}>
                Tailored to JD
              </span>
            )}
          </div>

          <div ref={cardsRef} className="opacity-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

        {/* ── 5. TWO COLUMN GRID (Keywords + Top Issues) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Keywords */}
          <div ref={keywordsRef} className="opacity-0">
            {/* Header with JD label */}
            <h3 style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              fontFamily:'var(--font-mono)', fontSize:'10px',
              letterSpacing:'0.16em', textTransform:'uppercase',
              color:'var(--text-muted)', marginBottom:'12px',
            }}>
              <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ width:'2px', height:'14px', background:'var(--accent)', borderRadius:'2px' }} />
                {hasJD ? 'Keywords from JD' : 'Keyword Analysis'}
              </span>
              {hasJD && (
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:'9px',
                  color:'var(--accent)', letterSpacing:'0.1em',
                  textTransform:'uppercase',
                }}>
                  {review.keywords.filter(k => k.found).length}/{review.keywords.length} found
                </span>
              )}
            </h3>
            <KeywordChecker keywords={review.keywords} hasJD={hasJD} />
          </div>

          {/* Top Critical Issues */}
          <div ref={issuesRef} className="opacity-0" style={{
            background:'var(--bg-card)',
            border:'1px solid var(--border-subtle)',
            borderRadius:'12px',
            padding:'20px 22px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              display:'flex', alignItems:'center', gap:'8px',
              fontFamily:'var(--font-mono)', fontSize:'10px',
              letterSpacing:'0.16em', textTransform:'uppercase',
              color:'#DA3036', marginBottom:'16px',
            }}>
              <span style={{ width:'2px', height:'14px', background:'#DA3036', borderRadius:'2px' }} />
              {hasJD ? 'Critical Gaps for This Role' : 'Top Critical Issues'}
            </h3>
            <ul style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              {review.topIssues.map((issue, idx) => (
                <li key={idx} style={{
                  display:'flex', alignItems:'flex-start', gap:'12px',
                  padding:'10px 0',
                  borderBottom: idx < review.topIssues.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <span style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    width:'20px', height:'20px', borderRadius:'4px',
                    background:'rgba(218,48,54,0.08)',
                    border:'1px solid rgba(218,48,54,0.2)',
                    color:'#DA3036',
                    fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700,
                    flexShrink:0, marginTop:'1px',
                  }}>
                    {idx + 1}
                  </span>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.65, margin:0 }}>
                    {issue}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 6. ACTION BUTTONS ── */}
        <div ref={actionRef} className="opacity-0" style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          gap:'12px', paddingTop:'16px', flexWrap:'wrap',
          position: 'relative'
        }}>
          <button
            onClick={() => router.push('/')}
            className="magnetic-btn-analyze"
            style={{
              padding:'12px 28px',
              background:'var(--accent)',
              color:'var(--bg-primary)',
              border:'1px solid var(--accent)',
              borderRadius:'8px',
              fontFamily:'var(--font-mono)',
              fontSize:'11px',
              fontWeight:700,
              letterSpacing:'0.1em',
              textTransform:'uppercase',
              cursor:'pointer',
            }}
          >
            Review another →
          </button>
          <button
            onClick={handleShare}
            style={{
              padding:'12px 28px',
              background:'transparent',
              color:'var(--text-secondary)',
              border:'1px solid var(--border-subtle)',
              borderRadius:'8px',
              fontFamily:'var(--font-mono)',
              fontSize:'11px',
              fontWeight:700,
              letterSpacing:'0.1em',
              textTransform:'uppercase',
              cursor:'pointer',
              transition:'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            Share Results
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            style={{
              padding:'12px 28px',
              background:'transparent',
              color:'var(--text-secondary)',
              border:'1px solid var(--border-subtle)',
              borderRadius:'8px',
              fontFamily:'var(--font-mono)',
              fontSize:'11px',
              fontWeight:700,
              letterSpacing:'0.1em',
              textTransform:'uppercase',
              cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
              opacity: isGeneratingPdf ? 0.6 : 1,
              transition:'border-color 0.2s',
            }}
            onMouseEnter={e => {
              if (isGeneratingPdf) return;
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={e => {
              if (isGeneratingPdf) return;
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </button>

          {/* Floating Toast Notification */}
          {toastVisible && (
            <div style={{
              position: 'absolute',
              top: '-48px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              textAlign: 'center',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}>
              {toastMessage}
            </div>
          )}
        </div>
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
