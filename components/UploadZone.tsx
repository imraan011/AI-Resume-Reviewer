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
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // magnetic button pull effect setup
  useGSAP(() => {
    const cleanup = magneticEffect('.magnetic-btn-analyze');
    return () => {
      cleanup?.();
    };
  }, { scope: btnRef });

  // error shake animation using useGSAP dependencies tracking
  useGSAP(() => {
    if (errorMsg && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
    }
  }, { dependencies: [errorMsg] });

  // GSAP button state changes
  const onEnter = () => {
    if (isLoading || !file) return;
    gsap.to(btnRef.current, {
      scale: 1.02,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  const onLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  const onDown = () => {
    if (isLoading || !file) return;
    gsap.to(btnRef.current, { scale: 0.98, duration: 0.1 });
  };

  const onUp = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (dropZoneRef.current) {
      gsap.to(dropZoneRef.current, {
        scale: 1.01,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    if (dropZoneRef.current) {
      gsap.to(dropZoneRef.current, {
        scale: 1,
        duration: 0.15,
        ease: 'power2.out',
      });
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg('');

    // must be PDF
    if (selectedFile.type !== 'application/pdf') {
      setErrorMsg('Invalid file type. Please upload a PDF file only.');
      setFile(null);
      return;
    }

    // size limitation (max 5MB)
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
    if (dropZoneRef.current) {
      gsap.to(dropZoneRef.current, {
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
    e.stopPropagation(); // prevent triggering parent click browse
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

  const resetFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const truncateFileName = (name: string) => {
    if (name.length <= 30) return name;
    return name.slice(0, 27) + '...';
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Outer wrapper: minimalist border and backdrop blur */}
      <div className="border border-[var(--border-subtle)] rounded-2xl p-8 bg-[rgba(255,255,255,0.015)] backdrop-blur-sm">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerBrowse}
          className={`w-full min-h-[180px] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors duration-250
            ${!file ? 'border border-dashed border-neutral-800 hover:border-neutral-700/80' : ''}
            ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-dim)]' : ''}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
            disabled={isLoading}
          />

          {!file ? (
            <div className="flex flex-col items-center gap-3">
              {/* Large indigo upload SVG icon */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-250"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div>
                <p className="text-white font-medium font-display text-[16px] tracking-tight">
                  Drop your resume here
                </p>
                <p className="text-[var(--text-muted)] text-[12px] font-mono mt-1">
                  PDF up to 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Checkmark circle indigo icon */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="space-y-1 w-full max-w-sm">
                <p className="text-white font-medium text-[15px] break-all">
                  {truncateFileName(file.name)}
                </p>
                <p className="text-[var(--text-secondary)] text-[12px] font-mono">
                  {formatFileSize(file.size)}
                </p>
                <button
                  type="button"
                  onClick={resetFile}
                  disabled={isLoading}
                  className="text-[12px] text-[var(--text-secondary)] hover:text-white underline transition-colors cursor-pointer mt-1"
                >
                  Change file
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error container with shake trigger */}
      {errorMsg && (
        <div
          ref={errorRef}
          className="text-[var(--danger)] text-sm text-center font-medium bg-[rgba(244,63,94,0.05)] border border-[rgba(244,63,94,0.1)] rounded-lg p-3"
        >
          {errorMsg}
        </div>
      )}

      {/* Action button */}
      <div className={!file || isLoading ? 'cursor-not-allowed w-full' : 'w-full'}>
        <button
          ref={btnRef}
          onClick={handleUploadClick}
          disabled={!file || isLoading}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onMouseDown={onDown}
          onMouseUp={onUp}
          className={`magnetic-btn-analyze w-full h-[56px] rounded-lg font-display font-bold text-[14px] uppercase tracking-[0.08em] transition-all duration-200 flex items-center justify-center gap-2.5
            ${
              file && !isLoading
                ? 'bg-[var(--accent)] text-white cursor-pointer hover:shadow-[0_0_24px_var(--accent-glow)]'
                : 'bg-neutral-900 text-neutral-500 pointer-events-none'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>{loadingText || 'Analyzing...'}</span>
            </div>
          ) : (
            'Analyze Resume \u2192'
          )}
        </button>
      </div>
    </div>
  );
}
