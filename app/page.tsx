'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import UploadZone from '@/components/UploadZone';

export default function Home() {
  // loading state, router hooks mapping
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // animations targets references
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // GSAP entry reveal animation timeline check
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, delay: 0.15 }
    );
    tl.fromTo(subtextRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6 }, 
      '-=0.5'
    );
    tl.fromTo(uploadRef.current, 
      { opacity: 0, y: 25, scale: 0.98 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.75 }, 
      '-=0.4'
    );
    
    const pills = pillsRef.current?.children;
    if (pills) {
      tl.fromTo(pills, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 
        '-=0.3'
      );
    }
  }, []);

  // file data upload sequence handler
  async function handleUpload(file: File): Promise<void> {
    setIsLoading(true);
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

      // state cache update aur redirect routing
      sessionStorage.setItem('reviewResult', JSON.stringify(result));
      router.push('/review');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic radial gradient glow backing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl text-center space-y-8 z-10">
        {/* Headings intro block */}
        <div className="space-y-4">
          <h1 
            ref={titleRef}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent opacity-0"
          >
            Get your resume reviewed by AI
          </h1>
          <p 
            ref={subtextRef}
            className="text-neutral-400 text-lg sm:text-xl font-medium opacity-0"
          >
            Upload your PDF and get instant feedback
          </p>
        </div>

        {/* glassmorphic border input wrap */}
        <div 
          ref={uploadRef}
          className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-2 backdrop-blur-md opacity-0"
        >
          <UploadZone onUpload={handleUpload} isLoading={isLoading} />
        </div>

        {/* Feature status pills block */}
        <div 
          ref={pillsRef}
          className="flex flex-wrap justify-center gap-3 pt-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-colors text-neutral-300 text-sm font-medium opacity-0">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            ATS Score
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-colors text-neutral-300 text-sm font-medium opacity-0">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            Keywords
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-colors text-neutral-300 text-sm font-medium opacity-0">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            Formatting
          </div>
        </div>
      </div>
    </main>
  );
}
