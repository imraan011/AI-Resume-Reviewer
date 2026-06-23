import { NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/aiClient';

export const dynamic = 'force-dynamic';

// POST handler for invoking Groq AI review
export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return NextResponse.json({ error: 'Missing resume text input.' }, { status: 400 });
    }

    // Call Groq API analysis service
    const result = await analyzeResume(resumeText);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[AI_REVIEW_ROUTE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to process resume review.' }, { status: 500 });
  }
}
