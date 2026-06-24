'use client';

import { useState, useEffect } from 'react';

interface CircularScoreProps {
  score: number; // 0-100 range
  size?: number; // default size: 160
}

export default function CircularScore({ score, size = 160 }: CircularScoreProps) {
  const [currentScore, setCurrentScore] = useState(0);

  // requestAnimationFrame based smooth count up transition
  useEffect(() => {
    let active = true;
    const duration = 1400; // 1.4s duration to feel premium
    const startTime = performance.now();

    const step = (now: number) => {
      if (!active) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo easing curve numeric representation
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCurrentScore(Math.round(easeProgress * score));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);

    return () => {
      active = false;
    };
  }, [score]);

  // Color logic mapping
  const getColor = (val: number) => {
    if (val < 40) return '#F43F5E'; // var(--danger) equivalent hex
    if (val <= 70) return '#F59E0B'; // amber-500 equivalent hex
    return '#10B981'; // var(--success) equivalent hex
  };

  const activeColor = getColor(score);

  // SVG dimensions
  const fixedSize = 160;
  const strokeWidth = 10;
  const halfSize = fixedSize / 2;
  const radius = halfSize - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - currentScore / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG score circle wrapper */}
      <div 
        className="relative flex items-center justify-center rounded-full"
        style={{ width: '160px', height: '160px', flexShrink: 0 }}
      >
        <svg 
          width="160" 
          height="160" 
          className="-rotate-90"
        >
          {/* Faint track background circle */}
          <circle
            cx={halfSize}
            cy={halfSize}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={strokeWidth}
          />
          {/* Animated active progress circle */}
          <circle
            cx={halfSize}
            cy={halfSize}
            r={radius}
            fill="transparent"
            stroke="var(--accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 16px var(--accent-glow))`,
              transition: 'stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Text overlays in the center */}
        <div className="absolute flex flex-col items-center justify-center">
          <span 
            className="text-4xl font-extrabold font-mono transition-colors duration-300"
            style={{ color: 'var(--accent)', fontSize: '2.8rem' }}
          >
            {currentScore}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Label section below circular meter */}
      <span className="text-[11px] uppercase font-bold tracking-widest text-[var(--text-secondary)] font-mono">
        Overall Score
      </span>
    </div>
  );
}
