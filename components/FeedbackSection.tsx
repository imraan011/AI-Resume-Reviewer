'use client';
import { useState } from 'react';

interface FeedbackSectionProps {
  title: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

export default function FeedbackSection({ title, score, issues, suggestions }: FeedbackSectionProps) {
  const [expanded, setExpanded] = useState(true);

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
      data-card
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      {/* ── Header ── */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          cursor: 'pointer',
          userSelect: 'none',
          gap: '16px',
        }}
      >
        {/* Left: title + score label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {/* Accent bar */}
          <span style={{
            width: '3px', height: '20px',
            background: scoreInfo.color,
            borderRadius: '2px', flexShrink: 0,
          }} />
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title}
          </h3>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: scoreInfo.color,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            {scoreInfo.label}
          </span>
        </div>

        {/* Right: score badge + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: scoreInfo.color,
          }}>
            {score}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/10</span>
          </span>
          {/* Chevron */}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* ── Progress bar (always visible, below header) ── */}
      <div style={{ padding: '0 24px 0 24px' }}>
        <div style={{
          height: '2px',
          background: 'var(--border-subtle)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: expanded ? '0' : '20px',
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

      {/* ── Expandable content ── */}
      {expanded && (
        <div style={{
          padding: '20px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '16px',
        }}>

          {/* Issues block */}
          {issues.length > 0 && (
            <div>
              {/* Block header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px', height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(218,48,54,0.1)',
                  border: '1px solid rgba(218,48,54,0.25)',
                  flexShrink: 0,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#DA3036" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#DA3036',
                }}>
                  Issues Found — {issues.length}
                </span>
              </div>

              {/* Issues list */}
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {issues.map((issue, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: idx < issues.length - 1
                      ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      marginTop: '2px',
                      flexShrink: 0,
                      minWidth: '16px',
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.65,
                      margin: 0,
                    }}>
                      {issue}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider between sections */}
          {issues.length > 0 && suggestions.length > 0 && (
            <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
          )}

          {/* Suggestions block */}
          {suggestions.length > 0 && (
            <div>
              {/* Block header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px', height: '18px',
                  borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  flexShrink: 0,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}>
                  How to Improve — {suggestions.length}
                </span>
              </div>

              {/* Suggestions list */}
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {suggestions.map((suggestion, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: idx < suggestions.length - 1
                      ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      marginTop: '2px',
                      flexShrink: 0,
                      minWidth: '16px',
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.65,
                      margin: 0,
                    }}>
                      {suggestion}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty state */}
          {issues.length === 0 && suggestions.length === 0 && (
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '8px 0',
            }}>
              No issues found in this section.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
