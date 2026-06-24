/**
 * types/index.ts
 *
 * AI Resume Reviewer project ke liye central types define ho rahe hain.
 */

// Extracted resume content aur metadata representation
export interface ResumeData {
  text: string;
  fileName: string;
  pageCount: number;
}

// Har ek review section ka breakdown and score
export interface FeedbackSection {
  title: string;
  score: number; // range: 0-10
  issues: string[];
  suggestions: string[];
}

// Resume me match expected keywords aur unki relevance details
export interface KeywordMatch {
  word: string;
  found: boolean;
  importance: 'high' | 'medium' | 'low';
  fromJD?: boolean; // true agar ye keyword Job Description se aaya ho
}

export interface JdMatch {
  score: number; // 0-100 — resume vs JD fit % (matchScore se score renamed)
  label: string; // "Strong Match" | "Good Match" | "Partial Match" | "Weak Match"
  missingSkills: string[]; // skills in JD but not in resume
  matchedSkills: string[]; // skills in both JD and resume
  jdKeywords: string[]; // all keywords extracted from JD
  recommendation: string; // 1-2 line tailored advice
}

// Complete AI review engine analysis response
export interface ReviewResult {
  overallScore: number;
  summary: string;
  sections: FeedbackSection[];
  keywords: KeywordMatch[];
  topIssues: string[];
  jdMatch?: JdMatch | null; // only present when JD was provided
  hasJD: boolean; // was JD provided?
}

// File upload flow aur transition states
export type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';
