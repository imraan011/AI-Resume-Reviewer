'use client';

import { useState } from 'react';
import GreetingIntro from '@/components/GreetingIntro';

export default function Home() {
  // intro khatam hone ke baad page content dikhao
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <GreetingIntro onComplete={() => setIntroComplete(true)} />

      {/* page content intro ke saath parallel render hota hai — curtain utha toh dikhe */}
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: introComplete ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
          }}
        >
          AI Resume Reviewer
        </h1>
      </main>
    </>
  );
}
