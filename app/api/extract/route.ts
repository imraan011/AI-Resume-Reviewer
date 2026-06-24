import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB limit

// POST handler se PDF file upload aur text extract process define ho raha hai
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      // client ne file provide nahi ki
      return NextResponse.json({ error: 'No file was uploaded.', code: 'BAD_REQUEST' }, { status: 400 });
    }

    // PDF extension aur type check validation logic
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a PDF file only.', code: 'INVALID_FILE_TYPE' }, { status: 400 });
    }

    // PDF size check (max 5MB allow hai)
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File is too large. Max size is 5MB.', code: 'FILE_TOO_LARGE' }, { status: 413 });
    }

    // arrayBuffer ko raw Buffer stream me parse ke liye adapt kar rahe hain
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // stable pdf-parse function invocation
    const data = await pdf(buffer);
    
    return NextResponse.json({
      text: data.text,
      pageCount: data.numpages,
      wordCount: data.text.split(/\s+/).filter(Boolean).length,
    });
  } catch (error) {
    // Error ko timestamp ke saath log karein
    console.error(`[${new Date().toISOString()}] [PDF_EXTRACTION_ERROR]`, error);
    
    // Client ko internal library error details aur stack trace expose nahi karenge
    return NextResponse.json({ error: 'Failed to parse PDF document.', code: 'PDF_PARSE_ERROR' }, { status: 500 });
  }
}
