'use client';

import { useState, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export interface ScoreCardProps {
  title: string;
  score: number; // 0-10 range
  issues: string[];
  suggestions: string[];
  defaultOpen?: boolean;
}

export default function ScoreCard({
  title,
  score,
  issues,
  suggestions,
  defaultOpen = false,
}: ScoreCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  // Score badge ke exact colors (Mohed design token mapping)
  const getBadgeStyle = (val: number) => {
    if (val >= 8) {
      return { 
        color: '#4CAF6E', 
        backgroundColor: 'rgba(76,175,110,0.07)', 
        borderColor: 'rgba(76,175,110,0.2)' 
      };
    }
    if (val >= 5) {
      return { 
        color: '#FFB800', 
        backgroundColor: 'rgba(255,184,0,0.07)', 
        borderColor: 'rgba(255,184,0,0.2)' 
      };
    }
    return { 
      color: '#DA3036', 
      backgroundColor: 'rgba(218,48,54,0.06)', 
      borderColor: 'rgba(218,48,54,0.18)' 
    };
  };

  const getProgressStyle = (val: number) => {
    if (val >= 8) return { backgroundColor: '#4CAF6E' };
    if (val >= 5) return { backgroundColor: '#FFB800' };
    return { backgroundColor: '#DA3036' };
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      data-card
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        overflow: 'hidden',
        height: 'fit-content',
        transition: 'border-color 0.25s var(--ease-expo)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
      onClick={toggleOpen}
    >
      {/* Card Header area */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', gap: '12px' }}>
          <h4 style={{ 
            color: 'var(--text-primary)', 
            fontWeight: 700, 
            fontSize: '14px', 
            fontFamily: 'var(--font-display)', 
            letterSpacing: '-0.01em',
            margin: 0,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {title}
          </h4>
          
          {/* Badge: border + color, background removed */}
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0,
              ...getBadgeStyle(score),
            }}
          >
            {score}/10
          </span>
        </div>

        {/* Thinner progress bar */}
        <div style={{ height: '1.5px', width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${score * 10}%`, ...getProgressStyle(score) }}
          />
        </div>

        {/* Issues vs fixes summary count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <span>
            {issues.length} {issues.length === 1 ? 'issue' : 'issues'} &bull;{' '}
            {suggestions.length} {suggestions.length === 1 ? 'fix' : 'fixes'}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'transform 0.3s' }}
            className={isOpen ? 'rotate-180' : ''}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Collapsible detailed lists */}
      <div
        ref={contentRef}
        style={{
          transition: 'all 0.3s var(--ease-expo)',
          overflow: 'hidden',
          borderTop: isOpen ? '1px solid var(--border-subtle)' : 'none',
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight || 1000}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()} // Click wrap inner area me toggle avoid karega
      >
        <div style={{ padding: '20px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Issues block - left border thin, background-tint removed */}
          {issues.length > 0 && (
            <div 
              style={{
                borderLeft: '1.5px solid var(--danger)',
                paddingLeft: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <h5 style={{ fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', margin: 0 }}>
                Issues ({issues.length})
              </h5>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
                {issues.map((issue, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '8px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      borderBottom: idx < issues.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      paddingBottom: idx < issues.length - 1 ? '10px' : '0',
                    }}
                  >
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--danger)', marginTop: '7px', flexShrink: 0 }} />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions block - left border thin, background-tint removed */}
          {suggestions.length > 0 && (
            <div 
              style={{
                borderLeft: '1.5px solid var(--accent)',
                paddingLeft: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <h5 style={{ fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', margin: 0 }}>
                Suggestions ({suggestions.length})
              </h5>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '8px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      paddingBottom: idx < suggestions.length - 1 ? '10px' : '0',
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginTop: '5px', flexShrink: 0 }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
