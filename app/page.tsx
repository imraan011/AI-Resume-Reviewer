'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import UploadZone from '@/components/UploadZone';
import GreetingIntro from '@/components/GreetingIntro';
import CustomCursor from '@/components/CustomCursor';

export default function Home() {
  const [loadingStep, setLoadingStep] = useState<'idle' | 'extracting' | 'reviewing'>('idle');
  const [introFinished, setIntroFinished] = useState(false);
  const router = useRouter();

  const isLoading = loadingStep !== 'idle';

  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // handleUpload logic implementation with GSAP body exit transitions
  async function handleUpload(file: File): Promise<void> {
    setLoadingStep('extracting');
    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. file text extraction step
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });
      if (!extractRes.ok) {
        let msg = 'Failed to extract text.';
        try {
          const err = await extractRes.json();
          msg = err.error || msg;
        } catch {
          msg = `Server Error (${extractRes.status}): Failed to parse extraction response.`;
        }
        throw new Error(msg);
      }
      
      let text = '';
      try {
        const data = await extractRes.json();
        text = data.text;
      } catch {
        throw new Error('Failed to parse text extraction response.');
      }

      setLoadingStep('reviewing');

      // 2. Groq review generator call step
      const reviewRes = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });
      if (!reviewRes.ok) {
        let msg = 'Failed to generate review.';
        try {
          const err = await reviewRes.json();
          msg = err.error || msg;
        } catch {
          msg = `Server Error (${reviewRes.status}): Failed to parse review response.`;
        }
        throw new Error(msg);
      }
      
      let result;
      try {
        result = await reviewRes.json();
      } catch {
        throw new Error('Failed to parse review response.');
      }

      // session cache update
      sessionStorage.setItem('reviewResult', JSON.stringify(result));

      // Page fade transition out
      gsap.to(document.body, { 
        opacity: 0, 
        duration: 0.3, 
        ease: 'power2.in',
        onComplete: () => {
          router.push('/review');
          // Reset opacity for body context
          gsap.set(document.body, { opacity: 1 });
        }
      });
    } catch (err) {
      setLoadingStep('idle');
      throw err;
    }
  }

  // useGSAP animation reveals
  useGSAP(() => {
    if (!introFinished) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Label fades in
    tl.fromTo(
      labelRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5 }
    );

    // 2. Heading characters stagger reveal (ease-expo equivalent)
    const chars = headingRef.current?.querySelectorAll('.char');
    if (chars && chars.length) {
      tl.fromTo(
        chars,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.025,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
        '-=0.3'
      );
    }

    // 3. Subtext reveal
    tl.fromTo(
      subtextRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.5'
    );

    // 4. Upload zone reveal
    tl.fromTo(
      uploadRef.current,
      { opacity: 0, y: 20, scale: 0.99 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7 },
      '-=0.4'
    );

    // 5. Stats items stagger reveal
    const statItems = statsRef.current?.querySelectorAll('.stat-item');
    if (statItems && statItems.length) {
      tl.fromTo(
        statItems,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.4'
      );
    }
  }, { dependencies: [introFinished], scope: containerRef });

  const renderHeading = () => {
    const line1 = 'Resume that';
    const line2 = 'gets you hired.';

    return (
      <span className="block">
        <span className="block overflow-hidden pb-1">
          {line1.split('').map((char, index) => (
            <span
              key={index}
              className="char inline-block opacity-0"
              style={{ transform: 'translateY(20px)' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
        <span className="block overflow-hidden pb-1 text-white/90">
          {line2.split('').map((char, index) => (
            <span
              key={index}
              className="char inline-block opacity-0"
              style={{ transform: 'translateY(20px)' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </span>
    );
  };

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[var(--bg-primary)] text-neutral-100 flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 60px),
          repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 60px)
        `,
      }}
    >
      <CustomCursor />
      
      {/* Greeting Curtain overlay */}
      <GreetingIntro onComplete={() => setIntroFinished(true)} />

      {/* Indigo radial gradient backdrop glow (Mohed aesthetic) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(99,102,241,0.06)] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[540px] text-center space-y-10 z-10 flex flex-col items-center">
        {/* Hero typography headings */}
        <div className="space-y-5 text-left w-full">
          {/* AI label section */}
          <div
            ref={labelRef}
            className="opacity-0 flex items-center h-4 pl-3 border-l-2 border-[var(--accent)] text-[10px] font-mono tracking-[0.2em] uppercase text-[var(--accent)] font-semibold"
          >
            AI-Powered Analysis
          </div>

          <h1
            ref={headingRef}
            className="text-[var(--font-hero)] leading-[0.95] font-extrabold tracking-tight text-white select-none font-display text-left"
            style={{ fontSize: 'var(--font-hero)' }}
          >
            {renderHeading()}
          </h1>

          <p
            ref={subtextRef}
            className="opacity-0 text-[var(--text-secondary)] text-[15px] sm:text-[16px] leading-[1.7] max-w-[480px] text-left"
          >
            Upload your PDF. Get instant ATS score, keyword gaps, and
            section-by-section feedback powered by AI.
          </p>
        </div>

        {/* glassmorphic input wrapper */}
        <div
          ref={uploadRef}
          className="opacity-0 w-full"
        >
          <UploadZone 
            onUpload={handleUpload} 
            isLoading={isLoading} 
            loadingText={
              loadingStep === 'extracting' 
                ? 'Extracting text...' 
                : loadingStep === 'reviewing' 
                ? 'AI is reviewing...' 
                : undefined
            }
          />
        </div>

        {/* Feature stats row block */}
        <div
          ref={statsRef}
          className="flex items-center justify-between w-full max-w-[480px] pt-4"
        >
          <div className="stat-item opacity-0 flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[var(--accent)] font-mono text-[14px] font-bold tracking-tight mb-1">
              01
            </span>
            <span className="text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider">
              ATS Score
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-subtle)]" />

          <div className="stat-item opacity-0 flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[var(--accent)] font-mono text-[14px] font-bold tracking-tight mb-1">
              05
            </span>
            <span className="text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider">
              Sections
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-subtle)]" />

          <div className="stat-item opacity-0 flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[var(--accent)] font-mono text-[14px] font-bold tracking-tight mb-1">
              &lt; 1s
            </span>
            <span className="text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider">
              Instant
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
