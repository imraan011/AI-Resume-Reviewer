// AI review results ke shared TypeScript definitions

export interface KeywordMatch {
  word: string;
  found: boolean; // true agar resume me keyword match ho gaya ho
  importance: 'high' | 'medium' | 'low';
  fromJD?: boolean; // true agar ye keyword Job Description se aaya ho
}

export interface Section {
  title: string; // section ka title (jaise 'Skills', 'Experience')
  score: number; // 0-100 score range
  feedback: string; // AI ka detailed feedback description
  suggestions?: string[]; // improvements suggest karne ke liye bullet points
}

export interface ReviewResult {
  overallScore: number; // overall ATS score (0-100)
  summary: string; // short assessment summary
  sections: Section[];
  keywords: KeywordMatch[];
  topIssues: string[]; // key critical issues checklist

  // agar JD provide kiya gaya ho tabhi matches highlight honge
  jdMatch?: {
    score: number; // resume aur JD compatibility score (0-100)
    label: string; // "Strong Match" | "Good Match" | "Partial Match" | "Weak Match"
    missingSkills: string[]; // JD ki missed skills list
    matchedSkills: string[]; // match hone waali skills
    jdKeywords: string[]; // JD se extract kiye gaye keywords
    recommendation: string; // AI recommendation checklist
  };

  hasJD: boolean; // check karne ke liye ki JD available hai ya nahi
}

// ─── Mock data — placeholder jab tak AI API integrate na ho ──────────────────

export const MOCK_REVIEW: ReviewResult = {
  overallScore: 72,
  summary:
    'Strong technical profile, but the resume lacks quantified achievements and uses passive language throughout. ATS systems will struggle with the non-standard section headers.',
  sections: [
    {
      title: 'Work Experience',
      score: 68,
      feedback:
        'Your experience section lists responsibilities instead of accomplishments. Recruiters scan for impact — use numbers. "Led a team" becomes "Led a 5-person team that shipped X feature, reducing load time by 40%."',
      suggestions: [
        'Quantify every bullet with a metric or outcome',
        'Start each bullet with a strong action verb',
        'Remove phrases like "responsible for" and "helped with"',
      ],
    },
    {
      title: 'Skills',
      score: 81,
      feedback:
        'Good keyword density for a full-stack role. TypeScript, React, and Node.js are all present. Consider adding cloud platforms (AWS/GCP) if applicable — they appear in 78% of target JDs.',
      suggestions: [
        'Add cloud or DevOps skills if you have them',
        'Group skills by category for ATS parse accuracy',
      ],
    },
    {
      title: 'Education',
      score: 90,
      feedback:
        'Clean, correctly formatted. Degree and institution are clearly stated. Graduation year is present — good.',
    },
    {
      title: 'Formatting',
      score: 55,
      feedback:
        'Non-standard section headers ("My Journey", "What I Do") confuse ATS parsers. Rename to conventional labels: Experience, Skills, Education. Also avoid tables and multi-column layouts — most ATS tools parse them incorrectly.',
      suggestions: [
        'Rename sections to ATS-standard titles',
        'Switch to single-column layout',
        'Use a standard system font for body text',
      ],
    },
  ],
  keywords: [
    { word: 'TypeScript',  found: true,  importance: 'high' },
    { word: 'React',       found: true,  importance: 'high' },
    { word: 'Node.js',     found: true,  importance: 'high' },
    { word: 'REST API',    found: true,  importance: 'medium' },
    { word: 'SQL',         found: false, importance: 'medium' },
    { word: 'Docker',      found: false, importance: 'low' },
    { word: 'AWS',         found: false, importance: 'high' },
    { word: 'CI/CD',       found: true,  importance: 'medium' },
    { word: 'GraphQL',     found: false, importance: 'low' },
    { word: 'Agile/Scrum', found: true,  importance: 'low' },
  ],
  topIssues: [
    'Quantifiable achievements are missing in work experience bullets.',
    'Non-standard section headers used.',
    'Passive verbs used instead of strong action verbs.',
  ],
  hasJD: false,
};
