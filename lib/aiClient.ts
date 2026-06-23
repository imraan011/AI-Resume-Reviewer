import Groq from 'groq-sdk';
import { CONFIG } from './config';
import { type ReviewResult } from './types';

let groqClient: Groq | null = null;

// Groq client initialization call ko runtime/lazy function logic me wrap kiya hai
function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: CONFIG.GROQ_API_KEY });
  }
  return groqClient;
}

const SYSTEM_PROMPT = `
You are an expert ATS (Applicant Tracking System) reviewer.
Analyze the provided resume text and return a review in JSON format.
Be extremely honest, brutal, and constructive.

You MUST return ONLY a JSON object conforming strictly to this TypeScript structure:
{
  "atsScore": number (0-100),
  "summary": "brutal, honest 2-line assessment",
  "sections": [
    {
      "title": "Work Experience" | "Skills" | "Education" | "Formatting",
      "score": number (0-100),
      "feedback": "critical explanation of issues found",
      "suggestions": ["specific actionable change 1", "specific actionable change 2"]
    }
  ],
  "keywords": [
    { "word": "string", "found": boolean }
  ],
  "analyzedAt": "current ISO timestamp"
}

Keywords to scan: TypeScript, React, Node.js, SQL, Docker, AWS, REST API, GraphQL, CI/CD, Agile.
Ensure JSON format validation. Do not include markdown codeblocks (no \`\`\`json tags).
`;

// Groq API completion trigger helper
export async function analyzeResume(resumeText: string): Promise<ReviewResult> {
  const response = await getGroqClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Resume text to analyze:\n\n${resumeText}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Groq did not return any review response content.');
  }

  const parsed = JSON.parse(content) as ReviewResult;
  parsed.analyzedAt = new Date().toISOString(); // force clean client-side timestamp match
  return parsed;
}
