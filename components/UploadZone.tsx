'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadZoneProps {
  /** Called when the user confirms and hits "Analyze Resume" */
  onUpload: (file: File) => Promise<void>;
  /** Optional outer className for positioning */
  className?: string;
}

type ZoneState = 'idle' | 'dragging' | 'selected' | 'loading' | 'error';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** file extension se human-readable type */
function getFileLabel(file: File): string {
  return file.name.endsWith('.pdf') ? 'PDF' : 'DOCX';
}

/** bytes ko readable string mein convert */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Animated Dots — "Analyzing..." loading state ─────────────────────────────

function AnimatedDots() {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: '3px', marginLeft: '2px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#000',
            animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

// ─── Upload Icon — stroke only SVG ────────────────────────────────────────────

function UploadIcon({ color }: { color: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ─── File Icon SVG ────────────────────────────────────────────────────────────

function FileIcon({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function UploadZone({ onUpload, className }: UploadZoneProps) {
  const [state, setState]       = useState<ZoneState>('idle');
  const [file, setFile]         = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const zoneRef   = useRef<HTMLDivElement>(null);
  const btnRef    = useRef<HTMLButtonElement>(null);
  const dragCount = useRef(0); // nested drag events handle karne ke liye

  // ─── File validation ─────────────────────────────────────────────────────

  function validateFile(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type)) return 'Only PDF or DOCX files are accepted.';
    if (f.size > MAX_SIZE_BYTES) return `File too large. Max size is 5MB (yours: ${formatBytes(f.size)}).`;
    return null;
  }

  // ─── Accept a validated file ──────────────────────────────────────────────

  const acceptFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) {
      setErrorMsg(err);
      setState('error');
      // error zone ko shake karo
      gsap.fromTo(
        zoneRef.current,
        { x: -6 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
      return;
    }
    setFile(f);
    setErrorMsg('');
    setState('selected');
    // file selected bounce
    gsap.fromTo(
      zoneRef.current,
      { scale: 0.98 },
      { scale: 1, duration: 0.45, ease: 'back.out(2)' }
    );
  }, []);

  // ─── Drag handlers ────────────────────────────────────────────────────────

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCount.current += 1;
    if (state === 'loading') return;
    setState('dragging');
    gsap.to(zoneRef.current, { scale: 1.01, duration: 0.2, ease: 'power2.out' });
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCount.current -= 1;
    if (dragCount.current > 0) return; // still inside child
    setState(file ? 'selected' : 'idle');
    gsap.to(zoneRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); // drop allow karo
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCount.current = 0;
    gsap.to(zoneRef.current, { scale: 1, duration: 0.15 });
    const dropped = e.dataTransfer.files[0];
    if (dropped) acceptFile(dropped);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) acceptFile(selected);
    // input reset karo taaki same file dobara select ho sake
    e.target.value = '';
  }

  // ─── Upload button hover/active ───────────────────────────────────────────

  function onBtnEnter() {
    if (state === 'loading') return;
    gsap.to(btnRef.current, { scale: 1.02, filter: 'brightness(1.1)', duration: 0.2 });
  }

  function onBtnLeave() {
    gsap.to(btnRef.current, { scale: 1, filter: 'brightness(1)', duration: 0.2 });
  }

  function onBtnDown() {
    gsap.to(btnRef.current, { scale: 0.98, duration: 0.1 });
  }

  function onBtnUp() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!file || state === 'loading') return;
    setState('loading');
    try {
      await onUpload(file);
      // success — caller handles next step
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setState('error');
    }
  }

  // ─── Reset to idle ────────────────────────────────────────────────────────

  function handleReset() {
    setFile(null);
    setErrorMsg('');
    setState('idle');
    gsap.fromTo(zoneRef.current, { opacity: 0.6 }, { opacity: 1, duration: 0.3 });
  }

  // ─── Derived styles ───────────────────────────────────────────────────────

  const borderColor =
    state === 'dragging' ? 'var(--accent)'
    : state === 'selected' ? 'var(--success)'
    : state === 'error'   ? 'var(--danger)'
    : 'rgba(255,255,255,0.12)';

  const bgColor =
    state === 'dragging' ? 'rgba(232,255,71,0.04)'
    : state === 'selected' ? 'rgba(68,255,136,0.03)'
    : state === 'error'   ? 'rgba(255,68,68,0.04)'
    : 'rgba(255,255,255,0.02)';

  const iconColor =
    state === 'selected' ? 'var(--success)'
    : state === 'error'  ? 'var(--danger)'
    : 'var(--text-muted)';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* keyframe for AnimatedDots — only injected once */}
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <div
        className={className}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        {/* ── Drop Zone ── */}
        <div
          ref={zoneRef}
          role="region"
          aria-label="Resume upload area"
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          style={{
            width: '100%',
            minHeight: '192px',
            border: `1px dashed ${borderColor}`,
            borderRadius: '20px',
            background: bgColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '2.5rem',
            transition: 'border-color 0.25s ease, background 0.25s ease',
            cursor: state === 'loading' ? 'default' : 'pointer',
            position: 'relative',
          }}
          onClick={() => {
            if (state === 'loading') return;
            document.getElementById('upload-zone-input')?.click();
          }}
        >
          {/* Hidden file input */}
          <input
            id="upload-zone-input"
            type="file"
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            onChange={onInputChange}
            aria-label="Upload resume file"
          />

          {/* ── Idle / Dragging state ── */}
          {(state === 'idle' || state === 'dragging') && (
            <>
              <UploadIcon color={iconColor} />
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: '16px',
                    color: state === 'dragging' ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {state === 'dragging' ? 'Release to upload' : 'Drop your resume here'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  PDF up to 5MB&nbsp;&nbsp;·&nbsp;&nbsp;
                  <span
                    style={{
                      color: 'var(--accent)',
                      textDecoration: 'underline',
                      textDecorationColor: 'rgba(232,255,71,0.4)',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('upload-zone-input')?.click();
                    }}
                  >
                    or browse files
                  </span>
                </span>
              </div>
            </>
          )}

          {/* ── File selected state ── */}
          {state === 'selected' && file && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(68,255,136,0.08)',
                  border: '1px solid rgba(68,255,136,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileIcon color="var(--success)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {getFileLabel(file)} · {formatBytes(file.size)}
                </p>
              </div>
              {/* change file link */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '2px 0',
                }}
              >
                Remove &amp; choose another
              </button>
            </div>
          )}

          {/* ── Loading state (inside zone) ── */}
          {state === 'loading' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Hold tight, AI is reading your resume…
              </span>
            </div>
          )}

          {/* ── Error state (inside zone) ── */}
          {state === 'error' && (
            <>
              <UploadIcon color="var(--danger)" />
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 500 }}>
                  {errorMsg}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--accent)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                >
                  Try again
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── Analyze Button — only when file is selected or loading ── */}
        {(state === 'selected' || state === 'loading') && (
          <button
            ref={btnRef}
            type="button"
            disabled={state === 'loading'}
            onClick={handleSubmit}
            onMouseEnter={onBtnEnter}
            onMouseLeave={onBtnLeave}
            onMouseDown={onBtnDown}
            onMouseUp={onBtnUp}
            aria-busy={state === 'loading'}
            aria-label={state === 'loading' ? 'Analyzing resume' : 'Analyze resume'}
            style={{
              width: '100%',
              padding: '15px 24px',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: state === 'loading' ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {state === 'loading' ? (
              <>
                Analyzing
                <AnimatedDots />
              </>
            ) : (
              'Analyze Resume →'
            )}
          </button>
        )}
      </div>
    </>
  );
}
