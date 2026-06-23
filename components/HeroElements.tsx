'use client';

// ─── Hero Background — grid + vignette + glow blob ───────────────────────────

export function HeroBackground() {
  return (
    <>
      {/* radial vignette — edges dark karta hai for depth */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(10,10,10,0.85) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* accent glow blob — atmospheric lime haze */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(232,255,71,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(40px)',
        }}
      />
    </>
  );
}

// ─── Stat Pills ───────────────────────────────────────────────────────────────

interface StatPill {
  label: string;
  icon: string;
}

// config — yahan se data aata hai, component mein hardcode nahi
const STAT_PILLS: StatPill[] = [
  { label: 'ATS Score',     icon: '📊' },
  { label: 'Keyword Match', icon: '🎯' },
  { label: 'AI Feedback',   icon: '🤖' },
];

interface StatPillsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function StatPills({ containerRef }: StatPillsProps) {
  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {STAT_PILLS.map(({ label, icon }) => (
        <div
          key={label}
          data-pill
          style={{
            opacity: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '14px' }}>{icon}</span>
          {label}
        </div>
      ))}
    </div>
  );
}
