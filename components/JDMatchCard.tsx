'use client';

import { useState, useEffect } from 'react';
import { type JdMatch } from '@/types';

interface JDMatchCardProps {
  jdMatch: JdMatch | null;
}

export default function JDMatchCard({ jdMatch }: JDMatchCardProps) {
  const [currentScore, setCurrentScore] = useState(0);

  // jab tak jdMatch component me data nahi tab tak load mat karo
  useEffect(() => {
    if (!jdMatch) return;
    
    let active = true;
    const duration = 1200; // 1.2s count transition duration
    const startTime = performance.now();

    const step = (now: number) => {
      if (!active) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo curve calculation logic for count progress
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrentScore(Math.round(easeProgress * jdMatch.score));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
    return () => {
      active = false;
    };
  }, [jdMatch]);

  if (!jdMatch) return null;

  // score percent colors check mapping
  const getScoreColor = (val: number) => {
    if (val < 40) return '#F43F5E'; // var(--danger)
    if (val <= 70) return '#F59E0B'; // amber-500
    return '#10B981'; // var(--success)
  };

  const activeColor = getScoreColor(jdMatch.score);
  const size = 80;
  const strokeWidth = 6;
  const halfSize = size / 2;
  const radius = halfSize - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - currentScore / 100);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)] text-left w-full">
      {/* Header section card matching theme */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
        <span className="w-1 h-4.5 bg-[var(--accent)] rounded-full" />
        <h3 className="text-lg font-bold font-display text-white tracking-tight">
          Job Match Analysis
        </h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Match Percentage indicator - circular style (80px) */}
        <div className="relative flex items-center justify-center rounded-full shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={halfSize}
              cy={halfSize}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={halfSize}
              cy={halfSize}
              r={radius}
              fill="transparent"
              stroke={activeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 4px ${activeColor}30)`,
                transition: 'stroke 0.3s ease',
              }}
            />
          </svg>

          {/* centered text progress percent */}
          <div className="absolute flex flex-col items-center justify-center font-mono">
            <span className="text-lg font-extrabold" style={{ color: activeColor }}>
              {currentScore}%
            </span>
            <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-semibold -mt-0.5">
              Match
            </span>
          </div>
        </div>

        {/* Matched vs Missing core columns container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 w-full">
          {/* Matched skills list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Matched Skills
            </h4>
            {jdMatch.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {jdMatch.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic font-sans">No matching core skills identified.</p>
            )}
          </div>

          {/* Missing skills list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--danger)] flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
              Missing Skills
            </h4>
            {jdMatch.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {jdMatch.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded bg-[rgba(244,63,94,0.04)] border border-[rgba(244,63,94,0.15)] text-[var(--danger)] font-medium font-sans"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-500 font-mono font-medium">All core requirements met!</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation feedback detail panel */}
      <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-subtle)] rounded-lg p-4 flex gap-3.5 items-start">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block">
            Target Alignment Strategy
          </span>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
            {jdMatch.recommendation}
          </p>
        </div>
      </div>

      {/* Action CTA for missing skills */}
      {jdMatch.missingSkills.length > 0 && (
        <div className="mt-2 bg-[rgba(99,102,241,0.03)] border border-[var(--accent-border)] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Add these skills to your resume
            </h5>
            <p className="text-[11px] text-[var(--text-secondary)] font-sans">
              Integrate missing skills inside project bullet accomplishments to increase ATS parsing alignment.
            </p>
          </div>
          
          <div className="shrink-0 flex gap-1 items-center bg-[var(--accent)] text-white text-[10px] font-bold font-mono tracking-wider uppercase px-3 py-1.5 rounded transition-all duration-200 select-none cursor-default">
            Skills gap list
          </div>
        </div>
      )}
    </div>
  );
}
