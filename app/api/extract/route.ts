import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB limit

// POST handler se PDF file upload aur text extract process define ho raha hai
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      // client ne file provide nahi ki
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }

    // PDF size check (max 5MB allow hai)
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File is too large. Max size is 5MB.' }, { status: 413 });
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
    console.error('[PDF_EXTRACTION_ERROR]', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `PDF Parse Error: ${msg}` }, { status: 500 });
  }
}
