# AI Resume Reviewer

> Cinematic, AI-powered resume feedback — built for serious job seekers.

A dark, premium web app that analyzes your resume and gives instant, structured AI feedback. Inspired by high-end dev portfolios — matte black themes, geometric typography, and precise GSAP animations.

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat&logo=greensock&logoColor=white)
![Lenis](https://img.shields.io/badge/Lenis_Scroll-000000?style=flat)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)

---

## Features

- **Cinematic Entrance Sequence**: Multilingual greetings rotate smoothly before loading a dedicated "AI Resume Reviewer" title intro screen.
- **Transitional Parallax Reveal**: Title slides up and fades out in sync with the curtain reveal for a premium layout entrance.
- **Dynamic Upload Zone**: Dash-border zone supporting drag & drop and browse options with state validation (PDF/DOCX, 5MB limits) and GSAP micro-animations.
- **Job Description (JD) Tailoring Mode**: Toggle to paste a target job description. The AI tailors its entire analysis, overall quality evaluation, and keyword gaps directly to the JD.
- **JD Match Hero Card**: Dynamic visual container displaying compatibility score (0-100%), match quality label badge, strategic alignment advice, and lists of matched/missing skills.
- **ATS Score Visualizer**: Animated circular SVG score ring counting from `0` to the actual score dynamically on render.
- **Score Breakdown Grid**: Premium cards in a 5-column layout displaying issues and fixes with absolute-positioned popup tooltips on hover.
- **Adaptive Keyword Checker**: Displays keywords expected vs. found, automatically flagging JD-derived skills with a specialized "JD" badge.
- **Dynamic Home Stats**: Homepage stats block updates dynamically to prioritize JD Match Score metrics when JD mode is toggled active.
- **Modular Refactoring**: Restructured in strict adherence to clean architecture principles (all files strictly modularized, under 110 lines).

---

## Local Setup

### 1. Clone the project and navigate to the folder
```bash
# Clone the repository (if not already done)
# Navigate to the workspace
cd ai-resume
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## Codebase Architecture

```
ai-resume/
├── app/
│   ├── globals.css              # Design tokens and global CSS
│   ├── layout.tsx               # Entry layout setting up fonts & Lenis
│   ├── page.tsx                 # Landing / Upload view controller (with JD toggle mode)
│   └── review/
│       └── page.tsx             # Review feedback page with JD matching cards
├── components/
│   ├── GreetingIntro.tsx        # Multilingual entry curtain anims
│   ├── SectionScoreBar.tsx      # Multi-segmented progress bar
│   ├── KeywordChecker.tsx       # Found vs missing keyword tag grids
│   ├── FeedbackSection.tsx      # Editorial rating cards with popup suggestions
│   ├── CircularScore.tsx        # Animated SVG ATS progress ring
│   ├── CustomCursor.tsx         # Responsive dual-spring lag cursor
│   └── JDMatchCard.tsx          # Job description matching components
├── lib/
│   ├── accent.ts                # Client side accent style management
│   ├── ThemeProvider.tsx        # Toggle theme provider interface
│   ├── aiClient.ts              # Groq SDK LLM completion service (Dual mode support)
│   ├── gsap.ts                  # Centralized GSAP singleton registrations
│   └── types.ts                 # Shared strict TypeScript contracts
└── types/
    └── index.ts                 # Global synchronized types definitions
```

---

## Design System

We use a curated design system based on native CSS variables (in [globals.css](file:///c:/Users/ishtikhar/Desktop/portfolio/AI-Resume/ai-resume/app/globals.css)):

```css
--bg-primary:   #0c0c0c;   /* Deep matte dark */
--bg-secondary: #111111;   /* Offset dark background */
--bg-card:      #141414;   /* Surface container background */
--accent:       #62b6cb;   /* Electric accent — signature highlight */
--danger:       #da3036;   /* Critical status warnings */
--success:      #4caf6e;   /* Validated check indicators */

--font-display: Syne;      /* Strong geometric headers */
--font-body:    Inter;     /* Clean reading body text */
--font-mono:    JetBrains Mono;
```

---

## License

MIT
