// ─── AI Review Result — shared types across review page + API ─────────────────

export interface KeywordMatch {
  word: string;
  /** true = resume mein mila, false = missing hai */
  found: boolean;
}

export interface ReviewSection {
  /** Section heading — "Work Experience", "Skills", etc. */
  title: string;
  /** Score 0-100 for this section */
  score: number;
  /** Detailed AI feedback paragraph */
  feedback: string;
  /** Optional bullet suggestions */
  suggestions?: string[];
}

export interface ReviewResult {
  /** ATS compatibility score 0-100 */
  atsScore: number;
  /** One-line brutal summary */
  summary: string;
  /** Detailed per-section breakdown */
  sections: ReviewSection[];
  /** Keywords expected vs found */
  keywords: KeywordMatch[];
  /** ISO timestamp */
  analyzedAt: string;
}

// ─── Mock data — placeholder jab tak AI API integrate na ho ──────────────────

export const MOCK_REVIEW: ReviewResult = {
  atsScore: 72,
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
    { word: 'TypeScript',  found: true  },
    { word: 'React',       found: true  },
    { word: 'Node.js',     found: true  },
    { word: 'REST API',    found: true  },
    { word: 'SQL',         found: false },
    { word: 'Docker',      found: false },
    { word: 'AWS',         found: false },
    { word: 'CI/CD',       found: true  },
    { word: 'GraphQL',     found: false },
    { word: 'Agile/Scrum', found: true  },
  ],
  analyzedAt: new Date().toISOString(),
};
