'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';

export default function Home() {
  // loading state aur router transition hooks mapping
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Get your resume reviewed by AI
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl font-medium">
            Upload your PDF and get instant feedback
          </p>
        </div>

        {/* glassmorphic border input wrap */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-2 backdrop-blur-md">
          <UploadZone onUpload={handleUpload} isLoading={isLoading} />
        </div>

        {/* Feature status pills block */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-colors text-neutral-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-lime-400" />
            ATS Score
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-colors text-neutral-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-lime-400" />
            Keywords
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-colors text-neutral-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-lime-400" />
            Formatting
          </div>
        </div>
      </div>
    </main>
  );
}
