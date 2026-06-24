'use client';

import { useState } from 'react';

interface FeedbackSectionProps {
  title: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

export default function FeedbackSection({ title, score, issues, suggestions }: FeedbackSectionProps) {
  const [hovered, setHovered] = useState(false);

  const getScoreLabel = (s: number) => {
    if (s >= 9) return { label: 'EXCELLENT', color: 'var(--success)' };
    if (s >= 7) return { label: 'GOOD',      color: 'var(--success)' };
    if (s >= 5) return { label: 'AVERAGE',   color: 'var(--warning)' };
    if (s >= 3) return { label: 'WEAK',      color: 'var(--danger)'  };
    return           { label: 'CRITICAL',  color: 'var(--danger)'  };
  };

  const scoreInfo = getScoreLabel(score);
  const progressPct = (score / 10) * 100;

  return (
    <div 
      style={{ position: 'relative', height: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Inner Card (shine, border, etc.) */}
      <div
        data-card
        className="premium-card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          height: '100%',
          userSelect: 'none',
        }}
      >
        {/* Title and score label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{
              width: '3px',
              height: '14px',
              background: scoreInfo.color,
              borderRadius: '2px',
              flexShrink: 0,
            }} />
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {title}
            </h4>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: scoreInfo.color,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            {scoreInfo.label}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{
            height: '2px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: scoreInfo.color,
              borderRadius: '999px',
              transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
        </div>

        {/* Score number and summary counts */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {issues.length} {issues.length === 1 ? 'issue' : 'issues'} &bull;{' '}
            {suggestions.length} {suggestions.length === 1 ? 'fix' : 'fixes'}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: scoreInfo.color,
          }}>
            {score}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/10</span>
          </span>
        </div>
      </div>

      {/* Hover Popover Tooltip (Only renders when hovered and there's content) */}
      {hovered && (issues.length > 0 || suggestions.length > 0) && (
        <div 
          className="no-scrollbar"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 14px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-hover)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5), 0 0 16px var(--accent-glow)',
            borderRadius: '8px',
            padding: '16px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none',
          }}
        >
          {/* Issues block */}
          {issues.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Issues ({issues.length})
                </span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {issues.map((issue, idx) => (
                  <li key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          {issues.length > 0 && suggestions.length > 0 && (
            <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
          )}

          {/* Suggestions block */}
          {suggestions.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Suggestions ({suggestions.length})
                </span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {suggestions.map((sug, idx) => (
                  <li key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    • {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tooltip triangle arrow */}
          <div 
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '12px',
              height: '12px',
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-hover)',
              borderBottom: '1px solid var(--border-hover)',
              zIndex: 998,
            }}
          />
        </div>
      )}
    </div>
  );
}
