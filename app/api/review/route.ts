import { NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/aiClient';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// simple in-memory database to store client request timestamps
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const LIMIT = 5; // requests limit
const WINDOW_MS = 60 * 1000; // 1 minute window

// client IP check logic for rate limiting
function isRateLimited(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { timestamps: [] };
  
  // 1 minute se purane timestamps ko clean kar rahe hain
  record.timestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);
  
  if (record.timestamps.length >= LIMIT) {
    const oldest = record.timestamps[0];
    const msLeft = WINDOW_MS - (now - oldest);
    const retryAfterSeconds = Math.max(1, Math.ceil(msLeft / 1000));
    return { limited: true, retryAfterSeconds };
  }
  
  record.timestamps.push(now);
  rateLimitStore.set(ip, record);
  return { limited: false, retryAfterSeconds: 0 };
}

// POST handler for resume analysis API
export async function POST(request: Request) {
  try {
    // client IP headers fetch kar rahe hain
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
    const limitCheck = isRateLimited(ip);
    
    // client rate limits check karein
    if (limitCheck.limited) {
      const headers = new Headers();
      headers.set('Retry-After', String(limitCheck.retryAfterSeconds));
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429, headers }
      );
    }

    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return NextResponse.json({ error: 'Missing resume text input.', code: 'BAD_REQUEST' }, { status: 400 });
    }

    // Optional job description matching ke saath Groq API service call karein
    const result = await analyzeResume(resumeText, jobDescription);

    return NextResponse.json(result);
  } catch (error) {
    // Error ko timestamp ke saath log karein
    console.error(`[${new Date().toISOString()}] [AI_REVIEW_ROUTE_ERROR]`, error);
    
    // Check karein agar AI provider se rate limit error (429) aaya hai
    if (error && typeof error === 'object' && ('status' in error || 'statusCode' in error)) {
      const status = (error as any).status || (error as any).statusCode;
      if (status === 429) {
        const headers = new Headers();
        headers.set('Retry-After', '60');
        return NextResponse.json(
          { error: 'AI provider rate limit reached. Please try again later.', code: 'AI_PROVIDER_RATE_LIMIT' },
          { status: 429, headers }
        );
      }
    }

    // Client ko raw stack trace share nahi karenge
    return NextResponse.json({ error: 'Failed to process resume review.', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
