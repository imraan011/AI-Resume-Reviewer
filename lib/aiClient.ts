import Groq from 'groq-sdk';
import { CONFIG } from './config';
import { type ReviewResult } from '@/types';

let groqClient: Groq | null = null;

// Groq client initialization call ko lazy load function logic me wrap kiya hai
function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: CONFIG.GROQ_API_KEY });
  }
  return groqClient;
}

// System prompt ko dynamic banane ke liye helper function define kiya hai
function getSystemPrompt(hasJd: boolean): string {
  return `
You are an expert ATS (Applicant Tracking System) reviewer.
Analyze the provided resume text and return a structured review feedback in JSON format.
Be extremely honest, brutal, and constructive.

You MUST return ONLY a JSON object conforming strictly to this JSON structure:
{
  "overallScore": number (0-100),
  "summary": "2-3 line honest overall assessment",
  "sections": [
    {
      "title": "ATS Compatibility",
      "score": number (0-10),
      "issues": ["issue 1", "issue 2"],
      "suggestions": ["fix 1", "fix 2"]
    },
    {
      "title": "Work Experience",
      "score": number (0-10),
      "issues": ["issue 1", "issue 2"],
      "suggestions": ["fix 1", "fix 2"]
    },
    {
      "title": "Skills Section",
      "score": number (0-10),
      "issues": ["issue 1", "issue 2"],
      "suggestions": ["fix 1", "fix 2"]
    },
    {
      "title": "Education",
      "score": number (0-10),
      "issues": ["issue 1", "issue 2"],
      "suggestions": ["fix 1", "fix 2"]
    },
    {
      "title": "Formatting & Readability",
      "score": number (0-10),
      "issues": ["issue 1", "issue 2"],
      "suggestions": ["fix 1", "fix 2"]
    }
  ],
  "keywords": [
    { "word": "React", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "Node.js", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "TypeScript", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "JavaScript", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "Git", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "REST API", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "MongoDB", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "SQL", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "Python", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "AWS", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "Docker", "found": boolean, "importance": "high" | "medium" | "low" },
    { "word": "Agile", "found": boolean, "importance": "high" | "medium" | "low" }
  ],
  "topIssues": ["most critical problem 1", "most critical problem 2", "most critical problem 3"],
  "jdMatch": ${
    hasJd
      ? `{
    "matchScore": number (0-100),
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"],
    "recommendation": "one line advice"
  }`
      : 'null'
  }
}

Rules for the AI:
- Be honest and specific, not generic.
- Check for action verbs in experience bullets.
- Check for quantifiable achievements (numbers, percentages).
- Check for ATS-unfriendly elements (tables, columns, graphics).
- Keywords to check: React, Node.js, TypeScript, JavaScript, Git, REST API, MongoDB, SQL, Python, AWS, Docker, Agile.
${
  hasJd
    ? '- Since a target Job Description is provided, evaluate the candidate\'s alignment with its core requirements. Calculate a realistic "matchScore" based on how well the resume meets the requirements of the job description. Populate "matchedSkills", "missingSkills", and "recommendation" based on the job description. Focus the "ATS Compatibility" and "Skills Section" feedbacks heavily on that specific Job Description.'
    : '- Since no Job Description is provided, "jdMatch" MUST be set to null.'
}
- Return ONLY JSON, nothing else. Do not wrap in markdown codeblocks like \`\`\`json.
`;
}

// resume text analyze karke structured feedback generate karne ka helper
export async function analyzeResume(resumeText: string, jobDescription?: string): Promise<ReviewResult> {
  const hasJd = !!(jobDescription && jobDescription.trim());
  let userContent = `Resume text to analyze:\n\n${resumeText}`;
  if (hasJd) {
    userContent += `\n\nTarget Job Description to match against:\n\n${jobDescription}`;
  }

  const systemPrompt = getSystemPrompt(hasJd);

  const response = await getGroqClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Groq did not return any review response content.');
  }

  try {
    const parsed = JSON.parse(content) as ReviewResult;
    return parsed;
  } catch (err) {
    throw new Error('Failed to parse AI response. Response was not valid JSON.');
  }
}
