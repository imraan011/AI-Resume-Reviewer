'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import GreetingIntro from '@/components/GreetingIntro';
import UploadZone from '@/components/UploadZone';
import { HeroBackground, StatPills } from '@/components/HeroElements';
import { HeroEyebrow, HeroTitle, HeroSubtext } from '@/components/HeroHeadings';

const ANIM = {
  eyebrow:  { delay: 0.1, duration: 0.6, y: 16 },
  h1:       { delay: 0.2, duration: 0.85 },
  subtext:  { delay: 0.4, duration: 0.6,  y: 14 },
  upload:   { delay: 0.6, duration: 0.7,  y: 20, scale: 0.97 },
  pills:    { delay: 0.8, duration: 0.5,  y: 12, stagger: 0.1 },
} as const;

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [skipAnim, setSkipAnim]           = useState(false);
  const router = useRouter();

  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const h1Ref      = useRef<HTMLHeadingElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const uploadRef  = useRef<HTMLDivElement>(null);
  const pillsRef   = useRef<HTMLDivElement>(null);

  // analysis API sequence integration
  async function handleUpload(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    // 1. PDF raw text extraction trigger
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

    // 2. Groq LLM completion trigger
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

    // sessionStorage update and route shift
    sessionStorage.setItem('reviewResult', JSON.stringify(result));
    router.push('/review');
  }

  useEffect(() => {
    if (!introComplete) return;

    if (skipAnim || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const targets = [eyebrowRef.current, h1Ref.current, subtextRef.current, uploadRef.current];
      targets.forEach((el) => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.clipPath = 'none';
      });
      if (lineRef.current) lineRef.current.style.width = '60px';
      pillsRef.current?.querySelectorAll<HTMLElement>('[data-pill]').forEach((p) => {
        p.style.opacity = '1';
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.fromTo(eyebrowRef.current, { opacity: 0, y: ANIM.eyebrow.y }, { opacity: 1, y: 0, duration: ANIM.eyebrow.duration }, ANIM.eyebrow.delay);
    tl.fromTo(h1Ref.current, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: ANIM.h1.duration, ease: 'power3.out' }, ANIM.h1.delay);
    tl.fromTo(lineRef.current, { width: 0 }, { width: 60, duration: 0.8, ease: 'power3.out' }, 0.9); // accent line sweep
    tl.fromTo(subtextRef.current, { opacity: 0, y: ANIM.subtext.y }, { opacity: 1, y: 0, duration: ANIM.subtext.duration }, ANIM.subtext.delay);
    tl.fromTo(uploadRef.current, { opacity: 0, y: ANIM.upload.y, scale: ANIM.upload.scale }, { opacity: 1, y: 0, scale: 1, duration: ANIM.upload.duration }, ANIM.upload.delay);

    const pills = pillsRef.current?.querySelectorAll<HTMLElement>('[data-pill]');
    if (pills?.length) {
      tl.fromTo(pills, { opacity: 0, y: ANIM.pills.y }, { opacity: 1, y: 0, duration: ANIM.pills.duration, stagger: ANIM.pills.stagger }, ANIM.pills.delay);
    }

    return () => { tl.kill(); };
  }, [introComplete, skipAnim]);

  return (
    <>
      <GreetingIntro
        onComplete={(skipped) => {
          setSkipAnim(skipped ?? false);
          setIntroComplete(true);
        }}
      />

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px', padding: '2rem 1.5rem' }}>
        <HeroBackground />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '760px', width: '100%', textAlign: 'center' }}>
          <HeroEyebrow elementRef={eyebrowRef} />
          <HeroTitle elementRef={h1Ref} />

          {/* animated thin accent rule */}
          <div ref={lineRef} style={{ width: 0, height: '1px', backgroundColor: 'var(--accent)', marginTop: '-0.5rem', marginBottom: '0.25rem' }} />

          <HeroSubtext elementRef={subtextRef} />

          <div ref={uploadRef} style={{ opacity: 0, width: '100%' }}>
            <UploadZone onUpload={handleUpload} />
          </div>

          <StatPills containerRef={pillsRef} />
        </div>
      </main>
    </>
  );
}
