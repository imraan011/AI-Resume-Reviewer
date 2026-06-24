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
  const [greetingDone, setGreetingDone] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jdMode, setJdMode] = useState(false);
  const router = useRouter();

  const isLoading = loadingStep !== 'idle';

  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const jdRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const onGreetingDone = () => setGreetingDone(true);

  // handleUpload logic - PDF text extract aur AI review generate karega
  async function handleUpload(file: File): Promise<void> {
    setLoadingStep('extracting');
    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. PDF file se text extract karein
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
        body: JSON.stringify({ resumeText: text, jobDescription: jobDescription.trim() || undefined }),
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

      // Session cache update karein
      sessionStorage.setItem('reviewResult', JSON.stringify(result));
      sessionStorage.setItem('jobDescription', jobDescription);

      // Page exit transitions trigger karein
      await new Promise<void>(resolve => {
        gsap.to(document.body, {
          opacity: 0,
          duration: 0.28,
          ease: 'power2.in',
          onComplete: resolve,
        });
      });
      router.push('/review');
      
      // Agli page visits ke liye opacity state reset karein
      gsap.set(document.body, { opacity: 1 });
    } catch (err) {
      setLoadingStep('idle');
      throw err;
    }
  }

  // Greeting sequence khatam hone ke baad stagger list displays reveal karein
  useGSAP(() => {
    if (!greetingDone) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(labelRef.current,   { opacity:0, x:-12 }, { opacity:1, x:0, duration:0.55 })
      .fromTo(headingRef.current, { opacity:0, y:40  }, { opacity:1, y:0, duration:0.75 }, '-=0.35')
      .fromTo(subtextRef.current, { opacity:0, y:24  }, { opacity:1, y:0, duration:0.65 }, '-=0.5')
      .fromTo(uploadRef.current,  { opacity:0, y:28, scale:0.99 }, { opacity:1, y:0, scale:1, duration:0.7 }, '-=0.45')
      .fromTo(statsRef.current,   { opacity:0, y:16  }, { opacity:1, y:0, duration:0.55 }, '-=0.4')
      .fromTo(jdRef.current,      { opacity:0, y:12  }, { opacity:1, y:0, duration:0.5  }, '-=0.35');
  }, { dependencies: [greetingDone] });

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px, 5vw, 80px) var(--nav-side)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <GreetingIntro onComplete={onGreetingDone} />
      <CustomCursor />
      
      {/* Grid background display block */}
      <div className="grid-bg" style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 0,
      }} />
      
      {/* Accent radial glow — theme color se automatically match hota hai */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(700px, 90vw)',
        height: 'min(700px, 90vw)',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      
      {/* Main container wrapper block */}
      <div ref={containerRef} style={{
        width: '100%',
        maxWidth: '580px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}>
        {/* Category Label */}
        <div ref={labelRef} style={{ opacity: 0, marginBottom: '24px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-label)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>
            <span style={{
              width: '2px', height: '11px',
              background: 'var(--accent)', borderRadius: '2px',
              display: 'inline-block',
            }} />
            AI-POWERED ANALYSIS
          </span>
        </div>

        {/* Heading */}
        <h1 ref={headingRef} style={{
          opacity: 0,
          fontSize: 'var(--font-hero)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: '24px',
        }}>
          Resume that<br />gets you hired.
        </h1>

        {/* Subtext info */}
        <p ref={subtextRef} style={{
          opacity: 0,
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.75,
          maxWidth: '440px',
          margin: '0 auto',
          marginBottom: '20px',
        }}>
          Upload your PDF. Get instant ATS score, keyword gaps,
          and section-by-section feedback — powered by AI.
        </p>

        {/* Upload card block */}
        <div ref={uploadRef} style={{
          opacity: 0,
          border: '1px solid var(--border-subtle)',
          borderRadius: '18px',
          padding: '4px',
          background: 'rgba(255,255,255,0.012)',
          backdropFilter: 'blur(10px)',
          transition: 'border-color 0.3s var(--ease-expo)',
          marginBottom: '24px',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          <UploadZone onUpload={handleUpload} isLoading={isLoading} />
        </div>

        {/* JD Toggle + Input */}
        <div ref={jdRef} style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {/* Toggle row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '2px', height: '12px',
                background: jdMode ? 'var(--accent)' : 'var(--border-hover)',
                borderRadius: '2px',
                transition: 'background 0.3s',
                display: 'inline-block',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-label)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: jdMode ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.3s',
              }}>
                Tailor to Job Description
              </span>
              {jdMode && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  color: 'var(--accent)',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '999px',
                  padding: '1px 7px',
                  textTransform: 'uppercase',
                }}>
                  ACTIVE
                </span>
              )}
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setJdMode(p => !p)}
              aria-label="Toggle JD mode"
              style={{
                width: '40px', height: '22px',
                borderRadius: '999px',
                border: '1px solid var(--border-subtle)',
                background: jdMode ? 'var(--accent)' : 'var(--bg-hover)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.25s cubic-bezier(0.16,1,0.3,1)',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: jdMode ? '20px' : '3px',
                width: '14px', height: '14px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.25s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
          {/* JD Textarea — appears when toggle is ON */}
          {jdMode && (
            <div style={{
              border: '1px solid var(--accent-border)',
              borderRadius: '14px',
              background: 'var(--accent-dim)',
              overflow: 'hidden',
              animation: 'fadeSlideIn 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {/* Textarea header */}
              <div style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}>
                  Paste Job Description
                </span>
                {jobDescription.length > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                  }}>
                    {jobDescription.length} chars
                  </span>
                )}
              </div>
              {/* Textarea */}
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — the AI will extract keywords and requirements automatically..."
                rows={6}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '14px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  resize: 'none',
                  caretColor: 'var(--accent)',
                }}
              />
            </div>
          )}
        </div>

        {/* Stats segment row */}
        <div ref={statsRef} style={{
          opacity: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
        }}>
          {(jdMode
            ? [
                { val: 'ATS',  label: 'Score Check' },
                { val: 'JD',   label: 'Match Score' },
                { val: '5×',   label: 'Sections'    },
              ]
            : [
                { val: 'ATS',  label: 'Score Check'    },
                { val: '5×',   label: 'Sections'       },
                { val: 'PDF',  label: 'Instant Results' },
              ]
          ).map((s, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: 'center',
              borderRight: i < 2 ? '1px solid var(--border-subtle)' : 'none',
              padding: '0 16px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '-0.01em',
              }}>{s.val}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-label)',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
