'use client';

export default function ReviewSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-10 animate-pulse text-left">
      {/* back button placeholder */}
      <div className="h-4 w-12 bg-neutral-800 rounded" />

      {/* Hero overall score + assessment block */}
      <div className="flex flex-col md:flex-row items-center gap-8 w-full py-2">
        {/* overall score circle skeleton (150px) */}
        <div className="w-[150px] h-[150px] rounded-full bg-neutral-850 shrink-0 flex items-center justify-center">
          <div className="w-[122px] h-[122px] rounded-full bg-[var(--bg-primary)]" />
        </div>

        {/* assessment summary skeleton - 3 lines */}
        <div className="space-y-3.5 w-full flex-1">
          <div className="h-7 bg-neutral-800 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-850 rounded w-full" />
            <div className="h-4 bg-neutral-850 rounded w-[95%]" />
            <div className="h-4 bg-neutral-850 rounded w-[70%]" />
          </div>
        </div>
      </div>

      <hr className="border-[var(--border-subtle)] my-2" />

      {/* SectionScoreBar progress indicators skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-neutral-800 rounded w-1/5" />
        <div className="space-y-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="h-3 bg-neutral-850 rounded w-28 shrink-0" />
              <div className="h-2 bg-neutral-900 rounded flex-1" />
              <div className="h-3 bg-neutral-850 rounded w-8 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 5 card feedback breakdown columns grid */}
      <div className="space-y-4">
        <div className="h-4 bg-neutral-800 rounded w-1/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4 min-h-[140px]"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-neutral-800 rounded w-1/2" />
                <div className="h-4 bg-neutral-850 rounded w-8" />
              </div>
              <div className="h-[2px] bg-neutral-900 rounded w-full mt-1" />
              <div className="h-3 bg-neutral-850 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Keyword checker pill skeleton pills lists */}
      <div className="space-y-4">
        <div className="h-4 bg-neutral-800 rounded w-1/6" />
        <div className="border border-[var(--border-subtle)] rounded-xl p-6 bg-[var(--bg-card)] space-y-4">
          <div className="h-3 bg-neutral-850 rounded w-24" />
          <div className="flex flex-wrap gap-2 pt-1">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="h-7 w-20 bg-neutral-850 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Top issues checklist card blocks */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-4">
        <div className="h-5 bg-neutral-800 rounded w-1/4" />
        <div className="space-y-3.5 pt-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex gap-3.5 items-center">
              <div className="w-5.5 h-5.5 bg-neutral-850 rounded flex-shrink-0" />
              <div className="h-4 bg-neutral-850 rounded w-[80%]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
