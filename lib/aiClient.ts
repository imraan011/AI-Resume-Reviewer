import Groq from 'groq-sdk';
import { CONFIG } from './config';
import { type ReviewResult } from '@/types';

let groqClient: Groq | null = null;

// Lazy client setup to fetch Groq instance
function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: CONFIG.GROQ_API_KEY });
  }
  return groqClient;
}

// ── SYSTEM PROMPT — NO JD (existing behavior) ─────────────────────────────
const SYSTEM_PROMPT_BASIC = `
You are an expert ATS (Applicant Tracking System) reviewer and senior recruiter.
Analyze the provided resume and return ONLY a JSON object. Be brutally honest.

JSON structure to return:
{
  "overallScore": number (0-100),
  "summary": "2-3 sentences: honest brutal assessment of this resume",
  "hasJD": false,
  "sections": [
    {
      "title": "ATS Compatibility",
      "score": number (0-10),
      "issues": ["specific issue with exact detail"],
      "suggestions": ["specific actionable fix"]
    },
    {
      "title": "Work Experience",
      "score": number (0-10),
      "issues": ["specific issue"],
      "suggestions": ["specific fix"]
    },
    {
      "title": "Skills Section",
      "score": number (0-10),
      "issues": ["specific issue"],
      "suggestions": ["specific fix"]
    },
    {
      "title": "Education",
      "score": number (0-10),
      "issues": ["specific issue"],
      "suggestions": ["specific fix"]
    },
    {
      "title": "Formatting & Readability",
      "score": number (0-10),
      "issues": ["specific issue"],
      "suggestions": ["specific fix"]
    }
  ],
  "keywords": [
    { "word": "React",      "found": boolean, "importance": "high",   "fromJD": false },
    { "word": "Node.js",    "found": boolean, "importance": "high",   "fromJD": false },
    { "word": "TypeScript", "found": boolean, "importance": "high",   "fromJD": false },
    { "word": "JavaScript", "found": boolean, "importance": "high",   "fromJD": false },
    { "word": "Git",        "found": boolean, "importance": "medium", "fromJD": false },
    { "word": "REST API",   "found": boolean, "importance": "high",   "fromJD": false },
    { "word": "MongoDB",    "found": boolean, "importance": "medium", "fromJD": false },
    { "word": "SQL",        "found": boolean, "importance": "medium", "fromJD": false },
    { "word": "Python",     "found": boolean, "importance": "medium", "fromJD": false },
    { "word": "AWS",        "found": boolean, "importance": "low",    "fromJD": false },
    { "word": "Docker",     "found": boolean, "importance": "low",    "fromJD": false },
    { "word": "Agile",      "found": boolean, "importance": "medium", "fromJD": false }
  ],
  "topIssues": [
    "most critical problem 1 — specific and actionable",
    "most critical problem 2 — specific and actionable",
    "most critical problem 3 — specific and actionable"
  ]
}

Rules:
Be specific, not generic. Name exact problems found.
Check for: action verbs, quantifiable achievements, ATS-unfriendly formatting.
Do NOT wrap in markdown. Return raw JSON only.
`;

// ── SYSTEM PROMPT — WITH JD (new JD-specific behavior) ────────────────────
const SYSTEM_PROMPT_WITH_JD = `
You are an expert ATS reviewer, senior technical recruiter, and resume coach.
You will receive a resume AND a job description.
Your job: analyze how well this resume matches THIS specific job.

Return ONLY a raw JSON object — no markdown, no explanation, just JSON.

JSON structure:
{
  "overallScore": number (0-100, based on general resume quality),
  "summary": "2-3 sentences: honest assessment focused on fit for this specific job",
  "hasJD": true,
  "sections": [
    {
      "title": "ATS Compatibility",
      "score": number (0-10),
      "issues": ["specific issue referencing the JD where relevant"],
      "suggestions": ["specific actionable fix tailored to this JD"]
    },
    {
      "title": "Work Experience",
      "score": number (0-10),
      "issues": ["does experience match JD requirements? be specific"],
      "suggestions": ["how to reframe experience for this role"]
    },
    {
      "title": "Skills Section",
      "score": number (0-10),
      "issues": ["which required skills from JD are missing or weak"],
      "suggestions": ["which skills to add/highlight for this specific role"]
    },
    {
      "title": "Education",
      "score": number (0-10),
      "issues": ["education fit for this role"],
      "suggestions": ["how to present education for this role"]
    },
    {
      "title": "Formatting & Readability",
      "score": number (0-10),
      "issues": ["formatting issues that hurt ATS parsing"],
      "suggestions": ["specific formatting fixes"]
    }
  ],
  "keywords": [
    // Extract 12-16 most important keywords/skills FROM THE JD itself.
    // For each, check if it appears in the resume.
    // importance = how prominently it appears in JD (high/medium/low).
    { "word": "keyword from JD", "found": boolean, "importance": "high"|"medium"|"low", "fromJD": true }
    // ... repeat for all extracted JD keywords
  ],
  "topIssues": [
    "most critical gap vs this specific job — be specific",
    "second most critical gap",
    "third most critical gap"
  ],
  "jdMatch": {
    "score": number (0-100),
    // score = how well resume matches THIS job description specifically
    // Calculate based on: keyword overlap, experience relevance, skill alignment
    "label": "Strong Match" | "Good Match" | "Partial Match" | "Weak Match",
    // Strong: 80+, Good: 60-79, Partial: 40-59, Weak: <40
    "matchedSkills": ["skill that appears in both resume and JD"],
    "missingSkills": ["skill required by JD but absent in resume"],
    "jdKeywords": ["all key terms extracted from the job description"],
    "recommendation": "1-2 sentences: most important thing to change in this resume to get this specific job. Be direct and actionable."
  }
}

Analysis rules:
Extract keywords FROM THE JD — not a generic list.
Focus feedback on THIS role's requirements.
matchedSkills and missingSkills must be accurate — cross-reference carefully.
jdMatch.score is separate from overallScore (fit vs quality).
Return raw JSON only. No markdown.
`;

// ── Main export function ────────────────────────────────────────────────────
export async function analyzeResume(
  resumeText: string,
  jobDescription?: string
): Promise<ReviewResult> {
  const hasJD = Boolean(jobDescription && jobDescription.trim().length > 50);
  const systemPrompt = hasJD ? SYSTEM_PROMPT_WITH_JD : SYSTEM_PROMPT_BASIC;

  const userMessage = hasJD
    ? `RESUME:\n${resumeText}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription}`
    : `Resume text to analyze:\n\n${resumeText}`;

  const response = await getGroqClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Groq returned no content.');

  try {
    return JSON.parse(content) as ReviewResult;
  } catch {
    throw new Error('AI response was not valid JSON.');
  }
}
