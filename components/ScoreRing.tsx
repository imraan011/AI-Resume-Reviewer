'use client';

// score ke basis pe color decide karo — centralized logic
export function getScoreColor(score: number): string {
  if (score <= 40) return 'var(--danger)';
  if (score <= 70) return '#f0a500';
  return 'var(--accent)';
}

// ─── Score Ring SVG ───────────────────────────────────────────────────────────

const RING_RADIUS = 70;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ScoreRingProps {
  color: string;
  ringRef: React.RefObject<SVGCircleElement | null>;
}

export function ScoreRing({ color, ringRef }: ScoreRingProps) {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* faint track ring */}
      <circle
        cx="90"
        cy="90"
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
      />
      {/* progress arc — GSAP strokeDashoffset animate karega */}
      <circle
        ref={ringRef}
        cx="90"
        cy="90"
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE}
        transform="rotate(-90 90 90)"
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      />
    </svg>
  );
}
