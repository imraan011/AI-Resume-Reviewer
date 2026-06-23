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
- **ATS Score Visualizer**: Animated circular SVG score ring counting from `0` to the actual score dynamically on render.
- **Score Breakdown Grid**: Section breakdown cards that collapse/expand for issues and suggestions with subtle hover-lift mechanics.
- **Keyword Checklist**: Panel showing found vs missing keywords in the resume.
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
│   ├── page.tsx                 # Landing / Upload view controller (80 lines)
│   └── review/
│       └── page.tsx             # Review feedback visual timeline coordinator (78 lines)
├── components/
│   ├── GreetingIntro.tsx        # Multilingual entry curtain anims (96 lines)
│   ├── HeroElements.tsx         # Radial background and stat pills
│   ├── HeroHeadings.tsx         # Title text sub-components
│   ├── ReviewBackButton.tsx     # Navigation back helper
│   ├── ReviewCards.tsx          # Collapsible category section sheets
│   ├── ReviewKeywordsPanel.tsx  # Checklist checks for industry skills
│   ├── ReviewScoreHero.tsx      # SVG ATS score ring controller
│   ├── ScoreRing.tsx            # SVG path geometry properties
│   ├── SmoothLayout.tsx         # Lenis smooth-scrolling connector
│   ├── UploadZone.tsx           # Drag/drop event and loading state core
│   ├── UploadZoneButton.tsx     # Animated CTA upload submission buttons
│   ├── UploadZoneIcons.tsx      # SVG file/folder/loading dots assets
│   └── UploadZoneViews.tsx      # Sub-views for idle, upload, selected states
└── lib/
    ├── animations.ts            # Entrypoint re-exports for animation helpers
    ├── animations/
    │   ├── effects.ts           # Interactive card lifts & counter counters
    │   └── reveals.ts           # Viewport ScrollTrigger dynamic transitions
    ├── greetings.ts             # Static dictionary datasets for intro cycle
    ├── gsap.ts                  # Centralized GSAP singleton registrations
    └── types.ts                 # Shared strict TypeScript contracts
```

---

## Design System

We use a curated design system based on native CSS variables (in [globals.css](file:///c:/Users/ishtikhar/Desktop/portfolio/AI-Resume/ai-resume/app/globals.css)):

```css
--bg-primary:   #0a0a0a;   /* Deep matte dark */
--bg-secondary: #111111;   /* Offset dark background */
--bg-card:      #141414;   /* Surface container background */
--accent:       #e8ff47;   /* Electric lime — signature highlight */
--danger:       #ff4444;   /* Critical status warnings */
--success:      #44ff88;   /* Validated check indicators */

--font-display: Syne;      /* Strong geometric headers */
--font-body:    Inter;     /* Clean reading body text */
--font-mono:    JetBrains Mono;
```

---

## License

MIT
