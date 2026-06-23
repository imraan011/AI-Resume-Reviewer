'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatedDots } from './UploadZoneIcons';
import { gsap } from '@/lib/gsap';
import { magneticEffect } from '@/lib/animations';

// UploadZone props declaration
export interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export default function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  // states mapping drag selection status ke liye
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // magnetic button pull effect on mount
  useEffect(() => {
    const cleanup = magneticEffect('.magnetic-btn-analyze');
    return () => {
      cleanup?.();
    };
  }, []);

  // GSAP micro-animations for button hover states
  const onEnter = () => {
    if (isLoading || !file) return;
    gsap.to(btnRef.current, { scale: 1.02, filter: 'brightness(1.1)', duration: 0.2 });
  };

  const onLeave = () => {
    gsap.to(btnRef.current, { scale: 1, filter: 'brightness(1)', duration: 0.2 });
  };

  const onDown = () => {
    if (isLoading || !file) return;
    gsap.to(btnRef.current, { scale: 0.98, duration: 0.1 });
  };

  const onUp = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
  };

  // drag events capture methods
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // type check aur size limits validation logic
  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg('');
    
    // validation requires PDF file type only
    if (selectedFile.type !== 'application/pdf') {
      setErrorMsg('Invalid file type. Please upload a PDF file only.');
      setFile(null);
      return;
    }

    // size limitation check (max 5MB allow hai)
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

  // form trigger helper call
  const handleUploadClick = async () => {
    if (!file || isLoading) return;
    try {
      setErrorMsg('');
      await onUpload(file);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="w-full space-y-4 text-left">
      {/* Drag aur click upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 bg-neutral-900
          ${isDragging ? 'border-lime-400 bg-lime-400/5' : 'border-neutral-700 hover:border-neutral-600'}
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

        <div className="space-y-2">
          {file ? (
            <div className="text-lime-400 font-medium break-all">
              Selected: {file.name}
            </div>
          ) : (
            <>
              <p className="text-neutral-300 font-medium">
                Drag and drop your PDF resume here, or <span className="text-lime-400 underline decoration-2">browse</span>
              </p>
              <p className="text-neutral-500 text-xs">
                Supports PDF up to 5MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* error validation feedback alerts */}
      {errorMsg && (
        <div className="text-red-400 text-sm text-center font-medium bg-red-400/5 border border-red-400/10 rounded-lg p-2.5">
          {errorMsg}
        </div>
      )}

      {/* final processing button wrapper to handle not-allowed cursor */}
      <div className={!file || isLoading ? 'cursor-not-allowed w-full' : 'w-full'}>
        <button
          ref={btnRef}
          onClick={handleUploadClick}
          disabled={!file || isLoading}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onMouseDown={onDown}
          onMouseUp={onUp}
          className={`magnetic-btn-analyze w-full py-[15px] px-[24px] border-none rounded-[4px] font-display font-bold text-[14px] uppercase tracking-[0.05em] transition-all duration-200 flex items-center justify-center gap-[6px]
            ${file && !isLoading
              ? 'bg-[var(--accent)] text-black cursor-pointer'
              : 'bg-neutral-800 text-neutral-500 pointer-events-none'
            }
          `}
        >
          {isLoading ? (
            <>
              Analyzing
              <AnimatedDots />
            </>
          ) : (
            'Analyze Resume \u2192'
          )}
        </button>
      </div>
    </div>
  );
}
