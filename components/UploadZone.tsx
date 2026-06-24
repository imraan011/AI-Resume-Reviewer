'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { magneticEffect } from '@/lib/animations';

export interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  loadingText?: string;
}

export default function UploadZone({ onUpload, isLoading, loadingText }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // magnetic button pull effect setup
  useGSAP(() => {
    const cleanup = magneticEffect('.magnetic-btn-analyze');
    return () => {
      cleanup?.();
    };
  }, { scope: btnRef });

  // Error appear hone par GSAP shake transition trigger karein
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      gsap.from(errorRef.current, { x: -6, duration: 0.35, ease: 'elastic.out(1,0.4)' });
    }
  }, [errorMsg]);

  // onEnter: active state me hover glow scale apply karein
  const onEnter = () => {
    if (isLoading || !file) return;
    gsap.to(btnRef.current, { scale: 1.015, boxShadow: '0 0 28px var(--accent-glow)', duration: 0.2 });
  };

  const onLeave = () => {
    gsap.to(btnRef.current, { scale: 1, boxShadow: '0 0 0px transparent', duration: 0.2 });
  };

  const onDown = () => {
    if (isLoading || !file) return;
    gsap.to(btnRef.current, { scale: 0.98, duration: 0.1 });
  };

  const onUp = () => {
    if (isLoading || !file) return;
    gsap.to(btnRef.current, { scale: 1.015, duration: 0.15 });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (dropRef.current) {
      gsap.to(dropRef.current, {
        scale: 1.01,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    if (dropRef.current) {
      gsap.to(dropRef.current, {
        scale: 1,
        duration: 0.15,
        ease: 'power2.out',
      });
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg('');

    // custom validation logic: format check (PDF only)
    if (selectedFile.type !== 'application/pdf') {
      setErrorMsg('Invalid file type. Please upload a PDF file only.');
      setFile(null);
      return;
    }

    // size limitation check (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum size is 5MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (dropRef.current) {
      gsap.to(dropRef.current, {
        scale: 1,
        duration: 0.15,
        ease: 'power2.out',
      });
    }

    if (isLoading) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const triggerBrowse = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleUploadClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // parent dropZone click event ko prevent karein
    if (!file || isLoading) return;
    try {
      setErrorMsg('');
      await onUpload(file);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden file input element */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
        disabled={isLoading}
      />

      {/* DROP ZONE (the clickable drag area) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        ref={dropRef}
        style={{
          minHeight: '168px',
          border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border-subtle)'}`,
          borderRadius: '14px',
          background: isDragging ? 'var(--accent-dim)' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.25s var(--ease-expo), background 0.25s var(--ease-expo)',
          padding: '32px 24px',
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {file ? (
          /* FILE SELECTED STATE */
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {/* Checkmark circle SVG */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-display)' }}>
              {file.name.length > 30 ? file.name.slice(0, 27) + '...' : file.name}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', fontFamily: 'var(--font-mono)' }}>
              {(file.size / 1024).toFixed(0)} KB
            </p>
            <button
              onClick={e => { e.stopPropagation(); setFile(null); setErrorMsg(''); }}
              style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}
            >
              × Remove
            </button>
          </div>
        ) : (
          /* DEFAULT STATE */
          <>
            {/* Upload SVG — uses var(--accent) */}
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-display)', textAlign: 'center' }}>
              Drop your resume here
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', textAlign: 'center' }}>
              or{' '}
              <span style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}>
                browse files
              </span>
              {' '}· PDF up to 5MB
            </p>
          </>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div ref={errorRef} style={{
          color: 'var(--danger)',
          fontSize: 'var(--font-sm)',
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(218,48,54,0.06)',
          border: '1px solid rgba(218,48,54,0.15)',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
        }}>
          {errorMsg}
        </div>
      )}

      {/* ANALYZE BUTTON */}
      <div className={!file || isLoading ? 'cursor-not-allowed w-full' : 'w-full'}>
        <button
          ref={btnRef}
          onClick={handleUploadClick}
          disabled={!file || isLoading}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onMouseDown={onDown}
          onMouseUp={onUp}
          className="magnetic-btn-analyze"
          style={{
            width: '100%',
            height: '52px',
            background: file && !isLoading ? 'var(--accent)' : 'var(--bg-hover)',
            color: file && !isLoading ? 'var(--bg-primary)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '10px',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: file && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'box-shadow 0.3s var(--ease-expo)',
          }}
        >
          {isLoading ? (
            <>
              <span className="spinner" /> Analyzing
            </>
          ) : (
            'Analyze Resume →'
          )}
        </button>
      </div>
    </div>
  );
}
