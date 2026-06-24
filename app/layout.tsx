import type { Metadata } from 'next';
import { Syne, Inter } from 'next/font/google';
import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import ThemeProvider from '@/lib/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import './globals.css';

// headings ke liye — bold geometric feel
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

// body text ke liye — clean aur readable
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Resume Reviewer',
  description:
    'Get instant, AI-powered feedback on your resume. Cinematic dark UI for serious job seekers.',
};

// layout.tsx server component hi rahega — SmoothScroll client hai
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // font CSS vars + dark bg — html root pe apply ho rahe hain
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${inter.variable}`}
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
            document.documentElement.style.colorScheme = t;
          })();
        `}} />
      </head>
      <body>
        <ThemeProvider>
          {/* SmoothScroll Lenis + GSAP ticker ko initialize karta hai */}
          <SmoothScroll>
            <CustomCursor />
            {children}
          </SmoothScroll>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
