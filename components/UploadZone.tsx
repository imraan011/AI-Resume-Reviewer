'use client';

import { useCallback, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { UploadZoneButton } from './UploadZoneButton';
import { UploadZoneViews } from './UploadZoneViews';

export interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

type ZoneState = 'idle' | 'dragging' | 'selected' | 'loading' | 'error';
const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export default function UploadZone({ onUpload, className }: UploadZoneProps) {
  const [state, setState]       = useState<ZoneState>('idle');
  const [file, setFile]         = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const zoneRef   = useRef<HTMLDivElement>(null);
  const dragCount = useRef(0);

  // file validation aur animation triggers
  const acceptFile = useCallback((f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      setErrorMsg('Only PDF or DOCX files are accepted.');
      setState('error');
      gsap.fromTo(zoneRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    if (f.size > MAX_BYTES) {
      setErrorMsg('File too large. Max size is 5MB.');
      setState('error');
      gsap.fromTo(zoneRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    setFile(f);
    setErrorMsg('');
    setState('selected');
    gsap.fromTo(zoneRef.current, { scale: 0.98 }, { scale: 1, duration: 0.45, ease: 'back.out(2)' });
  }, []);

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
    if (dragCount.current > 0) return;
    setState(file ? 'selected' : 'idle');
    gsap.to(zoneRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
  }

  async function handleSubmit() {
    if (!file || state === 'loading') return;
    setState('loading');
    try {
      await onUpload(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(msg);
      setState('error');
    }
  }

  function handleReset() {
    setFile(null);
    setErrorMsg('');
    setState('idle');
    gsap.fromTo(zoneRef.current, { opacity: 0.6 }, { opacity: 1, duration: 0.3 });
  }

  // styles inline definition for compact file size
  const borderColor = state === 'dragging' ? 'var(--accent)' : state === 'selected' ? 'var(--success)' : state === 'error' ? 'var(--danger)' : 'rgba(255,255,255,0.12)';
  const bgColor = state === 'dragging' ? 'rgba(232,255,71,0.04)' : state === 'selected' ? 'rgba(68,255,136,0.03)' : state === 'error' ? 'rgba(255,68,68,0.04)' : 'rgba(255,255,255,0.02)';
  const iconColor = state === 'selected' ? 'var(--success)' : state === 'error' ? 'var(--danger)' : 'var(--text-muted)';

  return (
    <div className={className} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        ref={zoneRef}
        role="region"
        aria-label="Resume upload area"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          dragCount.current = 0;
          gsap.to(zoneRef.current, { scale: 1, duration: 0.15 });
          const dropped = e.dataTransfer.files[0];
          if (dropped) acceptFile(dropped);
        }}
        onClick={() => state !== 'loading' && document.getElementById('upload-zone-input')?.click()}
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
      >
        <input
          id="upload-zone-input"
          type="file"
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          aria-label="Upload resume file"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) acceptFile(selected);
            e.target.value = '';
          }}
        />

        <UploadZoneViews
          state={state}
          file={file}
          errorMsg={errorMsg}
          iconColor={iconColor}
          onReset={handleReset}
        />
      </div>

      {(state === 'selected' || state === 'loading') && (
        <UploadZoneButton isLoading={state === 'loading'} onClick={handleSubmit} />
      )}
    </div>
  );
}
