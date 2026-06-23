'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import GreetingIntro from '@/components/GreetingIntro';
import UploadZone from '@/components/UploadZone';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatPill {
  label: string;
  icon: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_PILLS: StatPill[] = [
  { label: 'ATS Score',      icon: '📊' },
  { label: 'Keyword Match',  icon: '🎯' },
  { label: 'AI Feedback',    icon: '🤖' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  // intro khatam hone ke baad page animations trigger honge
  const [introComplete, setIntroComplete] = useState(false);

  // refs — GSAP inhe directly animate karega
  const eyebrowRef  = useRef<HTMLSpanElement>(null);
  const h1Ref       = useRef<HTMLHeadingElement>(null);
  const subtextRef  = useRef<HTMLParagraphElement>(null);
  const uploadRef   = useRef<HTMLDivElement>(null);
  const pillsRef    = useRef<HTMLDivElement>(null);

  // file upload handler — baad mein AI API call yahan jayegi
  async function handleUpload(file: File): Promise<void> {
    // TODO: integrate AI review API
    console.log('Uploading:', file.name);
    await new Promise((r) => setTimeout(r, 2000)); // demo delay
  }

  // ─── Mount animations — intro ke baad trigger ──────────────────────────────

  useEffect(() => {
    if (!introComplete) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // reduced motion mein seedha sab dikhao
    if (prefersReducedMotion) {
      [eyebrowRef, h1Ref, subtextRef, uploadRef].forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'none';
        }
      });
      if (pillsRef.current) {
        const pills = pillsRef.current.querySelectorAll<HTMLElement>('[data-pill]');
        pills.forEach((p) => { p.style.opacity = '1'; p.style.transform = 'none'; });
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // 1. Eyebrow — fadeUp
    tl.fromTo(
      eyebrowRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.1  // delay
    );

    // 2. H1 — clip-path line reveal (left → right curtain)
    tl.fromTo(
      h1Ref.current,
      { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.85, ease: 'power3.out' },
      0.2
    );

    // 3. Subtext — fadeUp
    tl.fromTo(
      subtextRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.4
    );

    // 4. Upload zone — fadeUp + subtle scale
    tl.fromTo(
      uploadRef.current,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7 },
      0.6
    );

    // 5. Pills — stagger fadeUp
    if (pillsRef.current) {
      const pills = pillsRef.current.querySelectorAll<HTMLElement>('[data-pill]');
      tl.fromTo(
        pills,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        0.8
      );
    }

    return () => { tl.kill(); };
  }, [introComplete]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Multilingual greeting curtain */}
      <GreetingIntro onComplete={() => setIntroComplete(true)} />

      {/* ── Main page — invisible until intro done ── */}
      <main
        style={{
          opacity: introComplete ? 1 : 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          // CSS-only grid background — very subtle
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          padding: '2rem 1.5rem',
        }}
      >
        {/* Radial vignette — depth add karta hai */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(10,10,10,0.85) 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Accent glow blob — background atmosphere */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(232,255,71,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(40px)',
          }}
        />

        {/* ── Content stack ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            maxWidth: '760px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Eyebrow label */}
          <span
            ref={eyebrowRef}
            style={{
              opacity: 0,
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              padding: '5px 14px',
              border: '1px solid var(--accent-border)',
              borderRadius: '999px',
              background: 'var(--accent-dim)',
            }}
          >
            AI-Powered
          </span>

          {/* H1 — clip-path reveal needs overflow hidden */}
          <div style={{ overflow: 'hidden', lineHeight: 1 }}>
            <h1
              ref={h1Ref}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.8rem, 8vw, 72px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                // clipPath starts set inline; GSAP animates it
              }}
            >
              Resume{' '}
              <span style={{ color: 'var(--accent)' }}>Reviewer</span>
            </h1>
          </div>

          {/* Subtext */}
          <p
            ref={subtextRef}
            style={{
              opacity: 0,
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: 'var(--text-secondary)',
              maxWidth: '440px',
              lineHeight: 1.65,
              letterSpacing: '0.01em',
            }}
          >
            Drop your PDF. Get brutal honesty.
          </p>

          {/* ── Upload Zone — real component ── */}
          <div ref={uploadRef} style={{ opacity: 0, width: '100%' }}>
            <UploadZone onUpload={handleUpload} />
          </div>

          {/* ── Stat Pills ── */}
          <div
            ref={pillsRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            {STAT_PILLS.map(({ label, icon }) => (
              <div
                key={label}
                data-pill
                style={{
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '14px' }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
