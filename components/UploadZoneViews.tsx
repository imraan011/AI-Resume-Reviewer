'use client';

import React from 'react';
import { UploadIcon, FileIcon } from './UploadZoneIcons';

type ZoneState = 'idle' | 'dragging' | 'selected' | 'loading' | 'error';

interface UploadZoneViewsProps {
  state: ZoneState;
  file: File | null;
  errorMsg: string;
  iconColor: string;
  onReset: () => void;
}

export function UploadZoneViews({ state, file, errorMsg, iconColor, onReset }: UploadZoneViewsProps) {
  // idle / dragging paths
  if (state === 'idle' || state === 'dragging') {
    return (
      <>
        <UploadIcon color={iconColor} />
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '16px', color: state === 'dragging' ? 'var(--accent)' : 'var(--text-secondary)', transition: 'color 0.2s ease' }}>
            {state === 'dragging' ? 'Release to upload' : 'Drop your resume here'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            PDF up to 5MB&nbsp;&nbsp;·&nbsp;&nbsp;
            <span
              style={{ color: 'var(--accent)', textDecoration: 'underline', textDecorationColor: 'rgba(232,255,71,0.4)', cursor: 'pointer' }}
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
    );
  }

  // selected file path
  if (state === 'selected' && file) {
    const fileLabel = file.name.endsWith('.pdf') ? 'PDF' : 'DOCX';
    const sizeStr = file.size < 1024 ? `${file.size} B`
      : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(68,255,136,0.08)', border: '1px solid rgba(68,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileIcon color="var(--success)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {fileLabel} · {sizeStr}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', padding: '2px 0' }}
        >
          Remove &amp; choose another
        </button>
      </div>
    );
  }

  // reading file path
  if (state === 'loading') {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Hold tight, AI is reading your resume…
        </span>
      </div>
    );
  }

  // error path
  if (state === 'error') {
    return (
      <>
        <UploadIcon color="var(--danger)" />
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 500 }}>
            {errorMsg}
          </span>
          <span
            style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); onReset(); }}
          >
            Try again
          </span>
        </div>
      </>
    );
  }

  return null;
}
