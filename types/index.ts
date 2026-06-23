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
}

export interface JdMatch {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

// Complete AI review engine analysis response
export interface ReviewResult {
  overallScore: number;
  sections: FeedbackSection[];
  keywords: KeywordMatch[];
  summary: string;
  topIssues: string[];
  jdMatch: JdMatch | null;
}

// File upload flow aur transition states
export type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';
