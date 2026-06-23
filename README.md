# AI Resume Reviewer

> Cinematic, AI-powered resume feedback — built for serious job seekers.

A dark, premium web app that analyzes your resume and gives instant, structured AI feedback. Inspired by high-end dev portfolios — nothing feels cheap.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Vanilla CSS + Design Tokens |
| Animations | GSAP + Lenis Smooth Scroll |
| Fonts | Syne (display) · Inter (body) · JetBrains Mono |
| AI | Coming soon |

---

## Getting Started

```bash
# go into the app folder
cd ai-resume

# install dependencies
npm install

# start dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Project Structure

```
AI-Resume/
└── ai-resume/              # Next.js app
    ├── app/
    │   ├── globals.css     # Design tokens + base styles
    │   ├── layout.tsx      # Root layout — fonts, SmoothLayout
    │   └── page.tsx        # Home page
    ├── components/
    │   ├── GreetingIntro.tsx   # Cinematic multilingual intro overlay
    │   └── SmoothLayout.tsx    # Lenis + GSAP smooth scroll wrapper
    └── lib/
        └── gsap.ts         # Centralized GSAP singleton + plugins
```

---

## Modules

### ✅ Module 0 — Cinematic UI Foundation
- Global design tokens (electric lime accent `#e8ff47`, near-black backgrounds)
- Syne + Inter font setup via `next/font`
- Custom scrollbar, text selection highlight
- Lenis smooth scroll wired to GSAP ticker
- Multilingual greeting intro (Hello → سلام → नमस्ते → Hola → Bonjour → こんにちは → 안녕하세요)
- Curtain reveal animation — plays once per session

### 🔜 Coming Soon
- Resume upload + parsing
- AI feedback engine
- Score breakdown UI
- Export / share results

---

## Design System

```css
--bg-primary:   #0a0a0a   /* near black */
--accent:       #e8ff47   /* electric lime — signature color */
--font-display: Syne      /* headings — geometric, strong */
--font-body:    Inter     /* body — clean, readable */
--font-mono:    JetBrains Mono
```

---

## License

MIT
